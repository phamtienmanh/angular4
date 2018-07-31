import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
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
  AuthService
} from '../../shared/services/auth/auth.service';
import {
  UserContext
} from '../../shared/services/user-context/user-context';

import {
  TscPrintService
} from './tsc-print.service';
import {
  SchedulesPrintService
} from '../schedules-print.service';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'tsc-print',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's   compiler
  templateUrl: 'tsc-print.template.html',
  styleUrls: [
    'tsc-print.style.scss'
  ]
})
export class TscPrintComponent implements OnInit, OnDestroy {

  public tabs = [];
  public subRouter: Subscription;

  constructor(private _breadcrumbService: BreadcrumbService,
              private _router: Router,
              private _commonService: CommonService,
              private _authService: AuthService,
              private _tscPrintSv: TscPrintService,
              private _schedPrintSv: SchedulesPrintService,
              private _userContext: UserContext,
              private _toastrService: ToastrService) {
    this._authService.checkPermission('Schedules.Print');
    // Config active nav tab when router changes
    this.subRouter = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.tabs = [
          {
            name: 'TSC',
            isActive: false,
            redirectUrl: 'tsc'
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
    // get filter service
    if (this._schedPrintSv.searchObj) {
      this._tscPrintSv.searchObj = this._schedPrintSv.searchObj;
      if (this._schedPrintSv.searchFrom &&
        this._schedPrintSv.searchFrom.includes('pending-sample')) {
        this._schedPrintSv.searchFrom =
          this._schedPrintSv.searchFrom.split(',')[1];
      }
      switch (this._schedPrintSv.searchFrom) {
        case 'finishing':
          this._tscPrintSv.convertFrFinishing();
          break;
        case 'neck-label':
          this._tscPrintSv.convertFrNeckLabel();
          break;
        case 'samples':
          this._tscPrintSv.convertFrSamples();
          break;
        default:
          break;
      }
    }
  }

  /**
   * Config text on breadcrumb
   */
  public configNavTabs(url: string): void {
    this.tabs.forEach((item) => {
      this._breadcrumbService.addFriendlyNameForRouteRegex(
        '^/schedules-print/tsc-print/' + item.redirectUrl + '$', item.name);

      item.isActive = false;
      if (this._router.url.endsWith('/' + item.redirectUrl)) {
        item.isActive = true;
      }
    });
    let haveTabActive = this.tabs.some((tab) => {
      return tab.isActive;
    });
    if (!haveTabActive) {
      this.tabs[0].isActive = true;
      this._router.navigate(['schedules-print', 'tsc-print', this.tabs[0].redirectUrl]);
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
    this.checkIsTsc();
    this._router.navigate(['schedules-print', 'tsc-print', this.tabs[index].redirectUrl]);
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(url: string): void {
    this._commonService.getMachineNVendor('Print')
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          if (!resp.data || !resp.data.length) {
            return;
          }
          resp.data.forEach((vendor) => {
            if (!vendor.isMachine) {
              this.tabs.push({
                ...vendor,
                isActive: false,
                redirectUrl: vendor.id
              });
            }
          });
          this.checkCanViewOutsouce();
          this.configNavTabs(url);
          this.checkIsTsc();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public checkIsTsc(): void {
    const activatedTab = this.tabs.find((i) => i.isActive);
    if (activatedTab) {
      this._tscPrintSv.isTsc = activatedTab.name === 'TSC';
    }
  }

  public checkCanViewOutsouce() {
    let onlyTscRole = [
      'Vulcan - Supervisor',
      'Vulcan - Operator',
      'Screen Print - Operator',
      'Screen Print - Manager',
      'Screen Print - Supervisor',
      'Screen Print - Ink Tech',
      'Screen Print - Screen Tech',
      'Screen Print - Ink & Screen Manager'
    ];
    if (this._userContext.currentUser.listRole.some((i) =>
      onlyTscRole.indexOf(i.roleName) > -1)) {
      this.tabs = this.tabs.slice(0, 1);
    }
  }

  public ngOnDestroy(): void {
    this.subRouter.unsubscribe();
    this._schedPrintSv.searchObj = this._tscPrintSv.searchObj;
    this._schedPrintSv.searchFrom = this._tscPrintSv.searchFrom;
    this._tscPrintSv.searchObj = '';
    this._tscPrintSv.searchFrom = '';
  }
}
