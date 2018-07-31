import {
  Component,
  OnInit,
  ViewEncapsulation,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';

import {
  Subject,
  Subscription
} from 'rxjs';
import 'rxjs/add/operator/takeUntil';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';
import {
  NgbDropdownConfig,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  ValidationService
} from '../../../shared/services/validation';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import _ from 'lodash';
import * as moment from 'moment';

// Services
import { RouterService } from '../../../core/router';
import { Util } from '../../../shared/services/util';
import {
  CommonService
} from '../../../shared/services/common';
import {
  SchedulesPrintService
} from '../../schedules-print.service';
import {
  ThemeSetting
} from '../../../shared/services/theme-setting';
import { AuthService } from '../../../shared/services/auth';
import * as FileSaver from 'file-saver';
import {
  PrintMainService
} from './print-main.service';
import {
  MyDatePickerService
} from '../../../shared/services/my-date-picker';
import { UserContext } from '../../../shared/services/user-context';
import {
  TscPrintService
} from '../tsc-print.service';
import {
  DragulaService
} from 'ng2-dragula/ng2-dragula';
import {
  SchedulerService
} from '../../+scheduler/scheduler.service';
import {
  EditUserService
} from '../../../+user-management/+edit-user/edit-user.service';

// Component
import {
  UploaderTypeComponent
} from '../../../shared/modules/uploader-type';
import {
  CompletePrintJobComponent,
  AddCommentComponent,
  TeamConfigComponent
} from '../../modules';
import {
  JobsHistoryComponent
} from '../../modules/jobs-history';

// Validators
import {
  MaxDate,
  MinDate
} from '../../../shared/validators';

// Interfaces
import {
  StyleUploadedType
} from '../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+style';
import {
  ConfirmDialogComponent
} from '../../../shared/modules/confirm-dialog';
import {
  TaskStatus,
  ColConfigKey,
  HourOffset
} from '../../schedules-print.model';
import {
  ResponseMessage,
  BasicGeneralInfo,
  BasicVendorInfo
} from '../../../shared/models';
import {
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  UploadedType
} from '../../../+order-log-v2/+sales-order';
import {
  ExtraValidators
} from '../../../shared/services/validation';
import {
  AccessControlType
} from '../../../+role-management/role-management.model';
import { RuntimeComponent } from '../../modules/runtime';
import { ProgressService } from '../../../shared/services/progress';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'print-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'print-main.template.html',
  styleUrls: [
    'print-main.style.scss'
  ]
})
export class PrintMainComponent implements OnInit,
                                           OnDestroy {
  public tableData = [];
  public tableDataOrigin = [];

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
    poId: '',
    // retailerPoId: '',
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

  public dragStatus = 'none';

  public isPreDragOnTop = false;

  public isFilter = false;
  public isNoData = false;

  public tableDateModel = {date: null};

  public isRuntimeOpen = false;

  public taskStatus = TaskStatus;

  public uploadedType = UploadedType;
  public styleUploadedType = StyleUploadedType;

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

  public accessControlType = AccessControlType;
  public isPageReadOnly = false;
  public printFuncPermissions = [];

  public curDateTime;
  public isShowTeamConfig = false;

  public destroy$ = new Subject<any>();
  public dragInfo = {
    status: '',
    isDragging: false,
    draggingMirror: null
  };
  public isAllowDrag = false;
  public sumSched;

  public showHideColumns = [];
  public isCheckedAll = true;
  public columns = [];
  public isShowAllColumns = false;
  public totalColspan = { first: 8, second: 7 };
  public colConfigKey = ColConfigKey;
  // public colProp = [
  //   'Cust / PO',
  //   'Rerun / New',
  //   'Cut Ticket #',
  //   'Design # / Description',
  //   'Garment Style / Color',
  //   'Print Location',
  //   '# of Print Colors',
  //   'Qty (Pcs)',
  //   'Setup / Run Time',
  //   'Actual Run Time',
  //   'Blank Goods ETA',
  //   'Start / Cancel Ship Date',
  //   'Neck Label Date',
  //   'Finishing Date',
  //   'Status',
  //   'Comments'
  // ];
  public colProp = [];

  public daysTab = [];
  public lateJobData = [];
  public isOnLateTab = false;
  public tableDTArr = [];

  public machineHeaderSubscription: Subscription;

  private _lastScrollPo;

  constructor(private _router: Router,
              private _modalService: NgbModal,
              private _routerService: RouterService,
              private _utilService: Util,
              private _commonService: CommonService,
              private _schedulesPrintService: SchedulesPrintService,
              private _printMainSv: PrintMainService,
              private _themeSetting: ThemeSetting,
              private _toastrService: ToastrService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _authService: AuthService,
              private _userContext: UserContext,
              private _activatedRoute: ActivatedRoute,
              private _validationService: ValidationService,
              private _localStorageService: LocalStorageService,
              private _tscPrintSv: TscPrintService,
              private _dragulaService: DragulaService,
              private _schedulerSv: SchedulerService,
              public myDatePickerService: MyDatePickerService,
              private _ngbDropdownConfig: NgbDropdownConfig,
              private _progressService: ProgressService,
              private _editUserService: EditUserService) {
    _dragulaService.setOptions('bag-one', {
      accepts: this.validateDrop.bind(this),
      moves: this.validDrag.bind(this),
      copy: true,
      copySortSource: true
    });
    _dragulaService.drop.asObservable().takeUntil(this.destroy$).subscribe((value) => {
      this.onDrop(value.slice(1));
    });
    _dragulaService.over.asObservable().takeUntil(this.destroy$).subscribe((value) => {
      this.onOver(value.slice(1));
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

    this._ngbDropdownConfig.autoClose = false;

    let fontSize = this._localStorageService.get('fontSize_TscPrint') as string;
    if (fontSize) {
      const modal = {'font-size': fontSize};
      Object.assign(this.myConfigStyle, modal);
      const fontSizeNumber = +fontSize.slice(0, fontSize.length - 2);
      this.fontSizeClass[`font-size-${fontSizeNumber}`] = true;
    } else {
      this._localStorageService
        .set('fontSize_TscPrint', this.myConfigStyle['font-size']);
    }

    // Config columns
    let colSchedulesConfigs = this._userContext.currentUser.schedulesColumnConfigs;
    const printConfig = this._userContext.currentUser
      .permissions.filter((i) => i.type === 4);
    if (colSchedulesConfigs && colSchedulesConfigs.length) {
      const colConfigs = colSchedulesConfigs
        .find((i) => i.key === this.colConfigKey.SchedulesPrint);
      if (!colConfigs || colConfigs.value.length !== printConfig.length) {
        this.showHideColumns = printConfig;
      } else {
        colConfigs.value.forEach((i) => {
          let col = printConfig.find((o) => o.id === i.id);
          if (col) {
            Object.assign(i, col);
          }
        });
        this.showHideColumns = colConfigs.value;
      }
      const storedColumnConfig = this._userContext.currentUser
        .permissions.filter((i) => i.type === 4);
      if (this.showHideColumns.length < storedColumnConfig.length) {
        let newColIndex;
        const newColConfig = storedColumnConfig
          .find((i, index) => {
            if (!this.showHideColumns.some((o) => o.name === i.name)) {
              newColIndex = index;
              return true;
            } else {
              return false;
            }
          });
        this.showHideColumns.push(newColConfig);
      }
      this.showHideColumns.forEach((item) => {
        const sameObj =
          this._userContext.currentUser.permissions.find((i) => i.name === item.name);
        if (sameObj) {
          item.isModify = sameObj.isModify;
        }
      });
    } else {
      this.showHideColumns = this._userContext.currentUser
      .permissions.filter((i) => i.type === 4);
    }

    this.showHideColumns.forEach((item) => {
      this.columns.push(Object.assign({}, item));
      this.colProp.push(item.description);
    });
    this.isCheckedAll = this.showHideColumns.every((i) => i.isView === true);
    this.isShowAllColumns = !!this._localStorageService.get('isShowAll_SchedulesPrint');
    this.checkColspanChange();
    // --------------
    // subsribe machine select on header
    this.machineHeaderSubscription =
      this._utilService.onmachineHeaderSelect$.subscribe(() => {
        this.onFilter();
      });
  }

  public ngOnInit(): void {
    this.initialPermission();
    this.buildForm();
    this.getCommonData();
    // this.preMenuPin = this._themeSetting.menuPin;
    // this._themeSetting.themeChanged.subscribe(() => {
    //   setTimeout(() => {
    //     let scrollElef = document.getElementsByClassName('ng-sidebar__content')[0];
    //     if (scrollElef) {
    //       scrollElef.scrollTop += 1;
    //     }
    //     this._changeDetectorRef.markForCheck();
    //   }, 400);
    // });
    if (this.getIsModifyFunc('TeamConfig')) {
      this.isShowTeamConfig = true;
    }
    if (this.getIsModifyFunc('Reschedule')) {
      this.isAllowDrag = true;
    }
  }

  public initialPermission(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Schedules.Print');
    // Get Print Function Permission from user info
    const funcPermission = this._userContext.currentUser.permissions
      .filter((i) => i.type === this.accessControlType.Functions);
    this.printFuncPermissions = funcPermission
      .filter((i) => i.name.includes('Schedules.Print'));
    // -------
  }

  public buildForm(): void {
    let controlConfig = {
      customer: new FormControl(''),
      poId: new FormControl(''),
      // retailerPoId: new FormControl(''),
      partnerStyle: new FormControl(''),
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
        poId: {
          required: false
        },
        // retailerPoId: {
        //   required: false
        // },
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
    // get search filter service
    if (this._tscPrintSv.searchObj) {
      if (this._tscPrintSv.searchFrom === 'print-outsource') {
        this._tscPrintSv.convertToTsc();
      }
      this.searchObj.machine = this._tscPrintSv.searchObj.machine || [];
      this.updateForm(this._tscPrintSv.searchObj);
    } else {
      this._tscPrintSv.searchObj = JSON.parse(JSON.stringify(this.frm.value));
      delete this._tscPrintSv.searchObj.formRequires;
    }

    let data = this.frm.value;
    if (data['poId'] ||
      // data['retailerPoId'] ||
      data['customer'] ||
      data['styleName'] ||
      data['partnerStyle'] ||
      data['cancelDateFromOnUtc'] ||
      data['cancelDateToOnUtc'] ||
      data['printDate'] === 'Custom') {
      this.isFilter = true;
    } else {
      this.isFilter = false;
    }
    // set last tab
    this._tscPrintSv.searchFrom = 'print-tsc';
  }

  public getPrintTabData(search?) {
    let subTableData = [];
    let data = this.frm.value;
    let curDate = new Date();
    curDate.setHours(-HourOffset, 0, 0);
    let params: HttpParams = new HttpParams()
      .set('printDateFromOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'))
      .set('hourOffset', HourOffset.toString())
      .set('isAllVendor', 'false')
      .set('poId', data['poId'])
      .set('customer', data['customer'])
      .set('styleName', data['styleName'])
      .set('partnerStyle', data['partnerStyle'])
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

    switch (data['printDate']) {
      case 'Yesterday':
        curDate.setDate(curDate.getDate() - 1);
        subTableData.push(
          {
            date: new Date(curDate.getTime()),
            data: [],
            totalsSched: 0,
            totalsComp: 0,
            totalRecord: 0
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
            totalsSched: 0,
            totalsComp: 0,
            totalRecord: 0
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
              totalsSched: 0,
              totalsComp: 0,
              totalRecord: 0
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
                totalsSched: 0,
                totalsComp: 0,
                totalRecord: 0
              }
            );
          }

          let dateFrom = _.clone(data['schedDateFrom'].jsdate);
          dateFrom.setHours(-HourOffset, 0, 0);
          let dateTo = _.clone(data['schedDateTo'].jsdate);
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
              totalsSched: 0,
              totalsComp: 0,
              totalRecord: 0
            }
          );
        }
        break;
    }

    let machines = [];
    if (this.searchObj['machine'] && this.searchObj['machine'].length) {
      machines =  this.searchObj['machine'];
    }
    if (typeof this._utilService.machineHeaderSelect === 'number') {
      machines = machines.concat([this._utilService.machineNameHeaderSelect]);
    }
    params = params.set('machines', _.uniq(machines).toString());

    // // get last scroll
    // this._lastScrollPo = this._utilService.scrollElm.scrollTop;

    this._printMainSv.getPrintTabData(params)
      .subscribe((resp: ResponseMessage<any>): void => {
        if (resp.status) {
          this.searchedObj = {
            ...this.frm.value,
            machines: this.searchObj['machine'].toString()
          };
          resp.data = this.filterDataByRole(resp.data);
          if (!resp.data.length) {
            this.isNoData = true;
          } else {
            this.isNoData = false;
          }
          this.tableData = subTableData;
          this.setDataTable(resp.data, search);
          this.calculateActualTime();
          this.curDateTime = Date.now();
          if (!this.daysTab.length || (this.daysTab.length === 1 && !this.daysTab[0].date)) {
            let activeDate = this._localStorageService.get('activeDate_SchedulesPrint');
            let lastScrollPo = this._localStorageService.get('lastScrollPo_SchedulesPrint');
            if (lastScrollPo && Number.parseInt(lastScrollPo.toString()) > 0) {
              this._lastScrollPo = lastScrollPo;
            }
            if (activeDate) {
              activeDate = moment(activeDate).toDate();
              this.setDaysTab(0, activeDate);
            } else {
              this.setDaysTab(0);
            }
          } else {
            let activeIndex = this.daysTab.findIndex((d) => d.isActive === true);
            if (activeIndex < 0) {
              activeIndex = 0;
            }
            this.setDaysTab(activeIndex);
          }
          this._changeDetectorRef.markForCheck();
          if (this._lastScrollPo > 0) {
            setTimeout(() => {
              this._utilService.scrollElm.scrollTop = this._lastScrollPo;
              this._lastScrollPo = 0;
            });
          }
        }
      });
  }

  public getLateJobData() {
    let params: HttpParams = new HttpParams()
      .set('hourOffset', HourOffset.toString())
      .set('isLateJob', 'true');
    // // get last scroll
    // this._lastScrollPo = this._utilService.scrollElm.scrollTop;
    this._printMainSv.getPrintTabData(params)
      .subscribe((resp) => {
        if (resp.status) {
          if (!resp.data || !resp.data.length) {
            return;
          }
          let cloneTableData = this.tableData.slice(0);
          this.tableData = [];
          resp.data = _.sortBy(resp.data, 'printDate');
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
                totalsSched: 0,
                totalsComp: 0,
                totalRecord: 0
              }
            );
          }
          this.setDataTable(resp.data, true, true);
          // first time get late data
          if (!this.daysTab.length ||
            (this.daysTab.length && this.daysTab[0].date !== null)) {
            this.daysTab.unshift({isActive: false, date: null});
            let activeDate = this._localStorageService.get('activeDate_SchedulesPrint');
            if (!activeDate) {
              this.setDaysTab(0);
            } else {
              this.tableData = cloneTableData;
            }
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
          this._changeDetectorRef.markForCheck();
          // setTimeout(() => {
          //   this._utilService.scrollElm.scrollTop = this._lastScrollPo;
          // });
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getMachineNVendor('Print')
      .subscribe((resp: ResponseMessage<BasicVendorInfo[]>) => {
        if (resp.status) {
          let sortedData = _.orderBy(resp.data, ['isMachine', 'name'], ['desc', 'asc']);
          this.machineList = sortedData.filter((data) => data['isMachine']);
          this.getSearchFilterSv();
          if (this.isFilter) {
            this.getPrintTabData(true);
          } else {
            this.getPrintTabData();
          }
          this.getLateJobData();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public onSelectValueChange(value: any, valueProp: string, formProp: string): void {
    if (formProp !== 'machine') {
      this.searchObj[formProp] = value.text;
    } else {
      let activeValue = [];
      value.activeItem.forEach((item) => {
        activeValue.push(item.text);
      });
      this.searchObj[formProp] = activeValue;
      return;
    }
    // Ng Select return valid data with current value
    if (value[valueProp]) {
      this.frm.get(formProp).setValue(value[valueProp]);
    } else {
      // Ng Select return valid data with new value
      if (value.text) {
        this.frm.get(formProp).setValue(value.text);
      } else {
        // Ng Select return invalid data
        this.frm.get(formProp).setValue(value);
      }
    }
    // Update status for form control whose value changed
    this.frm.get(formProp).markAsDirty();
    this._changeDetectorRef.markForCheck();
  }

  @HostListener('window:scroll', ['$event'])
  public onAppScroll(event, timeout = 0, forceResize?: boolean, setTableW?: boolean) {
    let fixedPoint = 320;
    if (window.innerWidth < 992) {
      fixedPoint = 360;
    }
    if ((!this.fixedHeader || forceResize)) {
      if (!this.fixedHeader && event.target.scrollingElement.scrollTop > fixedPoint) {
        setTableW = true;
        this.fixedHeader = true;
      }
      setTimeout(() => {
        for (let j = 0; j < 1; j++) {
          let tableW = 0;
          let fixedHE;
          if (document.getElementsByClassName('fixedHeader')[0]) {
            fixedHE = document.getElementsByClassName('fixedHeader')[0]
              .getElementsByTagName('th');
            let bodyE = document.getElementsByTagName('th');
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

  public openModal(data) {
    let modalRef = this._modalService.open(CompletePrintJobComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static',
      windowClass: 'modal-w-1000'
    });

    // modalRef.componentInstance.model.printDateOnUtc =
    // moment.utc(myDate).format('YYYY-MM-DDTHH:mm:ss');
    modalRef.componentInstance.isFromPrint = true;
    modalRef.componentInstance.machineData = data;
    modalRef.componentInstance.schedulerId = data.id;
    modalRef.componentInstance.isTsc = true;
    if (data.isLateOriginal) {
      modalRef.componentInstance.isLateOriginal = true;
    }
    if (data.isLateRescheduled) {
      modalRef.componentInstance.isLateRescheduled = true;
    }

    modalRef.result.then((res: any) => {
      this.getPrintTabData(this.isFilter);
    }, (err) => {
      // if not, error
    });
  }

  public openHistory(id: number) {
    let modalRef = this._modalService.open(JobsHistoryComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static',
      windowClass: 'modal-w-1000'
    });
    modalRef.componentInstance.id = id;

    modalRef.result.then((res: any) => {
      if (res) {
        // e
      }
    }, (err) => {
      // if not, error
    });
  }

  public addComment(data, see?) {
    let modalRef = this._modalService.open(AddCommentComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static'
    });

    modalRef.componentInstance.schedulerId = data.id;
    if (see) {
      modalRef.componentInstance.isView = true;
    }

    modalRef.result.then((res: any) => {
      if (res) {
        this.getPrintTabData(this.isFilter);
        this.getLateJobData();
      }
    }, (err) => {
      // if not, error
    });
  }

  public teamConfig(schedulerDate, machineId, machineData) {
    if (machineData && machineData[0] === null) {
      return;
    }
    let modalRef = this._modalService.open(TeamConfigComponent, {
      keyboard: false,
      backdrop: 'static'
    });

    modalRef.componentInstance.schedulerDate = schedulerDate;
    modalRef.componentInstance.machineId = machineId;
    let isArchived = machineData.some((m) => m.isArchived);
    modalRef.componentInstance.isArchived = isArchived;

    modalRef.result.then((res: any) => {
      if (res) {
        // this.getPrintTabData();
      }
    }, (err) => {
      // if not, error
    });
  }

  public setDataTable(data, search?: boolean, isLateJob?: boolean) {
    let machineAvalable = this.machineList;
    let machines = [];
    if (this.searchObj['machine'] && this.searchObj['machine'].length) {
      machines =  this.searchObj['machine'];
    }
    if (typeof this._utilService.machineHeaderSelect === 'number') {
      machines = machines.concat([this._utilService.machineNameHeaderSelect]);
    }
    machines = _.uniq(machines);
    if (machines.length) {
      machineAvalable = [];
      machines.forEach((m) => {
        // push filter machine to schedule table
        // print schedule
        let filterMC = this.machineList.filter((mc) => mc.name === m);
        if (filterMC[0]) {
          machineAvalable.push(filterMC[0]);
        }
      });
    }
    machineAvalable = _.orderBy(machineAvalable, ['isMachine', 'name'], ['desc', 'asc']);

    let sample = [null];
    this.tableData.forEach((dayData) => {
      dayData.totalRuntime = 0;
      dayData.totalActualRT = 0;
      let rowData = [];
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
        machineAvalable.forEach((item) => {
          rowData.push(
            {
              machineName: item.name,
              machineId: item.id,
              machineData: data[index].data.filter((m) => m.machineId === item.id),
              sumSchedQty: 0,
              sumCompQty: 0,
              sumRunTime: 0
            }
          );
          if (rowData[rowData.length - 1].machineData.length) {
            // sort by order
            rowData[rowData.length - 1].machineData =
            _.sortBy(rowData[rowData.length - 1].machineData, 'orderNum');
            // calculate sum qty
            rowData[rowData.length - 1].machineData.forEach((m) => {
              if (m) {
                rowData[rowData.length - 1].sumSchedQty += m.scheduledQty;
                rowData[rowData.length - 1].sumCompQty += m.completedQty;
                rowData[rowData.length - 1].sumRunTime += m.runtime + m.setuptime / 60;
              }
            });
            // calculate totals pieces and total runtime
            dayData.totalsSched += rowData[rowData.length - 1].sumSchedQty;
            dayData.totalsComp += rowData[rowData.length - 1].sumCompQty;
            dayData.totalRuntime += rowData[rowData.length - 1].sumRunTime;
            // fixed sum run time
            rowData[rowData.length - 1].sumRunTime =
              rowData[rowData.length - 1].sumRunTime.toFixed(2);
          } else {
            rowData[rowData.length - 1].machineData = sample;
            // fixed sum run time
            rowData[rowData.length - 1].sumRunTime =
              rowData[rowData.length - 1].sumRunTime.toFixed(2);
          }
          dayData.totalRecord += rowData[rowData.length - 1].machineData.length + 1;
        });
        dayData.data = rowData;
        // only show machine contain data if search mode on
        if (search) {
          dayData.data = rowData.filter((r) => r.machineData[0] !== null);
          dayData.totalRecord = 0;
          dayData.data.forEach((d) => {
            dayData.totalRecord += d.machineData.length + 1;
          });
        }
      } else if (!search) {
        // add 1 null record to day no data
        // machineAvalable.forEach((item) => {
        //   rowData.push({machineName: item.name, machineData: sample});
        //   dayData.totalRecord += rowData[rowData.length - 1].machineData.length + 1;
        // });
        dayData.totalRecord = 1;
        dayData.data = rowData;
      }
    });
    // only show day contain data if search mode on
    if (this.isFilter || search) {
      this.tableData = this.tableData.filter((d) => d.data.length);
    }
    if (!isLateJob) {
      // save origin data
      this.tableDataOrigin = _.cloneDeep(this.tableData);
    } else {
      this.lateJobData = _.cloneDeep(this.tableData);
    }
  }

  public reCalculateData(machineData?, data?) {
    if (machineData && data) {
      if (data.runTime || data.runTime === 0) {
        machineData.runtime = data.runTime;
      }
      if (data.setupTime || data.setupTime === 0) {
        machineData.setuptime = data.setupTime;
      }
    }
    this.tableData.forEach((dayData) => {
      dayData.totalRuntime = 0;
      dayData.data.forEach((rowData) => {
        rowData.sumRunTime = 0;
        rowData.machineData.forEach((mcData) => {
          if (mcData) {
            rowData.sumRunTime += mcData.runtime + mcData.setuptime / 60;
          }
        });
        dayData.totalRuntime += rowData.sumRunTime;
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
      ...this._tscPrintSv.searchObj,
      ...this.frm.value,
      machine: this.searchObj.machine
    };
    this._tscPrintSv.searchObj = JSON.parse(JSON.stringify(newSearchObj));
    delete this._tscPrintSv.searchObj.formRequires;

    // reset days tab when search
    this.daysTab = [];
    this._localStorageService.set('activeDate_SchedulesPrint', null);
    this._localStorageService.set('lastScrollPo_SchedulesPrint', 0);

    let data = this.frm.value;
    if (data['poId'] ||
      // data['retailerPoId'] ||
      data['customer'] ||
      data['styleName'] ||
      data['partnerStyle'] ||
      data['cancelDateFromOnUtc'] ||
      data['cancelDateToOnUtc'] ||
      data['printDate'] === 'Custom') {
      this.isFilter = true;
      this.getPrintTabData(true);
    } else {
      this.isFilter = false;
      this.getPrintTabData();
    }
  }

  /**
   * Search text change event
   * @param value
   */
  public onSearchChanged(value: string): void {
    this.searchObj.keyword = value;
    this.getPrintTabData(value);
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

  public showInput(event, type: number, isArchived?) {
    if (!this.isPageReadOnly && !isArchived) {
      let inputE = event.getElementsByTagName('input');
      let valueE = event.getElementsByTagName('span');
      if (inputE.length) {
        if (inputE[type].hidden) {
          valueE[type].hidden = true;
          inputE[type].hidden = false;
          this.isRuntimeOpen = true;
          inputE[type].focus();
          inputE[type].select();
        }
      }
    }
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
        // this.getPrintTabData(this.isFilter);
        this.reCalculateData();
        this.calculateActualTime(true);
        this._changeDetectorRef.markForCheck();
      }
    }, (err) => {
      // if not, error
    });
  }

  public updateRunTime(inputE, runTimeE, dayDataId, rowDataId, machineDataId, type: number) {
    let valueE = runTimeE.getElementsByTagName('span');
    let timeNumber = parseFloat(inputE.value);
    let machineData = this.tableData[dayDataId].data[rowDataId].machineData[machineDataId];

    inputE.hidden = true;
    this.isRuntimeOpen = false;
    valueE[type].hidden = false;
    if (this.invalidNumber(inputE.value, type)) {
      inputE.value = type === 1 ? machineData.runtime : machineData.setuptime;
      return;
    }
    let model = {
      runTime: machineData.runtime,
      setupTime: machineData.setuptime
    };
    let isNewValue = false;
    if (timeNumber - machineData.runtime !== 0 && type === 1) {
      isNewValue = true;
      model.runTime = timeNumber;
    }
    if (timeNumber - machineData.setuptime !== 0 && type === 0) {
      isNewValue = true;
      model.setupTime = timeNumber;
    }
    if (!isNaN(timeNumber) && isNewValue) {
      this.updateSchedules(machineData, model);
    }
  }

  public updateMaintenanceRunTime(inputE, runTimeE, dayDataId, rowDataId, machineDataId) {
    let valueE = runTimeE.getElementsByTagName('span');
    let timeNumber = parseFloat(inputE.value);
    let machineData = this.tableData[dayDataId].data[rowDataId].machineData[machineDataId];

    inputE.hidden = true;
    this.isRuntimeOpen = false;
    valueE[0].hidden = false;
    if (this.invalidNumber(inputE.value, 1)) {
      inputE.value = machineData.runtime;
      return;
    }
    let model = {
      runTime: machineData.runtime
    };
    let isNewValue = false;
    if (timeNumber - machineData.runtime !== 0) {
      isNewValue = true;
      model.runTime = timeNumber;
    }
    if (!isNaN(timeNumber) && isNewValue) {
      this.updateSchedules(machineData, model);
    }
  }

  public updateNeededDate(event: IMyDateModel, dayDataId, rowDataId, machineDataId) {
    let utcDate = Object.assign({}, event);
    let machineData = this.tableData[dayDataId].data[rowDataId].machineData[machineDataId];
    let runTimeNumber = parseFloat(machineData.runtime);
    let model = {
      runTime: runTimeNumber.toFixed(2),
      neededByDateOnUtc: utcDate.jsdate ? utcDate.formatted : null
    };
    this.updateSchedules(machineData, model);
  }

  public updateSchedules(machineData, model) {
    let params: HttpParams = new HttpParams();
    if (machineData.orderDetailId) {
      params = params.set('orderDetailId', machineData.orderDetailId.toString());
    }
    if (machineData.printLocationId) {
      params = params.set('printLocationId', machineData.printLocationId.toString());
    }
    if (machineData.isMaintenanceJob) {
      params = params.set('isMaintenanceJob', machineData.isMaintenanceJob);
    }

    this._printMainSv.updatePrintTabData(machineData.id, params, model)
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.getPrintTabData(this.isFilter);
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public removeStyle(machineData) {
    let params: HttpParams = new HttpParams();
    if (machineData.printLocationId) {
      params = params.set('printLocationId', machineData.printLocationId.toString());
    }
    if (machineData.neckLabelId) {
      params = params.set('neckLabelId', machineData.neckLabelId.toString());
    }

    let modalRef = this._modalService.open(ConfirmDialogComponent, {
      keyboard: false,
      backdrop: 'static'
    });
    modalRef.componentInstance
      .message = 'Are you sure you want to remove this style from the schedule?';
    modalRef.componentInstance.title = 'Remove From Schedule';

    modalRef.result.then((res: boolean) => {
      if (res) {
        this._schedulesPrintService.removeStyle(machineData.schedulerId, params)
          .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
            if (resp.status) {
              this.getPrintTabData();
              this._toastrService.success(resp.message, 'Success');
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
    });
  }

  public goToOrderInfo(orderId: number): void {
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    this._router.navigate(['order-log-v2', orderId]);
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
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

  public changeStatus(machineData, type) {
    const typeData = [
      'isArtCompleted',
      'isScreensCompleted',
      'isInkCompleted',
      'isBlanksCompleted',
      'isSampleCompleted'
    ];
    this._printMainSv.changeStatus(machineData.id, type, !machineData[typeData[type]])
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          machineData[typeData[type]] = !machineData[typeData[type]];
          this._changeDetectorRef.markForCheck();
          this._toastrService.success(resp.message, 'Success');
          // this.getPrintTabData();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public calculateActualTime(updateRT?) {
    this.tableDataOrigin.forEach((dayData) => {
      dayData.totalActualRT = 0;
      dayData.data.forEach((rowData) => {
        let sumActualRT = 0;
        rowData.machineData.forEach((m, index) => {
          // convert started time and complete to local if exist
          if (m && m.startedTimeOnUtc) {
            m.startedTimeOnUtc = moment.utc(m.startedTimeOnUtc).local().toDate();
          }
          if (m && m.completedTimeOnUtc) {
            m.completedTimeOnUtc = moment.utc(m.completedTimeOnUtc).local().toDate();
            m.isJobConfirmed = true;
          }
          if (m && m.startedSetupTimeOnUtc) {
            m.startedSetupTimeOnUtc = moment.utc(m.startedSetupTimeOnUtc).local().toDate();
          }
          if (m && m.stoppedSetupTimeOnUtc) {
            m.stoppedSetupTimeOnUtc = moment.utc(m.stoppedSetupTimeOnUtc).local().toDate();
          }
          // calcalate totals actual RT if job complete
          if (m && m.processStatus >= 3 && m.processStatus < 7) {
            let timeDiff =
                  Math.abs(
                    m.completedTimeOnUtc.getTime()
                    - m.startedTimeOnUtc.getTime()
                  );
            m.actualRT = Math.round((timeDiff / (1000 * 3600)) * 10) / 10;
            sumActualRT += timeDiff / (1000 * 3600);
          }
          // calcutate sumActualRT
          if (m && m.processStatus < 3) {
            sumActualRT += m.runtime + m.setuptime / 60;
          }
          // calculate setupETA and printETA
          let mDate;
          if (index === 0 && m && !m.startedSetupTimeOnUtc) {
            mDate = new Date(dayData.date.getTime());
            mDate.setHours(7, 0);
          }
          if (index > 0 && m && !m.startedSetupTimeOnUtc) {
            mDate = new Date(rowData.machineData[index - 1].completedTimeOnUtc.getTime());
          }
          if (m && m.startedSetupTimeOnUtc && !m.stoppedSetupTimeOnUtc) {
            mDate = new Date(m.startedSetupTimeOnUtc.getTime());
          }
          if (m && m.stoppedSetupTimeOnUtc && !m.startedTimeOnUtc) {
            mDate = new Date(m.stoppedSetupTimeOnUtc.getTime());
          }
          if (index === 0 && m && m.isMovedToTomorrow && !m.startedTimeOnUtc) {
            mDate = new Date(dayData.date.getTime());
            mDate.setHours(7, 0);
          }
          if (index > 0 && m && m.isMovedToTomorrow && !m.startedTimeOnUtc) {
            mDate = new Date(rowData.machineData[index - 1].completedTimeOnUtc.getTime());
          }
          if (m && m.startedTimeOnUtc) {
            mDate = new Date(m.startedTimeOnUtc.getTime());
          }
          if (!mDate) {
            return;
          }
          if ((!m.stoppedSetupTimeOnUtc || m.isMovedToTomorrow) && !m.startedTimeOnUtc) {
            mDate.setHours(mDate.getHours(), mDate.getMinutes() + m.setuptime);
            m.setupETA = new Date(mDate.getTime());
          }
          if (m.stoppedSetupTimeOnUtc && m.startedTimeOnUtc) {
            m.setupETA = new Date(m.stoppedSetupTimeOnUtc.getTime());
          }
          if (!m.completedTimeOnUtc || updateRT) {
            mDate.setHours(mDate.getHours(), mDate.getMinutes() + m.runtime * 60 + m.pauseTime);
            m.completedTimeOnUtc = new Date(mDate.getTime());
          }
        });
        rowData.sumActualRT = Math.round(sumActualRT * 100) / 100;
        dayData.totalActualRT += sumActualRT;
      });
    });
  }

  public checkConcurrent(data, rowData) {
    let hasJobStarted = false;
    rowData.forEach((d) => {
      if ((d.processStatus === 1 || d.processStatus === 2) && d.id !== data.id &&
        data.processStatus === 0) {
        hasJobStarted = true;
      }
    });

    if (rowData && hasJobStarted) {
      let confirmModal = this._modalService.open(ConfirmDialogComponent, {
        keyboard: false,
        backdrop: 'static'
      });
      confirmModal.componentInstance.title = 'Start Concurrent Job';
      confirmModal.componentInstance.message =
        'There is currently a pending job on this machine.' +
        ' Please confirm you want to process another job.';
      confirmModal.result.then((res: any) => {
        if (res) {
          this.openModal(data);
        }
      }, (err) => {
        // if not, error
      });
    } else {
      this.openModal(data);
    }
  }

  public exportOrder(exportType: string) {
    let activeDate = this.daysTab.find((d) => d.isActive);
    if (!activeDate.date) {
      this._toastrService.error('Cannot export late job!', 'Error');
      return;
    }
    let hasData = false;
    this.tableData.forEach((d) => {
      if (d.data.length > 0) {
        hasData = true;
      }
    });
    if (!hasData) {
      this._toastrService.error('There are no jobs schedules for the selected date', 'Error');
      return;
    }
    if (exportType === 'pdf') {
      let data = this.frm.value;
      let curDate = moment(activeDate.date).toDate();
      curDate.setHours(-HourOffset, 0, 0);
      let params: HttpParams = new HttpParams()
        .set('printDateFromOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'))
        .set('hourOffset', HourOffset.toString())
        .set('isAllVendor', 'false')
        .set('poId', data['poId'])
        .set('customer', data['customer'])
        .set('styleName', data['styleName'])
        .set('partnerStyle', data['partnerStyle'])
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

      curDate.setHours(23 - HourOffset, 59, 59);
      params = params.set('printDateToOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));

      let machines = [];
      if (this.searchObj['machine'] && this.searchObj['machine'].length) {
        machines =  this.searchObj['machine'];
      }
      if (typeof this._utilService.machineHeaderSelect === 'number') {
        machines = machines.concat([this._utilService.machineNameHeaderSelect]);
      }
      params = params.set('machines', _.uniq(machines).toString());

      this._printMainSv.exportTscPrintData(params)
        .subscribe((resp: any): void => {
          if (resp.status) {
            let exportData = resp;
            let values = exportData.headers.get('Content-Disposition');
            let filename = values.split(';')[1].trim().split('=')[1];
            // remove " from file name
            filename = filename.replace(/"/g, '');
            let blob;
            if (exportType === 'pdf') {
              blob = new Blob([(<any> exportData).body],
                {type: 'application/pdf'}
              );
            }
            // else if (exportType === 'xlsx') {
            //   blob = new Blob([(<any> exportData).body],
            //     {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
            //   );
            // }
            FileSaver.saveAs(blob, filename);
          }
        });
    }
  }

  public openUploader(styleId: number, type: number, title: string): void {
    let fileList = [];
    this._printMainSv.getStyleFile(styleId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          fileList = Object.assign([], resp.data);
          let modalRef = this._modalService.open(UploaderTypeComponent, {
            size: 'lg',
            keyboard: false,
            backdrop: 'static',
            windowClass: 'super-lg'
          });
          modalRef.componentInstance.title = title;
          Object.assign(modalRef.componentInstance.uploadOptions, {
            id: '',
            isReadOnly: true,
            uploadType: type === this.styleUploadedType.ProductionPO
              ? this.uploadedType.CutTickets : '',
            fileList,
            fileType: type
          });
          modalRef.result.then((res) => {
            // close popup
          }, (err) => {
            // error
          });
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public changeFontSize(fontSize) {
    // deactive previous font size
    let fontSizeId = this.fontSizeData.indexOf(this.myConfigStyle['font-size']);
    this.fontSizeClass[this.fontSizeIndex[fontSizeId]] = false;

    // active new font size
    this.myConfigStyle['font-size'] = fontSize;
    this._localStorageService.set('fontSize_TscPrint', fontSize);
    fontSizeId = this.fontSizeData.indexOf(fontSize);
    this.fontSizeClass[this.fontSizeIndex[fontSizeId]] = true;
  }

  public invalidNumber(value, type: number) {
    let dotCount = 0;
    if (value) {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < value.length; i++) {
        if (value[i] === '.') {
          dotCount++;
        }
        if (dotCount > 1) {
          return 1;
        }
      }
      // max setuptime is 2h and max runtime is 100h
      if ((type === 0 && Number.parseFloat(value) > 120) ||
        (type === 1 && Number.parseFloat(value) > 100)) {
        return 2;
      }
    }
    return 0;
  }

  public checkCompletedTime(completedTime) {
    if (completedTime && completedTime.getTime() < this.curDateTime) {
      return true;
    }
    return false;
  }

  public totalSched() {
    this.sumSched = 0;
    this.tableData.forEach((dayData) => {
      dayData.data.forEach((rowData) => {
        rowData.machineData.forEach((mcData) => {
          if (mcData) {
            this.sumSched++;
          }
        });
      });
    });
  }

  public getIsModifyFunc(name: string): boolean {
    const status = this.printFuncPermissions.find((i) => i.name.includes(name));
    return status ? status.isModify : true;
  }

  public getIsModifyStatusBy(statusName: string): boolean {
    if (this.isPageReadOnly) {
      return false;
    }
    switch (statusName) {
      case 'ART':
        return this.getIsModifyFunc('Status.Art');
      case 'SCREENS':
        return this.getIsModifyFunc('Status.Screens');
      case 'INK':
        return this.getIsModifyFunc('Status.Ink');
      case 'BLANKS':
        return this.getIsModifyFunc('Status.Blanks');
      case 'SAMPLE':
        return this.getIsModifyFunc('Status.Sample');
      default:
        return;
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

  //#region drag event
  /**
   * Prevent drag on invalid row
   */
  public validDrag(el, container, handle) {
    // avoid when update runtime
    if (this.isRuntimeOpen) {
      return false;
    }
    return handle.className.includes('fa-arrows');
  }

  /**
   * Prevent drop to invalid position
   */
  public validateDrop(el, target, source, sibling) {
    // scroll down if el close bottom
    if (sibling) {
      let rect = sibling.getBoundingClientRect();
      if (window.innerHeight - rect.top < 220) {
        this._utilService.scrollElm.scrollTo(
          0,
          this._utilService.scrollElm.scrollTop + 30
        );
      }
      if (window.innerHeight - rect.top > 600) {
        this._utilService.scrollElm.scrollTo(
          0,
          this._utilService.scrollElm.scrollTop - 30
        );
      }
    }
    return true;
  }

  public onOver(args) {
    if (!this.dragInfo.isDragging) {
      this.dragInfo.isDragging = true;
      let mirror = document.getElementsByClassName('gu-mirror');
      this.dragInfo.draggingMirror = mirror;
    }
  }

  public onShadow(args) {
    try {
      //#region drag over days tab
      if (args[1] && args[1].id && args[1].id.includes('days-tab')) {
        args[0].hidden = true;
        let isDragToLateTab = args[1].id.endsWith('-0') && this.lateJobData.length;
        if (!args[1].classList.contains('green-days-tab') &&
        !args[1].classList.contains('active') && !isDragToLateTab) {
          args[1].classList.add('green-days-tab');
        }
        return;
      }
      //#endregion

      //#region init
      let elId = args[0].id.split('-');
      const colCount = 17;
      let colSpanIndex = 0;

      let preId = args[0].previousElementSibling;
      if (preId) {
        preId = preId.id.split('-');
      } else {
        preId = [];
      }

      let nextId = args[0].nextElementSibling;
      if (nextId) {
        nextId = nextId.id.split('-');
      } else {
        nextId = [];
      }
      //#endregion

      //#region hide shadow if drag to top of table
      if (args[0].hidden) {
        args[0].hidden = false;
      }
      if (nextId[1] === '0' && nextId[2] === '0') {
        args[0].hidden = true;
      }
      //#endregion

      //#region slice print date if drag first row of day
      if (elId[1] === '0' && elId[2] === '0' && args[0].cells.length > colCount) {
        args[0].deleteCell(0);
        if (nextId.length && nextId[1] === '0' && nextId[2] === '1') {
          args[0].deleteCell(0);
        }
      }
      //#endregion

      //#region drag between multi job in same machine
      if (preId.length && nextId.length) {
        if (args[0].cells.length < colCount) {
          // add 1 td to first col of preview drag element
          let col = document.createElement('td');
          args[0].insertBefore(col, args[0].childNodes[0]);
        }
        if (preId[1] === nextId[1] && !isNaN(+preId[2]) && !isNaN(+nextId[2])) {
          if (!args[0].cells[0].hidden) {
            args[0].cells[0].hidden = true;
            let firstOfMC = document.getElementById(nextId[0] + '-' + nextId[1] + '-0');
            if (nextId[1] === '0') {
              colSpanIndex = 1;
            }
            firstOfMC['cells'][colSpanIndex].rowSpan++;
          }
        } else {
          if (args[0].cells[0].hidden) {
            args[0].cells[0].hidden = false;
            let firstOfMC = document.getElementById(nextId[0] + '-' + nextId[1] + '-0');
            if (nextId[1] === '0') {
              colSpanIndex = 1;
            }
            firstOfMC['cells'][colSpanIndex].rowSpan--;
          }
        }
      }
      //#endregion
    } catch (error) {
      // empty
    }
  }

  public onDrop(args) {
    // drop to days tab
    if (args[1] && args[1].id.includes('days-tab')) {
      let elIndex = args[0].id.split('-');
      const dropTabIndex = parseInt(args[1].id.split('-')[2], 10);
      let isDragToLateTab = dropTabIndex === 0 && this.lateJobData.length;
      if (!elIndex.length || isDragToLateTab) {
        return;
      }
      elIndex.forEach((item, index) => {
        elIndex[index] = Number.parseInt(elIndex[index]);
      });
      let reASModel = {
        printDateOnUtc: undefined,
        vendorId: undefined,
        machineId: undefined,
        type: 0
      };
      if (this.tableData[elIndex[0]].data[elIndex[1]]
          .machineData[elIndex[2]].vendorId) {
        reASModel.vendorId = this.tableData[elIndex[0]].data[elIndex[1]]
        .machineData[elIndex[2]].vendorId;
      } else {
        reASModel.machineId = this.tableData[elIndex[0]].data[elIndex[1]]
        .machineData[elIndex[2]].machineId;
      }
      reASModel.printDateOnUtc = new Date(this.daysTab[dropTabIndex].date.getTime());
      reASModel.printDateOnUtc.setHours(12, 0, 0);
      reASModel.printDateOnUtc = moment(reASModel.printDateOnUtc).format('YYYY-MM-DDTHH:mm:ss');
      // make message
      let dragFrDate = this.daysTab[this.daysTab.findIndex((d) => d.isActive)].date;
      if (!dragFrDate) {
        dragFrDate = this.tableData[elIndex[0]].date;
      }
      const mess = `Print schedule item successfully moved from 
      ${this.tableData[elIndex[0]].data[elIndex[1]].machineName} on 
      ${moment(dragFrDate).format('M/D')} to
      ${this.tableData[elIndex[0]].data[elIndex[1]].machineName} on 
      ${moment(reASModel.printDateOnUtc).format('M/D')}.`;
      // call api
      this._schedulerSv.reassignSchedule(
        this.tableData[elIndex[0]].data[elIndex[1]]
        .machineData[elIndex[2]].id, reASModel)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this._toastrService.success(mess, 'Success');
            this.getPrintTabData();
            this.getLateJobData();
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
      return;
    }
    // normal drop
    let elId = args[0].id.split('-');
    let preId = args[0].previousElementSibling;
    if (preId && preId.id) {
      preId = preId.id.split('-');
    } else {
      preId = [];
    }
    if (!preId.length || preId[2] === 'n') {
      // remove item drag from DOM
      if (args[0].parentNode) {
        args[0].outerHTML = '';
      }
      let tempData = _.cloneDeep(this.tableData);
      this.tableData[elId[0]].data[0].machineName = '';
      this._changeDetectorRef.markForCheck();
      setTimeout(() => {
        this.tableData = tempData;
        this._changeDetectorRef.markForCheck();
      }, 100);
      return;
    }
    this.dragInfo.status = 'dropped';
    // rearrange
    if (elId[1] === preId[1] && elId[0] === preId[0]) {
      let listSchedulerIds = [];
      this.tableData[preId[0]].data[preId[1]]
        .machineData.forEach((item, index) => {
        if (index !== +elId[2]) {
          listSchedulerIds.push(item.id);
        }
        if (index === +preId[2]) {
          listSchedulerIds.push(
            this.tableData[elId[0]].data[elId[1]]
              .machineData[elId[2]].id
          );
        }
      });
      // call api
      this._schedulerSv.rearrangeSchedule(listSchedulerIds)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this._toastrService.success(resp.message, 'Success');
            this.getPrintTabData(this.isFilter);
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
      reASModel.printDateOnUtc = new Date(this.tableData[preId[0]].date);
      reASModel.printDateOnUtc.setHours(12, 0, 0);
      reASModel.printDateOnUtc = moment(reASModel.printDateOnUtc).format('YYYY-MM-DDTHH:mm:ss');
      reASModel.type = 0;
      reASModel.machineId = this.tableData[preId[0]].data[preId[1]].machineId;
      // get list schedule by order
      this.tableData[preId[0]].data[preId[1]]
        .machineData.forEach((item, index) => {
        if (item) {
          reASModel.listReArranges.push(item.id);
          if (index === +preId[2]) {
            reASModel.listReArranges.push(
              this.tableData[elId[0]].data[elId[1]]
                .machineData[elId[2]].id
            );
          }
        }
      });
      // call api
      this._schedulerSv.reassignSchedule(
        this.tableData[elId[0]].data[elId[1]]
          .machineData[elId[2]].id, reASModel)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this._toastrService.success(resp.message, 'Success');
            this.getPrintTabData(this.isFilter);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
    // remove item drag from DOM
    if (args[0].parentNode) {
      args[0].outerHTML = '';
    }
  }

  /**
   * Handle out event
   */
  public onOut(args) {
    // drag out of days tab
    if (args[1] && args[1].id && args[1].id.includes('days-tab')) {
      if (args[1].classList.contains('green-days-tab')) {
        args[1].classList.remove('green-days-tab');
      }
      return;
    }
  }

  public onDragend(args) {
    let elId = args[0].id.split('-');
    if (this.dragInfo.status !== 'dropped' && elId.length) {
      // remove item drag from DOM
      if (args[0].parentNode) {
        args[0].outerHTML = '';
      }
      let tempData = _.cloneDeep(this.tableData);
      this.tableData[elId[0]].data[0].machineName = '';
      this._changeDetectorRef.markForCheck();
      setTimeout(() => {
        this.tableData = tempData;
        this._changeDetectorRef.markForCheck();
      });
    }
    this.dragInfo.status = '';
    this.dragInfo.isDragging = false;
    this.dragInfo.draggingMirror = null;
  }
  //#endregion

  public filterDataByRole(data) {
    if (this._userContext.currentUser.listRole.some((i) =>
     i.roleName === 'Vulcan - Supervisor' || i.roleName === 'Vulcan - Operator')) {
      this.machineList = this.machineList.filter((m) => m.name.toLowerCase().includes('vulcan'));
      data.forEach((d) => {
        d.data = d.data.filter((r) => r.machineName.toLowerCase().includes('vulcan'));
      });
      data = data.filter((d) => d.data.length);
    }
    return data;
  }

  //#region show hide column

  /**
   * onChangeShowHideColumn
   * @param {boolean} isOpen
   */
  public onChangeShowHideColumn(isOpen: boolean): void {
    if (!isOpen) {
      let isEqual = false;
      this.showHideColumns.every((item, index) => {
        isEqual = _.isEqual(this.columns[index], item);
        return isEqual;
      });
      if (!isEqual) {
        this._progressService.start();
        setTimeout(() => {
          this.showHideColumns.forEach((item, index) => {
            Object.assign(this.columns[index], item);
          });
          this.checkColspanChange();
          if (this._userContext.currentUser.permissions) {
            const pagePermissions = this._userContext.currentUser.permissions
              .filter((i) => i.type === 4);
            this._editUserService.updateSchedulesColumnsConfig(this._userContext.currentUser.id,
              this.showHideColumns, this.colConfigKey.SchedulesPrint)
              .subscribe((resp: ResponseMessage<any>) => {
                if (resp.status) {
                  this._localStorageService.set('userInfo',
                    Object.assign({...this._userContext.currentUser},
                      {permissions: [...pagePermissions, ...this.showHideColumns]}));
                  this._changeDetectorRef.markForCheck();
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
                this._progressService.done();
              });
          }
          this._changeDetectorRef.markForCheck();
        }, 200);
      }
    }
  }
  /**
   * onCheckedColsAll
   * @param event
   */
  public onCheckedColsAll(event: any): void {
    this.isCheckedAll = event.target['checked'];
    this.showHideColumns.forEach((col) => col.isView = event.target['checked']);
    // this.recalculateHeightCell(this.orderLogData.data);
    // this._changeDetectorRef.markForCheck();
  }

  /**
   * changeCheckedCol
   * @param {Event} event
   */
  public changeCheckedCol(event: Event): void {
    this.isCheckedAll = this.showHideColumns.findIndex((col) => col.isView === false) === -1;
    // this.recalculateHeightCell(this.orderLogData.data);
    // this._changeDetectorRef.markForCheck();
  }
  /**
   * getIsViewColumn
   * @param {string} name
   * @returns {boolean}
   */
  public getIsViewColumn(name: string): boolean {
    if (this.isShowAllColumns) {
      return true;
    }
    const col = this.columns.find((i) => i.description === name);
    return col ? !!col.isView : false;
  }

  /**
   * showAllColumns
   * @param {boolean} isShowAll
   */
  public showAllColumns(isShowAll: boolean): void {
    this._progressService.start();
    setTimeout(() => {
      this.isShowAllColumns = isShowAll;
      if (this.isShowAllColumns) {
        this.totalColspan = { first: 8, second: 7 };
      } else {
        this.checkColspanChange();
      }
      this._progressService.done();
      this._localStorageService.set('isShowAll_SchedulesPrint', this.isShowAllColumns);
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  public checkColspanChange() {
    if (this.isShowAllColumns) {
      return;
    }
    const leftCol = this.colProp.slice(0, 7);
    const rightCol = this.colProp.slice(10, 16);
    this.totalColspan = { first: 8, second: 7 };
    leftCol.forEach((name) => {
      const col = this.columns.find((i) => i.description === name);
      if (col && !col.isView) {
        this.totalColspan.first--;
      }
    });
    rightCol.forEach((name) => {
      const col = this.columns.find((i) => i.description === name);
      if (col && !col.isView) {
        this.totalColspan.second--;
      }
    });
    this._changeDetectorRef.markForCheck();
  }

  //#endregion

  public exportPrintLocation(exportType: string, machineData) {
    if (exportType === 'pdf' && machineData.printLocationId) {
      let params: HttpParams = new HttpParams()
        .set('styleId', machineData.orderDetailId.toString());
      this._printMainSv.exportPrintLocationData(machineData.printLocationId, params)
        .subscribe((resp: any): void => {
          if (resp.status) {
            let data = resp;
            let values = data.headers.get('Content-Disposition');
            let filename = values.split(';')[1].trim().split('=')[1];
            // remove " from file name
            filename = filename.replace(/"/g, '');
            let blob;
            if (exportType === 'pdf') {
              blob = new Blob([(<any> data).body],
                {type: 'application/pdf'}
              );
            }
            // else if (exportType === 'xlsx') {
            //   blob = new Blob([(<any> data).body],
            //     {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
            //   );
            // }
            FileSaver.saveAs(blob, filename);
          }
        });
    }
  }

  public setDaysTab(index, activeDate?) {
    // init days tab
    this.daysTab = [];
    if (this.lateJobData.length) {
      this.daysTab.unshift({isActive: false, date: null});
    }
    this.tableDataOrigin.forEach((d, i) => {
      this.daysTab.push({
        isActive: false,
        date: d.date
      });
      if (activeDate && d.date.getDate() === activeDate.getDate() &&
        d.date.getMonth() === activeDate.getMonth()) {
        index = this.daysTab.length - 1;
      }
    });

    if (this.daysTab.length === 0) {
      this.totalSched();
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
    this.totalSched();
  }

  public removeLateJob(machineData) {
    let params: HttpParams = new HttpParams()
      .set('orderId', machineData.orderId);
    // remove at print schedule
    if (machineData.printLocationId) {
      params = params.set('printLocationId', machineData.printLocationId.toString());
    }

    let confirmModal = this._modalService.open(ConfirmDialogComponent, {
      keyboard: false,
      backdrop: 'static'
    });
    confirmModal.componentInstance.title = 'Reschedule Job';
    confirmModal.componentInstance.message =
      'Are you sure you want to reschedule this job?';
    confirmModal.result.then((res: any) => {
      if (res) {
        this._schedulesPrintService.removeStyle(machineData.id, params)
        .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
          if (resp.status) {
            this.getPrintTabData();
            this.getLateJobData();
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
      }
    }, (err) => {
      // if not, error
    });
  }

  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this._dragulaService.destroy('bag-one');
    this._localStorageService.set('isShowAll_SchedulesPrint', this.isShowAllColumns);
    this.machineHeaderSubscription.unsubscribe();
    let activeIndex = this.daysTab.findIndex((d) => d.isActive);
    if (activeIndex > -1) {
      this._localStorageService.set('activeDate_SchedulesPrint', this.daysTab[activeIndex].date);
      this._localStorageService.set(
        'lastScrollPo_SchedulesPrint', this._utilService.scrollElm.scrollTop
      );
    }
  }
}
