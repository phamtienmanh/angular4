import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  SalesOrderListResp
} from '../../customers-management.model';

import {
  ToastrService
} from 'ngx-toastr';

import {
  SortEvent,
  ResponseMessage,
  RowSelectEvent
} from '../../../shared/models';

import {
  VendorsPurchaseOrderService
} from './vendors-purchase-order.service';

import {
  PurchaseOrderListResp
} from './vendor-purchase-order.model';
import {
  Subscription
} from 'rxjs/Subscription';
import {
  OrderDetail
} from '../../../+order-log-v2/+sales-order/+order-info';

import {
  AuthService
} from '../../../shared/services/auth';
import { Util } from '../../../shared/services/util';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'vendor-purchase-order',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'vendor-purchase-order.template.html',
  styleUrls: [
    'vendor-purchase-order.style.scss'
  ]
})

export class VendorPurchaseOrderComponent implements OnInit, OnDestroy {
  public searchText: string;
  public purchaseOrderData = {
    totalRecord: 0,
    data: []
  };
  public tableConfig = {
    keySort: 'customerName',
    keyWord: '',
    orderDescending: false,
    currentPage: 1,
    pageSize: 10,
    loading: false
  };
  public vendorId: number;
  public activatedSub: Subscription;
  public lock = false;

  public isPageReadOnly = false;

  /**
   * ctor
   */
  constructor(private _vendorsPurchaseOrderService: VendorsPurchaseOrderService,
              private _router: Router,
              private _authService: AuthService,
              private _utilService: Util,
              private _toastrService: ToastrService,
              private _activatedRoute: ActivatedRoute) { }

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Vendors');
    this.activatedSub = this._activatedRoute.parent.params.subscribe((params: { id: number }) => {
      this.vendorId = params.id;
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
    this._router.navigate(['order-log-v2', row.orderId]);
  }

  /**
   * goToDesignDetail
   * @param {MouseEvent} e
   * @param row
   * @param {OrderDetail} rowDetail
   */
  public goToDesignDetail(e: MouseEvent, row, rowDetail: OrderDetail) {
    this._router.navigate(['order-log-v2', row.orderId, 'styles', rowDetail.id]);
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

    let params: HttpParams = new HttpParams();
    params = params.set('countSkip', countSkip.toString());
    params = params.set('pageSize', pageSize);
    params = params.set('orderDescending', orderDescending);
    params = params.set('keySort', keySort);
    params = params.set('keyword', keyword);

    this._vendorsPurchaseOrderService.getListVendorPurchaseOrder(this.vendorId, params)
      .subscribe((resp: ResponseMessage<PurchaseOrderListResp>): void => {
        if (resp.status) {
          this.tableConfig.loading = false;

          let responseData = resp.data;
          this.purchaseOrderData.totalRecord = responseData.totalRecord;
          this.purchaseOrderData.data = responseData.data;
          if (this.purchaseOrderData.data && !this.lock) {
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
    this._router.navigate(['order-log-v2', 'new-order']);
  }

  public ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
