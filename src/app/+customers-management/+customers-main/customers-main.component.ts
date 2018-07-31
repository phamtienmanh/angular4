import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  AfterViewChecked
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  Router
} from '@angular/router';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';

// Services
import {
  CustomersMainService
} from './customers-main.service';
import {
  RouterService
} from '../../core/router';
import {
  Util
} from '../../shared/services/util';
import { AuthService } from '../../shared/services/auth';

// Interfaces
import {
  ResponseMessage,
  RowSelectEvent,
  TypeEnum,
  SortEvent
} from '../../shared/models';
import {
  CustomerListResp
} from './customers-main.model';
import {
  DatatableComponent
} from '@swimlane/ngx-datatable';
import {
  LocalStorageService
} from 'angular-2-local-storage';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'customers-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'customers-main.template.html',
  styleUrls: [
    'customers-main.style.scss'
  ]
})
export class CustomersMainComponent implements OnInit,
                                               AfterViewChecked {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild(DatatableComponent)
  public table: DatatableComponent;

  public currentComponentWidth;
  public searchText: string;
  public customerData = {
    totalRecord: 0,
    data: []
  };
  public tableConfig;

  public isPageReadOnly = false;

  constructor(private _router: Router,
              private _customersMainService: CustomersMainService,
              private _toastrService: ToastrService,
              private _routerService: RouterService,
              private _authService: AuthService,
              private _utilService: Util,
              private _breadcrumbService: BreadcrumbService,
              private _localStorageService: LocalStorageService) {
    const cusMainPageSize = this._localStorageService.get('cusMainPageSize');
    this.tableConfig = {
      keySort: 'company',
      keyword: '',
      orderDescending: false,
      currentPage: this._utilService.currentPage ? this._utilService.currentPage : 1,
      pageSize: cusMainPageSize ? cusMainPageSize : 10,
      loading: false
    };
  }

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Customers');
    this.refreshDatatable(this.tableConfig.currentPage - 1);
  }

  public ngAfterViewChecked() {
    // Check if the table size has changed
    if (this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
      this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
      setTimeout(() => {
        this.table.recalculate();
      }, 200);
    }
  }

  // -----------------Select Row By Checkbox-----------------
  /**
   * Row click event
   * @param event
   */
  public onActivate(event: RowSelectEvent): void {
    if (event.column.name) {
      // this._routerService.set({
      //   enableBackView: true
      // });
      this._utilService.currentPage = this.tableConfig.currentPage;
      this._router.navigate([
        'customers-management',
        event.row.id
      ]);
    }
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
    this._localStorageService.set('cusMainPageSize', pageSize);
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
   * Ajax datatable
   * @param draw
   */
  public refreshDatatable(draw?: number): Promise<boolean> {
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
      .set('keyword', keyword)
      .set('type', TypeEnum.Customer.toString());
    return new Promise((resolve, reject) => {
      this._customersMainService.getListCustomer(params)
        .subscribe((resp: ResponseMessage<CustomerListResp>): void => {
          if (resp.status) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;

            let responseData = resp.data;
            this.customerData.totalRecord = responseData.totalRecord;
            this.customerData.data = responseData.data;
            resolve(true);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
            reject(false);
          }
        });
    });
  }

  /**
   * add new customer
   */
  public addNewCustomer(): void {
    this._router.navigate([
      'customers-management',
      'new'
    ]);
  }
}
