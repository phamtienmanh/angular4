import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  ToastrService
} from 'ngx-toastr';

import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  Subscription
} from 'rxjs/Subscription';

// Interfaces
import {
  OrderDetail
} from '../../../+order-log-v2/+sales-order/+order-info';
import {
  SalesOrderListResp
} from './customers-sales-order.model';
import {
  ResponseMessage,
  SortEvent,
  RowSelectEvent
} from '../../../shared/models';

// Services
import {
  CustomersSalesOrderService
} from './customers-sales-order.service';
import { AuthService } from '../../../shared/services/auth';
import { Util } from '../../../shared/services/util';

@Component({
  selector: 'customer-sales-order',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'customer-sales-order.template.html',
  styleUrls: [
    'customer-sales-order.style.scss'
  ]
})
export class CustomerSalesOrderComponent implements OnInit, OnDestroy {
  public searchText: string;
  public salesOrderData = {
    totalRecord: 0,
    data: []
  };
  public customerId: number;
  public tableConfig = {
    keySort: 'retailerPo',
    keyWord: '',
    orderDescending: false,
    currentPage: 1,
    pageSize: 10,
    loading: false
  };

  public activatedSub: Subscription;
  public lock = false;

  public isPageReadOnly = false;

  /**
   * ctor
   */
  constructor(private _customersSalesOrderService: CustomersSalesOrderService,
              private _toastrService: ToastrService,
              private _authService: AuthService,
              private _utilService: Util,
              private _activatedRoute: ActivatedRoute,
              private _router: Router) { }

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Customers');
    this.activatedSub = this._activatedRoute.parent.params.subscribe((params: { id: number }) => {
      this.customerId = params.id;
      this.refreshDatatable();
    });
  }

  // ---------------------------------------------------------
  /**
   * Search text change event
   * @param value
   */
  public onSearchChanged(value: string): void {
    this.searchText = value;
    this.refreshDatatable();
  }

  /**
   * Page size change event
   * @param pageSize
   */
  public onSelectedPageSize(pageSize: number): void {
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
  }

  /**
   * goToOrderDetail
   * @param row
   */
  public goToOrderDetail(row): void {
    this._router.navigate([
      'order-log-v2',
      row.orderId
    ]);
  }

  /**
   * goToDesignDetail
   * @param {MouseEvent} e
   * @param row
   * @param {OrderDetail} rowDetail
   */
  public goToDesignDetail(e: MouseEvent, row, rowDetail: OrderDetail) {
    this._router.navigate([
      'order-log-v2',
      row.orderId,
      'styles',
      rowDetail.id
    ]);
  }

  /**
   * refreshDatatable
   * @param {number} draw
   */
  public refreshDatatable(draw?: number): void {
    this.tableConfig.currentPage = draw ? draw + 1 : 1;
    let countSkip = draw ? draw * this.tableConfig.pageSize : 0;
    let pageSize = this.tableConfig.pageSize.toString();
    let orderDescending = this.tableConfig.orderDescending.toString();
    let keySort = this.tableConfig.keySort;
    let keyword = this.searchText;

    let params: HttpParams = new HttpParams()
      .set('countSkip', countSkip.toString())
      .set('pageSize', pageSize)
      .set('orderDescending', orderDescending)
      .set('keySort', keySort)
      .set('keyword', keyword);

    this._customersSalesOrderService.getListSalesOrder(this.customerId, params)
      .subscribe((resp: ResponseMessage<SalesOrderListResp>): void => {
        if (resp.status) {
          this.tableConfig.loading = false;

          let responseData = resp.data;
          this.salesOrderData.totalRecord = responseData.totalRecord;
          this.salesOrderData.data = responseData.data;
          if (this.salesOrderData.data && !this.lock) {
            this.lock = true;
          }
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * goToNewSalesOrder
   */
  public goToNewSalesOrder(): void {
    this._router.navigate([
      'order-log-v2',
      'new-order'
    ]);
  }

  public ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
