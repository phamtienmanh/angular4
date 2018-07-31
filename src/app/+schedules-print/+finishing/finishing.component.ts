import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  ActivatedRoute,
  NavigationEnd,
  Router
} from '@angular/router';

import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  CommonService
} from '../../shared/services/common/common.service';
import {
  ResponseMessage
} from '../../shared/models/respone.model';
import {
  ToastrService
} from 'ngx-toastr';
import {
  Subscription
} from 'rxjs/Subscription';
import {
  SchedulesPrintService
} from '../schedules-print.service';
import {
  AuthService
} from '../../shared/services/auth/auth.service';
import {
  FinishingService
} from './finishing.service';
import {
  UserContext
} from '../../shared/services/user-context/user-context';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'finishing',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's   compiler
  templateUrl: 'finishing.template.html',
  styleUrls: [
    'finishing.style.scss'
  ]
})
export class FinishingComponent implements OnInit, OnDestroy {

  public tabs = [];
  public subRouter: Subscription = null;

  constructor(private _breadcrumbService: BreadcrumbService,
              private _router: Router,
              private _commonService: CommonService,
              private _schedulesPrintService: SchedulesPrintService,
              private _activatedRoute: ActivatedRoute,
              private _authService: AuthService,
              private _finishingSv: FinishingService,
              private _toastrService: ToastrService,
              private _userContext: UserContext) {
    this._authService.checkPermission('Schedules.Finishing');
    // Config active nav tab when router changes
    this.subRouter = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.tabs = [
          {
            name: 'TSC',
            isActive: true,
            redirectUrl: ''
          },
          {
            name: 'ALL VENDORS',
            isActive: false,
            redirectUrl: 'all-vendors'
          }
        ];
        this.getCommonData(val.urlAfterRedirects);
      }
    });
  }

  public ngOnInit(): void {
    if (this._schedulesPrintService.searchObj) {
      this._finishingSv.searchObj = this._schedulesPrintService.searchObj;
      if (this._schedulesPrintService.searchFrom &&
        this._schedulesPrintService.searchFrom.includes('pending-sample')) {
        this._schedulesPrintService.searchFrom =
          this._schedulesPrintService.searchFrom.split(',')[1];
      }
      switch (this._schedulesPrintService.searchFrom) {
        case 'print-outsource':
          this._finishingSv.convertFrPrintOutsource();
          break;
        case 'print-tsc':
          this._finishingSv.convertFrPrintTsc();
          break;
        case 'neck-label':
          this._finishingSv.convertFrNeckLabel();
          break;
        case 'samples':
          this._finishingSv.convertFrSamples();
          break;
        default:
          break;
      }
    }
  }

  public configNavTabs(url: string): void {
    this.tabs.forEach((item) => {
      this._breadcrumbService.addFriendlyNameForRouteRegex(
        '^/schedules-print/finishing/' + item.redirectUrl + '$', item.name);
    });
    if (url) {
      let newUrl = url + '/';
      // Reset status nav tab
      this.tabs.forEach((tab) => tab.isActive = false);
      // Active current nav tab is selected
      this.tabs.forEach( (tab) => {
        tab.isActive = newUrl.indexOf('/' + tab.redirectUrl + '/') !== -1;
      });
    }
    let haveTabActive = this.tabs.some( (tab) => {
      return tab.isActive;
    });
    if (!haveTabActive) {
      this.tabs[0].isActive = true;
      this._router.navigate([this.tabs[0].redirectUrl],
        {relativeTo: this._activatedRoute, replaceUrl: true});
    }
  }
  /**
   * Event switch tab
   * @param index
   */
  public switchTab(index: number): void {
    let prevTabIndex = this.tabs.findIndex((t) => t.isActive);
    this.tabs[prevTabIndex].isActive = false;
    this.tabs[index].isActive = true;
    this._router.navigate([this.tabs[index].redirectUrl],
      {relativeTo: this._activatedRoute, replaceUrl: true});
  }

  /**
   * Get tabs data & config active tabs, breadcrumb
   */
  public getCommonData(url: string): void {
    this._commonService.getMachineNVendor('Finishing')
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          if (!resp.data || !resp.data.length) {
            return;
          }
          resp.data.forEach((vendor) => {
            if (!vendor.isMachine) {
              if (vendor.name === 'TSC') {
                this.tabs[0].redirectUrl = vendor.id;
                return;
              }
              this.tabs.push({
                ...vendor,
                isActive: false,
                redirectUrl: vendor.id
              });
            }
          });
          this.checkCanViewOutsouce();
          this.configNavTabs(url);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public checkCanViewOutsouce() {
    let onlyTscRole = [
      'Finishing - Supervisor'
    ];
    if (this._userContext.currentUser.listRole.some((i) =>
      onlyTscRole.indexOf(i.roleName) > -1)) {
      this.tabs = this.tabs.slice(0, 1);
    }
  }

  public ngOnDestroy(): void {
    this.subRouter.unsubscribe();
    this._schedulesPrintService.searchObj = this._finishingSv.searchObj;
    this._schedulesPrintService.searchFrom = this._finishingSv.searchFrom;
    this._finishingSv.searchObj = '';
    this._finishingSv.searchFrom = '';
  }
}
