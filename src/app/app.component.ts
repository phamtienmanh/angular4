/*
 * Angular 2 decorators and services
 */
import {
  Component,
  ViewEncapsulation,
  OnInit,
  ElementRef,
  AfterViewInit,
  HostListener
} from '@angular/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import {
  Title
} from '@angular/platform-browser';

import {
  Router,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  ActivatedRoute,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  RoutesRecognized
} from '@angular/router';

import {
  ThemeSetting,
  ProgressService,
  Util
} from './shared/services';

import {
  RouterService
} from './core/router';

import * as NProgress from 'nprogress';
import {
  AuthService
} from './shared/services/auth';
import {
  PageConfiguration
} from './shared/containers/main-layout-container/components/sidebar/sidebar.model';
import { UserContext } from './shared/services/user-context';
import { NgbModalWindow } from '@ng-bootstrap/ng-bootstrap/modal/modal-window';
import * as _ from 'lodash';
import { CommonService } from './shared/services/common';
import { LocalStorageService } from 'angular-2-local-storage';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="fixed-scroll main-body fixed-header" theme-setting>
      <router-outlet></router-outlet>
    </div>
    <div id="backdrop" class="none">
      <div class="cssload-loader" role="spinner">
        <img src="../assets/icon/android-icon-192x192.png" alt="logo" class="logo-loader"
             data-src="assets/icon/android-icon-192x192.png" id="logo-loader"
             data-src-retina="assets/icon/android-icon-192x192.png" width="auto" height="100">
        <div class="cssload-inner cssload-one"></div>
        <div class="cssload-inner cssload-two"></div>
        <div class="cssload-inner cssload-three"></div>
      </div>
      <div class="busy-overlay-backdrop"></div>
    </div>
  `,
  styles: [
      `
      html, body {
        overflow-x: hidden;
        font-family: Arial, Helvetica, sans-serif
      }

      span.active {
        background-color: gray
      }
      `
  ]
})
export class AppComponent implements OnInit, AfterViewInit {
  private className = '';
  private _pageConfig = _.cloneDeep(PageConfiguration);

  constructor(public el: ElementRef,
              private _router: Router,
              private activatedRoute: ActivatedRoute,
              private title: Title,
              private _themeSetting: ThemeSetting,
              private progressService: ProgressService,
              private _commonService: CommonService,
              private _localStorageService: LocalStorageService,
              private _routerService: RouterService,
              private _userContext: UserContext,
              private _util: Util,
              private _authService: AuthService) {
    this._themeSetting.init(el.nativeElement.parentElement);
    this._authService.saveAttemptUrl();
    this._router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        // this.progressService.start();
      } else if (event instanceof RouteConfigLoadStart) {
        this.progressService.start();
      } else if (event instanceof RouteConfigLoadEnd) {
        this.progressService.done();
      } else if (event instanceof RoutesRecognized) {
        // this.progressService.done();
      } else if (event instanceof NavigationEnd) {
        // console.log('NavigationEnd', event);
        // Hide progress bar
        this.progressService.done();

        let lastActivatedRoute = this._util.getLastActivatedRoute(this.activatedRoute);

        // Binding page title and page classes
        let routeData = lastActivatedRoute.data['value'];
        if (routeData['pageTitle']) {
          this.title.setTitle(routeData['pageTitle']);
        }

        let classes = [];

        if (routeData['className']) {
          if (routeData['className'].indexOf(' ') > -1) {
            classes = classes.concat(routeData['className'].split(' '));
          } else {
            classes.push(routeData['className']);
          }
        }

        this._themeSetting.pageClassList = classes;

        // Restore scroll position if the view was cached
        let keyPath = this._util.getFullRoutePathByActivatedRoute('', lastActivatedRoute);
        let storedRoutes = this._routerService.storedRoutes;
        if (storedRoutes && storedRoutes[keyPath]) {
          window.scrollTo(0, storedRoutes[keyPath].scrollPosition || 0);
        }

        if (event.urlAfterRedirects === '/') {
          if (this._userContext.currentUser && this._userContext.currentUser.permissions
            && this._userContext.currentUser.permissions.length) {
            this._pageConfig = this._commonService.updateSidebarConfig(this._pageConfig);
            const firstPage = this._userContext.currentUser.permissions
              .filter((i) => i.type === 1)
              .find((i) => i.isView === true && i.name !== 'Orders');
            if (firstPage) {
              const firstPageConfig: any = this._pageConfig.find((i) =>
                firstPage.name.includes(i.name) && i.isView);
              if (firstPageConfig) {
                if (['Settings', 'OrderLog'].indexOf(firstPageConfig.name) === -1) {
                  this._router.navigate([firstPageConfig.routerLink]);
                } else {
                  const firstSubMenuConfig = firstPageConfig.subMenu.find((i) => i.isView);
                  if (firstSubMenuConfig) {
                    this._router.navigate([firstSubMenuConfig.routerLink]);
                  } else if (!firstPageConfig.subMenu.length) {
                    this._router.navigate([firstPageConfig.routerLink]);
                  }
                }
              } else {
                this._router.navigate(['dashboard']);
              }
            } else {
              this._router.navigate(['not-found']);
            }
          }
        }
      } else if (event instanceof NavigationError) {
        this.progressService.done();
      } else if (event instanceof NavigationCancel) {
        this.progressService.done();
      }
    });
  }

  public ngOnInit(): void {
    NProgress.configure({
      template: `
        <div class="bar" role="bar"><div class="peg"></div></div>
        <div class="cssload-loader" role="spinner">
           <img src="../assets/icon/android-icon-192x192.png" alt="logo" class="logo-loader"
             data-src="assets/icon/android-icon-192x192.png" id="logo-loader"
             data-src-retina="assets/icon/android-icon-192x192.png" width="auto" height="100">
          <div class="cssload-inner cssload-one"></div>
          <div class="cssload-inner cssload-two"></div>
          <div class="cssload-inner cssload-three"></div>
        </div>
        <div class="busy-overlay-backdrop"></div>
      `
    });
    if (!this._util.scrollElm) {
      this._util.scrollElm = document.getElementsByTagName('html')[0];
    }
    NgbModalWindow.prototype.ngOnInit = () => {
      this.addClass(document.documentElement, 'modal-open');
    };
    NgbModalWindow.prototype.ngOnDestroy = () => {
      const popupArr = document.getElementsByClassName('modal-backdrop');
      // Still opening popup
      if (popupArr && popupArr.length > 1) {
        return;
      }
      this.removeClass(document.documentElement, 'modal-open');
    };
    setInterval(() => {
      this._commonService.getVersionApp().subscribe((resp: any) => {
        if (this._localStorageService.get('VersionApp') !== resp.data.name) {
          this._localStorageService.clearAll();
          this._localStorageService.add('VersionApp', resp.data.name);
          location.reload();
        }
      });
    }, 3600000);
  }

  public get menuPin(): boolean {
    return this._themeSetting.menuPin;
  }

  public classList(elm) {
    return (' ' + (elm.className || '') + ' ').replace(/\s+/gi, ' ');
  }

  public hasClass(elm, n) {
    let list = typeof elm === 'string' ? elm : this.classList(elm);
    return list.indexOf(' ' + n + ' ') >= 0;
  }

  public addClass(element, name) {
    let oldList = this.classList(element);
    let newList = oldList + name;
    if (this.hasClass(oldList, name)) {
      return;
    }
    // Trim the opening space.
    element.className = newList.substring(1);
  }

  public removeClass(element, name) {
    let oldList = this.classList(element);
    let newList;

    if (!this.hasClass(element, name)) {
      return;
    }

    // Replace the class name.
    newList = oldList.replace(' ' + name + ' ', ' ');

    // Trim the opening and closing spaces.
    element.className = newList.substring(1, newList.length - 1);
  }

  /**
   * onAppScroll
   * @param event
   */
  @HostListener('window:scroll', ['$event'])
  public onAppScroll(event?: any) {
    this._util.scrollElm = event.target.scrollingElement;
  }

  public ngAfterViewInit(): void {
    this._themeSetting.pageLoaded = true;
  }
}
