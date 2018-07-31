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
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import {
  SalesOrderService
} from '../../sales-order.service';
import {
  StylesInfoService
} from './styles-info.service';
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  ToastrService
} from 'ngx-toastr';
import {
  AuthService
} from '../../../../shared/services/auth/auth.service';

// Interfaces
import {
  BasicResponse,
  ResponseMessage
} from '../../../../shared/models/respone.model';
import {
  DesignType,
  SalesDesignInfo
} from './styles-info.model';
import {
  StyleDetail
} from './+style';
import {
  Subscription
} from 'rxjs/Subscription';

// Components
import {
  ConfirmDialogComponent
} from '../../../../shared/modules/confirm-dialog/confirm-dialog.component';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'styles-info',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'styles-info.template.html',
  styleUrls: [
    'styles-info.style.scss'
  ]
})
export class StylesInfoComponent implements OnInit, OnDestroy {
  public orderId: number;
  public isOrderCancelled: boolean = false;
  public isCancelled: boolean = false;
  public isA2000Order: boolean = false;
  public styleInfo: any = {
    id: 0,
    name: '',
    isCancelled: false
  };
  public tabs: any = [
    {
      name: 'Style',
      redirectUrl: 'style',
      isActive: false,
      isDisable: false
    },
    {
      name: 'OWS/Tech Pack',
      redirectUrl: 'ows-techpack',
      isActive: false,
      isDisable: true
    },
    {
      name: 'Samples',
      redirectUrl: 'samples',
      isActive: false,
      isDisable: true
    },
    {
      name: 'Print Locations',
      redirectUrl: 'print-location',
      isActive: false,
      isDisable: true
    },
    {
      name: 'Neck Label',
      redirectUrl: 'neck-labels',
      isActive: false,
      isDisable: true
    },
    {
      name: 'Trims',
      redirectUrl: 'trims',
      isActive: false,
      isDisable: true
    },
    {
      name: 'TOPs',
      redirectUrl: 'tops',
      isActive: false,
      isDisable: true
    },
    {
      name: 'QA',
      redirectUrl: 'qa',
      isActive: false,
      isDisable: true
    },
    {
      name: 'Shipping Info',
      redirectUrl: 'shipping-info',
      isActive: false,
      isDisable: true
    }
  ];
  public subRouter: Subscription;
  public activatedRouteSub: Subscription;
  public styleInfoSub: Subscription;
  public subPartnerStyleName: Subscription;
  public isPageReadOnly = false;
  public canViewPendingSamples = false;
  public canViewSamples = false;
  private _isUpdateStyle = false;

  constructor(private _activatedRoute: ActivatedRoute,
              private _router: Router,
              private _breadcrumbService: BreadcrumbService,
              private _toastrService: ToastrService,
              private _modalService: NgbModal,
              private _authService: AuthService,
              private _salesOrderService: SalesOrderService,
              private _stylesInfoService: StylesInfoService) {

    // Config active nav tab when router changes
    this.subRouter = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.configNavTabs(val.urlAfterRedirects);
      }
    });
    this.activatedRouteSub = this._activatedRoute.params
      .subscribe((params: { id: number }) => {
        this._salesOrderService.orderIndex.styleId = params.id;
      });
    this.subPartnerStyleName = this._stylesInfoService.getUpdateStyle().subscribe((styleData) => {
      this._breadcrumbService
        .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+/[0-9A-Za-z]+/[0-9A-Za-z]+$',
          this._salesOrderService.orderIndex.partnerStyleName ?
            this._salesOrderService.orderIndex.partnerStyleName : 'No Name Was Given');
    });
  }

  public ngOnInit(): void {
    this.canViewPendingSamples = this._authService.checkCanView('Schedules.PendingSamples');
    this.canViewSamples = this._authService.checkCanView('Schedules.Samples');
    this._stylesInfoService.resetStatusStyle();

    this._salesOrderService.getUpdateStatusOrder().subscribe((status) => {
      this.isPageReadOnly = status;
    });
    this.styleInfoSub = this._salesOrderService.getUpdateOrder().subscribe(() => {
      this.isOrderCancelled = this._salesOrderService.orderIndex.isCancelled;
      this.orderId = this._salesOrderService.orderIndex.orderId;
      this.styleInfo.id = this._salesOrderService.orderIndex.styleId;
      if (this.orderId && this.styleInfo.id && !this._isUpdateStyle) {
        this._isUpdateStyle = true;
        this._stylesInfoService.getStyleInfo(this.styleInfo.id)
          .subscribe((resp: ResponseMessage<StyleDetail>) => {
            if (resp.status) {
              this.styleInfo.name = resp.data.styleName;
              this.styleInfo.isCancelled = resp.data.isCancelled;
              this.isA2000Order = resp.data.isA2000Order;
              this._salesOrderService.orderIndex.styleName = resp.data.styleName;
              this._salesOrderService.orderIndex.partnerStyleName = resp.data.partnerStyleName;
              this._stylesInfoService.styleIndex.noTrimRequired = resp.data.noTrimRequired;
              this._stylesInfoService.setUpdateStyle(this.styleInfo);
              this.tabs.forEach((tab) => {
                tab.isDisable = false;
                if (tab.redirectUrl === 'tops' &&
                  resp.data.customerPoId.toLowerCase().startsWith('smpl')) {
                  tab.name = 'PPs';
                }
              });
              this.configFriendlyRoutes();
            } else {
              this._isUpdateStyle = false;
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      } else {
        this._breadcrumbService
          .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+' +
            '/[0-9A-Za-z]+/add-a-style$', 'Add a Style');
      }
    });
  }

  public configFriendlyRoutes(isClearVal = false): void {
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+/[0-9A-Za-z]+/[0-9A-Za-z]+$',
        !isClearVal ? (this._salesOrderService.orderIndex.partnerStyleName ?
          this._salesOrderService.orderIndex.partnerStyleName : 'No Name Was Given') : '');
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+' +
        '/styles/[0-9A-Za-z]+/ows-techpack$',
        'OWS/Tech Pack');
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+' +
        '/styles/[0-9A-Za-z]+/print-location$',
        'Print Location');
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+' +
        '/styles/[0-9A-Za-z]+/neck-labels$',
        'Neck Labels');
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+' +
        '/styles/[0-9A-Za-z]+/neck-labels/art-files$',
        'art files');
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+' +
        '/styles/[0-9A-Za-z]+/shipping-info$', 'Shipping Info');
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

  public cancelStyle(): void {
    let modalRef = this._modalService.open(ConfirmDialogComponent, {
      keyboard: true
    });
    modalRef.componentInstance
      .message = 'Are you sure you want to cancel this style?';
    modalRef.componentInstance.title = 'Confirm Style Cancellation';

    modalRef.result.then((res: boolean) => {
      if (res) {
        if (this.styleInfo.id) {
          this._stylesInfoService
            .cancelStyleDetail(this.styleInfo.id)
            .subscribe((resp: BasicResponse) => {
              if (resp.status) {
                this.styleInfo.isCancelled = true;
                this._stylesInfoService.setUpdateStyle(this.styleInfo);
                this._toastrService.success(resp.message, 'Success');
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
      }
    });
  }

  public ngOnDestroy(): void {
    this.subRouter.unsubscribe();
    this.activatedRouteSub.unsubscribe();
    this.styleInfoSub.unsubscribe();
    this.subPartnerStyleName.unsubscribe();
    this.configFriendlyRoutes(true);
  }
}
