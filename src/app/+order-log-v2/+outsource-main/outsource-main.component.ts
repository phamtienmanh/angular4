import {
  Component,
  ViewEncapsulation,
  OnInit,
  ViewChild,
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
  Router
} from '@angular/router';

// Services
import { ToastrService } from 'ngx-toastr';
import {
  DatatableComponent,
  TableColumn
} from '@swimlane/ngx-datatable';
import { CommonService } from '../../shared/services/common';
import { OutsourceMainService } from './outsource-main.service';
import { Util } from '../../shared/services/util';
import { LocalStorageService } from 'angular-2-local-storage';
import {
  NgbDropdownConfig,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  ProgressService
} from '../../shared/services/progress';
import * as _ from 'lodash';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import {
  MyDatePickerService
} from '../../shared/services/my-date-picker';
import {
  UserContext
} from '../../shared/services/user-context';
import {
  AuthService
} from '../../shared/services/auth';
import {
  ContextMenuService,
  ContextMenuComponent
} from 'ngx-contextmenu';
import {
  EditUserService
} from '../../+user-management/+edit-user/edit-user.service';
import { StyleService } from '../+sales-order/+order-styles/+styles-info/+style/style.service';

// Components
import {
  OutsourceMainFilterComponent
} from './components';
import {
  PoIssueDateComponent,
  OwsTechPackReadyComponent,
  ArtRequestedComponent,
  ArtReceivedComponent,
  ArtReleasedComponent,
  TreatmentSampleComponent,
  TreatmentPhotoComponent,
  EmbellishmentSampleComponent,
  PhotoApprovalComponent,
  NeckPrintSampleComponent,
  NeckLabelPhotoComponent,
  PhysSampleExfactoryComponent,
  PpTestingFacilityComponent,
  PhysSampleDeliveredComponent,
  PhysSampleActualComponent,
  PhysSampleApprovedComponent,
  QcSampleShipComponent,
  FinalApprovalComponent,
  NeckLabelProductionComponent,
  EmbellishmentProductionComponent,
  WashProductionComponent,
  TopDueComponent,
  PhysSampleExfactoryTopComponent,
  PhysSampleActualTopComponent,
  QcSampleShipTopComponent,
  ShippingLabelsTscComponent,
  FactoryPackingListComponent,
  XFactoryDateComponent,
  ReadyToShip3plComponent,
  EtaTscComponent,
  TrimSubmitsDueComponent,
  BlankGoodsComponent,
  LeadTimeComponent,
  ProductionDueV2Component
} from './modules';

