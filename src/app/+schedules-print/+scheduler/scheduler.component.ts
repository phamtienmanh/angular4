import {
  Component,
  OnInit,
  ViewEncapsulation,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChildren,
  QueryList,
  HostListener,
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { Subject } from 'rxjs';
import 'rxjs/add/operator/takeUntil';

import {
  FormControl,
  Validators,
  FormGroup
} from '@angular/forms';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';
import * as moment from 'moment';

// Services
import { RouterService } from '../../core/router';
import { Util } from '../../shared/services/util';
import {
  CommonService
} from '../../shared/services/common';
import {
  SchedulesPrintService
} from '../schedules-print.service';
import {
  ThemeSetting
} from '../../shared/services/theme-setting';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  DragulaService
} from 'ng2-dragula/ng2-dragula';
import * as FileSaver from 'file-saver';
import {
  ValidationService
} from '../../shared/services/validation';
import {
  SchedulerService
} from './scheduler.service';
import { AuthService } from '../../shared/services/auth';
import {
  MyDatePickerService
} from '../../shared/services/my-date-picker';
import {
  ProgressService
} from '../../shared/services/progress';
import {
  OrderMainService
} from '../../+order-log-v2/+order-main/order-main.service';

// Component
import {
  AddStyleComponent
} from '../add-style/add-style.component';
import {
  PerfectScrollbarComponent
} from 'ngx-perfect-scrollbar';
import {
  RuntimeComponent
} from '../modules/runtime';
import {
  ConfigureProcessesComponent
} from '../modules/configure-processes';
import {
  ConfigFinishingProcessesComponent,
  ConfigTscScheduledComponent
} from '../modules';

// Validators
import {
  MaxDate,
  MinDate
} from '../../shared/validators';

