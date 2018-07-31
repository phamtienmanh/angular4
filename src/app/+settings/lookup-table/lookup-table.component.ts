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
  SettingsService
} from '../settings.service';
import {
  RouterService
} from '../../core/router';
import {
  Util
} from '../../shared/services/util';
import {
  CommonService
} from '../../shared/services/common';

// Components
import {
  CreateOrUpdateLookupTableComponent
} from './create-or-update-lookup-table';

// Services
import { AuthService } from '../../shared/services/auth';

// Interfaces
import {
  SortEvent,
  RowSelectEvent,
  BasicResponse,
  ResponseMessage
} from '../../shared/models';
import {
  ConfirmDialogComponent
} from '../../shared/modules/confirm-dialog';
import {
  DatatableComponent
} from '@swimlane/ngx-datatable';
import {
  LookupData,
  LookupDataResponse,
  TableType
} from '../settings.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'lookup-table',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'lookup-table.template.html',
  styleUrls: [
    'lookup-table.style.scss'
  ]
})
export class LookupTableComponent implements OnInit,
                                           AfterViewInit,
                                           AfterViewChecked {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild(DatatableComponent)
  public table: DatatableComponent;
  @ViewChildren('rowCheckbox')
  public rowCheckbox: QueryList<ElementRef>;

  public lookupTableType;
  public lookupTableName;

  public currentComponentWidth;
  public selected = [];
  public searchText: string;
  public lookupTableData = {
    totalRecord: 0,
    data: [],
    selected: {
      isCheckedAll: false,
      itemsChecked: [],
      itemsRemoved: []
    }
  };
  public tableConfig = {
    keysort: 'fullName',
    keyword: '',
    orderDescending: false,
    currentPage: 1,
    pageSize: 10,
    loading: false
  };

  public isPageReadOnly = false;

  constructor(private _router: Router,
              private _modalService: NgbModal,
              private _settingsService: SettingsService,
              private _routerService: RouterService,
              private _utilService: Util,
              private _authService: AuthService,
              private _commonService: CommonService,
              private _toastrService: ToastrService) {
  }

  public ngOnInit(): void {
    let lastDash = this._router.url.lastIndexOf('/');
    this.lookupTableType = this.urlToType(this._router.url.substring(lastDash + 1));
    this.lookupTableName = this.urlToName(this._router.url.substring(lastDash + 1));
    this.isPageReadOnly = !this._authService
      .checkCanModify(`Settings.${this.lookupTableName.split(' ').join('')}`);
    this.refreshDatatable().then((value: boolean) => {
      // if (this._utilService.currentPage > 1) {
      //   this.onPageChange(this._utilService.currentPage - 1);
      // }
    });
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
   * Active/Inactive checkbox when switch page
   */
  public ngAfterViewInit(): void {
    this.rowCheckbox.changes.subscribe((rows: QueryList<ElementRef>) => {

      let rowElements: NodeListOf<Element> = document.querySelectorAll('.datatable-body-row');
      if (this.lookupTableData.selected.isCheckedAll) {
        [].forEach.call(rowElements, (row) => {
          row.className += ' highlight-row';
        });
      } else {
        [].forEach.call(rowElements, (row) => {
          row.classList.remove('highlight-row');
        });
      }

      rows.forEach((row: ElementRef, index) => {
        row.nativeElement.checked = this.lookupTableData.selected.isCheckedAll;
        // Ex: id = 'checkbox-4'
        let id = Number.parseInt(row.nativeElement.id.replace('checkbox-', ''));
        let itemCheckedIndex = this.lookupTableData.selected.itemsChecked.indexOf(id);
        if (itemCheckedIndex > -1) {
          rowElements[index].className += ' highlight-row';
          row.nativeElement.checked = true;
        }
        let itemRemoveIndex = this.lookupTableData.selected.itemsRemoved.indexOf(id);
        if (itemRemoveIndex > -1) {
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
    this.lookupTableData.selected.itemsChecked = [];
    this.lookupTableData.selected.itemsRemoved = [];
  }

  /**
   * Row checkbox event
   * @param $event
   * @param row
   */
  public onRowSelected($event, row: LookupData): void {
    if ($event.target.checked) {
      if (this.lookupTableData.selected.isCheckedAll) {
        let itemIndex = this.lookupTableData.selected.itemsRemoved.indexOf(row.id);
        if (itemIndex > -1) {
          this.lookupTableData.selected.itemsRemoved.splice(itemIndex, 1);
        }
      } else {
        this.lookupTableData.selected.itemsRemoved = [];
        if (this.lookupTableData.selected.itemsChecked.indexOf(row.id) === -1) {
          this.lookupTableData.selected.itemsChecked.push(row.id);
        }
      }
    } else {
      if (this.lookupTableData.selected.isCheckedAll) {
        this.lookupTableData.selected.itemsChecked = [];
        // Avoid duplicate value in array
        if (this.lookupTableData.selected.itemsRemoved.indexOf(row.id) === -1) {
          this.lookupTableData.selected.itemsRemoved.push(row.id);
        }
      } else {
        let itemIndex = this.lookupTableData.selected.itemsChecked.indexOf(row.id);
        if (itemIndex > -1) {
          this.lookupTableData.selected.itemsChecked.splice(itemIndex, 1);
        }
      }
    }
  }

  /**
   * Uncheck all checkbox in table
   */
  public resetRowSelected(): void {
    this.lookupTableData.selected = {
      isCheckedAll: false,
      itemsChecked: [],
      itemsRemoved: []
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
    // if (event.column.name) {
    //   // this._router.navigate(['settings', 'lookup-table', event.row.id]);
    // }
  }

  // ---------------------------------------------------------

  /**
   * Navigate to New user page
   */
  public addNewLookupTable(): void {
    // this._router.navigate(['settings', 'lookup-table', 'new-lookup-table']);
    let modalRef = this._modalService.open(CreateOrUpdateLookupTableComponent, {
      size: 'lg',
      keyboard: true
    });
    modalRef.componentInstance.title = 'New ' + this.lookupTableName;
    modalRef.componentInstance.lookupTableType = this.lookupTableType;
    modalRef.result.then((res: boolean) => {
      if (res) {
        this.refreshDatatable();
      }
    }, (err) => {
      // if not, error
    });
  }

  /**
   * Open Edit Lookup Table modal
   */
  public editLookupTable(row: LookupData): void {
    let modalRef = this._modalService.open(CreateOrUpdateLookupTableComponent, {
      size: 'lg',
      keyboard: true
    });
    modalRef.componentInstance.title = 'Edit ' + this.lookupTableName;
    modalRef.componentInstance.lookupTableType = this.lookupTableType;
    modalRef.componentInstance.lookupTableInfo = row;
    modalRef.result.then((res: boolean) => {
      if (res) {
        this.refreshDatatable();
      }
    }, (err) => {
      // if not, error
    });
  }

  /**
   * Delete selected row and update datatable
   */
  public deleteSelectedRow(row: LookupData): void {

    let modalRef = this._modalService.open(ConfirmDialogComponent, {

      keyboard: true
    });
    modalRef.componentInstance
      .message = `Are you sure you want to delete
       the selected ${this.lookupTableName.toLowerCase()} '${row.name}'?`;
    modalRef.componentInstance.title = `Confirm ${this.lookupTableName} Deletion`;

    modalRef.result.then((res: boolean) => {
      if (res) {
        let model = {
          ...row,
          type: TableType[this.lookupTableType]
        };
        this._settingsService.deleteLookupData(model)
          .subscribe((resp: BasicResponse) => {
            if (resp.status) {
              this.refreshDatatable();
              this._toastrService.success(resp.message, 'Success');
            } else {
              if (resp.errorMessages[0].includes('used')) {
                this.refreshDatatable();
                this._toastrService.success('Disabled successfully', 'Success');
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
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

  /**
   * Ajax datatable
   * @param draw
   */
  public refreshDatatable(draw?: number): Promise<boolean> {
    // Use View caching to get previous current page and assign countSkip
    // .....code here
    this.tableConfig.currentPage = draw ? draw + 1 : 1;
    let countSkip = draw ? draw * this.tableConfig.pageSize : 0;
    let pageSize = this.tableConfig.pageSize.toString();
    let orderDescending = this.tableConfig.orderDescending.toString();
    let keysort = this.tableConfig.keysort;
    let keyword = this.searchText;

    let params: HttpParams = new HttpParams()
      .set('type', TableType[this.lookupTableType])
      .set('countSkip', countSkip.toString())
      .set('pageSize', pageSize)
      .set('orderDescending', orderDescending)
      .set('keysort', keysort)
      .set('keyword', keyword);

    return new Promise((resolve, reject) => {
      this._settingsService.getListLookupData(params)
        .subscribe((resp: ResponseMessage<LookupDataResponse>): void => {
          if (resp.status) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;
            let responseData = resp.data;
            this.lookupTableData.totalRecord = responseData.totalRecord;
            this.lookupTableData.data = responseData.data;
            resolve(true);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
            reject(false);
          }
        });
    });
  }

  public urlToType(url): string {
    for (let i = 0; i < url.length; i++) {
      if (url[i] === '-') {
        url = url.slice(0, i) + url.charAt(i + 1).toUpperCase() + url.slice(i + 2);
      }
    }
    return url;
  }

  public urlToName(url): string {
    url = url.charAt(0).toUpperCase() + url.slice(1);
    for (let i = 0; i < url.length; i++) {
      if (url[i] === '-') {
        url = url.slice(0, i) +  ' ' + url.charAt(i + 1).toUpperCase() + url.slice(i + 2);
      }
    }
    return url;
  }
}