// Interfaces
import {
  ResponseMessage,
  SortEvent,
  RowSelectEvent
} from '../../shared/models';
import {
  TaskStatus,
  StyleColumns,
  OutsourceType
} from './outsource-main.model';
import {
  Columns
} from './modules/columns.model';
import {
  ItemTypes
} from '../+sales-order/+order-styles/order-styles.model';
import {
  BasicResponse
} from '../../shared/models';
import { UploaderTypeComponent } from '../../shared/modules/uploader-type';
import { StyleUploadedType } from '../+sales-order/+order-styles/+styles-info/+style';
import { UploadedType } from '../+sales-order';
import {
  ActualToShipComponent,
  FolderSubmittedComponent,
  InvoicedComponent
} from '../+order-main/modules';
import { OrderMainService } from '../+order-main/order-main.service';
import { UpdateActualShipType } from '../order-log.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'outsource-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'outsource-main.template.html',
  styleUrls: [
    'outsource-main.style.scss'
  ]
})
export class OutsourceMainComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild('orderLogTable')
  public orderLogTable: any;
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
  @ViewChild(OutsourceMainFilterComponent)
  public orderMainFilterComponent: OutsourceMainFilterComponent;
  public currentComponentWidth;

  public outsourceData = {
    totalRecord: 0,
    data: []
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
  public header2;
  public cloneHeader2;
  public isOpenChangePopup = false;
  public isChangePopup = false;
  public currentUserRoles = [];
  public isShowAllColumns = false;
  public tabs = [
    {
      name: 'All',
      description: 'All',
      type: OutsourceType.All,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.Outsource.All')
    },
    {
      name: 'Development',
      description: 'Development',
      type: OutsourceType.Development,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.Outsource.Development')
    },
    {
      name: 'Cancelled',
      description: 'Cancelled',
      type: OutsourceType.Cancelled,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.Outsource.Cancelled')
    },
    {
      name: 'Archived',
      description: 'Archived',
      type: OutsourceType.Archived,
      isActive: false,
      isView: this._authService.checkCanView('OrderLog.Outsource.Archived')
    }
  ];
  public orderRoleType: number;
  public currentTabScrollX: number;
  public roleCanEditUnpublish = [
    'Administrator',
    'Account Manager',
    'Account Supervior',
    'Customer Service',
    'Pre-Production'
  ];
  public styleUploadedType = StyleUploadedType;
  public uploadedType = UploadedType;
  public expandedIds;
  public isAllCollapse = true;
  public orderFilterType;

  private _outsourceDataStore = [];
  private _outsourceDataStoreTemp = [];
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
              private _outsourceMainService: OutsourceMainService,
              private _localStorageService: LocalStorageService,
              private _ngbDropdownConfig: NgbDropdownConfig,
              private _progressService: ProgressService,
              private _commonService: CommonService,
              private _editUserService: EditUserService,
              private _orderMainService: OrderMainService,
              private _utilService: Util,
              private _styleService: StyleService,
              private _userContext: UserContext,
              private _changeDetectorRef: ChangeDetectorRef,
              private _contextMenuService: ContextMenuService,
              private _authService: AuthService,
              private _modalService: NgbModal,
              private _toastrService: ToastrService,
              public myDatePickerService: MyDatePickerService) {
    this.currentUserRoles = this._userContext.currentUser.listRoleIds;
    this._ngbDropdownConfig.autoClose = false;
    // --------------

    // Get expanded orderIds
    this.expandedIds = this._localStorageService.get('outsourceExpandedIds');
    // Config font size
    let fontSize = this._localStorageService.get('fontSize_Outsource') as string;
    if (fontSize) {
      const modal = {'font-size': fontSize};
      Object.assign(this.myConfigStyle, modal);
      Object.assign(this.myConfigStyleHeader, modal);
    } else {
      this._localStorageService.set('fontSize_Outsource', this.myConfigStyle['font-size']);
    }
    // --------------

    // Config columns
    let colOutsourceConfigs = this._userContext.currentUser.orderLogOutsourceColumnConfig;
    const outsourceConfig = this._userContext.currentUser
      .permissions.filter((i) => i.type === 11);
    if (colOutsourceConfigs && colOutsourceConfigs.length) {
      const colConfigs = colOutsourceConfigs.filter((i) => i.type === 11);
      if (colConfigs.length !== outsourceConfig.length) {
        this.showHideColumns = outsourceConfig;
      } else {
        colConfigs.forEach((i) => {
          let col = outsourceConfig.find((o) => o.id === i.id);
          if (col) {
            Object.assign(i, col);
          }
        });
        this.showHideColumns = colConfigs;
      }
      const storedColumnConfig = this._userContext.currentUser
        .permissions.filter((i) => i.type === 11);
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
        .permissions.filter((i) => i.type === 11);
    }
    this.showHideColumns.forEach((item) => {
      this.columns[item.name] = item.isView;
    });
    this.isCheckedAll = this.showHideColumns.every((i) => i.isView === true);
    this.isShowAllColumns = !!this._localStorageService.get('isShowAll_Outsource');
    // --------------

    // Config table
    const outsourceMainPageSize = this._localStorageService.get('outsourceMainPageSize');
    this.tableConfig = {
      keySort: 'csr',
      orderDescending: false,
      currentPage: this._utilService.currentPage ? this._utilService.currentPage : 1,
      pageSize: outsourceMainPageSize ? outsourceMainPageSize : 10,
      loading: false
    };
  }

  /**
   * Init data & Config text on breadcrumb
   */
  public ngOnInit(): void {
    // Prevent user navigate to another page when data not loaded yet
    const backdropElm = document.getElementById('backdrop');
    if (backdropElm && backdropElm.className.includes('none')) {
      backdropElm.className = '';
      this._changeDetectorRef.markForCheck();
    }
    this.configNavTabs().then((status: boolean) => {
      if (status) {
        this.outsourceData = {
          totalRecord: 0,
          data: []
        };
        clearInterval(this.refreshInterval);
        let filterStore = this._localStorageService.get('Outsource_FilterModel');
        if (!filterStore) {
          this.reloadDatatableWithScrollPosition();
        }
        this.refreshInterval = setInterval(() => {
          if (!this.isChangePopup) {
            this.refreshDatatable(true, this.tableConfig.currentPage - 1);
          }
        }, 1000 * 60 * this._userContext.currentUser.refreshOrderLogPageTime);
      }
    });
  }

  public ngAfterViewChecked(): void {
    // Check if the table size has changed
    if (this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
      this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
      setTimeout(() => {
        if (this.orderLogTable && !this.isOpenChangePopup && !this.isChangePopup) {
          this.orderLogTable.recalculate();
        }
        this._changeDetectorRef.markForCheck();
      }, 200);
    }
  }

  /**
   * onAppScroll
   * @param event
   */
  @HostListener('window:scroll', ['$event'])
  public onAppScroll(event: any) {
    if (!this._isPushData && event.target.scrollingElement.scrollTop >= this._scrollHeight) {
      this.onScrollPagingDatatable(event.target.scrollingElement.scrollTop);
    }
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
      && (this.header && this.header.getBoundingClientRect().top < 0
        || this.header2 && this.header2.getBoundingClientRect().top < 0)
      && fixedHeader && !fixedHeader.hasChildNodes()) {
      fixedHeader.appendChild(this.cloneHeader);
      if (this.cloneHeader2) {
        fixedHeader.appendChild(this.cloneHeader2);
      }
    } else if ((this.header && this.header.getBoundingClientRect().top >= 0
      || this.header2 && this.header2.getBoundingClientRect().top >= 0)
      || (event.target.scrollingElement.scrollTop < 150
        && fixedHeader && fixedHeader.hasChildNodes())) {
      while (fixedHeader.firstChild) {
        fixedHeader.removeChild(fixedHeader.firstChild);
      }
    }
  }

  /**
   * updateHeader
   */
  public updateHeader(): void {
    const setHeader = (headerList) => {
      const _header = headerList;
      const _cloneHeader = _header.cloneNode(true);
      if (_header.children && _header.children.length) {
        Array.from(_header.children).forEach((el: any, index) => {
          let width = el.getBoundingClientRect().width + 'px';
          _cloneHeader.children[index].style.width = width;
          _cloneHeader.children[index].style.maxWidth = width;
          _cloneHeader.children[index].style.minWidth = width;
          if (index === 0) {
            _cloneHeader.children[index]
              .addEventListener('click', this.collapseAll.bind(this));
          }
        });
      }
      return {
        header: _header,
        cloneHeader: _cloneHeader
      };
    };
    const headerList = document.getElementsByClassName('table-header');
    if (headerList[0]) {
      const headerRs = setHeader(headerList[0]);
      this.header = headerRs.header;
      this.cloneHeader = headerRs.cloneHeader;
      this.cloneHeader.className += ' fade-header';
    }
    if (headerList[1]) {
      const headerRs = setHeader(headerList[1]);
      this.header2 = headerRs.header;
      this.cloneHeader2 = headerRs.cloneHeader;
      this.cloneHeader2.className += ' fade-header';
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
              this.showHideColumns, 'ORDER_LOG_OUTSOURCE_COLUMN_CONFIG')
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
    this._localStorageService.set('fontSize_Outsource', fontSize);
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
          .get('Outsource_CurrentDashboard') as any;
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
      this._localStorageService.set('Outsource_CurrentDashboard',
        {
          name: this.getCurrentTab().name,
          scrollX: this.currentTabScrollX
        });

      this.outsourceData = {
        totalRecord: 0,
        data: []
      };
      clearInterval(this.refreshInterval);

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

  public getActivatedTabId(): any {
    return _.get(this.tabs.find((i) => !!i.isActive), 'type', 0);
  }

  /**
   * recalculateWidth
   * @param {TableColumn[]} columns
   */
  public recalculateWidth(columns: TableColumn[]): void {
    [].forEach.call(columns, (col) => {
      col.width = this.myStyleColumns[this.myConfigStyle['font-size']][col.prop].width;
      col.minWidth = this.myStyleColumns[this.myConfigStyle['font-size']][col.prop].width;
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
      .checkCanModify(`OrderLog.Outsource.${this.getCurrentTab()
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
        .checkCanModify(`OrderLog.Outsource.${this.getCurrentTab()
          ? this.getCurrentTab().description : ''}`) && colObj.isModify;
    }
    return false;
  }

  /**
   * canModifyOrders
   * @returns {boolean}
   */
  public canModifyOrders(): boolean {
    return this._authService.checkCanModify(`OrderLog.Outsource.${this.getCurrentTab()
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

  public columnCanModify(arr: string[]): boolean {
    let canModify = false;
    let i = 0;
    do {
      canModify = canModify || this.canModifyCols(arr[i++]);
    } while (!canModify && i < arr.length);
    return canModify;
  }

  public getObjectDetail(main, sub): void {
    return {...sub, ...main};
  }

  public onChangeLeadTime(row, detail, colDetail, title, strArr): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.columnCanModify(strArr)
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(LeadTimeComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.isPageReadOnly = !this.columnCanModify(strArr);
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
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
  public onChangePoIssueDate(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('PO Issue Date')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(PoIssueDateComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.poIssueDueOwsTechPackReadyEta
        }, colDetail);
        modalRef.componentInstance.isPageReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeOwsTechPackReady(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('OWS / Tech Pack Ready')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(OwsTechPackReadyComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.poIssueDueOwsTechPackReadyEta
        }, colDetail);
        modalRef.componentInstance.isPageReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeArtRequested(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Art Requested')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(ArtRequestedComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        // modalRef.componentInstance.isPageReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeArtReceived(row, detail, item, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Art Received')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(ArtReceivedComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.printLocationId = item.printLocationId;
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        // modalRef.componentInstance.isPageReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeArtReleased(row, detail, item, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Art Released')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(ArtReleasedComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.printLocationId = item.printLocationId;
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        // modalRef.componentInstance.isPageReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeTreatmentSample(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Treatment Sample Date')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(TreatmentSampleComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.sampleLeadTimeEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeTreatmentPhoto(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Treatment Photo Approval @ TSC')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(TreatmentPhotoComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.sampleLeadTimeEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeEmbellishmentSample(row, detail, item, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Embellishment Sample Date')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(EmbellishmentSampleComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.printLocationId = item.printLocationId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.sampleLeadTimeEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangePhotoApproval(row, detail, item, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Photo Approval @ TSC')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(PhotoApprovalComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.printLocationId = item.printLocationId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.sampleLeadTimeEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeNeckPrintSample(row, detail, colDetail): void {
    if (colDetail.isSetup || detail.noNeckLabel === true) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Neck Print Sample Date')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(NeckPrintSampleComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.sampleLeadTimeEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeNeckPrintPhotoApproval(row, detail, colDetail): void {
    if (colDetail.isSetup || detail.noNeckLabel === true) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Neck Print Photo Approval @ TSC')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(NeckLabelPhotoComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.sampleLeadTimeEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeBlankGoodsEta(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Blank Goods Eta')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(BlankGoodsComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: !colDetail ? 'eta-xs' : colDetail.total >= 3 ? 'eta-lg'
            : colDetail.total >= 2 ? 'eta-sm' : 'eta-xs'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.styleId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        modalRef.componentInstance.rowDetails = Object.assign({}, detail);
        modalRef.componentInstance.isBlankNotApplicable = detail.isBlankNotApplicable;
        // modalRef.componentInstance.styleList = row.styles.filter((order) => !order.isCancelled);
        // modalRef.componentInstance.isPageReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeTrimSubmitsDue(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Trim Submits Due')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(TrimSubmitsDueComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: !colDetail ? 'eta-xs' : colDetail.total >= 3 ? 'eta-lg'
            : colDetail.total >= 2 ? 'eta-sm' : 'eta-xs'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        modalRef.componentInstance.rowDetails = Object.assign({}, detail);
        // modalRef.componentInstance.isPageReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangePhysSampleExFactoryPp(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Phys. Sample Ex-Factory Date (PP)')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(PhysSampleExfactoryComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.physSampleExFactoryDatePpEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangePPToTestingFacility(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && this.canModifyCols('Phys. Sample Ex-Factory Date (PP To Testing Facility)')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(PpTestingFacilityComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.physSampleExFactoryDatePpEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangePhysSampleDelivered(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && this.canModifyCols('Phys. Sample Delivered to Testing Facility (PP)')
        && !row.isCancelled && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(PhysSampleDeliveredComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.physSampleDeliveredPpEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangePhysSampleActual(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Phys. Sample Actual Date Delivered (PP)')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(PhysSampleActualComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.physSampleDeliveredPpEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangePhysSampleApproved(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && this.canModifyCols('Phys. Sample Approved By Testing Facility (PP)')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(PhysSampleApprovedComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.physSampleApprovedPpEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeQcSampleShipDate(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('QC Sample / Ship Date (PP)')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(QcSampleShipComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        // modalRef.componentInstance.isPageReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeFinalApproval(row, detail, item, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Final Approval (PP)')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(FinalApprovalComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.printLocationId = item.printLocationId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.physSampleApprovedPpEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeNeckLabelProduction(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Neck Label Production')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(NeckLabelProductionComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: !colDetail ? 'eta-lg'
            : colDetail.total >= 2 ? 'eta-sm' : 'eta-xs'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        // modalRef.componentInstance.isPageReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeEmbellishmentProduction(row, detail, item, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Embellishment Production')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(EmbellishmentProductionComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.printLocationId = item.printLocationId;
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        // modalRef.componentInstance.isPageReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeWashProduction(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Wash Production')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(WashProductionComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        // modalRef.componentInstance.isPageReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeProductionDue(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Production Due')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(ProductionDueV2Component, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-xs'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.productionLeadTimeEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeTopDue(row, detail, colDetail): void {
    if (colDetail.isSetup || detail.topQty === 0) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Top Due')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(TopDueComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.productionLeadTimeEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangePhysSampleExFactoryTop(row, detail, colDetail): void {
    if (colDetail.isSetup || detail.topQty === 0) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && this.canModifyCols('Phys. Sample Ex-Factory Date (TOP)')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(PhysSampleExfactoryTopComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.productionLeadTimeEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangePhysSampleActualTop(row, detail, colDetail): void {
    if (colDetail.isSetup || detail.topQty === 0) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && this.canModifyCols('Phys. Sample Actual Date Delivered (TOP)')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(PhysSampleActualTopComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.productionLeadTimeEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeQcSampleShipTop(row, detail, colDetail): void {
    if (colDetail.isSetup || colDetail.isShippingSetup || detail.topQty === 0) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && this.canModifyCols('QC Sample / Ship Date (TOP)')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(QcSampleShipTopComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.productionLeadTimeEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeShippingLabelsTsc(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && this.canModifyCols('Shipping Labels / TSC Packing List')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(ShippingLabelsTscComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.productionLeadTimeEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeFactoryPackingList(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && this.canModifyCols('Factory Packing List / CI')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(FactoryPackingListComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.factoryPackingListCiXFactoryDateEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeXFactoryDate(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && this.canModifyCols('x-Factory Date')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(XFactoryDateComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...detail.factoryPackingListCiXFactoryDateEta
        }, colDetail);
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeReadyToShip3Pl(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && this.canModifyCols('Ready To Ship @ 3PL')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(ReadyToShip3plComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        modalRef.componentInstance.styleList = row.styles
          .filter((order) => !order.isCancelled);
        // modalRef.componentInstance.isPageReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeEtaTsc(row, detail, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && this.canModifyCols('ETA @ TSC')
        && !row.isCancelled
        && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(EtaTscComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        // modalRef.componentInstance.isPageReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
            this._changeDetectorRef.markForCheck();

          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  /**
   * onChangeActualToShipDate
   * @param row
   * @param rowDetail
   */
  public onChangeActualToShipDate(row, detail, colDetail): void {
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
        modalRef.componentInstance.responseType = UpdateActualShipType.OrderLogOutsource;
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderFilterType = this.orderFilterType;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.styleList = row.styles
          .filter((style) => !style.isCancelled);
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);

        modalRef.result.then((res) => {
          if (res) {
            this.isChangePopup = false;
            this.addNullDetails(res);
            Object.assign(row, res);
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
  public onChangeFolderSubmittedToAccounting(row, detail, colDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Shipping Documentation')
        && !row.isCancelled && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(FolderSubmittedComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'super-lg'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.styleList = row.styles
          .filter((style) => !style.isCancelled);
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);

        modalRef.result.then((res) => {
          if (res) {
            const modal = {
              ...res
            };
            this._orderMainService.changeStatusColumn(row.orderId, Columns.ShippingDocumentation,
              this.orderFilterType, null, modal, UpdateActualShipType.OrderLogOutsource)
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
  public onChangeInvoiced(row, detail, colDetail): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Invoiced')
        && !row.isCancelled && !detail.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(InvoicedComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'super-lg'
        });
        modalRef.componentInstance.orderId = row.orderId;
        modalRef.componentInstance.orderDetailId = detail.orderDetailId;
        modalRef.componentInstance.styleList = row.styles
          .filter((style) => !style.isCancelled);
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);

        modalRef.result.then((res) => {
          if (res) {
            const modal = {
              ...res
            };
            this._orderMainService.changeStatusColumn(row.orderId, Columns.Invoiced,
              this.orderFilterType, null, modal, UpdateActualShipType.OrderLogOutsource)
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
            fileList = Object.assign([], resp.data.filter((i) => i.type ===
              type));
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
   * openTrimUploader
   * @param {number} orderId
   * @param {number} orderDetailId
   */
  public openTrimUploader(orderDetailId: number): void {
    this.isChangePopup = true;
    setTimeout(() => {
      this.isOpenChangePopup = false;
      let fileList = [];
      this._outsourceMainService.getAllTrimFiles(orderDetailId)
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
      this._outsourceMainService.getAllBlankFiles(orderDetailId)
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
        row.orderId,
        'styles',
        rowDetails.orderDetailId,
        'print-location'
      ]);
    }
  }

  /**
   * goToSampleSetup
   * @param row
   * @param rowDetails
   */
  public goToSampleSetup(row, rowDetails): void {
    if (this._authService.checkCanView('Orders')) {
      this._utilService.scrollPosition = this._utilService
        .scrollElm.scrollTop;
      this._router.navigate([
        'order-log-v2',
        row.orderId,
        'styles',
        rowDetails.orderDetailId,
        'samples'
      ]);
    }
  }

  /**
   * goToNeckLabelSetup
   * @param row
   * @param rowDetails
   */
  public goToNeckLabelSetup(row, rowDetails): void {
    if (this._authService.checkCanView('Orders')) {
      this._utilService.scrollPosition = this._utilService
        .scrollElm.scrollTop;
      this._router.navigate([
        'order-log-v2',
        row.orderId,
        'styles',
        rowDetails.orderDetailId,
        'neck-labels'
      ]);
    }
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
      this._router.navigate([
        'order-log-v2',
        row.orderId,
        'styles',
        rowDetails.orderDetailId,
        'trims'
      ]);
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
      this._router.navigate([
        'order-log-v2',
        row.orderId,
        'styles',
        rowDetails.orderDetailId,
        'style'
      ]);
    }
  }

  /**
   * goToTopsTabSetup
   * @param row
   * @param rowDetails
   */
  public goToTopsTabSetup(row, rowDetails, isShippingSetup?): void {
    if (this._authService.checkCanView('Orders')) {
      this._utilService.scrollPosition = this._utilService
        .scrollElm.scrollTop;
      if (rowDetails.topQty === 0) {
        this._router.navigate([
          'order-log-v2',
          row.orderId,
          'styles',
          rowDetails.orderDetailId
        ]);
      } else {
        this._router.navigate([
          'order-log-v2',
          row.orderId,
          'styles',
          rowDetails.orderDetailId,
          'tops',
          !!isShippingSetup ? 'shipping' : 'factory'
        ]);
      }
    }
  }

  public trackByFn(index, item) {
    return index; // or item.id
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
   * Page size change event
   * @param pageSize
   */
  public onSelectedPageSize(pageSize: number): void {
    this._localStorageService.set('outsourceMainPageSize', pageSize);
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
    if (this.getCurrentTab().name === 'A2000 Import Errors') {
      return;
    } else {
      this.reloadDatatableWithScrollPosition();
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

    let params: HttpParams = new HttpParams()
      .set('keyword', keyword)
      .set('filter', filter)
      .set('keySort', keySort)
      .set('type', this.getCurrentTab() ? this.getCurrentTab().type.toString() : '0')
      .set('utcOffset', (-1 * new Date().getTimezoneOffset() / 60).toString())
      .set('orderDescending', orderDescending);

    this._outsourceMainService.exportOrder(params)
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

    let params: HttpParams = new HttpParams()
      .set('filter', filter)
      .set('type', this.getCurrentTab() ? this.getCurrentTab().type.toString() : '0');

    this._outsourceMainService.exportBulkPo(params)
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
    this._outsourceMainService.exportA2000()
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

  public markAsRead(row, isRead): void {
    if (row && row.orderLogInfo) {
      this._outsourceMainService.markAsRead(row.orderId, isRead)
        .subscribe((resp: BasicResponse) => {
          if (resp.status) {
            row.orderLogInfo.isReaded = isRead;
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          this._changeDetectorRef.markForCheck();
        });
    }
  }

  public onContextMenu($event: MouseEvent, row): void {
    if (row && row.orderLogInfo && row.orderLogInfo.isReaded) {
      this._contextMenuService.show.next({
        contextMenu: this.markAsUnreadMenu,
        event: $event,
        item: row
      });
    } else {
      this._contextMenuService.show.next({
        contextMenu: this.markAsReadMenu,
        event: $event,
        item: row
      });
    }
    $event.preventDefault();
    $event.stopPropagation();
  }

  /**
   * showAllColumns
   * @param {boolean} isShowAll
   */
  public showAllColumns(isShowAll: boolean): void {
    this._progressService.start();
    setTimeout(() => {
      this.isShowAllColumns = isShowAll;
      this._progressService.done();
      this._localStorageService.set('isShowAll_Outsource', this.isShowAllColumns.toString());
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
      }
    }
    if (this.isAllCollapse) {
      this._progressService.start();
    }
    setTimeout(() => {
      this.isAllCollapse = !this.isAllCollapse;
      if (this.outsourceData.data && this.outsourceData.data.length) {
        this.outsourceData.data.forEach((row) => {
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

  public collapseRow(row) {
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
    this.isAllCollapse = this.outsourceData.data &&
      this.outsourceData.data.every((row) => {
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
    let colSpan = !order.isCollapse ? order.styles.length : 0;
    if (order.styles && order.styles.length) {
      order.styles.forEach((detail) => {
        if (detail.printLocations && detail.printLocations.length) {
          colSpan = colSpan + detail.printLocations.length + 1;
        } else {
          colSpan += 1;
        }
      });
      return colSpan;
    }
    return 1;
  }

  public onHover(ev, isHover, isElement, elmName, orderId, orderDetailId): void {
    if (!isElement) {
      return;
    }
    let elmList = [
      ...Array.from(document.querySelectorAll(`#${elmName}-${orderId}-${orderDetailId}`)),
    ];
    let child = document.querySelector(`#${elmName}-${orderId}-${orderDetailId}-0`);
    if (child) {
      elmList.push(child);
    }
    let className;
    switch (elmName) {
      case 'csrCustPORetailerPOOrderDates':
        className = 'cell-hover-p-not-bg';
        break;
      case 'designDescriptionTotal':
        className = 'cell-hover-p';
        break;
      default:
        className = 'cell-hover';
        break;
    }
    elmList.forEach((elm) => {
      if (elm && isHover) {
        this.addClass(elm, className);
      } else {
        this.removeClass(elm, className);
      }
    });
  }

  public classList(elm) {
    return (' ' + (elm.className || '') + ' ').replace(/\s+/gi, ' ');
  }

  public hasClass(elm, n) {
    let list = typeof elm === 'string' ? elm : this.classList(elm);
    return list.indexOf(' ' + n + ' ') >= 0;
  }

  public addClass(element, name) {
    let oldList = this.classList(element);
    let newList = oldList + name;
    if (this.hasClass(oldList, name)) {
      return;
    }
    // Trim the opening space.
    element.className = newList.substring(1);
  }

  public removeClass(element, name) {
    let oldList = this.classList(element);
    let newList;

    if (!this.hasClass(element, name)) {
      return;
    }

    // Replace the class name.
    newList = oldList.replace(' ' + name + ' ', ' ');

    // Trim the opening and closing spaces.
    element.className = newList.substring(1, newList.length - 1);
  }

  public backupExpandedIds() {
    this.expandedIds = _.map(_.filter(this.outsourceData.data, [
      'isCollapse',
      false
    ]), 'orderId');
    this._localStorageService.set('outsourceExpandedIds', this.expandedIds);
  }

  public addNullDetails(order) {
    // fake printLocations data for render
    if (order.styles && order.styles.length) {
      order.styles.forEach((style) => {
        if (!style.printLocations || !style.printLocations.length) {
          style.printLocations = [null];
        }
      });
    } else {
      order.styles = [{printLocations: [null]}];
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

  public onScrollPagingDatatable(scrollTop: number): void {
    if (this._outsourceDataStore && this._outsourceDataStore.length) {
      this._isPushData = true;
      const rows = this._outsourceDataStore.splice(0, 1);
      this.outsourceData.data.push(...rows);
      setTimeout(() => {
        this._isPushData = false;
        this._changeDetectorRef.markForCheck();
      });
    }
  }

  /**
   * Ajax datatable
   * @param draw
   */
  public refreshDatatable(isReloadMode = false, draw?: number): Promise<boolean> {
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
      .set('type', this.getCurrentTab() ? this.getCurrentTab().type.toString() : '0')
      .set('utcOffset', (-1 * new Date().getTimezoneOffset() / 60).toString())
      .set('orderDescending', orderDescending);

    return new Promise((resolve, reject) => {
      this._outsourceMainService.getListOutsource(params)
        .subscribe((resp: ResponseMessage<any>): void => {
          // Stop loading from linear loading bar of ngx-datatable
          this.tableConfig.loading = false;
          if (resp.status) {
            const locationOrder = {
              'Front': 1,
              'Back': 2,
              'Left Sleeve': 3,
              'Right Sleeve': 4
            };
            if (resp.data.data && resp.data.data.length) {
              resp.data.data.forEach((order) => {
                order.isCollapse = !_.includes(this.expandedIds, order.orderId);
                order.totalStyleUnits = 0;
                if (order.styles && order.styles.length) {
                  order.styles.forEach((style) => {
                    if (style.units && !style.isCancelled) {
                      order.totalStyleUnits += style.units;
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
                  order.styles = [{printLocations: [null]}];
                }
              });
            }
            let responseData = resp.data;
            this.outsourceData.totalRecord = responseData.totalRecord;
            this._outsourceDataStoreTemp = responseData.data;

            if (!responseData.data || !responseData.data.length) {
              this.outsourceData.data = responseData.data;
              // Prevent user navigate to another page when data not loaded yet
              const backdropElm = document.getElementById('backdrop');
              if (backdropElm) {
                backdropElm.className = 'none';
              }
              this._changeDetectorRef.markForCheck();  resolve(true);
              return;
            }
            if (!isReloadMode || this._isChangeFilter) {
              // this._scrollHeight = 400;
              // this._outsourceDataStore = responseData.data;
              // const getRowLength = (row): number => {
              //   let rowLength = 0;
              //   if (row.styles && row.styles.length) {
              //     row.styles.forEach((style) => {
              //       if (style.printLocations && style.printLocations.length) {
              //         rowLength += style.printLocations.length;
              //       } else {
              //         rowLength++;
              //       }
              //     });
              //   } else {
              //     rowLength++;
              //   }
              //   return rowLength;
              // };
              // let rowLength = 0;
              // this.outsourceData.data = [];
              // do {
              //   rowLength += getRowLength(this._outsourceDataStore[0]);
              //   this.outsourceData.data.push(...this._outsourceDataStore.splice(0, 1));
              // } while (this._outsourceDataStore.length && rowLength < 10);
              // this.outsourceData.data = this._outsourceDataStore.splice(0, 10);
              this.outsourceData.data = [...responseData.data];
            } else {
              // Update data in row rendered
              let i = 0;
              let updatedRow = [];
              do {
                const newRowData = this._outsourceDataStoreTemp
                  .find((o) => o.id === this.outsourceData.data[i].id);
                if (newRowData) {
                  if (!_.isEqual(this.outsourceData.data[i], newRowData)) {
                    this.outsourceData.data[i] = newRowData;
                    updatedRow.push(this.outsourceData.data[i]);
                  }
                } else {
                  this.outsourceData.data.splice(i, 1);
                }
                i++;
              } while (i < this.outsourceData.data.length);
              // Filter row not render yet
              this._outsourceDataStore = _.xorWith(this._outsourceDataStoreTemp,
                this.outsourceData.data, _.isEqual);
            }
          } else {
            this.outsourceData.totalRecord = 0;
            this.outsourceData.data = null;
            this._toastrService.error(resp.errorMessages, 'Error');
          }

          // Prevent user navigate to another page when data not loaded yet
          const backdropElm = document.getElementById('backdrop');
          if (backdropElm) {
            backdropElm.className = 'none';
          }
          this.checkIsAllCollapse();
          this._changeDetectorRef.markForCheck();
          resolve(true);
        });
    });
  }

  public isEtaWrong(row): boolean {
    if (!row.cancelDateOnUtc || !row.styles || !row.styles.length) {
      return false;
    }
    let etaDateArr = [];
    row.styles.forEach((style) => {
      if (style.etatsc) {
        if (style.etatsc.etaDateReviseOnUtc) {
          etaDateArr.push((new Date(style.etatsc.etaDateReviseOnUtc)).setHours(0, 0, 0, 0));
        } else if (!style.etaDateReviseOnUtc && style.etaDateOnUtc) {
          etaDateArr.push((new Date(style.etatsc.etaDateOnUtc)).setHours(0, 0, 0, 0));
        }
      }
    });
    if (!etaDateArr.length) {
      return false;
    }
    let maxEtaDate = Math.max(...etaDateArr);
    let cancelDate = new Date(row.cancelDateOnUtc).setHours(0, 0, 0, 0);
    if (maxEtaDate > cancelDate) {
      return true;
    }
    return false;
  }

  public ngOnDestroy(): void {
    this.backupExpandedIds();
    this._localStorageService.set('isShowAll_Outsource', this.isShowAllColumns);
    this._utilService.currentPage = this.tableConfig.currentPage;
    clearInterval(this.refreshInterval);
  }
}
