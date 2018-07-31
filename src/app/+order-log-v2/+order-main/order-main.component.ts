import {
  Component,
  ViewEncapsulation,
  OnInit,
  ViewChild,
  AfterViewChecked,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
  ViewChildren,
  ElementRef,
  QueryList,
  AfterViewInit
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  Router
} from '@angular/router';

// Services
import { ToastrService } from 'ngx-toastr';
import {
  DatatableComponent,
  TableColumn
} from '@swimlane/ngx-datatable';
import { CommonService } from '../../shared/services/common';
import { OrderMainService } from './order-main.service';
import { Util } from '../../shared/services/util';
import { LocalStorageService } from 'angular-2-local-storage';
import {
  NgbDropdownConfig,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  ProgressService
} from '../../shared/services/progress';
import {
  LocationDetailService
} from '../+sales-order/+order-styles/+styles-info/+print-location/+location-detail';
import * as _ from 'lodash';
import * as FileSaver from 'file-saver';
import {
  MyDatePickerService
} from '../../shared/services/my-date-picker';
import {
  UserContext
} from '../../shared/services/user-context';
import {
  ValidationService
} from '../../shared/services/validation';
import {
  EditUserService
} from '../../+user-management/+edit-user/edit-user.service';
import {
  AuthService
} from '../../shared/services/auth';
import {
  StyleService
} from '../+sales-order/+order-styles/+styles-info/+style/style.service';
import {
  ContextMenuService,
  ContextMenuComponent
} from 'ngx-contextmenu';
import * as moment from 'moment';

// Interfaces
import {
  PrintDateComponent,
  NeckLabelDateComponent,
  ActualToShipComponent,
  ReadyToShipComponent,
  PickPackDateComponent,
  FinishingDateComponent,
  SpecialtyTreatmentComponent,
  NeckLabelApprovalComponent,
  TeckPackReadyComponent,
  FolderReadyComponent,
  CreditApprovalComponent,
  TrimEtaComponent,
  OrderStagedComponent,
  CutTicketComponent,
  BlankGoodsComponent,
  SampleApprovalComponent,
  FolderSubmittedComponent,
  InvoicedComponent,
  ArtReleasedComponent,
  ShippingLabelsTscComponent,
  PrintDateStatusComponent,
  AddCommentComponent,
  EtaTscComponent,
  QaComponent,
  ConfirmReorderComponent
} from './modules';
import {
  ResponseMessage,
  SortEvent,
  RowSelectEvent,
  UserInfo
} from '../../shared/models';
import {
  TaskStatus,
  StyleColumns,
  OrderLogType
} from './order-main.model';
import {
  Columns,
  TypePrintSchedule
} from './modules/columns.model';
import {
  UploaderTypeComponent
} from '../../shared/modules/uploader-type';
import {
  OrderInfoUploadedType
} from '../+sales-order/+order-info';
import {
  UploadedType
} from '../+sales-order';
import {
  UploadComponent
} from '../+sales-order/+order-styles/+styles-info/+print-location/modules';
import {
  StyleUploadedType
} from '../+sales-order/+order-styles/+styles-info/+style';
import {
  ItemTypes
} from '../+sales-order/+order-styles/order-styles.model';
import {
  BasicResponse
} from '../../shared/models';
import { OrderMainFilterComponent } from './components';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'order-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'order-main.template.html',
  styleUrls: [
    'order-main.style.scss'
  ]
})
export class OrderMainComponent implements OnInit, AfterViewChecked, OnDestroy, AfterViewInit {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild('orderLogTable')
  public orderLogTable: DatatableComponent;
  @ViewChild('orderLogHeader')
  public orderLogHeader: any;
  @ViewChild('orderLogNavTab')
  public orderLogNavTab: any;
  @ViewChild('dashboardScroll')
  public dashboardScroll: any;
  @ViewChild('markAsReadMenu')
  public markAsReadMenu: ContextMenuComponent;
  @ViewChild('markAsUnreadMenu')
  public markAsUnreadMenu: ContextMenuComponent;
  @ViewChild(OrderMainFilterComponent)
  public orderMainFilterComponent: OrderMainFilterComponent;
  @ViewChildren('rowCheckbox')
  public rowCheckbox: QueryList<ElementRef>;
  public currentComponentWidth;

  public orderLogData = {
    totalRecord: 0,
    data: [],
    selected: {
      isCheckedAll: false,
      isCheckedPage: false,
      itemsChecked: [],
      itemsRemoved: []
    }
  };
  public tableConfig;
  public taskStatus = TaskStatus;
  public itemTypes = ItemTypes;
  public myConfigStyle = {
    'font-size': '11px'
  };
  public myConfigStyleHeader: any = {
    'font-size': '11px'
  };
  public myStyleColumns = StyleColumns;
  public showHideColumns = [];
  public columns = {};
  public isCheckedAll = true;
  public header;
  public cloneHeader;
  public isOpenChangePopup = false;
  public orderInfoUploadedType = OrderInfoUploadedType;
  public styleUploadedType = StyleUploadedType;
  public uploadedType = UploadedType;
  public isChangePopup = false;
  public currentUserRoles = [];
  public isShowAllColumns = false;
  public tabs = [
    {
      name: 'All',
      description: 'All',
      type: OrderLogType.All,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.All')
    },
    {
      name: 'Development',
      description: 'Development',
      type: OrderLogType.Development,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.Development')
    },
    {
      name: 'Order Notification',
      description: 'OrderNotification',
      type: 0,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.OrderNotification')
    },
    {
      name: 'A2000 Import Errors',
      description: 'A2000ImportErrors',
      type: OrderLogType.A2000ImportErrors,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.A2000ImportErrors')
    },
    {
      name: 'Unassigned',
      description: 'Unassigned',
      type: OrderLogType.Unassigned,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.Unassigned')
    },
    {
      name: 'Unpublished',
      description: 'Unpublished',
      type: OrderLogType.Unpublished,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.Unpublished')
    },
    {
      name: 'Published',
      description: 'Published',
      type: OrderLogType.Published,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.Published')
    },
    {
      name: 'A2000 Revised',
      description: 'A2000Revised',
      type: OrderLogType.A2000Revised,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.A2000Revised')
    },
    {
      name: 'Credit Pending',
      description: 'CreditPending',
      type: OrderLogType.CreditPending,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.CreditPending')
    },
    {
      name: 'Unshipped',
      description: 'Unshipped',
      type: OrderLogType.Unshipped,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.Unshipped')
    },
    {
      name: 'Partial Ship No Folder',
      description: 'PartialShipNoFolder',
      type: OrderLogType.PartialShipNoFolder,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.PartialShipNoFolder')
    },
    {
      name: 'Partial Ship Folder',
      description: 'PartialShipFolder',
      type: OrderLogType.PartialShipFolder,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.PartialShipFolder')
    },
    {
      name: 'Shipped No Folder',
      description: 'ShippedNoFolder',
      type: OrderLogType.ShippedNoFolder,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.ShippedNoFolder')
    },
    {
      name: 'Shipped Folder',
      description: 'ShippedFolder',
      type: OrderLogType.ShippedFolder,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.ShippedFolder')
    },
    {
      name: 'Invoiced',
      description: 'Invoiced',
      type: OrderLogType.Invoiced,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.Invoiced')
    },
    {
      name: 'POs Assigned',
      description: 'POsAssigned',
      type: OrderLogType.POsAssigned,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.POsAssigned')
    },
    {
      name: 'Cut Tickets Assigned',
      description: 'CutTicketsAssigned',
      type: OrderLogType.CutTicketsAssigned,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.CutTicketsAssigned')
    },
    {
      name: 'Cut Tickets Appr Not Staged',
      description: 'CutTicketsApprNotStaged',
      type: OrderLogType.CutTicketsApprNotStaged,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.CutTicketsApprNotStaged')
    },
    {
      name: 'Outsourced Orders',
      description: 'OutsourcedOrders',
      type: OrderLogType.OutsourcedOrders,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.OutsourcedOrders')
    },
    {
      name: 'Blanks Not Purchased',
      description: 'BlanksNotPurchased',
      type: OrderLogType.BlanksNotPurchased,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.BlanksNotPurchased')
    },
    {
      name: 'Blanks Purchased Not Received',
      description: 'BlanksPurchasedNotReceived',
      type: OrderLogType.BlanksPurchasedNotReceived,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.BlanksPurchasedNotReceived')
    },
    {
      name: 'Trim Not Purchased',
      description: 'TrimNotPurchased',
      type: OrderLogType.TrimNotPurchased,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.TrimNotPurchased')
    },
    {
      name: 'Trim Purchased Not Received',
      description: 'TrimPurchasedNotReceived',
      type: OrderLogType.TrimPurchasedNotReceived,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.TrimPurchasedNotReceived')
    },
    {
      name: 'Partial Ship',
      description: 'PartialShip',
      type: OrderLogType.PartialShip,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.PartialShip')
    },
    {
      name: 'Late Shipments',
      description: 'LateShipments',
      type: OrderLogType.LateShipments,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.LateShipments')
    },
    {
      name: 'Logistics Folder Pending',
      description: 'LogisticsFolderPending',
      type: OrderLogType.LogisticsFolderPending,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.LogisticsFolderPending')
    },
    {
      name: 'OWS / Tech Pack Pending',
      description: 'OWSTechPackPending',
      type: OrderLogType.OWSTechPackPending,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.OWSTechPackPending')
    },
    {
      name: 'Accounting Folder Pending',
      description: 'AccountingFolderPending',
      type: OrderLogType.AccountingFolderPending,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.AccountingFolderPending')
    },
    {
      name: 'Shipped',
      description: 'Shipped',
      type: OrderLogType.Shipped,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.Shipped')
    },
    {
      name: 'EDI Pending',
      description: 'EDIPending',
      type: OrderLogType.EDIPending,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.EDIPending')
    },
    // {
    //   name: 'Partially Scheduled',
    //   description: 'PartiallyScheduled',
    //   type: OrderLogType.PartiallyScheduled,
    //   isActive: false,
    //   isView: this._authService.checkCanView('OrderLog.All.PartiallyScheduled')
    // },
    {
      name: 'Schedulable',
      description: 'Schedulable',
      type: OrderLogType.Schedulable,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.Schedulable')
    },
    {
      name: 'Trim Not Received',
      description: 'TrimNotReceived',
      type: OrderLogType.TrimNotReceived,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.TrimNotReceived')
    },
    {
      name: 'QA Failed',
      description: 'QaFailed',
      type: OrderLogType.QaFailed,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.QaFailed')
    },
    {
      name: 'Cancelled',
      description: 'Cancelled',
      type: OrderLogType.Cancelled,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.Cancelled')
    },
    {
      name: 'Reorders Not Confirmed',
      description: 'ReordersNotConfirmed',
      type: OrderLogType.ReordersNotConfirmed,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.ReordersNotConfirmed')
    },
    {
      name: 'Invalid Days In Transit',
      description: 'InvalidDaysInTransit',
      type: OrderLogType.InvalidDaysInTransit,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.InvalidDaysInTransit')
    },
    {
      name: 'Cut Tickets Needed',
      description: 'CutTicketsNeeded',
      type: OrderLogType.CutTicketsNeeded,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.CutTicketsNeeded')
    },
    {
      name: 'Archived',
      description: 'Archived',
      type: OrderLogType.Archived,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.All.Archived')
    }
  ];
  public orderRoleType: number;
  public isFitContent = false;
  public currentTabScrollX: number;
  public isA2000Dashboard: boolean = false;
  public roleCanEditUnpublish = [
    'Administrator',
    'Account Manager',
    'Account Supervior',
    'Customer Service',
    'Pre-Production'
  ];

  public a2000SyncTask: any;
  public a2000Data;
  public isAllCollapse = true;
  public expandedIds;
  public orderFilterType = '';
  public itemType = '';
  public statusColumns = Columns;
  public commentTypes = TypePrintSchedule;
  public canExportLayout: any = false;

  private _orderLogDataStore = [];
  private _orderLogDataStoreTemp = [];
  private _isPushData = false;
  private _scrollHeight = 300;
  private refreshInterval;

  private _keyword = '';
  private _filterStr = '';
  private _filterStatus = '';
  private _preFilterStr = '';
  private _preFilterStatus = '';
  private _isChangeFilter = false;

