import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  PlatformLocation
} from '@angular/common';

import {
  ActivatedRoute,
  NavigationEnd,
  Router
} from '@angular/router';

// Services
import {
  SalesOrderService
} from '../../../sales-order.service';
import {
  TrimsService
} from './trims.service';
import {
  ToastrService
} from 'ngx-toastr';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../../../shared/services/auth/auth.service';
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import * as _ from 'lodash';
import {
  StylesInfoService
} from '../styles-info.service';

// Interfaces
import {
  BasicResponse,
  ResponseMessage
} from '../../../../../shared/models/respone.model';
import {
  TrimOrder
} from './trims.model';
import {
  TrimDetail
} from './+trims-detail';
import {
  SelectTrimsComponent
} from './modules';
import { Subscription } from 'rxjs/Subscription';
import {
  ConfirmDialogComponent
} from '../../../../../shared/modules/confirm-dialog/confirm-dialog.component';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'trims',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'trims.template.html',
  styleUrls: [
    'trims.style.scss'
  ]
})
export class TrimsComponent implements OnInit, OnDestroy {
  public tabs: any = [];
  public orderIndex;
  public styleIndex;
  public trimsData: TrimOrder;
  public routeSub: Subscription;
  public currentPageUrl = '';
  public count = 0;
  public previousUrl: string = '';

  public isPageReadOnly = false;
  public isStyleReadOnly = false;
  public isOrderArchived = false;
  public isOrderCancelled = false;
  public isStyleCancelled = false;
  private _subOrderStatus: Subscription;
  private _subOrderData: Subscription;
  private _subStyleStatus: Subscription;

