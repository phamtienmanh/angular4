import {
  Component,
  AfterViewChecked,
  OnInit,
  ViewChild,
  ViewEncapsulation
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
  VendorsMainService
} from './vendors-main.service';
import {
  RouterService
} from '../../core/router';
import {
  Util
} from '../../shared/services/util';
import { AuthService } from '../../shared/services/auth';
import {
  LocalStorageService
} from 'angular-2-local-storage';

// Interfaces
import {
  RowSelectEvent,
  TypeEnum,
  ResponseMessage,
  SortEvent
} from '../../shared/models';
import {
  VendorListResp
} from './vendors-main.model';
import {
  DatatableComponent
} from '@swimlane/ngx-datatable';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'vendors-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'vendors-main.template.html',
  styleUrls: [
    'vendors-main.style.scss'
  ]
})
export class VendorsMainComponent implements OnInit,
                                             AfterViewChecked {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild(DatatableComponent)
  public table: DatatableComponent;
  public currentComponentWidth;
  public searchText: string;
  public vendorData = {
    totalRecord: 0,
    data: []
  };
  public tableConfig;

  public isPageReadOnly = false;

  constructor(private _router: Router,
              private _vendorsMainService: VendorsMainService,
              private _toastrService: ToastrService,
              private _routerService: RouterService,
              private _utilService: Util,
              private _authService: AuthService,
              private _breadcrumbService: BreadcrumbService,
              private _localStorageService: LocalStorageService) {
    const vendorMainPageSize = this._localStorageService.get('vendorMainPageSize');
    this.tableConfig = {
      keySort: 'company',
      keyword: '',
      orderDescending: false,
      currentPage: this._utilService.currentPage ? this._utilService.currentPage : 1,
      pageSize: vendorMainPageSize ? vendorMainPageSize : 10,
      loading: false
    };
  }

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Vendors');
    this.refreshDatatable(this.tableConfig.currentPage - 1);
  }

  /**
   * Check if the table size has changed, recalculate table size
   */
  public ngAfterViewChecked() {
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
      this._router.navigate(['vendors-management', event.row.id]);
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
    this._localStorageService.set('vendorMainPageSize', pageSize);
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

    let params: HttpParams = new HttpParams();
    params = params.set('countSkip', countSkip.toString());
    params = params.set('pageSize', pageSize);
    params = params.set('orderDescending', orderDescending);
    params = params.set('keySort', keySort);
    params = params.set('keyword', keyword);
    params = params.set('type', TypeEnum.Vendor.toString());

    return new Promise((resolve, reject) => {
      this._vendorsMainService.getListVendor(params)
        .subscribe((resp: ResponseMessage<VendorListResp>): void => {
          if (resp.status) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;

            let responseData = resp.data;
            this.vendorData.totalRecord = responseData.totalRecord;
            this.vendorData.data = responseData.data;
            resolve(true);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
            reject(false);
          }
        });
    });
  }

  /**
   * add new vendor
   */
  public addNewVendor(): void {
    this._router.navigate(['vendors-management', 'new']);
  }
}