// Interfaces
import {
  ResponseMessage,
  BasicGeneralInfo,
  BasicVendorInfo
} from '../../shared/models';
import {
  TaskStatus,
  HourOffset
} from '../schedules-print.model';
import {
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  ExtraValidators
} from '../../shared/services/validation';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'scheduler',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'scheduler.template.html',
  styleUrls: [
    'scheduler.style.scss'
  ]
})
export class SchedulerComponent implements OnInit,
                                           OnDestroy {
  @ViewChildren(PerfectScrollbarComponent)
  public scrollListQuery: QueryList<PerfectScrollbarComponent>;

  public tableData = [];
  public tableDataOrigin = [];

  public tableTobeScheduleData = {
    totalRecord: 0,
    data: [],
    selected: {
      isCheckedAll: false,
      itemsChecked: [],
      itemsRemoved: [],
      indeterminate: false
    }
  };
  public tableConfig = {
    keysort: 'uploaded',
    keyword: '',
    orderDescending: true,
    currentPage: 1,
    pageSize: 10,
    loading: false
  };

  public printDateSelect = [
    {
      id: 1,
      text: 'Yesterday'
    },
    {
      id: 2,
      text: 'Today'
    },
    {
      id: 3,
      text: 'This Week'
    },
    {
      id: 4,
      text: 'Next 7 Days'
    },
    {
      id: 5,
      text: 'Custom'
    }
  ];
  public printList; // machine and vendor of print schedule table
  public neckLabelList; // machine and vendor of neck label schedule table
  public finishList; // machine and vendor of finishing schedule table

  public machineList = [];

  public searchObj = {
    printDate: 'Next 7 Days',
    keyword: '',
    machine: []
  };
  public searchedObj = {};

  public frm: FormGroup;
  public formErrors = {
    customer: '',
    customerPoId: '',
    retailerPoId: '',
    styleName: '',
    partnerStyle: '',
    printDate: '',
    cancelDateFromOnUtc: '',
    cancelDateToOnUtc: '',
    schedDateFromOnUtc: '',
    schedDateToOnUtc: ''
  };
  public validationMessages = {
    cancelDateFromOnUtc: {
      maxLength: 'Must be earlier than Cancel Date End.'
    },
    cancelDateToOnUtc: {
      maxLength: 'Must be later than Cancel Date Begin.'
    },
    schedDateFromOnUtc: {
      maxLength: 'Must be earlier than Start Date End.'
    },
    schedDateToOnUtc: {
      maxLength: 'Must be later than Start Date Begin.'
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
  public cancelDateBegin: any = {
    ...this.myDatePickerOptions
  };
  public cancelDateEnd: any = {
    ...this.myDatePickerOptions
  };
  public tableDateOptions: any = {
    ...this.myDatePickerOptions,
    showClearDateBtn: false
  };

  public fixedHeader = false;
  public preMenuPin;

  public dragInfo = {
    status: 'none',
    whichHandle: '',
    expandMachine: [],
    fromRight: 'data',
    allowDrop: true,
    processIndex: undefined,
    dragMulti: {
      print: [],
      neckLB: [],
      finishing: [],
      finishingProcess: []
    },
    isDragging: false,
    draggingMirror: null,
    dragMultiRight: {
      print: [],
      neckLB: [],
      finishing: [],
      finishingProcess: [],
      printDOM: [],
      neckLBDOM: [],
      finishingDOM: [],
      finishingProcessDOM: [],
      isHasData: false,
      selectedOnTab: -1
    }
  };

  public isPreDragOnTop = false;

  public isFilter = false;
  public isNoData = false;

  public tableDateModel = {date: null};
  public destroy$ = new Subject<any>();

  public isRuntimeOpen = false;

  public taskStatus = TaskStatus;

  public fontSizeData = ['8px', '9px', '10px', '11px', '12px'];
  public myConfigStyle = {
    'font-size': '11px'
  };
  public fontSizeIndex =
           ['font-size-8', 'font-size-9', 'font-size-10', 'font-size-11', 'font-size-12'];
  public fontSizeClass = {
    'font-size-8': false,
    'font-size-9': false,
    'font-size-10': false,
    'font-size-11': false,
    'font-size-12': false
  };

  public tobeTableToTop;
  public isPageReadOnly = false;

  public daysTab = [];

  public lateJobData = [];
  public isOnLateTab = false;

  private _progressCount = 0;
  private _lastTobeScroll;
  private _lastScheduleScroll;

  constructor(private _router: Router,
              private _modalService: NgbModal,
              private _routerService: RouterService,
              private _utilService: Util,
              private _commonService: CommonService,
              private _schedulesPrintService: SchedulesPrintService,
              private _themeSetting: ThemeSetting,
              private _toastrService: ToastrService,
              private _dragulaService: DragulaService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _activatedRoute: ActivatedRoute,
              private _authService: AuthService,
              private _validationService: ValidationService,
              private _schedulerSv: SchedulerService,
              private _localStorageService: LocalStorageService,
              private _progressService: ProgressService,
              private _orderMainSv: OrderMainService,
              public myDatePickerService: MyDatePickerService) {
    this._authService.checkPermission('Schedules.Scheduler');
    _dragulaService.setOptions('bag-one', {
      accepts: this.validateDrop.bind(this),
      moves: this.validDrag.bind(this),
      copy: true,
      copySortSource: true
    });
    _dragulaService.over.asObservable().takeUntil(this.destroy$).subscribe((value) => {
      this.onOver(value.slice(1));
    });
    _dragulaService.drop.asObservable().takeUntil(this.destroy$).subscribe((value) => {
      this.onDrop(value.slice(1));
    });
    _dragulaService.dragend
      .asObservable().takeUntil(this.destroy$).subscribe((value) => {
      this.onDragend(value.slice(1));
    });
    _dragulaService.shadow
      .asObservable().takeUntil(this.destroy$).subscribe((value) => {
      this.onShadow(value.slice(1));
    });
    _dragulaService.out
      .asObservable().takeUntil(this.destroy$).subscribe((value) => {
      this.onOut(value.slice(1));
    });

    let fontSize = this._localStorageService.get('fontSize_Scheduler') as string;
    if (fontSize) {
      const modal = {'font-size': fontSize};
      Object.assign(this.myConfigStyle, modal);
      const fontSizeNumber = +fontSize.slice(0, fontSize.length - 2);
      this.fontSizeClass[`font-size-${fontSizeNumber}`] = true;
    } else {
      this._localStorageService.set('fontSize_Scheduler', this.myConfigStyle['font-size']);
    }
  }

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Schedules.Scheduler');
    if (this._localStorageService.get('currentTobePage')) {
      this.tableConfig.currentPage =
        parseInt(this._localStorageService.get('currentTobePage').toString(), 10);
    }
    this.buildForm();
    // Prevent user navigate to another page when data not loaded yet
    const backdropElm = document.getElementById('backdrop');
    if (backdropElm) {
      backdropElm.className = '';
      this._changeDetectorRef.markForCheck();
    }
    this._progressCount++;
    this.getSearchFilterSv();
    this.getCommonData();
    this.getTobeScheduleData(this.tableConfig.currentPage - 1);
    // this.getSchedulesData();
    this.preMenuPin = this._themeSetting.menuPin;
    // this._themeSetting.themeChanged.subscribe(() => {
    //   setTimeout(() => {
    //     let scrollElef = document.getElementsByClassName('ng-sidebar__content')[0];
    //     scrollElef.scrollTop += 1;
    //     this._changeDetectorRef.markForCheck();
    //   }, 400);
    // });
  }

  public buildForm(): void {
    let controlConfig = {
      customer: new FormControl(''),
      customerPoId: new FormControl(''),
      retailerPoId: new FormControl(''),
      // partnerStyle: new FormControl(''),
      printDate: new FormControl('Next 7 Days'),
      styleName: new FormControl(''),
      cancelDateFrom: new FormControl(''),
      cancelDateFromOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)' +
            '|([0-9]{2})\-([0-9]{2})\-([0-9]{4})$'),
          MaxDate('cancelDateToOnUtc', 1)
        ])
      ]),
      cancelDateTo: new FormControl(''),
      cancelDateToOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)' +
            '|([0-9]{2})\-([0-9]{2})\-([0-9]{4})$'),
          MinDate('cancelDateFromOnUtc', 1)
        ])
      ]),
      schedDateFrom: new FormControl(''),
      schedDateFromOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)' +
            '|([0-9]{2})\-([0-9]{2})\-([0-9]{4})$'),
          MaxDate('schedDateToOnUtc', 1)
        ])
      ]),
      schedDateTo: new FormControl(''),
      schedDateToOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)' +
            '|([0-9]{2})\-([0-9]{2})\-([0-9]{4})$'),
          MinDate('schedDateFromOnUtc', 1)
        ])
      ]),
      formRequires: new FormControl({
        customer: {
          required: false
        },
        customerPoId: {
          required: false
        },
        retailerPoId: {
          required: false
        },
        styleName: {
          required: false
        },
        partnerStyle: {
          required: false
        },
        printDate: {
          required: false
        },
        cancelDateFromOnUtc: {
          required: false
        },
        cancelDateToOnUtc: {
          required: false
        },
        schedDateFromOnUtc: {
          required: false
        },
        schedDateToOnUtc: {
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

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    let firstCaseList = [
      'schedDateFromOnUtc',
      'schedDateToOnUtc'
    ];
    if (key === 'firstCase') {
      let status = false;
      firstCaseList.forEach((cas) => status = status
        || frm.get('printDate').value === 'Custom'
        || !!frm.get(cas).value);
      firstCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else {
      return false;
    }
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public setDateValue(): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (this.frm.get(importName).value) {
        const utcDate = new Date(this.frm.get(importName).value);
        utcDate.setHours(0, 0, 0);
        this.frm.get(exportName).setValue({
          date: {
            year: utcDate.getFullYear(),
            month: utcDate.getMonth() + 1,
            day: utcDate.getDate()
          },
          jsdate: utcDate
        });
        this.configDateOptions(importName, this.frm.get(exportName).value);
      } else {
        this.frm.get(importName).patchValue(null);
        this.frm.get(exportName).patchValue(null);
      }
    };
    patchDateFunc('schedDateFromOnUtc', 'schedDateFrom');
    patchDateFunc('schedDateToOnUtc', 'schedDateTo');
    patchDateFunc('cancelDateFromOnUtc', 'cancelDateFrom');
    patchDateFunc('cancelDateToOnUtc', 'cancelDateTo');
  }

  /**
   * Update form value
   * @param data
   */
  public updateForm(data) {
    this.frm.patchValue(data);
    this.setDateValue();
    this._changeDetectorRef.markForCheck();
  }

  public getSearchFilterSv() {
    // get filter service from other tab
    if (this._schedulesPrintService.searchObj) {
      this._schedulerSv.searchObj = this._schedulesPrintService.searchObj;
      if (this._schedulesPrintService.searchFrom &&
        this._schedulesPrintService.searchFrom.includes('pending-sample')) {
        this._schedulesPrintService.searchFrom =
          this._schedulesPrintService.searchFrom.split(',')[1];
      }
      switch (this._schedulesPrintService.searchFrom) {
        case 'finishing':
          this._schedulerSv.convertFrFinishing();
          break;
        case 'neck-label':
          this._schedulerSv.convertFrNeckLabel();
          break;
        case 'samples':
          this._schedulerSv.convertFrSamples();
          break;
        default:
          break;
      }
    }
    // get search filter service from nest tab
    if (this._schedulerSv.searchObj) {
      if (this._schedulerSv.searchFrom === 'print-outsource') {
        this._schedulerSv.convertToTsc();
      }
      this.searchObj.machine = this._schedulerSv.searchObj.machine || [];
      this.updateForm(this._schedulerSv.searchObj);
    } else {
      this._schedulerSv.searchObj = JSON.parse(JSON.stringify(this.frm.value));
      delete this._schedulerSv.searchObj.formRequires;
    }

    let data = this.frm.value;
    // if (data['customerPoId'] ||
    //   data['retailerPoId'] ||
    //   data['customer'] ||
    //   data['styleName'] ||
    //   data['partnerStyle'] ||
    //   data['cancelDateFromOnUtc'] ||
    //   data['cancelDateToOnUtc']) {
    //   this.isFilter = true;
    // } else {
    //   this.isFilter = false;
    // }
    // set last tab
    this._schedulerSv.searchFrom = 'print-tsc';
  }

  public getSchedulesData(search?) {
    if (this.scrollListQuery) {
      this._lastScheduleScroll = this.scrollListQuery.last['elementRef'].nativeElement.scrollTop;
    }
    let subTableData = [];
    let data = this.frm.value;
    let curDate = new Date();
    curDate.setHours(-HourOffset, 0, 0);
    let params: HttpParams = new HttpParams()
      .set('printDateFromOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'))
      .set('hourOffset', HourOffset.toString());

    switch (data['printDate']) {
      case 'Yesterday':
        curDate.setDate(curDate.getDate() - 1);
        subTableData.push(
          {
            date: new Date(curDate.getTime()),
            data: [],
            neckData: [],
            finishData: []
          }
        );
        params = params.set('printDateFromOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));
        curDate.setHours(23 - HourOffset, 59, 59);
        params = params.set('printDateToOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));
        break;
      case 'Today':
        subTableData.push(
          {
            date: new Date(curDate.getTime()),
            data: [],
            neckData: [],
            finishData: []
          }
        );
        curDate.setHours(23 - HourOffset, 59, 59);
        params = params.set('printDateToOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));
        break;
      case 'This Week':
        let dOW = curDate.getDay();

        for (let i = 1; i < 8; i++) {
          curDate = new Date();
          curDate.setDate(curDate.getDate() - (dOW - i));
          subTableData.push(
            {
              date: curDate,
              data: [],
              neckData: [],
              finishData: []
            }
          );
        }

        let startDate = new Date(subTableData[0].date.getTime());
        startDate.setHours(-HourOffset, 0, 0);
        let endDate = new Date(subTableData[6].date.getTime());
        endDate.setHours(23 - HourOffset, 59, 59);
        params = params.set('printDateFromOnUtc', moment(startDate).format('YYYY-MM-DDTHH:mm:ss'));
        params = params.set('printDateToOnUtc', moment(endDate).format('YYYY-MM-DDTHH:mm:ss'));
        break;
      case 'Custom':
        if (!data['schedDateFrom'] || !data['schedDateTo']) {
          return;
        } else {
          data['schedDateFrom'].jsdate.setHours(0, 0, 0);
          data['schedDateTo'].jsdate.setHours(0, 0, 0);
          let timeDiff =
                Math.abs(
                  data['schedDateTo'].jsdate.getTime()
                  - data['schedDateFrom'].jsdate.getTime()
                );
          for (let i = 0; i < Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; i++) {
            curDate = new Date(data['schedDateFrom'].jsdate.getTime());
            curDate.setDate(curDate.getDate() + i);
            subTableData.push(
              {
                date: curDate,
                data: [],
                neckData: [],
                finishData: []
              }
            );
          }

          let dateFrom = new Date(data['schedDateFrom'].jsdate.getTime());
          let dateTo = new Date(data['schedDateTo'].jsdate.getTime());
          dateFrom.setHours(-HourOffset, 0, 0);
          dateTo.setHours(23 - HourOffset, 59, 59);
          params = params.set('printDateFromOnUtc',
            moment(dateFrom).format('YYYY-MM-DDTHH:mm:ss'));
          params = params.set('printDateToOnUtc',
            moment(dateTo).format('YYYY-MM-DDTHH:mm:ss'));
        }
        break;
      default:
        let sixDays = new Date();
        sixDays.setDate(curDate.getDate() + 6);
        sixDays.setHours(23 - HourOffset, 59, 59);
        params = params.set('printDateToOnUtc', moment(sixDays).format('YYYY-MM-DDTHH:mm:ss'));

        for (let i = 0; i < 7; i++) {
          curDate = new Date();
          curDate.setDate(curDate.getDate() + i);
          subTableData.push(
            {
              date: curDate,
              data: [],
              neckData: [],
              finishData: []
            }
          );
        }
        break;
    }

    if (this.searchObj['machine'] && this.searchObj['machine'].length) {
      params = params.set('machines', this.searchObj['machine'].toString());
    }

    this._schedulesPrintService.getSchedulesData(params)
      .subscribe((resp: ResponseMessage<any>): void => {
        if (resp.status) {
          this.searchedObj = {
            ...this.frm.value,
            machines: this.searchObj['machine'].toString()
          };
          if (!resp.data.length) {
            this.isNoData = true;
          } else {
            this.isNoData = false;
          }
          this.tableData = subTableData;
          this.setDataTable(resp.data, search);
          this.groupFinishingProcess();
          if (!this.daysTab.length) {
            this.setDaysTab(0, true);
          } else {
            let activeIndex = this.daysTab.findIndex((d) => d.isActive === true);
            if (activeIndex < 0) {
              activeIndex = 0;
            }
            this.setDaysTab(activeIndex);
          }
          // setTimeout(() => {
          //   this.scrollListQuery.last.scrollTo(
          //     0,
          //     this._lastScheduleScroll
          //   );
          // });
        }

        if (this._progressCount) {
          // Prevent user navigate to another page when data not loaded yet
          const backdropElm = document.getElementById('backdrop');
          if (backdropElm) {
            backdropElm.className = 'none';
            this._changeDetectorRef.markForCheck();
          }
          this._progressCount--;
        }

        this._progressService.start();
        setTimeout(() => {
          this.recalLayout();
          this._progressService.done();
        }, 250);
      });
  }

  public getTobeScheduleData(draw?: number, toTop?: boolean, updateMultiDrag?: number) {
    if (this.scrollListQuery) {
      this._lastTobeScroll = this.scrollListQuery.first['elementRef'].nativeElement.scrollTop;
    }
    this.tableConfig.currentPage = draw ? draw + 1 : 1;
    let countSkip = draw ? draw * this.tableConfig.pageSize : 0;
    let pageSize = this.tableConfig.pageSize.toString();
    let data = this.frm.value;
    let params: HttpParams = new HttpParams()
      .set('countSkip', countSkip.toString())
      .set('pageSize', pageSize)
      .set('customerPoId', data['customerPoId'])
      .set('retailerPoId', data['retailerPoId'])
      .set('customer', data['customer'])
      .set('styleName', data['styleName'])
      .set(
        'cancelDateFromOnUtc',
        (data['cancelDateFrom'] ?
          moment.utc(data['cancelDateFrom'].jsdate).format('YYYY-MM-DDTHH:mm:ss') : undefined)
      )
      .set(
        'cancelDateToOnUtc',
        (data['cancelDateTo'] ?
          moment.utc(data['cancelDateTo'].jsdate).format('YYYY-MM-DDTHH:mm:ss') : undefined)
      );
    this._schedulesPrintService.getTobeScheduleData(params)
      .subscribe((resp: ResponseMessage<any>): void => {
        if (resp.status) {
          if (resp.data && resp.data.data) {
            this.tableTobeScheduleData.data = resp.data.data;
            this.tableTobeScheduleData.totalRecord = resp.data.totalRecord;
            this._changeDetectorRef.markForCheck();
            setTimeout(() => {
              // this.scrollListQuery.first.update();
              // if (toTop) {
              //   this.scrollListQuery.first.scrollToTop();
              // } else {
              //   this.scrollListQuery.first.scrollTo(
              //     0,
              //     this._lastTobeScroll
              //   );
              // }
              if (typeof updateMultiDrag === 'number') {
                this.cleanDragMultiple(updateMultiDrag);
              }
            });
          } else {
            this.tableTobeScheduleData.data = [];
            this.tableTobeScheduleData.totalRecord = 0;
            this._changeDetectorRef.markForCheck();
          }
          if ((!resp.data || !resp.data.data || !resp.data.data.length) &&
            this.tableConfig.currentPage > 1) {
            this.tableConfig.currentPage--;
            this.getTobeScheduleData(this.tableConfig.currentPage - 1);
          }
        }
      });
  }

  public getLateJobData() {
    let params: HttpParams = new HttpParams()
      .set('hourOffset', HourOffset.toString());
    this._schedulesPrintService.getLateJobData(params)
      .subscribe((resp) => {
        if (resp.status) {
          if (!resp.data || !resp.data.length) {
            return;
          }
          let cloneTableData = this.tableData.slice(0);
          this.tableData = [];
          let startDate = moment(resp.data[0].printDate).toDate();
          let endDate = moment(resp.data[resp.data.length - 1].printDate).toDate();
          let timeDiff =
                Math.abs(
                  startDate.getTime()
                  - endDate.getTime()
                );
          for (let i = 0; i < Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; i++) {
            let curDate = new Date(startDate.getTime());
            curDate.setDate(curDate.getDate() + i);
            this.tableData.push(
              {
                date: curDate,
                data: [],
                neckData: [],
                finishData: []
              }
            );
          }
          this.setDataTable(resp.data, true, true);
          this.groupFinishingProcess(true);
          // first time get late data
          if (!this.daysTab.length ||
            (this.daysTab.length && this.daysTab[0].date !== null)) {
            this.daysTab.unshift({isActive: false, date: null});
            this.setDaysTab(0);
          }
          // other time get late data
          if (this.lateJobData.length && this.isOnLateTab) {
            this.tableData = this.lateJobData;
          }
          // revert day data if on other tab
          if (!this.isOnLateTab) {
            this.tableData = cloneTableData;
          }
          // remove late tab if no data
          if (!this.lateJobData.length && this.daysTab.length) {
            this.daysTab.splice(0, 1);
          }
          // if (!this.daysTab.length ||
          //   (this.daysTab.length && this.daysTab[0].date !== null)) {
          //   this.daysTab.unshift({isActive: false, date: null});
          // }
          // if (this.daysTab.length > 1) {
          //   this.daysTab[0].isActive = true;
          //   this.daysTab[1].isActive = false;
          //   this.isOnLateTab = true;
          // }
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * Page change event
   * @param draw
   */
  public onPageChange(draw: number): void {
    this.tableConfig.currentPage = draw + 1;
    this.getTobeScheduleData(draw, true);
  }

  /**
   * Page size change event
   * @param pageSize
   */
  public onSelectedPageSize(pageSize: number): void {
    this.tableConfig.pageSize = pageSize;
    this.getTobeScheduleData();
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getMachineNVendor('All')
      .subscribe((resp: ResponseMessage<BasicVendorInfo[]>) => {
        if (resp.status) {
          this.getSchedulesData();
          this.getLateJobData();
          let sortedData = _.orderBy(resp.data, ['isMachine', 'name'], ['desc', 'asc']);
          this.printList = sortedData.filter((data) => data['type'] === 'Print');
          // move other to end of array
          this.moveSomethToEndArr(this.printList, 'other');
          this.neckLabelList = sortedData.filter((data) => data['type'] === 'NeckLabel');
          // move other to end of array
          this.moveSomethToEndArr(this.neckLabelList, 'other');
          // move tsc to beginning of array
          this.moveSomethToBeginArr(this.neckLabelList, 'tsc');
          this.finishList = sortedData.filter((data) => data['type'] === 'Finishing');
          // move other to end of array
          this.moveSomethToEndArr(this.finishList, 'other');
          // move tsc to beginning of array
          this.moveSomethToBeginArr(this.neckLabelList, 'tsc');
          this.machineList = JSON.parse(JSON.stringify(sortedData));
          // this.removeDuplicate(this.machineList);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  @HostListener('window:scroll', ['$event'])
  public onAppScroll(event, timeout = 0, forceResize?: boolean, setTableW?: boolean) {
    let fixedPoint = 280;
    if (window.innerWidth < 992) {
      fixedPoint = 360;
    }
    if (event.target.scrollingElement.scrollTop > fixedPoint &&
      (!this.fixedHeader || forceResize)) {
      if (!this.fixedHeader) {
        setTableW = true;
      }
      this.fixedHeader = true;
      setTimeout(() => {
        for (let j = 0; j < 10; j++) {
          let tableW = 0;
          let fixedHE;
          if (document.getElementsByClassName('fixedHeader')[0]) {
            fixedHE = document.getElementsByClassName('fixedHeader')[0]
              .getElementsByTagName('th');
            let bodyE = document.getElementsByTagName('td');
            for (let i = 0; i < fixedHE.length; i++) {
              let headerW = Number.parseFloat(
                window.getComputedStyle(fixedHE[i], null).getPropertyValue('width')
              );
              let bodyW = Number.parseFloat(
                window.getComputedStyle(bodyE[i], null).getPropertyValue('width')
              );
              tableW += bodyW;
              if (headerW !== bodyW && fixedHE[i]) {
                fixedHE[i]['style'].width = bodyW + 'px';
                this._changeDetectorRef.markForCheck();
              }
            }
            if (setTableW) {
              document.getElementsByClassName('fixedHeader')[0]['style']
                .width = tableW + 3 + 'px';
            }
          }
        }
      }, timeout);
      this._changeDetectorRef.markForCheck();
    } else if (event.target.scrollingElement.scrollTop <= fixedPoint && this.fixedHeader) {
      this.fixedHeader = false;
      this._changeDetectorRef.markForCheck();
    }
  }

  @HostListener('mousemove', ['$event'])
  public onMouseMove(event) {
    if (this.dragInfo.isDragging && this.dragInfo.draggingMirror) {
      this.dragInfo.draggingMirror[0].style.left = event.x + 10 + 'px';
      this.dragInfo.draggingMirror[0].style.top = event.y + 10 + 'px';
    }
  }

  @HostListener('mousedown', ['$event'])
  public onMouseDown(event) {
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  @HostListener('mouseup', ['$event'])
  public onMouseUp(event) {
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
  }

  public setDataTable(data, search?: boolean, isLateJob?: boolean) {
    let printAvailable = this.printList;
    let neckAvailable = this.neckLabelList;
    let finishAvailable = this.finishList;
    if (this.searchObj['machine'] && this.searchObj['machine'].length) {
      printAvailable = [];
      neckAvailable = [];
      finishAvailable = [];
      this.searchObj['machine'].forEach((m) => {
        // push filter machine to schedule table
        // print schedule
        let filterMC = this.printList.filter((mc) => mc.name === m);
        if (filterMC[0]) {
          printAvailable.push(filterMC[0]);
        }
        // neck schedule
        filterMC = this.neckLabelList.filter((mc) => mc.name === m);
        if (filterMC[0]) {
          neckAvailable.push(filterMC[0]);
        }
        // finish schedule
        filterMC = this.finishList.filter((mc) => mc.name === m);
        if (filterMC[0]) {
          finishAvailable.push(filterMC[0]);
        }
      });
    }
    // sort
    printAvailable = _.orderBy(printAvailable, ['isMachine', 'name'], ['desc', 'asc']);
    neckAvailable = _.orderBy(neckAvailable, ['name'], ['asc']);
    finishAvailable = _.orderBy(finishAvailable, ['name'], ['asc']);
    // move other to end of array
    this.moveSomethToEndArr(printAvailable, 'other');
    this.moveSomethToEndArr(neckAvailable, 'other');
    this.moveSomethToEndArr(finishAvailable, 'other');
    // move tsc to beginning of array
    this.moveSomethToBeginArr(neckAvailable, 'tsc');
    this.moveSomethToBeginArr(finishAvailable, 'tsc');

    let sample = [null];
    this.tableData.forEach((dayData) => {
      let index;
      for (let i = 0; i < data.length; i++) {
        let myDate = new Date(moment(data[i].printDate).toDate().getTime());
        if (dayData.date.getDate() === myDate.getDate() &&
          dayData.date.getMonth() === myDate.getMonth() &&
          dayData.date.getFullYear() === myDate.getFullYear()) {
          index = i;
        }
      }

      if (data[index]) {
        // map printSchedules data to machine
        let mappedData
              = this.mapData2Machine(printAvailable, 'printSchedules', data[index]);
        dayData.totalsPrint = mappedData[0];
        dayData.data = mappedData[1];
        // map neckLabelSchedules data to machine
        mappedData
          = this.mapData2Machine(neckAvailable, 'neckLabelSchedules', data[index]);
        dayData.totalsNeck = mappedData[0];
        dayData.neckData = mappedData[1];
        // map finishingSchedules data to machine
        mappedData
          = this.mapData2Machine(finishAvailable, 'finishingSchedules', data[index]);
        dayData.totalsFinish = mappedData[0];
        dayData.finishData = mappedData[1];
        // only show machine contain data if search mode on
        if (search) {
          dayData.data = dayData.data.filter((r) => r.machineData[0] !== null);
          dayData.neckData = dayData.neckData.filter((r) => r.machineData[0] !== null);
          dayData.finishData = dayData.finishData.filter((r) => r.machineData[0] !== null);
        }
      } else if (!search) {
        let rowData = [];
        // add 1 null record to day no data
        printAvailable.forEach((item) => {
          rowData.push({
            machineName: item.name,
            machineId: item.id,
            machineData: sample
          });
        });
        dayData.data = JSON.parse(JSON.stringify(rowData));
        dayData.totalsPrint = 0;
        rowData = [];
        neckAvailable.forEach((item) => {
          rowData.push({
            machineName: item.name,
            machineId: item.id,
            machineData: sample
          });
        });
        dayData.neckData = JSON.parse(JSON.stringify(rowData));
        dayData.totalsNeck = 0;
        rowData = [];
        finishAvailable.forEach((item) => {
          rowData.push({
            machineName: item.name,
            machineId: item.id,
            machineData: sample
          });
        });
        dayData.finishData = JSON.parse(JSON.stringify(rowData));
        dayData.totalsFinish = 0;
      }
    });
    // only show day contain data if search mode on
    if (search) {
      this.tableData =
        this.tableData.filter((d) => d.data.length || d.neckData.length || d.finishData.length);
    }
    this._changeDetectorRef.markForCheck();
    if (!isLateJob) {
      // save origin data
      this.tableDataOrigin = _.cloneDeep(this.tableData);
    } else {
      this.lateJobData = _.cloneDeep(this.tableData);
    }

    // update scroll
    this.scrollListQuery.forEach((sc) => {
      setTimeout(() => {
        sc.update();
      });
    });
  }

  public reCalculateData(machineData?, data?) {
    if (machineData && data) {
      machineData.runtime = data.runTime;
      machineData.scheduledQty = data.scheduledQty;
      machineData.finishingProcess = data.finishingProcess;
    }
    this.tableData.forEach((dayData) => {
      dayData.totalRecord = 0;
      dayData.data.forEach((rowData) => {
        dayData.totalRecord += rowData.machineData.length + 1;
        rowData.sumRunTime = 0;
        rowData.machineData.forEach((mcData) => {
          if (mcData) {
            rowData.sumRunTime += Number.parseFloat(mcData.runtime) + mcData.setuptime / 60;
          }
        });
        rowData.sumRunTime = rowData.sumRunTime.toFixed(2);
      });
    });
    this._changeDetectorRef.markForCheck();
  }

  public onFilter() {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
      return;
    }

    // set search filter service
    let newSearchObj = {
      ...this._schedulerSv.searchObj,
      ...this.frm.value,
      machine: this.searchObj.machine
    };
    this._schedulerSv.searchObj = JSON.parse(JSON.stringify(newSearchObj));
    delete this._schedulerSv.searchObj.formRequires;

    // reset days tab when search
    this.daysTab = [];

    let data = this.frm.value;
    // if (data['customerPoId'] ||
    //   data['retailerPoId'] ||
    //   data['customer'] ||
    //   data['styleName'] ||
    //   data['partnerStyle'] ||
    //   data['cancelDateFromOnUtc'] ||
    //   data['cancelDateToOnUtc']) {
    //   this.isFilter = true;
    //   this.getTobeScheduleData();
    //   this.getSchedulesData(true);
    // } else {
    //   this.isFilter = false;
    // }
    this.getTobeScheduleData();
    this.getSchedulesData();
  }

  /**
   * Search text change event
   * @param value
   */
  public onSearchChanged(value: string): void {
    this.searchObj.keyword = value;
    this.getSchedulesData(value);
  }

  /**
   * Fire date change event with prop
   * @param event
   */
  public onDateChanged(event: IMyDateModel, prop: string) {
    let utcDate = Object.assign({}, event);
    let curDate = new Date();
    if (utcDate.jsdate) {
      utcDate.jsdate.setHours(curDate.getHours(), curDate.getMinutes());
    }
    this.searchObj[prop] = utcDate.jsdate;

    this.frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');

    this.configDateOptions(prop, utcDate);
    // Update status for form control whose value changed
    this.frm.get(prop).markAsDirty();
    this._changeDetectorRef.markForCheck();
    this.recalLayout();
  }

  public configDateOptions(prop, utcDate) {
    let newDateOptions: IMyDpOptions;
    switch (prop) {
      case 'schedDateFromOnUtc':
        newDateOptions = Object.assign({}, this.dateEndOptions);
        newDateOptions.disableUntil = utcDate.date;
        newDateOptions.enableDays = [utcDate.date];
        this.dateEndOptions = newDateOptions;
        break;
      case 'schedDateToOnUtc':
        newDateOptions = Object.assign({}, this.dateBeginOptions);
        newDateOptions.disableSince = utcDate.date;
        newDateOptions.enableDays = [utcDate.date];
        this.dateBeginOptions = newDateOptions;
        break;
      case 'cancelDateFromOnUtc':
        newDateOptions = Object.assign({}, this.cancelDateEnd);
        newDateOptions.disableUntil = utcDate.date;
        newDateOptions.enableDays = [utcDate.date];
        this.cancelDateEnd = newDateOptions;
        break;
      case 'cancelDateToOnUtc':
        newDateOptions = Object.assign({}, this.cancelDateBegin);
        newDateOptions.disableSince = utcDate.date;
        newDateOptions.enableDays = [utcDate.date];
        this.cancelDateBegin = newDateOptions;
        break;
      default:
        return;
    }
  }

  public showInput(event, machineData?, maintenanceIndex?) {
    if (!this.isPageReadOnly) {
      if (machineData && (machineData.processStatus || machineData.isArchived)) {
        return;
      }
      let inputE = event.getElementsByTagName('input');
      let valueE = event.getElementsByTagName('span');
      let iElef = event.getElementsByTagName('i');

      if (inputE.length) {
        let eleIndex = 0;
        if (maintenanceIndex) {
          eleIndex = 1;
        }
        if (inputE[eleIndex].hidden) {
          valueE[eleIndex].hidden = true;
          inputE[eleIndex].hidden = false;
          this.isRuntimeOpen = true;
          inputE[eleIndex].focus();
          inputE[eleIndex].select();
          if (iElef.length) {
            iElef[eleIndex].hidden = true;
          }
        }
      }
    }
  }

  public showRunTime(event, machineData?) {
    let inputE = event.nextElementSibling;
    if (inputE.hidden) {
      event.hidden = true;
      inputE.hidden = false;
      this.isRuntimeOpen = true;
      inputE.focus();
      inputE.select();
    }
  }

  public updateRunTime(inputE, runTimeE, dayDataId, rowDataId, machineDataId, maintenanceIndex?) {
    let valueE = runTimeE.getElementsByTagName('span');
    let runTimeNumber = parseFloat(inputE.value);
    let machineData = this.tableData[dayDataId].data[rowDataId].machineData[machineDataId];

    if (inputE.value && isNaN(runTimeNumber)) {
      this._toastrService.error('Number invalid!', 'Error');
      return;
    }
    // if (!isNaN(runTimeNumber) && runTimeNumber - machineData.runtime !== 0) {
    //   let model = {
    //     runTime: runTimeNumber.toFixed(2),
    //     specialTask: machineData.isMaintenanceJob ? machineData.specialTask : undefined
    //   };
    //   this.updateSchedules(machineData, model);
    // }
    if (!isNaN(runTimeNumber) && runTimeNumber - machineData.runtime !== 0 && !maintenanceIndex) {
      let model = {
        runTime: machineData.runtime,
        setuptime: runTimeNumber,
        specialTask: machineData.specialTask,
        scheduledQty: machineData.scheduledQty
      };
      this.updateSchedules(machineData, model);
    }
    if (!isNaN(runTimeNumber) && runTimeNumber - machineData.setuptime !== 0 && maintenanceIndex) {
      let model = {
        runTime: runTimeNumber.toFixed(2),
        setuptime: machineData.setuptime,
        specialTask: machineData.specialTask,
        scheduledQty: machineData.scheduledQty
      };
      this.updateSchedules(machineData, model);
    }
    let eleIndex = 0;
    if (maintenanceIndex) {
      eleIndex = 1;
    }
    inputE.hidden = true;
    this.isRuntimeOpen = false;
    valueE[eleIndex].hidden = false;
  }

  public updateScheduled(inputE, scheduleE, machineData) {
    let valueE = scheduleE.getElementsByTagName('span');
    let iElef = scheduleE.getElementsByTagName('i');
    let scheduleNumber = Number.parseInt(inputE.value);

    if (this.invalidQty(scheduleNumber, machineData)) {
      return;
    }

    if (scheduleNumber !== machineData.scheduledQty && scheduleNumber) {
      let model = {
        scheduledQty: scheduleNumber,
        finishingProcess: machineData.finishingProcess
      };
      this.updateSchedules(machineData, model, true);
    }
    // hidden input and show scheduled value and remove icon
    inputE.hidden = true;
    valueE[0].hidden = false;
    iElef[0].hidden = false;
    this.isRuntimeOpen = false;
  }

  public updateFinishProcess(inputE, scheduleE, machineData) {
    let valueE = scheduleE.getElementsByTagName('span');

    if (inputE.value && inputE.value !== machineData.finishingProcess) {
      let model = {
        finishingProcess: inputE.value
      };
      this.updateSchedules(machineData, model);
    }
    // hidden input and show scheduled value and remove icon
    inputE.hidden = true;
    valueE[0].hidden = false;
    this.isRuntimeOpen = false;
  }

  public updateMaintenance(inputE, scheduleE, machineData, updateQty?) {
    let valueE = scheduleE.getElementsByTagName('span');

    if (inputE.value && inputE.value !== machineData.specialTask &&
      inputE.value !== 'Special Task' && !updateQty) {
      let model = {
        runTime: machineData.runtime,
        setuptime: machineData.setuptime,
        scheduledQty: machineData.scheduledQty,
        specialTask: inputE.value
      };
      this.updateSchedules(machineData, model);
    }
    if (inputE.value && inputE.value !== machineData.scheduledQty && updateQty) {
      let model = {
        runTime: machineData.runtime,
        setuptime: machineData.setuptime,
        specialTask: machineData.specialTask,
        scheduledQty: inputE.value
      };
      this.updateSchedules(machineData, model);
    }
    // hidden input and show scheduled value and remove icon
    inputE.hidden = true;
    valueE[0].hidden = false;
    this.isRuntimeOpen = false;
  }

  public updateSchedules(machineData, model, update?) {
    let params: HttpParams = new HttpParams();
    // update at print schedule
    if (machineData.printLocationId) {
      params = params.set('printLocationId', machineData.printLocationId.toString());
    }
    // update at neck label schedule
    if (machineData.neckLabelId) {
      params = params.set('neckLabelId', machineData.neckLabelId.toString());
    }
    // update at finishing schedule
    if (machineData.orderDetailId) {
      params = params.set('orderDetailId', machineData.orderDetailId.toString());
    }
    // update at maintenance job
    if (machineData.isMaintenanceJob) {
      params = params.set('isMaintenanceJob', 'true');
    }
    this._schedulesPrintService.updateSchedulesData(machineData.id, model, params)
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.getSchedulesData();
          // this.reCalculateData(machineData, model);
          if (update) {
            this.getTobeScheduleData(this.tableConfig.currentPage - 1);
          }
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public removeStyle(machineData) {
    // single remove
    if (!this.dragInfo.dragMultiRight.isHasData) {
      let params: HttpParams = new HttpParams()
        .set('orderId', machineData.orderId);
      // remove at print schedule
      if (machineData.printLocationId) {
        params = params.set('printLocationId', machineData.printLocationId.toString());
      }
      // remove at neck label schedule
      if (machineData.neckLabelId) {
        params = params.set('neckLabelId', machineData.neckLabelId.toString());
      }
      // remove at finishing schedule
      if (machineData.orderDetailId) {
        params = params.set('orderDetailId', machineData.orderDetailId.toString());
      }
      // remove at maintenance job
      if (machineData.isMaintenanceJob) {
        params = params.set('isMaintenanceJob', 'true');
      }
      this._schedulesPrintService.removeStyle(machineData.id, params)
        .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
          if (resp.status) {
            this.getSchedulesData();
            this.getTobeScheduleData(this.tableConfig.currentPage - 1);
            this.getLateJobData();
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    } else { // multiple remove
      let model = [];
      Object.keys(this.dragInfo.dragMultiRight).forEach((k) => {
        if (this.dragInfo.dragMultiRight[k].length) {
          model = model.concat(this.dragInfo.dragMultiRight[k]);
        }
      });
      this._schedulerSv.removeMultipleStyle(model)
        .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
          if (resp.status) {
            this.getSchedulesData();
            this.getTobeScheduleData(this.tableConfig.currentPage - 1);
            this.getLateJobData();
            this.cleanDragMultipleRight(4);
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }

    // let modalRef = this._modalService.open(ConfirmDialogComponent, {
    //   keyboard: false,
    //   backdrop: 'static',
    // });
    // modalRef.componentInstance
    //   .message = 'Are you sure you want to remove this style from the schedule?';
    // modalRef.componentInstance.title = 'Remove From Schedule';

    // modalRef.result.then((res: boolean) => {
    //   if (res) {
    //     this._schedulesPrintService.removeStyle(machineData.id, params)
    //     .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
    //       if (resp.status) {
    //         this.getSchedulesData();
    //         this.getTobeScheduleData(this.tableConfig.currentPage - 1);
    //         this._toastrService.success(resp.message, 'Success');
    //       } else {
    //         this._toastrService.error(resp.errorMessages, 'Error');
    //       }
    //     });
    //   }
    // });
  }

  public goToOrderInfo(orderId: number): void {
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    this._router.navigate(['order-log-v2', orderId]);
  }

  public goToStyle(orderId: number, styleId: number): void {
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    this._router.navigate(['order-log-v2', orderId, 'styles', styleId]);
  }

  public goToPrintLocation(orderId: number,
                           styleId: number,
                           printLocationId: number,
                           neckLabelId: number): void {
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    if (!neckLabelId) {
      this._router
        .navigate(['order-log-v2', orderId, 'styles', styleId, 'print-location', printLocationId]);
    } else {
      this._router
        .navigate(['order-log-v2', orderId, 'styles', styleId, 'neck-labels']);
    }
  }

  public onScrollX(event): void {
    let sidebar = this._themeSetting.menuPin;
    let sidebarMinSize = 85;
    if (window.innerWidth < 992) {
      sidebar = this._themeSetting.sidebarOpen;
      sidebarMinSize = 15;
    }
    if (sidebar !== this.preMenuPin) {
      if (this._utilService.scrollElm) {
        this.onAppScroll({target: {scrollingElement: this._utilService.scrollElm}},
          500, true, true);
      }
      this.preMenuPin = sidebar;
      if (!sidebar) {
        let headerE = document.getElementsByClassName('fixedHeader')[0];
        if (headerE) {
          headerE['style'].left = 'unset';
        }
      }
    }
    let leftAlign;
    if (sidebar) {
      leftAlign = 207 - event.target.scrollLeft;
    } else {
      leftAlign = sidebarMinSize - event.target.scrollLeft;
    }
    let headerE = document.getElementsByClassName('fixedHeader')[0];
    if (headerE) {
      headerE['style'].left = leftAlign + 'px';
    }
    if (this._utilService.scrollElm) {
      this.onAppScroll({target: {scrollingElement: this._utilService.scrollElm}},
        0, true);
    }
  }

  public triggerCalendar(event, neededDateParent, data) {
    let neededSpanE = neededDateParent.getElementsByTagName('span')[0];
    let neededDateE = neededDateParent.getElementsByTagName('my-date-picker')[0];

    if (!event.target) {
      if (event > 2 && data && data.neededByDate) {
        neededDateE.hidden = true;
        this.tableDateModel = {
          date:
            {
              year: 0,
              month: 0,
              day: 0
            }
        };
        neededSpanE.hidden = false;
        neededSpanE.nextElementSibling.hidden = false;
      }
      if (event === 2 && neededSpanE.hidden) {
        neededSpanE.hidden = false;
        neededSpanE.nextElementSibling.hidden = false;
      }
    } else {
      if (event.target.tagName !== 'I') {
        neededSpanE.hidden = true;
        neededSpanE.nextElementSibling.hidden = true;
        neededDateE.hidden = false;
        let neededDate = new Date(data.neededByDate);
        this.tableDateModel = {
          date:
            {
              year: neededDate.getFullYear(),
              month: neededDate.getMonth() + 1,
              day: neededDate.getDate()
            }
        };
        // let btnSelector = neededDateE.elem.nativeElement.getElementsByTagName('button');
        let btnSelector = neededDateE.querySelector('button.btnpicker.btnpickerenabled');
        setTimeout(() => {
          btnSelector.click();
        });
      }
    }
  }

  /**
   * Handle over event
   */
  public onOver(args) {
    if (!this.dragInfo.isDragging) {
      this.dragInfo.isDragging = true;
      let mirror = document.getElementsByClassName('gu-mirror');
      this.dragInfo.draggingMirror = mirror;
    }
    if (args[0].id === 'maintenanceBtn') {
      // let trE = document.createElement('tr');
      // for (let i = 0; i < 11; i++) {
      //   let col = document.createElement('td');
      //   trE.appendChild(col);
      // }
      // trE.id = 'maintenanceBtn';
      // if (args[0].parentNode) {
      //   args[0].parentNode.replaceChild(trE, args[0]);
      // }
      // args[0] = trE;
      // args[0].className += ' gu-transit';
      return;
    }
    this.dragInfo.allowDrop = true;
    // keep drag element if drag on right panel
    if (args[0].id && args[0].id.includes('-')) {
      if (args[1].id !== 'finishing-schedule' && args[0].cells.length >= 10) {
        let l = args[0].cells.length;
        for (let i = 9; i < l; i++) {
          args[0].deleteCell(args[0].cells.length - 1);
        }
      }
      // transform drag element to fit print-schedule
      if (args[1].id === 'print-schedule' && args[1].id === args[2].id) {
        if (args[0].cells.length === 9) {
          args[0].deleteCell(0);
          args[0].deleteCell(args[0].cells.length - 1);
        }
        if (args[0].cells.length < 9) {
          // find 5th td child node
          let tdCount = 0;
          for (let i = 0; i < args[0].childNodes.length; i++) {
            if (args[0].childNodes[i].tagName === 'TD' && tdCount < 5) {
              tdCount++;
            }
            if (tdCount === 5) {
              tdCount = i;
            }
          }
          for (let i = 0; i < 2; i++) {
            let col = document.createElement('td');
            args[0].appendChild(col);
          }
          let col = document.createElement('td');
          args[0].insertBefore(col, args[0].childNodes[tdCount]);
        }
      }
      // transform drag element to fit neck-label-schedule
      if (args[1].id === 'neck-label-schedule' && args[1].id === args[2].id) {
        this.dragInfo.fromRight = 'neckData';
        if (args[0].cells.length === 9) {
          args[0].deleteCell(0);
          args[0].deleteCell(args[0].cells.length - 1);
        }
        if (args[0].cells.length < 9) {
          // find 5th td child node
          let tdCount = 0;
          for (let i = 0; i < args[0].childNodes.length; i++) {
            if (args[0].childNodes[i].tagName === 'TD' && tdCount < 5) {
              tdCount++;
            }
            if (tdCount === 5) {
              tdCount = i;
            }
          }
          args[0].deleteCell(0);
          for (let i = 0; i < 3; i++) {
            let col = document.createElement('td');
            args[0].appendChild(col);
          }
          let col = document.createElement('td');
          args[0].insertBefore(col, args[0].childNodes[tdCount]);
        }
      }
      // transform drag element to fit finishing-schedule
      if (args[1].id === 'finishing-schedule' && args[1].id === args[2].id) {
        this.dragInfo.fromRight = 'finishData';
        if (args[0].cells.length === 10) {
          args[0].deleteCell(0);
          args[0].deleteCell(args[0].cells.length - 1);
        }
        if (args[0].cells.length < 10) {
          for (let i = 0; i < 1; i++) {
            let col = document.createElement('td');
            args[0].appendChild(col);
          }
        }
      }
      if (args[1].id === 'finishing-schedule' &&
        args[1].id !== args[2].id &&
        args[0].cells.length < 10) {
        let col = document.createElement('td');
        args[0].appendChild(col);
      }
    }
    // prevent drag back to tobe schedule
    if (!args[1].id && this.dragInfo.status === 'scheduled') {
      return;
    }
    let invalid = false;
    // prevent drop to a date earlier than today's date
    // if (args[1].id && args[1].dataset.date) {
    //   let curDate = new Date();
    //   curDate.setHours(0, 0, 0, 0);
    //   let tableDate = new Date(args[1].dataset.date);
    //   tableDate.setHours(0, 0, 0, 0);
    //   if (tableDate.getTime() < curDate.getTime()) {
    //     invalid = true;
    //   }
    // }
    // prevent drop when wrong handle
    if (args[1].id === 'print-schedule' && this.dragInfo.whichHandle !== 'print-handle') {
      invalid = true;
    }
    if (args[1].id === 'neck-label-schedule' && this.dragInfo.whichHandle !== 'neck-handle') {
      invalid = true;
    }
    if (args[1].id === 'finishing-schedule' && this.dragInfo.whichHandle !== 'finish-handle') {
      invalid = true;
    }
    // prevent drag from tobe to days tab
    if (args[0].id && !args[0].id.includes('-') && args[1].id.includes('days-tab')) {
      invalid = true;
      this._dragulaService.find('bag-one').drake.cancel();
    }
    // hide preview and make container red if invalid
    if (invalid) {
      args[1].classList.add('invalid-area');
      this.dragInfo.allowDrop = false;
    }

    // drag to PRINT SCHEDULE TABLE
    if (args[1].id === 'print-schedule' && args[0].cells[0].innerText !== '') {
      // add 1 td to first col of preview drag element
      let col = document.createElement('td');
      args[0].insertBefore(col, args[0].childNodes[0]);
      // splice trim ETA column and last cell
      args[0].deleteCell(5);
      args[0].deleteCell(args[0].cells.length - 1);
      // set diff col to empty content (2 last)
      let diffCol = 2;
      // keep last data if drag from right panel
      if (args[0].id && args[0].id.includes('-')) {
        diffCol = 1;
      }
      for (let i = 0; i < diffCol; i++) {
        args[0].cells[args[0].cells.length - 1 - i].innerText = '';
        args[0].cells[args[0].cells.length - 1 - i].classList.value = '';
      }
      this.dragInfo.status = 'scheduled';
    }

    // drag to NECK LABEL SCHEDULE TABLE
    if (args[1].id === 'neck-label-schedule' && args[0].cells[0].innerText !== '') {
      // add 2 td to first col of preview drag element
      for (let i = 0; i < 2; i++) {
        let col = document.createElement('td');
        args[0].insertBefore(col, args[0].childNodes[0]);
      }
      // splice trim ETA and 2 last column
      args[0].deleteCell(6);
      args[0].deleteCell(args[0].cells.length - 1);
      args[0].deleteCell(args[0].cells.length - 2);
      // set diff col to empty content (1 last)
      for (let i = 0; i < 1; i++) {
        args[0].cells[args[0].cells.length - 1 - i].innerText = '';
        args[0].cells[args[0].cells.length - 1 - i].classList.value = '';
      }
      this.dragInfo.status = 'scheduled';
    }

    // drag to FINISHING SCHEDULE TABLE
    if (args[1].id === 'finishing-schedule' &&
      args[0].cells[0].innerText !== '') {
      this.dragInfo.status = 'scheduled';
      // add 1 td to first col of preview drag element
      let col = document.createElement('td');
      args[0].insertBefore(col, args[0].childNodes[0]);
      if (args[0].id && args[0].id.includes('-')) {
        return;
      }
      // find 5th td child node
      let tdCount = 0;
      for (let i = 0; i < args[0].childNodes.length; i++) {
        if (tdCount === 5) {
          tdCount = i;
        }
        if (args[0].childNodes[i].tagName === 'TD' && tdCount < 5) {
          tdCount++;
        }
      }
      // add 2 td before trim ETA and set blank ETA to empty
      for (let i = 0; i < 2; i++) {
        col = document.createElement('td');
        args[0].insertBefore(col, args[0].childNodes[tdCount]);
      }
      args[0].cells[4].innerText = '';
      // delete rerun cell and 2 last column
      args[0].deleteCell(2);
      args[0].deleteCell(args[0].cells.length - 1);
      args[0].deleteCell(args[0].cells.length - 2);
      // set diff col to empty content (2 last)
      for (let i = 0; i < 1; i++) {
        args[0].cells[args[0].cells.length - 1 - i].innerText = '';
        args[0].cells[args[0].cells.length - 1 - i].classList.value = '';
      }
    }
  }

  public onShadow(args) {
    try {
      if (args[0].id && !args[0].id.includes('-') && args[1].id.includes('days-tab')) {
        args[0].hidden = true;
        return;
      }
      if (args[1] && args[1].id && args[1].id.includes('days-tab')) {
        let isDragToLateTab = args[1].id.endsWith('-0') && this.lateJobData.length;
        args[0].hidden = true;
        if (!args[1].classList.contains('green-days-tab') &&
        !args[1].classList.contains('active') && !isDragToLateTab) {
          args[1].classList.add('green-days-tab');
        }
        return;
      }

      if (args[0].id === 'maintenanceBtn' && (!args[1] || !args[1].id)) {
        args[0].hidden = true;
        return;
      }

      if (!args[1].id) {
        return;
      }

      if (args[0].id === 'maintenanceBtn') {
        let shadowE = document.getElementsByClassName('gu-transit');
        if (shadowE.length > 1) {
          if (shadowE[0].tagName === 'TR' && shadowE[0].parentNode) {
            shadowE[0].outerHTML = '';
          }
          if (shadowE[1] && shadowE[1].tagName === 'TR' && shadowE[1].parentNode) {
            shadowE[1].outerHTML = '';
          }
        }
        let trE = document.createElement('tr');
        let colCount = 9;
        if (args[1].id === 'finishing-schedule') {
          colCount = 10;
        }
        for (let i = 0; i < colCount; i++) {
          let col = document.createElement('td');
          trE.appendChild(col);
        }
        trE.id = 'maintenanceBtn';
        if (args[0].parentNode) {
          args[0].parentNode.replaceChild(trE, args[0]);
        }
        args[0] = trE;
        args[0].className += 'gu-transit';
      }

      let firstIndex;
      let trList;
      let chosenElef;
      let typeData = {
        'print-schedule': 'data',
        'neck-label-schedule': 'neckData',
        'finishing-schedule': 'finishData'
      };
      // turn contain to red if drag from invalid vendor to machine / tsc
      if (args[0].previousElementSibling && args[1].id === args[2].id) {
        let invalid = false;
        // firstIndex = args[0].previousElementSibling.id.split('-');
        // trList = args[1].getElementsByTagName('tr');
        // chosenElef = args[0].previousElementSibling;
        // for (let i = 0; i < trList.length; i++) {
        //   if (trList[i].id) {
        //     let trIndex = trList[i].id.split('-');
        //     if (trIndex[0] === firstIndex[0] &&
        //       trIndex[1] === firstIndex[1] &&
        //       trIndex[2] === '0' &&
        //       !trList[i].classList.contains('gu-transit')) {
        //       chosenElef = trList[i];
        //     }
        //   }
        // }
        // let dragItemId = args[0].id.split('-');
        // dragItemId.forEach((item, index) => {
        //   dragItemId[index] = Number.parseInt(item);
        // });
        // let isUnitValid = true;
        // let dragData;
        // try {
        // dragData =
        // this.tableData[dragItemId[0]][typeData[args[1].id]][dragItemId[1]].machineData;
        // } catch (er) {
        //   // empty
        // }
        // let wQty = 'productionQty';
        // if (this.dragInfo.fromRight === 'finishData') {
        //   wQty = 'finishedQty';
        // }
        // if (dragData && dragData[dragItemId[2]].scheduledQty < dragData[dragItemId[2]][wQty]) {
        //   isUnitValid = false;
        // }
        // let dragVendor;
        // if (dragData) {
        //   dragVendor = dragData[dragItemId[2]].vendorName;
        // }
        // if (chosenElef.cells[0] && dragVendor && dragVendor.toLowerCase() !== 'tsc' &&
        //   chosenElef.cells[0].innerText.toLowerCase() === 'tsc' && !isUnitValid) {
        //   invalid = true;
        // }
        // if (args[1].id === 'print-schedule' && dragVendor && chosenElef.cells[0]) {
        //   let machineIndex = this.printList.findIndex(
        //     (m) => m.name === chosenElef.cells[0].innerText && m.isMachine
        //   );
        //   if (machineIndex > -1 && !isUnitValid) {
        //     invalid = true;
        //   }
        // }
        // revert contain to green if no invalid
        if (args[1].classList.contains('invalid-area')) {
          args[1].classList.remove('invalid-area');
          this.dragInfo.allowDrop = true;
        }
        // prevent drop to a date earlier than today's date
        // if (args[1].id && args[1].dataset.date) {
        //   let curDate = new Date();
        //   curDate.setHours(0, 0, 0, 0);
        //   let tableDate = new Date(args[1].dataset.date);
        //   tableDate.setHours(0, 0, 0, 0);
        //   if (tableDate.getTime() < curDate.getTime()) {
        //     invalid = true;
        //   }
        // }
        // make container red if invalid
        if (invalid) {
          args[1].classList.add('invalid-area');
          this.dragInfo.allowDrop = false;
        }
      }
      // prevent drop wrong process finishing
      if (args[1].id === 'finishing-schedule' && this.dragInfo.whichHandle === 'finish-handle') {
        let invalid = false;
        let tscMachine = this.finishList.find((i) => i.name.toLowerCase() === 'tsc');
        let preElef = args[0].previousElementSibling;
        if (tscMachine && preElef) {
          let curMachine = preElef.id.split('-');
          if (Number.parseInt(curMachine[3]) === tscMachine.id
            && isNaN(this.dragInfo.processIndex)) {
            invalid = true;
          }
          if (Number.parseInt(curMachine[3]) !== tscMachine.id
            && !isNaN(this.dragInfo.processIndex)) {
            invalid = true;
          }
        }
        // revert contain to green if no invalid
        if (args[1].classList.contains('invalid-area')) {
          args[1].classList.remove('invalid-area');
          this.dragInfo.allowDrop = true;
        }
        // make container red if invalid
        if (invalid) {
          args[1].classList.add('invalid-area');
          this.dragInfo.allowDrop = false;
        }
      }
      // prevent drop process X to process Y
      if (args[0].previousElementSibling && args[1].id === args[2].id
        && args[1].id === 'finishing-schedule') {
          let invalid = false;
          let tscMachine = this.finishList.find((i) => i.name.toLowerCase() === 'tsc');
          let preElef = args[0].previousElementSibling;
          if (tscMachine && preElef) {
            let dragMachine = args[0].id.split('-');
            let curMachine = preElef.id.split('-');
            if (+dragMachine[3] !== tscMachine.id
              && +curMachine[3] === tscMachine.id) {
              invalid = true;
            }
            if (+dragMachine[3] === tscMachine.id
              && +curMachine[3] !== tscMachine.id) {
              invalid = true;
            }
            if (+dragMachine[3] === tscMachine.id && +curMachine[3] === tscMachine.id &&
              this.tableData[+dragMachine[0]]
                .finishData[+dragMachine[1]]
                .machineData[+dragMachine[2]].finishingProcess !==
              this.tableData[+curMachine[0]]
                .finishData[+curMachine[1]]
                .machineData[+curMachine[2]].finishingProcess
            ) {
              invalid = true;
            }
          }
          // revert contain to green if no invalid
          if (args[1].classList.contains('invalid-area')) {
            args[1].classList.remove('invalid-area');
            this.dragInfo.allowDrop = true;
          }
          // make container red if invalid
          if (invalid) {
            args[1].classList.add('invalid-area');
            this.dragInfo.allowDrop = false;
          }
      }

      let siblingIndex = args[0].nextElementSibling;
      if (siblingIndex) {
        siblingIndex = siblingIndex.id.split('-');
      } else {
        siblingIndex = [];
      }
      if (args[0].hidden) {
        args[0].hidden = false;
      }
      // hidden drag item when drag to top of table
      if (siblingIndex[1] === '0' && siblingIndex[2] === '0') {
        args[0].hidden = true;
      }
      // // hidden drag item when drag to top of process #
      // if (args[0].previousElementSibling && args[0].previousElementSibling.cells.length <= 3) {
      //   args[0].hidden = true;
      // }
      // handle when drag between 2 style in 1 machine
      let dragElef: any = args[0];
      if (dragElef) {
        let preId: any = ['n', 'n', 'n', 'n'];
        if (dragElef.previousElementSibling) {
          preId = dragElef.previousElementSibling['id'].split('-');
        }
        let nextId: any = ['n', 'n', 'n', 'n'];
        if (dragElef.nextSibling) {
          nextId = dragElef.nextSibling['id'].split('-');
        }
        preId.forEach((item, index) => {
          preId[index] = Number.parseInt(preId[index]);
          nextId[index] = Number.parseInt(nextId[index]);
        });
        let curLMC = 0;
        if (this.tableData[nextId[0]]) {
          curLMC = this.tableData[nextId[0]][typeData[args[1].id]][nextId[1]].machineData.length;
        }
        let isOutOfMC = true;
        if (preId[2] >= 0 && nextId[2] <= curLMC - 1 && preId[1] === nextId[1]) {
          isOutOfMC = false;
        }
        // drag item is between 2 style in 1 machine
        if (preId[2] >= 0 && nextId[2] <= curLMC - 1 && preId[1] === nextId[1]
          && dragElef.id === 'maintenanceBtn') {
          // hide some td to fit contain
          dragElef.cells[0].hidden = true;
          dragElef.cells[dragElef.cells.length - 1].hidden = true;
        }
        if (preId[2] >= 0 && nextId[2] <= curLMC - 1 && preId[1] === nextId[1]
          && !this.dragInfo.expandMachine.length) {
          // hide some td to fit contain
          dragElef.cells[0].hidden = true;
          dragElef.cells[dragElef.cells.length - 1].hidden = true;
          // expand rowSpand of first & last td
          firstIndex = `${nextId[0]}-${nextId[1]}-0-${nextId[3]}`;
          // find tr
          trList = args[1].getElementsByTagName('tr');
          chosenElef = trList[firstIndex];
          for (let i = 0; i < trList.length; i++) {
            if (trList[i].id === firstIndex && !trList[i].classList.contains('gu-transit')) {
              chosenElef = trList[i];
            }
          }
          let firstTd = chosenElef['cells'][0];
          // let lastTd = chosenElef['cells'][8];
          // if (args[1].id === 'finishing-schedule') {
          //   lastTd = chosenElef['cells'][9];
          // }
          let lastTd = chosenElef['cells'][chosenElef['cells'].length - 1];
          firstTd.rowSpan += 1;
          lastTd.rowSpan += 1;
          // save id of row expanded
          this.dragInfo.expandMachine[0] = nextId[0];
          this.dragInfo.expandMachine[1] = nextId[1];
          this.dragInfo.expandMachine[3] = nextId[3];
        } else if (
          ((dragElef.cells[0].hidden && dragElef.cells[dragElef.cells.length - 1].hidden) ||
          (dragElef.id === 'maintenanceBtn') && this.dragInfo.expandMachine.length) && isOutOfMC
        ) {
          // out of between style
          // recover drag item
          dragElef.cells[0].hidden = false;
          dragElef.cells[dragElef.cells.length - 1].hidden = false;
          // recover rowSpan expanded
          firstIndex =
            `${this.dragInfo.expandMachine[0]}-` +
            `${this.dragInfo.expandMachine[1]}-0-${this.dragInfo.expandMachine[3]}`;
          // find tr
          trList = args[1].getElementsByTagName('tr');
          chosenElef = trList[firstIndex];
          for (let i = 0; i < trList.length; i++) {
            if (trList[i].id === firstIndex && !trList[i].classList.contains('gu-transit')) {
              chosenElef = trList[i];
            }
          }
          let firstTd = chosenElef['cells'][0];
          // let lastTd = chosenElef['cells'][8];
          // if (args[1].id === 'finishing-schedule') {
          //   lastTd = chosenElef['cells'][9];
          // }
          let lastTd = chosenElef['cells'][chosenElef['cells'].length - 1];
          firstTd.rowSpan -= 1;
          lastTd.rowSpan -= 1;
          // reset save data
          this.dragInfo.expandMachine = [];
        }
      }
      // prevent drag to late tab
      if (args[0].id && !args[0].id.includes('-') && this.isOnLateTab) {
        args[1].classList.add('invalid-area');
        this.dragInfo.allowDrop = false;
      }
    } catch (er) {
      // empty
    }
  }

  /**
   * Handle out event
   */
  public onOut(args) {
    // if (typeof this.dragInfo.processIndex === 'number') {
    //   return;
    // }
    if (args[1] && args[1].id && args[1].id.includes('days-tab')) {
      if (args[1].classList.contains('green-days-tab')) {
        args[1].classList.remove('green-days-tab');
      }
      return;
    }
    // return if drag out of maintenance btn
    if (args[0].id === 'maintenanceBtn') {
      if (args[0].parentNode) {
        args[0].outerHTML = '';
      }
      return;
    }
    if (args[1].classList.contains('invalid-area')) {
      args[1].classList.remove('invalid-area');
    }
    if (document.getElementById('insertTr') && document.getElementById('insertTr').parentNode) {
      document.getElementById('insertTr').outerHTML = '';
    }
    if (args[0].cells[0].hidden && args[0].cells[args[0].cells.length - 1].hidden) {
      args[0].cells[0].hidden = false;
      args[0].cells[args[0].cells.length - 1].hidden = false;
      if (!this.dragInfo.expandMachine.length) {
        return;
      }
      // recover rowSpan expanded
      let firstIndex =
            `${this.dragInfo.expandMachine[0]}-` +
            `${this.dragInfo.expandMachine[1]}-0-${this.dragInfo.expandMachine[3]}`;
      // find tr
      let trList = args[1].getElementsByTagName('tr');
      let chosenElef = trList[firstIndex];
      for (let i = 0; i < trList.length; i++) {
        if (trList[i].id === firstIndex && !trList[i].classList.contains('gu-transit')) {
          chosenElef = trList[i];
        }
      }
      let firstTd = chosenElef['cells'][0];
      // let lastTd = chosenElef['cells'][8];
      // if (args[1].id === 'finishing-schedule') {
      //   lastTd = chosenElef['cells'][9];
      // }
      let lastTd = chosenElef['cells'][chosenElef['cells'].length - 1];
      firstTd.rowSpan -= 1;
      lastTd.rowSpan -= 1;
      // reset save data
      this.dragInfo.expandMachine = [];
    }
  }

  /**
   * Handle end drag event
   */
  public onDragend(args) {
    // drop failed
    if (this.dragInfo.status !== 'dropped' && this.dragInfo.status !== 'none') {
      // re-render DOM at drop position
      let elIndex = args[0].id.split('-');
      if (elIndex.length !== 4) {
        // remove item drag from DOM
        if (args[0].parentNode) {
          args[0].outerHTML = '';
        }
        // reset drag status
        this.dragInfo.status = 'none';
        this.dragInfo.allowDrop = true;
        this.dragInfo.whichHandle = '';
        this.dragInfo.processIndex = undefined;
        this.dragInfo.isDragging = false;
        this.dragInfo.draggingMirror = null;
        return;
      }
      try {
        elIndex.forEach((item, index) => {
          elIndex[index] = Number.parseInt(elIndex[index]);
        });
        let dragItem = JSON.parse(JSON.stringify(
          this.tableData[elIndex[0]]
            [this.dragInfo.fromRight][elIndex[1]].machineData[elIndex[2]]));
        this.tableData[elIndex[0]][this.dragInfo.fromRight][elIndex[1]]
          .machineData[elIndex[2]] = null;
        this._changeDetectorRef.markForCheck();
        setTimeout(() => {
          try {
            this.tableData[elIndex[0]][this.dragInfo.fromRight][elIndex[1]]
              .machineData[elIndex[2]] = dragItem;
            this.dragInfo.fromRight = 'data';
            this._changeDetectorRef.markForCheck();
            if (this.dragInfo.dragMultiRight.isHasData) {
              setTimeout(() => {
                this.cleanDragMultipleRight(-1);
              });
            }
          } catch (er) {
            // empty
          }
        });
      } catch (er) {
        // empty
      }
      // remove item drag from DOM
      if (args[0].parentNode) {
        args[0].outerHTML = '';
      }
    }
    // reset drag status
    this.dragInfo.status = 'none';
    this.dragInfo.allowDrop = true;
    this.dragInfo.whichHandle = '';
    this.dragInfo.processIndex = undefined;
    this.dragInfo.isDragging = false;
    this.dragInfo.draggingMirror = null;
  }

  /**
   * Handle drop event
   */
  public onDrop(args) {
    if (!this.dragInfo.allowDrop) {
      return;
    }
    if (args[0].id === 'maintenanceBtn' && (!args[1] || !args[1].id)) {
      return;
    }
    if (args[0].id === 'maintenanceBtn') {
      if (args[1].getElementsByClassName('gu-transit').length) {
        args[0] = args[1].getElementsByClassName('gu-transit')[0];
      }
    }
    // detect table where drop
    const typeId = ['print-schedule', 'neck-label-schedule', 'finishing-schedule'];
    const typeData = ['data', 'neckData', 'finishData'];
    // drop to days tab
    if (args[1] && args[1].id.includes('days-tab')) {
      let elIndex = args[0].id.split('-');
      const dropTabIndex = parseInt(args[1].id.split('-')[2], 10);
      let isDragToLateTab = dropTabIndex === 0 && this.lateJobData.length;
      if (!elIndex.length ||
        dropTabIndex === this.daysTab.findIndex((d) => d.isActive) || isDragToLateTab) {
        return;
      }
      elIndex.forEach((item, index) => {
        elIndex[index] = Number.parseInt(elIndex[index]);
      });
      let dropFrom = typeId.indexOf(args[2].id);
      let reASModel = {
        printDateOnUtc: undefined,
        vendorId: undefined,
        machineId: undefined,
        type: undefined
      };
      reASModel.type = dropFrom;
      if (this.tableData[elIndex[0]][typeData[dropFrom]][elIndex[1]]
          .machineData[elIndex[2]].vendorId) {
        reASModel.vendorId = this.tableData[elIndex[0]][typeData[dropFrom]][elIndex[1]]
        .machineData[elIndex[2]].vendorId;
      } else {
        reASModel.machineId = this.tableData[elIndex[0]][typeData[dropFrom]][elIndex[1]]
        .machineData[elIndex[2]].machineId;
      }
      reASModel.printDateOnUtc = new Date(this.daysTab[dropTabIndex].date.getTime());
      reASModel.printDateOnUtc.setHours(12, 0, 0);
      reASModel.printDateOnUtc = moment(reASModel.printDateOnUtc).format('YYYY-MM-DDTHH:mm:ss');
      // make message
      const typeName = ['Print', 'Neck label', 'Finishing'];
      let dragFrDate = this.daysTab[this.daysTab.findIndex((d) => d.isActive)].date;
      if (!dragFrDate) {
        dragFrDate = this.tableData[elIndex[0]].date;
      }
      const mess = `${typeName[dropFrom]} schedule item successfully moved from 
      ${this.tableData[elIndex[0]][typeData[dropFrom]][elIndex[1]].machineName} on 
      ${moment(dragFrDate).format('M/D')} to
      ${this.tableData[elIndex[0]][typeData[dropFrom]][elIndex[1]].machineName} on 
      ${moment(reASModel.printDateOnUtc).format('M/D')}.`;
      // single drag
      if (!this.dragInfo.dragMultiRight.isHasData) {
        // call api
        this._schedulerSv.reassignSchedule(
          this.tableData[elIndex[0]][typeData[dropFrom]][elIndex[1]]
            .machineData[elIndex[2]].id, reASModel)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              this._toastrService.success(mess, 'Success');
              this.getSchedulesData();
              this.getTobeScheduleData(this.tableConfig.currentPage - 1);
              this.getLateJobData();
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      } else {
        switch (dropFrom) {
          case 0:
            reASModel = Object.assign(
              reASModel, {schedulerIds: this.dragInfo.dragMultiRight.print}
            );
            break;
          case 1:
            reASModel = Object.assign(
              reASModel, {schedulerIds: this.dragInfo.dragMultiRight.neckLB}
            );
            break;
          case 2:
            let dropMachine = this.machineList.find(
              (m) => m.id === reASModel.vendorId && m.name === 'TSC'
            );
            if (dropMachine) {
              reASModel = Object.assign(
                reASModel, {schedulerIds: this.dragInfo.dragMultiRight.finishingProcess}
              );
              dropFrom++;
            } else {
              reASModel = Object.assign(
                reASModel, {schedulerIds: this.dragInfo.dragMultiRight.finishing}
              );
            }
            break;
          default:
            break;
        }
        // call api
        this._schedulerSv.reassignMultiToDate(reASModel)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              this._toastrService.success(mess, 'Success');
              this.getSchedulesData();
              this.getTobeScheduleData(this.tableConfig.currentPage - 1);
              this.getLateJobData();
              this.cleanDragMultipleRight(dropFrom);
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
      return;
    }
    // detect machine where drop
    let siblingIndex = args[0].previousElementSibling;
    if (siblingIndex) {
      siblingIndex = siblingIndex.id.split('-');
      siblingIndex.forEach((item, index) => {
        siblingIndex[index] = Number.parseInt(siblingIndex[index]);
      });
    } else {
      return;
    }
    this.dragInfo.status = 'dropped';
    // maintenance job
    if (args[0].id === 'maintenanceBtn') {
      // init model and set data model
      let params: HttpParams = new HttpParams();
      let model = {
        printDateOnUtc: undefined,
        printLocationId: undefined,
        neckLabelId: undefined,
        orderDetailId: undefined,
        vendorId: undefined,
        machineId: undefined,
        type: undefined,
        qty: 0,
        printColors: undefined,
        listReArranges: [],
        isMaintenanceJob: true,
        finishingSchedulers: []
      };
      model.printDateOnUtc = new Date(this.tableData[siblingIndex[0]].date.getTime());
      model.printDateOnUtc.setHours(12, 0, 0);
      model.printDateOnUtc = moment(model.printDateOnUtc).format('YYYY-MM-DDTHH:mm:ss');
      model.type = typeId.indexOf(args[1].id);
      if (model.type === 1 || model.type === 2) { // neck schedule || finish schedule
        model.vendorId = siblingIndex[3];
      }
      if (model.type === 0) { // print schedule
        // find first tr of machine
        let firstIndex = args[0].previousElementSibling.id.split('-');
        let trList = args[1].getElementsByTagName('tr');
        let chosenElef = args[0].previousElementSibling;
        for (let i = 0; i < trList.length; i++) {
          if (trList[i].id) {
            let trIndex = trList[i].id.split('-');
            if (trIndex[0] === firstIndex[0] &&
              trIndex[1] === firstIndex[1] &&
              trIndex[2] === '0' &&
              !trList[i].classList.contains('gu-transit')) {
              chosenElef = trList[i];
            }
          }
        }
        let printIndex =
              this.printList.findIndex(
                (p) => p.id === siblingIndex[3] &&
                  chosenElef.cells[0] &&
                  p.name === chosenElef.cells[0].innerText
              );
        if (printIndex > -1 && this.printList[printIndex].isMachine) {
          model.machineId = siblingIndex[3];
        } else {
          model.vendorId = siblingIndex[3];
        }
      }
      // add special task to finishing tsc vendor
      if (model.type === 2 &&
        this.tableData[siblingIndex[0]]
          .finishData[siblingIndex[1]].machineName.toLowerCase() === 'tsc') {
        model.finishingSchedulers.push({
          orderDetailFinishingProcessId: this.tableData[siblingIndex[0]]
            .finishData[siblingIndex[1]].machineData[siblingIndex[2]].orderDetailFinishingProcessId
        });
      }
      // rearrange
      const dropPlace = typeId.indexOf(args[1].id);
      this.tableData[siblingIndex[0]][typeData[dropPlace]][siblingIndex[1]]
        .machineData.forEach((item, index) => {
        if (item) {
          model.listReArranges.push(item.id);
          if (index === siblingIndex[2]) {
            model.listReArranges.push(
              -1
            );
          }
        }
      });
      model.listReArranges.forEach((i, index) => {
        if (!i && i !== 0) {
          model.listReArranges.splice(index, 1);
        }
      });
      // call api
      // schedule
      this._schedulesPrintService.addStyle2Scheduler(model, params)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this._toastrService.success(resp.message, 'Success');
            this.getSchedulesData();
            // update tobe schedule table
            this.getTobeScheduleData(this.tableConfig.currentPage - 1);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
      // remove item drag from DOM
      if (args[0].parentNode) {
        args[0].outerHTML = '';
      }
      this._changeDetectorRef.markForCheck();
      return;
    }
    // drag from right panel
    if (args[0].id && args[0].id.includes('-')) {
      // prevent drag from right to others table
      if (args[1].id !== args[2].id) {
        return;
      }
      let elIndex = args[0].id.split('-');
      elIndex.forEach((item, index) => {
        elIndex[index] = Number.parseInt(elIndex[index]);
      });
      let dropPlace = typeId.indexOf(args[1].id);
      // rearrange
      if (elIndex[1] === siblingIndex[1]) {
        let listSchedulerIds = [];
        this.tableData[siblingIndex[0]][typeData[dropPlace]][siblingIndex[1]]
          .machineData.forEach((item, index) => {
          if (index !== elIndex[2]) {
            listSchedulerIds.push(item.id);
          }
          if (index === siblingIndex[2]) {
            listSchedulerIds.push(
              this.tableData[elIndex[0]][typeData[dropPlace]][elIndex[1]]
                .machineData[elIndex[2]].id
            );
          }
        });
        listSchedulerIds.forEach((i, index) => {
          if (!i && i !== 0) {
            listSchedulerIds.splice(index, 1);
          }
        });
        // call api
        this._schedulerSv.rearrangeSchedule(listSchedulerIds)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              this._toastrService.success(resp.message, 'Success');
              this.getSchedulesData();
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      } else {
        let reASModel = {
          printDateOnUtc: undefined,
          vendorId: undefined,
          machineId: undefined,
          type: undefined,
          listReArranges: []
        };
        reASModel.printDateOnUtc = new Date(this.tableData[siblingIndex[0]].date.getTime());
        reASModel.printDateOnUtc.setHours(12, 0, 0);
        reASModel.printDateOnUtc = moment(reASModel.printDateOnUtc).format('YYYY-MM-DDTHH:mm:ss');
        reASModel.type = dropPlace;
        // set machineId if drop to machine
        // set vendorId if drop to vendor
        if (dropPlace === 0) {
          // find first tr of machine
          let firstIndex = args[0].previousElementSibling.id.split('-');
          let trList = args[1].getElementsByTagName('tr');
          let chosenElef = args[0].previousElementSibling;
          for (let i = 0; i < trList.length; i++) {
            if (trList[i].id) {
              let trIndex = trList[i].id.split('-');
              if (trIndex[0] === firstIndex[0] &&
                trIndex[1] === firstIndex[1] &&
                trIndex[2] === '0' &&
                !trList[i].classList.contains('gu-transit')) {
                chosenElef = trList[i];
              }
            }
          }
          let printIndex =
                this.printList.findIndex(
                  (p) => p.id === siblingIndex[3] &&
                    chosenElef.cells[0] &&
                    p.name === chosenElef.cells[0].innerText
                );
          if (printIndex > -1 && this.printList[printIndex].isMachine) {
            reASModel.machineId = siblingIndex[3];
          } else {
            reASModel.vendorId = siblingIndex[3];
          }
          // multiple re-assign
          if (this.dragInfo.dragMultiRight.isHasData) {
            reASModel = Object.assign(
              reASModel, {schedulerIds: this.dragInfo.dragMultiRight.print}
            );
          }
        } else {
          reASModel.vendorId = siblingIndex[3];
          // multiple re-assign
          if (this.dragInfo.dragMultiRight.isHasData) {
            if (dropPlace === 1) {
              reASModel = Object.assign(
                reASModel, {schedulerIds: this.dragInfo.dragMultiRight.neckLB}
              );
            }
            let dropMachine = this.machineList.find((m) => m.id === reASModel.vendorId);
            if (dropPlace === 2 && dropMachine.name === 'TSC') {
              reASModel = Object.assign(
                reASModel, {schedulerIds: this.dragInfo.dragMultiRight.finishingProcess}
              );
            }
            if (dropPlace === 2 && dropMachine.name !== 'TSC') {
              reASModel = Object.assign(
                reASModel, {schedulerIds: this.dragInfo.dragMultiRight.finishing}
              );
              dropPlace++;
            }
          }
        }
        // single re-assign
        if (!this.dragInfo.dragMultiRight.isHasData) {
          // get list schedule by order
          this.tableData[siblingIndex[0]][typeData[dropPlace]][siblingIndex[1]]
            .machineData.forEach((item, index) => {
              if (item) {
                reASModel.listReArranges.push(item.id);
                if (index === siblingIndex[2]) {
                  reASModel.listReArranges.push(
                    this.tableData[elIndex[0]][typeData[dropPlace]][elIndex[1]]
                      .machineData[elIndex[2]].id
                  );
                }
              }
            });
          // call api
          this._schedulerSv.reassignSchedule(
            this.tableData[elIndex[0]][typeData[dropPlace]][elIndex[1]]
              .machineData[elIndex[2]].id, reASModel)
            .subscribe((resp: ResponseMessage<any>) => {
              if (resp.status) {
                this._toastrService.success(resp.message, 'Success');
                this.getSchedulesData();
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        } else { // multiple re-assign
          this._schedulerSv.reassignMultiToMachine(reASModel)
            .subscribe((resp: ResponseMessage<any>) => {
              if (resp.status) {
                this._toastrService.success(resp.message, 'Success');
                this.cleanDragMultipleRight(dropPlace);
                this.getSchedulesData();
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
      }
      return;
    }
    // get drag item ID if drag from left
    let dragItemId = Number.parseInt(args[0].id);
    // prevent drop print location to neck label and finish schedule
    let invalid = false;
    if (!this.tableTobeScheduleData.data[dragItemId].neckLabelSchedule
      && args[1].id === 'neck-label-schedule') {
      invalid = true;
    }
    if (!this.tableTobeScheduleData.data[dragItemId].finishingSchedule
      && args[1].id === 'finishing-schedule') {
      invalid = true;
    }
    // prevent drop when already scheduled
    if (this.tableTobeScheduleData.data[dragItemId].printSchedule.units ===
      this.tableTobeScheduleData.data[dragItemId].productionQty &&
      args[1].id === 'print-schedule' &&
      !this.tableTobeScheduleData.data[dragItemId].printSchedule.shortageQty) {
      invalid = true;
    }
    if (this.tableTobeScheduleData.data[dragItemId].neckLabelSchedule &&
      this.tableTobeScheduleData.data[dragItemId].neckLabelSchedule.units ===
      this.tableTobeScheduleData.data[dragItemId].productionQty &&
      args[1].id === 'neck-label-schedule' &&
      !this.tableTobeScheduleData.data[dragItemId].neckLabelSchedule.shortageQty) {
      invalid = true;
    }
    if (this.tableTobeScheduleData.data[dragItemId].finishingSchedule &&
      this.tableTobeScheduleData.data[dragItemId].finishingSchedule.units ===
      this.tableTobeScheduleData.data[dragItemId].finishedQty &&
      args[1].id === 'finishing-schedule' &&
      !this.tableTobeScheduleData.data[dragItemId].finishingSchedule.shortageQty) {
      invalid = true;
    }
    // prevent drop when wrong handle
    if (args[1].id === 'print-schedule' && this.dragInfo.whichHandle !== 'print-handle') {
      invalid = true;
    }
    if (args[1].id === 'neck-label-schedule' && this.dragInfo.whichHandle !== 'neck-handle') {
      invalid = true;
    }
    if (args[1].id === 'finishing-schedule' && this.dragInfo.whichHandle !== 'finish-handle') {
      invalid = true;
    }
    // hide preview
    if (invalid) {
      // remove item drag from DOM
      if (args[0].parentNode) {
        args[0].outerHTML = '';
      }
      return;
    }

    // drag left panel to right panel
    // init model and set data model
    let params: HttpParams = new HttpParams()
      .set('orderId', this.tableTobeScheduleData.data[dragItemId].orderId);
    let model = {
      printDateOnUtc: undefined,
      printSchedulers: [],
      neckLabelSchedulers: [],
      finishingSchedulers: [],
      vendorId: undefined,
      machineId: undefined,
      type: undefined,
      printColors: undefined,
      listReArranges: []
    };
    model.printDateOnUtc = new Date(this.tableData[siblingIndex[0]].date.getTime());
    model.printDateOnUtc.setHours(12, 0, 0);
    model.printDateOnUtc = moment(model.printDateOnUtc).format('YYYY-MM-DDTHH:mm:ss');
    model.type = typeId.indexOf(args[1].id);
    let curUnit = 0;
    if (this.tableTobeScheduleData.data[dragItemId].neckLabelSchedule
      && model.type === 1) { // neck schedule
      if (!this.dragInfo.dragMulti.neckLB.length) {
        this.dragInfo.dragMulti.neckLB.push(dragItemId);
      }
      this.dragInfo.dragMulti.neckLB.forEach((nId) => {
        let neckItem = {neckLabelId: 0, qty: 0};
        neckItem.neckLabelId =
          this.tableTobeScheduleData.data[nId].neckLabelSchedule.neckLabelId;
        curUnit = this.tableTobeScheduleData.data[nId].neckLabelSchedule.units;
        if (this.tableTobeScheduleData.data[nId].neckLabelSchedule.shortageQty) {
          curUnit -= this.tableTobeScheduleData.data[nId].neckLabelSchedule.shortageQty;
        }
        neckItem.qty = this.tableTobeScheduleData.data[nId].productionQty - curUnit;
        model.neckLabelSchedulers.push(neckItem);
      });
      model.vendorId = siblingIndex[3];
    }
    if (model.type === 2) { // finish schedule
      model.vendorId = siblingIndex[3];
      if (!this.dragInfo.dragMulti.finishing.length &&
        !this.dragInfo.dragMulti.finishingProcess.length &&
        typeof this.dragInfo.processIndex !== 'number') {
        this.dragInfo.dragMulti.finishing.push(dragItemId);
      }
      if (!this.dragInfo.dragMulti.finishing.length &&
        !this.dragInfo.dragMulti.finishingProcess.length &&
        typeof this.dragInfo.processIndex === 'number') {
        this.dragInfo.dragMulti.finishingProcess.push(
          {id: dragItemId, index: this.dragInfo.processIndex}
        );
      }
      // normal finishing
      if (this.dragInfo.dragMulti.finishing.length &&
        typeof this.dragInfo.processIndex !== 'number') {
        this.dragInfo.dragMulti.finishing.forEach((fId) => {
          let finishItem = {
            orderDetailId: 0,
            qty: 0
          };
          finishItem.orderDetailId = this.tableTobeScheduleData.data[fId].orderDetailId;
          curUnit = this.tableTobeScheduleData.data[fId].finishingSchedule.units;
          if (this.tableTobeScheduleData.data[fId].finishingSchedule.shortageQty) {
            curUnit -= this.tableTobeScheduleData.data[fId].finishingSchedule.shortageQty;
          }
          finishItem.qty = this.tableTobeScheduleData.data[fId].finishedQty - curUnit;
          model.finishingSchedulers.push(finishItem);
        });
      }
      if (this.dragInfo.dragMulti.finishingProcess.length &&
        typeof this.dragInfo.processIndex === 'number') { // process finishing
        this.dragInfo.dragMulti.finishingProcess.forEach((f) => {
          let finishItem = {
            orderDetailId: 0,
            qty: 0,
            orderDetailFinishingProcessId: 0
          };
          finishItem.orderDetailId = this.tableTobeScheduleData.data[f.id].orderDetailId;
          curUnit = this.tableTobeScheduleData.data[f.id].finishingSchedule
            .processes[f.index].scheduledQty;
          finishItem.orderDetailFinishingProcessId =
            this.tableTobeScheduleData.data[f.id].finishingSchedule
              .processes[f.index].orderDetailFinishingProcessId;
          finishItem.qty = this.tableTobeScheduleData.data[f.id].finishedQty - curUnit;
          model.finishingSchedulers.push(finishItem);
        });
      }
    }
    if (model.type === 0) { // print schedule
      // find first tr of machine
      let firstIndex = args[0].previousElementSibling.id.split('-');
      let trList = args[1].getElementsByTagName('tr');
      let chosenElef = args[0].previousElementSibling;
      for (let i = 0; i < trList.length; i++) {
        if (trList[i].id) {
          let trIndex = trList[i].id.split('-');
          if (trIndex[0] === firstIndex[0] &&
            trIndex[1] === firstIndex[1] &&
            trIndex[2] === '0' &&
            !trList[i].classList.contains('gu-transit')) {
            chosenElef = trList[i];
          }
        }
      }
      let printIndex =
            this.printList.findIndex(
              (p) => p.id === siblingIndex[3] &&
                chosenElef.cells[0] &&
                p.name === chosenElef.cells[0].innerText
            );
      if (printIndex > -1 && this.printList[printIndex].isMachine) {
        model.machineId = siblingIndex[3];
      } else {
        model.vendorId = siblingIndex[3];
      }
      if (!this.dragInfo.dragMulti.print.length) {
        this.dragInfo.dragMulti.print.push(dragItemId);
      }
      this.dragInfo.dragMulti.print.forEach((pId) => {
        let printItem = {printLocationId: 0, qty: 0};
        printItem.printLocationId = this.tableTobeScheduleData.data[pId].printLocationId;
        curUnit = this.tableTobeScheduleData.data[pId].printSchedule.units;
        if (this.tableTobeScheduleData.data[pId].printSchedule.shortageQty) {
          curUnit -= this.tableTobeScheduleData.data[pId].printSchedule.shortageQty;
        }
        printItem.qty = this.tableTobeScheduleData.data[pId].productionQty - curUnit;
        model.printSchedulers.push(printItem);
      });
      model.printColors = this.tableTobeScheduleData.data[dragItemId].printColors;
    }
    // rearrange
    const dropPlace = typeId.indexOf(args[1].id);
    this.tableData[siblingIndex[0]][typeData[dropPlace]][siblingIndex[1]]
      .machineData.forEach((item, index) => {
      if (item) {
        model.listReArranges.push(item.id);
        if (index === siblingIndex[2]) {
          model.listReArranges.push(
            -1
          );
        }
      }
    });
    model.listReArranges.forEach((i, index) => {
      if (!i && i !== 0) {
        model.listReArranges.splice(index, 1);
      }
    });
    // call api
    // schedule
    this._schedulesPrintService.addStyle2Scheduler(model, params)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
          this.getSchedulesData();
          // update tobe schedule table
          if (model.type === 2 && model.finishingSchedulers[0].orderDetailFinishingProcessId) {
            model.type++;
          }
          this.getTobeScheduleData(this.tableConfig.currentPage - 1, false, model.type);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    // remove item drag from DOM
    if (args[0].parentNode) {
      args[0].outerHTML = '';
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Prevent drop to invalid position
   */
  public validateDrop(el, target, source, sibling) {
    // scroll down if el close bottom
    if (el && el.id.length >= 7 && el.id.includes('-')) {
      if (sibling) {
        let rect = sibling.getBoundingClientRect();
        if (window.innerHeight - rect.top < 220) {
          this.scrollListQuery.last.scrollTo(
            0,
            this.scrollListQuery.last.directiveRef.geometry().y + 30
          );
        }
        if (window.innerHeight - rect.top > 480) {
          this.scrollListQuery.last.scrollTo(
            0,
            this.scrollListQuery.last.directiveRef.geometry().y - 30
          );
        }
      }
    }
    // prevent drag back to tobe schedule
    if (!target.id && this.dragInfo.status === 'scheduled') {
      this._dragulaService.find('bag-one').drake.cancel();
      setTimeout(() => {
        // remove item drag from DOM
        if (sibling && sibling.parentNode) {
          let idCount = 0;
          let trList = sibling.parentNode.getElementsByTagName('tr');
          // tslint:disable-next-line:prefer-for-of
          for (let i = 0; i < trList.length; i++) {
            if (trList[i].id === sibling.id) {
              idCount++;
            }
          }
          if (idCount > 1) {
            sibling.outerHTML = '';
          }
        }
      });
      this._changeDetectorRef.markForCheck();
      return false;
    }
    // prevent drop to maintenance btn
    if (el.id === 'maintenanceBtn' && !target.id) {
      return false;
    }
    return true;
  }

  /**
   * Prevent drag on invalid row
   */
  public validDrag(el, container, handle) {
    // avoid when update runtime
    if (this.isRuntimeOpen) {
      return false;
    }
    this.dragInfo.processIndex = undefined;
    if (handle.parentElement && handle.parentElement.className.includes('sub-move')) {
      this.dragInfo.processIndex = Number.parseInt(handle.parentElement.id);
    }
    if (handle.dataset.index) {
      this.dragInfo.processIndex = Number.parseInt(handle.dataset.index);
    }
    if (handle.parentElement && handle.parentElement.dataset.index) {
      this.dragInfo.processIndex = Number.parseInt(handle.parentElement.dataset.index);
    }
    let handleId = ['print-handle', 'neck-handle', 'finish-handle'];
    let classCell = ['print-cell', 'neckLB-cell', 'finishing-cell'];
    classCell.forEach((c, index) => {
      if (handle.className.includes(c) ||
      (handle.parentElement && handle.parentElement.className.includes(c))) {
        this.dragInfo.whichHandle = handleId[index];
      }
    });
    if (handleId.indexOf(handle.id) !== -1) {
      this.dragInfo.whichHandle = handle.id;
    }
    return handle.className.includes('fa-arrows') ||
      handle.id === 'maintenanceBtn' ||
      handle.className.includes('selected-cell') ||
      (handle.parentElement && handle.parentElement.className.includes('selected-cell'));
  }

  public exportOrder(exportType: string) {
    // this._toastrService.info('Not support yet!', 'Info');
    // if (exportType === 'pdf') {
    //   let curDate = new Date();
    //   let params: HttpParams = new HttpParams()
    //     .set('printDateFromOnUtc', moment.utc(curDate).format('YYYY-MM-DDTHH:mm:ss'))
    //     .set('hourOffset', (-1 * curDate.getTimezoneOffset() / 60).toString())
    //     .set('keyword', this.searchObj.keyword)
    //     .set('customerPoId', this.searchObj['customerPoId'])
    //     .set('retailerPoId', this.searchObj['retailerPoId'])
    //     .set('customer', this.searchObj['customer'])
    //     .set('styleName', this.searchObj['styleName'])
    //     .set('partnerStyle', this.searchObj['partnerStyle'])
    //     .set('cancelDateFromOnUtc', this.searchObj['cancelDateFromOnUtc'])
    //     .set('cancelDateToOnUtc', this.searchObj['cancelDateToOnUtc']);
    //
    //   switch (this.searchObj['printDate']) {
    //     case 'Yesterday':
    //       params = params.set('printDateFromOnUtc', moment.utc(curDate)
    // .format('YYYY-MM-DDTHH:mm:ss'));
    //       break;
    //     case 'Today':
    //       break;
    //     case 'This Week':
    //       params = params.set('printDateFromOnUtc',
    //        moment.utc(this.tableData[0].date).format('YYYY-MM-DDTHH:mm:ss'));
    //       params = params.set('printDateToOnUtc',
    //        moment.utc(this.tableData[6].date).format('YYYY-MM-DDTHH:mm:ss'));
    //       break;
    //     case 'Custom':
    //         params = params.set('printDateFromOnUtc',
    //          moment.utc(this.searchObj['schedDateFromOnUtc']).format('YYYY-MM-DDTHH:mm:ss'));
    //         params = params.set('printDateToOnUtc',
    //          moment.utc(this.searchObj['schedDateToOnUtc']).format('YYYY-MM-DDTHH:mm:ss'));
    //       break;
    //     default:
    //       let sixDays = new Date();
    //       sixDays.setDate(curDate.getDate() + 6);
    //       params = params.set('printDateToOnUtc', moment.utc(sixDays)
    // .format('YYYY-MM-DDTHH:mm:ss'));
    //       break;
    //   }
    //
    //   if (this.searchObj['machine'] && this.searchObj['machine'].length) {
    //     params = params.set('machines', this.searchObj['machine'].toString());
    //   }
    //
    //   this._schedulesPrintService.exportSchedulesData(params)
    //   .subscribe((resp: any): void => {
    //     if (resp.status) {
    //       let data = resp;
    //       let values = data.headers.get('Content-Disposition');
    //       let filename = values.split(';')[1].trim().split('=')[1];
    // // remove " from file name
    // filename = filename.replace(/"/g, '');
    //       let blob;
    //       if (exportType === 'pdf') {
    //         blob = new Blob([(<any> data).body],
    //           {type: 'application/pdf'}
    //         );
    //       }
    //       // else if (exportType === 'xlsx') {
    //       //   blob = new Blob([(<any> data).body],
    //       //     {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
    //       //   );
    //       // }
    //       FileSaver.saveAs(blob, filename);
    //     }
    //   });
    // }
  }

  /**
   * Map data to Machine or Vendor list
   * @param desList Machine or Vendor list
   * @param type print, necklabel or finish schedule
   * @param data data to map
   */
  public mapData2Machine(desList, type, data) {
    let rowData = [];
    let sample = [null];
    let totals = 0;
    let typeId = 'machineId';
    desList.forEach((item) => {
      // get data depend on vendorId if vendor
      if (!item.isMachine) {
        typeId = 'vendorId';
      }
      rowData.push(
        {
          machineName: item.name,
          machineId: item.id,
          isTscMachine: item.isMachine,
          machineData: data[type].filter((m) => m[typeId] === item.id),
          sumQty: 0,
          sumRunTime: 0
        }
      );
      if (rowData[rowData.length - 1].machineData.length) {
        // sort by order
        if (type !== 'finishingSchedules' ||
          rowData[rowData.length - 1].machineName.toLowerCase() !== 'tsc') {
          rowData[rowData.length - 1].machineData =
            _.sortBy(rowData[rowData.length - 1].machineData, 'orderNum');
        }
        // calculate sum qty
        rowData[rowData.length - 1].machineData.forEach((m) => {
          if (m) {
            rowData[rowData.length - 1].sumQty += m.scheduledQty;
            if (m.runtime) {
              rowData[rowData.length - 1].sumRunTime +=
              Number.parseFloat(m.runtime) + m.setuptime / 60;
              m.runtime = m.runtime.toFixed(2);
            } else {
              m.runtime = '0.0';
            }
          }
        });
        // calculate totals pieces
        totals += rowData[rowData.length - 1].sumQty;
        // fixed sum run time
        rowData[rowData.length - 1].sumRunTime =
          rowData[rowData.length - 1].sumRunTime.toFixed(2);
      } else {
        rowData[rowData.length - 1].machineData = sample;
        // fixed sum run time
        rowData[rowData.length - 1].sumRunTime =
          rowData[rowData.length - 1].sumRunTime.toFixed(2);
      }
      typeId = 'machineId';
    });
    return [totals, rowData];
  }

  public changeFontSize(fontSize) {
    // deactive previous font size
    let fontSizeId = this.fontSizeData.indexOf(this.myConfigStyle['font-size']);
    this.fontSizeClass[this.fontSizeIndex[fontSizeId]] = false;

    // active new font size
    this.myConfigStyle['font-size'] = fontSize;
    this._localStorageService.set('fontSize_Scheduler', fontSize);
    fontSizeId = this.fontSizeData.indexOf(fontSize);
    this.fontSizeClass[this.fontSizeIndex[fontSizeId]] = true;
  }

  public onTobeScroll(event) {
    let fixedPoint = 90;
    if (event.target.scrollTop > fixedPoint &&
      (!this.fixedHeader)) {
      this.fixedHeader = true;
      setTimeout(() => {
        for (let j = 0; j < 10; j++) {
          let tableW = 0;
          let fixedHE;
          if (document.getElementsByClassName('fixedHeader')[0]) {
            fixedHE = document.getElementsByClassName('fixedHeader')[0].getElementsByTagName('th');
            let tobeTable = document.querySelector('.to-be-schedule-panel .table');
            let bodyE = tobeTable.getElementsByTagName('td');
            for (let i = 0; i < fixedHE.length; i++) {
              let headerW = Number.parseFloat(
                window.getComputedStyle(fixedHE[i], null).getPropertyValue('width')
              );
              let bodyW = Number.parseFloat(
                window.getComputedStyle(bodyE[i], null).getPropertyValue('width')
              );
              tableW += bodyW;
              if (headerW !== bodyW && fixedHE[i]) {
                if (!i) {
                  bodyW -= 1;
                }
                fixedHE[i]['style'].width = bodyW + 'px';
                this._changeDetectorRef.markForCheck();
              }
            }
            document.getElementsByClassName('fixedHeader')[0]['style'].top
              = (this.tobeTableToTop.height + 246) - 82 + 'px';
            document.getElementsByClassName('fixedHeader')[0]['style'].visibility = 'visible';
          }
        }
      }, 0);
      // let tobeTable = document.querySelector('.to-be-schedule-panel .table');
      // let tobeTableW = Number.parseFloat(
      //   window.getComputedStyle(tobeTable, null).getPropertyValue('width')
      // );
      // setTimeout(() => {
      //   document.getElementsByClassName('fixedHeader')[0]['style'].width = tobeTableW + 'px';
      // });
      this._changeDetectorRef.markForCheck();
    } else if (event.target.scrollTop <= fixedPoint &&
      this.fixedHeader) {
      this.fixedHeader = false;
      this._changeDetectorRef.markForCheck();
    }
  }

  public openModal(data, isFinishing?) {
    if (data.processStatus || data.isArchived) {
      return;
    }
    let modalRef = this._modalService.open(ConfigTscScheduledComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static'
    });

    modalRef.componentInstance.schedulerId = data.id;
    modalRef.componentInstance.orderId = data.orderId;
    if (isFinishing) {
      modalRef.componentInstance.isFinishing = isFinishing;
      modalRef.componentInstance.finishingProcess = data.finishingProcess;
      modalRef.componentInstance.processName = data.processName;
    }

    modalRef.result.then((res: any) => {
      if (res) {
        this.getSchedulesData();
        this.getTobeScheduleData(this.tableConfig.currentPage - 1);
      }
    }, (err) => {
      // if not, error
    });
  }

  public configRuntime(machineData) {
    if (this.isPageReadOnly || machineData.isArchived) {
      return;
    }
    let modalRef = this._modalService.open(RuntimeComponent, {
      keyboard: false,
      backdrop: 'static'
    });
    modalRef.componentInstance.schedulerId = machineData.id;
    modalRef.componentInstance.runtimeDetail = {
      scheduledQty: machineData.scheduledQty,
      avgPcsPerHrDefaults: machineData.avgPcsPerHrDefaults,
      avgPcsPerHrEstimated: machineData.avgPcsPerHrEstimated,
    };

    modalRef.result.then((res: any) => {
      if (res.status) {
        machineData.avgPcsPerHrDefaults = res.frm.avgPcsPerHrDefaults;
        machineData.avgPcsPerHrEstimated = res.frm.avgPcsPerHrEstimated;
        machineData.runtime = machineData.scheduledQty / res.frm.avgPcsPerHrEstimated;
        this.reCalculateData();
        this.recalLayout();
        this._changeDetectorRef.markForCheck();
      }
    }, (err) => {
      // if not, error
    });
  }

  public invalidQty(value, machineData) {
    if (value) {
      value = Number.parseInt(value);
    } else {
      return false;
    }
    if (machineData.totalScheduledQty - machineData.scheduledQty + value > machineData.units) {
      return machineData.units - (machineData.totalScheduledQty - machineData.scheduledQty);
    }
    return false;
  }

  public isMachineOrTsc(machineName): boolean {
    let printIndex = this.printList.findIndex((p) => p.name === machineName && p.isMachine);
    if (printIndex > -1 || machineName.toLowerCase() === 'tsc') {
      return true;
    }
    return false;
  }

  public removeDuplicate(data) {
    let tobeRemove = [];
    data.forEach((item, index) => {
      if (index < data.length - 1 && item.name === data[index + 1].name) {
        tobeRemove.push(index + 1);
      }
      item.originId = item.id;
      item.id = index + 1;
    });
    tobeRemove.forEach((item, index) => {
      data.splice(item - index, 1);
    });
    // move other to end of array
    this.moveSomethToEndArr(data, 'other');
  }

  public moveSomethToEndArr(data, something) {
    if (!data || !data.length) {
      return;
    }
    data
      .push(
        data
          .splice(
            data.findIndex((item) => item.name.toLowerCase() === something), 1
          )[0]
      );
  }

  public moveSomethToBeginArr(data, something) {
    if (!data || !data.length) {
      return;
    }
    data
      .unshift(
        data
          .splice(
            data.findIndex((item) => item.name.toLowerCase() === something), 1
          )[0]
      );
  }

  public recalLayout(firstTime?) {
    // determine distance from top to tobe table
    let tobeHead = document.getElementsByClassName('row pb-2 separate-border');
    if (tobeHead.length) {
      setTimeout(() => {
        this.tobeTableToTop = tobeHead[0].getBoundingClientRect();
        // if (firstTime) {
        //   this.tobeTableToTop.height += 10;
        // }
        // reset height of left and right panel
        let scheduleH = window.innerHeight - (this.tobeTableToTop.height + 195);
        document.getElementsByClassName('schedule-panel')[0]['style'].height =
          (scheduleH - 63) + 'px';
        document.getElementsByClassName('to-be-schedule-panel')[0]['style'].height =
          scheduleH + 'px';
        let fixedHeaderElef = document.getElementsByClassName('fixedHeader')[0];
        if (fixedHeaderElef) {
          fixedHeaderElef['style'].top
            = (this.tobeTableToTop.height + 246) - 82 + 'px';
        }
      });
    }
  }

  public formClick(e: MouseEvent) {
    if (e.toElement &&
      e.toElement.tagName !== 'BUTTON' &&
      !e.toElement.classList.contains('form-control') &&
      !e.toElement.classList.contains('icon-mydpcalendar') &&
      !e.toElement.classList.contains('selection')) {

      // let eventClick = new Event('click');
      // document.dispatchEvent(eventClick);
      this._changeDetectorRef.markForCheck();
    }
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event) {
    this.recalLayout();
  }

  public setDaysTab(index, resetScroll?) {
    // init days tab
    this.daysTab = [];
    this.tableDataOrigin.forEach((d) => {
      this.daysTab.push({
        isActive: false,
        date: d.date
      });
    });

    if (this.lateJobData.length && (!this.daysTab.length ||
      (this.daysTab.length && this.daysTab[0].date !== null))) {
      this.daysTab.unshift({isActive: false, date: null});
    }

    if (this.daysTab.length === 0) {
      return;
    }

    this.daysTab[index].isActive = true;
    if (this.daysTab[index].date !== null) {
      this.tableData = this.tableDataOrigin.filter(
        (d) => new Date(d.date).getTime() === this.daysTab[index].date.getTime()
      );
      this.isOnLateTab = false;
    } else {
      this.tableData = this.lateJobData;
      this.isOnLateTab = true;
    }
    setTimeout(() => {
      if (this.dragInfo.dragMultiRight.isHasData &&
        this.dragInfo.dragMultiRight.selectedOnTab === index) {
        this.cleanDragMultipleRight(-1);
      }
    });

    if (resetScroll) {
      this.scrollListQuery.last.scrollToTop(0);
    }
  }

  public onCollapse() {
    setTimeout(() => {
      this.recalLayout();
    }, 200);
  }

  public canDequeue(data) {
    let dequeue = true;
    if (data.printSchedule.units > 0) {
      dequeue = false;
    }
    if (data.neckLabelSchedule && data.neckLabelSchedule.units > 0) {
      dequeue = false;
    }
    if (data.finishingSchedule && (data.finishingSchedule.units > 0 ||
      data.finishingSchedule.processes)) {
      dequeue = false;
    }
    return dequeue;
  }

  public markedForScheduling(data) {
    this._orderMainSv
      .markedForScheduling(data.orderId, data.orderDetailId, data.printLocationId, false)
      .subscribe((resp) => {
        if (resp.status) {
          this.getTobeScheduleData(this.tableConfig.currentPage - 1);
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public configureProcesses(event, orderDetailId) {
    if (this.isPageReadOnly) {
      return;
    }
    let modalRef = this._modalService.open(ConfigureProcessesComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static'
    });
    modalRef.componentInstance.orderDetailId = orderDetailId;

    modalRef.result.then((res: any) => {
      if (res) {
        this.getTobeScheduleData(this.tableConfig.currentPage - 1, false);
        this.getSchedulesData();
      }
    }, (err) => {
      // if not, error
    });
    event.stopPropagation();
  }

  public groupFinishingProcess(isLateJob?: boolean) {
    this.tableData.forEach((dayData) => {
      if (dayData.finishData.length &&
        dayData.finishData[0].machineName === 'TSC' &&
        dayData.finishData[0].machineData[0] !== null) {
        let finishTscData = dayData.finishData[0].machineData;
        let groupData = _.groupBy(finishTscData, 'finishingProcess');
        finishTscData = [];
        Object.keys(groupData).forEach((p) => {
          finishTscData.push({
            isGroupRow: true,
            finishingProcess: p,
            processName: groupData[p][0] ? groupData[p][0]['processName'] : '',
            orderDetailFinishingProcessId:
              groupData[p][0] ? groupData[p][0]['orderDetailFinishingProcessId'] : '',
            isCustomProcess: groupData[p][0] ? groupData[p][0]['isCustomProcess'] : '',
          });
          groupData[p].forEach((mc) => {
            finishTscData.push(mc);
          });
        });
        dayData.finishData[0].machineData = finishTscData;
      }
    });
    if (!isLateJob) {
      this.tableDataOrigin = this.tableData.slice();
    } else {
      this.lateJobData = this.tableData.slice();
    }
  }

  public calculateByFinishProcess(data, processNumber) {
    let rs = {sum: 0, length: 1, hrsTotals: 0};
    if (!data.length) {
      return rs;
    }
    data.forEach((d) => {
      if (d && d.id && d.finishingProcess === processNumber) {
        rs.sum += d.scheduledQty;
        rs.length++;
        rs.hrsTotals += d.hrsNeeded;
      }
    });
    return rs;
  }

  // select cell to drag multiple
  public selectCellDragMulti(event, cell, type, processTable, processIndex) {
    let dataId = 0;
    if (cell.parentElement) {
      dataId = cell.parentElement.id;
    } else {
      return;
    }
    if (!processTable) {
      if (!cell.classList.contains('selected-cell') &&
        !cell.classList.contains('full-scheduled') &&
        !cell.classList.contains('null-scheduled')) {
        cell.classList.add('selected-cell');
        this.dragInfo.dragMulti[type].push(+dataId);
        this.dragInfo.dragMulti[type].sort();
      } else if (cell.classList.contains('selected-cell')) {
        cell.classList.remove('selected-cell');
        this.dragInfo.dragMulti[type] = this.dragInfo.dragMulti[type].filter((d) => d !== +dataId);
      }
    } else {
      let processTR =  processTable.getElementsByTagName('TR');
      if (!processTR[1].cells[processIndex].classList.contains('selected-cell') &&
        !processTR[1].cells[processIndex].classList.contains('full-scheduled')) {
        processTR[1].cells[processIndex].classList.add('selected-cell');
        processTR[2].cells[processIndex].classList.add('selected-cell');
        this.dragInfo.dragMulti[type].push({id: +dataId, index: processIndex});
      } else if (processTR[1].cells[processIndex].classList.contains('selected-cell')) {
        processTR[1].cells[processIndex].classList.remove('selected-cell');
        processTR[2].cells[processIndex].classList.remove('selected-cell');
        let unselectedIndex = this.dragInfo.dragMulti[type].findIndex(
          (d) => d.index === processIndex && d.id === +dataId
        );
        if (unselectedIndex > -1) {
          this.dragInfo.dragMulti[type].splice(unselectedIndex, 1);
        }
      }
    }
    event.stopPropagation();
  }

  // select cell to drag multiple on right panel
  public selectCellDragMultiRightPanel(event, cell, type, machineData) {
    // prevent select job has been started
    if (machineData.processStatus > 0) {
      return;
    }
    let dataId = 0;
    let schedulerId;
    if (cell.parentElement) {
      dataId = cell.parentElement.id;
    } else {
      return;
    }
    if (type === 'finish') {
      if (machineData.vendorName === 'TSC') {
        type = 'finishingProcess';
      } else {
        type = 'finishing';
      }
    }
    schedulerId = machineData.id;

    if (!cell.classList.contains('selected-cell') &&
      !cell.classList.contains('full-scheduled') &&
      !cell.classList.contains('null-scheduled')) {
      cell.classList.add('selected-cell');
      this.dragInfo.dragMultiRight[type].push(schedulerId);
      this.dragInfo.dragMultiRight[type + 'DOM'].push(dataId);
      // this.dragInfo.dragMultiRight[type].sort();
    } else if (cell.classList.contains('selected-cell')) {
      cell.classList.remove('selected-cell');
      this.dragInfo.dragMultiRight[type] =
        this.dragInfo.dragMultiRight[type].filter((d) => d !== schedulerId);
      this.dragInfo.dragMultiRight[type + 'DOM'] =
        this.dragInfo.dragMultiRight[type + 'DOM'].filter((d) => d !== dataId);
    }
    this.dragInfo.dragMultiRight.isHasData = false;
    Object.keys(this.dragInfo.dragMultiRight).forEach((k) => {
      if (this.dragInfo.dragMultiRight[k].length) {
        this.dragInfo.dragMultiRight.isHasData = true;
      }
    });
    if (this.dragInfo.dragMultiRight.isHasData && this.dragInfo.dragMultiRight.selectedOnTab < 0) {
      let activeIndex = this.daysTab.findIndex((d) => d.isActive);
      this.dragInfo.dragMultiRight.selectedOnTab = activeIndex;
    }
    if (!this.dragInfo.dragMultiRight.isHasData &&
      this.dragInfo.dragMultiRight.selectedOnTab >= 0) {
      this.dragInfo.dragMultiRight.selectedOnTab = -1;
    }
    event.stopPropagation();
  }

  public cleanDragMultiple(type) {
    switch (type) {
      case 0:
        this.dragInfo.dragMulti.print = [];
        break;
      case 1:
        this.dragInfo.dragMulti.neckLB = [];
        break;
      case 2:
        this.dragInfo.dragMulti.finishing = [];
        break;
      case 3:
        this.dragInfo.dragMulti.finishingProcess = [];
        break;
      default:
        break;
    }
    Object.keys(this.dragInfo.dragMulti).forEach((drag, index) => {
      if (drag !== 'finishingProcess') {
        this.dragInfo.dragMulti[drag].forEach((dId) => {
          let tobeRow = document.getElementById(dId.toString());
          if (tobeRow && tobeRow['cells'].length) {
            tobeRow['cells'][tobeRow['cells'].length - 3 + index].classList.add('selected-cell');
          }
        });
      } else {
        this.dragInfo.dragMulti[drag].forEach((d) => {
          let tobeRow = document.getElementById(d.id.toString());
          if (tobeRow && tobeRow['cells'].length) {
            let processTR =
              tobeRow['cells'][tobeRow['cells'].length - 1].getElementsByTagName('TR');
            processTR[1].cells[d.index].classList.add('selected-cell');
            processTR[2].cells[d.index].classList.add('selected-cell');
          }
        });
      }
    });
  }

  public cleanDragMultipleRight(type) {
    switch (type) {
      case 0:
        this.dragInfo.dragMultiRight.print = [];
        this.dragInfo.dragMultiRight.printDOM = [];
        break;
      case 1:
        this.dragInfo.dragMultiRight.neckLB = [];
        this.dragInfo.dragMultiRight.neckLBDOM = [];
        break;
      case 2:
        this.dragInfo.dragMultiRight.finishing = [];
        this.dragInfo.dragMultiRight.finishingDOM = [];
        break;
      case 3:
        this.dragInfo.dragMultiRight.finishingProcess = [];
        this.dragInfo.dragMultiRight.finishingProcessDOM = [];
        break;
      case 4:
        this.dragInfo.dragMultiRight.print = [];
        this.dragInfo.dragMultiRight.printDOM = [];
        this.dragInfo.dragMultiRight.neckLB = [];
        this.dragInfo.dragMultiRight.neckLBDOM = [];
        this.dragInfo.dragMultiRight.finishing = [];
        this.dragInfo.dragMultiRight.finishingDOM = [];
        this.dragInfo.dragMultiRight.finishingProcess = [];
        this.dragInfo.dragMultiRight.finishingProcessDOM = [];
      default:
        break;
    }

    this.dragInfo.dragMultiRight.isHasData = false;
    Object.keys(this.dragInfo.dragMultiRight).forEach((drag) => {
      if (this.dragInfo.dragMultiRight[drag].length) {
        this.dragInfo.dragMultiRight.isHasData = true;
      }
      if (drag.includes('DOM')) {
        this.dragInfo.dragMultiRight[drag].forEach((dId) => {
          let scheduleRow = document.getElementById(dId.toString());
          let offsetCell = 1;
          if (drag.includes('print')) {
            offsetCell = 2;
          }
          if (scheduleRow && scheduleRow['cells'].length) {
            if (scheduleRow['cells'][scheduleRow['cells'].length - 1]
              .classList.contains('last-td')) {
              offsetCell++;
            }
            scheduleRow['cells'][scheduleRow['cells'].length - offsetCell]
              .classList.add('selected-cell');
          }
        });
      }
    });
    if (!this.dragInfo.dragMultiRight.isHasData &&
      this.dragInfo.dragMultiRight.selectedOnTab >= 0) {
      this.dragInfo.dragMultiRight.selectedOnTab = -1;
    }
  }

  public onSelectSchedule(event) {
    this.recalLayout();
  }

  public configFinishingProcess(data) {
    if (this.isPageReadOnly || data.isArchived || this.isOnLateTab) {
      return;
    }
    let modalRef = this._modalService.open(ConfigFinishingProcessesComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static'
    });

    modalRef.componentInstance.schedulerId = data.id;
    modalRef.componentInstance.processNumber = data.finishingProcess;
    modalRef.componentInstance.processName = data.processName;
    modalRef.componentInstance.processDetail.scheduledQty = data.scheduledQty;

    modalRef.result.then((res: any) => {
      if (res) {
        this.getSchedulesData();
      }
    }, (err) => {
      // if not, error
    });
  }

  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this._dragulaService.destroy('bag-one');
    // set last filter
    this._schedulesPrintService.searchObj = this._schedulerSv.searchObj;
    this._schedulesPrintService.searchFrom = this._schedulerSv.searchFrom;
    this._schedulerSv.searchObj = '';
    this._schedulerSv.searchFrom = '';
    // save current page tobe schedule
    this._localStorageService.set('currentTobePage', this.tableConfig.currentPage);
  }
}
