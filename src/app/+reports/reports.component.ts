import {
  Component,
  ViewEncapsulation,
  OnInit,
  ViewChild,
  AfterViewChecked,
  HostListener
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

import { HttpParams } from '@angular/common/http';

// Interface
import {
  RecurValues,
  ReportScheduler,
  ReportsInfo,
  ReportsResponse
} from './reports.model';
import {
  SortEvent,
  ResponseMessage
} from '../shared/models';

// Services
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  ToastrService
} from 'ngx-toastr';
import {
  MyDatePickerService
} from '../shared';
import {
  Util,
  AuthService
} from '../shared/services';
import {
  ReportsService
} from './reports.service';

// Components
import {
  DatatableComponent
} from '@swimlane/ngx-datatable';
import {
  ConfirmDialogComponent
} from '../shared/modules/confirm-dialog';
import {
  EditReportComponent,
  EditScheduleComponent
} from './components';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'reports',  // <reports></reports>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'reports.template.html',
  styleUrls: [
    'reports.style.scss'
  ]
})
export class ReportsComponent implements OnInit, AfterViewChecked {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild('reportsTable')
  public reportsTable: DatatableComponent;
  public currentComponentWidth;
  public header;
  public cloneHeader;
  public reportsData = {
    totalRecord: 0,
    data: []
  };
  public tableConfig;
  public isPageReadOnly = false;
  public recurValues = RecurValues;

  constructor(private _router: Router,
              private _modalService: NgbModal,
              private _reportsService: ReportsService,
              private _utilService: Util,
              private _authService: AuthService,
              private _breadcrumbService: BreadcrumbService,
              private _toastrService: ToastrService,
              private _localStorageService: LocalStorageService,
              public myDatePickerService: MyDatePickerService) {
    // Check current page have access or not? If not the browser will redirect to 'Not Found' page
    this.isPageReadOnly = !this._authService.checkCanModify('Reports');
    this._breadcrumbService
      .addFriendlyNameForRoute('/reports', 'Reports');
    const reportsMainPageSize = this._localStorageService.get('reportsMainPageSize');
    this.tableConfig = {
      keySort: 'name',
      keyword: '',
      orderDescending: false,
      currentPage: this._utilService.currentPage ? this._utilService.currentPage : 1,
      pageSize: reportsMainPageSize ? reportsMainPageSize : 10,
      loading: false
    };
  }

  public ngOnInit(): void {
    this.refreshDatatable(this.tableConfig.currentPage - 1);
  }

  public ngAfterViewChecked() {
    if (this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
      this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
      setTimeout(() => {
        this.reportsTable.recalculate();
      }, 400);
    }
  }

  @HostListener('window:scroll', ['$event'])
  public onAppScroll(event?: any) {
    const fixedHeader = document.getElementById('header');
    if (!fixedHeader) {
      return;
    }
    if (event) {
      while (fixedHeader.firstChild) {
        fixedHeader.removeChild(fixedHeader.firstChild);
      }
    }
    if (fixedHeader && !fixedHeader.hasChildNodes()) {
      this.updateHeader();
    }
    if (event.target.scrollingElement.scrollTop >= 300
      && this.header.getBoundingClientRect().top < 0
      && fixedHeader && !fixedHeader.hasChildNodes()) {
      fixedHeader.appendChild(this.cloneHeader);
    } else if ((this.header.getBoundingClientRect().top >= 0)
      || (event.target.scrollingElement.scrollTop < 300
        && fixedHeader && fixedHeader.hasChildNodes())) {
      while (fixedHeader.firstChild) {
        fixedHeader.removeChild(fixedHeader.firstChild);
      }
    }
  }

  public updateHeader(): void {
    const dataTableList = document.getElementsByTagName('ngx-datatable');
    if (dataTableList && dataTableList.length) {
      const headerList = dataTableList[0].getElementsByClassName('datatable-header');
      if (headerList && headerList.length) {
        this.header = headerList[0];
        this.cloneHeader = this.header.cloneNode(true);
        this.cloneHeader.className += ' fade-header';
      }
    }
  }

