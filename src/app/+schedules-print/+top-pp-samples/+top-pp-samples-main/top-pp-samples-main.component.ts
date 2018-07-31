import {
  Component,
  OnInit,
  ViewEncapsulation,
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

import {
  Subscription
} from 'rxjs/Subscription';

import * as FileSaver from 'file-saver';
import _ from 'lodash';

// 3rd modules
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  Util,
  AuthService,
  UserContext,
  ProgressService,
  MyDatePickerService
} from '../../../shared/services';
import {
  StyleService
} from '../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+style/style.service';
import {
  TopPpSamplesMainService
} from './top-pp-samples-main.service';
import {
  EditUserService
} from '../../../+user-management/+edit-user/edit-user.service';

// Component
import {
  QaChangeStatusComponent,
  AccountManagerComponent,
  ShipDateComponent
} from './modules';
import {
  UploaderTypeComponent
} from '../../../shared/modules/uploader-type/uploader-type.component';

// Interfaces
import {
  ResponseMessage
} from '../../../shared/models';
import {
  TaskStatus
} from '../../../+order-log-v2/+order-main';
import {
  ItemTypes
} from '../../../+order-log-v2/+sales-order/+order-styles';
import {
  ColConfigKey
} from '../../schedules-print.model';
import {
  TopPps,
  TopPpSamplesColumns
} from './top-pp-samples-main.model';
import {
  StyleUploadedType
} from '../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+style/style.model';
import {
  TabTypes
} from '../top-pp-samples.model';
import {
  UploadedType
} from '../../../shared/models/upload-type.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'top-pp-samples-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'top-pp-samples-main.template.html',
  styleUrls: [
    'top-pp-samples-main.style.scss'
  ]
})
export class TopPpSamplesMainComponent implements OnInit,
                                                  OnDestroy {
  public filterType = 0;
  public activeTab = 0;
  public daysTab = [];
  public tableAllDaysData = [];
  public topPpSamplesData = {
    totalRecord: 0,
    data: []
  };
  public itemTypes = ItemTypes;
  public styleUploadedType = StyleUploadedType;
  public uploadedType = UploadedType;
  public topPps = TopPps;
  public tableConfig;

  public myConfigStyle: any = {
    'font-size': '11px'
  };
  public myConfigStyleHeader: any = {
    'font-size': '11px'
  };
  public myStyleColumns = TopPpSamplesColumns;
  public header;
  public cloneHeader;
  public taskStatus = TaskStatus;
  public activatedRouteSub: Subscription;

  public isPageReadOnly = false;

  public showHideColumns = [];
  public columns = {};
  public isShowAllColumns = false;
  public colConfigKey = ColConfigKey;
  public tabTypes = TabTypes;

  public isChangePopup = false;
  public isOpenChangePopup = false;
  private _filter: any;
  private _status: any;
  private _firstTime = true;

  constructor(private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _toastrService: ToastrService,
              private _modalService: NgbModal,
              private _progressService: ProgressService,
              private _localStorageService: LocalStorageService,
              private _utilService: Util,
              private _userContext: UserContext,
              private _authService: AuthService,
              private _styleService: StyleService,
              private _topPpSamplesMainService: TopPpSamplesMainService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _editUserService: EditUserService,
              public myDatePickerService: MyDatePickerService) {
    // Config font size
    let fontSize = this._localStorageService.get('fontSize_TopPpSamples') as string;
    if (fontSize) {
      const modal = {'font-size': fontSize};
      Object.assign(this.myConfigStyle, modal);
      Object.assign(this.myConfigStyleHeader, modal);
    } else {
      this._localStorageService.set('fontSize_TopPpSamples', this.myConfigStyle['font-size']);
    }
    // -------------------

    // Config table
    const topPpSamplesMainPageSize = this._localStorageService.get('topPpSamplesMainPageSize');
    this.tableConfig = {
      keySort: '',
      orderDescending: false,
      currentPage: this._utilService.currentPage ? this._utilService.currentPage : 1,
      pageSize: topPpSamplesMainPageSize ? topPpSamplesMainPageSize : 10,
      loading: false
    };
    // -------------------

    // Config columns
    let colSchedulesConfigs = this._userContext.currentUser.schedulesColumnConfigs;
    const sampleConfig = this._userContext.currentUser
      .permissions.filter((i) => i.type === 16);
    if (colSchedulesConfigs && colSchedulesConfigs.length) {
      const colConfigs = colSchedulesConfigs
        .find((i) => i.key === this.colConfigKey.SchedulesTopPpSamples);
      if (!colConfigs || colConfigs.value.length !== sampleConfig.length) {
        this.showHideColumns = sampleConfig;
      } else {
        colConfigs.value.forEach((i) => {
          let col = sampleConfig.find((o) => o.id === i.id);
          if (col) {
            Object.assign(i, col);
          }
        });
        this.showHideColumns = colConfigs.value;
      }
      const storedColumnConfig = this._userContext.currentUser
        .permissions.filter((i) => i.type === 16);
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
        const sameObj =
          this._userContext.currentUser.permissions.find((i) => i.name === item.name);
        if (sameObj) {
          item.isModify = sameObj.isModify;
        }
      });
    } else {
      this.showHideColumns = this._userContext.currentUser
      .permissions.filter((i) => i.type === 16);
    }

    this.showHideColumns.forEach((item) => {
      this.columns[item.name] = item.isView;
    });
    // --------------
  }

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Schedules.TopPpSamples');
    this.activatedRouteSub = this._activatedRoute.data
      .subscribe((data: { filterType: number }) => {
        this.filterType =  data.filterType;
        if (!this._firstTime) {
          this._firstTime = false;
          this.refreshDatatable(this.tableConfig.currentPage - 1)
            .then((value: boolean) => {
              setTimeout(() => {
                if (this._utilService.scrollElm) {
                  this._utilService.scrollElm
                    .scrollTop = this._utilService.scrollPosition;
                }
              }, 200);
            });
        }
      });
    // Prevent user navigate to another page when data not loaded yet
    const backdropElm = document.getElementById('backdrop');
    if (backdropElm) {
      backdropElm.className = '';
      this._changeDetectorRef.markForCheck();
    }
  }

  @HostListener('window:scroll', ['$event'])
  public onAppScroll(event?: any) {
    const fixedHeader = document.getElementById('header');
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
    if (event.target.scrollingElement.scrollTop >= 300
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

  public updateHeader(): void {
    const headerList = document.getElementsByClassName('table-header');
    if (headerList && headerList.length) {
      this.header = headerList[0];
      this.cloneHeader = this.header.cloneNode(true);
      if (this.header.children && this.header.children.length) {
        Array.from(this.header.children).forEach((el: any, index) => {
          let width = el.getBoundingClientRect().width + 'px';
          this.cloneHeader.children[index].style.width = width;
          this.cloneHeader.children[index].style.maxWidth = width;
          this.cloneHeader.children[index].style.minWidth = width;
        });
      }
      this.cloneHeader.className += ' fade-header';
    }
  }

  public onScrollX(event): void {
    this.myConfigStyleHeader = {
      ...this.myConfigStyle,
      left: this.header ? `${this.header.getBoundingClientRect().left}px` : 'auto'
    };
  }

  public onUpdateFilter(filterObj: any): void {
    this.daysTab = filterObj.filter.daysTab;
    this._filter = filterObj.filter;
    this._status = filterObj.status;
    this._firstTime = false;
    this.refreshDatatable(this.tableConfig.currentPage - 1)
      .then((value: boolean) => {
        setTimeout(() => {
          if (this._utilService.scrollElm) {
            this._utilService.scrollElm
              .scrollTop = this._utilService.scrollPosition;
          }
        }, 200);
      });
  }

  public onFilter(filterObj: any): void {
    this.daysTab = filterObj.filter.daysTab;
    this._filter = filterObj.filter;
    this._status = filterObj.status;
    this.refreshDatatable();
  }

  public onChangeFontSize(fontSize: string): void {
    this.myConfigStyle['font-size'] = fontSize;
    this.myConfigStyleHeader['font-size'] = fontSize;
    this._localStorageService.set('fontSize_TopPpSamples', fontSize);
    this._progressService.start();
    setTimeout(() => {
      this.updateHeader();
      this._changeDetectorRef.markForCheck();
      this._progressService.done();
    }, 200);
  }

  public onSelectedPageSize(pageSize: number): void {
    this._localStorageService.set('topPpSamplesMainPageSize', pageSize);
    this.tableConfig.pageSize = pageSize;
    this.refreshDatatable();
  }

  /**
   * Page change event
   * @param draw
   */
  public onPageChange(draw: number): void {
    if (this._utilService.scrollElm) {
      this._utilService.scrollElm.scrollTop = 0;
      this._utilService.scrollPosition = 0;
    }
    this.tableConfig.currentPage = draw + 1;
    this.refreshDatatable(draw);
  }

  public onExportOrder(filterObj: any) {
    // console.log(filterObj);
  }

  public refreshDatatable(draw?: number): Promise<boolean> {
    this.tableConfig.currentPage = draw ? draw + 1 : 1;
    let params: HttpParams = new HttpParams()
      .set('filterType', this.filterType.toString())
      .set('topPpCancelDateFromOnUtc', this._filter.topPpCancelDateFromOnUtc)
      .set('topPpCancelDateToOnUtc', this._filter.topPpCancelDateToOnUtc)
      .set('poId', this._filter.poId)
      .set('customer', this._filter.customer)
      .set('styleName', this._filter.styleName);

    return new Promise((resolve, reject) => {
      this._topPpSamplesMainService.getTopPpSamplesTabData(params)
        .subscribe((resp: ResponseMessage<any>): void => {
          if (resp.status) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;
            this.tableAllDaysData = resp.data;
            if (!this.daysTab.length && this._filter.sampleDate === 'Custom') {
              this.tableAllDaysData.forEach((day) => {
                this.daysTab.push({
                  date: day.topPpCancelDate,
                  isActive: false
                });
              });
            }
            // switch tab and filter data by date
            this.switchTab(this.activeTab);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          // Prevent user navigate to another page when data not loaded yet
          const backdropElm = document.getElementById('backdrop');
          if (backdropElm) {
            backdropElm.className = 'none';
          }
          this._changeDetectorRef.markForCheck();
          resolve(true);
        });
    });
  }

  public switchTab(index) {
    this.activeTab = index;
    if (!this.daysTab.length) {
      return;
    } else if (!this.daysTab[index]) {
      this.switchTab(0);
      return;
    }
    this.daysTab.forEach((t) => t.isActive = false);
    this.daysTab[index].isActive = true;
    let dayDatas = this.tableAllDaysData.filter((day) => {
      return new Date(day.topPpCancelDate).setHours(0, 0, 0)
        === new Date(this.daysTab[index].date).setHours(0, 0, 0);
    });
    let totalRecord = 0;
    dayDatas.forEach((dayData) => {
      totalRecord += dayData.styles.length;
      dayData.styles.forEach((style) => {
        style.isSMPL = style.csr.customerPoId
          && style.csr.customerPoId.toLowerCase().startsWith('smpl');
        if (!style.qa.qaStatus) {
          style.qa.qaStatus = 'null';
        }
        if (!style.topPpQtys.length) {
          style.topPpQtys = [null];
        }
      });
    });
    this.topPpSamplesData = {
      totalRecord,
      data: dayDatas
    };
  }

  public onChangeShowHideColumn(data): void {
    if (typeof data.showAll === 'boolean') {
      this.isShowAllColumns = data.showAll;
      this._changeDetectorRef.markForCheck();
      return;
    }
    const isOpen = data.open;
    this.showHideColumns = data.cols;
    if (!isOpen) {
      let isEqual = false;
      this.showHideColumns.every((item, index) => {
        isEqual = this.columns[item.name] === item.isView;
        return isEqual;
      });
      if (!isEqual) {
        this._progressService.start();
        setTimeout(() => {
          this.showHideColumns.forEach((item, index) => {
            this.columns[item.name] = item.isView;
          });

          if (this._userContext.currentUser.permissions) {
            const pagePermissions = this._userContext.currentUser.permissions
              .filter((i) => i.type === 16);
            this._editUserService.updateSchedulesColumnsConfig(this._userContext.currentUser.id,
              this.showHideColumns, this.colConfigKey.SchedulesTopPpSamples)
              .subscribe((resp: ResponseMessage<any>) => {
                if (resp.status) {
                  this._localStorageService.set('userInfo',
                    Object.assign({...this._userContext.currentUser},
                      {permissions: [...pagePermissions, ...this.showHideColumns]}));
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

  public canModifyCols(colName: string): boolean {
    if (!this._authService.checkCanModify('Schedules.TopPpSamples')) {
      return false;
    }
    const colObj = this.showHideColumns.find((i) => i.name === colName);
    if (colObj) {
      return colObj.isModify;
    }
    return false;
  }

  public isNoColumnChecked(): boolean {
    if (!this.isShowAllColumns) {
      return _.map(this.columns, (o) => { return o; }).every((isView: boolean) => !isView);
    } else {
      return false;
    }
  }

  public createConsolidatedShipment() {
    let params: HttpParams = new HttpParams()
      .set('utcOffset', (-1 * new Date().getTimezoneOffset() / 60).toString());
    this._topPpSamplesMainService.createConsolidatedShipment(params)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public goToNeckLabelSetup(orderId, styleId, event?: MouseEvent): void {
    if (event && event.toElement &&
      event.toElement.tagName === 'IMG') {
      return;
    }
    if (this._authService.checkCanView('Orders')) {
      this._utilService.scrollPosition = this._utilService
        .scrollElm.scrollTop;
      this._router.navigate([
        'order-log-v2', orderId, 'styles',
        styleId, 'neck-labels'
      ]);
    }
  }

  public goToOrderInfo(orderId: number): void {
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    this._router.navigate(['order-log-v2', orderId]);
  }

  public goToStyle(orderId: number, styleId: number): void {
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    this._router.navigate(['order-log-v2', orderId, 'styles', styleId]);
  }

  public goToStyleSample(orderId: number, styleId: number): void {
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    this._router.navigate(['order-log-v2', orderId, 'styles', styleId, 'samples']);
  }

  public goToPrintLocation(event: MouseEvent,
                           orderId: number,
                           styleId: number,
                           printLocationId?: number): void {
    if (event && event.toElement &&
      event.toElement.tagName === 'IMG') {
      return;
    }
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    if (printLocationId) {
      this._router
        .navigate(['order-log-v2', orderId, 'styles', styleId, 'print-location', printLocationId]);
    } else {
      this._router
        .navigate(['order-log-v2', orderId, 'styles', styleId, 'print-location']);
    }
  }

  public openOWSTeckPackUploader(orderDetailId: number, title: string): void {
    this.isChangePopup = true;
    setTimeout(() => {
      this.isOpenChangePopup = false;
      let fileList = [];
      this._styleService.getOwsStyleFiles(orderDetailId)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            fileList = Object.assign([], resp.data.filter((i) =>
              i.type === this.styleUploadedType.TechPacks
              || i.type === this.styleUploadedType.OrderWorkSheets));
            let modalRef = this._modalService.open(UploaderTypeComponent, {
              size: 'lg',
              keyboard: false,
              backdrop: 'static',
              windowClass: 'super-lg'
            });
            modalRef.componentInstance.title = 'OWS / Tech Pack';
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

  public openStyleUploader(styleId: number, type: number, title: string): void {
    this.isChangePopup = true;
    setTimeout(() => {
      this.isOpenChangePopup = false;
      let fileList = [];
      this._styleService.getStyleFiles(styleId)
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
              uploadType: type === 0 ? this.uploadedType.CutTickets : '',
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

  public openQaChangeStatus(style): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Schedules.TopPpSamples.Qa')
        && !style.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(QaChangeStatusComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static'
        });
        modalRef.componentInstance.styleId = style.id;
        modalRef.componentInstance.isSMPL = style.isSMPL;
        modalRef.result.then((res) => {
          if (res) {
            const modal = {
              ...res
            };
            this._topPpSamplesMainService.updateQaDetail(style.id, modal)
              .subscribe((resp: ResponseMessage<any>) => {
                this.isChangePopup = false;
                if (resp.status) {
                  Object.assign(style.qa, resp.data);
                  this._changeDetectorRef.markForCheck();
                  this._toastrService.success(resp.message, 'Success');
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
          }
          this.isOpenChangePopup = false;
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

  public openAccountManager(style): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && this.canModifyCols('Schedules.TopPpSamples.AccountManagerApproval')
        && !style.styleInfo.isCancelled && style.accountManagerApprovals.length) {
        let qtyNum = style.accountManagerApprovals.length;
        this.isChangePopup = true;
        let modalRef = this._modalService.open(AccountManagerComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: qtyNum === 4 ? 'modal-w-1200' : qtyNum === 3 ? 'super-lg' :
            qtyNum === 2 ? 'eta-lg' : 'eta-sm'
        });
        modalRef.componentInstance.styleId = style.id;
        modalRef.componentInstance.isSMPL = style.isSMPL;
        modalRef.result.then((res) => {
          if (res && res.status) {
            const modal = {
              ...res.data
            };
            this._topPpSamplesMainService
              .updateAccountManager(style.id, modal)
                .subscribe((resp: ResponseMessage<any>) => {
                  this.isChangePopup = false;
                  if (resp.status) {
                    Object.assign(style.accountManagerApprovals, resp.data);
                    this._changeDetectorRef.markForCheck();
                    this._toastrService.success(resp.message, 'Success');
                  } else {
                    this._toastrService.error(resp.errorMessages, 'Error');
                  }
                });
          }
          this.isOpenChangePopup = false;
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

  public onChangeShipDates(style, shipDate): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Schedules.TopPpSamples.ShipDate')
        && !style.styleInfo.isCancelled
        && shipDate && shipDate.topPpId && shipDate.isConsolidatedShipment) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(ShipDateComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'super-lg'
        });
        modalRef.componentInstance.topPpId = shipDate.topPpId;

        modalRef.result.then((res) => {
          if (res && res.status) {
            const modal = res.data;
            this._topPpSamplesMainService
              .updateShipDates(modal)
              .subscribe((resp: ResponseMessage<any>) => {
                this.isChangePopup = false;
                if (resp.status) {
                  if (resp.data.length) {
                    Object.assign(shipDate, resp.data[0]);
                  }
                  this._changeDetectorRef.markForCheck();
                  this._toastrService.success(resp.message, 'Success');
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
          }
          this.isOpenChangePopup = false;
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

  public exportPickTicket($event, styleId, exportType = 'pdf') {
    $event.stopPropagation();
    this._topPpSamplesMainService.exportPickTicket(styleId)
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
          FileSaver.saveAs(blob, filename);
        }
      });
  }

  public ngOnDestroy(): void {
    this._utilService.currentPage = this.tableConfig.currentPage;
    this._localStorageService.set('isShowAll_SchedulesTopPpSample', this.isShowAllColumns);
    // Prevent user navigate to another page when data not loaded yet
    const backdropElm = document.getElementById('backdrop');
    if (backdropElm && !backdropElm.className.includes('none')) {
      backdropElm.className = 'none';
    }
  }
}
