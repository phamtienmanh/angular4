import {
  Component,
  OnInit,
  ViewEncapsulation,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  AfterViewChecked,
  HostListener
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';
import {
  NgbDropdownConfig,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import * as FileSaver from 'file-saver';
import {
  PendingSamplesMainService
} from './pending-samples-main.service';
import {
  MyDatePickerService
} from '../../../shared/services/my-date-picker';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  Util
} from '../../../shared/services/util';
import {
  AuthService
} from '../../../shared/services/auth';
import {
  ProgressService
} from '../../../shared/services/progress';
import {
  SchedulesPrintService
} from '../../schedules-print.service';
import {
  UserContext
} from '../../../shared/services/user-context';
import {
  EditUserService
} from '../../../+user-management/+edit-user/edit-user.service';
import _ from 'lodash';

// Component
import {
  StatusComponent
} from './modules/status';
import {
  SampleDateComponent
} from './modules/sample-date';

// Interfaces
import {
  ResponseMessage,
  RowSelectEvent,
  SortEvent
} from '../../../shared/models';
import {
  DatatableComponent,
  TableColumn
} from '@swimlane/ngx-datatable';
import {
  PendingSamplesColumns,
  StatusColumns
} from './pending-samples-main.model';
import {
  TaskStatus
} from '../../../+order-log-v2/+order-main';
import {
  PrintApprovalComponent,
  SelectFactoryComponent
} from './modules';
import {
  PendingSamplesFilterComponent
} from './components';
import {
  SelectContentComponent
} from './modules/select-content';
import {
  ColConfigKey
} from '../../schedules-print.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'pending-samples-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'pending-samples-main.template.html',
  styleUrls: [
    'pending-samples-main.style.scss'
  ]
})
export class PendingSamplesMainComponent implements OnInit,
                                                    AfterViewChecked,
                                                    OnDestroy {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild('pendingSamplesTable')
  public pendingSamplesTable: DatatableComponent;
  @ViewChild(PendingSamplesFilterComponent)
  public pendingSamplesFilterComponent: PendingSamplesFilterComponent;
  public currentComponentWidth;

  public csrId: number;
  public isUnpublished = false;
  public pendingSamplesData = {
    totalRecord: 0,
    data: []
  };
  public tableConfig;
  public statusColumns = StatusColumns;

  public myConfigStyle: any = {
    'font-size': '11px'
  };
  public myConfigStyleHeader: any = {
    'font-size': '11px'
  };
  public myStyleColumns = PendingSamplesColumns;
  public header;
  public cloneHeader;

  public factoryData = [];
  public styleData = [];

  public vendorId: number;
  public taskStatus = TaskStatus;
  public activatedSub: Subscription;

  public isPageReadOnly = false;

  public showHideColumns = [];
  public columns = [];
  public isShowAllColumns = false;
  public colConfigKey = ColConfigKey;
  public colProp = [
    'Style Name',
    'Customer / PO',
    'Factory',
    'Start / Cancel Date',
    'Content',
    'Blank Color',
    'PP Qty',
    'Sample Approval Type',
    'Neck Label',
    'Art',
    'Art Requested',
    'Art Received',
    'Neck Label Art Received',
    'Separation Complete',
    'Blanks Received',
    'Sample Date',
    'QC Date',
    'Art Released',
    'Approved to Sample',
    'Print Approval'
  ];

  private _filter: any;
  private _status: any;

  private _firstTime = true;

  constructor(private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _modalService: NgbModal,
              private _authService: AuthService,
              private _localStorageService: LocalStorageService,
              private _progressService: ProgressService,
              private _pendingSamplesMainService: PendingSamplesMainService,
              private _toastrService: ToastrService,
              private _userContext: UserContext,
              private _utilService: Util,
              private _changeDetectorRef: ChangeDetectorRef,
              private _schedulesPrintService: SchedulesPrintService,
              private _ngbDropdownConfig: NgbDropdownConfig,
              private _editUserService: EditUserService,
              public myDatePickerService: MyDatePickerService) {
    this._ngbDropdownConfig.autoClose = false;
    // Config font size
    let fontSize = this._localStorageService.get('fontSize_PendingSamples') as string;
    if (fontSize) {
      const modal = {'font-size': fontSize};
      Object.assign(this.myConfigStyle, modal);
      Object.assign(this.myConfigStyleHeader, modal);
    } else {
      this._localStorageService.set('fontSize_PendingSamples', this.myConfigStyle['font-size']);
    }
    // -------------------

    // Config table
    const pendingSamplesMainPageSize = this._localStorageService.get('pendingSamplesMainPageSize');
    this.tableConfig = {
      keySort: 'styleName',
      orderDescending: false,
      currentPage: this._utilService.currentPage ? this._utilService.currentPage : 1,
      pageSize: pendingSamplesMainPageSize ? pendingSamplesMainPageSize : 10,
      loading: false
    };
    // -------------------

    // Config columns
    let colSchedulesConfigs = this._userContext.currentUser.schedulesColumnConfigs;
    const sampleConfig = this._userContext.currentUser
      .permissions.filter((i) => i.type === 7);
    if (colSchedulesConfigs && colSchedulesConfigs.length) {
      const colConfigs = colSchedulesConfigs
        .find((i) => i.key === this.colConfigKey.SchedulesPendingSamples);
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
        .permissions.filter((i) => i.type === 7);
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
      .permissions.filter((i) => i.type === 7);
    }

    this.showHideColumns.forEach((item) => {
      this.columns.push(Object.assign({}, item));
    });
    this.isShowAllColumns = !!this._localStorageService.get('isShowAll_SchedulesPendingSample');
    // --------------
  }

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Schedules.PendingSamples');
    this.activatedSub = this._activatedRoute.params
      .subscribe((params: { id: number }) => {
        let id = Number(params.id);
        this.csrId = isNaN(id) ? undefined : params.id;
        this.isUnpublished = params.id.toString() === 'unpublished';
        this.getSearchFilterSv();
        // let filterStore = this._localStorageService.get('PendingSamples_FilterModel');
        let filterStore = this._pendingSamplesMainService.searchObj;
        if (!filterStore || !this._firstTime) {
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

  public ngAfterViewChecked(): void {
    // Check if the table size has changed
    if (this.tableWrapper &&
      this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
      this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
      setTimeout(() => {
        if (this.pendingSamplesTable) {
          this.pendingSamplesTable.recalculate();
        }
        this._changeDetectorRef.markForCheck();
      }, 200);
    }
  }

  public getSearchFilterSv() {
    // get filter service from other tab
    if (this._schedulesPrintService.searchObj) {
      this._pendingSamplesMainService.searchObj = this._schedulesPrintService.searchObj;
      switch (this._schedulesPrintService.searchFrom) {
        case 'print-outsource':
          this._pendingSamplesMainService.convertFrTscOS();
          break;
        default:
          break;
      }
    }

    // set last tab
    this._pendingSamplesMainService.searchFrom = 'pending-sample,' +
    this._schedulesPrintService.searchFrom;
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
    const dataTableList = document.getElementsByTagName('ngx-datatable');
    if (dataTableList && dataTableList.length) {
      const headerList = dataTableList[0].getElementsByClassName('datatable-header');
      if (headerList && headerList.length) {
        this.header = headerList[0];
        this.cloneHeader = this.header.cloneNode(true);
        this.cloneHeader.className += ' fade-header';
      }
    }
  }

  public onScrollX(event): void {
    this.myConfigStyleHeader = {
      ...this.myConfigStyle,
      left: this.header ? `${this.header.getBoundingClientRect().left}px` : 'auto'
    };
  }

  /**
   * onUpdateFilter
   * @param filterObj
   */
  public onUpdateFilter(filterObj: any): void {
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

  /**
   * Fire filter event
   */
  public onFilter(filterObj: any): void {
    this._filter = filterObj.filter;
    this._status = filterObj.status;
    this.refreshDatatable();
  }

  public onChangeFontSize(fontSize: string): void {
    this.myConfigStyle['font-size'] = fontSize;
    this.myConfigStyleHeader['font-size'] = fontSize;
    this._localStorageService.set('fontSize_PendingSamples', fontSize);
    this._progressService.start();
    if (this.pendingSamplesTable) {
      this.recalculateWidth(this.pendingSamplesTable.columns);
      this.pendingSamplesTable.recalculate();
    }
    setTimeout(() => {
      this.updateHeader();
      this._changeDetectorRef.markForCheck();
      this._progressService.done();
    }, 200);
  }

  public recalculateWidth(columns: TableColumn[]): void {
    columns.forEach((col) => {
      col.width = this.myStyleColumns[this.myConfigStyle['font-size']][col.prop].width;
      col.minWidth = this.myStyleColumns[this.myConfigStyle['font-size']][col.prop].width;
      col.cellClass = this.myStyleColumns[this.myConfigStyle['font-size']][col.prop].cellClass;
    });
  }

  /**
   * Row detail click event
   * @param event
   */
  public onActivate(event: RowSelectEvent): void {
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    if (event) {
      event.cellElement.blur();
      this._utilService.currentPage = this.tableConfig.currentPage;
    }
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

  public goToPrintLocation(orderId: number,
                           styleId: number,
                           printLocationId: number,
                           event?: MouseEvent): void {
    if (event && event.toElement &&
      event.toElement.tagName === 'IMG') {
      return;
    }
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    this._router
      .navigate(['order-log-v2', orderId, 'styles', styleId, 'print-location', printLocationId]);
  }

  public onChangeStatus(row, rowDetail, rowData, type, title): void {
    if (this.isPageReadOnly) {
      return;
    }
    if (type === this.statusColumns.PrintApproval && row.factoryName
      && row.factoryName.toLowerCase() === 'tsc') {
      return;
    }

    switch (title) {
      case 'Art Received':
        if (rowDetail.printApproval.status === this.taskStatus.APPROVED) {
          return;
        }
        break;
      case 'Art Requested':
      case 'Neck Label Art Received':
      case 'Blanks Received':
        if (row.printLocations.some((i) =>
            i.printApproval.status === this.taskStatus.APPROVED)) {
          return;
        }
        break;
      default:
        break;
    }

    setTimeout(() => {
      let modalRef = this._modalService.open(StatusComponent, {
        size: 'lg',
        keyboard: false,
        backdrop: 'static'
      });
      modalRef.componentInstance.rowDetail = Object.assign({}, rowData);
      modalRef.componentInstance.title = title;
      modalRef.result.then((res) => {
        if (res) {
          let modal;
          let sampleId;
          let neckLabelId;
          let printLocationId;
          switch (title) {
            case 'Art Requested':
              modal = {
                status: res.status,
                artRequestedOnUtc: res.dateDoneOnUtc
              };
              sampleId = row.sampleId;
              break;
            case 'Art Received':
              modal = {
                status: res.status,
                artReceivedDateOnUtc: res.dateDoneOnUtc
              };
              printLocationId = rowDetail.printLocationId;
              break;
            case 'Neck Label Art Received':
              modal = {
                status: res.status,
                neckLabelArtReceivedDateOnUtc: res.dateDoneOnUtc
              };
              neckLabelId = row.neckLabelId;
              break;
            case 'Separation Complete':
              modal = {
                status: res.status,
                separationCompleteDateOnUtc: res.dateDoneOnUtc
              };
              printLocationId = rowDetail.printLocationId;
              break;
            case 'Blanks Received':
              modal = {
                status: res.status,
                blanksReceivedIntoArtDeptOnUtc: res.dateDoneOnUtc
              };
              sampleId = row.sampleId;
              break;
            case 'QC':
              modal = {
                status: res.status,
                qcSampleDateOnUtc: res.dateDoneOnUtc
              };
              sampleId = row.sampleId;
              break;
            case 'Art Released':
              modal = {
                status: res.status,
                artReleasedDateOnUtc: res.dateDoneOnUtc,
                releaseArtByUserId: res.releaseArtByUserId
              };
              printLocationId = rowDetail.printLocationId;
              break;
            case 'Print Approval':
              modal = res;
              printLocationId = rowDetail.printLocationId;
              break;
            default:
              break;
          }
          this._pendingSamplesMainService.changeStatusColumn(type, modal,
            sampleId, neckLabelId, printLocationId)
            .subscribe((resp: ResponseMessage<any>) => {
              if (resp.status) {
                Object.assign(rowData, resp.data);
                this.recalculateHeightCell(this.pendingSamplesData.data);
                this._changeDetectorRef.markForCheck();
                this._toastrService.success(resp.message, 'Success');
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
        this._changeDetectorRef.markForCheck();
      }, (err) => {
        // empty
      });
    }, 200);
  }

  public onChangeFactoryName(row, rowDetail): void {
    if (!row.sampleId && !row.factoryName) {
      this._toastrService.error('Sample Approval must be specified before you can assign a Factory',
        'Error');
      return;
    }
    setTimeout(() => {
      let modalRef = this._modalService.open(SelectFactoryComponent, {
        keyboard: false,
        backdrop: 'static'
      });
      modalRef.componentInstance.factoryId = row.factoryId;
      modalRef.componentInstance.factoryName = row.factoryName;
      modalRef.componentInstance.itemType = row.itemType || 1;
      modalRef.result.then((res) => {
        if (res) {
          this._pendingSamplesMainService.changeStatusColumn(this.statusColumns.FactoryName, res,
            row.sampleId, null, null)
            .subscribe((resp: ResponseMessage<any>) => {
              if (resp.status) {
                Object.assign(row, resp.data);
                this.recalculateHeightCell(this.pendingSamplesData.data);
                this._changeDetectorRef.markForCheck();
                this._toastrService.success(resp.message, 'Success');
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
        this._changeDetectorRef.markForCheck();
      }, (err) => {
        // empty
      });
    }, 200);
  }

  public onChangeContent(row, rowDetail): void {
    if (!row.orderDetailId) {
      this._toastrService.error('Order Detail must be specified before you can assign Content',
        'Error');
      return;
    }
    setTimeout(() => {
      let modalRef = this._modalService.open(SelectContentComponent, {
        keyboard: false,
        backdrop: 'static'
      });
      modalRef.componentInstance.contentId = row.contentId;
      modalRef.componentInstance.contentName = row.contentName;
      modalRef.result.then((res) => {
        if (res) {
          this._pendingSamplesMainService.changeStatusColumn(this.statusColumns.Content, res,
            null, null, null, row.orderDetailId)
            .subscribe((resp: ResponseMessage<any>) => {
              if (resp.status) {
                Object.assign(row, resp.data);
                this.recalculateHeightCell(this.pendingSamplesData.data);
                this._changeDetectorRef.markForCheck();
                this._toastrService.success(resp.message, 'Success');
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
        this._changeDetectorRef.markForCheck();
      }, (err) => {
        // empty
      });
    }, 200);
  }

  public onChangePrintApproval(row, rowDetail, rowData, type): void {
    const checkStatusDone = (listStatus: number[]): boolean => {
      let status = true;
      // uncomment to check status
      // listStatus.forEach((i) => {
      //   status = status && i === this.taskStatus.DONE;
      // });
      return status;
    };
    if (this.isPageReadOnly) {
      return;
    }
    if (!this.isArtManagers || !checkStatusDone([
        row.artRequested.status,
        rowDetail.artReceived.status,
        row.neckLabelArtReceived.status,
        row.blanksReceived.status,
        this.getInitQcDate(row) ? row.qcDate.status : this.taskStatus.DONE
      ])) {
      return;
    }
    setTimeout(() => {
      let modalRef = this._modalService.open(PrintApprovalComponent, {
        size: 'lg',
        keyboard: false,
        backdrop: 'static'
      });
      modalRef.componentInstance.rowDetail = Object.assign({}, rowData);
      modalRef.componentInstance.type = type;
      modalRef.result.then((res) => {
        if (res) {
          this._pendingSamplesMainService.changeStatusColumn(type, res,
            row.sampleId, row.neckLabelId, rowDetail.printLocationId)
            .subscribe((resp: ResponseMessage<any>) => {
              if (resp.status) {
                // Object.assign(rowData, resp.data);
                // this.recalculateHeightCell(this.pendingSamplesData.data);
                // this._changeDetectorRef.markForCheck();
                this.ngOnInit();
                this._toastrService.success(resp.message, 'Success');
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
        this._changeDetectorRef.markForCheck();
      }, (err) => {
        // empty
      });
    }, 200);
  }

  public onChangeSampleDate(row, rowDetail, rowData): void {
    if (this.isPageReadOnly || rowData.status === this.taskStatus.DONE) {
      return;
    }
    setTimeout(() => {
      let modalRef = this._modalService.open(SampleDateComponent, {
        size: 'lg',
        keyboard: false,
        backdrop: 'static'
      });
      modalRef.componentInstance.rowDetail = Object.assign({}, rowData);
      modalRef.result.then((res) => {
        if (res) {
          let modal = {
            ...res
          };
          this._pendingSamplesMainService.changeStatusColumn(this.statusColumns.SampleDate, modal,
            row.sampleId, row.neckLabelId,
            rowDetail ? rowDetail.printLocationId : null)
            .subscribe((resp: ResponseMessage<any>) => {
              if (resp.status) {
                Object.assign(rowData, resp.data);
                this.recalculateHeightCell(this.pendingSamplesData.data);
                this._changeDetectorRef.markForCheck();
                this._toastrService.success(resp.message, 'Success');
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
        this._changeDetectorRef.markForCheck();
      }, (err) => {
        // empty
      });
    }, 200);
  }

  /**
   * Page size change event
   * @param pageSize
   */
  public onSelectedPageSize(pageSize: number): void {
    this._localStorageService.set('pendingSamplesMainPageSize', pageSize);
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

  /**
   * Sort change event
   * @param event
   */
  public onSort(event: SortEvent): void {
    this.tableConfig.keySort = event.sorts[0].prop;
    this.tableConfig.orderDescending = event.sorts[0].dir === 'desc';
    this.tableConfig.loading = true;
    this.refreshDatatable(this.tableConfig.currentPage - 1);
    this.updateHeader();
  }

  public onExportOrder(filterObj: any) {
    // console.log(filterObj);
  }

  public refreshDatatable(draw?: number): Promise<boolean> {
    this.tableConfig.currentPage = draw ? draw + 1 : 1;
    let countSkip = (draw ? draw * this.tableConfig.pageSize : 0).toString();
    let pageSize = this.tableConfig.pageSize.toString();
    let orderDescending = this.tableConfig.orderDescending.toString();
    let keySort = this.tableConfig.keySort;
    let filter = this._filter;
    let status = this._status;
    let csrId = this.csrId ? this.csrId.toString() : '';

    let params: HttpParams = new HttpParams()
      .set('countSkip', countSkip)
      .set('pageSize', pageSize)
      .set('filter', filter)
      .set('status', status)
      .set('keySort', keySort)
      .set('csrId', csrId)
      .set('orderDescending', orderDescending)
      .set('isPublished', (!this.isUnpublished).toString());

    return new Promise((resolve, reject) => {
      this._pendingSamplesMainService.getPendingSamplesTabData(params)
        .subscribe((resp: ResponseMessage<any>): void => {
          if (resp.status) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;

            let responseData = resp.data;
            this.pendingSamplesData.totalRecord = responseData.totalRecord;
            this.pendingSamplesData.data = responseData.data;
            if (!this.pendingSamplesData.data || !this.pendingSamplesData.data.length) {
              this._changeDetectorRef.markForCheck();
              // Prevent user navigate to another page when data not loaded yet
              const backdropElm = document.getElementById('backdrop');
              if (backdropElm) {
                backdropElm.className = 'none';
                this._changeDetectorRef.markForCheck();
              }
              return;
            }
          } else {
            this._changeDetectorRef.markForCheck();
            this._toastrService.error(resp.errorMessages, 'Error');
            this.recalculateHeightCell(this.pendingSamplesData.data);
          }
          this.recalculateHeightCell(this.pendingSamplesData.data);
          // Prevent user navigate to another page when data not loaded yet
          const backdropElm = document.getElementById('backdrop');
          if (backdropElm) {
            backdropElm.className = 'none';
            this._changeDetectorRef.markForCheck();
          }
          resolve(true);
        });
    });
  }

  public resetHeightCell(pendingSamplesData: any[]): void {
    pendingSamplesData.forEach((row) => {
      row.printLocations.forEach((style, styleIndex) => {
        style.style = {
          height: `auto`
        };
        this._changeDetectorRef.markForCheck();
      });
      row.style = {
        height: `auto`
      };
      this._changeDetectorRef.markForCheck();
    });
    if (this.pendingSamplesTable) {
      this.pendingSamplesTable.recalculate();
    }
    this._changeDetectorRef.markForCheck();
  }

  public recalculateHeightCell(pendingSamplesData: any[]): void {
    this.resetHeightCell(pendingSamplesData);
    pendingSamplesData.forEach((row) => {
      setTimeout(() => {
        let maxHeightPrintLocation = 0;
        row.printLocations.forEach((print, printIndex) => {
          const getMaxHeightPrintLocation = (listCols: string[]): number => {
            let defaultHeight = 90;
            listCols.forEach((col) => {
              const colElm = document
                .getElementById(`${row.id}-${print.printLocationId}-${col}`);
              if (colElm) {
                defaultHeight = colElm.offsetHeight > defaultHeight
                  ? colElm.offsetHeight : defaultHeight;
              }
            });
            return defaultHeight;
          };
          const listCols = [
            'art',
            'artReceived',
            'sampleDate',
            'artReleased',
            'printApproval'
          ];
          print.style = {
            height: `${getMaxHeightPrintLocation(listCols)}px`
          };
          maxHeightPrintLocation += getMaxHeightPrintLocation(listCols);
          this._changeDetectorRef.markForCheck();
        });
      }, 500);
    });
    setTimeout(() => {
      if (this.pendingSamplesTable) {
        this.pendingSamplesTable.recalculate();
      }
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  public appendStatusClass(status: number) {
    return {
      red: status === this.taskStatus.PENDING,
      green: status === this.taskStatus.DONE
      || status === this.taskStatus.APPROVED
      || status === this.taskStatus.ONFILE
    };
  }

  public isHaveApprovalTypes(row): boolean {
    // return row.approvalTypes && row.approvalTypes.length;
    // change statuses even if a Sample Approval Type is not specified
    return true;
  }

  public getInitQcDate(row): boolean {
    if (row.approvalTypes && row.approvalTypes.length) {
      return row.approvalTypes.some((i) => i.toLowerCase() === 'send to customer');
    }
    return false;
  }

  public getBlockBgArtReleased(row): boolean {
    return row.factoryName && row.factoryName.toLowerCase() === 'tsc';
  }

  public get isArtManagers(): boolean {
    return this._userContext.currentUser.listRole.some((i) => i.roleName === 'Art Manager'
      || i.roleName === 'Staff Administrator' || i.roleName === 'Administrator');
  }

  //#region show hide column

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
        isEqual = _.isEqual(this.columns[index], item);
        return isEqual;
      });
      if (!isEqual) {
        this._progressService.start();
        setTimeout(() => {
          this.showHideColumns.forEach((item, index) => {
            Object.assign(this.columns[index], item);
          });

          if (this._userContext.currentUser.permissions) {
            const pagePermissions = this._userContext.currentUser.permissions
              .filter((i) => i.type === 7);
            this._editUserService.updateSchedulesColumnsConfig(this._userContext.currentUser.id,
              this.showHideColumns, this.colConfigKey.SchedulesPendingSamples)
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
   * isNoColumnChecked
   * @returns {boolean}
   */
  public isNoColumnChecked(): boolean {
    if (!this.isShowAllColumns) {
      return this.columns.filter((i) => i.type === 7).every((i) => i.isView === false);
    } else {
      return false;
    }
  }

  //#endregion

  public ngOnDestroy(): void {
    this._utilService.currentPage = this.tableConfig.currentPage;
    // set last filter
    this._schedulesPrintService.searchObj = this._pendingSamplesMainService.searchObj;
    this._schedulesPrintService.searchFrom = this._pendingSamplesMainService.searchFrom;
    this._pendingSamplesMainService.searchObj = '';
    this._pendingSamplesMainService.searchFrom = '';
    this._localStorageService.set('isShowAll_SchedulesPendingSample', this.isShowAllColumns);
    // Prevent user navigate to another page when data not loaded yet
    const backdropElm = document.getElementById('backdrop');
    if (backdropElm && !backdropElm.className.includes('none')) {
      backdropElm.className = 'none';
    }
  }
}
