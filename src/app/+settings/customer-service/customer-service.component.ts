import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
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

// Components
import {
  CreateOrUpdateCstComponent
} from './create-or-update-cst';

// Services
import { AuthService } from '../../shared/services/auth';
import { CustomerServiceService } from './customer-service.service';

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

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'customer-service',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'customer-service.template.html',
  styleUrls: [
    'customer-service.style.scss'
  ],
  providers: [CustomerServiceService]
})
export class CustomerServiceComponent implements OnInit,
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
  public listTeamData = {
    totalRecord: 0,
    data: []
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
              private _customerServiceService: CustomerServiceService,
              private _authService: AuthService,
              private _toastrService: ToastrService) {
    this.isPageReadOnly = !this._authService.checkCanModify('Settings.CustomerService');
  }

  public ngOnInit(): void {
    let lastDash = this._router.url.lastIndexOf('/');
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

  /**
   * Row click event
   * @param event
   */
  public onActivate(event: RowSelectEvent): void {
    let checkboxElement = event.cellElement.querySelector(`input#checkbox-${event.row.id}`);
    if (event.cellIndex === 0 && checkboxElement) {
      checkboxElement.checked = !checkboxElement.checked;
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
  public addTeam(): void {
    let modalRef = this._modalService.open(CreateOrUpdateCstComponent, {
      size: 'lg',
      keyboard: true
    });
    modalRef.componentInstance.title = 'New Team';
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
  public editTeam(row: any): void {
    let modalRef = this._modalService.open(CreateOrUpdateCstComponent, {
      size: 'lg',
      keyboard: true
    });
    let model = Object.assign({}, row);
    if (model.customerServiceTeams && model.customerServiceTeams.length) {
      model.customerServiceTeams = model.customerServiceTeams.map((i) => i.id);
    }
    modalRef.componentInstance.title = 'Edit Team';
    modalRef.componentInstance.lookupTableInfo = model;
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
  public deleteSelectedRow(row: any): void {
    let modalRef = this._modalService.open(ConfirmDialogComponent, {
      keyboard: true
    });
    modalRef.componentInstance
      .message = `Are you sure you want to delete
       the selected team '${row.name}'?`;
    modalRef.componentInstance.title = `Confirm Team Deletion`;

    modalRef.result.then((res: boolean) => {
      if (res) {
        this._customerServiceService.deleteTeam(row.id)
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

  public getCustomerServiceList(customerServiceTeams): string {
    return customerServiceTeams ? customerServiceTeams.map((i) => i.fullName).join(', ') : '';
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
      .set('countSkip', countSkip.toString())
      .set('pageSize', pageSize)
      .set('orderDescending', orderDescending)
      .set('keysort', keysort)
      .set('keyword', keyword);

    return new Promise((resolve, reject) => {
      this._customerServiceService.getListTeam(params)
        .subscribe((resp: ResponseMessage<any>): void => {
          if (resp.status) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;
            let responseData = resp.data;
            this.listTeamData.totalRecord = responseData.totalRecord;
            this.listTeamData.data = responseData.data;
            resolve(true);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
            reject(false);
          }
        });
    });
  }
}
