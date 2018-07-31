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

// Services
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  CommonService
} from '../../shared/services/common/common.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../shared/services/auth/auth.service';
import {
  SchedulesPrintService
} from '../schedules-print.service';
import {
  NeckLabelService
} from './neck-label.service';

// Interfaces
import {
  ResponseMessage,
  BasicVendorInfo
} from '../../shared/models';
import { Subscription } from 'rxjs/Subscription';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'neck-label',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's   compiler
  templateUrl: 'neck-label.template.html',
  styleUrls: [
    'neck-label.style.scss'
  ]
})
export class NeckLabelComponent implements OnInit, OnDestroy {
  public tabs = [];
  public routerSub: Subscription;
  public currentPageUrl = '';
  public count = 0;

  constructor(private _breadcrumbService: BreadcrumbService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _activatedRoute: ActivatedRoute,
              private _authService: AuthService,
              private _schedulesPrintService: SchedulesPrintService,
              private _neckLabelSv: NeckLabelService,
              private _router: Router) {
    this._authService.checkPermission('Schedules.NeckLabel');
    this.routerSub = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.currentPageUrl = val.urlAfterRedirects;
        this.getCommonData();
      }
    });
  }

  public ngOnInit(): void {
    this.getCommonData();
    this.configFriendlyRoutes();
    // get filter service from other tab
    if (this._schedulesPrintService.searchObj) {
      this._neckLabelSv.searchObj = this._schedulesPrintService.searchObj;
      if (this._schedulesPrintService.searchFrom &&
        this._schedulesPrintService.searchFrom.includes('pending-sample')) {
        this._schedulesPrintService.searchFrom =
          this._schedulesPrintService.searchFrom.split(',')[1];
      }
      switch (this._schedulesPrintService.searchFrom) {
        case 'print-outsource':
          this._neckLabelSv.convertFrPrintOutsource();
          break;
        case 'print-tsc':
          this._neckLabelSv.convertFrPrintTsc();
          break;
        case 'finishing':
          this._neckLabelSv.convertFrFinishing();
          break;
        case 'samples':
          this._neckLabelSv.convertFrSamples();
          break;
        default:
          break;
      }
    }
  }

  /**
   * Config text on breadcrumb
   */
  public configFriendlyRoutes(): void {
    // this._breadcrumbService
    //   .hideRouteRegex('^/schedules-print/neck-label/[0-9A-Za-z]*$');
  }

  public getCommonData(): void {
    this._commonService.getMachineNVendor('NeckLabel')
      .subscribe((resp: ResponseMessage<BasicVendorInfo[]>) => {
        if (resp.status) {
          if (resp.data && resp.data.length) {
            let vendorData = [];
            resp.data.forEach((item, index) => {
              if (item.name === 'TSC') {
                vendorData.push({
                  ...item,
                  isActive: index === 0,
                  redirectUrl: item.id
                });
              }
            });
            this.tabs = vendorData;
            this.tabs.forEach((item) => {
              this._breadcrumbService.addFriendlyNameForRouteRegex(
                '^/schedules-print/neck-label/' + item.redirectUrl + '$', item.name);
            });
            this._breadcrumbService.addFriendlyNameForRouteRegex(
              '^/schedules-print/neck-label/all-vendors$', 'ALL VENDORS');
            if (this.currentPageUrl.indexOf('/schedules-print/neck-label/') === -1
              && this.tabs.length) {
              this._router.navigate([this.tabs[0].redirectUrl],
                {relativeTo: this._activatedRoute, replaceUrl: true});
            }
            setTimeout(() => {
              this.configNavTabs(this._router.url);
            }, 300);
          }
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public configNavTabs(url: string): void {
    if (url) {
      this.tabs.forEach((tab) => {
        tab.isActive = url.endsWith('/' + tab.redirectUrl);
      });
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

  public ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this._schedulesPrintService.searchObj = this._neckLabelSv.searchObj;
    this._schedulesPrintService.searchFrom = this._neckLabelSv.searchFrom;
    this._neckLabelSv.searchObj = '';
    this._neckLabelSv.searchFrom = '';
  }
}
