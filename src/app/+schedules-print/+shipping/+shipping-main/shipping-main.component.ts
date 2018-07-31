import {
  Component,
  OnInit,
  ViewEncapsulation,
  AfterViewChecked,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import 'rxjs/add/operator/takeUntil';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';
import {
  NgbDropdownConfig,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import * as moment from 'moment';

// Services
import {
  CommonService
} from '../../../shared/services/common';
import * as FileSaver from 'file-saver';
import {
  ShippingMainService
} from './shipping-main.service';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  Util
} from '../../../shared/services/util';
import { AuthService } from '../../../shared/services/auth';
import {
  StyleService
} from '../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+style/style.service';
import { UserContext } from '../../../shared/services/user-context';
import {
  ShippingService
} from '../shipping.service';
import { ProgressService } from '../../../shared/services/progress';
import {
  EditUserService
} from '../../../+user-management/+edit-user/edit-user.service';
import {
  OrderMainService
} from '../../../+order-log-v2/+order-main/order-main.service';

// Interfaces
import {
  ResponseMessage,
  TaskStatus
} from '../../../shared/models';
import { Subscription } from 'rxjs/Subscription';
import {
  UploaderTypeComponent
} from '../../../shared/modules/uploader-type';
import {
  UploadedType
} from '../../../+order-log-v2/+sales-order';
import {
  StyleUploadedType
} from '../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+style';
import {
  AccessControlType
} from '../../../+role-management/role-management.model';
import {
  ColConfigKey,
  HourOffset
} from '../../schedules-print.model';
import { ItemTypes } from '../../../+order-log-v2/+sales-order/+order-styles/order-styles.model';
import { ActualToShipComponent } from '../../../+order-log-v2/+order-main/modules';
import { UpdateActualShipType } from '../../../+order-log-v2/order-log.model';
import { ShippingTab } from '../shipping.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'shipping-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'shipping-main.template.html',
  styleUrls: [
    'shipping-main.style.scss'
  ]
})
export class ShippingMainComponent implements OnInit,
                                              AfterViewChecked,
                                              OnDestroy {
  public tableData = {
    totalRecord: 0,
    data: []
  };
  public fixedHeader = false;
  public isFilter = false;

  public header;
  public cloneHeader;
  public fontSizeData = [
    '8px',
    '9px',
    '10px',
    '11px',
    '12px'
  ];
  public myConfigStyle = {
    'font-size': '11px'
  };
  public myConfigStyleHeader = {
    'font-size': '11px'
  };
  public fontSizeIndex = [
    'font-size-8',
    'font-size-9',
    'font-size-10',
    'font-size-11',
    'font-size-12'
  ];
  public fontSizeClass = {
    'font-size-8': false,
    'font-size-9': false,
    'font-size-10': false,
    'font-size-11': false,
    'font-size-12': false
  };
  public styleUploadedType = StyleUploadedType;
  public uploadedType = UploadedType;
  public activatedSub: Subscription;

  public isPageReadOnly = false;
  public accessControlType = AccessControlType;
  public shippingFuncPermissions = [];

  public showHideColumns = [];
  public isCheckedAll = true;
  public columns = [];
  public isShowAllColumns = false;
  public colConfigKey = ColConfigKey;
  public colProp = [
    'Retailer PO',
    'Customer PO',
    'Customer',
    'Style',
    '# Units (Style)',
    '# Units (PO)',
    'Start Date',
    'Cancel Date',
    'Last Date to Ship Non-Expedited',
    'Ready to Ship',
    'Actual Ship Date',
    'Shipment Type'
  ];
  public totalColspan = {
    first: 4,
    second: 7
  };
  public type;
  public taskStatus = TaskStatus;
  public itemTypes = ItemTypes;
  public isChangePopup = false;
  public isOpenChangePopup = false;

  private _maxWidthTable: number;
  private _isEsc = false;

  constructor(private _router: Router,
              private _modalService: NgbModal,
              private _commonService: CommonService,
              private _authService: AuthService,
              private _localStorageService: LocalStorageService,
              private _shippingMainService: ShippingMainService,
              private _styleService: StyleService,
              private _orderMainService: OrderMainService,
              private _toastrService: ToastrService,
              private _utilService: Util,
              private _userContext: UserContext,
              private _changeDetectorRef: ChangeDetectorRef,
              private _activatedRoute: ActivatedRoute,
              private _shippingSv: ShippingService,
              private _ngbDropdownConfig: NgbDropdownConfig,
              private _progressService: ProgressService,
              private _editUserService: EditUserService) {
    this._ngbDropdownConfig.autoClose = false;
    this.activatedSub = this._activatedRoute.parent.params
      .subscribe((params: { id: number }) => {
        let id = Number(params.id);
        const preType = this.type;
        this.type = isNaN(id) ? undefined : id;
        if (preType && preType !== id) {
          this.onFilter(this.isFilter);
        }

        let fontSize = this._localStorageService.get('fontSize_Shipping') as string;
        if (fontSize) {
          const modal = {'font-size': fontSize};
          Object.assign(this.myConfigStyle, modal);
          const fontSizeNumber = +fontSize.slice(0, fontSize.length - 2);
          this.fontSizeClass[`font-size-${fontSizeNumber}`] = true;
        } else {
          this._localStorageService.set('fontSize_Shipping', this.myConfigStyle['font-size']);
        }

        // Config columns
        let colSchedulesConfigs = this._userContext.currentUser.schedulesColumnConfigs;
        const shippingConfig = this._userContext.currentUser
          .permissions.filter((i) => i.type === 15);
        if (colSchedulesConfigs && colSchedulesConfigs.length) {
          const colConfigs = colSchedulesConfigs
            .find((i) => i.key === this.colConfigKey.SchedulesShipScheduled);
          if (!colConfigs || colConfigs.value.length !== shippingConfig.length) {
            this.showHideColumns = shippingConfig;
          } else {
            colConfigs.value.forEach((i) => {
              let col = shippingConfig.find((o) => o.id === i.id);
              if (col) {
                Object.assign(i, col);
              }
            });
            this.showHideColumns = colConfigs.value;
          }
          const storedColumnConfig = this._userContext.currentUser
            .permissions.filter((i) => i.type === 15);
          if (this.showHideColumns.length < storedColumnConfig.length) {
            let newColIndex;
            const newColConfig = storedColumnConfig
              .find((i, index) => {
                if (!this.showHideColumns.some((o) => o.name === i.name)) {
                  newColIndex = index;
                  return true;
                } else {
                  return false;
                }
              });
            this.showHideColumns.push(newColConfig);
          }
          this.showHideColumns.forEach((item) => {
            const sameObj = this._userContext
              .currentUser.permissions.find((i) => i.name === item.name);
            if (sameObj) {
              item.isModify = sameObj.isModify;
            }
          });
        } else {
          this.showHideColumns = this._userContext.currentUser
            .permissions.filter((i) => i.type === 15);
        }

        this.showHideColumns.forEach((item) => {
          this.columns.push(Object.assign({}, item));
        });
        this.isCheckedAll = this.showHideColumns.every((i) => i.isView === true);
        this.isShowAllColumns = !!this._localStorageService.get('isShowAll_SchedulesShipScheduled');
        this.checkColspanChange();

        // Prevent user navigate to another page when data not loaded yet
        const backdropElm = document.getElementById('backdrop');
        if (backdropElm && backdropElm.className.includes('none')) {
          backdropElm.className = '';
          this._changeDetectorRef.markForCheck();
        }
      });
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event) {
    this._maxWidthTable = null;
    setTimeout(() => {
      this.updateHeader();
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  public ngOnInit(): void {
    this.initialPermission();
    this.getCommonData();
  }

  public checkColspanChange() {
    if (this.isShowAllColumns) {
      return;
    }
    const leftCol = this.colProp.slice(0, 4);
    const rightCol = this.colProp.slice(5, 12);
    this.totalColspan = { first: 4, second: 7 };
    leftCol.forEach((name) => {
      const col = this.columns.find((i) => i.description === name);
      if (col && !col.isView) {
        this.totalColspan.first--;
      }
    });
    rightCol.forEach((name) => {
      const col = this.columns.find((i) => i.description === name);
      if (col && !col.isView) {
        this.totalColspan.second--;
      }
    });
    this._changeDetectorRef.markForCheck();
  }

  public trackByFn(index, item) {
    return index; // or item.id
  }

  public initialPermission(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Schedules.Shipping');
    // Get Print Function Permission from user info
    const funcPermission = this._userContext.currentUser.permissions
      .filter((i) => i.type === this.accessControlType.Functions);
    this.shippingFuncPermissions = funcPermission
      .filter((i) => i.name.includes('Schedules.Shipping'));
    // -------
  }

  public ngAfterViewChecked() {
    // Check if the table size has changed
    // if (this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
    //   this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
    //   setTimeout(() => {
    //     this.table.recalculate();
    //   }, 200);
    // }
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    // empty
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public updateHeader(): void {
    const dataTableList: NodeListOf<Element> = document.querySelectorAll('#table .shipping-table');
    if (dataTableList && dataTableList.length) {
      let lastTable = dataTableList[0];
      this._maxWidthTable = 0;
      [].forEach.call(dataTableList, (table, index) => {
        this._maxWidthTable = table.offsetWidth > this._maxWidthTable
          ? table.offsetWidth : this._maxWidthTable;
        if (table.getBoundingClientRect().top < 150) {
          lastTable = table;
        }
      });
      this.header = lastTable;
      this.myConfigStyleHeader = {
        ...this.myConfigStyleHeader,
        width: `${lastTable['offsetWidth']}px`
      };
      this.cloneHeader = this.header.cloneNode(true);
    }
  }

  public getMaxWidthTable(): string {
    return this._maxWidthTable > 0 ? `${this._maxWidthTable}px` : 'auto';
  }

  @HostListener('window:scroll', ['$event'])
  public onAppScroll(event: any) {
    let fixedHeader = document.getElementById('header');
    if (!fixedHeader) {
      return;
    }
    if (event) {
      while (fixedHeader.firstChild) {
        fixedHeader.removeChild(fixedHeader.firstChild);
      }
    }
    if (fixedHeader && !fixedHeader.hasChildNodes()) {
      this.updateHeader();
    }
    if (event.target.scrollingElement.scrollTop >= 100
      && this.header.getBoundingClientRect().top < 0
      && fixedHeader && !fixedHeader.hasChildNodes()) {
      fixedHeader.appendChild(this.cloneHeader);
    } else if ((this.header.getBoundingClientRect().top >= 0)
      || (event.target.scrollingElement.scrollTop < 300
        && fixedHeader && fixedHeader.hasChildNodes())) {
      while (fixedHeader.firstChild) {
        fixedHeader.removeChild(fixedHeader.firstChild);
      }
    }
  }

  public onScrollX(event): void {
    this.myConfigStyleHeader = {
      ...this.myConfigStyleHeader,
      left: this.header ? `${this.header.getBoundingClientRect().left}px` : 'auto',
      right: this.header ? `${this.header.getBoundingClientRect().right}px` : 'auto'
    };
  }

  public changeFontSize(fontSize) {
    // deactive previous font size
    let fontSizeId = this.fontSizeData.indexOf(this.myConfigStyle['font-size']);
    this.fontSizeClass[this.fontSizeIndex[fontSizeId]] = false;

    // active new font size
    this.myConfigStyle['font-size'] = fontSize;
    this.myConfigStyleHeader['font-size'] = fontSize;
    this._localStorageService.set('fontSize_Shipping', fontSize);
    fontSizeId = this.fontSizeData.indexOf(fontSize);
    this.fontSizeClass[this.fontSizeIndex[fontSizeId]] = true;
    setTimeout(() => {
      this.updateHeader();
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  public getMinWidthDependFontSize(minWidth: number): string {
    const fontSize = +this.myConfigStyle['font-size']
      .slice(0, this.myConfigStyle['font-size'].length - 2);
    return `${minWidth - (11 - fontSize) * 3}px`;
  }

  /**
   * canModifyCols
   * @param {string} colName
   * @returns {boolean}
   */
  public canModifyCols(colName: string): boolean {
    if (!this._authService.checkCanModify('Orders')) {
      return false;
    }
    const colObj = this.showHideColumns.find((i) => i.description === colName);
    if (colObj) {
      return colObj.isModify;
    }
    return false;
  }

  /**
   * onChangeActualToShipDate
   * @param row
   * @param rowDetail
   */
  public onChangeActualToShipDate(shippingData, row, detail, colDetail, rowIndex): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Actual Ship Date')
        && !row.isCancelled && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(ActualToShipComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'super-lg'
        });
        modalRef.componentInstance.responseType = this.type === ShippingTab.Scheduled ?
          UpdateActualShipType.SchedulesShipScheduled : UpdateActualShipType.SchedulesShipComplete;
        modalRef.componentInstance.orderFilterType = 0;
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.styleList = row.styles
          .filter((style) => !style.isCancelled);
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);

        modalRef.result.then((res) => {
          this.isChangePopup = false;
          const removeOrder = () => {
            shippingData.orders.splice(rowIndex, 1);
            this.tableData.totalRecord--;
          };
          if (res) {
            if (res.date === shippingData.date) {
              if (res.orders && res.orders.length) {
                Object.assign(row, res.orders[0]);
              }
            } else {
              const groupDate = this.tableData.data.find((i) => i.date === res.date);
              if (groupDate) {
                removeOrder();
                if (res.orders && res.orders.length) {
                  groupDate.orders.unshift(res.orders[0]);
                }
              }
            }
          } else {
            removeOrder();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        // this.isChangePopup = false;
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public goToOrderInfo(orderId: number): void {
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    this._router.navigate([
      'order-log-v2',
      orderId
    ]);
  }

  public goToStyle(orderId: number, styleId: number): void {
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    this._router.navigate([
      'order-log-v2',
      orderId,
      'styles',
      styleId
    ]);
  }

  public goToPrintLocation(orderId: number,
                           styleId: number,
                           printLocationId: number,
                           neckLabelId: number): void {
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    if (!neckLabelId) {
      this._router
        .navigate([
          'order-log-v2',
          orderId,
          'styles',
          styleId,
          'print-location',
          printLocationId
        ]);
    } else {
      this._router
        .navigate([
          'order-log-v2',
          orderId,
          'styles',
          styleId,
          'neck-labels'
        ]);
    }
  }

  public openUploader(orderDetailId: number, type: number, title: string): void {
    this.isChangePopup = true;
    setTimeout(() => {
      this.isOpenChangePopup = false;
      let fileList = [];
      this._styleService.getStyleFiles(orderDetailId)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            fileList = Object.assign([], resp.data.filter((i) => i.type === type));
            let modalRef = this._modalService.open(UploaderTypeComponent, {
              size: 'lg',
              keyboard: false,
              backdrop: 'static',
              windowClass: 'super-lg'
            });
            modalRef.componentInstance.title = title;
            Object.assign(modalRef.componentInstance.uploadOptions, {
              id: '',
              isReadOnly: true,
              uploadType: type === this.styleUploadedType.ProductionPO
                ? this.uploadedType.CutTickets : '',
              fileList,
              fileType: type
            });
            modalRef.result.then((res) => {
              this.isChangePopup = false;
            }, (err) => {
              this.isChangePopup = false;
            });
          } else {
            this.isChangePopup = false;
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }, 100);
  }

  /**
   * openShipmentUploader
   * @param {number} orderId
   */
  public openShipmentUploader(orderId: number, styleId: number): void {
    this.isChangePopup = true;
    setTimeout(() => {
      this.isOpenChangePopup = false;
      let fileList = [];
      this._orderMainService.getShipmentFileByOrderId(orderId, styleId)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            fileList = Object.assign([], resp.data);
            let modalRef = this._modalService.open(UploaderTypeComponent, {
              size: 'lg',
              keyboard: false,
              backdrop: 'static',
              windowClass: 'super-lg'
            });
            modalRef.componentInstance.title = 'Shipment';
            modalRef.componentInstance.selectTypeData = [
              {
                id: 1,
                name: ''
              }
            ];
            Object.assign(modalRef.componentInstance.uploadOptions, {
              id: '',
              isReadOnly: true,
              fileList
            });
            modalRef.result.then((res) => {
              this.isChangePopup = false;
            }, (err) => {
              this.isChangePopup = false;
            });
          } else {
            this.isChangePopup = false;
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }, 100);
  }

  public showInput(event): void {
    if (!this.isPageReadOnly) {
      let inputE = event.getElementsByTagName('input');
      let valueE = event.getElementsByTagName('span');

      if (inputE.length) {
        if (inputE[0].hidden) {
          valueE[0].hidden = true;
          inputE[0].hidden = false;
          inputE[0].focus();
          inputE[0].select();
        }
      }
    }
  }

  public hiddenInput(event): void {
    let inputE = event.getElementsByTagName('input');
    let valueE = event.getElementsByTagName('span');

    if (inputE.length) {
      this._isEsc = true;
      inputE[0].hidden = true;
      valueE[0].hidden = false;
    }
  }

  public exportShipping(exportType: string) {
    if (exportType === 'pdf') {
      let curDate = new Date();
      curDate.setHours(-HourOffset, 0, 0);
      let params: HttpParams = new HttpParams()
        .set('shipDateFromOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'))
        .set('type', this.type.toString())
        .set('hourOffset', HourOffset.toString());

      const filterModel = this._shippingMainService.searchObj;
      if (filterModel) {
        params = params.set('customerPoId', filterModel['customerPoId']
          ? filterModel['customerPoId'].toString() : null);
        switch (filterModel['printDate']) {
          case 'Yesterday':
            curDate.setDate(curDate.getDate() - 1);
            params = params.set('shipDateFromOnUtc', moment(curDate)
              .format('YYYY-MM-DDTHH:mm:ss'));
            curDate.setHours(23 - HourOffset, 59, 59);
            params = params.set('shipDateToOnUtc', moment(curDate)
              .format('YYYY-MM-DDTHH:mm:ss'));
            break;
          case 'Today':
            curDate.setHours(23 - HourOffset, 59, 59);
            params = params.set('shipDateToOnUtc', moment(curDate)
              .format('YYYY-MM-DDTHH:mm:ss'));
            break;
          case 'This Week':
            let thisWeek = [];
            let dOW = curDate.getDay();

            for (let i = 1; i < 8; i++) {
              curDate = new Date();
              curDate.setDate(curDate.getDate() - (dOW - i));
              thisWeek.push(curDate);
            }

            let startDate = new Date(thisWeek[0].getTime());
            startDate.setHours(-HourOffset, 0, 0);
            let endDate = new Date(thisWeek[6].getTime());
            endDate.setHours(23 - HourOffset, 59, 59);
            params = params.set('shipDateFromOnUtc', moment(startDate)
              .format('YYYY-MM-DDTHH:mm:ss'));
            params = params.set('shipDateToOnUtc', moment(endDate)
              .format('YYYY-MM-DDTHH:mm:ss'));
            break;
          case 'Custom':
            let dateFrom = new Date(filterModel['shipDateFromOnUtc']);
            let dateTo = new Date(filterModel['shipDateToOnUtc']);
            dateFrom.setHours(-HourOffset, 0, 0);
            dateTo.setHours(23 - HourOffset, 59, 59);
            params = params.set('shipDateFromOnUtc',
              moment(dateFrom).format('YYYY-MM-DDTHH:mm:ss'));
            params = params.set('shipDateToOnUtc',
              moment(dateTo).format('YYYY-MM-DDTHH:mm:ss'));
            break;
          default:
            let sixDays = new Date();
            sixDays.setDate(curDate.getDate() + 6);
            sixDays.setHours(23 - HourOffset, 59, 59);
            params = params.set('shipDateToOnUtc', moment(sixDays)
              .format('YYYY-MM-DDTHH:mm:ss'));
            break;
        }
      }

      this._shippingMainService.exportTscShipping(params)
        .subscribe((resp: any): void => {
          if (resp.status) {
            let dataRes = resp;
            let values = dataRes.headers.get('Content-Disposition');
            let filename = values.split(';')[1].trim().split('=')[1];
            // remove " from file name
            filename = filename.replace(/"/g, '');
            let blob;
            if (exportType === 'pdf') {
              blob = new Blob([(<any> dataRes).body],
                {type: 'application/pdf'}
              );
            }
            // else if (exportType === 'xlsx') {
            //   blob = new Blob([(<any> data).body],
            //     {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
            //   );
            // }
            FileSaver.saveAs(blob, filename);
          }
        });
    }
  }

  public getIsModifyFunc(name: string): boolean {
    const status = this.shippingFuncPermissions.find((i) => i.name.includes(name));
    return status ? status.isModify : true;
  }

  /**
   * onChangeShowHideColumn
   * @param {boolean} isOpen
   */
  public onChangeShowHideColumn(isOpen: boolean): void {
    if (!isOpen) {
      let isEqual = false;
      this.showHideColumns.every((item, index) => {
        isEqual = _.isEqual(this.columns[index], item);
        return isEqual;
      });
      if (!isEqual) {
        this._progressService.start();
        setTimeout(() => {
          this.showHideColumns.forEach((item, index) => {
            Object.assign(this.columns[index], item);
          });
          this.checkColspanChange();
          if (this._userContext.currentUser.permissions) {
            const pagePermissions = this._userContext.currentUser.permissions
              .filter((i) => i.type === 15);
            this._editUserService.updateSchedulesColumnsConfig(this._userContext.currentUser.id,
              this.showHideColumns, this.colConfigKey.SchedulesShipScheduled)
              .subscribe((resp: ResponseMessage<any>) => {
                if (resp.status) {
                  this._localStorageService.set('userInfo',
                    Object.assign({...this._userContext.currentUser},
                      {
                        permissions: [
                          ...pagePermissions,
                          ...this.showHideColumns
                        ]
                      }));
                  this._changeDetectorRef.markForCheck();
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
                this._progressService.done();
              });
          }
          this._changeDetectorRef.markForCheck();
          this.updateHeader();
        }, 200);
      }
    }
  }

  /**
   * onCheckedColsAll
   * @param event
   */
  public onCheckedColsAll(event: any): void {
    this.isCheckedAll = event.target['checked'];
    this.showHideColumns.forEach((col) => col.isView = event.target['checked']);
  }

  /**
   * changeCheckedCol
   * @param {Event} event
   */
  public changeCheckedCol(event: Event): void {
    this.isCheckedAll = this.showHideColumns.findIndex((col) => col.isView === false) === -1;
  }

  /**
   * getIsViewColumn
   * @param {string} name
   * @returns {boolean}
   */
  public getIsViewColumn(name: string): boolean {
    if (this.isShowAllColumns) {
      return true;
    }
    const col = this.columns.find((i) => i.description === name);
    return col ? !!col.isView : false;
  }

  /**
   * showAllColumns
   * @param {boolean} isShowAll
   */
  public showAllColumns(isShowAll: boolean): void {
    this._progressService.start();
    setTimeout(() => {
      this.isShowAllColumns = isShowAll;
      if (this.isShowAllColumns) {
        this.totalColspan = {
          first: 4,
          second: 7
        };
      } else {
        this.checkColspanChange();
      }
      this._progressService.done();
      this._localStorageService.set('isShowAll_SchedulesShipScheduled', this.isShowAllColumns);
      this.updateHeader();
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  public getDailyTotal(rowData) {
    if (!rowData) {
      return 0;
    }
    let totalUnits = 0;
    rowData.orders.forEach((row) => {
      row.styles.forEach((style) => {
        totalUnits += style.totalProductionQty;
      });
    });
    return totalUnits;
  }

  public combineInfoString(arr: any[], prop: string, noDuplicate?: boolean): string {
    if (noDuplicate) {
      arr = _.uniqBy(arr, prop);
    }
    const str = arr.map((i) => i[prop] || '');
    return str.join(', ');
  }

  public combineInfoStr(arr: any[]): string {
    const infoStr = [];
    arr.forEach((i) => {
      if (i) {
        infoStr.push(i);
      }
    });
    return infoStr.join(', ');
  }

  public combineDateString(arr: any[], startDate: string,
                           endDate: string, defaultValue = 'N/A'): string {
    let dateArr = [];
    arr.forEach((i) => {
      if (startDate && i[startDate] && endDate && i[endDate]) {
        dateArr.push(`${moment(i[startDate] + 'Z')
          .format('MM/DD/YY')} - ${moment(i[endDate] + 'Z').format('MM/DD/YY')}`);
      } else if (i[startDate]) {
        dateArr.push(`${moment(i[startDate] + 'Z').format('MM/DD/YY')}`);
      } else {
        dateArr.push(defaultValue);
      }
    });
    return dateArr.join(', ');
  }

  public combineDateStr(arr: any[]): string {
    const dateArr = [];
    arr.forEach((i) => {
      if (i) {
        dateArr.push(`${moment(i + 'Z').format('MM/DD/YY')}`);
      }
    });
    return dateArr.join(', ');
  }

  public isLargeTodayDate(compareDate): boolean {
    return new Date(compareDate).getTime() > new Date().getTime();
  }

  public onFilter(e): void {
    this.isFilter = e;
    this.getPrintTabData().then((value: boolean) => {
      setTimeout(() => {
        if (this._utilService.scrollElm) {
          this._utilService.scrollElm
            .scrollTop = this._utilService.scrollPosition;
        }
      }, 200);
    });
  }

  public getPrintTabData(): Promise<boolean> {
    let curDate = new Date();
    curDate.setHours(-HourOffset, 0, 0);
    let params: HttpParams = new HttpParams()
      .set('shipDateFromOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'))
      .set('type', this.type.toString())
      .set('hourOffset', HourOffset.toString());

    const filterModel = this._shippingMainService.searchObj;
    if (filterModel) {
      params = params.set('customerPoId', filterModel['customerPoId']
        ? filterModel['customerPoId'].toString() : null);
      switch (filterModel['printDate']) {
        case 'Yesterday':
          curDate.setDate(curDate.getDate() - 1);
          params = params.set('shipDateFromOnUtc', moment(curDate)
            .format('YYYY-MM-DDTHH:mm:ss'));
          curDate.setHours(23 - HourOffset, 59, 59);
          params = params.set('shipDateToOnUtc', moment(curDate)
            .format('YYYY-MM-DDTHH:mm:ss'));
          break;
        case 'Today':
          curDate.setHours(23 - HourOffset, 59, 59);
          params = params.set('shipDateToOnUtc', moment(curDate)
            .format('YYYY-MM-DDTHH:mm:ss'));
          break;
        case 'This Week':
          let thisWeek = [];
          let dOW = curDate.getDay();

          for (let i = 1; i < 8; i++) {
            curDate = new Date();
            curDate.setDate(curDate.getDate() - (dOW - i));
            thisWeek.push(curDate);
          }

          let startDate = new Date(thisWeek[0].getTime());
          startDate.setHours(-HourOffset, 0, 0);
          let endDate = new Date(thisWeek[6].getTime());
          endDate.setHours(23 - HourOffset, 59, 59);
          params = params.set('shipDateFromOnUtc', moment(startDate)
            .format('YYYY-MM-DDTHH:mm:ss'));
          params = params.set('shipDateToOnUtc', moment(endDate)
            .format('YYYY-MM-DDTHH:mm:ss'));
          break;
        case 'Custom':
          let dateFrom = new Date(filterModel['shipDateFromOnUtc']);
          let dateTo = new Date(filterModel['shipDateToOnUtc']);
          dateFrom.setHours(-HourOffset, 0, 0);
          dateTo.setHours(23 - HourOffset, 59, 59);
          params = params.set('shipDateFromOnUtc',
            moment(dateFrom).format('YYYY-MM-DDTHH:mm:ss'));
          params = params.set('shipDateToOnUtc',
            moment(dateTo).format('YYYY-MM-DDTHH:mm:ss'));
          break;
        default:
          let sixDays = new Date();
          sixDays.setDate(curDate.getDate() + 6);
          sixDays.setHours(23 - HourOffset, 59, 59);
          params = params.set('shipDateToOnUtc', moment(sixDays)
            .format('YYYY-MM-DDTHH:mm:ss'));
          break;
      }
    }

    return new Promise((resolve, reject) => {
      this._shippingMainService.getShippingTabData(params)
        .subscribe((resp: ResponseMessage<any>): void => {
          this.isFilter = false;
          if (resp.status) {
            this.tableData = resp.data;
            // save origin data
            this._changeDetectorRef.markForCheck();
            resolve(true);
          } else {
            this._changeDetectorRef.markForCheck();
            this._toastrService.error(resp.errorMessages, 'Error');
            resolve(false);
          }
          // Prevent user navigate to another page when data not loaded yet
          const backdropElm = document.getElementById('backdrop');
          if (backdropElm) {
            backdropElm.className = 'none';
            this._changeDetectorRef.markForCheck();
          }
        });
    });
  }

  public ngOnDestroy() {
    this.activatedSub.unsubscribe();
    this._localStorageService.set('isShowAll_SchedulesShipScheduled', this.isShowAllColumns);
  }
}
