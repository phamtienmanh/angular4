import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  HostListener
} from '@angular/core';

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
  CreateOrUpdateScdtComponent
} from './create-or-update-scdt';

// Services
import {
  AuthService
} from '../../shared/services/auth';
import {
  ScheduledTaskService
} from './scheduled-task.service';

// Interfaces
import {
  SortEvent,
  BasicResponse,
  ResponseMessage
} from '../../shared/models';
import {
  DatatableComponent
} from '@swimlane/ngx-datatable';
import { ConfirmDialogComponent } from '../../shared/modules/confirm-dialog';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'scheduled-task',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'scheduled-task.template.html',
  styleUrls: [
    'scheduled-task.style.scss'
  ],
  providers: [ScheduledTaskService]
})
export class ScheduledTaskComponent implements OnInit,
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
  public listScdtData = {
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
              private _scheduledTaskService: ScheduledTaskService,
              private _authService: AuthService,
              private _toastrService: ToastrService) {
    this.isPageReadOnly = !this._authService.checkCanModify('Settings.ScheduledTasks');
  }

  public ngOnInit(): void {
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
   * Detect resize event of browser
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  public onResize(event?) {
    setTimeout(() => {
      this.table.recalculate();
    }, 200);
  }

  // ---------------------------------------------------------
  /**
   * Open Edit Lookup Table modal
   */
  public editScdTask(row: any): void {
    let modalRef = this._modalService.open(CreateOrUpdateScdtComponent, {
      size: 'lg',
      keyboard: true,
      backdrop: 'static',
      windowClass: 'eta-xs'
    });
    let model = Object.assign({}, row);
    modalRef.componentInstance.lookupTableInfo = model;
    modalRef.result.then((res: boolean) => {
      if (res) {
        this.refreshDatatable();
      }
    }, (err) => {
      // if not, error
    });
  }

  public runNow(row: any): void {
    this._scheduledTaskService.runTask(row.id).subscribe((resp: BasicResponse) => {
      if (resp.status) {
        this._toastrService.success(resp.message, 'Success');
      } else {
        this._toastrService.error(resp.errorMessages, 'Error');
      }
    });
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

  public startJob(): void {
    this._scheduledTaskService.startJob().subscribe((resp: BasicResponse) => {
      if (resp.status) {
        this._toastrService.success(resp.message, 'Success');
      } else {
        this._toastrService.error(resp.errorMessages, 'Error');
      }
    });
  }

  public stopJob(): void {
    let modalRef = this._modalService.open(ConfirmDialogComponent, {
      keyboard: false,
      backdrop: 'static'
    });
    modalRef.componentInstance
      .message = `Are you sure stop background task?`;
    modalRef.componentInstance.title = `Stop Task`;

    modalRef.result.then((isOk: boolean) => {
      if (isOk) {
        this._scheduledTaskService.stopJob().subscribe((resp: BasicResponse) => {
          if (resp.status) {
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
      }
    });
  }

  /**
   * Ajax datatable
   * @param draw
   */
  public refreshDatatable(draw?: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._scheduledTaskService.getScdtList()
        .subscribe((resp: ResponseMessage<any>): void => {
          if (resp.status) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;
            this.listScdtData.totalRecord = resp.data.length;
            this.listScdtData.data = resp.data;
            resolve(true);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
            reject(false);
          }
        });
    });
  }
}
