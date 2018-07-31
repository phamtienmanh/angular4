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
import * as _ from 'lodash';
import * as moment from 'moment';

// Services
import {
  SalesOrderService
} from './sales-order.service';
import {
  ToastrService
} from 'ngx-toastr';
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../shared/services/auth/auth.service';
import { UserContext } from '../../shared/services/user-context/user-context';
import { CommonService } from '../../shared/services/common/common.service';
import { LocalStorageService } from 'angular-2-local-storage';
import { Util } from '../../shared/services/util';
import * as FileSaver from 'file-saver';
import { OrderMainService } from '../+order-main/order-main.service';

// Components
import {
  ConfirmDialogComponent
} from '../../shared/modules/confirm-dialog/confirm-dialog.component';

// Interfaces
import {
  BasicResponse,
  ResponseMessage
} from '../../shared/models/respone.model';
import {
  SalesOrder
} from './sales-order.model';
import {
  Subscription
} from 'rxjs/Subscription';
import { BasicCsrInfo } from '../../shared/models/common.model';
import {
  ItemTypes
} from './+order-styles/order-styles.model';
import { HttpParams } from '@angular/common/http';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'sales-order',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'sales-order.template.html',
  styleUrls: [
    'sales-order.style.scss'
  ]
})
export class SalesOrderComponent implements OnInit, OnDestroy {
  public tabs = [
    {
      id: 0,
      name: 'Order Info',
      redirectUrl: 'order-info',
      isActive: false,
      isDisabled: false
    },
    {
      id: 1,
      name: 'Styles',
      redirectUrl: 'styles',
      isActive: false,
      isDisabled: false
    },
    // {
    //   id: 2,
    //   name: 'Trims',
    //   redirectUrl: 'trims-info',
    //   isActive: false,
    //   isDisabled: false
    // },
    // {
    //   id: 3,
    //   name: 'Shipping Info',
    //   redirectUrl: 'shipping-info',
    //   isActive: false,
    //   isDisabled: false
    // },
    {
      id: 4,
      name: 'History',
      redirectUrl: 'history-info',
      isActive: false,
      isDisabled: false
    }
  ];
  public roleCanEditUnpublish = [
    'Administrator',
    'Account Manager',
    'Account Supervior',
    'Customer Service',
    'Pre-Production'
  ];
  public orderId: number;
  public routerSub: Subscription;
  public activatedRouterSub: Subscription;
  public updatedSub: Subscription;
  public assignedSub: Subscription;
  public reValidateSub: Subscription;
  public updateStyleNum: Subscription;
  public isShowNav = true;
  public orderInfo;
  public isAssignedAM = false;
  public isShowBtnACL = false;
  public isPublished = false;
  public isAllowTractorSupplySync = false;
  public isStylesPage = false;
  public canExportLayout = false;

  public isPageReadOnly = false;

  public errorList = [];
  public errorListHeight = 0;

