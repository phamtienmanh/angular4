import {
  Component,
  AfterViewChecked,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  HostListener
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
import * as FileSaver from 'file-saver';

// Services
import {
  ProductsMainService
} from './products-main.service';
import {
  RouterService
} from '../../core/router';
import {
  Util,
  AuthService
} from '../../shared';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  ProductInfoService
} from './+product-info/product-info.service';

// Components
import {
  ConfirmDialogComponent
} from '../../shared/modules/confirm-dialog';

// Interfaces
import {
  SortEvent,
  ResponseMessage,
  BasicResponse,
  RowSelectEvent
} from '../../shared/models';
import {
  ProductListResp,
  ProductStatus
} from './products-main.model';
import {
  DatatableComponent
} from '@swimlane/ngx-datatable';
import {
  ProductInfoComponent
} from './+product-info';
import { ProductType } from '../+project-manage/+project-primary';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'products-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'products-main.template.html',
  styleUrls: [
    'products-main.style.scss'
  ]
})
export class ProductsMainComponent implements OnInit, AfterViewChecked {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild(DatatableComponent)
  public productMainTable: DatatableComponent;
  public currentComponentWidth;
  public searchText: string;
  public productData: any = {
    totalRecord: 0,
    data: []
  };
  public tableConfig;
  public tabs: any = [
    {
      id: 1,
      name: 'All',
      isActive: false
    },
    {
      id: 2,
      name: 'Active',
      isActive: false
    },
    {
      id: 3,
      name: 'Priority',
      isActive: false
    },
    {
      id: 4,
      name: 'Secondary',
      isActive: false
    },
    {
      id: 5,
      name: 'Archived',
      isActive: false
    }
  ];

  public _filterStr;
  public _filterStatus;
  public isPageReadOnly = false;
  public productStatus = ProductStatus;

