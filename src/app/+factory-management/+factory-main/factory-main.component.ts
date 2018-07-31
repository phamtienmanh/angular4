import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
  AfterViewInit,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  OnDestroy
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
  FactoryManagementService
} from '../factory-management.service';
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
  FactoryBasicInfo,
  FactoryListResponse,
  ItemTypeList
} from '../factory-management.model';
import {
  BasicResponse
} from '../../shared/models/respone.model';
import {
  SortEvent,
  RowSelectEvent,
  ResponseMessage
} from '../../shared/models/index';

// Components
import {
  ConfirmDialogComponent
} from '../../shared/modules/confirm-dialog/confirm-dialog.component';
import {
  DatatableComponent
} from '@swimlane/ngx-datatable';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'factory-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'factory-main.template.html',
  styleUrls: [
    'factory-main.style.scss'
  ]
})
export class FactoryMainComponent implements OnInit,
                                             AfterViewInit,
                                             AfterViewChecked,
                                             OnDestroy {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild(DatatableComponent)
  public table: DatatableComponent;
  @ViewChildren('rowCheckbox')
  public rowCheckbox: QueryList<ElementRef>;

  public currentComponentWidth;
  public selected = [];
  public searchText: string;
  public factoryData = {
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
  public itemTypeList = ItemTypeList;

  constructor(private _router: Router,
              private _modalService: NgbModal,
              private _factoryManagementService: FactoryManagementService,
              private _utilService: Util,
              private _authService: AuthService,
              private _toastrService: ToastrService,
              private _localStorageService: LocalStorageService) {
    const factoryMainPageSize = this._localStorageService.get('factoryMainPageSize');
    this.tableConfig = {
      keySort: 'name',
      keyword: '',
      orderDescending: false,
      currentPage: this._utilService.currentPage ? this._utilService.currentPage : 1,
      pageSize: factoryMainPageSize ? factoryMainPageSize : 10,
      loading: false
    };
  }

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Factories');
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
      if (this.factoryData.selected.isCheckedAll) {
        [].forEach.call(rowElements, (row) => {
          row.className += ' highlight-row';
        });
      } else {
        [].forEach.call(rowElements, (row) => {
          row.classList.remove('highlight-row');
        });
      }

      rows.forEach((row: ElementRef, index) => {
        row.nativeElement.checked = this.factoryData.selected.isCheckedAll;
        // Ex: id = 'checkbox-4'
        let id = Number.parseInt(row.nativeElement.id.replace('checkbox-', ''));
        let itemCheckedIndex = this.factoryData.selected.itemsChecked.indexOf(id);
        if (itemCheckedIndex > -1) {
          rowElements[index].className += ' highlight-row';
          row.nativeElement.checked = true;
        }
        let itemRemoveIndex = this.factoryData.selected.itemsRemoved.indexOf(id);
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
    this.factoryData.selected.itemsChecked = [];
    this.factoryData.selected.itemsRemoved = [];
    this.factoryData.selected.indeterminate = false;
  }

  /**
   * Row checkbox event
   * @param $event
   * @param row
   */
  public onRowSelected($event, row: FactoryBasicInfo): void {
    if ($event.target.checked) {
      if (this.factoryData.selected.isCheckedAll) {
        let itemIndex = this.factoryData.selected.itemsRemoved.indexOf(row.id);
        if (itemIndex > -1) {
          this.factoryData.selected.itemsRemoved.splice(itemIndex, 1);
        }
        this.factoryData.selected.indeterminate = this.factoryData
          .selected.itemsRemoved.length > 0;
      } else {
        this.factoryData.selected.itemsRemoved = [];
        if (this.factoryData.selected.itemsChecked.indexOf(row.id) === -1) {
          this.factoryData.selected.itemsChecked.push(row.id);
          if (this.factoryData.selected.itemsChecked
            .length === this.factoryData.totalRecord) {
            this.factoryData.selected.isCheckedAll = true;
            this.factoryData.selected.indeterminate = false;
          }
        }
      }
    } else {
      if (this.factoryData.selected.isCheckedAll) {
        this.factoryData.selected.itemsChecked = [];
        // Avoid duplicate value in array
        if (this.factoryData.selected.itemsRemoved.indexOf(row.id) === -1) {
          this.factoryData.selected.itemsRemoved.push(row.id);
          this.factoryData.selected.indeterminate = true;
        }
        if (this.factoryData.selected.itemsRemoved.length === this.factoryData.totalRecord) {
          this.factoryData.selected.indeterminate = false;
          this.factoryData.selected.isCheckedAll = false;
        }
      } else {
        let itemIndex = this.factoryData.selected.itemsChecked.indexOf(row.id);
        if (itemIndex > -1) {
          this.factoryData.selected.itemsChecked.splice(itemIndex, 1);
        }
      }
    }
  }

  /**
   * Uncheck all checkbox in table
   */
  public resetRowSelected(): void {
    this.factoryData.selected = {
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
      // Restore previous situation of page when factory press back from browser to back this page
      // this._routerService.set({
      //   enableBackView: true
      // });
      this._utilService.currentPage = this.tableConfig.currentPage;
      this._router.navigate([
        'factory-management',
        event.row.id
      ]);
    }
  }

  public editFactory(id) {
    this._router.navigate([
      'factory-management',
      id
    ]);
  }

  public deleteFactory(factory) {
    let modalRef = this._modalService.open(ConfirmDialogComponent, {
      keyboard: true
    });
    modalRef.componentInstance.message = 'All configuration data will be deleted for ' +
      'the factory ‘' + factory.name + '’. Continue?';
    modalRef.componentInstance.title = 'Confirm Factory Deletion';

    modalRef.result.then((res: boolean) => {
      if (res) {
        if (factory.id) {
          this._factoryManagementService
            .deleteFactory(factory.id)
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
   * Navigate to New factory page
   */
  public addNewFactory(): void {
    this._router.navigate([
      'factory-management',
      'new-factory'
    ]);
  }

  /**
   * Delete selected row and update datatable
   */
  public deleteSelectedRow(): void {
    if (!this.factoryData.selected.isCheckedAll
      && !this.factoryData.selected.itemsChecked.length) {
      return;
    }

    let modalRef = this._modalService.open(ConfirmDialogComponent, {

      keyboard: true
    });
    modalRef.componentInstance
      .message = 'Are you sure you want to delete the selected factory(s)?';
    modalRef.componentInstance.title = 'Confirm Factory Deletion';

    modalRef.result.then((res: boolean) => {
      if (res) {
        let req = {
          isCheckedAll: this.factoryData.selected.isCheckedAll,
          itemsRemoved: this.factoryData.selected.itemsRemoved.join(),
          itemsChecked: this.factoryData.selected.itemsChecked.join(),
          keyword: this.searchText
        };

        // this._factoryManagementService.deleteMultiFactory(req)
        //   .subscribe((resp: BasicResponse) => {
        //     if (resp.status) {
        //       this.refreshDatatable();
        //       this.resetRowSelected();
        //       this._toastrService.success(resp.message, 'Success');
        //     } else {
        //       this._toastrService.error(resp.errorMessages, 'Error');
        //     }
        //   });
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
    this._localStorageService.set('factoryMainPageSize', pageSize);
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
      this._factoryManagementService.getListFactory(params)
        .subscribe((resp: ResponseMessage<FactoryListResponse>): void => {
          if (resp.status) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;
            let responseData = resp.data;
            this.factoryData.totalRecord = responseData.totalRecord;
            this.factoryData.data = responseData.data;
            resolve(true);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
            reject(false);
          }
        });
    });
  }

  public ngOnDestroy(): void {
    this._utilService.currentPage = this.tableConfig.currentPage;
  }
}
