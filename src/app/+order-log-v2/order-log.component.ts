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

// Services
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  PageConfiguration
} from '../shared/containers/main-layout-container/components/sidebar/sidebar.model';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';
import {
  LocalStorageService
} from 'angular-2-local-storage';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'order-log-v2',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  template: `
    <breadcrumb></breadcrumb>
    <!--<div class="py-2">-->
    <router-outlet></router-outlet>
    <!--</div>-->
  `,
  styleUrls: [
    'order-log.style.scss'
  ]
})
export class OrderLogComponent implements OnInit, OnDestroy {
  private _pageConfig = _.cloneDeep(PageConfiguration);
  private _subRouter: Subscription;

  constructor(private _breadcrumbService: BreadcrumbService,
              private _router: Router,
              private _localStorageService: LocalStorageService) {
    this._subRouter = this._router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.setCurrentOrder(this._router.url);
        if (/^\/order-log-v2$/.test(this._router.url)) {
          // const orderLogConfig = this._pageConfig.find((i) => i.name === 'OrderLog');
          // if (orderLogConfig && orderLogConfig.isView) {
          //   const activatedSubMenu = orderLogConfig.subMenu.find((i) => i.isView);
          //   if (activatedSubMenu) {
          //     this._router.navigateByUrl(activatedSubMenu.routerLink);
          //   }
          // }
          let lastOrder = this._localStorageService.get('lastOrder') as string;
          if (lastOrder) {
            setTimeout(() => {
              this._router.navigate(['order-log-v2', lastOrder]);
            });
          }
        }
      }
    });
  }

  /**
   * Config text on breadcrumb
   */
  public ngOnInit(): void {
    this._breadcrumbService
      .addFriendlyNameForRoute('/order-log-v2', 'Order Log');
    this._breadcrumbService
      .addFriendlyNameForRoute('/order-log-v2/new-order', 'New Order');
    this._breadcrumbService
      .addFriendlyNameForRoute('/order-log-v2/all', 'All');
    this._breadcrumbService
      .addFriendlyNameForRoute('/order-log-v2/outsource', 'Outsource');
    this._breadcrumbService
      .addFriendlyNameForRoute('/order-log-v2/imports', 'Imports');
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+/order-info$', 'Order Info');
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+/trims-info$', 'Trims');
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+/history-info$', 'History');
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+/styles/standard$', 'Standard');
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+/styles/cc-sew$', 'CC & Sew');
    this._breadcrumbService
      .hideRouteRegex('/order-log-v2/new-order/.*');
  }

  public setCurrentOrder(url) {
    let splitUrl = url.split('/');
    let orderRoute = ['all', 'imports', 'outsource', 'sample-development'];
    if (splitUrl[2] && orderRoute.indexOf(splitUrl[2]) > -1) {
      this._localStorageService.set('lastOrder', splitUrl[2]);
    }
  }

  public ngOnDestroy(): void {
    this._subRouter.unsubscribe();
  }
}
