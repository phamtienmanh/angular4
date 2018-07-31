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
import { CommonService } from '../../shared/services/common';
import { SampleMainService } from './sample-main.service';
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
import {
  MyDatePickerService
} from '../../shared/services/my-date-picker';
import {
  UserContext
} from '../../shared/services/user-context';
import {
  EditUserService
} from '../../+user-management/+edit-user/edit-user.service';
import {
  AuthService
} from '../../shared/services/auth';
import * as moment from 'moment';
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';

// Interfaces
import {
  ResponseMessage
} from '../../shared/models';
import {
  StyleColumns
} from './sample-main.model';
import {
  ItemTypes
} from '../+sales-order/+order-styles/order-styles.model';

// Components
import { SampleMainFilterComponent } from './components';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'sample-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'sample-main.template.html',
  styleUrls: [
    'sample-main.style.scss'
  ]
})
export class SampleMainComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('dashboardScroll')
  public dashboardScroll: any;
  @ViewChild(SampleMainFilterComponent)
  public sampleMainFilterComponent: SampleMainFilterComponent;

  public sampleData = {
    totalRecord: 0,
    data: []
  };
  public tableConfig;
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
  public isChangePopup = false;
  public currentUserRoles = [];
  public isShowAllColumns = false;
  public tabs = [];
  public orderRoleType: number;
  public currentTabScrollX: number;
  public roleCanEditUnpublish = [
    'Administrator',
    'Account Manager',
    'Account Supervior',
    'Customer Service',
    'Pre-Production'
  ];

  public isAllCollapse = true;
  public expandedIds;
  public orderFilterType = '';
  public itemType = '';

  private _orderLogDataStore = [];
  private _orderLogDataStoreTemp = [];
  private _scrollHeight = 300;
  private refreshInterval;

  private _keyword = '';
  private _filterStr = '';
  private _filterStatus = '';
  private _preFilterStr = '';
  private _preFilterStatus = '';
  private _isChangeFilter = false;

  constructor(private _router: Router,
              private _breadcrumbService: BreadcrumbService,
              private _sampleMainService: SampleMainService,
              private _localStorageService: LocalStorageService,
              private _ngbDropdownConfig: NgbDropdownConfig,
              private _progressService: ProgressService,
              private _commonService: CommonService,
              private _editUserService: EditUserService,
              private _utilService: Util,
              private _userContext: UserContext,
              private _changeDetectorRef: ChangeDetectorRef,
              private _authService: AuthService,
              private _modalService: NgbModal,
              private _toastrService: ToastrService,
              public myDatePickerService: MyDatePickerService) {
    this.currentUserRoles = this._userContext.currentUser.listRoleIds;
    this._ngbDropdownConfig.autoClose = false;
    // --------------

    // Get expanded orderIds
    this.expandedIds = this._localStorageService.get('expandedIds');
    // Config font size
    let fontSize = this._localStorageService.get('fontSize_Sample') as string;
    if (fontSize) {
      const modal = {'font-size': fontSize};
      Object.assign(this.myConfigStyle, modal);
      Object.assign(this.myConfigStyleHeader, modal);
    } else {
      this._localStorageService.set('fontSize_Sample', this.myConfigStyle['font-size']);
    }
    // --------------

    // Config columns
    let colSampleConfigs = this._userContext.currentUser.orderLogSampleDevelopmentUserConfigs;
    const sampleConfig = this._userContext.currentUser
      .permissions.filter((i) => i.type === 12);
    if (colSampleConfigs && colSampleConfigs.length) {
      const colConfigs = colSampleConfigs.filter((i) => i.type === 12);
      if (colConfigs.length !== sampleConfig.length) {
        this.showHideColumns = sampleConfig;
      } else {
        colConfigs.forEach((i) => {
          let col = sampleConfig.find((o) => o.id === i.id);
          if (col) {
            Object.assign(i, col);
          }
        });
        this.showHideColumns = colConfigs;
      }
      const storedColumnConfig = this._userContext.currentUser
        .permissions.filter((i) => i.type === 12);
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
        .permissions.filter((i) => i.type === 12);
    }
    this.showHideColumns.forEach((item) => {
      this.columns[item.name] = item.isView;
    });
    this.isCheckedAll = this.showHideColumns.every((i) => i.isView === true);
    this.isShowAllColumns = !!this._localStorageService.get('isShowAll_Sample');
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
    this._breadcrumbService
      .addFriendlyNameForRoute('/order-log-v2/sample-development', 'Sample Development');
    // sort order tab
    this.sortOrderTab();
    // Prevent user navigate to another page when data not loaded yet
    const backdropElm = document.getElementById('backdrop');
    if (backdropElm && backdropElm.className.includes('none')) {
      backdropElm.className = '';
      this._changeDetectorRef.markForCheck();
    }

    this.configNavTabs().then((status: boolean) => {
      if (status) {
        this.sampleData = {
          totalRecord: 0,
          data: []
        };
        clearInterval(this.refreshInterval);
        let filterStore = this._localStorageService.get('Sample_FilterModel');
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
    // e
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
   * updateHeader
   */
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
          if (index === 0) {
            this.cloneHeader.children[index]
              .addEventListener('click', this.collapseAll.bind(this));
          }
        });
      }
      this.cloneHeader.className += ' fade-header';
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
              this.showHideColumns, 'ORDER_LOG_SAMPLE_DEVELOPMENT_COLUMN_CONFIG')
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
    this._localStorageService.set('fontSize_Sample', fontSize);
    this._progressService.start();
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
          .get('Sample_CurrentDashboard') as any;
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
      this._localStorageService.set('Sample_CurrentDashboard',
        {
          name: this.getCurrentTab().name,
          scrollX: this.currentTabScrollX
        });

      this.sampleData = {
        totalRecord: 0,
        data: []
      };
      clearInterval(this.refreshInterval);
      if (this.sampleMainFilterComponent) {
        this._filterStr = this.sampleMainFilterComponent.getFilterParam();
        this._filterStatus = this.sampleMainFilterComponent.getStatusFilter();
      }
      this.refreshDatatable();
      this.refreshInterval = setInterval(() => {
        if (!this.isChangePopup) {
          this.refreshDatatable(true, this.tableConfig.currentPage - 1);
        }
      }, 1000 * 60 * this._userContext.currentUser.refreshOrderLogPageTime);
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
      .checkCanModify(`Sample.All.${this.getCurrentTab()
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
        .checkCanModify(`Sample.All.${this.getCurrentTab()
          ? this.getCurrentTab().description : ''}`) && colObj.isModify;
    }
    return false;
  }

  /**
   * canModifyOrders
   * @returns {boolean}
   */
  public canModifyOrders(): boolean {
    return this._authService.checkCanModify(`Sample.All.${this.getCurrentTab()
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
   * onUpdateFilter
   * @param filterObj
   */
  public onUpdateFilter(filterObj: any): void {
    this._keyword = filterObj.keyword;
    this._filterStr = filterObj.filter;
    this._filterStatus = filterObj.status;
    this.itemType = filterObj.itemType;
    this.reloadDatatableWithScrollPosition();
  }

  /**
   * Fire filter event
   */
  public onFilter(filterObj: any): void {
    this._keyword = filterObj.keyword;
    this._filterStr = filterObj.filter;
    this._filterStatus = filterObj.status;
    this.itemType = filterObj.itemType;
    this.refreshDatatable();
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

    this._sampleMainService.exportOrder(params)
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

    this._sampleMainService.exportBulkPo(params)
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
      arr = _.uniqBy(arr, 'name');
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
   * showAllColumns
   * @param {boolean} isShowAll
   */
  public showAllColumns(isShowAll: boolean): void {
    this._progressService.start();
    setTimeout(() => {
      this.isShowAllColumns = isShowAll;
      this._progressService.done();
      this._localStorageService.set('isShowAll_Sample', this.isShowAllColumns.toString());
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
      .set('type', this.orderFilterType)
      .set('utcOffset', (-1 * new Date().getTimezoneOffset() / 60).toString())
      .set('orderDescending', orderDescending);

    return new Promise((resolve, reject) => {
      this._sampleMainService.getListSample(params)
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
                // order.isCollapse = !_.includes(this.expandedIds, order.id);
                order.isCollapse = false;
                if (order.styles && order.styles.length) {
                  order.styles.forEach((style) => {
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
            this.sampleData.totalRecord = responseData.totalRecord;
            this._orderLogDataStoreTemp = responseData.data;
            if (!responseData.data || !responseData.data.length) {
              this.sampleData.data = responseData.data;
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
              this.sampleData.data = [...responseData.data];
            } else {
              // Update data in row rendered
              let i = 0;
              let updatedRow = [];
              do {
                const newRowData = this._orderLogDataStoreTemp
                  .find((o) => o.id === this.sampleData.data[i].id);
                if (newRowData) {
                  if (!_.isEqual(this.sampleData.data[i], newRowData)) {
                    this.sampleData.data[i] = newRowData;
                    updatedRow.push(this.sampleData.data[i]);
                  }
                } else {
                  this.sampleData.data.splice(i, 1);
                }
                i++;
              } while (i < this.sampleData.data.length);
              // Filter row not render yet
              this._orderLogDataStore = _.xorWith(this._orderLogDataStoreTemp,
                this.sampleData.data, _.isEqual);
            }
          } else {
            this.sampleData.totalRecord = 0;
            this.sampleData.data = null;
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          // Prevent user navigate to another page when data not loaded yet
          const backdropElm = document.getElementById('backdrop');
          if (backdropElm && !backdropElm.className.includes('none')) {
            backdropElm.className = 'none';
          }
          this.checkIsAllCollapse();
          this._changeDetectorRef.markForCheck();
          resolve(true);
        });
    });
  }

  public sortOrderTab() {
    const orderTabList = this._userContext.currentUser
      .permissions.filter((i) => i.name.includes('Sample.All.'));
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
      }
    }
    if (this.isAllCollapse) {
      this._progressService.start();
    }
    setTimeout(() => {
      this.isAllCollapse = !this.isAllCollapse;
      if (this.sampleData.data && this.sampleData.data.length) {
        this.sampleData.data.forEach((row) => {
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
    this.isAllCollapse = this.sampleData.data &&
      this.sampleData.data.every((row) => {
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
    if (order.styles && order.styles.length) {
      order.styles.forEach((detail) => {
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
    this.expandedIds = _.map(_.filter(this.sampleData.data, [
      'isCollapse',
      false
    ]), 'id');
    this._localStorageService.set('expandedIds', this.expandedIds);
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

  public ngOnDestroy(): void {
    this.backupExpandedIds();
    this._localStorageService.set('isShowAll_Sample', this.isShowAllColumns);
    this._utilService.currentPage = this.tableConfig.currentPage;
    clearInterval(this.refreshInterval);
    // Prevent user navigate to another page when data not loaded yet
    const backdropElm = document.getElementById('backdrop');
    if (backdropElm && !backdropElm.className.includes('none')) {
      backdropElm.className = 'none';
    }
  }
}