  constructor(private _router: Router,
              private _productsMainService: ProductsMainService,
              private _toastrService: ToastrService,
              private _routerService: RouterService,
              private _utilService: Util,
              private _authService: AuthService,
              private _modalService: NgbModal,
              private _breadcrumbService: BreadcrumbService,
              private _productInfoService: ProductInfoService,
              private _localStorageService: LocalStorageService) {
    const productsMainPageSize = this._localStorageService.get('productsMainPageSize');
    this.tableConfig = {
      keySort: '',
      keyword: '',
      orderDescending: false,
      currentPage: this._utilService.currentPage ? this._utilService.currentPage : 1,
      pageSize: productsMainPageSize ? productsMainPageSize : 10,
      loading: false
    };
  }

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Projects.Products');
    this.configNavTabs().then((status: boolean) => {
      if (status) {
        this.productData = {
          totalRecord: 0,
          data: []
        };
        this.refreshDatatable(this.tableConfig.currentPage - 1);
      }
    });
  }

  /**
   * Check if the table size has changed, recalculate table size
   */
  public ngAfterViewChecked() {
    if (this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
      this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
      setTimeout(() => {
        this.productMainTable.recalculate();
      }, 200);
    }
  }

  /**
   * Row detail click event
   * @param event
   */
  public onActivate(event: RowSelectEvent): void {
    if (event) {
      event.cellElement.blur();
    }
  }

  public get getCurrentTab(): any {
    return this.tabs.find((i) => i.isActive);
  }

  /**
   * Active nav tab is selected
   * @param url
   */
  public configNavTabs(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const findFirstTab = () => {
        let firstTab = this.tabs.find((tab) => !tab.isDisabled);
        if (firstTab) {
          firstTab.isActive = true;
          resolve(true);
        }
      };
      if (this.tabs && this.tabs.length) {
        this.tabs.forEach((tab) => tab.isActive = false);
        // ---------------
        const productsCurrentDashboard = this._localStorageService
          .get('Products_CurrentDashboard') as any;
        if (productsCurrentDashboard) {
          let preTab = this.tabs
            .find((tab) => !tab.isDisabled && tab.name === productsCurrentDashboard.name);
          if (preTab) {
            preTab.isActive = true;
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
      this._localStorageService.set('Products_CurrentDashboard',
        {
          name: this.getCurrentTab.name
        });

      this.productData = {
        totalRecord: 0,
        data: []
      };
      this.refreshDatatable();
    }
  }

  /**
   * Export selected orders
   */
  public onExportProducts(type): void {
    // let orderDescending = this.tableConfig.orderDescending.toString();
    // let filter = this._filterStr.filter;
    // let status = this._filterStatus.status;
    //
    // let params: HttpParams = new HttpParams()
    //   .set('filter', filter)
    //   .set('status', status)
    //   .set('utcOffset', (-1 * new Date().getTimezoneOffset() / 60).toString())
    //   .set('orderDescending', orderDescending);
    //
    // this._productsMainService.exportProducts(params)
    //   .subscribe((resp: any) => {
    //     let data = resp;
    //     let values = data.headers.get('Content-Disposition');
    //     let filename = values.split(';')[1].trim().split('=')[1];
    //     // remove " from file name
    //     filename = filename.replace(/"/g, '');
    //     let blob;
    //     if (type === 'pdf') {
    //       blob = new Blob([(<any> data).body],
    //         {type: 'application/pdf'}
    //       );
    //     } else if (type === 'xlsx') {
    //       blob = new Blob([(<any> data).body],
    //         {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
    //       );
    //     }
    //     FileSaver.saveAs(blob, filename);
    //   });
  }

  /**
   * onUpdateFilter
   * @param filterObj
   */
  public onUpdateFilter(filterObj: any): void {
    this._filterStr = filterObj.filter;
    this._filterStatus = filterObj.status;
    this.refreshDatatable();
  }

  /**
   * Fire filter event
   */
  public onFilter(filterObj: any): void {
    this._filterStr = filterObj.filter;
    this._filterStatus = filterObj.status;
    this.refreshDatatable();
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
    this._localStorageService.set('productsMainPageSize', pageSize);
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

  public openEditProductPopup(row): void {
    let modalRef = this._modalService.open(ProductInfoComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static'
    });
    modalRef.componentInstance.productId = row.id;
    modalRef.componentInstance.projectId = row.projectId;
    modalRef.result.then((res) => {
      if (res.data) {
        Object.assign(row, res.data);
      }
    }, (err) => {
      // empty
    });
  }

  public deleteProduct(row): void {
    let modalRef = this._modalService.open(ConfirmDialogComponent, {
      keyboard: true
    });
    modalRef.componentInstance
      .message = `Are you sure you want to delete product '${row.description}'?`;
    modalRef.componentInstance.title = 'Confirm Product Deletion';

    modalRef.result.then((res: boolean) => {
      if (res) {
        this._productInfoService.deleteProduct(row.projectId, row.id)
          .subscribe((resp: BasicResponse) => {
            if (resp.status) {
              this._toastrService.success(resp.message, 'Success');
              this.refreshDatatable();
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
    });
  }

  public onArchive(row): void {
    setTimeout(() => {
      let modalRef = this._modalService.open(ConfirmDialogComponent, {
        keyboard: true
      });
      modalRef.componentInstance
        .message = `Are you sure you want to archive product ${row.description}?`;
      modalRef.componentInstance.title = 'Confirm Product Archive';

      modalRef.result.then((res: boolean) => {
        if (res) {
          this._productInfoService
            .archiveProduct(row.projectId, row.id, {status: ProductStatus.Archive})
            .subscribe((resp: BasicResponse) => {
              if (resp.status) {
                this._toastrService.success(resp.message, 'Success');
                this.refreshDatatable();
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
      });
    });
  }

  public goToProjectDetail(projectId: number, type: number): void {
    if (!projectId) {
      return;
    }
    this._router.navigate([
      'projects',
      projectId,
      type === ProductType.Priority ? 'project-priority' : 'project-secondary'
    ]);
  }

  /**
   * Ajax datatable
   * @param draw
   */
  public refreshDatatable(draw?: number): Promise<boolean> {
    let countSkip = draw ? draw * this.tableConfig.pageSize : 0;
    let pageSize = this.tableConfig.pageSize.toString();
    let orderDescending = this.tableConfig.orderDescending.toString();
    let keySort = this.tableConfig.keySort;
    let keyword = this.searchText;
    let type = this.getCurrentTab ? this.getCurrentTab.id.toString() : '0';
    let filter = this._filterStr;
    let status = this._filterStatus;

    let params: HttpParams = new HttpParams()
      .set('countSkip', countSkip.toString())
      .set('pageSize', pageSize)
      .set('type', type)
      .set('orderDescending', orderDescending)
      .set('keySort', keySort)
      .set('filter', filter)
      .set('status', status)
      .set('utcOffset', (-1 * new Date().getTimezoneOffset() / 60).toString())
      .set('keyword', keyword);

    return new Promise((resolve, reject) => {
      this._productsMainService.getListProduct(params)
        .subscribe((resp: ResponseMessage<ProductListResp>): void => {
          if (resp.status && resp.data) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;

            let responseData = resp.data;
            this.productData.totalRecord = responseData.totalRecord;
            this.productData.data = responseData.data;
            resolve(true);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
            reject(false);
          }
        });
    });
  }
}
