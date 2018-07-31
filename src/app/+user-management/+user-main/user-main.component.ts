import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
  AfterViewInit,
  ElementRef,
  ViewChild,
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
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import {
  UserManagementService
} from '../user-management.service';
import {
  Util
} from '../../shared/services/util';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  AuthService
} from '../../shared/services/auth/auth.service';

// Interfaces
import {
  UserInfo,
  SortEvent,
  RowSelectEvent,
  UserListResponse,
  ResponseMessage
} from '../../shared/models/index';
import {
  ConfirmDialogComponent
} from '../../shared/modules/confirm-dialog/confirm-dialog.component';
import {
  BasicResponse
} from '../../shared/models/respone.model';
import {
  DatatableComponent
} from '@swimlane/ngx-datatable';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'user-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'user-main.template.html',
  styleUrls: [
    'user-main.style.scss'
  ]
})
export class UserMainComponent implements OnInit,
                                          AfterViewInit,
                                          AfterViewChecked {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild(DatatableComponent)
  public table: DatatableComponent;
  @ViewChildren('rowCheckbox')
  public rowCheckbox: QueryList<ElementRef>;

  public currentComponentWidth;
  public selected = [];
  public searchText: string;
  public userData = {
    totalRecord: 0,
    data: [],
    selected: {
      isCheckedAll: false,
      itemsChecked: [],
      itemsRemoved: [],
      indeterminate: false
    }
  };
  public tableConfig;

  public isPageReadOnly = false;

  constructor(private _router: Router,
              private _modalService: NgbModal,
              private _userManagementService: UserManagementService,
              private _utilService: Util,
              private _authService: AuthService,
              private _toastrService: ToastrService,
              private _localStorageService: LocalStorageService) {
    const userMainPageSize = this._localStorageService.get('userMainPageSize');
    this.tableConfig = {
      keySort: 'fullName',
      keyword: '',
      orderDescending: false,
      currentPage: this._utilService.currentPage ? this._utilService.currentPage : 1,
      pageSize: userMainPageSize ? userMainPageSize : 10,
      loading: false
    };
  }

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Users');
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
   * Active/Inactive checkbox when switch page
   */
  public ngAfterViewInit(): void {
    this.rowCheckbox.changes.subscribe((rows: QueryList<ElementRef>) => {

      let rowElements: NodeListOf<Element> = document.querySelectorAll('.datatable-body-row');
      if (this.userData.selected.isCheckedAll) {
        [].forEach.call(rowElements, (row) => {
          row.className += ' highlight-row';
        });
      } else {
        [].forEach.call(rowElements, (row) => {
          row.classList.remove('highlight-row');
        });
      }

      rows.forEach((row: ElementRef, index) => {
        row.nativeElement.checked = this.userData.selected.isCheckedAll;
        // Ex: id = 'checkbox-4'
        let id = Number.parseInt(row.nativeElement.id.replace('checkbox-', ''));
        let itemCheckedIndex = this.userData.selected.itemsChecked.indexOf(id);
        if (itemCheckedIndex > -1) {
          rowElements[index].className += ' highlight-row';
          row.nativeElement.checked = true;
        }
        let itemRemoveIndex = this.userData.selected.itemsRemoved.indexOf(id);
        if (itemRemoveIndex > -1) {
          rowElements[index].classList.remove('highlight-row');
          row.nativeElement.checked = false;
        }
      });

    });
  }

  /**
   * Header checkbox event
   * @param isCheckAll
   */
  public onCheckAll(isCheckAll: boolean): void {
    let rows: NodeListOf<Element> = document.querySelectorAll('.datatable-body-row');
    if (isCheckAll) {
      [].forEach.call(rows, (row) => {
        row.className += ' highlight-row';
      });
    } else {
      [].forEach.call(rows, (row) => {
        row.classList.remove('highlight-row');
      });
    }
    this.rowCheckbox.forEach((row) => row.nativeElement.checked = isCheckAll);
    this.userData.selected.itemsChecked = [];
    this.userData.selected.itemsRemoved = [];
    this.userData.selected.indeterminate = false;
  }

  /**
   * Row checkbox event
   * @param $event
   * @param row
   */
  public onRowSelected($event, row: UserInfo): void {
    if ($event.target.checked) {
      if (this.userData.selected.isCheckedAll) {
        let itemIndex = this.userData.selected.itemsRemoved.indexOf(row.id);
        if (itemIndex > -1) {
          this.userData.selected.itemsRemoved.splice(itemIndex, 1);
        }
        this.userData.selected.indeterminate = this.userData
          .selected.itemsRemoved.length > 0;
      } else {
        this.userData.selected.itemsRemoved = [];
        if (this.userData.selected.itemsChecked.indexOf(row.id) === -1) {
          this.userData.selected.itemsChecked.push(row.id);
          if (this.userData.selected.itemsChecked
              .length === this.userData.totalRecord) {
            this.userData.selected.isCheckedAll = true;
            this.userData.selected.indeterminate = false;
          }
        }
      }
    } else {
      if (this.userData.selected.isCheckedAll) {
        this.userData.selected.itemsChecked = [];
        // Avoid duplicate value in array
        if (this.userData.selected.itemsRemoved.indexOf(row.id) === -1) {
          this.userData.selected.itemsRemoved.push(row.id);
          this.userData.selected.indeterminate = true;
        }
        if (this.userData.selected.itemsRemoved.length === this.userData.totalRecord) {
          this.userData.selected.indeterminate = false;
          this.userData.selected.isCheckedAll = false;
        }
      } else {
        let itemIndex = this.userData.selected.itemsChecked.indexOf(row.id);
        if (itemIndex > -1) {
          this.userData.selected.itemsChecked.splice(itemIndex, 1);
        }
      }
    }
  }

  /**
   * Uncheck all checkbox in table
   */
  public resetRowSelected(): void {
    this.userData.selected = {
      isCheckedAll: false,
      itemsChecked: [],
      itemsRemoved: [],
      indeterminate: false
    };
    this.rowCheckbox.forEach((row) => row.nativeElement.checked = false);
  }

  /**
   * Row click event
   * @param event
   */
  public onActivate(event: RowSelectEvent): void {
    let checkboxElement = event.cellElement.querySelector(`input#checkbox-${event.row.id}`);
    if (event.cellIndex === 0 && checkboxElement) {
      checkboxElement.checked = !checkboxElement.checked;
      this.onRowSelected({target: {checked: checkboxElement.checked}}, event.row);
    }
    if (checkboxElement && checkboxElement.checked) {
      event.rowElement.className += ' highlight-row';
    } else if (checkboxElement) {
      event.rowElement.classList.remove('highlight-row');
    }
    if (event.column.name) {
      // Restore previous situation of page when user press back from browser to back this page
      // this._routerService.set({
      //   enableBackView: true
      // });
      this._utilService.currentPage = this.tableConfig.currentPage;
      this._router.navigate(['user-management', event.row.id]);
    }
  }

  // ---------------------------------------------------------

  /**
   * Navigate to New user page
   */
  public addNewUser(): void {
    this._router.navigate(['user-management', 'new-user']);
  }

  /**
   * Delete selected row and update datatable
   */
  public deleteSelectedRow(): void {
    if (!this.userData.selected.isCheckedAll
      && !this.userData.selected.itemsChecked.length) {
      return;
    }

    let modalRef = this._modalService.open(ConfirmDialogComponent, {
      keyboard: true
    });
    modalRef.componentInstance
      .message = 'Are you sure you want to delete the selected user(s)?';
    modalRef.componentInstance.title = 'Confirm User Deletion';

    modalRef.result.then((res: boolean) => {
      if (res) {
        let req = {
          isCheckedAll: this.userData.selected.isCheckedAll,
          itemsRemoved: this.userData.selected.itemsRemoved.join(),
          itemsChecked: this.userData.selected.itemsChecked.join(),
          keyword: this.searchText
        };

        this._userManagementService.deleteMultiUser(req)
          .subscribe((resp: BasicResponse) => {
            if (resp.status) {
              this.refreshDatatable();
              this.resetRowSelected();
              this._toastrService.success(resp.message, 'Success');
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
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
   * Page size change event
   * @param pageSize
   */
  public onSelectedPageSize(pageSize: number): void {
    this._localStorageService.set('userMainPageSize', pageSize);
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
    this.tableConfig.currentPage = draw ? draw + 1 : 1;
    let countSkip = draw ? draw * this.tableConfig.pageSize : 0;
    let pageSize = this.tableConfig.pageSize.toString();
    let orderDescending = this.tableConfig.orderDescending.toString();
    let keysort = this.tableConfig.keysort;
    let keyword = this.searchText;

    let params: HttpParams = new HttpParams()
      .set('countSkip', countSkip.toString())
      .set('pageSize', pageSize)
      .set('orderDescending', orderDescending)
      .set('keysort', keysort)
      .set('keyword', keyword);

    return new Promise((resolve, reject) => {
      this._userManagementService.getListUser(params)
        .subscribe((resp: ResponseMessage<UserListResponse>): void => {
          if (resp.status) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;
            let responseData = resp.data;
            this.userData.totalRecord = responseData.totalRecord;
            this.userData.data = responseData.data;
            this.userData.data.forEach((data) => {
              if (data.role) {
                data.role = data.role.split(',');
              }
            });
            resolve(true);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
            reject(false);
          }
        });
    });
  }
}
