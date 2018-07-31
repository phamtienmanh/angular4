import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
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
  AuthService
} from '../../../shared/services/auth/auth.service';

import {
  SalesOrderService
} from '../sales-order.service';

import {
  ToastrService
} from 'ngx-toastr';

import { Subscription } from 'rxjs/Subscription';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'order-styles',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'order-styles.template.html',
  styleUrls: [
    'order-styles.style.scss'
  ]
})
export class OrderStylesComponent implements OnInit, OnDestroy {
  // public tabs = [
  //   {
  //     id: 0,
  //     name: 'Standard',
  //     redirectUrl: 'standard',
  //     isActive: false,
  //     isView: true,
  //     isDisabled: false
  //   },
  //   {
  //     id: 1,
  //     name: 'CC & Sew',
  //     redirectUrl: 'cc-sew',
  //     isActive: false,
  //     isView: true,
  //     isDisabled: false
  //   }
  // ];
  public routerSub: Subscription;
  public a2000Sub: Subscription;
  public isShowNav = true;
  public isPageReadOnly = false;
  public isA2000Order = false;

  constructor(private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _salesOrderService: SalesOrderService,
              private _breadcrumbService: BreadcrumbService,
              private _authService: AuthService,
              private _toastrService: ToastrService) {
    // Config active nav tab when router changes
    this.routerSub = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.configNavTabs(val.urlAfterRedirects);
      }
    });
  }

  public ngOnInit(): void {
    this._salesOrderService.getUpdateStatusOrder().subscribe((status) => {
      this.isPageReadOnly = status;
    });
    this.isA2000Order = this._salesOrderService.orderIndex.isA2000Order;
    this.a2000Sub = this._salesOrderService.getA2000().subscribe((res) => {
      this.isA2000Order = this._salesOrderService.orderIndex.isA2000Order;
    });
    // this.configFriendlyRoutes();
  }

  /**
   * Active nav tab is selected
   * @param url
   */
  public configNavTabs(url: string): void {
    // if (url) {
    //   this.tabs.forEach((tab) => {
    //     tab.isActive = url.indexOf('/' + tab.redirectUrl) !== -1;
    //   });
    // }
    const reg = new RegExp('(add-a-style\/style|styles\/[0-9]+)');
    if (reg.test(url)) {
      this.isShowNav = false;
    } else {
      this.isShowNav = true;
    }
    // if (this._salesOrderService.orderIndex.isCustomCutAndSew !== null) {
    //   let ccTab = this.tabs.find((i) => i.name === 'CC & Sew');
    //   if (ccTab) {
    //     ccTab.isView = this._salesOrderService.orderIndex.isCustomCutAndSew;
    //   }
    // }
    // this._salesOrderService.getImports().subscribe((isCustomCutAndSew: boolean) => {
    //   let ccTab = this.tabs.find((i) => i.name === 'CC & Sew');
    //   if (ccTab) {
    //     ccTab.isView = isCustomCutAndSew;
    //   }
    // });
  }

  /**
   * configFriendlyRoutes
   */
  public configFriendlyRoutes(): void {
    // this._breadcrumbService
    //   .hideRouteRegex('^[0-9A-Za-z/-]+/styles/standard$');
  }

  /**
   * Navigate to New style page
   */
  public addNewStyle(): void {
    this._router.navigate(['add-a-style'], {relativeTo: this._activatedRoute});
  }

  /**
   * Event switch tab
   * @param index
   */
  public switchTab(event: Event, index: number): void {
    // // Avoid click to tab when click delete on this tab
    // if (!event.target['innerText']) {
    //   return;
    // }
    // this._router.navigate([this.tabs[index].redirectUrl], {relativeTo: this._activatedRoute});
  }

  public ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this.a2000Sub.unsubscribe();
  }
}
