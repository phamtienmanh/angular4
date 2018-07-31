import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChildren,
  QueryList,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';

import {
  FormControl,
  Validators,
  FormGroup
} from '@angular/forms';

import {
  Router
} from '@angular/router';

// Validators
import {
  MaxDate,
  MinDate
} from '../shared/validators';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  AuthService,
  UserContext,
  MyDatePickerService,
  ExtraValidators,
  ValidationService,
  ProgressService
} from '../shared/services';
import {
  DashboardService
} from './dashboard.service';
import {
  GridsterConfig
} from 'angular-gridster2';

// Components
import {
  PerfectScrollbarComponent
} from 'ngx-perfect-scrollbar';

// Interfaces
import {
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  ReportTypes
} from './dashboard.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'dashboard',  // <dashboard></dashboard>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'dashboard.template.html',
  styleUrls: [
    'dashboard.style.scss'
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChildren('reportScrollbar')
  public reportScrollbars: QueryList<PerfectScrollbarComponent>;
  public isPageReadOnly = false;
  public isCheckedAll = true;
  public reportIds = [];
  public reports = [];
  public reportsConfig = [];

  public frm: FormGroup;
  public formErrors = {
    dateBeginOnUtc: '',
    dateEndOnUtc: ''
  };
  public validationMessages = {
    dateBeginOnUtc: {
      maxLength: 'Must be earlier than Cancel Date End.'
    },
    dateEndOnUtc: {
      maxLength: 'Must be later than Cancel Date Begin.'
    },
    default: {
      pattern: 'Date is not valid',
      required: 'This is required.'
    }
  };

  public myDatePickerOptions: IMyDpOptions = {
    selectorWidth: '220px',
    dateFormat: 'mm/dd/yyyy',
    showTodayBtn: false,
    showClearDateBtn: true,
    alignSelectorRight: true,
    openSelectorOnInputClick: true,
    editableDateField: true,
    selectionTxtFontSize: '12px',
    height: '28px',
    firstDayOfWeek: 'su',
    sunHighlight: false
  };
  public dateBeginOptions: any = {
    ...this.myDatePickerOptions
  };
  public dateEndOptions: any = {
    ...this.myDatePickerOptions
  };

  public isShowDetail = false;
  public options: GridsterConfig;
  public cellWidth = 0;
  public cellHeight = 0;

  constructor(private _el: ElementRef,
              private _router: Router,
              private _progressService: ProgressService,
              private _authService: AuthService,
              private _userContext: UserContext,
              private _validationService: ValidationService,
              private _localStorageService: LocalStorageService,
              private _toastrService: ToastrService,
              private _dashboardService: DashboardService,
              public myDatePickerService: MyDatePickerService,
              private _changeDetectorRef: ChangeDetectorRef) {
    // empty
  }

  public ngOnInit(): void {
    const backdropElm = document.getElementById('backdrop');
    if (backdropElm && backdropElm.className.includes('none')) {
      backdropElm.className = '';
      this._changeDetectorRef.markForCheck();
    }
    this.isPageReadOnly = !this._authService.checkCanModify('Dashboard');
    this.buildForm();
    this.reportIds = this._userContext.currentUser.reports.map((r) => r.reportId);
    if (this.reportIds && this.reportIds.length) {
      this.getReports(this.reportIds.join(','));
    } else {
      if (backdropElm) {
        backdropElm.className = 'none';
      }
    }

    this.cellWidth = this._el.nativeElement.clientWidth / 100;
    this.cellHeight = this._el.nativeElement.clientHeight / 100;
    this.options = {
      gridType: 'fit',
      compactType: 'compactLeft&Up',
      compactUp: true,
      compactLeft: true,
      margin: 10,
      outerMargin: true,
      outerMarginTop: null,
      outerMarginRight: null,
      outerMarginBottom: null,
      outerMarginLeft: null,
      mobileBreakpoint: 640,
      minCols: 100,
      maxCols: 100,
      minRows: 100,
      maxRows: 100,
      maxItemCols: 100,
      minItemCols: 1,
      maxItemRows: 100,
      minItemRows: 1,
      maxItemArea: 10000,
      minItemArea: 1,
      defaultItemCols: Math.ceil(300 / this.cellWidth),
      defaultItemRows: Math.ceil(35 / this.cellHeight),
      fixedColWidth: 50,
      fixedRowHeight: 50,
      keepFixedHeightInMobile: false,
      keepFixedWidthInMobile: false,
      scrollSensitivity: 10,
      scrollSpeed: 20,
      enableEmptyCellClick: false,
      enableEmptyCellContextMenu: false,
      enableEmptyCellDrop: false,
      enableEmptyCellDrag: false,
      emptyCellDragMaxCols: 50,
      emptyCellDragMaxRows: 50,
      ignoreMarginInRow: false,
      draggable: {
        enabled: true,
      },
      resizable: {
        enabled: true,
      },
      swap: true,
      pushItems: true,
      disablePushOnDrag: false,
      disablePushOnResize: false,
      pushDirections: {north: true, east: true, south: true, west: true},
      pushResizeItems: false,
      displayGrid: 'none',
      disableWindowResize: false,
      disableWarnings: false,
      scrollToNewItems: false
    };
    window.scrollTo(0, this._localStorageService.get('dashboardScrollPosition') as number);
  }

  public getReports(ids: string) {
    this._dashboardService.getListReport(ids)
      .subscribe((resp) => {
        if (resp.status) {
          // this._toastrService.success(resp.message, 'Success');
          this.configData(resp.data);
          this.reports = resp.data;
          const backdropElm = document.getElementById('backdrop');
          if (backdropElm) {
            backdropElm.className = 'none';
          }
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public refreshReport(id: string, index) {
    this._dashboardService.getListReport(id, true)
      .subscribe((resp) => {
        if (resp.status && resp.data && resp.data[0]) {
          // this._toastrService.success(resp.message, 'Success');
          this.configData(resp.data);
          this.reports[index] = resp.data[0];
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public configData(reports) {
    let  reportsConfig = this._localStorageService.get('reportsConfig');
    this.reportsConfig = JSON.parse(reportsConfig ? reportsConfig.toString() : '[]');
    reports.forEach((r) => {
      let config = this.reportsConfig.find((rC) => rC.id === r.id);
      let defaultConfig = {
        cols: this.options.defaultItemCols,
        rows: this.options.defaultItemRows,
        y: 0,
        x: 0,
        isCollapsed: true,
        isShow: true,
        rowsBackup: 0
      };
      // config summary, detail table cols
      ReportTypes.forEach((type) => {
        if (r.name === type.name) {
          Object.keys(type).forEach((key) => {
            r[key] = type[key];
          });
        }
      });
      if (r.summary && r.summary.length
        && r.summaryCols && r.summaryCols.length) {
        let cols = Math.ceil(r.summaryCols.length * 110 / this.cellWidth);
        let rows = this.reportRows(r);
        defaultConfig.cols = cols > this.options.maxItemCols ? this.options.maxItemCols : cols;
        defaultConfig.rows = rows > this.options.maxItemRows ? this.options.maxItemRows : rows;
        defaultConfig.isCollapsed = false;
        // Summary details
        r.summary.forEach((summaryRow) => {
          summaryRow.detailData = r.detail ?
            r.detail.filter((d) => {
              if (summaryRow.cancelDateWeekNo) {
                return d.cancelDateWeekNo === summaryRow.cancelDateWeekNo;
              } else {
                return d.userId === summaryRow.userId;
              }
            }) : [];
        });
        // Totals row
        if (r.isHaveTotals) {
          // calculate summaryTotals row
          r.summaryTotals = {};
          r.summaryCols.forEach((sCol) => {
            if (sCol.dataType === 'number') {
              r.summaryTotals[sCol.prop] = 0;
            }
          });
          // calculate summaryTotals
          r.summary.forEach((s) => {
            r.summaryCols.forEach((sCol) => {
              if (sCol.dataType === 'number') {
                r.summaryTotals[sCol.prop] += s[sCol.prop];
              }
            });
          });
        }
      } else {
        defaultConfig.rows = 2;
      }
      if (!config) {
        r.config = {...defaultConfig};
      } else {
        if (!r.summary || !r.summary.length) {
          config.rows = 2;
        }
        r.config = {...config};
        r.isShowAllDetail = config.isShowAllDetail;
        // Restore summary isShowDetail
        r.summary.forEach((row) => {
          row.isShowDetail = config.isShowDetailIds ?
            config.isShowDetailIds.some((id) => {
              return row.cancelDateWeekNo ? row.cancelDateWeekNo === id :
                row.userId === id;
            }) : false;
        });
        // Restore scroll position
        setTimeout(() => {
          let reportScrollbar = this.reportScrollbars.find((rS) =>
            'scrollbar-' + r.id === rS['elementRef'].nativeElement.id);
          if (reportScrollbar) {
            reportScrollbar.scrollTo(config.scrollLeft, config.scrollTop);
          }
        }, 500);
      }
    });
  }

  public reportRows(report): number {
    // Calculate report row
    let rows = this.options.defaultItemRows;
    if (report.config && report.config.rowsBackup > this.options.defaultItemRows) {
      rows = report.config.rowsBackup;
    } else if (report.summary && report.summary.length) {
      let tableRows = report.summary.length + 4;
      rows = Math.ceil((tableRows > 20 ? 20 : tableRows) * 31 / this.cellHeight);
    }
    return rows;
  }

  public collapseExpandReport(report) {
    let config = {...report.config};
    if (config.isCollapsed) {
      config.rows = this.reportRows(report);
    } else {
      config.rowsBackup = config.rows;
      config.rows = this.options.defaultItemRows;
    }
    config.isCollapsed = !config.isCollapsed;
    report.config = {};
    setTimeout(() => {
      report.config = {...config};
      this.onBackupConfig(null, report);
      this._changeDetectorRef.markForCheck();
    });
  }

  public removeReport(report) {
    report.config.isShow = false;
    this.onBackupConfig(null, report);
    this._changeDetectorRef.markForCheck();
  }

  public itemChange($event, report) {
    this.onBackupConfig($event, report);
  }

  public onBackupConfig($event, report) {
    let isShowDetailIds = report.summary && report.summary.length ?
      report.summary.filter((row) => row.isShowDetail).map((r) =>
        r.cancelDateWeekNo ? r.cancelDateWeekNo : r.userId) : [];
    let rConfig = {
      id: report.id,
      ...report.config,
      ...$event,
      isShowAllDetail: report.isShowAllDetail,
      isShowDetailIds
    };
    let configIndex = this.reportsConfig.findIndex((rc) => rc.id === report.id);
    if (configIndex !== -1) {
      this.reportsConfig[configIndex] = {...rConfig};
    } else {
      this.reportsConfig.push({...rConfig});
    }
    this._localStorageService.set('reportsConfig', JSON.stringify(this.reportsConfig));
  }

  public onChangeShowHideReport($event) {
    this.isCheckedAll = !this.reports.some((r) => r.config.isShow === false);
    this._changeDetectorRef.markForCheck();
  }

  public onCheckedAll($event) {
    this.reports.forEach((r) => r.config.isShow = $event.target['checked']);
    this.reports.forEach((r) => this.onBackupConfig(null, r));
    this._changeDetectorRef.markForCheck();
  }

  public onChecked($event, report) {
    this.isCheckedAll = this.reports.findIndex((r) => r.config.isShow === false) === -1;
    this.onBackupConfig(null, report);
    this._changeDetectorRef.markForCheck();
  }

  public buildForm(): void {
    let controlConfig = {
      dateBegin: new FormControl(''),
      dateBeginOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)' +
            '|([0-9]{2})\-([0-9]{2})\-([0-9]{4})$'),
          MaxDate('dateEndOnUtc', 1)
        ])
      ]),
      dateEnd: new FormControl(''),
      dateEndOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)' +
            '|([0-9]{2})\-([0-9]{2})\-([0-9]{4})$'),
          MinDate('dateBeginOnUtc', 1)
        ])
      ]),
      formRequires: new FormControl({
        dateBeginOnUtc: {
          required: false
        },
        dateEndOnUtc: {
          required: false
        }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);

    this.onValueChanged(); // (re)set validation messages now
  }

  public onValueChanged(data?: any): void {
    const form = this.frm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  public onDateChanged(event: IMyDateModel, prop: string) {
    let utcDate = Object.assign({}, event);
    let curDate = new Date();
    if (utcDate.jsdate) {
      utcDate.jsdate.setHours(curDate.getHours(), curDate.getMinutes());
    }
    // this.searchObj[prop] = utcDate.jsdate;

    this.frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');

    this.configDateOptions(prop, utcDate);
    // Update status for form control whose value changed
    this.frm.get(prop).markAsDirty();
    // this._changeDetectorRef.markForCheck();
  }

  public configDateOptions(prop, utcDate) {
    let newDateOptions: IMyDpOptions;
    switch (prop) {
      case 'dateBeginOnUtc':
        newDateOptions = Object.assign({}, this.dateEndOptions);
        newDateOptions.disableUntil = utcDate.date;
        newDateOptions.enableDays = [utcDate.date];
        this.dateEndOptions = newDateOptions;
        break;
      case 'dateEndOnUtc':
        newDateOptions = Object.assign({}, this.dateBeginOptions);
        newDateOptions.disableSince = utcDate.date;
        newDateOptions.enableDays = [utcDate.date];
        this.dateBeginOptions = newDateOptions;
        break;
      default:
        return;
    }
  }

  public showHideDetail(report, summaryRow) {
    summaryRow.isShowDetail = !summaryRow.isShowDetail;
    report.isShowAllDetail = !report.summary.some((row) => !row.isShowDetail);
    this.onBackupConfig(null, report);
    this._changeDetectorRef.markForCheck();
  }

  public showHideAllDetail(report, $event?) {
    if ($event && $event.target) {
      let icon = $event.target;
      if (icon.nodeName === 'TH') {
        icon = icon.childNodes[0];
      }
      if (icon.nodeName === 'I') {
        if (icon.classList.contains('collapsed')) {
          icon.classList.remove('collapsed');
        } else {
          icon.className += ' collapsed';
        }
      }
    }
    if (!report.isShowAllDetail) {
      this._progressService.start();
    }
    setTimeout(() => {
      report.isShowAllDetail = !report.isShowAllDetail;
      report.summary.forEach((row) => {
        row.isShowDetail = report.isShowAllDetail;
      });
      if (report.isShowAllDetail) {
        this._progressService.done();
      }
      this.onBackupConfig(null, report);
      this._changeDetectorRef.markForCheck();
    });
  }

  public showHideDetailByDay(report, row, sCol) {
    if (isNaN(sCol.from) || isNaN(sCol.to)) {
      return;
    }
    if (sCol.isShowDetail) {
      sCol.isShowDetail = false;
      row.isShowDetail = false;
    } else {
      row.detailData = report.detail ?
        report.detail.filter((d) => d.days >= sCol.from && d.days <= sCol.to) : [];
      report.summaryCols.forEach((col) => {
        col.isShowDetail = false;
      });
      sCol.isShowDetail = true;
      row.isShowDetail = true;
    }
    this._changeDetectorRef.markForCheck();
  }

  public goToOrderStyle(type: string, orderId: number, styleId: number): void {
    if (!this._authService.checkCanView('Orders')) {
      return;
    } else if (type === 'orderLink' && orderId) {
      this._router.navigate(['order-log-v2', orderId, 'order-info']);
    } else if (type === 'styleLink' && orderId && styleId) {
      this._router.navigate(['order-log-v2', orderId, 'styles', styleId]);
    }
  }

  public onFilter() {
    // console.log(this.frm.value);
  }

  public onScrollX(event, report, fixedHeader): void {
    // Backup config
    report.config.scrollLeft = event.target.scrollLeft;
    this.onBackupConfig(null, report);
    // Set header
    if (fixedHeader) {
      fixedHeader.style.left = -event.target.scrollLeft + 'px';
    }
    this._changeDetectorRef.markForCheck();
  }

  public onScrollY(event, report, fixedHeader, header): void {
    // Backup config
    report.config.scrollTop = event.target.scrollTop;
    this.onBackupConfig(null, report);
    // Set header
    if (event.target.scrollTop > 30 && !fixedHeader.hasChildNodes()) {
      let cloneHeader = header.cloneNode(true);
      if (header.children && header.children.length) {
        Array.from(header.children).forEach((el: any, index) => {
          let width = el.getBoundingClientRect().width + 'px';
          cloneHeader.children[index].style.width = width;
          cloneHeader.children[index].style.maxWidth = width;
          cloneHeader.children[index].style.minWidth = width;
        });
      }
      if (cloneHeader.children && cloneHeader.children.length) {
        cloneHeader.children[0].addEventListener('click',
          this.showHideAllDetail.bind(this, report));
      }
      fixedHeader.appendChild(cloneHeader);
    } else if (event.target.scrollTop <= 30 && fixedHeader.hasChildNodes()) {
      while (fixedHeader.firstChild) {
        fixedHeader.removeChild(fixedHeader.firstChild);
      }
    }
    this._changeDetectorRef.markForCheck();
  }

  @HostListener('window:scroll', ['$event'])
  public onAppScroll(event: any) {
    this._localStorageService.set('dashboardScrollPosition', window.scrollY);
  }

  public ngOnDestroy() {
    this._localStorageService.set('dashboardScrollPosition', window.scrollY);
    const backdropElm = document.getElementById('backdrop');
    if (backdropElm && !backdropElm.className.includes('none')) {
      backdropElm.className = 'none';
    }
  }
}