  constructor(private _router: Router,
              private _orderMainService: OrderMainService,
              private _localStorageService: LocalStorageService,
              private _validationService: ValidationService,
              private _locationDetailService: LocationDetailService,
              private _ngbDropdownConfig: NgbDropdownConfig,
              private _progressService: ProgressService,
              private _commonService: CommonService,
              private _editUserService: EditUserService,
              private _utilService: Util,
              private _userContext: UserContext,
              private _changeDetectorRef: ChangeDetectorRef,
              private _contextMenuService: ContextMenuService,
              private _authService: AuthService,
              private _styleService: StyleService,
              private _modalService: NgbModal,
              private _toastrService: ToastrService,
              public myDatePickerService: MyDatePickerService) {
    this.currentUserRoles = this._userContext.currentUser.listRoleIds;
    this._ngbDropdownConfig.autoClose = false;
    // --------------
    this.canExportLayout = this._authService.checkPermissionFunc('Orders.LayoutsReportGeneration');
    // Get expanded orderIds
    this.expandedIds = this._localStorageService.get('expandedIds');
    // Config font size
    let fontSize = this._localStorageService.get('fontSize_OrderLog') as string;
    if (fontSize) {
      const modal = {'font-size': fontSize};
      Object.assign(this.myConfigStyle, modal);
      Object.assign(this.myConfigStyleHeader, modal);
    } else {
      this._localStorageService.set('fontSize_OrderLog', this.myConfigStyle['font-size']);
    }
    // --------------

    // Config columns
    let colOrderConfigs = this._userContext.currentUser.orderLogColumnConfig;
    const orderConfig = this._userContext.currentUser
      .permissions.filter((i) => i.type === 2);
    if (colOrderConfigs && colOrderConfigs.length) {
      const colConfigs = colOrderConfigs.filter((i) => i.type === 2);
      if (colConfigs.length !== orderConfig.length) {
        this.showHideColumns = orderConfig;
      } else {
        colConfigs.forEach((i) => {
          let col = orderConfig.find((o) => o.id === i.id);
          if (col) {
            Object.assign(i, col);
          }
        });
        this.showHideColumns = colConfigs;
      }
      const storedColumnConfig = this._userContext.currentUser
        .permissions.filter((i) => i.type === 2);
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
        const sameObj = this._userContext.currentUser.permissions.find((i) => i.name === item.name);
        if (sameObj) {
          item.isModify = sameObj.isModify;
        }
      });
    } else {
      this.showHideColumns = this._userContext.currentUser
        .permissions.filter((i) => i.type === 2);
    }
    this.showHideColumns.forEach((item) => {
      this.columns[item.name] = item.isView;
    });
    this.isCheckedAll = this.showHideColumns.every((i) => i.isView === true);
    this.isShowAllColumns = !!this._localStorageService.get('isShowAll_OrderLog');
    // --------------

    // Config table
    const orderMainPageSize = this._localStorageService.get('orderMainPageSize');
    this.tableConfig = {
      keySort: 'csr',
      orderDescending: false,
      currentPage: this._utilService.currentPage ? this._utilService.currentPage : 1,
      pageSize: orderMainPageSize ? orderMainPageSize : 10,
      loading: false
    };
  }

  /**
   * Init data & Config text on breadcrumb
   */
  public ngOnInit(): void {
    // sort order tab
    this.sortOrderTab();
    // Prevent user navigate to another page when data not loaded yet
    const backdropElm = document.getElementById('backdrop');
    if (backdropElm && backdropElm.className.includes('none')) {
      backdropElm.className = '';
      this._changeDetectorRef.markForCheck();
    }

    this._orderMainService.getA2000SyncTask().subscribe((resp) => {
      if (resp.status) {
        this.a2000SyncTask = resp.data;
      } else {
        this._toastrService.error(resp.errorMessages, 'Error');
      }
    });
    this.configNavTabs().then((status: boolean) => {
      if (status) {
        this.orderLogData = {
          totalRecord: 0,
          data: [],
          selected: {
            isCheckedAll: false,
            isCheckedPage: false,
            itemsChecked: [],
            itemsRemoved: []
          }
        };
        clearInterval(this.refreshInterval);
        if (this.getCurrentTab().name === 'Order Notification') {
          // Prevent user navigate to another page when data not loaded yet
          if (backdropElm && !backdropElm.className.includes('none')) {
            backdropElm.className = 'none';
          }
          return;
        }
        if (this.getCurrentTab().name === 'A2000 Import Errors') {
          this.getA2000Datatable().then((value: boolean) => {
            setTimeout(() => {
              if (this._utilService.scrollElm) {
                this._utilService.scrollElm
                  .scrollTop = this._utilService.scrollPosition;
              }
            }, 200);
          });
        } else {
          let filterStore = this._localStorageService.get('OrderLog_FilterModel');
          if (!filterStore) {
            this.reloadDatatableWithScrollPosition();
            this.onResize();
          }
          this.refreshInterval = setInterval(() => {
            if (!this.isChangePopup) {
              this.refreshDatatable(true, this.tableConfig.currentPage - 1);
            }
          }, 1000 * 60 * this._userContext.currentUser.refreshOrderLogPageTime);
        }
      }
    });
  }

  public ngAfterViewChecked(): void {
    // Check if the table size has changed
    if (this.tableWrapper &&
      this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
      this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
      setTimeout(() => {
        if (this.orderLogTable && !this.isOpenChangePopup && !this.isChangePopup) {
          this.orderLogTable.recalculate();
        }
        this._changeDetectorRef.markForCheck();
      }, 200);
    }
  }

  // -----------------Select Row By Checkbox-----------------
  /**
   * Active/Inactive checkbox when switch page
   */
  public ngAfterViewInit(): void {
    if (this.rowCheckbox) {
      this.rowCheckbox.changes.subscribe((rows: QueryList<ElementRef>) => {
        rows.forEach((row: ElementRef, index) => {
          row.nativeElement.checked = this.orderLogData.selected.isCheckedAll;
          // Ex: id = 'checkbox-4'
          let id = Number.parseInt(row.nativeElement.id.replace('checkbox-', ''));
          let itemCheckedIndex = this.orderLogData.selected.itemsChecked.indexOf(id);
          if (itemCheckedIndex > -1) {
            row.nativeElement.checked = true;
          }
          let itemRemoveIndex = this.orderLogData.selected.itemsRemoved.indexOf(id);
          if (itemRemoveIndex > -1) {
            row.nativeElement.checked = false;
          }
        });

        this.orderLogData.selected.isCheckedPage = !rows
          .some((row) => !row.nativeElement.checked);
        const pageCheckbox: any = document.getElementById('select-all');
        if (pageCheckbox) {
          pageCheckbox.checked = this.orderLogData.selected.isCheckedPage;
        }
        this._changeDetectorRef.markForCheck();
      });
    }
  }

  public getCurrentSelectedItem(): number {
    if (this.orderLogData.selected.isCheckedAll) {
      return this.orderLogData.data.map((i) => i.id)
        .filter((i) => this.orderLogData.selected.itemsRemoved.indexOf(i) === -1).length;
    } else {
      return this.orderLogData.data.map((i) => i.id)
        .filter((i) => this.orderLogData.selected.itemsChecked.indexOf(i) > -1).length;
    }
  }

  public getOtherSelectedItem(): number {
    if (this.orderLogData.selected.isCheckedAll) {
      return this.orderLogData.totalRecord - this.orderLogData.data.length
        - this.orderLogData.selected.itemsRemoved.filter((i) =>
          this.orderLogData.data.map((j) => j.id).indexOf(i) === -1).length;
    } else {
      return this.orderLogData.selected.itemsChecked
        .filter((i) => this.orderLogData.data.map((j) => j.id).indexOf(i) === -1).length;
    }
  }

  /**
   * onAppScroll
   * @param event
   */
  @HostListener('window:scroll', ['$event'])
  public onAppScroll(event: any) {
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
    if (event.target.scrollingElement.scrollTop >= 150
      && this.header && this.header.getBoundingClientRect().top < 0
      && fixedHeader && !fixedHeader.hasChildNodes()) {
      fixedHeader.appendChild(this.cloneHeader);
    } else if ((this.header && this.header.getBoundingClientRect().top >= 0)
      || (event.target.scrollingElement.scrollTop < 150
        && fixedHeader && fixedHeader.hasChildNodes())) {
      while (fixedHeader.firstChild) {
        fixedHeader.removeChild(fixedHeader.firstChild);
      }
    }
  }

  /**
   * Detect resize event of browser
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  public onResize(event?) {
    setTimeout(() => {
      if (this.orderLogHeader && this.orderLogNavTab) {
        let totalWidth = 0;
        for (let child of this.orderLogNavTab.nativeElement.children) {
          totalWidth += child.offsetWidth;
        }
        this.isFitContent = this.orderLogNavTab.nativeElement.offsetWidth < totalWidth;
      }
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  /**
   * updateHeader
   */
  public updateHeader(): void {
    if (this.isA2000Dashboard || this.getCurrentTab().name === 'Order Notification') {
      const dataTableList = document.getElementsByTagName('ngx-datatable');
      if (dataTableList && dataTableList.length) {
        const headerList = dataTableList[0].getElementsByClassName('datatable-header');
        if (headerList && headerList.length) {
          this.header = headerList[0];
          this.cloneHeader = this.header.cloneNode(true);
          this.cloneHeader.className += ' fade-header';
        }
      }
    } else {
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
            if (index === 0) {
              this.cloneHeader.children[index]
                .addEventListener('click', this.collapseAll.bind(this));
              this.cloneHeader.children[index].children[1]
                .addEventListener('click', this.onCheckPage.bind(this));
            }
          });
        }
        this.cloneHeader.className += ' fade-header';
      }
    }
  }

  /**
   * onScrollX
   * @param event
   */
  public onScrollX(event): void {
    this.myConfigStyleHeader = {
      ...this.myConfigStyle,
      left: this.header ? `${this.header.getBoundingClientRect().left}px` : 'auto'
    };
  }

  /**
   * onScrollTabX
   * @param event
   */
  public onScrollTabX(event): void {
    this.currentTabScrollX = event.target.scrollLeft;
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
   * onChangeShowHideColumn
   * @param {boolean} isOpen
   */
  public onChangeShowHideColumn(isOpen: boolean): void {
    if (!isOpen) {
      let isEqual = false;
      this.showHideColumns.every((item) => {
        isEqual = this.columns[item.name] === item.isView;
        return isEqual;
      });
      if (!isEqual) {
        this._progressService.start();
        setTimeout(() => {
          this.showHideColumns.forEach((item) => {
            this.columns[item.name] = item.isView;
          });

          if (this._userContext.currentUser.permissions) {
            const pagePermissions = this._userContext.currentUser.permissions
              .filter((i) => i.type === 1);
            this._editUserService.updateColumnsConfig(this._userContext.currentUser.id,
              this.showHideColumns, 'ORDER_LOG_COLUMN_CONFIG')
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
   * changeFontSize
   * @param {string} fontSize
   */
  public onChangeFontSize(fontSize: string): void {
    this.myConfigStyle['font-size'] = fontSize;
    this.myConfigStyleHeader['font-size'] = fontSize;
    this._localStorageService.set('fontSize_OrderLog', fontSize);
    this._progressService.start();
    if (this.orderLogTable) {
      this.recalculateWidth(this.orderLogTable.columns);
      this.orderLogTable.recalculate();
    }
    setTimeout(() => {
      this.updateHeader();
      this._progressService.done();
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  /**
   * Active nav tab is selected
   * @param url
   */
  public configNavTabs(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const findFirstTab = () => {
        let firstTab = this.tabs.find((tab) => tab.isView);
        if (firstTab) {
          firstTab.isActive = true;
          this.orderRoleType = firstTab.type;
          resolve(true);
        }
      };
      if (this.tabs && this.tabs.length) {
        this.tabs.forEach((tab) => tab.isActive = false);
        // ---------------
        const orderLogCurrentDashboard = this._localStorageService
          .get('OrderLog_CurrentDashboard') as any;
        if (orderLogCurrentDashboard) {
          let preTab = this.tabs
            .find((tab) => tab.isView && tab.name === orderLogCurrentDashboard.name);
          if (preTab) {
            setTimeout(() => {
              this.dashboardScroll.scrollTo(orderLogCurrentDashboard.scrollX, 0);
            });
            preTab.isActive = true;
            this.orderRoleType = preTab.type;
            resolve(true);
          } else {
            findFirstTab();
          }
        } else {
          findFirstTab();
        }
      }
    });
  }

  /**
   * Event switch tab
   * @param index
   */
  public switchTab(event: Event, index: number): void {
    if (this.tabs && this.tabs.length) {
      this.tabs.forEach((tab) => tab.isActive = false);
      this.tabs[index].isActive = true;
      this.orderRoleType = this.tabs[index].type;
      this._localStorageService.set('OrderLog_CurrentDashboard',
        {
          name: this.getCurrentTab().name,
          scrollX: this.currentTabScrollX
        });

      this.orderLogData = {
        totalRecord: 0,
        data: [],
        selected: {
          isCheckedAll: false,
          isCheckedPage: false,
          itemsChecked: [],
          itemsRemoved: []
        }
      };
      clearInterval(this.refreshInterval);
      if (this.getCurrentTab().name === 'Order Notification') {
        return;
      }
      if (this.getCurrentTab().name === 'A2000 Import Errors') {
        this.getA2000Datatable().then((value: boolean) => {
          setTimeout(() => {
            if (this._utilService.scrollElm) {
              this._utilService.scrollElm
                .scrollTop = this._utilService.scrollPosition;
            }
          }, 200);
        });
      } else {
        if (this.orderMainFilterComponent) {
          this._filterStr = this.orderMainFilterComponent.getFilterParam();
          this._filterStatus = this.orderMainFilterComponent.getStatusFilter();
        }
        this.refreshDatatable();
        this.refreshInterval = setInterval(() => {
          if (!this.isChangePopup) {
            this.refreshDatatable(true, this.tableConfig.currentPage - 1);
          }
        }, 1000 * 60 * this._userContext.currentUser.refreshOrderLogPageTime);
      }
    }
  }

  /**
   * Header checkbox event
   * @param isCheckAll
   */
  public onCheckAll(isChecked: boolean): void {
    this.orderLogData.selected.isCheckedAll = isChecked;
    if (this.rowCheckbox) {
      this.rowCheckbox.forEach((row) =>
        row.nativeElement.checked = this.orderLogData.selected.isCheckedAll);
    }
    this.orderLogData.selected.isCheckedPage = false;
    this.orderLogData.selected.itemsChecked = [];
    this.orderLogData.selected.itemsRemoved = [];
  }

  /**
   * Header checkbox event
   * @param onCheckPage
   */
  public onCheckPage(isCheckedPage: any): void {
    if (typeof isCheckedPage === 'object') {
      isCheckedPage = isCheckedPage.currentTarget.children[0].checked;
      this.orderLogData.selected.isCheckedPage = isCheckedPage;
    }
    if (this.rowCheckbox) {
      this.rowCheckbox.forEach((row) => row.nativeElement.checked = isCheckedPage);
    }
    if (!this.orderLogData.selected.isCheckedAll) {
      if (isCheckedPage) {
        this.orderLogData.data.map((i) => i.id).forEach((i) => {
          if (this.orderLogData.selected.itemsChecked.indexOf(i) === -1) {
            this.orderLogData.selected.itemsChecked.push(i);
          }
        });
      } else {
        this.orderLogData.selected.itemsChecked = this.orderLogData.selected.itemsChecked
          .filter((i) => this.orderLogData.data.map((j) => j.id).indexOf(i) === -1);
      }
    } else {
      if (isCheckedPage) {
        this.orderLogData.selected.itemsRemoved = this.orderLogData.selected.itemsRemoved
          .filter((i) => this.orderLogData.data.map((j) => j.id).indexOf(i) === -1);
      } else {
        this.orderLogData.data.map((i) => i.id).forEach((i) => {
          if (this.orderLogData.selected.itemsRemoved.indexOf(i) === -1) {
            this.orderLogData.selected.itemsRemoved.push(i);
          }
        });
      }
    }

    if (!this.orderLogData.selected.isCheckedAll
      && this.orderLogData.selected.itemsChecked.length === this.orderLogData.totalRecord) {
      this.orderLogData.selected.isCheckedAll = true;
      this.orderLogData.selected.itemsChecked = [];
    }
    if (this.orderLogData.selected.isCheckedAll
      && this.orderLogData.selected.itemsRemoved.length === this.orderLogData.totalRecord) {
      this.orderLogData.selected.isCheckedAll = false;
      this.orderLogData.selected.itemsRemoved = [];
    }
  }

  /**
   * Row checkbox event
   * @param $event
   * @param row
   */
  public onRowSelected($event, row: UserInfo): void {
    if ($event.target.checked) {
      if (this.orderLogData.selected.isCheckedAll) {
        let itemIndex = this.orderLogData.selected.itemsRemoved.indexOf(row.id);
        if (itemIndex > -1) {
          this.orderLogData.selected.itemsRemoved.splice(itemIndex, 1);
        }
      } else {
        this.orderLogData.selected.itemsRemoved = [];
        if (this.orderLogData.selected.itemsChecked.indexOf(row.id) === -1) {
          this.orderLogData.selected.itemsChecked.push(row.id);
        }
        if (this.orderLogData.selected.itemsChecked
          .length === this.orderLogData.totalRecord) {
          this.orderLogData.selected.isCheckedAll = true;
        }
      }

      if (this.orderLogData.selected.itemsChecked
        .length === this.orderLogData.data.length) {
        this.orderLogData.selected.isCheckedPage = true;
        const pageCheckbox: any = document.getElementById('select-all');
        if (pageCheckbox) {
          pageCheckbox.checked = this.orderLogData.selected.isCheckedPage;
        }
      }
    } else {
      if (this.orderLogData.selected.isCheckedAll) {
        this.orderLogData.selected.itemsChecked = [];
        // Avoid duplicate value in array
        if (this.orderLogData.selected.itemsRemoved.indexOf(row.id) === -1) {
          this.orderLogData.selected.itemsRemoved.push(row.id);
        }
        if (this.orderLogData.selected.itemsRemoved.length === this.orderLogData.totalRecord) {
          this.orderLogData.selected.isCheckedAll = false;
        }
      } else {
        let itemIndex = this.orderLogData.selected.itemsChecked.indexOf(row.id);
        if (itemIndex > -1) {
          this.orderLogData.selected.itemsChecked.splice(itemIndex, 1);
        }
      }

      if (this.orderLogData.selected.itemsChecked
        .length < this.orderLogData.data.length) {
        this.orderLogData.selected.isCheckedPage = false;
        const pageCheckbox: any = document.getElementById('select-all');
        if (pageCheckbox) {
          pageCheckbox.checked = this.orderLogData.selected.isCheckedPage;
        }
      }
    }
  }

  /**
   * Uncheck all checkbox in table
   */
  public resetRowSelected(): void {
    this.orderLogData.selected = {
      isCheckedAll: false,
      isCheckedPage: false,
      itemsChecked: [],
      itemsRemoved: []
    };
    if (this.rowCheckbox) {
      this.rowCheckbox.forEach((row) => row.nativeElement.checked = false);
    }
  }

  public isSelectedRow(rowId: number): boolean {
    if (isNaN(rowId)) {
      return;
    }
    if (this.orderLogData.selected.isCheckedAll || this.orderLogData.selected.isCheckedPage) {
      return this.orderLogData.selected.itemsRemoved.indexOf(rowId) === -1;
    } else {
      return this.orderLogData.selected.itemsChecked.indexOf(rowId) > -1;
    }
  }

  public onRemoveOtherChecked(): void {
    if (this.orderLogData.selected.isCheckedAll) {
      this.orderLogData.selected.isCheckedAll = false;
      this.orderLogData.selected.itemsChecked = this.orderLogData.data.map((i) => i.id)
        .filter((i) =>  this.orderLogData.selected.itemsRemoved.indexOf(i) === -1);
      this.orderLogData.selected.itemsRemoved = [];
    } else {
      this.orderLogData.selected.itemsChecked = this.orderLogData.selected.itemsChecked
        .filter((i) => this.orderLogData.data.map((j) => j.id).indexOf(i) > -1);
    }
  }

  /**
   * recalculateWidth
   * @param {TableColumn[]} columns
   */
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
      if (this.isOpenChangePopup) {
        return;
      }
      this._utilService.currentPage = this.tableConfig.currentPage;
    }
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
    if (!this._authService
      .checkCanModify(`OrderLog.All.${this.getCurrentTab()
        ? this.getCurrentTab().description : ''}`)) {
      return false;
    }
    if (this.getCurrentTab() && this.getCurrentTab().description === 'Unpublished') {
      return _.intersection(this.roleCanEditUnpublish,
        this._userContext.currentUser.listRole.map((r) => r.roleName)).length > 0;
    }
    const colObj = this.showHideColumns.find((i) => i.description === colName);
    if (colObj) {
      return this._authService
        .checkCanModify(`OrderLog.All.${this.getCurrentTab()
          ? this.getCurrentTab().description : ''}`) && colObj.isModify;
    }
    return false;
  }

  /**
   * canModifyOrders
   * @returns {boolean}
   */
  public canModifyOrders(): boolean {
    return this._authService.checkCanModify(`OrderLog.All.${this.getCurrentTab()
      ? this.getCurrentTab().name.replace(/\s/g, '') : ''}`)
      && this._authService.checkCanModify('Orders');
  }

  /**
   * getCurrentTab
   * @returns {any}
   */
  public getCurrentTab(): any {
    return this.tabs.find((i) => i.isActive);
  }

  /**
   * goToStyleSetup
   * @param {number} orderId
   */
  public goToStyleSetup(orderId: number): void {
    if (this._authService.checkCanView('Orders')) {
      this._utilService.scrollPosition = this._utilService
        .scrollElm.scrollTop;
      this._router.navigate([
        'order-log-v2',
        orderId,
        'styles'
      ]);
    }
  }

  /**
   * goToStyle
   * @param {number} orderId
   * @param {number} styleId
   */
  public goToStyle(orderId: number, styleId: number): void {
    if (this._authService.checkCanView('Orders')) {
      this._utilService.scrollPosition = this._utilService
        .scrollElm.scrollTop;
      this._router.navigate([
        'order-log-v2',
        orderId,
        'styles',
        styleId
      ]);
    }
  }

  /**
   * goToPrintLocation
   * @param {number} orderId
   * @param {number} styleId
   * @param {number} printLocationId
   */
  public goToPrintLocation(orderId: number,
                           styleId: number,
                           printLocationId: number): void {
    if (this._authService.checkCanView('Orders')) {
      this._utilService.scrollPosition = this._utilService
        .scrollElm.scrollTop;
      this._router
        .navigate([
          'order-log-v2',
          orderId,
          'styles',
          styleId,
          'print-location',
          printLocationId
        ]);
    }
  }

  /**
   * goToOrderInfo
   * @param {number} orderId
   */
  public goToOrderInfo(ev, orderId: number): void {
    if (ev.view.getSelection().toString().length > 0) {
      ev.preventDefault();
      return;
    }
    if (this._authService.checkCanView('Orders')) {
      this._utilService.scrollPosition = this._utilService
        .scrollElm.scrollTop;
      this._router.navigate([
        'order-log-v2',
        orderId,
        'order-info'
      ]);
    }
  }

  /**
   * onChangeCreditApproval
   * @param row
   * @param rowDetail
   */
  public onChangeCreditApproval(ev, row, rowDetail): void {
    if (ev.view.getSelection().toString().length > 0) {
      ev.preventDefault();
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Credit Approval')
        && !row.orderLogInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(CreditApprovalComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);
        modalRef.result.then((res) => {
          if (res) {
            const modal = {
              ...res
            };
            this._orderMainService.changeStatusColumn(row.id, Columns.CreditApproval,
              this.orderFilterType, this.itemType, modal)
              .subscribe((resp: ResponseMessage<any>) => {
                this.isChangePopup = false;

                if (resp.status) {
                  Object.assign(rowDetail, resp.data.creditApproval);
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

  /**
   * onChangeTrimEta
   * @param row
   * @param rowDetails
   * @param rowDetail
   */
  public onChangeTrimEta(row, rowDetails, rowDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && !row.orderLogInfo.isCancelled
        && (!rowDetails || (rowDetails && !rowDetails.styleInfo.isCancelled))) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(TrimEtaComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: !rowDetail ? 'eta-xs' : rowDetail.totalTrims >= 3 ? 'eta-lg'
            : rowDetail.totalTrims >= 2 ? 'eta-sm' : 'eta-xs'
        });
        modalRef.componentInstance.orderId = +row.id;
        modalRef.componentInstance.orderDetailId = +rowDetails.orderDetailId;
        // ----------------------
        modalRef.componentInstance.styleList = row.orderDetails.filter((order) =>
          order.styleInfo && !order.styleInfo.isCancelled);
        modalRef.componentInstance.rowDetails = Object.assign({}, rowDetails);
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);
        modalRef.componentInstance.isPageReadOnly = !this.canModifyCols('Trim ETA / Rcvd');

        modalRef.result.then((res) => {
          if (res) {
            if (res.status) {
              const modal = {
                listUpdateTrimEta: res.data.listPurchasing,
                isChanged: res.data.isChanged,
                orderDetailId: rowDetails ? +rowDetails.orderDetailId : row.orderDetails[0]
                  ? +row.orderDetails[0].orderDetailId : ''
              };
              this._orderMainService.changeStatusColumn(row.id, Columns.TrimEta,
                this.orderFilterType, this.itemType, modal)
                .subscribe((resp: ResponseMessage<any>) => {
                  this.isChangePopup = false;

                  if (resp.status) {
                    this.addNullDetails(resp.data);
                    Object.assign(row, resp.data);
                    this.trimEtaStatus(row);
                    this._changeDetectorRef.markForCheck();
                    this._toastrService.success(resp.message, 'Success');
                  } else {
                    this._toastrService.error(resp.errorMessages, 'Error');
                  }
                });
            } else {
              if (rowDetail) {
                Object.assign(rowDetail, res.data);
              }
            }
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

  /**
   * onChangeBlankGoods
   * @param row
   * @param rowDetails
   * @param rowDetail
   */
  public onChangeBlankGoods(row, rowDetails, rowDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && !row.orderLogInfo.isCancelled
        && !rowDetails.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(BlankGoodsComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: !rowDetail ? 'eta-xs' : rowDetail.totalBlanks >= 3 ? 'eta-lg'
            : rowDetail.totalBlanks >= 2 ? 'eta-sm' : 'eta-xs'
        });
        modalRef.componentInstance.orderId = row.id;
        modalRef.componentInstance.styleId = rowDetails ? rowDetails.orderDetailId : '';
        modalRef.componentInstance.rowDetails = Object.assign({}, rowDetails);
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);
        modalRef.componentInstance.isBlankNotApplicable = rowDetails.isBlankNotApplicable;
        modalRef.componentInstance.styleList = row.orderDetails.filter((order) =>
          order.styleInfo && !order.styleInfo.isCancelled);
        modalRef.componentInstance.isPageReadOnly = !this.canModifyCols('Blank Goods ETA / Rcvd');

        modalRef.result.then((res) => {
          if (res) {
            if (res.status) {
              const modal = {
                orderDetailId: rowDetails.orderDetailId,
                isChanged: res.data.isChanged,
                listUpdateBlankGoodsEta: res.data.blankGoods
              };
              this._orderMainService.changeStatusColumn(row.id, Columns.BlankGoodsEta,
                this.orderFilterType, this.itemType, modal)
                .subscribe((resp: ResponseMessage<any>) => {
                  this.isChangePopup = false;

                  if (resp.status) {
                    this.addNullDetails(resp.data);
                    Object.assign(row, resp.data);
                    this.blankEtaStatus(row);
                    this._changeDetectorRef.markForCheck();
                    this._toastrService.success(resp.message, 'Success');
                  } else {
                    this._toastrService.error(resp.errorMessages, 'Error');
                  }
                });
            } else {
              if (res.data && rowDetail) {
                Object.assign(rowDetail, res.data);
              }
            }
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

  /**
   * onChangeCutTicket
   * @param row
   * @param rowDetails
   * @param rowDetail
   */
  public onChangeCutTicket(row, rowDetails, rowDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Cut Ticket Created')
        && !row.orderLogInfo.isCancelled
        && !rowDetails.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(CutTicketComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static'
        });
        modalRef.componentInstance.orderId = row.id;
        modalRef.componentInstance.orderDetailId = rowDetails.orderDetailId;
        modalRef.componentInstance.styleList = row.orderDetails.filter((order) =>
          order.styleInfo && !order.styleInfo.isCancelled);
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);

        modalRef.result.then((res) => {
          if (res) {
            const modal = {
              ...res
            };
            this._orderMainService.changeStatusColumn(row.id, Columns.CutTicketCreated,
              this.orderFilterType, this.itemType, modal)
              .subscribe((resp: ResponseMessage<any>) => {
                this.isChangePopup = false;

                if (resp.status) {
                  this.addNullDetails(resp.data);
                  Object.assign(row, resp.data);
                  this._changeDetectorRef.markForCheck();
                  this._toastrService.success(resp.message, 'Success');
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
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

  /**
   * onChangeOrderStaged
   * @param row
   * @param rowDetails
   * @param rowDetail
   */
  public onChangeOrderStaged(row, rowDetails, rowDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Order Staged')
        && !row.orderLogInfo.isCancelled
        && !rowDetails.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(OrderStagedComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);

        modalRef.result.then((res) => {
          if (res) {
            const modal = {
              ...res,
              orderDetailId: rowDetails.orderDetailId
            };
            this._orderMainService.changeStatusColumn(row.id, Columns.OrderStaged,
              this.orderFilterType, this.itemType, modal)
              .subscribe((resp: ResponseMessage<any>) => {
                this.isChangePopup = false;

                if (resp.status) {
                  this.addNullDetails(resp.data);
                  Object.assign(row, resp.data);
                  this._changeDetectorRef.markForCheck();
                  this._toastrService.success(resp.message, 'Success');
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
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

  /**
   * onChangeTechPackReady
   * @param row
   * @param rowDetail
   */
  public onChangeTechPackReady(row, rowDetails, rowDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('OWS / Tech Pack Ready')
        && !row.orderLogInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(TeckPackReadyComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'super-lg'
        });
        modalRef.componentInstance.orderId = row.id;
        modalRef.componentInstance.orderDetailId = rowDetails ? +rowDetails.orderDetailId : '';
        modalRef.componentInstance.styleList = row.orderDetails.filter((order) =>
          order.styleInfo && !order.styleInfo.isCancelled);
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);

        modalRef.result.then((res) => {
          if (res) {
            if (res.status) {
              const modal = {
                ...res.data
              };
              this._orderMainService.changeStatusColumn(row.id, Columns.TechPackReady,
                this.orderFilterType, this.itemType, modal)
                .subscribe((resp: ResponseMessage<any>) => {
                  this.isChangePopup = false;

                  if (resp.status) {
                    this.addNullDetails(resp.data);
                    Object.assign(row, resp.data);
                    this._changeDetectorRef.markForCheck();
                    this._toastrService.success(resp.message, 'Success');
                  } else {
                    this._toastrService.error(resp.errorMessages, 'Error');
                  }
                });
            } else {
              if (rowDetail && res.data) {
                Object.assign(rowDetail, res.data);
              }
            }
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

  /**
   * onChangeArtReleased
   * @param rows
   * @param row
   * @param rowDetails
   * @param rowDetail
   */
  public onChangeArtReleased(rows, row, rowDetails, rowDetail, ii, printLocationId): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Art Released') && !row.isReorder
        && !rows.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(ArtReleasedComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);

        modalRef.result.then((res) => {
          if (res) {
            const modal = {
              ...res,
              orderDetailId: row.orderDetailId,
              printLocationId: rowDetails.printLocationId
            };
            this._orderMainService.changeStatusColumn(rows.id, Columns.ArtReleased,
              this.orderFilterType, this.itemType, modal)
              .subscribe((resp: ResponseMessage<any>) => {
                this.isChangePopup = false;

                if (resp.status) {
                  if (resp.data.orderDetails && resp.data.orderDetails[ii]
                    && resp.data.orderDetails[ii].printLocations) {
                    let print = _.find(resp.data.orderDetails[ii].printLocations, (p: any) => {
                      return p.printLocationId === printLocationId;
                    });
                    Object.assign(rowDetail, print ? print.artReleased : undefined);
                  }
                  this._changeDetectorRef.markForCheck();
                  this._toastrService.success(resp.message, 'Success');
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
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

  /**
   * onChangePrintApproval
   * @param rows
   * @param row
   * @param rowDetails
   * @param rowDetail
   */
  public onChangePrintApproval(rows, row, rowDetails, rowDetail, ii, printLocationId): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Print Approval')
        && (!row.isReorder || !row.isTscFactory)
        && !rows.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(SampleApprovalComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);

        modalRef.result.then((res) => {
          if (res) {
            const modal = {
              ...res,
              orderDetailId: row.orderDetailId,
              printLocationId: rowDetails.printLocationId
            };
            this._orderMainService.changeStatusColumn(rows.id, Columns.SampleApproval,
              this.orderFilterType, this.itemType, modal)
              .subscribe((resp: ResponseMessage<any>) => {
                this.isChangePopup = false;

                if (resp.status) {
                  if (resp.data.orderDetails && resp.data.orderDetails[ii]
                    && resp.data.orderDetails[ii].printLocations) {
                    let print = _.find(resp.data.orderDetails[ii].printLocations, (p: any) => {
                      return p.printLocationId === printLocationId;
                    });
                    Object.assign(rowDetail, print ? print.printApproval : undefined);
                  }
                  this.printApprovalStatus(rows);
                  this._changeDetectorRef.markForCheck();
                  this._toastrService.success(resp.message, 'Success');
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
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
    }, 300);
  }

  /**
   * onChangeFolderReady
   * @param row
   * @param rowDetail
   */
  public onChangeFolderReady(row, rowDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Order Documentation')
        && !row.orderLogInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(FolderReadyComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static'
        });
        modalRef.componentInstance.orderId = row.id;
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);

        modalRef.result.then((res) => {
          if (res) {
            if (res.status) {
              const modal = {
                ...res.data
              };
              this._orderMainService.changeStatusColumn(row.id, Columns.OrderDocumentation,
                this.orderFilterType, this.itemType, modal)
                .subscribe((resp: ResponseMessage<any>) => {
                  this.isChangePopup = false;

                  if (resp.status) {
                    this.addNullDetails(resp.data);
                    Object.assign(row, resp.data);
                    this._changeDetectorRef.markForCheck();
                    // }
                    this._toastrService.success(resp.message, 'Success');
                  } else {
                    this._toastrService.error(resp.errorMessages, 'Error');
                  }
                });
            } else {
              if (rowDetail && res.data) {
                Object.assign(rowDetail, res.data);
              }
            }
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

  /**
   * onChangePrintDate
   * @param rows
   * @param row
   * @param rowDetails
   * @param rowDetail
   */
  public onChangePrintDate(rows, row, rowDetails, rowDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Print Date')
        && !rows.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(PrintDateComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: rowDetail.totalScheduler >= 3 ? 'eta-lg'
            : rowDetail.totalScheduler >= 2 ? 'eta-sm' : 'eta-xs'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);
        modalRef.componentInstance.printLocationId = rowDetails.printLocationId;
        modalRef.componentInstance.orderId = rows.id;
        modalRef.result.then((res) => {
          if (res) {
            const modal = res;
            this._orderMainService
              .updateScheduleColumnsInfo(rows.id, TypePrintSchedule.Print, modal)
              .subscribe((resp: ResponseMessage<any>) => {
                this.isChangePopup = false;
                if (resp.status) {
                  Object.assign(rowDetail, resp.data);
                  this.printDateStatus(rows);
                  this._changeDetectorRef.markForCheck();
                  this._toastrService.success(resp.message, 'Success');
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
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

  public onUpdateSchedulerStatus(order, schedule,
                                 type: string,
                                 printLocationId: number,
                                 neckLabelId: number,
                                 orderDetailId: number): void {
    if (this.canModifyCols(type)) {
      this._orderMainService
        .updateSchedulerStatus(printLocationId, neckLabelId, orderDetailId)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            schedule.status = this.taskStatus.BLANK;
            schedule.fullName = resp.data;
            this.printDateStatus(order);
            this.statusByProp(order, 'neckLabelDate');
            this.statusByProp(order, 'finishingDate');
            this._changeDetectorRef.markForCheck();
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
  }

  /**
   * onChangeNeckLabelApproval
   * @param event
   * @param row
   * @param rowDetails
   * @param rowDetail
   */
  public onChangeNeckLabelApproval(event, row, rowDetails, rowDetail): void {
    if (event.target.nodeName === 'IMG' || rowDetail.noNeckLabel === true) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Neck Label Approval')
        && !rowDetails.isReorder
        && !row.orderLogInfo.isCancelled
        && !rowDetails.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(NeckLabelApprovalComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);

        modalRef.result.then((res) => {
          if (res) {
            const modal = {
              ...res,
              orderDetailId: rowDetails.orderDetailId,
              neckLabelId: rowDetail.neckLabelId
            };
            this._orderMainService.changeStatusColumn(row.id, Columns.NeckLabelApproval,
              this.orderFilterType, this.itemType, modal)
              .subscribe((resp: ResponseMessage<any>) => {
                this.isChangePopup = false;

                if (resp.status) {
                  this.addNullDetails(resp.data);
                  Object.assign(row, resp.data);
                  this._changeDetectorRef.markForCheck();
                  this._toastrService.success(resp.message, 'Success');
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
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

  /**
   * onChangeNeckLabelDate
   * @param row
   * @param rowDetails
   * @param rowDetail
   */
  public onChangeNeckLabelDate(row, rowDetails, rowDetail): void {
    if (rowDetail.noNeckLabel) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Neck Label Date')
        && !row.orderLogInfo.isCancelled
        && !rowDetails.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(NeckLabelDateComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: rowDetail.totalScheduler >= 3 ? 'eta-lg'
            : rowDetail.totalScheduler >= 2 ? 'eta-sm' : 'eta-xs'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);
        modalRef.componentInstance.neckLabelId = rowDetails.neckLabelId;
        modalRef.componentInstance.orderId = row.id;

        modalRef.result.then((res) => {
          if (res) {
            const modal = res;
            this._orderMainService
              .updateScheduleColumnsInfo(row.id, TypePrintSchedule.NeckLabel, modal)
              .subscribe((resp: ResponseMessage<any>) => {
                this.isChangePopup = false;

                if (resp.status) {
                  Object.assign(rowDetail, resp.data);
                  this.statusByProp(row, 'neckLabelDate');
                  this._changeDetectorRef.markForCheck();
                  this._toastrService.success(resp.message, 'Success');
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
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

  /**
   * onChangeSpecialtyTreatment
   * @param row
   * @param rowDetails
   * @param rowDetail
   */
  public onChangeSpecialtyTreatment(row, rowDetails, rowDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Specialty Treatment Date')
        && !rowDetails.isReorder
        && !row.orderLogInfo.isCancelled
        && !rowDetails.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(SpecialtyTreatmentComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);

        modalRef.result.then((res) => {
          if (res) {
            const modal = {
              ...res,
              orderDetailId: rowDetails.orderDetailId
            };
            this._orderMainService.changeStatusColumn(row.id, Columns.SpecialtyTreatmentDate,
              this.orderFilterType, this.itemType, modal)
              .subscribe((resp: ResponseMessage<any>) => {
                this.isChangePopup = false;

                if (resp.status) {
                  this.addNullDetails(resp.data);
                  Object.assign(row, resp.data);
                  this._changeDetectorRef.markForCheck();
                  this._toastrService.success(resp.message, 'Success');
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
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

  /**
   * onChangeFinishingDate
   * @param row
   * @param rowDetails
   * @param rowDetail
   */
  public onChangeFinishingDate(row, rowDetails, rowDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Finishing Date')
        && !row.orderLogInfo.isCancelled
        && !rowDetails.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(FinishingDateComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: rowDetail.totalScheduler >= 3 ? 'super-lg'
            : rowDetail.totalScheduler >= 2 ? 'eta-lg' : 'eta-sm'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);
        modalRef.componentInstance.orderDetailId = rowDetails.orderDetailId;
        modalRef.componentInstance.orderId = row.id;

        modalRef.result.then((res) => {
          if (res) {
            const modal = res;
            this._orderMainService
              .updateScheduleColumnsInfo(row.id, TypePrintSchedule.Finishing, modal)
              .subscribe((resp: ResponseMessage<any>) => {
                this.isChangePopup = false;
                if (resp.status) {
                  Object.assign(rowDetail, resp.data);
                  this.statusByProp(row, 'finishingDate');
                  this._changeDetectorRef.markForCheck();
                  this._toastrService.success(resp.message, 'Success');
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
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

  public onChangeShippingLabelsTscPackingList(row, rowDetails, rowDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Shipping Labels')
        && !row.orderLogInfo.isCancelled
        && !rowDetails.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(ShippingLabelsTscComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-sm'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);
        modalRef.componentInstance.orderId = row.id;
        modalRef.componentInstance.orderDetailId = rowDetails.orderDetailId;
        modalRef.result.then((res) => {
          if (res.status) {
            const modal = {
              shippingLabelsRequest: {
                ...res.data
              },
              orderDetailId: rowDetails.orderDetailId
            };
            this._orderMainService.changeStatusColumn(row.id, Columns.ShippingLabels,
              this.orderFilterType, this.itemType, modal)
              .subscribe((resp: ResponseMessage<any>) => {
                this.isChangePopup = false;

                if (resp.status) {
                  this.addNullDetails(resp.data);
                  Object.assign(row, resp.data);
                  this._changeDetectorRef.markForCheck();
                  this._toastrService.success(resp.message, 'Success');
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
          } else {
            rowDetail.shippingLabelsTscPackingListIsUploaded = res.data.isUploaded;
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

  public onChangeEtaTsc(row, rowDetails, rowDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('ETA @ TSC')
        && !row.orderLogInfo.isCancelled
        && !rowDetails.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(EtaTscComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-sm'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);
        modalRef.componentInstance.orderId = row.id;
        modalRef.componentInstance.orderDetailId = rowDetails.orderDetailId;
        modalRef.result.then((res) => {
          if (res) {
            const modal = {
              etaTscRequest: {
                ...res
              },
              orderDetailId: rowDetails.orderDetailId
            };
            this._orderMainService.changeStatusColumn(row.id, Columns.EtaTsc,
              this.orderFilterType, this.itemType, modal)
              .subscribe((resp: ResponseMessage<any>) => {
                this.isChangePopup = false;

                if (resp.status) {
                  this.addNullDetails(resp.data);
                  Object.assign(row, resp.data);
                  this._changeDetectorRef.markForCheck();
                  this._toastrService.success(resp.message, 'Success');
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
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

  /**
   * onChangePickPackDate
   * @param row
   * @param rowDetails
   * @param rowDetail
   */
  public onChangePickPackDate(row, rowDetails, rowDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Pick & Pack Date')
        && !row.orderLogInfo.isCancelled
        && !rowDetails.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(PickPackDateComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);

        modalRef.result.then((res) => {
          if (res) {
            const modal = {
              ...res,
              orderDetailId: rowDetails.orderDetailId
            };
            this._orderMainService.changeStatusColumn(row.id, Columns.PickAndPackDate,
              this.orderFilterType, this.itemType, modal)
              .subscribe((resp: ResponseMessage<any>) => {
                this.isChangePopup = false;

                if (resp.status) {
                  this.addNullDetails(resp.data);
                  Object.assign(row, resp.data);
                  this._changeDetectorRef.markForCheck();
                  this._toastrService.success(resp.message, 'Success');
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
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

  /**
   * onChangeQA
   * @param row
   * @param rowDetails
   * @param rowDetail
   */
  public onChangeQA(row, rowDetails, rowDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('QA')
        && !row.orderLogInfo.isCancelled
        && !rowDetails.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(QaComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);
        modalRef.componentInstance.styleId = rowDetails.orderDetailId;

        modalRef.result.then((res) => {
          if (res) {
            const modal = {
              ...res,
              orderDetailId: rowDetails.orderDetailId
            };
            this._orderMainService.changeStatusColumn(row.id, Columns.QA,
              this.orderFilterType, this.itemType, modal)
              .subscribe((resp: ResponseMessage<any>) => {
                this.isChangePopup = false;

                if (resp.status) {
                  this.addNullDetails(resp.data);
                  Object.assign(row, resp.data);
                  this._changeDetectorRef.markForCheck();
                  this._toastrService.success(resp.message, 'Success');
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
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

  /**
   * onChangeReadyToShipDate
   * @param row
   * @param rowDetail
   */
  public onChangeReadyToShipDate(row, rowDetails, rowDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Ready to Ship Date')
        && !row.orderLogInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(ReadyToShipComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'super-lg'
        });
        modalRef.componentInstance.orderId = row.id;
        modalRef.componentInstance.orderFilterType = this.orderFilterType;
        modalRef.componentInstance.itemType = this.itemType;
        modalRef.componentInstance.orderDetailId = rowDetails ? +rowDetails.orderDetailId : '';
        modalRef.componentInstance.styleList = row.orderDetails.filter((order) =>
          order.styleInfo && !order.styleInfo.isCancelled);
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);

        modalRef.result.then((res) => {
          if (res) {
            this.isChangePopup = false;
            this.addNullDetails(res);
            Object.assign(row, res);
            this._changeDetectorRef.markForCheck();
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

  /**
   * onChangeActualToShipDate
   * @param row
   * @param rowDetail
   */
  public onChangeActualToShipDate(row, rowDetails, rowDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Actual Ship Date')
        && !row.orderLogInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(ActualToShipComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'super-lg'
        });
        modalRef.componentInstance.orderId = row.id;
        modalRef.componentInstance.orderFilterType = this.orderFilterType;
        modalRef.componentInstance.itemType = this.itemType;
        modalRef.componentInstance.orderDetailId = rowDetails ? +rowDetails.orderDetailId : '';
        modalRef.componentInstance.styleList = row.orderDetails.filter((order) =>
          order.styleInfo && !order.styleInfo.isCancelled);
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);

        modalRef.result.then((res) => {
          if (res) {
            this.isChangePopup = false;
            this.addNullDetails(res);
            Object.assign(row, res);
            this.statusByProp(row, 'actualToShipDate');
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

  /**
   * onChangeFolderSubmittedToAccounting
   * @param row
   * @param rowDetail
   */
  public onChangeFolderSubmittedToAccounting(row, rowDetails, rowDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Shipping Documentation')
        && !row.orderLogInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(FolderSubmittedComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'super-lg'
        });
        modalRef.componentInstance.orderId = row.id;
        modalRef.componentInstance.orderDetailId = rowDetails ? +rowDetails.orderDetailId : '';
        modalRef.componentInstance.styleList = row.orderDetails.filter((order) =>
          order.styleInfo && !order.styleInfo.isCancelled);
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);

        modalRef.result.then((res) => {
          if (res) {
            const modal = {
              ...res
            };
            this._orderMainService.changeStatusColumn(row.id, Columns.ShippingDocumentation,
              this.orderFilterType, this.itemType, modal)
              .subscribe((resp: ResponseMessage<any>) => {
                this.isChangePopup = false;

                if (resp.status) {
                  this.addNullDetails(resp.data);
                  Object.assign(row, resp.data);
                  this._changeDetectorRef.markForCheck();
                  this._toastrService.success(resp.message, 'Success');
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
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

  /**
   * onChangeInvoiced
   * @param row
   * @param rowDetail
   */
  public onChangeInvoiced(row, rowDetails, rowDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Invoiced')
        && !row.orderLogInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(InvoicedComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'super-lg'
        });
        modalRef.componentInstance.orderId = row.id;
        modalRef.componentInstance.orderDetailId = rowDetails ? +rowDetails.orderDetailId : '';
        modalRef.componentInstance.styleList = row.orderDetails.filter((order) =>
          order.styleInfo && !order.styleInfo.isCancelled);
        modalRef.componentInstance.rowDetail = Object.assign({}, rowDetail);

        modalRef.result.then((res) => {
          if (res) {
            const modal = {
              ...res
            };
            this._orderMainService.changeStatusColumn(row.id, Columns.Invoiced,
              this.orderFilterType, this.itemType, modal)
              .subscribe((resp: ResponseMessage<any>) => {
                this.isChangePopup = false;

                if (resp.status) {
                  this.addNullDetails(resp.data);
                  Object.assign(row, resp.data);
                  this.statusByProp(row, 'invoiced');
                  this._changeDetectorRef.markForCheck();
                  this._toastrService.success(resp.message, 'Success');
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
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

  /**
   * openUploader
   * @param {number} orderId
   * @param {number} type
   * @param {string} title
   */
  public openUploader(orderId: number, type: number, title: string): void {
    this.isChangePopup = true;
    setTimeout(() => {
      this.isOpenChangePopup = false;
      let fileList = [];
      this._orderMainService.getOrderFileByType(orderId, type)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            fileList = Object.assign([], resp.data);
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
              uploadType: type < 2 ? this.uploadedType.PoFiles : type < 4
                ? this.uploadedType.CutTickets : (type === 4 ? this.uploadedType.OrderWorkSheets
                  : this.uploadedType.TechPacks),
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

  public openShippingTscUploader(orderDetailId: number): void {
    this.isChangePopup = true;
    setTimeout(() => {
      this.isOpenChangePopup = false;
      let fileList = [];
      this._styleService.getStyleFiles(orderDetailId)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            fileList = Object.assign([], resp.data.filter((i) => [
              this.styleUploadedType.ShippingLabels,
              this.styleUploadedType.TscPackingList
            ].indexOf(i.type) > -1));
            let modalRef = this._modalService.open(UploaderTypeComponent, {
              size: 'lg',
              keyboard: false,
              backdrop: 'static',
              windowClass: 'super-lg'
            });
            modalRef.componentInstance.title = 'Shipping Labels / TSC Packing List';
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

  public openFactoryCIUploader(orderDetailId: number): void {
    this.isChangePopup = true;
    setTimeout(() => {
      this.isOpenChangePopup = false;
      let fileList = [];
      this._styleService.getStyleFiles(orderDetailId)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            fileList = Object.assign([], resp.data.filter((i) => [
              this.styleUploadedType.FactoryPackingList,
              this.styleUploadedType.CommercialInvoice
            ].indexOf(i.type) > -1));
            let modalRef = this._modalService.open(UploaderTypeComponent, {
              size: 'lg',
              keyboard: false,
              backdrop: 'static',
              windowClass: 'super-lg'
            });
            modalRef.componentInstance.title = 'Factory Packing List / CI';
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

  /**
   * openOWSTeckPackUploader
   * @param {number} orderId
   * @param {string} title
   */
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

  /**
   * openStyleUploader
   * @param {number} styleId
   * @param {number} type
   * @param {string} title
   */
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

  /**
   * openTrimUploader
   * @param {number} orderId
   * @param {number} orderDetailId
   */
  public openTrimUploader(orderDetailId: number): void {
    this.isChangePopup = true;
    setTimeout(() => {
      this.isOpenChangePopup = false;
      let fileList = [];
      this._orderMainService.getAllTrimFiles(orderDetailId)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            fileList = Object.assign([], resp.data);
            let modalRef = this._modalService.open(UploaderTypeComponent, {
              size: 'lg',
              keyboard: false,
              backdrop: 'static',
              windowClass: 'super-lg'
            });
            modalRef.componentInstance.title = 'Trims';
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

  /**
   * openBlankUploader
   * @param orderDetailId
   */
  public openBlankUploader(orderDetailId): void {
    this.isChangePopup = true;
    setTimeout(() => {
      this.isOpenChangePopup = false;
      let fileList = [];
      this._orderMainService.getAllBlankFiles(orderDetailId)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            fileList = Object.assign([], resp.data);
            let modalRef = this._modalService.open(UploaderTypeComponent, {
              size: 'lg',
              keyboard: false,
              backdrop: 'static',
              windowClass: 'super-lg'
            });
            modalRef.componentInstance.title = 'Blanks';
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

  /**
   * openBlankUploader
   * @param orderDetailId
   */
  public openQAUploader(orderDetailId): void {
    this.isChangePopup = true;
    setTimeout(() => {
      this.isOpenChangePopup = false;
      let fileList = [];
      this._orderMainService.getStyleFilesById(orderDetailId)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            fileList = Object.assign([], resp.data
              .filter((i) => i.type === this.styleUploadedType.QA));
            let modalRef = this._modalService.open(UploaderTypeComponent, {
              size: 'lg',
              keyboard: false,
              backdrop: 'static',
              windowClass: 'super-lg'
            });
            modalRef.componentInstance.title = 'QA';
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

  /**
   * openFolderReadyUploader
   * @param {number} orderId
   */
  public openFolderReadyUploader(orderId: number): void {
    this.isChangePopup = true;
    setTimeout(() => {
      this.isOpenChangePopup = false;
      let fileList = [];
      this._orderMainService.getOrderFileById(orderId)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            fileList = Object.assign([], resp.data.filter((i) => i.type === 0 || i.type === 1));
            let modalRef = this._modalService.open(UploaderTypeComponent, {
              size: 'lg',
              keyboard: false,
              backdrop: 'static',
              windowClass: 'super-lg'
            });
            modalRef.componentInstance.title = 'PO Documents';
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

  /**
   * openPrintLocationUploader
   * @param {number} locationId
   * @param {number} type
   * @param {string} title
   */
  public openPrintLocationUploader(locationId: number, type: number, title: string): void {
    this.isChangePopup = true;
    const insertSpace = (data) => {
      let result = data;
      result.forEach((item) => {
        // let l =  item.artFileTypeName.length;
        for (let i = 1; i < item.artFileTypeName.length; i++) {
          if (item.artFileTypeName[i] >= 'A' && item.artFileTypeName[i] <= 'Z') {
            item.artFileTypeName =
              item.artFileTypeName.slice(0, i) + ' ' + item.artFileTypeName.slice(i);
            i++;
          }
        }
      });
      return result;
    };
    setTimeout(() => {
      this.isOpenChangePopup = false;
      let techSheetFiles = [];
      let params: HttpParams = new HttpParams()
        .set('printLocationId', locationId.toString());
      this._locationDetailService.getArtFiles(params)
        .subscribe((resp: ResponseMessage<any>): void => {
          if (resp.status) {
            techSheetFiles = resp.data.filter((item) => item.type === 2);
            techSheetFiles = insertSpace(techSheetFiles);
            let modalRef = this._modalService.open(UploadComponent, {
              size: 'lg',
              keyboard: false,
              backdrop: 'static',
              windowClass: 'super-lg'
            });
            let meg = 'Art file(s) uploaded successfully';
            if (techSheetFiles.length && type === 2) {
              let files = techSheetFiles.slice(0);
              modalRef.componentInstance.fileExist = files;
              meg = 'Save was successful.';
            }
            modalRef.componentInstance.title = title;
            modalRef.componentInstance.uploadType = this.uploadedType.TechSheets;
            modalRef.componentInstance.locationType = type;
            modalRef.componentInstance.locationId = locationId;
            modalRef.componentInstance.isReadOnly = true;
            modalRef.result.then((res: any) => {
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

  /**
   * goToTrimSetup
   * @param row
   * @param rowDetails
   */
  public goToTrimSetup(row, rowDetails): void {
    if (this._authService.checkCanView('Orders')) {
      this._utilService.scrollPosition = this._utilService
        .scrollElm.scrollTop;
      if (!rowDetails) {
        this._router.navigate([
          'order-log-v2',
          row.id,
          'trims-info'
        ]);
      } else {
        this._router.navigate([
          'order-log-v2',
          row.id,
          'styles',
          rowDetails.orderDetailId,
          'trims'
        ]);
      }
    }
  }

  /**
   * goToBlankSetup
   * @param row
   * @param rowDetails
   */
  public goToBlankSetup(row, rowDetails): void {
    if (this._authService.checkCanView('Orders')) {
      this._utilService.scrollPosition = this._utilService
        .scrollElm.scrollTop;
      if (!rowDetails) {
        this._router.navigate([
          'order-log-v2',
          row.id,
          'styles'
        ]);
      } else {
        this._router.navigate([
          'order-log-v2',
          row.id,
          'styles',
          rowDetails.orderDetailId
        ]);
      }
    }
  }

  /**
   * goToPrintLocationSetup
   * @param row
   * @param rowDetails
   */
  public goToPrintLocationSetup(row, rowDetails): void {
    if (this._authService.checkCanView('Orders')) {
      this._utilService.scrollPosition = this._utilService
        .scrollElm.scrollTop;
      this._router.navigate([
        'order-log-v2',
        row.id,
        'styles',
        rowDetails.orderDetailId,
        'print-location'
      ]);
    }
  }

  /**
   * goToNeckLabelSetup
   * @param row
   * @param rowDetails
   * @param {string} colName
   */
  public goToNeckLabelSetup(row, rowDetails, colName: string): void {
    if (this._authService.checkCanView('Orders')) {
      this._utilService.scrollPosition = this._utilService
        .scrollElm.scrollTop;
      this._router.navigate([
        'order-log-v2',
        row.id,
        'styles',
        rowDetails.orderDetailId,
        'neck-labels'
      ]);
    }
  }

  /**
   * Page size change event
   * @param pageSize
   */
  public onSelectedPageSize(pageSize: number): void {
    this._localStorageService.set('orderMainPageSize', pageSize);
    this.tableConfig.pageSize = pageSize;
    if (this.isA2000Dashboard) {
      this.tableConfig.currentPage = 1;
      this.orderLogData.data = this.a2000Data.slice(
        (this.tableConfig.currentPage - 1) * this.tableConfig.pageSize,
        this.tableConfig.currentPage * this.tableConfig.pageSize
      );
      this._changeDetectorRef.markForCheck();
      return;
    }
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
    if (this.isA2000Dashboard) {
      this.orderLogData.data = this.a2000Data.slice(
        (this.tableConfig.currentPage - 1) * this.tableConfig.pageSize,
        this.tableConfig.currentPage * this.tableConfig.pageSize
      );
      this._changeDetectorRef.markForCheck();
      return;
    }
    this.refreshDatatable(false, draw);
  }

  /**
   * Sort change event
   * @param event
   */
  public onSort(event: SortEvent): void {
    this.tableConfig.keySort = event.sorts[0].prop;
    this.tableConfig.orderDescending = event.sorts[0].dir === 'desc';
    this.tableConfig.loading = true;
    this.refreshDatatable(false, this.tableConfig.currentPage - 1);
    this.updateHeader();
  }

  /**
   * onUpdateFilter
   * @param filterObj
   */
  public onUpdateFilter(filterObj: any): void {
    this._keyword = filterObj.keyword;
    this._filterStr = filterObj.filter;
    this._filterStatus = filterObj.status;
    this.itemType = filterObj.itemType;
    if (this.getCurrentTab().name === 'A2000 Import Errors') {
      return;
    } else {
      this.reloadDatatableWithScrollPosition();
      this.onResize();
    }
  }

  /**
   * Fire filter event
   */
  public onFilter(filterObj: any): void {
    if (this.getCurrentTab().name !== 'A2000 Import Errors') {
      this._keyword = filterObj.keyword;
      this._filterStr = filterObj.filter;
      this._filterStatus = filterObj.status;
      this.itemType = filterObj.itemType;
      this.refreshDatatable();
    }
  }

  /**
   * Export selected orders
   */
  public onExportOrder(filterObj: any): void {
    let orderDescending = this.tableConfig.orderDescending.toString();
    let keySort = this.tableConfig.keySort;
    let keyword = filterObj.keyword;
    let filter = filterObj.filter;
    let status = filterObj.status;

    let params: HttpParams = new HttpParams()
      .set('keyword', keyword)
      .set('filter', filter)
      .set('status', status)
      .set('keySort', keySort)
      .set('type', this.orderFilterType)
      .set('utcOffset', (-1 * new Date().getTimezoneOffset() / 60).toString())
      .set('orderDescending', orderDescending);

    this._orderMainService.exportOrder(params)
      .subscribe((resp: any) => {
        let data = resp;
        let values = data.headers.get('Content-Disposition');
        let filename = values.split(';')[1].trim().split('=')[1];
        // remove " from file name
        filename = filename.replace(/"/g, '');
        let blob;
        if (filterObj.type === 'pdf') {
          blob = new Blob([(<any> data).body],
            {type: 'application/pdf'}
          );
        } else if (filterObj.type === 'xlsx') {
          blob = new Blob([(<any> data).body],
            {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
          );
        }
        FileSaver.saveAs(blob, filename);
      });
  }

  public onExportLayout(filterObj: any): void {
    if (this.getCurrentSelectedItem() + this.getOtherSelectedItem() === 0) {
      this._toastrService
        .error('You must select at least 1 row to generate a Layout report.', 'Error');
      return;
    }
    let orderDescending = this.tableConfig.orderDescending.toString();
    let keySort = this.tableConfig.keySort;
    let keyword = filterObj.keyword;
    let filter = filterObj.filter;
    let status = filterObj.status;
    let isCheckedAll = this.orderLogData.selected.isCheckedAll.toString();
    let itemsChecked = this.orderLogData.selected.itemsChecked.join();
    let itemsRemoved = this.orderLogData.selected.itemsRemoved.join();

    let params: HttpParams = new HttpParams()
      .set('keyword', keyword)
      .set('filter', filter)
      .set('status', status)
      .set('keySort', keySort)
      .set('type', this.orderFilterType)
      .set('utcOffset', (-1 * new Date().getTimezoneOffset() / 60).toString())
      .set('orderDescending', orderDescending)
      .set('isCheckedAll', isCheckedAll)
      .set('itemsChecked', itemsChecked)
      .set('itemsRemoved', itemsRemoved);

    this._orderMainService.exportLayout(params)
      .subscribe((resp: any) => {
        let data = resp;
        let values = data.headers.get('Content-Disposition');
        let filename = values.split(';')[1].trim().split('=')[1];
        // remove " from file name
        filename = filename.replace(/"/g, '');
        let blob;
        if (filterObj.type === 'pdf') {
          blob = new Blob([(<any> data).body],
            {type: 'application/pdf'}
          );
        } else if (filterObj.type === 'xlsx') {
          blob = new Blob([(<any> data).body],
            {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
          );
        }
        FileSaver.saveAs(blob, filename);
      });
  }

  /**
   * Export Bulk Po
   * @param filterObj
   */
  public onExportBulkPo(filterObj: any): void {
    let filter = filterObj.filter;
    let status = filterObj.status;

    let params: HttpParams = new HttpParams()
      .set('filter', filter)
      .set('status', status)
      .set('type', this.orderFilterType);

    this._orderMainService.exportBulkPo(params)
      .subscribe((resp: any) => {
        let data = resp;
        let values = data.headers.get('Content-Disposition');
        let filename = values.split(';')[1].trim().split('=')[1];
        // remove " from file name
        filename = filename.replace(/"/g, '');
        let blob;
        if (filterObj.type === 'pdf') {
          blob = new Blob([(<any> data).body],
            {type: 'application/pdf'}
          );
        } else if (filterObj.type === 'xlsx') {
          blob = new Blob([(<any> data).body],
            {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
          );
        }
        FileSaver.saveAs(blob, filename);
      });
  }

  /**
   * Export A2000
   */
  public exportA2000(type): void {
    this._orderMainService.exportA2000()
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
   * getListTrimETA
   * @param trimList
   */
  public getListTrimETA(trimList: any) {
    return trimList.filter((trim) => trim.trimId !== 0);
  }

  /**
   * isAdminAndSchedule
   * @returns {boolean}
   */
  public isAdminAndSchedule(): boolean {
    const isAdmin = this._userContext.currentUser.listRole
      .findIndex((i) => i.roleName === 'Administrator') > -1;
    const isSchedule = this._userContext.currentUser.listRole
      .findIndex((i) => i.roleName === 'Scheduling') > -1;

    return isAdmin || isSchedule;
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

  /**
   * markedForScheduling
   * @param {number} orderId
   * @param {number} styleId
   * @param printLocation
   * @param {boolean} isEnqueue
   */
  public markedForScheduling(orderId: number,
                             styleId: number,
                             printLocation: any,
                             isEnqueue: boolean): void {
    this._orderMainService
      .markedForScheduling(orderId, styleId, printLocation.printLocationId, isEnqueue)
      .subscribe((resp: BasicResponse): void => {
        if (resp.status) {
          if (this.getCurrentTab().name === 'Partially Scheduled'
            || this.getCurrentTab().name === 'Schedulable') {
            this.reloadDatatableWithScrollPosition();
          } else {
            printLocation.isMarkedForScheduling = isEnqueue;
            this._changeDetectorRef.markForCheck();
          }
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  // public markAsRead(row, isRead): void {
  //   if (row && row.orderLogInfo) {
  //     this._orderMainService.markAsRead(row.id, isRead)
  //       .subscribe((resp: BasicResponse) => {
  //         if (resp.status) {
  //           row.orderLogInfo.isReaded = isRead;
  //         } else {
  //           this._toastrService.error(resp.errorMessages, 'Error');
  //         }
  //         this._changeDetectorRef.markForCheck();
  //       });
  //   }
  // }

  // public onContextMenu($event: MouseEvent, row): void {
  //   if (row && row.orderLogInfo && row.orderLogInfo.isReaded) {
  //     this._contextMenuService.show.next({
  //       contextMenu: this.markAsUnreadMenu,
  //       event: $event,
  //       item: row
  //     });
  //   } else {
  //     this._contextMenuService.show.next({
  //       contextMenu: this.markAsReadMenu,
  //       event: $event,
  //       item: row
  //     });
  //   }
  //   $event.preventDefault();
  //   $event.stopPropagation();
  // }

  /**
   * showAllColumns
   * @param {boolean} isShowAll
   */
  public showAllColumns(isShowAll: boolean): void {
    this._progressService.start();
    setTimeout(() => {
      this.isShowAllColumns = isShowAll;
      this._progressService.done();
      this._localStorageService.set('isShowAll_OrderLog', this.isShowAllColumns.toString());
      this.updateHeader();
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  /**
   * isNoColumnChecked
   * @returns {boolean}
   */
  public isNoColumnChecked(): boolean {
    if (!this.isShowAllColumns) {
      return _.map(this.columns, (o) => { return o; }).every((isView: boolean) => !isView);
    } else {
      return false;
    }
  }

  public reloadDatatableWithScrollPosition(): void {
    this.refreshDatatable(false, this.tableConfig.currentPage - 1).then((value: boolean) => {
      setTimeout(() => {
        if (this._utilService.scrollElm) {
          this._utilService.scrollElm
            .scrollTop = this._utilService.scrollPosition;
        }
      }, 200);
    });
  }

  /**
   * resetHeightCell
   * @param {any[]} orderLogData
   */
  public resetHeightCell(orderLogData: any[]): void {
    // orderLogData.forEach((row) => {
    //   row.orderDetails.forEach((detail, detailIndex) => {
    //     detail.printLocations.forEach((style, styleIndex) => {
    //       style.style = {
    //         height: `auto`
    //       };
    //       this._changeDetectorRef.markForCheck();
    //     });
    //     detail.style = {
    //       height: `auto`
    //     };
    //     this._changeDetectorRef.markForCheck();
    //   });
    // });
    if (this.orderLogTable) {
      this.orderLogTable.recalculate();
    }
    this._changeDetectorRef.markForCheck();
  }

  public sortOrderTab() {
    const orderTabList = this._userContext.currentUser
      .permissions.filter((i) => i.name.includes('OrderLog.All.'));
    this.tabs.forEach((t, id) => {
      let index = orderTabList.findIndex(
        (d) => d.name.split('.')[1] === t.description
      );
      if (index > -1) {
        t['seqNo'] = orderTabList[index]['seqNo'];
      } else {
        t['seqNo'] = 0;
      }
    });
    this.tabs = _.sortBy(this.tabs, 'seqNo');
  }

  public collapseAll($event?) {
    if ($event && $event.target) {
      let icon = $event.target;
      if (icon.nodeName === 'TH') {
        icon = icon.childNodes[0];
      }
      if (icon.nodeName === 'I') {
        if (icon.classList.contains('collapsed')) {
          icon.classList.remove('collapsed');
        } else {
          icon.className += ' collapsed';
        }
      } else {
        return;
      }
    }
    if (this.isAllCollapse) {
      this._progressService.start();
    }
    setTimeout(() => {
      this.isAllCollapse = !this.isAllCollapse;
      if (this.orderLogData.data && this.orderLogData.data.length) {
        this.orderLogData.data.forEach((row) => {
          row.isCollapse = this.isAllCollapse;
        });
      }
      if (!this.isAllCollapse) {
        this._progressService.done();
      }
      this.backupExpandedIds();
      this._changeDetectorRef.markForCheck();
    });
  }

  public collapseRow($event, row) {
    if ($event && $event.target) {
      let icon = $event.target;
      if (icon.nodeName === 'DIV') {
        icon = icon.childNodes[0];
      }
      if (icon.nodeName === 'I') {
        if (icon.classList.contains('collapsed')) {
          icon.classList.remove('collapsed');
        } else {
          icon.className += ' collapsed';
        }
      } else {
        return;
      }
    }
    if (row.isCollapse) {
      this._progressService.start();
    }
    setTimeout(() => {
      row.isCollapse = !row.isCollapse;
      if (!row.isCollapse) {
        this._progressService.done();
      }
      this.checkIsAllCollapse();
    });
  }

  public checkIsAllCollapse() {
    this.backupExpandedIds();
    this.isAllCollapse = this.orderLogData.data &&
      this.orderLogData.data.every((row) => {
        return row.isCollapse;
      });
    this._changeDetectorRef.markForCheck();
  }

  public trackById(index, instructor) {
    return instructor.id;
  }

  public orderColSpan(order) {
    if (order.isCollapse) {
      return 1;
    }
    let colSpan = 0;
    if (order.orderDetails && order.orderDetails.length) {
      order.orderDetails.forEach((detail) => {
        if (detail.printLocations && detail.printLocations.length) {
          colSpan += detail.printLocations.length;
        } else {
          colSpan += 1;
        }
      });
      return colSpan;
    }
    return 1;
  }

  public backupExpandedIds() {
    this.expandedIds = _.map(_.filter(this.orderLogData.data, [
      'isCollapse',
      false
    ]), 'id');
    this._localStorageService.set('expandedIds', this.expandedIds);
  }

  public addNullDetails(order) {
    // fake printLocations data for render
    if (order.orderDetails && order.orderDetails.length) {
      order.orderDetails.forEach((style) => {
        if (!style.printLocations || !style.printLocations.length) {
          style.printLocations = [null];
        }
      });
    } else {
      order.orderDetails = [{printLocations: [null]}];
    }
  }

  public trimEtaStatus(order) {
    let trimEtaStatus = null;
    // orderDetail that not cancelled
    let orderDetails = _.filter(order.orderDetails, (detail: any) => {
      return detail.styleInfo && !detail.styleInfo.isCancelled;
    });
    if (orderDetails && orderDetails.length) {
      if (_.every(orderDetails, (detail: any) => {
        return detail.styleInfo && detail.styleInfo.noTrimRequired;
      })) {
        // every Trim within every style on the order is configured for 'No Trims Required'
        trimEtaStatus = this.taskStatus.NOTREQUIRED;
      } else if (_.some(orderDetails, (detail: any) => {
          return detail.styleInfo && !detail.styleInfo.noTrimRequired;
        })
        && !_.every(orderDetails, (detail: any) => {
          return detail.trimEta && detail.trimEta.status === this.taskStatus.RECEIVED;
        })) {
        // At least 1 trim is not 'Not Trims Required',
        // and not all trims on the order are status=Received
        trimEtaStatus = this.taskStatus.NOTRECEIVED;
      } else if (_.some(orderDetails, (detail: any) => {
          return detail.styleInfo && !detail.styleInfo.noTrimRequired;
        })
        && _.every(orderDetails, (detail: any) => {
          return detail.trimEta && detail.trimEta.status === this.taskStatus.RECEIVED;
        })) {
        // At least 1 trim is not 'Not Trims Required',
        // and ALL trims on the order are status=Received
        trimEtaStatus = this.taskStatus.RECEIVED;
      }
    }
    order.trimEtaStatus = trimEtaStatus;
  }

  public blankEtaStatus(order) {
    let blankEtaStatus = null;
    // orderDetail that not cancelled
    let orderDetails = _.filter(order.orderDetails, (detail: any) => {
      return detail.styleInfo && !detail.styleInfo.isCancelled;
    });
    if (orderDetails && orderDetails.length) {
      if (_.every(orderDetails, (detail: any) => {
        return !detail.blankGoodsEta && detail.isBlankNotApplicable;
      })) {
        // every Blank within every style on the order is configured for 'Not Applicable'
        blankEtaStatus = this.taskStatus.NOTAPPLICABLE;
      } else if (!_.every(orderDetails, (detail: any) => {
          return !detail.blankGoodsEta && detail.isBlankNotApplicable;
        })
        && !_.every(orderDetails, (detail: any) => {
          return detail.blankGoodsEta &&
            detail.blankGoodsEta.status === this.taskStatus.RECEIVED;
        })) {
        // At least 1 blank is not 'Not Applicable'
        // not all blanks on the order are status=Received
        blankEtaStatus = this.taskStatus.NOTRECEIVED;
      } else if (_.every(orderDetails, (detail: any) => {
        return detail.blankGoodsEta &&
          detail.blankGoodsEta.status === this.taskStatus.RECEIVED;
      })) {
        // ALL blanks on the order are status=Received
        blankEtaStatus = this.taskStatus.RECEIVED;
      }
    }
    order.blankEtaStatus = blankEtaStatus;
  }

  public printApprovalStatus(order) {
    let printApprovalStatus = null;
    // orderDetail that not cancelled
    let orderDetails = _.filter(order.orderDetails, (detail: any) => {
      return detail.styleInfo && !detail.styleInfo.isCancelled;
    });
    if (orderDetails && orderDetails.length) {
      if (_.every(orderDetails, (detail: any) => {
        return detail.isReorder;
      })) {
        // every style on the order is Reorder
        printApprovalStatus = this.taskStatus.REORDER;
      } else if (_.every(orderDetails, (detail: any) => {
        return detail.printLocations && detail.printLocations.length
          && _.every(detail.printLocations, (print: any) => {
            return print && print.printApproval &&
              print.printApproval.status === this.taskStatus.RERUN;
          });
      })) {
        // every style on the order is status=RERUN
        printApprovalStatus = this.taskStatus.RERUN;
      } else if (_.some(orderDetails, (detail: any) => {
          return !detail.isReorder;
        })
        && !_.every(orderDetails, (detail: any) => {
          return detail.printLocations && detail.printLocations.length
            && _.every(detail.printLocations, (print: any) => {
              return print && print.printApproval &&
                print.printApproval.status === this.taskStatus.APPROVED;
            });
        })) {
        // at least 1 style on the order is not Reorder,
        // and not all styles on the order are status=Approved
        printApprovalStatus = this.taskStatus.NOTAPPROVED;
      } else if (_.every(orderDetails, (detail: any) => {
        return detail.printLocations && detail.printLocations.length
          && _.every(detail.printLocations, (print: any) => {
            return print && print.printApproval &&
              print.printApproval.status === this.taskStatus.APPROVED;
          });
      })) {
        // every style on the order is status=Approved
        printApprovalStatus = this.taskStatus.APPROVED;
      }
    }
    order.printApprovalStatus = printApprovalStatus;
  }

  public printDateStatus(order) {
    let status = null;
    // orderDetail that not cancelled
    let orderDetails = _.filter(order.orderDetails, (detail: any) => {
      return detail.styleInfo && !detail.styleInfo.isCancelled;
    });
    if (orderDetails && orderDetails.length) {
      if (_.some(orderDetails, (detail: any) => {
        return detail.printLocations && detail.printLocations.length
          && _.some(detail.printLocations, (print: any) => {
            return print && print.printDate &&
              print.printDate.status === null;
          });
      })) {
        // at least 1 printlocation on the order is ?
        status = null;
      } else if (_.every(orderDetails, (detail: any) => {
        return detail.printLocations && detail.printLocations.length
          && _.every(detail.printLocations, (print: any) => {
            return print && print.printDate &&
              print.printDate.status === this.taskStatus.BLANK;
          });
      })) {
        // all printlocation on the order are status=Not Applicable
        status = this.taskStatus.NOTAPPLICABLE;
      } else if (_.some(orderDetails, (detail: any) => {
        return detail.printLocations && detail.printLocations.length
          && _.some(detail.printLocations, (print: any) => {
            return print && print.printDate &&
              print.printDate.status === this.taskStatus.SCHEDULED;
          });
      })) {
        // at least 1 printlocation on the order is Scheduled
        status = this.taskStatus.SCHEDULED;
      } else if (_.some(orderDetails, (detail: any) => {
        return detail.printLocations && detail.printLocations.length
          && _.some(detail.printLocations, (print: any) => {
            return print && print.printDate &&
              print.printDate.status === this.taskStatus.DONE;
          });
      })) {
        // ALL printlocation on the order are status=Done, or some Done some Not Applicable
        status = this.taskStatus.DONE;
      }
    }
    order.printDateStatus = status;
    this.scStatus(order);
  }

  public statusByProp(order, prop) {
    // props: neckLabelDate, finishingDate, actualToShipDate, invoiced
    let status = null;
    // orderDetail that not cancelled
    let orderDetails = _.filter(order.orderDetails, (detail: any) => {
      return detail.styleInfo && !detail.styleInfo.isCancelled;
    });
    if (orderDetails && orderDetails.length) {
      if (_.some(orderDetails, (detail: any) => {
        return detail[prop] && detail[prop].status === null;
      })) {
        // at least 1 style on the order is ?
        status = null;
      } else if (_.every(orderDetails, (detail: any) => {
        return detail[prop] && detail[prop].status === this.taskStatus.BLANK ||
          (prop === 'neckLabelDate' &&
            (detail[prop].noNeckLabel || detail[prop].noNeckLabel === null));
      })) {
        // all style on the order are status=Not Applicable
        status = this.taskStatus.NOTAPPLICABLE;
      } else if (_.some(orderDetails, (detail: any) => {
        return detail[prop] && detail[prop].status === this.taskStatus.SCHEDULED;
      })) {
        // at least 1 style on the order is Scheduled
        status = this.taskStatus.SCHEDULED;
      } else if (_.some(orderDetails, (detail: any) => {
        return detail[prop] && detail[prop].status === this.taskStatus.PARTIAL;
      })) {
        // at least 1 style on the order is PARTIAL
        status = this.taskStatus.PARTIAL;
      } else if (_.some(orderDetails, (detail: any) => {
        return detail[prop] && detail[prop].status === this.taskStatus.DONE;
      })) {
        // ALL style on the order are status=Done, or some Done some Not Applicable
        status = this.taskStatus.DONE;
      }
    }
    order[prop + 'Status'] = status;
    this.scStatus(order);
  }

  public onChangePrintDateStatus(row, type, status): void {
    let listRole = type === Columns.Schedule ?
      [
        'Administrator',
        'Scheduling'
      ] : [
        'Administrator',
        'Shipping'
      ];
    if (_.intersection(listRole,
      this._userContext.currentUser.listRole.map((r) => r.roleName)).length <= 0) {
      return;
    }
    let modalRef = this._modalService.open(PrintDateStatusComponent, {
      size: 'sm',
      keyboard: false,
      backdrop: 'static'
    });
    modalRef.componentInstance.type = type;
    modalRef.componentInstance.status = status;
    modalRef.result.then((res) => {
      if (res) {
        const modal = {
          ...res
        };
        this._orderMainService.changeStatusColumn(row.id, type,
          this.orderFilterType, this.itemType, modal)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              Object.assign(row.orderLogInfo, resp.data.orderLogInfo);
              this._changeDetectorRef.markForCheck();
              this._toastrService.success(resp.message, 'Success');
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
    }, (err) => {
      // e
    });
  }

  public scStatus(order) {
    let scStatus = null;
    let arrProps = [
      'printDateStatus',
      'neckLabelDateStatus',
      'finishingDateStatus'
    ];
    if (_.some(arrProps, (prop: any) => {
      return order[prop] === null;
    })) {
      scStatus = null;
    } else if (_.every(arrProps, (prop: any) => {
      return order[prop] === this.taskStatus.NOTAPPLICABLE;
    })) {
      scStatus = this.taskStatus.NOTAPPLICABLE;
    } else if (_.some(arrProps, (prop: any) => {
      return order[prop] === this.taskStatus.SCHEDULED;
    })) {
      scStatus = this.taskStatus.SCHEDULED;
    } else if (_.some(arrProps, (prop: any) => {
      return order[prop] === this.taskStatus.DONE;
    })) {
      scStatus = this.taskStatus.DONE;
    }
    order.scStatus = scStatus;
  }

  public onAddComment(row, status, scheduleCommentType): void {
    let modalRef = this._modalService.open(AddCommentComponent, {
      size: 'sm',
      keyboard: false,
      backdrop: 'static'
    });
    let commentsProp = 'printDateComments';
    let column = Columns.ScheduleComments;
    switch (scheduleCommentType) {
      case this.commentTypes.NeckLabel:
        commentsProp = 'neckLabelDateComments';
        break;
      case this.commentTypes.Finishing:
        commentsProp = 'finishingDateComments';
        break;
      case this.commentTypes.Actual:
        commentsProp = 'actualToShipDateComments';
        column = Columns.ShippingComments;
        modalRef.componentInstance.title = 'Ship Date status';
        break;
      default:
        break;
    }
    modalRef.componentInstance.status = status;
    modalRef.componentInstance.scheduleComments = row.orderLogInfo[commentsProp];
    modalRef.result.then((res) => {
      if (res) {
        let modal = {
          scheduleCommentType,
          ...res
        };
        // add shipping comment
        if (scheduleCommentType === this.commentTypes.Actual) {
          modal = {
            actualShipDateComments: res.scheduleComments
          };
        }
        this._orderMainService.changeStatusColumn(row.id, column,
          this.orderFilterType, this.itemType, modal)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              Object.assign(row.orderLogInfo, resp.data.orderLogInfo);
              this._changeDetectorRef.markForCheck();
              this._toastrService.success(resp.message, 'Success');
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
    }, (err) => {
      // e
    });
  }

  public onConfirmReorder($event, detail) {
    let modalRef = this._modalService.open(ConfirmReorderComponent, {
      keyboard: false,
      backdrop: 'static'
    });
    modalRef.componentInstance.isConfirmReorder = detail.isConfirmReorder;
    modalRef.componentInstance.reorderComment = detail.reorderComment;

    modalRef.result.then((res) => {
      if (res) {
        this._styleService.confirmReorder(detail.orderDetailId,
          res.isConfirmReorder,
          res.reorderComment)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              detail.isConfirmReorder = res.isConfirmReorder;
              detail.reorderComment = res.reorderComment;
              this._changeDetectorRef.markForCheck();
              this._toastrService.success(resp.message, 'Success');
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
    }, (err) => {
      // e
    });
  }

  /**
   * Ajax datatable
   * @param draw
   */
  public refreshDatatable(isReloadMode = false, draw?: number): Promise<boolean> {
    this.isA2000Dashboard = false;
    this.orderFilterType = this.getCurrentTab() ? this.getCurrentTab().type.toString() : '0';

    this.tableConfig.currentPage = draw ? draw + 1 : 1;
    let countSkip = (draw ? draw * this.tableConfig.pageSize : 0).toString();
    let pageSize = this.tableConfig.pageSize.toString();
    let orderDescending = this.tableConfig.orderDescending.toString();
    let keySort = this.tableConfig.keySort;
    let keyword = this._keyword;
    let filter = this._filterStr;
    let status = this._filterStatus;

    // Check filter change or not
    if (this._preFilterStr !== filter || this._preFilterStatus !== status) {
      this._preFilterStr = filter;
      this._preFilterStatus = status;
      this._isChangeFilter = true;
    } else {
      this._isChangeFilter = false;
    }

    let params: HttpParams = new HttpParams()
      .set('countSkip', countSkip)
      .set('pageSize', pageSize)
      .set('keyword', keyword)
      .set('filter', filter)
      .set('status', status)
      .set('keySort', keySort)
      .set('type', this.orderFilterType)
      .set('utcOffset', (-1 * new Date().getTimezoneOffset() / 60).toString())
      .set('orderDescending', orderDescending);

    return new Promise((resolve, reject) => {
      this._orderMainService.getListOrderV2(params)
        .subscribe((resp: ResponseMessage<any>): void => {
          // Stop loading from linear loading bar of ngx-datatable
          this.tableConfig.loading = false;
          this._progressService.done();
          if (resp.status) {
            // order locations by listed then alphabetical by name
            const locationOrder = {
              'Front': 1,
              'Back': 2,
              'Left Sleeve': 3,
              'Right Sleeve': 4
            };
            if (resp.data.data && resp.data.data.length) {
              resp.data.data.forEach((order) => {
                this.trimEtaStatus(order);
                this.blankEtaStatus(order);
                this.printApprovalStatus(order);
                this.printDateStatus(order);
                this.statusByProp(order, 'neckLabelDate');
                this.statusByProp(order, 'finishingDate');
                this.statusByProp(order, 'actualToShipDate');
                this.statusByProp(order, 'invoiced');
                order.isCollapse = !_.includes(this.expandedIds, order.id);
                order.totalStyleUnits = 0;
                if (order.orderDetails && order.orderDetails.length) {
                  order.orderDetails.forEach((style) => {
                    if (style.styleInfo && style.styleInfo.units && !style.styleInfo.isCancelled) {
                      order.totalStyleUnits += style.styleInfo.units;
                    }
                    if (style.printLocations && style.printLocations.length) {
                      style.printLocations =
                        _.sortBy(style.printLocations,
                          [
                            (p) => { return locationOrder[p.printLocation]; },
                            'printLocation'
                          ]);
                    } else {
                      style.printLocations = [null];
                    }
                  });
                } else {
                  order.orderDetails = [{printLocations: [null]}];
                }
              });
            }
            let responseData = resp.data;
            this.orderLogData.totalRecord = responseData.totalRecord;
            this._orderLogDataStoreTemp = responseData.data;
            if (!responseData.data || !responseData.data.length) {
              this.orderLogData.data = responseData.data;
              this._changeDetectorRef.markForCheck();
              // Prevent user navigate to another page when data not loaded yet
              const backdropElm = document.getElementById('backdrop');
              if (backdropElm) {
                backdropElm.className = 'none';
                this._changeDetectorRef.markForCheck();
              }
              resolve(true);
              return;
            }
            if (!isReloadMode || this._isChangeFilter) {
              this._scrollHeight = 400;
              this._orderLogDataStore = responseData.data;
              const getRowLength = (row): number => {
                let rowLength = 0;
                if (row.orderDetails && row.orderDetails.length) {
                  row.orderDetails.forEach((style) => {
                    if (style.printLocations && style.printLocations.length) {
                      rowLength += style.printLocations.length;
                    } else {
                      rowLength++;
                    }
                  });
                } else {
                  rowLength++;
                }
                return rowLength;
              };
              // let rowLength = 0;
              // this.orderLogData.data = [];
              // do {
              //   rowLength += getRowLength(this._orderLogDataStore[0]);
              //   this.orderLogData.data.push(...this._orderLogDataStore.splice(0, 1));
              // } while (this._orderLogDataStore.length && rowLength < 10);
              // this.orderLogData.data = this._orderLogDataStore.splice(0, 10);
              this.orderLogData.data = [...responseData.data];
            } else {
              // Update data in row rendered
              let i = 0;
              let updatedRow = [];
              do {
                const newRowData = this._orderLogDataStoreTemp
                  .find((o) => o.id === this.orderLogData.data[i].id);
                if (newRowData) {
                  if (!_.isEqual(this.orderLogData.data[i], newRowData)) {
                    this.orderLogData.data[i] = newRowData;
                    updatedRow.push(this.orderLogData.data[i]);
                  }
                } else {
                  this.orderLogData.data.splice(i, 1);
                }
                i++;
              } while (i < this.orderLogData.data.length);
              // Filter row not render yet
              this._orderLogDataStore = _.xorWith(this._orderLogDataStoreTemp,
                this.orderLogData.data, _.isEqual);
            }
          } else {
            this.orderLogData.totalRecord = 0;
            this.orderLogData.data = null;
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          // Prevent user navigate to another page when data not loaded yet
          const backdropElm = document.getElementById('backdrop');
          if (backdropElm && !backdropElm.className.includes('none')) {
            backdropElm.className = 'none';
          }
          this.checkIsAllCollapse();
          this._changeDetectorRef.markForCheck();
          setTimeout(() => {
            this._changeDetectorRef.markForCheck();
          });
          resolve(true);
        });
    });
  }

  /**
   * getA2000Datatable
   */
  public getA2000Datatable(): Promise<boolean> {
    this.isA2000Dashboard = true;

    return new Promise((resolve, reject) => {
      this._orderMainService.getListA2000OrderV2()
        .subscribe((resp: ResponseMessage<any>): void => {
          if (resp.status) {
            this.tableConfig.loading = false;
            this._progressService.done();
            this.a2000Data = resp.data;
            this.orderLogData.data = this.a2000Data.slice(
              (this.tableConfig.currentPage - 1) * this.tableConfig.pageSize,
              this.tableConfig.currentPage * this.tableConfig.pageSize
            );
            this.orderLogData.totalRecord = resp.data.length;
            setTimeout(() => {
              if (this.orderLogTable) {
                this.orderLogTable.recalculate();
              }
            });
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }

          // Prevent user navigate to another page when data not loaded yet
          const backdropElm = document.getElementById('backdrop');
          if (backdropElm && !backdropElm.className.includes('none')) {
            backdropElm.className = 'none';
          }
          this._changeDetectorRef.markForCheck();
          resolve(true);
        });
    });
  }

  public ngOnDestroy(): void {
    this.backupExpandedIds();
    this._localStorageService.set('isShowAll_OrderLog', this.isShowAllColumns);
    this._utilService.currentPage = this.tableConfig.currentPage;
    clearInterval(this.refreshInterval);
    // Prevent user navigate to another page when data not loaded yet
    const backdropElm = document.getElementById('backdrop');
    if (backdropElm && !backdropElm.className.includes('none')) {
      backdropElm.className = 'none';
    }
  }
}