  public onSelectedPageSize(pageSize: number): void {
    this._localStorageService.set('reportsMainPageSize', pageSize);
    this.tableConfig.pageSize = pageSize;
    this.refreshDatatable();
  }

  public onPageChange(draw: number): void {
    if (this._utilService.scrollElm) {
      this._utilService.scrollElm.scrollTop = 0;
      this._utilService.scrollPosition = 0;
    }
    this.tableConfig.currentPage = draw + 1;
    this.refreshDatatable(draw);
  }

  public onSort(event: SortEvent): void {
    this.tableConfig.keySort = event.sorts[0].prop;
    this.tableConfig.orderDescending = event.sorts[0].dir === 'desc';
    this.tableConfig.loading = true;
    this.refreshDatatable(this.tableConfig.currentPage - 1);
    this.updateHeader();
  }

  public editReport(report) {
    let modalRef = this._modalService.open(EditReportComponent, {
      size: 'lg',
      keyboard: true
    });
    modalRef.componentInstance.reportInfo = report;

    modalRef.result.then((res) => {
      if (res && res.frm) {
        this._reportsService.updateReport(res.frm)
          .subscribe((resp: ResponseMessage<ReportsInfo>) => {
            if (resp.status) {
              this._toastrService.success(resp.message, 'Success');
              this.refreshDatatable(this.tableConfig.currentPage - 1);
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
    }, (err) => {
      // if key === true, use it
    });
  }

  public editSchedule(id, schedule) {
    let modalRef = this._modalService.open(EditScheduleComponent, {
      size: 'lg',
      keyboard: true
    });
    modalRef.componentInstance.scheduleInfo = schedule;

    modalRef.result.then((res) => {
      if (!!res && res.frm) {
        this._reportsService.updateSchedule(id, res.frm)
          .subscribe((resp: ResponseMessage<ReportScheduler>) => {
            if (resp.status) {
              this._toastrService.success(resp.message, 'Success');
              this.refreshDatatable(this.tableConfig.currentPage - 1);
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
    }, (err) => {
      // if key === true, use it
    });
  }

  public generateReport(reportId) {
    this._reportsService.generateReport(reportId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public deleteReport(report) {
    let modalRef = this._modalService.open(ConfirmDialogComponent, {
      keyboard: true
    });
    // modalRef.componentInstance.message = 'All configuration data will be deleted for ' +
    //   'the report ‘' + report.name + '’. Continue?';
    modalRef.componentInstance.title = 'Confirm Report Deletion';

    modalRef.result.then((res: boolean) => {
      if (res) {
        if (report.id) {
          // this._reportManagementService
          //   .deleteReport(report.id)
          //   .subscribe((resp: BasicResponse) => {
          //     if (resp.status) {
          //       this._toastrService.success(resp.message, 'Success');
          //       this.refreshDatatable();
          //     } else {
          //       this._toastrService.error(resp.errorMessages, 'Error');
          //     }
          //   });
        }
      }
    }, (err) => {
      // if key === true, use it
    });
  }

  public refreshDatatable(draw?: number): Promise<boolean> {
    this.tableConfig.currentPage = draw ? draw + 1 : 1;
    let countSkip = (draw ? draw * this.tableConfig.pageSize : 0).toString();
    let pageSize = this.tableConfig.pageSize.toString();
    let orderDescending = this.tableConfig.orderDescending.toString();
    let keySort = this.tableConfig.keySort;

    let params: HttpParams = new HttpParams()
      .set('countSkip', countSkip)
      .set('pageSize', pageSize)
      .set('keySort', keySort)
      .set('orderDescending', orderDescending);
    return new Promise((resolve, reject) => {
      this._reportsService.getListReports(params)
        .subscribe((resp: ResponseMessage<ReportsResponse>): void => {
          if (resp.status) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;

            let responseData = resp.data;
            responseData.data.forEach((row) => {
              let emails = row.emails ? row.emails.split(',') : [];
              row.emailDisplay = emails.join(', ');
            });
            this.reportsData.totalRecord = responseData.totalRecord;
            this.reportsData.data = responseData.data;
            resolve(true);
          } else {
            reject(false);
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    });
  }
}
