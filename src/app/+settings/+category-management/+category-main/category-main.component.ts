import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  AfterViewChecked
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  DatatableComponent
} from '@swimlane/ngx-datatable';

// Services
import {
  CategoryManagementService
} from '../category-management.service';
import {
  Util,
  AuthService
} from '../../../shared/services';
import {
  LocalStorageService
} from 'angular-2-local-storage';

// Interfaces
import {
  BasicResponse,
  SortEvent,
  ResponseMessage
} from '../../../shared/models';

// Components
import {
  ConfirmDialogComponent
} from '../../../shared/modules/confirm-dialog';
import {
  AddEditCustomComponent
} from '../../components/add-edit-custom';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'category-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'category-main.template.html',
  styleUrls: [
    'category-main.style.scss'
  ]
})
export class CategoryMainComponent implements OnInit,
                                              AfterViewChecked {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild(DatatableComponent)
  public table: DatatableComponent;

  public currentComponentWidth;
  public searchText: string;
  public categoryData = {
    totalRecord: 0,
    data: []
  };
  public tableConfig;

  public isPageReadOnly = false;

  constructor(private _modalService: NgbModal,
              private _categoryManagementService: CategoryManagementService,
              private _utilService: Util,
              private _authService: AuthService,
              private _toastrService: ToastrService,
              private _localStorageService: LocalStorageService) {
    const categoryMainPageSize = this._localStorageService.get('categoryMainPageSize');
    this.tableConfig = {
      keySort: 'name',
      keyword: '',
      orderDescending: false,
      currentPage: this._utilService.currentPage ? this._utilService.currentPage : 1,
      pageSize: categoryMainPageSize ? categoryMainPageSize : 10,
      loading: false
    };
  }

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Settings.ProductCategories');
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

  public deleteCategory(category) {
    let modalRef = this._modalService.open(ConfirmDialogComponent, {
      keyboard: true
    });
    modalRef.componentInstance.message = 'All configuration data will be deleted for ' +
      'the category ‘' + category.name + '’. Continue?';
    modalRef.componentInstance.title = 'Confirm Category Deletion';

    modalRef.result.then((res: boolean) => {
      if (res) {
        if (category.id) {
          this._categoryManagementService
            .deleteCategory(category.id)
            .subscribe((resp: BasicResponse) => {
              if (resp.status) {
                this._toastrService.success(resp.message, 'Success');
                this.refreshDatatable();
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
      }
    });
  }

  // ---------------------------------------------------------

  /**
   * Navigate to New category page
   */
  public addEditCategory(info?: any, index?: number): void {
    let modalRef = this._modalService.open(AddEditCustomComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static'
    });
    modalRef.componentInstance.customInfo = info;

    modalRef.result.then((res) => {
      if (res && res.frm) {
        if (info) {
          this._categoryManagementService.updateCategory(res.frm.id, res.frm)
            .subscribe((resp: ResponseMessage<any>) => {
              if (resp.status) {
                this._toastrService.success(resp.message, 'Success');
                Object.assign(this.categoryData.data[index], resp.data);
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        } else {
          this._categoryManagementService.createCategory(res.frm)
            .subscribe((resp: ResponseMessage<any>) => {
              if (resp.status) {
                this._toastrService.success(resp.message, 'Success');
                this.refreshDatatable();
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
      }
    }, (err) => {
      // empty
    });
  }

  /**
   * Search text change event
   * @param value
   */
  public onSearchChanged(value: string): void {
    this.searchText = value;
    this.refreshDatatable();
  }

  /**
   * Sort change event
   * @param event
   */
  public onSort(event: SortEvent): void {
    this.tableConfig.keysort = event.sorts[0].prop;
    this.tableConfig.orderDescending = event.sorts[0].dir === 'desc';
    this.tableConfig.loading = true;
    this.refreshDatatable(this.tableConfig.currentPage - 1);
  }

  /**
   * Ajax datatable
   * @param {number} draw
   * @returns {Promise<boolean>}
   */
  public refreshDatatable(draw?: number): Promise<boolean> {
    let countSkip = draw ? draw * this.tableConfig.pageSize : 0;
    let orderDescending = this.tableConfig.orderDescending.toString();
    let keysort = this.tableConfig.keysort;
    let keyword = this.searchText;

    let params: HttpParams = new HttpParams()
      .set('countSkip', countSkip.toString())
      .set('pageSize', '99999')
      .set('orderDescending', orderDescending)
      .set('keysort', keysort)
      .set('keyword', keyword);

    return new Promise((resolve, reject) => {
      this._categoryManagementService.getListCategory(params)
        .subscribe((resp: ResponseMessage<any>): void => {
          if (resp.status) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;
            let responseData = resp.data;
            this.categoryData.totalRecord = responseData.totalRecord;
            this.categoryData.data = responseData.data;
            resolve(true);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
            reject(false);
          }
        });
    });
  }
}
