import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  NavigationEnd
} from '@angular/router';

// Services
import {
  SalesOrderService
} from '../../../sales-order.service';
import {
  StylesInfoService
} from '../styles-info.service';
import {
  OwsTechpackService
} from './ows-techpack.service';
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  AuthService
} from '../../../../../shared/services/auth/auth.service';

// Interfaces
import {
  Subscription
} from 'rxjs/Subscription';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'ows-techpack',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'ows-techpack.template.html',
  styleUrls: [
    'ows-techpack.style.scss'
  ]
})
export class OwsTechpackComponent implements OnInit, OnDestroy {
  public isPageReadOnly = false;
  public isOrderCancelled = false;
  public isOrderArchived = false;
  public isStyleReadOnly = false;
  public isStyleCancelled = false;
  public orderIndex: any = {
    orderId: 0,
    styleId: 0,
    customer2Type: 0,
    styleName: ''
  };
  public tabs: any = [
    {
      name: 'General',
      redirectUrl: 'general',
      isActive: false,
      isDisable: false
    },
    {
      name: 'Fabric Quality',
      redirectUrl: 'fabric-quality',
      isActive: false,
      isDisable: false
    },
    {
      name: 'Lab Dips',
      redirectUrl: 'lab-dips',
      isActive: false,
      isDisable: false
    },
    {
      name: 'Fit Sample',
      redirectUrl: 'fit-sample',
      isActive: false,
      isDisable: false
    },
    {
      name: 'PP Sample',
      redirectUrl: 'pp-sample',
      isActive: false,
      isDisable: false
    },
    {
      name: 'Packing Validation',
      redirectUrl: 'packing-validation',
      isActive: false,
      isDisable: false
    }
  ];

  private _subRouter: Subscription;
  private _subOrderStatus: Subscription;
  private _subOrderData: Subscription;
  private _subStyleData: Subscription;

  constructor(private _activatedRoute: ActivatedRoute,
              private _router: Router,
              private _breadcrumbService: BreadcrumbService,
              private _authService: AuthService,
              private _owsTechpackService: OwsTechpackService,
              private _salesOrderService: SalesOrderService,
              private _stylesInfoService: StylesInfoService) {
    this.orderIndex = this._salesOrderService.orderIndex;
    // Config active nav tab when router changes
    this._subRouter = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.configNavTabs(val.urlAfterRedirects);
      }
    });
  }

  public ngOnInit(): void {
    this._subOrderStatus = this._salesOrderService.getUpdateStatusOrder().subscribe((status) => {
      this.isPageReadOnly = status;
      this._owsTechpackService.setUpdateOws(this.canModifyOws);
    });
    this._subOrderData = this._salesOrderService.getUpdateOrder().subscribe((orderData) => {
      this.isOrderArchived = orderData.isArchived;
      this.isOrderCancelled = orderData.isCancelled;
      this._owsTechpackService.setUpdateOws(this.canModifyOws);
    });
    this._subStyleData = this._stylesInfoService.getUpdateStyle().subscribe((styleData) => {
      this.isStyleCancelled = styleData.isCancelled;
      this._owsTechpackService.setUpdateOws(this.canModifyOws);
    });
    this.configFriendlyRoutes();
  }

  public get canModifyOws() {
    return !this.isPageReadOnly && !this.isStyleReadOnly &&
      !this.isStyleCancelled && !this.isOrderArchived && !this.isOrderCancelled;
  }

  public configFriendlyRoutes(): void {
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+' +
        '/styles/[0-9A-Za-z]+/ows-techpack/general$',
        'General');
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+' +
        '/styles/[0-9A-Za-z]+/ows-techpack/fabric-quality$',
        'Fabric Quality');
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+' +
        '/styles/[0-9A-Za-z]+/ows-techpack/lap-dips$',
        'Lab Dips');
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+' +
        '/styles/[0-9A-Za-z]+/ows-techpack/fit-sample$',
        'Fit Sample');
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+' +
        '/styles/[0-9A-Za-z]+/ows-techpack/trim-supmits$',
        'Trim Submits');
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+' +
        '/styles/[0-9A-Za-z]+/ows-techpack/pp-sample$',
        'PP Sample');
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+' +
        '/styles/[0-9A-Za-z]+/ows-techpack/packing-validation$',
        'Packing Validation');
  }

  /**
   * Active nav tab is selected
   * @param url
   */
  public configNavTabs(url: string): void {
    if (url) {
      let newUrl = url + '/';
      // Reset status nav tab
      this.tabs.forEach((tab) => tab.isActive = false);
      // Active current nav tab is selected
      this.tabs.forEach((tab) => {
        tab.isActive = newUrl.indexOf('/' + tab.redirectUrl + '/') !== -1;
      });
    }
    let haveTabActive = this.tabs.some((tab) => {
      return tab.isActive;
    });
    if (!haveTabActive) {
      this.tabs[0].isActive = true;
    }
  }

  public switchTab(event: Event, tabIndex: number): void {
    if (this.tabs[tabIndex].isDisable) {
      return;
    }
    this._router.navigate([this.tabs[tabIndex].redirectUrl], {relativeTo: this._activatedRoute});
  }

  public ngOnDestroy(): void {
    this._subRouter.unsubscribe();
    this._subOrderStatus.unsubscribe();
    this._subOrderData.unsubscribe();
    this._subStyleData.unsubscribe();
  }
}