  constructor(private _activatedRoute: ActivatedRoute,
              private _router: Router,
              private _breadcrumbService: BreadcrumbService,
              private _toastrService: ToastrService,
              private _modalService: NgbModal,
              private _trimsService: TrimsService,
              private _authService: AuthService,
              private _stylesInfoService: StylesInfoService,
              private _salesOrderService: SalesOrderService) {
    this.orderIndex = this._salesOrderService.orderIndex;
    this.styleIndex = this._stylesInfoService.styleIndex;
    this.routeSub = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        const regex = new RegExp('^/order-log-v2/[0-9A-Za-z]+/styles/[0-9A-Za-z]+/trims');
        if (regex.test(val.urlAfterRedirects)) {
          this.currentPageUrl = val.urlAfterRedirects;
          this.getOrderData();
        }
      }
    });
  }

  public ngOnInit(): void {
    this._subOrderStatus = this._salesOrderService.getUpdateStatusOrder().subscribe((status) => {
      this.isPageReadOnly = status;
    });
    this._subOrderData = this._salesOrderService.getUpdateOrder().subscribe((orderData) => {
      this.isOrderArchived = orderData.isArchived;
      this.isOrderCancelled = orderData.isCancelled;
    });
    this._subStyleStatus = this._stylesInfoService.getUpdateStyle().subscribe((styleData) => {
      this.isStyleCancelled = styleData.isCancelled;
    });
  }

  /**
   * Get current order info if has
   */
  public getOrderData(): void {
    if (this.orderIndex.styleId) {
      this._trimsService.getStyleTrimFromStyle(this.orderIndex.styleId)
        .subscribe((resp: ResponseMessage<TrimOrder>) => {
          if (resp.status) {
            this.trimsData = resp.data;
            if (!resp.data.activeTrim) {
              this._router.navigate([
                'order-log-v2',
                this.orderIndex.orderId,
                'styles',
                this.orderIndex.styleId,
                'trims'
              ]);
              return;
            }
            this.tabs = [];
            [resp.data.activeTrim, ...resp.data.remainTrims].forEach((trim) => {
              this.tabs.push({
                id: trim.id,
                name: trim.trimName,
                isUseForAllStyles: trim.isUseForAllStyles,
                baseCTrimId: trim.baseCTrimId,
                redirectUrl: trim.id,
                isActive: false
              });
            });
            this.tabs = _.sortBy(this.tabs, 'name');
            this.configChildNavTabs(this.currentPageUrl);
            this._stylesInfoService.getUpdateStyle().subscribe((data) => {
              if (data) {
                if (this.currentPageUrl.indexOf('/trims/') === -1 && this.tabs.length
                  && !this._stylesInfoService.styleIndex.noTrimRequired) {
                  this._router.navigate([this.tabs[0].redirectUrl || this.tabs[0].cTrimId],
                    {
                      relativeTo: this._activatedRoute,
                      replaceUrl: true
                    }
                  );
                }
              }
            });
            this._stylesInfoService.styleIndex.trimsList = this.tabs;
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
  }

  /**
   * configureBreadcrumbName
   * @param {string} name
   */
  public configureBreadcrumbName(name: string): void {
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/order-log-v2/[0-9A-Za-z]+/styles/[0-9A-Za-z]+/trims/.*$',
        name);
  }

  /**
   * configChildNavTabs
   * @param url
   */
  public configChildNavTabs(url): void {
    let isActive = false;
    let trimsId = url.split('/trims/');
    if (trimsId.length === 2) {
      trimsId = +trimsId[1];
    } else {
      trimsId = undefined;
    }
    if (trimsId > 0) {
      this.tabs.forEach((tab) => {
        tab.isActive = trimsId === tab.id || trimsId === tab.cTrimId;
        if (tab.isActive) {
          isActive = true;
          this.configureBreadcrumbName(tab.name);
        }
      });
      if (!isActive) {
        this._router.navigate([
          'order-log-v2',
          this.orderIndex.orderId,
          'styles',
          this.orderIndex.styleId,
          'trims'
        ]);
      }
    }
  }

  /**
   * switchTab
   * @param {Event} event
   * @param {number} index
   */
  public switchTab(event: Event, index: number): void {
    // this.tabs.forEach((i) => i.isActive = false);
    // this.tabs[index].isActive = true;
    // this.configureBreadcrumbName(this.tabs[index].name);
    this._router.navigate([this.tabs[index].redirectUrl || this.tabs[index].cTrimId],
      {
        relativeTo: this._activatedRoute,
        replaceUrl: true
      });
  }

  /**
   * selectTrims
   */
  public selectTrims(): void {
    let modalRef = this._modalService.open(SelectTrimsComponent, {
      size: 'lg',
      keyboard: true,
      backdrop: 'static',
      windowClass: 'eta-sm'
    });
    let list: any = [];
    const tabGroup: any = _.groupBy(this.tabs, 'baseCTrimId');
    for (let prop of Object.keys(tabGroup)) {
      let model: any = Object.assign({}, tabGroup[prop][0]);
      if (tabGroup[prop].length > 1) {
        model.qty = tabGroup[prop].length;
        const index = model.name.search(/\s\([0-9]\)/);
        if (index > -1) {
          model.name = model.name.slice(0, index);
        }
        list.push(model);
      } else {
        model.qty = 1;
        list.push(model);
      }
    }
    modalRef.componentInstance.trimsList = list;
    modalRef.componentInstance.noTrimRequired = this._stylesInfoService
      .styleIndex.noTrimRequired;

    modalRef.result.then((res) => {
      if (res.status) {
        const changeTrimFunc = () => {
          if (!this._stylesInfoService.styleIndex.noTrimRequired) {
            let addTrims = () => {
              // const currentTab = this.tabs.find((tab) => tab.isActive);
              const newTabs: any = [];
              if (res.trimsList && res.trimsList.length) {
                res.trimsList.forEach((item) => {
                  newTabs.push({
                    id: item.id,
                    cTrimId: item.cTrimId || item.baseCTrimId,
                    isUseForAllStyles: item.isUseForAllStyles,
                    name: item.name,
                    qty: item.qty,
                    newQty: item.newQty,
                    isChangeQty: item.isChangeQty,
                    redirectUrl: item.id,
                    isActive: false
                  });
                });
                const newModel: any = newTabs.filter((i) => !i.id && !i.isChangeQty).map((i) => {
                  return {
                    cTrimId: i.cTrimId,
                    qty: i.qty
                  };
                });
                const changeModel: any = newTabs.filter((i) => i.id && i.isChangeQty && i.newQty)
                  .map((i) => {
                    return {
                      cTrimId: i.cTrimId,
                      oldQty: i.qty,
                      newQty: i.newQty
                    };
                  });
                const createNewTrim = () => {
                  const redirectFirstTab = () => {
                    if (this.tabs.length) {
                      this.tabs[0].isActive = true;
                      this.configureBreadcrumbName(this.tabs[0].name);
                      this._router.navigate([
                        'order-log-v2',
                        this.orderIndex.orderId,
                        'styles',
                        this.orderIndex.styleId,
                        'trims',
                        this.tabs[0].redirectUrl || this.tabs[0].cTrimId
                      ]);
                    } else {
                      this._router.navigate([
                        'order-log-v2',
                        this.orderIndex.orderId,
                        'styles',
                        this.orderIndex.styleId,
                        'trims'
                      ]);
                    }
                  };
                  if (newModel && newModel.length) {
                    this._trimsService.createStyleTrim(this.orderIndex.styleId, newModel)
                      .subscribe((createResp: ResponseMessage<TrimDetail[]>) => {
                        if (createResp.status) {
                          this.getOrderData();
                          // revalidate before publish
                          if (this._salesOrderService.hasErBeforePublish) {
                            this._salesOrderService.reValidate(this.orderIndex.orderId);
                          }
                        } else {
                          this._toastrService.error(createResp.errorMessages, 'Error');
                        }
                      });
                  } else {
                    redirectFirstTab();
                  }
                };
                if (changeModel && changeModel.length) {
                  this._trimsService
                    .updateStyleTrim(this.orderIndex.styleId, changeModel)
                    .subscribe((updateResp: ResponseMessage<TrimDetail[]>) => {
                      if (updateResp.status) {
                        if (newModel && newModel.length) {
                          createNewTrim();
                        } else {
                          this.getOrderData();
                        }
                      } else {
                        this._toastrService.error(updateResp.errorMessages, 'Error');
                      }
                    });
                } else {
                  createNewTrim();
                }
              } else {
                this._router.navigate([
                  'order-log-v2',
                  this.orderIndex.orderId,
                  'styles',
                  this.orderIndex.styleId,
                  'trims'
                ]);
              }
            };
            if (res.deletedTrimsList && res.deletedTrimsList.length) {
              let newDelTrimList: any = [];
              res.deletedTrimsList.forEach((delTrim) => {
                let isAdd = false;
                for (let prop of Object.keys(tabGroup)) {
                  if (tabGroup[prop].some((i: any) => i.id === delTrim.id)) {
                    newDelTrimList = [...newDelTrimList, ...tabGroup[prop]];
                    isAdd = true;
                    return;
                  }
                }
                if (!isAdd) {
                  newDelTrimList.push(delTrim);
                }
              });
              let modalRef2 = this._modalService.open(ConfirmDialogComponent, {
                keyboard: true
              });
              modalRef2.componentInstance
                .message = `Trim configuration data for
          '${newDelTrimList.map((i) => i.name).join(`', '`)}'
          will be deleted. Continue?`;
              modalRef2.componentInstance.title = 'Confirm Trims Deletion';

              modalRef2.result.then((status) => {
                if (status) {
                  this._trimsService.deleteTrimDetail(this.orderIndex.orderId,
                    this.orderIndex.styleId, newDelTrimList.map((i) => i.id))
                    .subscribe((delResp: ResponseMessage<BasicResponse>) => {
                      if (delResp.status) {
                        newDelTrimList.forEach((trim) => {
                          let index = this._stylesInfoService.styleIndex.trimsList
                            .findIndex((i) => i.name === trim.name);
                          if (index > -1) {
                            this._stylesInfoService.styleIndex.trimsList.splice(index, 1);
                          }
                        });
                        addTrims();
                        this._toastrService.success(delResp.message, 'Success');
                      } else {
                        this._toastrService.error(delResp.errorMessages, 'Error');
                      }
                    });
                } else {
                  this.selectTrims();
                }
              }, (err) => {
                // empty
              });
            } else {
              addTrims();
            }
          } else {
            this.tabs = [];
            this._router.navigate([
              'order-log-v2',
              this.orderIndex.orderId,
              'styles',
              this.orderIndex.styleId,
              'trims'
            ]);
          }
        };
        setTimeout(() => {
          if (res.noTrimRequired !== this.styleIndex.noTrimRequired) {
            this._salesOrderService
              .updateNoTrimRequired(null, this.orderIndex.styleId, res.noTrimRequired)
              .subscribe((resp: BasicResponse) => {
                if (resp.status) {
                  this.styleIndex.noTrimRequired = res.noTrimRequired;
                  this._stylesInfoService.styleIndex.noTrimRequired = res.noTrimRequired;
                  changeTrimFunc();
                  this._toastrService.success(resp.message, 'Success');
                  // revalidate before publish
                  if (this._salesOrderService.hasErBeforePublish) {
                    this._salesOrderService.reValidate(this.orderIndex.orderId);
                  }
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
          } else {
            changeTrimFunc();
          }
        }, (err) => {
          // empty
        });
      }
    });
  }

  public ngOnDestroy(): void {
    this.routeSub.unsubscribe();
    this.previousUrl = '';
    this._subOrderStatus.unsubscribe();
    this._subOrderData.unsubscribe();
    this._subStyleStatus.unsubscribe();
  }
}
