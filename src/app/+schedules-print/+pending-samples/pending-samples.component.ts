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
import { UserContext } from '../../shared/services/user-context/user-context';
import { AuthService } from '../../shared/services/auth/auth.service';

// Interfaces
import {
  ResponseMessage,
  BasicCsrInfo
} from '../../shared/models';
import { Subscription } from 'rxjs/Subscription';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'pending-samples',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's   compiler
  templateUrl: 'pending-samples.template.html',
  styleUrls: [
    'pending-samples.style.scss'
  ]
})
export class PendingSamplesComponent implements OnInit, OnDestroy {
  public tabs = [];
  public routerSub: Subscription;
  public currentPageUrl = '';
  public count = 0;
  public isArtManagers = true;
  public isNoData = false;

  constructor(private _breadcrumbService: BreadcrumbService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _userContext: UserContext,
              private _authService: AuthService,
              private _activatedRoute: ActivatedRoute,
              private _router: Router) {
    this._authService.checkPermission('Schedules.PendingSamples');
    this.routerSub = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.currentPageUrl = val.urlAfterRedirects;
        this.getCommonData();
      }
    });
  }

  public ngOnInit(): void {
    // this.isArtManagers = this._userContext.currentUser.listRole
    //   .some((i) => i.roleName === 'Art Manager' || i.roleName === 'Artists'
    //     || i.roleName === 'Administrator' || i.roleName === 'Staff Administrator'
    //     || i.roleName === 'Screen Print - Manager' || (i.roleName === 'Account Manager'
    //       && this._userContext.currentUser.isPrimaryAccountManager));
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
  }

  /**
   * Config text on breadcrumb
   */
  public configFriendlyRoutes(): void {
    // this._breadcrumbService
    //   .hideRouteRegex('^/schedules-print/pending-samples/[0-9A-Za-z]*$');
  }

  public getCommonData(): void {
    this._commonService.getAccountManagerList()
      .subscribe((resp: ResponseMessage<BasicCsrInfo[]>) => {
        if (resp.status) {
          if (resp.data && resp.data.length) {
            let vendorData = [];
            resp.data.forEach((item, index) => {
              if (index === 0 && this.isArtManagers) {
                vendorData.push({
                  id: -1,
                  fullName: 'ALL',
                  isActive: false,
                  isView: this.isArtManagers,
                  redirectUrl: 'all'
                });
                vendorData.push({
                  id: -1,
                  fullName: 'Unpublished',
                  isActive: false,
                  isView: this.isArtManagers,
                  redirectUrl: 'unpublished'
                });
              }
              if (this.isArtManagers) {
                vendorData.push({
                  ...item,
                  isActive: false,
                  isView: item.isPrimaryAccountManager,
                  redirectUrl: item.id
                });
              } else {
                if (this._userContext.currentUser.fullName === item.fullName) {
                  vendorData.push({
                    ...item,
                    isActive: false,
                    isView: item.isPrimaryAccountManager,
                    redirectUrl: item.id
                  });
                }
              }
            });
            const userItem = this._userContext.currentUser.csrAndAmUsers;
            if (userItem && userItem.length) {
              userItem.forEach((item) => {
                const duplUserIndex = vendorData.findIndex((i) => i.id === item.id);
                const userModel = {
                  id: item.id,
                  fullName: item.fullName,
                  isActive: false,
                  isView: item.isPrimaryAccountManager,
                  redirectUrl: item.id
                };
                if (duplUserIndex > -1) {
                  Object.assign(vendorData[duplUserIndex], userModel);
                } else {
                  vendorData.push(userModel);
                }
              });
            }
            this.tabs = vendorData;
            this.tabs.forEach((item) => {
              this._breadcrumbService.addFriendlyNameForRouteRegex(
                '^/schedules-print/pending-samples/' + item.redirectUrl + '$', item.fullName);
            });
            this._breadcrumbService.addFriendlyNameForRouteRegex(
              '^/schedules-print/pending-samples/all$', 'ALL');
            this.isNoData = !this.tabs.length;
            if (this.currentPageUrl.indexOf('/schedules-print/pending-samples/') === -1
              && this.tabs.length) {
              if (this.findFirstTabVisible()) {
                this._router.navigate([this.findFirstTabVisible().redirectUrl],
                  {
                    relativeTo: this._activatedRoute,
                    replaceUrl: true
                  });
              }
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

  public findFirstTabVisible(): any {
    if (this.tabs && this.tabs.length) {
      return this.tabs.find((i) => i.isView);
    } else {
      return null;
    }
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
      {
        relativeTo: this._activatedRoute,
        replaceUrl: true
      });
  }

  public ngOnDestroy(): void {
    this.routerSub.unsubscribe();
  }
}
