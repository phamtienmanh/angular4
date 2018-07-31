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
import {
  SamplesMainService
} from './+samples-main/samples-main.service';
import {
  SamplesService
} from './samples.service';
import {
  UserContext
} from '../../shared/services/user-context/user-context';
import { AuthService } from '../../shared/services/auth/auth.service';
import {
  SchedulesPrintService
} from '../schedules-print.service';

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
  selector: 'samples',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's   compiler
  templateUrl: 'samples.template.html',
  styleUrls: [
    'samples.style.scss'
  ]
})
export class SamplesComponent implements OnInit, OnDestroy {
  public tabs = [];
  public routerSub: Subscription;
  public isSamplePrinter = false;

  constructor(private _breadcrumbService: BreadcrumbService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _activatedRoute: ActivatedRoute,
              private _sampleMainSv: SamplesMainService,
              private _samplesSv: SamplesService,
              private _authService: AuthService,
              private _userContext: UserContext,
              private _router: Router,
              private _schedulesPrintService: SchedulesPrintService) {
    this._authService.checkPermission('Schedules.Samples');
    this.routerSub = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (val.urlAfterRedirects === '/schedules-print/samples' && this.tabs.length) {
          setTimeout(() => {
            this._router.navigate([this.tabs[0].redirectUrl], {relativeTo: this._activatedRoute});
            this.configNavTabs(this._router.url);
          });
        }
        if (val.urlAfterRedirects) {
          this.configNavTabs(val.urlAfterRedirects);
        }
      }
    });
  }

  public ngOnInit(): void {
    this.checkRole();
    this.getCommonData();
    this.configFriendlyRoutes();
    // setTimeout(() => {
    //   let breadcrumbItem = document.getElementsByClassName('breadcrumb-item');
    //   if (breadcrumbItem.length) {
    //     breadcrumbItem[1].addEventListener('click', () => {
    //       this._router.navigate([this.tabs[0].redirectUrl], {relativeTo: this._activatedRoute});
    //     });
    //   }
    //   let tabItem = document.getElementsByClassName('nav-item');
    //   if (tabItem.length) {
    //     tabItem[2].addEventListener('click', () => {
    //       this._router.navigate([this.tabs[0].redirectUrl], {relativeTo: this._activatedRoute});
    //     });
    //   }
    // }, 1000);
    // get filter service from other tab
    if (this._schedulesPrintService.searchObj) {
      this._sampleMainSv.searchObj = this._schedulesPrintService.searchObj;
      if (this._schedulesPrintService.searchFrom &&
        this._schedulesPrintService.searchFrom.includes('pending-sample')) {
        this._schedulesPrintService.searchFrom =
          this._schedulesPrintService.searchFrom.split(',')[1];
      }
      switch (this._schedulesPrintService.searchFrom) {
        case 'print-outsource':
          this._sampleMainSv.convertFrTscOS();
          break;
        case 'print-tsc':
          this._sampleMainSv.convertFrTsc();
          break;
        case 'neck-label':
          this._sampleMainSv.convertFrNeckLabel();
          break;
        case 'finishing':
          this._sampleMainSv.convertFrFinishing();
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
    //   .hideRouteRegex('^/schedules-print/samples/[0-9A-Za-z]*$');
  }

  public getCommonData(): void {
    this._commonService.getSamplesPrinter()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          if (resp.data.length) {
            if (this.isSamplePrinter) {
              resp.data = resp.data.filter(
                (p) => p.samplePrinterType === 1 ||
                  p.samplePrinterName === this._userContext.currentUser.fullName
              );
            }
            let samplePrinter = [];
            resp.data.forEach((item, index) => {
              if (index === 0 && (!this.isSamplePrinter || this.isScreenPrintRole())) {
                samplePrinter.push({
                  fakeId: 0,
                  id: -1,
                  name: 'ALL',
                  isActive: true,
                  redirectUrl: 'all'
                });
              }
              if (!this.isScreenPrintRole()) {
                samplePrinter.push({
                  ...item,
                  name: item.samplePrinterName,
                  isActive: false,
                  redirectUrl: item.fakeId
                });
              }
              if (this.isScreenPrintRole() && item.samplePrinterName === 'Vulcan') {
                // add Screen Print to the right of the ‘Vulcan’ tab
                samplePrinter.push({
                  fakeId: 0,
                  id: -1,
                  name: 'Screen Print',
                  isActive: false,
                  redirectUrl: 'screen-print'
                });
              }
            });
            this.tabs = samplePrinter;
            if (this.isVulcanRole()) {
              this.tabs = samplePrinter.filter((i) => i.name.toLowerCase().includes('vulcan'));
            }
            this.tabs.forEach((item) => {
              this._breadcrumbService.addFriendlyNameForRouteRegex(
                '^/schedules-print/samples/' + item.redirectUrl + '$', item.name);
            });
            this._breadcrumbService.addFriendlyNameForRouteRegex(
              '^/schedules-print/samples/all-vendors$', 'ALL VENDORS');
            // if (this._router.url === '/schedules-print/samples') {
            //   this._router.navigate([this.tabs[0].redirectUrl],
            //     {
            //       relativeTo: this._activatedRoute,
            //       replaceUrl: true
            //     }
            //   );
            // }
            setTimeout(() => {
              this.configNavTabs(this._router.url);
            }, 500);
          }
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public isScreenPrintRole(): boolean {
    return this._authService.checkAssignedRolesOr([
      'Screen Print - Ink Tech',
      'Screen Print - Screen Tech',
      'Screen Print - Ink & Screen Manager'
    ]) && this._userContext.currentUser.listRole.length === 1;
  }

  public isVulcanRole() {
    if (this._userContext.currentUser.listRole.some((i) =>
      i.roleName === 'Vulcan - Supervisor' || i.roleName === 'Vulcan - Operator')) {
      return true;
    }
    return false;
  }

  public configNavTabs(url: string): void {
    if (url) {
      this.tabs.forEach((tab) => {
        tab.isActive = url.endsWith('/' + tab.redirectUrl);
      });
    }
    let haveTabActive = this.tabs.some((tab) => tab.isActive);
    if (!haveTabActive && this.tabs.length) {
      this.tabs[0].isActive = true;
      this._router.navigate(['schedules-print', 'samples', this.tabs[0].redirectUrl]);
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
    this._router.navigate([this.tabs[index].redirectUrl], {relativeTo: this._activatedRoute});
  }

  public checkRole() {
    this._samplesSv.isFullPermission = false;
    const rolesName = ['Administrator', 'Staff Administrator', 'Art Manager'];
    rolesName.forEach((r) => {
      if (!this._samplesSv.isFullPermission) {
        this._samplesSv.isFullPermission = this._userContext.currentUser.listRole
          .findIndex((i) => i.roleName === r) > -1;
      }
    });
    // check role is sample printer
    this.isSamplePrinter = this._userContext.currentUser.listRole
      .findIndex((i) => i.roleName === 'Sample Printer') > -1;
  }

  public ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    // set last filter
    this._schedulesPrintService.searchObj = this._sampleMainSv.searchObj;
    this._schedulesPrintService.searchFrom = this._sampleMainSv.searchFrom;
    this._sampleMainSv.searchObj = '';
    this._sampleMainSv.searchFrom = '';
  }
}