  constructor(private _salesOrderService: SalesOrderService,
              private _activatedRoute: ActivatedRoute,
              private _router: Router,
              private _breadcrumbService: BreadcrumbService,
              private _localStorageService: LocalStorageService,
              private _authService: AuthService,
              private _utilService: Util,
              private _userContext: UserContext,
              private _toastrService: ToastrService,
              private _orderMainService: OrderMainService,
              private _commonService: CommonService,
              private _modalService: NgbModal) {
    this.canExportLayout = this._authService.checkPermissionFunc('Orders.LayoutsReportGeneration');
    // Config active nav tab when router changes
    this.routerSub = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.configNavTabs(val.urlAfterRedirects);
        const routeRegex = new RegExp('^\/order-log-v2\/[0-9]+/styles\/[a-zA-Z]+$');
        this.isStylesPage = routeRegex.test(val.urlAfterRedirects);
      }
    });
    // Get Order Id and Init data
    this.activatedRouterSub = this._activatedRoute.params.subscribe((params: { id: number }) => {
      let id = Number(params.id);
      this.orderId = isNaN(id) ? undefined : params.id;
      this._salesOrderService.orderIndex.orderId = this.orderId;
      this.getOrderInfo();
    });
    this.updatedSub = this._salesOrderService.getBreadcrumb().subscribe((data) => {
      this.configFriendlyRoutes();
    });
    this.updateStyleNum = this._salesOrderService.getUpdateStyleNum().subscribe((isAdd) => {
      if (this.orderInfo && !isNaN(this.orderInfo.totalStyles)) {
        if (isAdd) {
          this.orderInfo.totalStyles++;
        } else {
          this.orderInfo.totalStyles--;
        }
      }
    });
    this.reValidateSub = this._salesOrderService.onRevalidate$.subscribe((data) => {
      this.validateBeforePublish(data);
    });
  }

  public ngOnInit(): void {
    const isAllowTractor = this._userContext.currentUser.permissions
      .find((i) => i.name.includes('A2000ManualSync'));
    if (isAllowTractor) {
      this.isAllowTractorSupplySync = isAllowTractor.isModify;
    }
    this._salesOrderService.resetStatusOrder();
    this._salesOrderService.getUpdateStatusOrder().subscribe((status) => {
      this.isPageReadOnly = status;
    });
    this.configFriendlyRoutes();
    this.assignedSub = this._salesOrderService.getAM().subscribe((isAssignedAM) => {
      this.isAssignedAM = isAssignedAM;
    });
    if (this._userContext.currentUser.listRole.some((i) => i.roleName === 'Administrator'
        || i.roleName === 'Account Supervisor' || i.roleName === 'Account Manager'
        || i.roleName === 'Customer Service')) {
      this.isShowBtnACL = true;
    }
  }

  /**
   * Config text on breadcrumb
   */
  public configFriendlyRoutes(isClearVal = false): void {
    let name = this._salesOrderService.orderIndex.customerName
      + ' # ' + this._salesOrderService.orderIndex.customerPoId;
    if (this._salesOrderService.orderIndex.retailerName) {
      name += ' (' + this._salesOrderService.orderIndex.retailerName
        + ' # ' + this._salesOrderService.orderIndex.retailerPoId + ')';
    }

    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+$', !isClearVal ? name : '');
  }

  /**
   * Active nav tab is selected
   * @param url
   */
  public configNavTabs(url: string): void {
    if (url) {
      if (url.indexOf('/new-order') > -1) {
        this._salesOrderService.resetOrderIndex();
        this._salesOrderService.setUpdateOrder('');
      }
      this.tabs.forEach((tab) => {
        tab.isActive = url.indexOf('/' + tab.redirectUrl) !== -1;
        tab.isDisabled = url.indexOf('/new-order') !== -1 && tab.id !== 0;
      });
      const reg = new RegExp('(add-a-style\/style|styles\/[0-9]+)');
      if (reg.test(url)) {
        this.isShowNav = false;
      } else {
        this.isShowNav = true;
      }
    }
  }

  /**
   * isNewOrder
   * @returns {boolean}
   */
  public isNewOrder(): boolean {
    return this.tabs.some((i) => i.isDisabled);
  }

  public isAdmin(): boolean {
    return this._authService.isAdmin();
  }

  /**
   * Get Order Info
   */
  public getOrderInfo(): void {
    if (this.orderId) {
      this._salesOrderService.getOrderInfo(this.orderId)
        .subscribe((resp: ResponseMessage<SalesOrder>) => {
          if (resp.status) {
            this.orderInfo = resp.data.orderInfo;

            const model = {
              customerName: this.orderInfo.customerName,
              customerPoId: this.orderInfo.customerPoId,
              customer2Type: this.orderInfo.customer2Type,
              retailerName: this.orderInfo.retailerName,
              retailerPoId: this.orderInfo.retailerPoId,
              isA2000Order: this.orderInfo.isA2000Order,
              noTrimRequired: this.orderInfo.noTrimRequired,
              // isCustomCutAndSew: this.orderInfo.isCustomCutAndSew,
              isCancelled: this.orderInfo.isCancelled
            };
            this._salesOrderService.updateOrderIndex(model);

            this.isAssignedAM = !!this.orderInfo.csr;
            this.isPublished = this.orderInfo.isPublished;

            // this._salesOrderService.setImports(this.orderInfo.isCustomCutAndSew);
            this._salesOrderService.setA2000(this.orderInfo.isA2000Order);
            this._salesOrderService.setUpdateOrder(this.orderInfo);

            if (!this.isPublished) {
              let canEdit = _.intersection(this.roleCanEditUnpublish,
                this._userContext.currentUser.listRole.map((r) => r.roleName)).length > 0;
              this._salesOrderService.setUpdateStatusOrder(!canEdit);
            } else if (this._userContext.currentUser.listRole.findIndex((i) =>
                i.roleName === 'Account Manager' || i.roleName === 'Customer Service') > -1) {
              this._commonService.getAccountManagerList()
                .subscribe((res: ResponseMessage<BasicCsrInfo[]>) => {
                  if (res.status) {
                    if (res.data.findIndex((i) => i.id === +this.orderInfo.csr) === -1) {
                      this.orderInfo.csr = null;
                    } else {
                      if (!this._authService.isAdmin()) {
                        const userTeamAMList = this._userContext.currentUser.csrAndAmUsers;
                        this._salesOrderService.setUpdateStatusOrder(
                          userTeamAMList.findIndex((i) => i.id === +this.orderInfo.csr) === -1);
                      } else {
                        this._salesOrderService.setUpdateStatusOrder(
                          !this._authService.checkCanModify('Orders'));
                      }
                    }
                  } else {
                    this._toastrService.error(res.errorMessages, 'Error');
                  }
                });
            }

            this.configFriendlyRoutes();
            this.configNavTabs(this._router.url);
          } else {
            if (resp.errorMessages[0].includes('not exist')) {
              this._router.navigate(['not-found']);
            }
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
  }

  /**
   * Event switch tab
   * @param index
   */
  public switchTab(event: Event, index: number): void {
    // Avoid click to tab when click delete on this tab
    if (!event.target['innerText']) {
      return;
    }
    this._router.navigate([this.tabs[index].redirectUrl], {relativeTo: this._activatedRoute});
  }

  public isShowArchiveBtn(): boolean {
    return this._authService.checkAssignedRolesOr([
      'Administrator',
      'Account Supervisor',
      'Accounting'
    ]);
  }

  /**
   * Export Bulk Po
   * @param filterObj
   */
  public exportBulkPo(type: string): void {
    this._salesOrderService.exportBulkPo(this.orderId)
      .subscribe((resp: any) => {
        let data = resp;
        let values = data.headers.get('Content-Disposition');
        let filename = values.split(';')[1].trim().split('=')[1];
        // remove " from file name
        filename = filename.replace(/"/g, '');
        let blob;
        if (type === 'pdf') {
          blob = new Blob([(<any> data).body],
            {type: 'application/pdf'}
          );
        } else if (type === 'xlsx') {
          blob = new Blob([(<any> data).body],
            {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
          );
        }
        FileSaver.saveAs(blob, filename);
      });
  }

  public exportLayout(type: string): void {
    if (!this.orderInfo.totalStyles) {
      this._toastrService
        .error('You must add at least 1 style to the order to generate a Layout report.',
          'Error');
      return;
    }
    let itemsChecked = [this.orderId].toString();

    let params: HttpParams = new HttpParams()
      .set('utcOffset', (-1 * new Date().getTimezoneOffset() / 60).toString())
      .set('itemsChecked', itemsChecked);

    this._orderMainService.exportLayout(params)
      .subscribe((resp: any) => {
        let data = resp;
        let values = data.headers.get('Content-Disposition');
        let filename = values.split(';')[1].trim().split('=')[1];
        // remove " from file name
        filename = filename.replace(/"/g, '');
        let blob;
        if (type === 'pdf') {
          blob = new Blob([(<any> data).body],
            {type: 'application/pdf'}
          );
        } else if (type === 'xlsx') {
          blob = new Blob([(<any> data).body],
            {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
          );
        }
        FileSaver.saveAs(blob, filename);
      });
  }

  /**
   * Publish Order
   */
  public publishOrder(event): void {
    this._salesOrderService.getPublishValidData(this.orderId)
      .subscribe((firstResp) => {
        if (firstResp.status) {
          if (!this.validateBeforePublish(firstResp.data[0])) {
            return;
          }
          this._salesOrderService.publishOrder(this.orderId)
            .subscribe((resp: ResponseMessage<{ id: number }>) => {
              if (resp.status) {
                this.isPublished = true;
                event.preventDefault();
                this._toastrService.success(resp.message, 'Success');
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
      });
  }

  /**
   * syncTractorSupply
   * @param event
   */
  public syncTractorSupply(event): void {
    this._salesOrderService.syncTractorSupply(this.orderId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          const date = new Date(`${resp.data.nextA2000Sync}Z`);
          const msg = `Tractor Supply orders will be synched during the next A2000 import scheduled
           for ${moment(date).format('MMM DD @ h:mmA')}`;
          this._toastrService.success(msg, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * Confirm Revision
   */
  public confirmRevision(event, isRevised): void {
    this._salesOrderService.confirmRevision(this.orderId, isRevised)
      .subscribe((resp: ResponseMessage<{ id: number }>) => {
        if (resp.status) {
          event.preventDefault();
          this.orderInfo.isRevised = isRevised;
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * Archive/Unarchive Order
   */
  public archiveOrder(event, isArchive: boolean): void {
    this._salesOrderService.archiveOrder(this.orderId, isArchive)
      .subscribe((resp: ResponseMessage<{ id: number }>) => {
        if (resp.status) {
          this.orderInfo.isArchived = isArchive;
          this._salesOrderService.setUpdateOrder(this.orderInfo);
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * Delete Order
   */
  public deleteOrder(): void {
    let modalRef = this._modalService.open(ConfirmDialogComponent, {

      keyboard: true
    });
    modalRef.componentInstance
      .message = 'Are you sure you want to delete the selected order?';
    modalRef.componentInstance.title = 'Confirm Order Deletion';

    modalRef.result.then((res: boolean) => {
      if (res) {
        this._salesOrderService.deleteOrder(this.orderId)
          .subscribe((resp: BasicResponse) => {
            if (resp.status) {
              const orderInfo = this._salesOrderService.orderIndex;
              let msg = `Sales order '${orderInfo.customerName} # ${orderInfo.customerPoId}`;
              if (orderInfo.retailerName && orderInfo.retailerPoId) {
                msg += ` (${orderInfo.retailerName} # ${orderInfo.retailerPoId})`;
              } else if (orderInfo.retailerName) {
                msg += ` (${orderInfo.retailerName})`;
              } else if (orderInfo.retailerPoId) {
                msg += ` (# ${orderInfo.retailerPoId})`;
              }
              msg += `' deleted successfully`;
              this._router.navigate(['order-log-v2']);
              this._toastrService.success(msg, 'Success');
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
    });
  }

  public cancelOrder(): void {
    let modalRef = this._modalService.open(ConfirmDialogComponent, {
      keyboard: true
    });
    modalRef.componentInstance
      .message = 'Are you sure you want to cancel this order?';
    modalRef.componentInstance.title = 'Confirm Order Cancellation';

    modalRef.result.then((res: boolean) => {
      if (res) {
        if (this.orderId) {
          this._salesOrderService
            .cancelOrder(this.orderId)
            .subscribe((resp: BasicResponse) => {
              if (resp.status) {
                this.orderInfo.isCancelled = true;
                this._salesOrderService.orderIndex.isCancelled = true;
                this._salesOrderService.setUpdateOrder(this.orderInfo);
                this._toastrService.success(resp.message, 'Success');
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
      }
    });
  }

  public validateBeforePublish(publicValidData) {
    if (!publicValidData) {
      return false;
    }
    this.errorList = [];
    let hasError = false;
    if (typeof publicValidData.accountManagerId !== 'number') {
      this.errorList.push(
        {
          name: 'Order Info',
          description: 'Account Manager',
          url: 'order-info'
        }
      );
      hasError = true;
    }
    if (publicValidData.fulfillmentType === 0) {
      this.errorList.push(
        {
          name: 'Order Info',
          description: 'Order Type',
          url: 'order-info'
        }
      );
      hasError = true;
    }
    if (!publicValidData.isUploadedCustomerPo
      && !this._salesOrderService.orderIndex.customerPoId.toLowerCase().startsWith('smpl')) {
      this.errorList.push(
        {name: 'Order Info', description: 'Customer PO file', url: 'order-info'}
      );
      hasError = true;
    }
    if ([1, 2, 3].indexOf(publicValidData.customer2Type) === -1) {
      this.errorList.push(
        {
          name: 'Order Info',
          description: 'Customer 2',
          url: 'order-info'
        }
      );
      hasError = true;
    }
    // customer type Retailer | Licensor
    if ([2].indexOf(publicValidData.customer2Type) !== -1 && !publicValidData.retailerName) {
      this.errorList.push(
        {
          name: 'Order Info',
          description: 'Retailer Name',
          url: 'order-info'
        }
      );
      hasError = true;
    }
    publicValidData.styles.forEach((s) => {
      let itemType = '';
      switch (s.itemType) {
        case ItemTypes.DOMESTIC:
          itemType = ' (Domestic)';
          break;
        case ItemTypes.OUTSOURCE:
          itemType = ' (Outsource)';
          break;
        case ItemTypes.IMPORTS:
          itemType = ' (Imports)';
          break;
        default:
          itemType = '';
          break;
      }
      this.errorList.push(
        {partnerStyleName: s.partnerStyleName.toUpperCase() + itemType}
      );
      if (publicValidData.customer2Type === 3 && !s.licensorName) {
        this.errorList.push(
          {
            description: 'Licensor Name',
            url: 'styles/' + s.orderDetailId + '/style'
          }
        );
        hasError = true;
      }
      if (s.itemType === 0) {
        this.errorList.push(
          {
            description: 'Item Type',
            url: 'styles/' + s.orderDetailId + '/style'
          }
        );
        hasError = true;
      }
      // item type = (outsource | imports)
      if (s.itemType === 2 || s.itemType === 3) {
        if (!s.factoryName) {
          this.errorList.push(
            {
              description: 'Factory Name',
              url: 'styles/' + s.orderDetailId + '/style'
            }
          );
          hasError = true;
        }
        if (!s.embellishmentProcess || !s.embellishmentProcess.length) {
          this.errorList.push(
            {
              description: 'Specify at least 1 embellishment process',
              url: 'styles/' + s.orderDetailId + '/style'
            }
          );
          hasError = true;
        }
        if (s.requiresTesting === null || s.requiresTesting === undefined) {
          this.errorList.push(
            {
              description: 'Requires Testing',
              url: 'styles/' + s.orderDetailId + '/style'
            }
          );
          hasError = true;
        }
      }
      // ---
      if (typeof s.blankStyleId !== 'number') {
        this.errorList.push(
          {
            description: 'Blank Style #',
            url: 'styles/' + s.orderDetailId + '/style'
          }
        );
        hasError = true;
      }
      if (s.overagesMethod === 0) {
        this.errorList.push(
          {
            description: 'Overages Method',
            url: 'styles/' + s.orderDetailId + '/style'
          }
        );
        hasError = true;
      }
      if (s.sampleQty > 0 && !s.approvalTypeIds) {
        this.errorList.push(
          {
            description: 'Sample Approval Process',
            url: 'styles/' + s.orderDetailId + '/samples'
          }
        );
        hasError = true;
      }
      if (s.sampleQty > 0 && !s.sampleDueDateOnUtc &&
        !s.approvalProcesses.includes('No Sample Needed')) {
        this.errorList.push(
          {
            description: 'Sample Due Date',
            url: 'styles/' + s.orderDetailId + '/samples'
          }
        );
        hasError = true;
      }
      if (!s.neckLabelId) {
        this.errorList.push(
          {
            description: 'Neck Label',
            url: 'styles/' + s.orderDetailId + '/neck-labels'
          }
        );
      }
      if (!s.isValidPrintLocation) {
        this.errorList.push(
          {
            description: 'Specify at least 1 print location',
            url: 'styles/' + s.orderDetailId + '/print-location'
          }
        );
        hasError = true;
      }
      // if (s.isValidPrintLocation && s.printLocationImages.length) {
      //   s.printLocationImages.forEach((p) => {
      //     if (!p.imageUrl) {
      //       this.errorList.push(
      //         {
      //           description: p.locationName + ' image',
      //           url: 'styles/' + s.orderDetailId + '/print-location/' + s.printLocationId
      //         }
      //       );
      //     }
      //   });
      // }
      // if (s.neckLabelId && !s.neckLabelImageUrl) {
      //   this.errorList.push(
      //     {
      //       description: 'Neck Label image',
      //       url: 'styles/' + s.orderDetailId + '/neck-labels'
      //     }
      //   );
      // }
      if (!s.isValidTrim) {
        this.errorList.push(
          {
            description: 'Specify at least 1 trim, or \'No Trims Required\'',
            url: 'styles/' + s.orderDetailId + '/trims'
          }
        );
        hasError = true;
      }
      if (!s.previewImageUrl) {
        this.errorList.push(
          {
            description: 'Style Preview Image',
            url: 'styles/' + s.orderDetailId + '/style'
          }
        );
        hasError = true;
      }
      if (s.styleType === null) {
        this.errorList.push(
          {
            description: 'Style Type',
            url: 'styles/' + s.orderDetailId + '/style'
          }
        );
        hasError = true;
      }
      if (s.topPps.length) {
        const errDescribe = ['', 'Billing fields', 'Ship from fields', 'Ship to fields'];
        s.topPps.forEach((t) => {
          this.errorList.push(
            {
              description: errDescribe[t.field],
              url: 'styles/' + s.orderDetailId + '/tops/' + t.topPpType
            }
          );
        });
      }
    });
    if (publicValidData.styles.length === 0) {
      this.errorList.push(
        {
          name: 'Order Info',
          description: 'Order must have at least 1 order item',
          url: 'styles'
        }
      );
      hasError = true;
    }
    if (hasError) {
      this._salesOrderService.hasErBeforePublish = true;
      setTimeout(() => {
        let erPanelE = document.getElementsByClassName('publish-error');
        if (erPanelE.length) {
          this.errorListHeight = erPanelE[0].getBoundingClientRect().height + 20;
        }
      });
      return false;
    }
    this._salesOrderService.hasErBeforePublish = false;
    let filterErr = this.errorList.filter((e) => e.partnerStyleName);
    if (filterErr.length === this.errorList.length) {
      this.errorList = [];
      this.errorListHeight = 0;
    }
    return true;
  }

  public goToErPage(url) {
    if (url.includes('styles')) {
      this._router.navigate(['order-log-v2', this.orderId, 'styles']);
    }
    setTimeout(() => {
      this._router.navigate([url], {relativeTo: this._activatedRoute});
      setTimeout(() => {
        this.scrollTo(this._utilService.scrollElm, this.errorListHeight + 100, 300);
      });
    });
  }

  public scrollTo(element: any, to: number, duration: number) {
    if (duration <= 0) {
      return;
    }
    let difference = to - element.scrollTop;
    let perTick = difference / duration * 10;

    setTimeout(() => {
      element.scrollTop = element.scrollTop + perTick;
      if (element.scrollTop === to) {
        return;
      }
      this.scrollTo(element, to, duration - 10);
    }, 10);
  }

  public ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this.assignedSub.unsubscribe();
    this.updatedSub.unsubscribe();
    this.activatedRouterSub.unsubscribe();
    this.updateStyleNum.unsubscribe();
    this._localStorageService.remove('StyleMain_ItemType');
    this._salesOrderService.hasErBeforePublish = undefined;
    this._salesOrderService.resetOrderIndex();
    this.configFriendlyRoutes(true);
  }
}
