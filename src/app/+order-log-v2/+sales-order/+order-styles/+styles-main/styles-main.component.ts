import {
  AfterViewChecked,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

import {
  Router
} from '@angular/router';

// Services
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  ToastrService
} from 'ngx-toastr';
import {
  SalesOrderService
} from '../../sales-order.service';
import {
  StylesMainService
} from './styles-main.service';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { LocalStorageService } from 'angular-2-local-storage';

// Interfaces
import {
  ConfirmDialogComponent
} from '../../../../shared/modules/confirm-dialog';
import {
  SortEvent,
  BasicResponse,
  ResponseMessage
} from '../../../../shared/models';
import {
  StyleResponse
} from './styles-main.model';
import {
  DatatableComponent
} from '@swimlane/ngx-datatable';
import {
  TaskStatus
} from '../../../+order-main/order-main.model';
import * as _ from 'lodash';
import {
  ItemTypes
} from '../order-styles.model';

@Component({
  selector: 'styles-main',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'styles-main.template.html',
  styleUrls: [
    'styles-main.style.scss'
  ]
})
export class StylesMainComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild('stylesTable')
  public stylesTable: DatatableComponent;

  public tabs;
  public tableConfig = {
    keySort: 'styleName',
    orderDescending: 'asc',
    currentPage: 1,
    pageSize: 10,
    loading: false
  };
  public orderIndex = {
    orderId: 0
  };
  public stylesData = {
    totalRecord: 0,
    data: []
  };
  public allStyleData = [];
  public currentComponentWidth;
  public taskStatus = TaskStatus;
  public itemType;

  public isPageReadOnly = false;

  constructor(private _breadcrumbService: BreadcrumbService,
              private _router: Router,
              private _salesOrderService: SalesOrderService,
              private _stylesMainService: StylesMainService,
              private _toastrService: ToastrService,
              private _authService: AuthService,
              private _localStorageService: LocalStorageService,
              private _modalService: NgbModal) {
    this._breadcrumbService
      .hideRouteRegex('/order-log-v2/[0-9A-Za-z]+/styles/standard');
  }

  public ngOnInit(): void {
    this._salesOrderService.getUpdateStatusOrder().subscribe((status) => {
      this.isPageReadOnly = status;
    });
    this.itemType = this._localStorageService.get('StyleMain_ItemType');
    this.orderIndex = this._salesOrderService.orderIndex;
    this.refreshDatatable();
  }

  public ngAfterViewChecked(): void {
    // Check if the table size has changed
    if (this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
      this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
      setTimeout(() => {
        this.stylesTable.recalculate();
      }, 200);
    }
  }

  /**
   * Active nav tab is selected
   * @param url
   */
  public configNavTabs(): void {
    this.tabs = [
      {
        id: ItemTypes.DOMESTIC,
        name: 'Domestic',
        isActive: this.itemType ? this.itemType === ItemTypes.DOMESTIC : false,
        isView: !!this.allStyleData.filter((i) => i.itemType === ItemTypes.DOMESTIC
          || i.itemType === 0).length,
        isDisabled: false
      },
      {
        id: ItemTypes.OUTSOURCE,
        name: 'Outsource',
        isActive: this.itemType ? this.itemType === ItemTypes.OUTSOURCE : false,
        isView: !!this.allStyleData.filter((i) => i.itemType === ItemTypes.OUTSOURCE).length,
        isDisabled: false
      },
      {
        id: ItemTypes.IMPORTS,
        name: 'Imports',
        isActive: this.itemType ? this.itemType === ItemTypes.IMPORTS : false,
        isView: !!this.allStyleData.filter((i) => i.itemType === ItemTypes.IMPORTS).length,
        isDisabled: false
      }
    ];
    this.tabs.forEach((tab) => {
      if (tab.isView && tab.isActive) {
        this._breadcrumbService.addFriendlyNameForRouteRegex(
          '^/order-log-v2/[0-9A-Za-z]+/styles/[a-zA-z]+$', tab.name);
      }
    });
    if (!this.getCurrentActivatedTab()) {
      this.activeFirstTab();
    }
  }

  public getCurrentActivatedTab(): any {
    return this.tabs.find((i) => i.isView && i.isActive);
  }

  /**
   * Active first tab is visible
   */
  public activeFirstTab(): void {
    const firstTab = this.tabs.find((i) => i.isView);
    if (firstTab) {
      firstTab.isActive = true;
      this.switchTab({target: {innerText: 'Active'}}, firstTab);
    }
  }

  /**
   * Event switch tab
   * @param index
   */
  public switchTab(event: any, tab: any): void {
    // Avoid click to tab when click delete on this tab
    if (!event.target['innerText']) {
      return;
    }
    this._breadcrumbService.addFriendlyNameForRouteRegex(
      '^/order-log-v2/[0-9A-Za-z]+/styles/[a-zA-Z]+$', tab.name);
    this.itemType = tab.id;
    this.tabs.forEach((i) => {
      i.isActive = this.itemType === i.id;
    });
    this.setDatatableByItemType(this.itemType);
  }

  public setDatatableByItemType(itemType: number) {
    let data = [];
    if (itemType === ItemTypes.DOMESTIC) {
      data = this.allStyleData.filter((i) => i.itemType === itemType || i.itemType === 0);
    } else {
      data = this.allStyleData.filter((i) => i.itemType === itemType);
    }
    this.stylesData.data = data;
    this.stylesData.totalRecord = data.length;
    this.stylesData.data.forEach((style) => {
      this.sizesToTableData(style);
    });
    setTimeout(() => {
      this.stylesTable.recalculate();
    }, 200);
  }

  /**
   * Navigate to New user page
   */
  public editStyle(ev, row: any): void {
    if (ev.view.getSelection().toString().length > 0) {
      ev.preventDefault();
      return;
    }
    this._salesOrderService.orderIndex.styleName = row.styleName;
    this._salesOrderService.orderIndex.partnerStyleName = row.partnerStyleName;
    this._router.navigate(['order-log-v2', this.orderIndex.orderId, 'styles', row.id]);
  }

  public isAdmin(): boolean {
    return this._authService.isAdmin();
  }

  public deleteStyle(row: any): void {
    let modalRef = this._modalService.open(ConfirmDialogComponent, {
      keyboard: true
    });
    modalRef.componentInstance.message = 'All configuration data will be deleted for ' +
      'the style ‘' + row.styleName + '’. Continue?';
    modalRef.componentInstance.title = 'Confirm Style Deletion';

    modalRef.result.then((res: boolean) => {
      if (res) {
        if (row.id) {
          this._stylesMainService
            .deleteStyleDetail(row.id)
            .subscribe((resp: BasicResponse) => {
              if (resp.status) {
                this._toastrService.success(resp.message, 'Success');
                this.refreshDatatable();
                if (!this.getCurrentActivatedTab()) {
                  this.activeFirstTab();
                }
                this._salesOrderService.setUpdateStyleNum(false);
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
      }
    });
  }

  /**
   * Sort change event
   * @param event
   */
  public onSort(event: SortEvent): void {
    this.tableConfig.keySort = event.sorts[0].prop;
    this.tableConfig.orderDescending = event.sorts[0].dir;
    this.tableConfig.loading = true;
    this.refreshDatatable();
  }

  public sizesToTableData(styleObject) {
    // style array table
    styleObject.quantity = [];
    // rows, cols name
    let rowsName = [
      {
        prop: 'SalesOrderQty',
        name: 'Sales'
      },
      {
        prop: 'PurchaseQty',
        name: 'Purch'
      },
      {
        prop: 'ProductionQty',
        name: 'Prod'
      },
      {
        prop: 'TotalFinishedQty',
        name: 'Finish'
      }
    ];
    let colsName = [];
    styleObject.sizes.forEach((size) => {
      colsName.push(size.size);
    });
    colsName.push('Total');
    colsName = _.union(colsName);
    // table data
    rowsName.forEach((row) => {
      let rowData = [];
      colsName.forEach((col) => {
        let cellData = _.find(styleObject.sizes, {
          type: row.prop,
          size: col
        });
        if (cellData) {
          rowData.push({
            ...cellData,
            name: row.name
          });
        } else {
          rowData.push({
            size: col,
            qty: 0,
            type: row.prop,
            name: row.name
          });
        }
      });
      // total col
      rowData[rowData.length - 1].qty = _.sumBy(rowData, 'qty');
      styleObject.quantity.push(rowData);
    });
  }

  public locationDetail(row, printLocationId: number): void {
    this._router.navigate([
      'order-log-v2',
      this.orderIndex.orderId,
      'styles',
      row.id,
      'print-location',
      printLocationId
    ]);
  }

  public trimDetail(row, trimId: number) {
    this._router.navigate([
      'order-log-v2', this.orderIndex.orderId, 'styles',
      row.id, 'trims', trimId
    ]);
  }

  /**
   * Ajax datatable
   * @param draw
   */
  public refreshDatatable(): Promise<boolean> {
    let orderId = this.orderIndex.orderId.toString();
    let orderDescending = this.tableConfig.orderDescending || 'asc';
    let keySort = this.tableConfig.keySort;

    return new Promise((resolve, reject) => {
      this._stylesMainService.getListStyle(orderId)
        .subscribe((resp: ResponseMessage<StyleResponse[]>): void => {
          if (resp.status) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;
            this.allStyleData = resp.data;
            if (keySort) {
              if (keySort === 'vendorStyleName') {
                this.allStyleData = _.orderBy(this.allStyleData,
                  [keySort, 'colorName'], [orderDescending, orderDescending]);
              } else {
                this.allStyleData = _.orderBy(this.allStyleData,
                  [keySort], [orderDescending]);
              }
            }

            this.setDatatableByItemType(this.itemType);
            this.configNavTabs();
            resolve(true);
          } else {
            reject(false);
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    });
  }

  public ngOnDestroy(): void {
    this._localStorageService.add('StyleMain_ItemType', this.itemType);
  }
}
