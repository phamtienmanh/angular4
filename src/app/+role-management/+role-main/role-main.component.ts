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
  RoleMainService
} from './role-main.service';
import {
  RouterService
} from '../../core/router';
import { Util } from '../../shared/services/util';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import { AuthService } from '../../shared/services/auth/auth.service';

// Interfaces
import {
  UserInfo,
  SortEvent,
  RowSelectEvent,
  ResponseMessage
} from '../../shared/models';
import {
  ConfirmDialogComponent
} from '../../shared/modules/confirm-dialog/confirm-dialog.component';
import {
  BasicResponse
} from '../../shared/models/respone.model';
import {
  DatatableComponent
} from '@swimlane/ngx-datatable';
import {
  RoleListResponse
} from '../role-management.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'role-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'role-main.template.html',
  styleUrls: [
    'role-main.style.scss'
  ]
})
export class RoleMainComponent implements OnInit,
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
  public roleData = {
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
              private _roleMainService: RoleMainService,
              private _routerService: RouterService,
              private _authService: AuthService,
              private _utilService: Util,
              private _toastrService: ToastrService,
              private _localStorageService: LocalStorageService) {
    this.isPageReadOnly = !this._authService.checkCanModify('Roles');
    const roleMainPageSize = this._localStorageService.get('roleMainPageSize');
    this.tableConfig = {
      keySort: 'fullName',
      keyword: '',
      orderDescending: false,
      currentPage: this._utilService.currentPage ? this._utilService.currentPage : 1,
      pageSize: roleMainPageSize ? roleMainPageSize : 10,
      loading: false
    };
  }

  public ngOnInit(): void {
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
      if (this.roleData.selected.isCheckedAll) {
        [].forEach.call(rowElements, (row) => {
          row.className += ' highlight-row';
        });
      } else {
        [].forEach.call(rowElements, (row) => {
          row.classList.remove('highlight-row');
        });
      }

      rows.forEach((row: ElementRef, index) => {
        row.nativeElement.checked = this.roleData.selected.isCheckedAll;
        // Ex: id = 'checkbox-4'
        let id = Number.parseInt(row.nativeElement.id.replace('checkbox-', ''));
        let itemCheckedIndex = this.roleData.selected.itemsChecked.indexOf(id);
        if (itemCheckedIndex > -1) {
          rowElements[index].className += ' highlight-row';
          row.nativeElement.checked = true;
        }
        let itemRemoveIndex = this.roleData.selected.itemsRemoved.indexOf(id);
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
    this.roleData.selected.itemsChecked = [];
    this.roleData.selected.itemsRemoved = [];
    this.roleData.selected.indeterminate = false;
  }

  /**
   * Row checkbox event
   * @param $event
   * @param row
   */
  public onRowSelected($event, row: UserInfo): void {
    if ($event.target.checked) {
      if (this.roleData.selected.isCheckedAll) {
        let itemIndex = this.roleData.selected.itemsRemoved.indexOf(row.id);
        if (itemIndex > -1) {
          this.roleData.selected.itemsRemoved.splice(itemIndex, 1);
        }
        this.roleData.selected.indeterminate = this.roleData
          .selected.itemsRemoved.length > 0;
      } else {
        this.roleData.selected.itemsRemoved = [];
        if (this.roleData.selected.itemsChecked.indexOf(row.id) === -1) {
          this.roleData.selected.itemsChecked.push(row.id);
          if (this.roleData.selected.itemsChecked
              .length === this.roleData.totalRecord) {
            this.roleData.selected.isCheckedAll = true;
            this.roleData.selected.indeterminate = false;
          }
        }
      }
    } else {
      if (this.roleData.selected.isCheckedAll) {
        this.roleData.selected.itemsChecked = [];
        // Avoid duplicate value in array
        if (this.roleData.selected.itemsRemoved.indexOf(row.id) === -1) {
          this.roleData.selected.itemsRemoved.push(row.id);
          this.roleData.selected.indeterminate = true;
        }
        if (this.roleData.selected.itemsRemoved.length === this.roleData.totalRecord) {
          this.roleData.selected.indeterminate = false;
          this.roleData.selected.isCheckedAll = false;
        }
      } else {
        let itemIndex = this.roleData.selected.itemsChecked.indexOf(row.id);
        if (itemIndex > -1) {
          this.roleData.selected.itemsChecked.splice(itemIndex, 1);
        }
      }
    }
  }

  /**
   * Uncheck all checkbox in table
   */
  public resetRowSelected(): void {
    this.roleData.selected = {
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
      // this._routerService.set({
      //   enableBackView: true
      // });
      this._utilService.currentPage = this.tableConfig.currentPage;
      this._router.navigate(['role-management', event.row.id]);
    }
    // Use rowElement to add class selected to highlight row
  }

  // ---------------------------------------------------------

  /**
   * Navigate to New user page
   */
  public addNewUser(): void {
    this._router.navigate(['role-management', 'new-role']);
  }

  /**
   * Delete selected row and update datatable
   */
  public deleteSelectedRow(): void {
    if (!this.roleData.selected.isCheckedAll
      && !this.roleData.selected.itemsChecked.length) {
      return;
    }

    let modalRef = this._modalService.open(ConfirmDialogComponent, {

      keyboard: true
    });
    modalRef.componentInstance
      .message = 'Are you sure you want to delete the selected role(s)?';
    modalRef.componentInstance.title = 'Confirm Role Deletion';

    modalRef.result.then((res: boolean) => {
      if (res) {
        let req = {
          isCheckedAll: this.roleData.selected.isCheckedAll,
          itemsRemoved: this.roleData.selected.itemsRemoved.join(),
          itemsChecked: this.roleData.selected.itemsChecked.join(),
          keyword: this.searchText
        };

        this._roleMainService.deleteMultiRole(req)
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
    this._localStorageService.set('roleMainPageSize', pageSize);
    this.tableConfig.pageSize = pageSize;
    this.refreshDatatable();
  }

  /**
   * Page change event
   * @param draw
   */
  public onPageChange(draw: number): void {
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

  public getListNameUser(userList): string {
    return userList.map((i) => i.fullName).join(', ');
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
    let keysort = this.tableConfig.keysort;
    let keyword = this.searchText;

    let params: HttpParams = new HttpParams()
      .set('countSkip', countSkip.toString())
      .set('pageSize', '99999')
      .set('orderDescending', orderDescending)
      .set('keysort', keysort)
      .set('keyword', keyword);

    return new Promise((resolve, reject) => {
      this._roleMainService.getListRoles(params)
        .subscribe((resp: ResponseMessage<RoleListResponse>): void => {
          if (resp.status) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;
            let responseData = resp.data;
            this.roleData.totalRecord = responseData.totalRecord;
            this.roleData.data = responseData.data;
            resolve(true);
          } else {
            reject(false);
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    });
  }
}
