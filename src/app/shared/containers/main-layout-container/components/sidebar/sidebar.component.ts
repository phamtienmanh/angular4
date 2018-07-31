import {
  Component,
  ViewEncapsulation,
  HostListener,
  ElementRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy,
  NgZone,
  OnInit
} from '@angular/core';

import {
  ThemeSetting
} from '../../../../services/theme-setting';

import {
  NoisMedia
} from '../../../../services/nois-media';

import {
  MenuItem
} from '../../../../models/sidebar.model';

import {
  NavigationEnd,
  Router
} from '@angular/router';

import { RouterService } from '../../../../../core/router';
import { Util } from '../../../../services/util';
import { Subscription } from 'rxjs/Subscription';
import { UserContext } from '../../../../services/user-context';
import { PageConfiguration } from './sidebar.model';
import * as _ from 'lodash';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'sidebar',  // <sidebar></sidebar>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './sidebar.template.html',
  styleUrls: [
    './sidebar.style.scss'
  ]
})
export class SidebarComponent implements OnInit,
                                         AfterViewInit,
                                         OnDestroy {
  @ViewChildren('menuItem')
  public menuItem: QueryList<ElementRef>;
  public subscription: Subscription;
  public config = {
    // wheelSpeed: 1              // Scroll speed for the mousewheel event (Default: 1).
    // wheelPropagation: false        // Propagate wheel events at the end (Default: false).
    // swipePropagation: true        // Propagate swipe events at the end (Default: true).
    // minScrollbarLength      // Minimum size for the scrollbar (Default: null).
    // maxScrollbarLength      // Maximum size for the scrollbar (Default: null).
    // useBothWheelAxes        // Always use the both wheel axes (Default: false).
    // suppressScrollX         // Disable X axis in all situations (Default: false).
    // suppressScrollY         // Disable Y axis ni all situations (Default: false).
    // scrollXMarginOffset     // Offset before enabling the X scroller (Default: 0).
    // scrollYMarginOffset     // Offset before enabling the Y scroller (Default: 0).
    // stopPropagationOnClick  // Stop the propagation of click event (Default: true).
    sideBars: _.cloneDeep(PageConfiguration)
  };

  public lastBrowserWidth: number;

  // Cache
  private _sidebarEl;
  private _currentPageUrl;

  constructor(public el: ElementRef,
              private _themeSetting: ThemeSetting,
              private _router: Router,
              private _routerService: RouterService,
              private _utilService: Util,
              private _userContext: UserContext,
              private _ngZone: NgZone,
              private _noisMedia: NoisMedia) {
    // this.subscription = _utilService.onRouteChange$.subscribe(
    //   (url: string) => {
    //     this.activeCurrentIcon(url);
    //   });
    this.subscription = this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.activeCurrentIcon(event.urlAfterRedirects);
      }
    });
    this.lastBrowserWidth = window.innerWidth || document.body.clientWidth;
    window.onresize = (e) => {
      // ngZone.run will help to run change detection
      this._ngZone.run(() => {
        let width = window.innerWidth || document.body.clientWidth;
        if (width <= 991 && width < this.lastBrowserWidth) {
          if (this._themeSetting.menuPin) {
            this._themeSetting.sidebarOpen = true;
          } else {
            this._themeSetting.sidebarOpen = false;
          }
        }
        if (width >= 992 && width > this.lastBrowserWidth) {
          if (this._themeSetting.sidebarOpen) {
            this._themeSetting.menuPin = true;
          } else {
            this._themeSetting.menuPin = false;
          }
        }
        this.lastBrowserWidth = width;
      });
    };
  }

  public ngOnInit(): void {
    const pagePermissions = this._userContext.currentUser.permissions.filter((i) => i.type === 1);
    const schedulesPage = pagePermissions.filter((i) => i.name.includes('Schedules.')
      && i.name.lastIndexOf('.') === i.name.indexOf('.'));
    let schedules = this.config.sideBars.find((i) => i.name === 'Schedules');
    if (schedules) {
      schedules.isView = schedulesPage.some((i) => i.isView);
    }
    const orderLogPage = pagePermissions.filter((i) => i.name.includes('OrderLog.'));
    let orderLog = this.config.sideBars.find((i) => i.name === 'OrderLog');
    if (orderLog) {
      orderLog.isView = orderLogPage.some((i) => i.isView);
    }
    const settingsPage = pagePermissions.filter((i) => i.name.includes('Settings.')
      && i.name.lastIndexOf('.') === i.name.indexOf('.'));
    let settings = this.config.sideBars.find((i) => i.name === 'Settings');
    if (settings) {
      settings.isView = settingsPage.some((i) => i.isView);
    }
    const projectsPage = pagePermissions.filter((i) => i.name.includes('Projects.')
      && i.name.lastIndexOf('.') === i.name.indexOf('.'));
    let projects = this.config.sideBars.find((i) => i.name === 'Projects');
    if (projects) {
      projects.isView = projectsPage.some((i) => i.isView);
    }
    const updateConfig = (config, preName = '') => {
      config.forEach((page) => {
        let samePage = pagePermissions
          .find((i) => i.name === `${preName}${page.name}`);
        if (samePage) {
          if (!samePage.description.includes('.')) {
            page.title = samePage.description;
          }
          page.isView = samePage.isView;
        }
      });
    };
    updateConfig(this.config.sideBars);
    const settingsConfig: any = this.config.sideBars.find((i) => i.name === 'Settings');
    if (settingsConfig) {
      updateConfig(settingsConfig.subMenu, 'Settings.');
    }

    const orderLogConfig: any = this.config.sideBars.find((i) => i.name === 'OrderLog');
    if (orderLogConfig) {
      orderLogConfig.subMenu.forEach((page) => {
        page.isView = pagePermissions
          .some((i) => i.name.includes(`OrderLog.${page.name}.`) && i.isView);
      });
      orderLogConfig.isView = orderLogConfig.subMenu.some((i) => i.isView);

      const activatedOrderLogSubMenu = orderLogConfig.subMenu.filter((i) => i.isView);
      if (activatedOrderLogSubMenu.length === 1) {
        orderLogConfig.isView = false;
        const orderLogMenuConfig = this.config.sideBars
          .find((i) => i.name === activatedOrderLogSubMenu[0].name);
        if (orderLogMenuConfig) {
          orderLogMenuConfig.isView = true;
        }
      }
    }
  }

  public ngAfterViewInit(): void {
    this.activeCurrentIcon(this._router.url);
  }

  @HostListener('mouseenter')
  public mouseenter() {
    // if (this._noisMedia.is('max-width: 991px')) {
    //   return;
    // }
    //
    // if (this._themeSetting.menuPin) {
    //   return true;
    // }
    //
    // let css = 'translate3d(' + this._themeSetting.sideBarWidthCondensed + 'px, 0,0)';
    //
    // if (this._sidebar) {
    //   this._sidebar.style['-webkit-transform'] = css;
    //   this._sidebar.style['-moz-transform'] = css;
    //   this._sidebar.style['-ms-transform'] = css;
    //   this._sidebar.style['-o-transform'] = css;
    //   this._sidebar.style['transform'] = css;
    // }

    // this._themeSetting.sidebarHover = true;
  }

  @HostListener('mouseleave')
  public mouseleave() {
    // let css = 'translate3d(0,0,0)';
    //
    // if (this._sidebar) {
    //   this._sidebar.style['-webkit-transform'] = css;
    //   this._sidebar.style['-moz-transform'] = css;
    //   this._sidebar.style['-ms-transform'] = css;
    //   this._sidebar.style['-o-transform'] = css;
    //   this._sidebar.style['transform'] = css;
    // }

    // this._themeSetting.sidebarHover = false;
  }

  public pinSidebar() {
    this._themeSetting.menuPin = !this._themeSetting.menuPin;
    if (!this.menuPin) {
      const expandMenu = this.config.sideBars.filter((i) => i.subMenuOpen);
      expandMenu.forEach((i) => i.subMenuOpen = false);
    }
  }

  public get menuPin(): boolean {
    return this._themeSetting.menuPin;
  }

  public isSidebarOpen() {
    return this._themeSetting.sidebarOpen;
  }

  private get _sidebar() {
    if (!this._sidebarEl) {
      this._sidebarEl = this.el.nativeElement.querySelector('nav.page-sidebar');
    }
    return this._sidebarEl;
  };

  public navigate($event: Event, itemData: MenuItem) {
    this._currentPageUrl = this._router.url;
    this._routerService.deleteStored(itemData.routerLink);
    let currentUrlStr;
    let currentMenuConfig;
    if (this._currentPageUrl.includes('/settings/')) {
      currentUrlStr = 'settings';
      currentMenuConfig = this.config.sideBars.find((i) => i.title === 'Settings');
    } else if (this._currentPageUrl.includes('/order-log-v2/')) {
      currentUrlStr = 'order-log-v2';
      currentMenuConfig = this.config.sideBars.find((i) => i.title === 'Order Log');
    }
    this._utilService.currentPage = undefined;
    this._utilService.scrollPosition = undefined;
    if (!itemData.subMenu) {
      if (!!currentUrlStr && !itemData.routerLink.includes(currentUrlStr)) {
        currentMenuConfig['subMenuOpen'] = false;
      }
      this._router.navigate([itemData.routerLink]);
    } else {
      // unpin menu if menu current pin
      if (!this._themeSetting.menuPin) {
        this._themeSetting.menuPin = true;
      }
      // open sub menu
      itemData.subMenuOpen = !itemData.subMenuOpen;
    }
  }

  public collapseSubMenu(itemData: MenuItem): void {
    let currentUrlStr;
    let currentMenuConfig;
    if (!this._currentPageUrl) {
      this._currentPageUrl = itemData.routerLink;
      return;
    }
    if (this._currentPageUrl.includes('/settings/')) {
      currentUrlStr = 'settings';
      currentMenuConfig = this.config.sideBars.find((i) => i.title === 'Settings');
    } else if (this._currentPageUrl.includes('/order-log-v2/')) {
      currentUrlStr = 'order-log-v2';
      currentMenuConfig = this.config.sideBars.find((i) => i.title === 'Order Log');
    }
    if (!!currentUrlStr && !itemData.routerLink.includes(currentUrlStr)) {
      currentMenuConfig['subMenuOpen'] = false;
    }
  }

  public activeCurrentIcon(url: string) {
    let itemId: number = this.config.sideBars.findIndex((item) => url.includes(item.routerLink));
    if (!this.menuItem) {
      return;
    }
    if (itemId > -1) {
      this.menuItem.forEach((item: ElementRef, index) => {
        if (index !== itemId) {
          item.nativeElement.className = '';
        } else {
          item.nativeElement.className += ` ${this.config.sideBars[itemId].routerLinkActive}`;
        }
      });
    }
    if (url === '/') {
      this.menuItem.forEach((item: ElementRef) => {
        item.nativeElement.className = '';
      });
      this.menuItem.first.nativeElement.className += ` ${this.config.sideBars[0].routerLinkActive}`;
    }
  }

  public ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscription.unsubscribe();
  }
}
