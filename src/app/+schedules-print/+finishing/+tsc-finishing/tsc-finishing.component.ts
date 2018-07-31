import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  HostListener,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  HttpParams
} from '@angular/common/http';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import { Subject } from 'rxjs';
import {
  Subscription
} from 'rxjs/Subscription';
import {
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  NgbDropdownConfig,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  LocalStorageService
} from 'angular-2-local-storage';

import {
  MinDate
} from '../../../shared/validators/min-date.validator';
import {
  MaxDate
} from '../../../shared/validators/max-date.validator';
import {
  ExtraValidators
} from '../../../shared/services/validation/extra-validators';

// 3rd modules
import _ from 'lodash';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  ThemeSetting
} from '../../../shared/services/theme-setting/theme-setting.service';
import {
  ValidationService
} from '../../../shared/services/validation/validation.service';
import {
  MyDatePickerService
} from '../../../shared/services/my-date-picker/my-date-picker.service';
import {
  CommonService
} from '../../../shared/services/common/common.service';
import {
  SchedulesPrintService
} from '../../schedules-print.service';
import {
  TscFinishingService
} from './tsc-finishing.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { UserContext } from '../../../shared/services/user-context/user-context';
import {
  FinishingService
} from '../finishing.service';
import { Util } from '../../../shared/services/util';
import { ProgressService } from '../../../shared/services/progress/progress.service';
import {
  EditUserService
} from '../../../+user-management/+edit-user/edit-user.service';
import {
  SchedulerService
} from '../../+scheduler/scheduler.service';
import {
  DragulaService
} from 'ng2-dragula/ng2-dragula';

// Component
import {
  ConfirmDialogComponent
} from '../../../shared/modules/confirm-dialog/confirm-dialog.component';
import {
  UploaderTypeComponent
} from '../../../shared/modules/uploader-type';
import {
  CompletePrintJobComponent
} from '../../modules/complete-print-job';
import {
  JobsHistoryComponent
} from '../../modules/jobs-history/jobs-history.component';
import {
  AddCommentComponent
} from '../../modules/add-comment';
import {
  ConfigFinishingProcessesComponent
} from '../../modules/config-finishing-processes';

// Interfaces
import {
  ResponseMessage
} from '../../../shared/models/respone.model';
import {
  IMyDateModel,
  IMyDpOptions,
  MyDatePicker
} from 'mydatepicker';
import {
  MachineList,
  ColConfigKey,
  HourOffset
} from '../../schedules-print.model';
import {
  TaskStatus
} from '../../../+order-log-v2/+order-main/order-main.model';
import {
  UploadedType
} from '../../../+order-log-v2/+sales-order/sales-order.model';
import {
  BasicGeneralInfo
} from '../../../shared/models/common.model';
import {
  StyleUploadedType
} from '../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+style/style.model';
import { AccessControlType } from '../../../+role-management/role-management.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'tsc-finishing',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's   compiler
  templateUrl: 'tsc-finishing.template.html',
  styleUrls: [
    'tsc-finishing.style.scss'
  ]
})
export class TscFinishingComponent implements OnInit,
                                              OnDestroy {

  public tableData = [];
  public tableDataOrigin = [];
  public daysTab = [];
  public lateJobData = [];
  public isOnLateTab = false;

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
  public searchObj = {
    printDate: 'Next 7 Days',
    keyword: ''
  };
  public frm: FormGroup;
  public formErrors = {
    customer: '',
    poId: '',
    // retailerPoId: '',
    styleName: '',
    // partnerStyle: '',
    printDate: '',
    printDateFromOnUtc: '',
    printDateToOnUtc: '',
    cancelDateFromOnUtc: '',
    cancelDateToOnUtc: ''
  };
  public validationMessages = {
    printDateFromOnUtc: {
      maxLength: 'Must be earlier than Start Date End.'
    },
    printDateToOnUtc: {
      maxLength: 'Must be later than Start Date Begin.'
    },
    cancelDateFromOnUtc: {
      maxLength: 'Must be earlier than Cancel Date End.'
    },
    cancelDateToOnUtc: {
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
  public printDateFromOptions: any = {
    ...this.myDatePickerOptions
  };
  public printDateToOptions: any = {
    ...this.myDatePickerOptions
  };
  public cancelDateFromOptions: any = {
    ...this.myDatePickerOptions
  };
  public cancelDateToOptions: any = {
    ...this.myDatePickerOptions
  };
  public dateInputOptions: any = {
    ...this.myDatePickerOptions,
    showClearDateBtn: false
  };
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

  public uploadedType = UploadedType;
  public styleUploadedType = StyleUploadedType;
  public fixedHeader = false;
  public preMenuPin;
  public taskStatus = TaskStatus;
  public vendorData = [];

  public isTsc = false;
  public isFilter = false;
  public isNoData = false;
  public tableDateModel = {date: null};
  public totalsQty = 0;
  public vendorId: number = null;
  public activatedRouteSub: Subscription;
  public oldInputValue: string = '';
  public calendarClicked: boolean = false;
  public oldDatePickerValue: string = '';

  public isPageReadOnly = false;
  public accessControlType = AccessControlType;
  public finishingFuncPermissions = [];

  public header;
  public cloneHeader;
  public myConfigStyleHeader = {};
  public searchedObj;
  public sumSched;

  public showHideColumns = [];
  public isCheckedAll = true;
  public columns = [];
  public isShowAllColumns = false;
  public totalColspan = { first: 6, second: 6 };
  public colConfigKey = ColConfigKey.SchedulesFinishing;
  public colType = 6;
  public colProp = [];
  public colPropFinishing = [
    'Cut Ticket #',
    'Cust / PO #',
    'Design # / Description',
    'Images',
    'Blank Style / Description',
    'Garment Color',
    'Qty (PCS)',
    'Finishing Process #',
    '# People Required',
    'Avg Pcs/Hr',
    'Hrs Needed',
    'Blank Goods ETA',
    'Goods Available',
    'Start/Cancel Ship Date',
    'Ready to Ship Date',
    'Deliver To',
    'Comments'
  ];

  public colPropVendor = [
    'Cut Ticket #',
    'Cust / PO #',
    'Design # / Description',
    'Images',
    'Blank Style / Description',
    'Garment Color',
    'Qty (PCS)',
    'Goods Available',
    'Work Required',
    'Date Needed',
    'Ship From',
    'Comments'
  ];

  public processList = [];
  public isAllowDrag = false;
  public dragInfo = {
    status: '',
    allowDrop: true,
    isDragging: false,
    draggingMirror: null
  };
  public destroy$ = new Subject<any>();

  public onScrollXDebounce = _.debounce((e) => this.onScrollX(e), 500);
  public onAppScrollDebounce = _.debounce((e) => this.appScroll(e), 100);

  private _maxWidthTable: number;
  private _lastScrollPo;

  constructor(private _router: Router,
              private _modalService: NgbModal,
              private _commonService: CommonService,
              private _schedulesPrintService: SchedulesPrintService,
              private _tscFinishingService: TscFinishingService,
              private _authService: AuthService,
              private _themeSetting: ThemeSetting,
              private _utilService: Util,
              private _toastrService: ToastrService,
              private _validationService: ValidationService,
              private _localStorageService: LocalStorageService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _userContext: UserContext,
              private _activatedRoute: ActivatedRoute,
              private _finishingSv: FinishingService,
              private _ngbDropdownConfig: NgbDropdownConfig,
              private _progressService: ProgressService,
              private _editUserService: EditUserService,
              private _schedulerSv: SchedulerService,
              private _dragulaService: DragulaService,
              public myDatePickerService: MyDatePickerService) {
    // drag config
    _dragulaService.setOptions('bag-one', {
      accepts: this.validateDrop.bind(this),
      moves: this.validDrag.bind(this),
      copy: true,
      copySortSource: true
    });
    _dragulaService.drop.asObservable().takeUntil(this.destroy$).subscribe((value) => {
      this.onDrop(value.slice(1));
    });
    _dragulaService.dragend
      .asObservable().takeUntil(this.destroy$).subscribe((value) => {
      this.onDragend(value.slice(1));
    });
    _dragulaService.over.asObservable().takeUntil(this.destroy$).subscribe((value) => {
      this.onOver(value.slice(1));
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

    let fontSize = this._localStorageService.get('fontSize_Finishing') as string;
    if (fontSize) {
      const modal = {'font-size': fontSize};
      Object.assign(this.myConfigStyle, modal);
      const fontSizeNumber = +fontSize.slice(0, fontSize.length - 2);
      this.fontSizeClass[`font-size-${fontSizeNumber}`] = true;
    } else {
      this._localStorageService.set('fontSize_Finishing', this.myConfigStyle['font-size']);
    }
  }

  public ngOnInit(): void {
    this.initialPermission();
    this.buildForm();
    this.getCommonData();
    this.activatedRouteSub = this._activatedRoute.params
      .subscribe((params: { id: number }) => {
        // save active date tab
        let activeIndex = this.daysTab.findIndex((d) => d.isActive);
        if (activeIndex > -1) {
          if (this.vendorId) {
            this._localStorageService.set(
              'activeDate_SchedulesFinishing_' + this.vendorId,
              this.daysTab[activeIndex].date
            );
          } else {
            this._localStorageService.set(
              'activeDate_SchedulesFinishing',
              this.daysTab[activeIndex].date
            );
          }
        }

        let id = Number(params.id);
        this.vendorId = isNaN(id) ? undefined : id;
        this.checkIsTsc();
        this.getSearchFilterSv();
        this.daysTab = [];
        this.lateJobData = [];
        this.getPrintTabData();
        this.getLateJobData();
      });
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
    if (this.getIsModifyFunc('Reschedule')) {
      this.isAllowDrag = true;
    }
  }

  public initialPermission(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Schedules.Finishing');
    // Get Print Function Permission from user info
    const funcPermission = this._userContext.currentUser.permissions
      .filter((i) => i.type === this.accessControlType.Functions);
    this.finishingFuncPermissions = funcPermission
      .filter((i) => i.name.includes('Schedules.Finishing'));
    // -------
  }

  public changeFontSize(fontSize) {
    // deactive previous font size
    let fontSizeId = this.fontSizeData.indexOf(this.myConfigStyle['font-size']);
    this.fontSizeClass[this.fontSizeIndex[fontSizeId]] = false;

    // active new font size
    this.myConfigStyle['font-size'] = fontSize;
    this._localStorageService.set('fontSize_Finishing', fontSize);
    fontSizeId = this.fontSizeData.indexOf(fontSize);
    this.fontSizeClass[this.fontSizeIndex[fontSizeId]] = true;
  }

  public getCommonData(): void {
    this._commonService.getMachineNVendor('Finishing')
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.vendorData = resp.data;
          this.checkIsTsc();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._commonService.getProcesses()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          if (!resp.data || !resp.data.length) {
            return;
          }
          resp.data.forEach((d, index) => {
            this.processList.push(
              {number: d['processNumber'], name: d['name'], isCustom: d['isCustom']}
            );
          });
          this.processList = _.sortBy(this.processList, 'number');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public checkIsTsc(): void {
    if (this.vendorData) {
      this.isTsc = this.vendorData.findIndex((i) =>
        i.id === this.vendorId && i.name === 'TSC') > -1;
      this.configColumn();
    }
  }

  public getPrintTabData(search?) {
    let subTableData = [];
    const data = this.frm.value;
    let curDate = new Date();
    curDate.setHours(-HourOffset, 0, 0);
    let params: HttpParams = new HttpParams()
      .set('printDateFromOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'))
      .set('hourOffset', HourOffset.toString())
      .set('vendorId', this.vendorId ? this.vendorId.toString() : '')
      .set('keyword', this.searchObj.keyword)
      .set('poId', data['poId'])
      .set('customer', data['customer'])
      .set('styleName', data['styleName'])
      .set('cancelDateFromOnUtc', data['cancelDateFromOnUtc'])
      .set('cancelDateToOnUtc', data['cancelDateToOnUtc']);
    switch (data['printDate']) {
      case 'Yesterday':
        curDate.setDate(curDate.getDate() - 1);
        subTableData.push(
          {
            date: new Date(curDate.getTime()),
            data: [],
            totalsSchedQty: 0,
            totalsCompQty: 0,
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
            totalsSchedQty: 0,
            totalsCompQty: 0,
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
              totalsSchedQty: 0,
              totalsCompQty: 0,
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
        if (!data['printDateFrom'] || !data['printDateTo']) {
          this._toastrService.error('Please select start date and end date!', 'Error');
        } else {
          let timeDiff =
                Math.abs(data['printDateTo'].jsdate.getTime() -
                  data['printDateFrom'].jsdate.getTime());
          for (let i = 0; i < Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; i++) {
            curDate = new Date(data['printDateFrom'].jsdate.getTime());
            curDate.setDate(curDate.getDate() + i);
            subTableData.push(
              {
                date: curDate,
                data: [],
                totalsSchedQty: 0,
                totalsCompQty: 0,
                totalRecord: 0
              }
            );
          }

          let dateFrom = new Date(data['printDateFrom'].jsdate.getTime());
          let dateTo = new Date(data['printDateTo'].jsdate.getTime());
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
              totalsSchedQty: 0,
              totalsCompQty: 0,
              totalRecord: 0
            }
          );
        }
        break;
    }

    this._tscFinishingService.getFinishingData(params)
      .subscribe((resp: ResponseMessage<any>): void => {
        if (resp.status) {
          this.searchedObj = {...this.frm.value};
          if (!resp.data) {
            return;
          }
          if (!resp.data.length) {
            this.isNoData = true;
          } else {
            this.isNoData = false;
          }
          this.tableData = subTableData;
          this.updateProcessList(resp.data);
          this.setDataTable(resp.data, search);
          if (!this.daysTab.length  || (this.daysTab.length === 1 && !this.daysTab[0].date)) {
            let activeDate = this.vendorId ?
              this._localStorageService.get('activeDate_SchedulesFinishing_' + this.vendorId) :
              this._localStorageService.get('activeDate_SchedulesFinishing');
            let lastScrollPo = this._localStorageService.get('lastScrollPo_SchedulesFinishing');
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
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public getLateJobData() {
    let params: HttpParams = new HttpParams()
      .set('hourOffset', HourOffset.toString())
      .set('isLateJob', 'true')
      .set('vendorId', this.vendorId ? this.vendorId.toString() : '');
    // // get last scroll
    // this._lastScrollPo = this._utilService.scrollElm.scrollTop;
    this._tscFinishingService.getFinishingData(params)
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
                totalsSchedQty: 0,
                totalsCompQty: 0,
                totalRecord: 0
              }
            );
          }
          this.updateProcessList(resp.data);
          this.setDataTable(resp.data, true, true);
          // if (!this.daysTab.length ||
          //   (this.daysTab.length && this.daysTab[0].date !== null)) {
          //   this.daysTab.unshift({isActive: false, date: null});
          // }
          // if (this.daysTab.length) {
          //   this.daysTab[0].isActive = true;
          //   if (this.daysTab[1]) {
          //     this.daysTab[1].isActive = false;
          //   }
          //   this.isOnLateTab = true;
          //   this.tableData = this.lateJobData;
          //   this.totalSched();
          // }
          // first time get late data
          if (!this.daysTab.length ||
            (this.daysTab.length && this.daysTab[0].date !== null)) {
            this.daysTab.unshift({isActive: false, date: null});
            let activeDate = this.vendorId ?
              this._localStorageService.get('activeDate_SchedulesFinishing_' + this.vendorId) :
              this._localStorageService.get('activeDate_SchedulesFinishing');
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

  public buildForm(): void {
    let controlConfig = {
      customer: new FormControl(''),
      poId: new FormControl(''),
      // retailerPoId: new FormControl(''),
      // partnerStyle: new FormControl(''),
      printDate: new FormControl('Next 7 Days'),
      styleName: new FormControl(''),
      printDateFrom: new FormControl(''),
      printDateFromOnUtc: new FormControl('', [
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
          MaxDate('printDateToOnUtc', 1)
        ])
      ]),
      printDateTo: new FormControl(''),
      printDateToOnUtc: new FormControl('', [
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
          MinDate('printDateFromOnUtc', 1)
        ])
      ]),
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
        // partnerStyle: {
        //   required: false
        // },
        printDate: {
          required: false
        },
        printDateFromOnUtc: {
          required: false
        },
        printDateToOnUtc: {
          required: false
        },
        cancelDateFromOnUtc: {
          required: false
        },
        cancelDateToOnUtc: {
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

  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    let firstCaseList = [
      'printDateFromOnUtc',
      'printDateToOnUtc'
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

  public setFilterFrmDateValue(): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (this.frm.get(importName).value) {
        const utcDate = new Date(this.frm.get(importName).value);
        utcDate.setHours(0, 0, 0);
        this.configDateOptions(importName, utcDate);
        this.frm.get(exportName).setValue({
          date: {
            year: utcDate.getFullYear(),
            month: utcDate.getMonth() + 1,
            day: utcDate.getDate()
          },
          jsdate: utcDate
        });
      }
    };
    patchDateFunc('printDateFromOnUtc', 'printDateFrom');
    patchDateFunc('printDateToOnUtc', 'printDateTo');
    patchDateFunc('cancelDateFromOnUtc', 'cancelDateFrom');
    patchDateFunc('cancelDateToOnUtc', 'cancelDateTo');
  }

  /**
   * Update form value
   * @param data
   */
  public updateForm(data) {
    this.frm.patchValue(data);
    this.setFilterFrmDateValue();
    this._changeDetectorRef.markForCheck();
  }

  public getSearchFilterSv() {
    // get search filter
    if (this._finishingSv.searchObj) {
      this.updateForm(this._finishingSv.searchObj);
    } else {
      this._finishingSv.searchObj = JSON.parse(JSON.stringify(this.frm.value));
      delete this._finishingSv.searchObj.formRequires;
    }

    let data = this.frm.value;
    if (data['poId'] ||
      // data['retailerPoId'] ||
      data['customer'] ||
      data['styleName'] ||
      // data['partnerStyle'] ||
      data['cancelDateFromOnUtc'] ||
      data['cancelDateToOnUtc'] ||
      data['printDate'] === 'Custom') {
      this.isFilter = true;
    } else {
      this.isFilter = false;
    }

    // set last tab
    this._finishingSv.searchFrom = 'finishing';
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event) {
    this._maxWidthTable = null;
    setTimeout(() => {
      this.updateHeader();
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  public updateHeader(): void {
    const dataTableList: NodeListOf<Element> = document.querySelectorAll('#table .necklabel-table');
    if (dataTableList && dataTableList.length) {
      let lastTable = dataTableList[0];
      this._maxWidthTable = 0;
      [].forEach.call(dataTableList, (table, index) => {
        this._maxWidthTable = table.offsetWidth > this._maxWidthTable
          ? table.offsetWidth : this._maxWidthTable;
        if (table.getBoundingClientRect().top < 150) {
          lastTable = table;
        }
      });
      this.header = lastTable;
      this.myConfigStyleHeader = {
        ...this.myConfigStyleHeader,
        width: `${lastTable['offsetWidth']}px`
      };
      this.cloneHeader = this.header.cloneNode(true);
    }
  }

  @HostListener('window:scroll', ['$event'])
  public onAppScroll(event: any) {
    this.onAppScrollDebounce(event);
  }

  public appScroll(event: any) {
    let fixedHeader = document.getElementById('header');
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
    if (event.target.scrollingElement.scrollTop >= 100
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

    // modalRef.componentInstance.isFromPrint = true;
    modalRef.componentInstance.machineData = data;
    modalRef.componentInstance.schedulerId = data.id;
    // modalRef.componentInstance.isTsc = this.isTsc;
    // modalRef.componentInstance.isTsc = false;
    if (data.isLateOriginal) {
      modalRef.componentInstance.isLateOriginal = true;
    }
    if (data.isLateRescheduled) {
      modalRef.componentInstance.isLateRescheduled = true;
    }

    modalRef.result.then((res: any) => {
      this.getPrintTabData();
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
        this.getPrintTabData();
        this.getLateJobData();
      }
    }, (err) => {
      // if not, error
    });
  }

  public configFinishingProcess(data) {
    if (this.isPageReadOnly || data.isArchived || this.isOnLateTab ||
      (data.processStatus >= 3 && data.processStatus < 7)) {
      return;
    }
    let modalRef = this._modalService.open(ConfigFinishingProcessesComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static'
    });

    modalRef.componentInstance.schedulerId = data.id;
    modalRef.componentInstance.processNumber = data.processNumber;
    modalRef.componentInstance.processName = data.processName;
    modalRef.componentInstance.processDetail.scheduledQty = data.scheduledQty;

    modalRef.result.then((res: any) => {
      if (res) {
        this.getPrintTabData();
      }
    }, (err) => {
      // if not, error
    });
  }

  public setDataTable(data, search?: boolean, isLateJob?: boolean) {
    if (this.isTsc) {
      data.forEach((dayData) => {
        dayData.data = dayData.data.filter((d) => d.processNumber !== null || d.isMaintenanceJob);
      });
      data = data.filter((d) => d.data.length);
    }
    this.totalsQty = 0;
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
        dayData.totalRecord = data[index].data.length;
        dayData.totalsRuntime = 0;
        let schedulerGroupObj = _.groupBy(data[index].data, 'vendorName');
        Object.keys(schedulerGroupObj).forEach((key) => {
          let sumSchedUnits = 0;
          let sumCompUnits = 0;
          let sumRT = 0;
          schedulerGroupObj[key].forEach((scheduler: any) => {
            sumSchedUnits += scheduler.scheduledQty;
            sumCompUnits += scheduler.completedQty;
            dayData.totalsSchedQty += scheduler.scheduledQty;
            dayData.totalsCompQty += scheduler.completedQty;
            // calculate actual run time
            let timeDiff = 0;
            if (scheduler.startedTimeOnUtc && scheduler.completedTimeOnUtc) {
              let start = moment(scheduler.startedTimeOnUtc).toDate();
              let comp = moment(scheduler.completedTimeOnUtc).toDate();
              start.setSeconds(0);
              comp.setSeconds(0);
              timeDiff = Math.abs(comp.getTime() - start.getTime());
              scheduler.actualRT = timeDiff / (1000 * 3600);
              sumRT += timeDiff / (1000 * 3600);
            }
            dayData.totalsRuntime += timeDiff / (1000 * 3600);
          });
          if (!this.isTsc) {
            schedulerGroupObj[key] = _.sortBy(schedulerGroupObj[key], 'orderNum');
          }
          dayData.data.push({
            vendorName: key.toString(),
            data: schedulerGroupObj[key],
            sumSchedQty: sumSchedUnits,
            sumCompQty: sumCompUnits,
            sumActualRT: sumRT
          });
        });
        this.totalsQty += dayData.totalsSchedQty;
      } else if (!search) {
        dayData.data = [
          {
            vendorName: '',
            data: [],
            sumSchedQty: 0,
            sumCompQty: 0,
            sumActualRT: 0
          }
        ];
        dayData.isNoData = true;
      }
    });
    // only show day contain data if search mode on
    if (this.isFilter || search) {
      this.tableData = this.tableData.filter((d) => !d.isNoData);
    }
    if (!isLateJob) {
      // save origin data
      this.tableDataOrigin = _.cloneDeep(this.tableData);
    } else {
      this.lateJobData = _.cloneDeep(this.tableData.filter((d) => d.data.length));
    }
  }

  public onFilter() {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
      return;
    }

    // set search filter service
    let newSearchObj = {...this._finishingSv.searchObj, ...this.frm.value};
    this._finishingSv.searchObj = JSON.parse(JSON.stringify(newSearchObj));
    delete this._finishingSv.searchObj.formRequires;

    // reset days tab when search
    this.daysTab = [];
    if (this.vendorId) {
      this._localStorageService.set('activeDate_SchedulesFinishing_' + this.vendorId, null);
    } else {
      this._localStorageService.set('activeDate_SchedulesFinishing', null);
    }
    this._localStorageService.set('lastScrollPo_SchedulesFinishing', 0);

    let data = this.frm.value;
    if (data['poId'] ||
      // data['retailerPoId'] ||
      data['customer'] ||
      data['styleName'] ||
      // data['partnerStyle'] ||
      data['cancelDateFromOnUtc'] ||
      data['cancelDateToOnUtc'] ||
      data['printDate'] === 'Custom') {
      this.isFilter = true;
    } else {
      this.isFilter = false;
    }
    this.getPrintTabData();
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
    this.frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');
    this.configDateOptions(prop, utcDate.jsdate);
    // Update status for form control whose value changed
    this.frm.get(prop).markAsDirty();
    this._changeDetectorRef.markForCheck();
  }

  public configDateOptions(prop: string, utcDate: Date): void {
    let dateCurrentSince;
    let dateCurrentUntil;
    if (utcDate) {
      dateCurrentSince = {
        year: utcDate.getFullYear(),
        month: utcDate.getMonth() + 1,
        day: utcDate.getDate()
      };
      dateCurrentUntil = {
        year: utcDate.getFullYear(),
        month: utcDate.getMonth() + 1,
        day: utcDate.getDate()
      };
    } else {
      dateCurrentSince = {
        year: 0,
        month: 0,
        day: 0
      };
      dateCurrentUntil = {
        year: 0,
        month: 0,
        day: 0
      };
    }
    switch (prop) {
      case 'printDateFromOnUtc':
        this.printDateToOptions = {
          ...this.printDateToOptions,
          disableUntil: dateCurrentUntil,
          enableDays: [dateCurrentUntil]
        };
        break;
      case 'printDateToOnUtc':
        this.printDateFromOptions = {
          ...this.printDateFromOptions,
          disableSince: dateCurrentSince,
          enableDays: [dateCurrentSince]
        };
        break;
      case 'cancelDateFromOnUtc':
        this.cancelDateToOptions = {
          ...this.cancelDateToOptions,
          disableUntil: dateCurrentUntil,
          enableDays: [dateCurrentUntil]
        };
        break;
      case 'cancelDateToOnUtc':
        this.cancelDateFromOptions = {
          ...this.cancelDateFromOptions,
          disableSince: dateCurrentSince,
          enableDays: [dateCurrentSince]
        };
        break;
      default:
        return;
    }
    this._changeDetectorRef.markForCheck();
  }

  public calendarClick(cal: MyDatePicker, $event) {
    this.calendarClicked = true;
    this.oldDatePickerValue = $event.target.value;
    let input = cal.elem.nativeElement.getElementsByTagName('input');
    if (input[0]) {
      input[0].select();
      input[0].addEventListener('keypress', (e) => {
        let key = e.which || e.keyCode;
        if (key === 13) { // key enter
          input[0].blur();
        }
      });
      input[0].addEventListener('keyup', (e) => {
        let key = e.which || e.keyCode;
        if (key === 27) { // key esc
          $event.target.value = this.oldDatePickerValue;
          input[0].blur();
        }
      });
      input[0].addEventListener('blur', (e) => {
        if (!this.onInputFieldChanged($event.target, cal)) {
          setTimeout(() => {
            $event.target.value = this.oldDatePickerValue;
            this.onInputFieldChanged($event.target, cal);
          }, 200);
        }
        setTimeout(() => {
          input[0].blur();
        }, 300);
      });
    }
  }

  public onInputFieldChanged($event, cal: MyDatePicker): boolean {
    let dateRegex = /^\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})$/;
    let date = new Date($event.value);
    let alertSpan = cal.elem.nativeElement.nextElementSibling;
    if (!alertSpan || alertSpan.tagName !== 'SPAN' || !$event.value) {
      return false;
    }
    if ($event.value !== '' && (!dateRegex.test($event.value) || isNaN(date.getTime()))) {
      if ($event.value.length >= 6) {
        alertSpan.classList.remove('hide');
      }
      return false;
    } else {
      if (!alertSpan.classList.contains('hide')) {
        alertSpan.className += ' hide';
      }
    }
    return true;
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public updateDate(event: IMyDateModel, prop: string, scheduler: any) {
    let utcDate = Object.assign({}, event);
    scheduler[prop] = utcDate.jsdate ? utcDate.formatted : '';
    if (!this.calendarClicked) {
      return;
    }
    this.calendarClicked = false;
    this.updateScheduler(scheduler);
  }

  public updateInput(scheduler, $event, fieldName?) {
    // backup input number if invalid
    if (fieldName && isNaN($event.target.value)) {
      $event.target.value = this.oldInputValue;
      scheduler[fieldName] = this.oldInputValue;
      return;
    }
    if ($event.target.value === this.oldInputValue) {
      return;
    }
    this.updateScheduler(scheduler);
  }

  public updateScheduler(scheduler, $event?, fieldName?: string) {
    // scheduler.peopleRequired -= 0;
    // scheduler.avgPcsHr -= 0;
    // scheduler.hrsNeeded -= 0;
    let model = {
      finishingProcess: scheduler.finishingProcess,
      peopleRequired: scheduler.peopleRequired,
      avgPcsHr: scheduler.avgPcsHr,
      hrsNeeded: scheduler.hrsNeeded,
      goodsAvailable: scheduler.goodsAvailable,
      dateNeeded: scheduler.dateNeeded,
      workRequired: scheduler.workRequired,
      shipFrom: scheduler.shipFrom
    };
    let params: HttpParams = new HttpParams()
      .set('isTscFinishing', this.isTsc.toString());
    if (scheduler.printLocationId) {
      params = params.set('printLocationId', scheduler.printLocationId.toString());
    }
    if (scheduler.neckLabelId) {
      params = params.set('neckLabelId', scheduler.neckLabelId.toString());
    }
    if (scheduler.orderDetailId) {
      params = params.set('orderDetailId', scheduler.orderDetailId.toString());
    }
    this._schedulesPrintService.updateSchedulesDetail(scheduler.id, model, params)
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
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
    this.myConfigStyleHeader = {
      ...this.myConfigStyleHeader,
      left: this.header ? `${this.header.getBoundingClientRect().left}px` : 'auto',
      right: this.header ? `${this.header.getBoundingClientRect().right}px` : 'auto'
    };
  }

  public getMaxWidthTable(): string {
    return this._maxWidthTable > 0 ? `${this._maxWidthTable}px` : 'auto';
  }

  public getMinWidthDependFontSize(minWidth: number): string {
    const fontSize = +this.myConfigStyle['font-size']
      .slice(0, this.myConfigStyle['font-size'].length - 2);
    return `${minWidth - (11 - fontSize) * 3}px`;
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

  public exportFinishing(exportType: string) {
    let activeDate = this.daysTab.find((d) => d.isActive);
    if (!activeDate.date) {
      this._toastrService.error('Cannot export late job!', 'Error');
      return;
    }
    let hasData = false;
    this.tableData.forEach((d) => {
      if (d.totalRecord > 0) {
        hasData = true;
      }
    });
    if (!hasData) {
      this._toastrService.error('There are no jobs schedules for the selected date', 'Error');
      return;
    }
    if (exportType === 'pdf') {
      const data = this.frm.value;
      let curDate = moment(activeDate.date).toDate();
      curDate.setHours(-HourOffset, 0, 0);
      let params: HttpParams = new HttpParams()
        .set('printDateFromOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'))
        .set('hourOffset', HourOffset.toString())
        .set('isTsc', this.isTsc.toString())
        .set('vendorId', this.vendorId ? this.vendorId.toString() : '')
        .set('keyword', this.searchObj.keyword)
        .set('poId', data['poId'])
        .set('customer', data['customer'])
        .set('styleName', data['styleName'])
        .set('cancelDateFromOnUtc', data['cancelDateFromOnUtc'])
        .set('cancelDateToOnUtc', data['cancelDateToOnUtc']);

      curDate.setHours(23 - HourOffset, 59, 59);
      params = params.set('printDateToOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));

      if (this.searchObj['machine'] && this.searchObj['machine'].length) {
        params = params.set('machines', this.searchObj['machine'].toString());
      }

      this._tscFinishingService.exportFinishingData(params)
        .subscribe((resp: any): void => {
          if (resp.status) {
            let dataRes = resp;
            let values = dataRes.headers.get('Content-Disposition');
            let filename = values.split(';')[1].trim().split('=')[1];
            // remove " from file name
            filename = filename.replace(/"/g, '');
            let blob;
            if (exportType === 'pdf') {
              blob = new Blob([(<any> dataRes).body],
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

  public setDateValue(scheduler: any): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (scheduler[importName]) {
        let currentDate = new Date(scheduler[importName]);
        scheduler[exportName] = {
          date: {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            day: currentDate.getDate()
          }
        };
      }
    };
    patchDateFunc('goodsAvailableFromOnUtc', 'goodsAvailableFrom');
    patchDateFunc('goodsAvailableToOnUtc', 'goodsAvailableTo');
    patchDateFunc('dateNeededFromOnUtc', 'dateNeededFrom');
    patchDateFunc('dateNeededToOnUtc', 'dateNeededTo');
    this._changeDetectorRef.markForCheck();
  }

  public openUploader(styleId: number, type: number, title: string): void {
    let fileList = [];
    this._tscFinishingService.getStyleFile(styleId)
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

  public inputClick($event) {
    this.oldInputValue = $event.target.value;
    $event.target.select();
  }

  public inputEsc($event) {
    $event.target.value = this.oldInputValue;
    $event.target.blur();
  }

  public isNaN(num): boolean {
    return isNaN(num);
  }

  public getIsModifyFunc(name: string): boolean {
    const status = this.finishingFuncPermissions.find((i) => i.name.includes(name));
    return status ? status.isModify : true;
  }

  public openHistory(id: number) {
    let modalRef = this._modalService.open(JobsHistoryComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static',
      windowClass: 'modal-w-1000'
    });
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.isFinishing = true;

    modalRef.result.then((res: any) => {
      if (res) {
        // e
      }
    }, (err) => {
      // if not, error
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

  public totalSched() {
    this.sumSched = 0;
    this.tableData.forEach((dayData) => {
      dayData.data.forEach((rowData) => {
        rowData.data.forEach((mcData) => {
          if (mcData) {
            this.sumSched++;
          }
        });
      });
    });
  }

  //#region show hide column

  public configColumn() {
    if (!this.isTsc) {
      this.colConfigKey = ColConfigKey.SchedulesOutsourceFinishing;
      this.colType = 10;
      this.colProp = [];
    } else {
      this.colConfigKey = ColConfigKey.SchedulesFinishing;
      this.colType = 6;
      this.colProp = [];
    }
    // Config columns
    let colSchedulesConfigs = this._userContext.currentUser.schedulesColumnConfigs;
    const printConfig = this._userContext.currentUser
      .permissions.filter((i) => i.type === this.colType);
    if (colSchedulesConfigs && colSchedulesConfigs.length) {
      const colConfigs = colSchedulesConfigs.find((i) => i.key === this.colConfigKey);
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
        .permissions.filter((i) => i.type === this.colType);
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
      .permissions.filter((i) => i.type === this.colType);
    }

    this.showHideColumns.forEach((item) => {
      this.columns.push(Object.assign({}, item));
      this.colProp.push(item.description);
    });
    this.isCheckedAll = this.showHideColumns.every((i) => i.isView === true);
    this.isShowAllColumns = !!this._localStorageService.get('isShowAll_SchedulesFinishing');
    this.checkColspanChange();
    // --------------
  }

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
        this.checkColspanChange();
        this._progressService.start();
        setTimeout(() => {
          this.showHideColumns.forEach((item, index) => {
            Object.assign(this.columns[index], item);
          });
          this.checkColspanChange();
          if (this._userContext.currentUser.permissions) {
            const pagePermissions = this._userContext.currentUser.permissions
              .filter((i) => i.type === this.colType);
            this._editUserService.updateSchedulesColumnsConfig(this._userContext.currentUser.id,
              this.showHideColumns, this.colConfigKey)
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
          this.updateHeader();
        }, 200);
      }
    }
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
        this.totalColspan = { first: 6, second: 6 };
      } else {
        this.checkColspanChange();
      }
      this._progressService.done();
      this._localStorageService.set('isShowAll_SchedulesFinishing', this.isShowAllColumns);
      this._changeDetectorRef.markForCheck();
    }, 200);
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

  public checkColspanChange() {
    if (this.isShowAllColumns) {
      return;
    }
    const leftCol = this.colProp.slice(0, 6);
    const rightCol = this.colProp.slice(7, 17);
    this.totalColspan = { first: 6, second: 6 };
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

  public hasDataByProcess(data, processNum) {
    return data.some((i) => i.processNumber === processNum);
  }

  public calculateQtyByProcess(data, processNum) {
    let rs = {comp: 0, sched: 0};
    let processData = data.filter((i) => i.processNumber === processNum);
    processData.forEach((i) => {
      rs.comp += i.completedQty;
      rs.sched += i.scheduledQty;
    });
    return rs;
  }

  public calculateHrsByProcess(data, processNum) {
    let hrs = 0;
    let sumRT = 0;
    let processData = data.filter((i) => i.processNumber === processNum);
    if (processNum === null) {
      processData = data;
    }
    processData.forEach((i) => {
      hrs += this.roundedTime(i.hrsNeeded);
      if (i.actualRT) {
        sumRT += i.actualRT;
      }
      // rs.sched += i.scheduledQty;
    });
    return {hrsNeeded: hrs, sumActualRT: sumRT};
  }

  //#region drag event
  /**
   * Prevent drag on invalid row
   */
  public validDrag(el, container, handle) {
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
        let isDragToLateTab = args[1].id.endsWith('-0') && this.lateJobData.length;
        args[0].hidden = true;
        if (!args[1].classList.contains('green-days-tab') &&
        !args[1].classList.contains('active') && !isDragToLateTab) {
          args[1].classList.add('green-days-tab');
        }
        return;
      }
      //#endregion
      //#region init
      let elId = args[0].id.split('-');
      const colCount = 13;
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
      if (elId[0] === '0' && elId[2] === '0' && args[0].cells.length > colCount) {
        args[0].deleteCell(0);
      }
      //#endregion

      //#region prevent drag to other process
      if (args[1].classList.contains('invalid-area')) {
        args[1].classList.remove('invalid-area');
        this.dragInfo.allowDrop = true;
      }
      if ((elId[0] === preId[0] && this.isTsc) || elId.length < 3 || preId.length < 3) {
        args[1].classList.add('invalid-area');
        this.dragInfo.allowDrop = false;
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
        type: 2
      };
      reASModel.vendorId = this.vendorId;
      if (!reASModel.vendorId) {
        reASModel.vendorId = this.tableData[elIndex[0]].data[elIndex[1]].data[elIndex[2]].vendorId;
      }
      reASModel.printDateOnUtc = new Date(this.daysTab[dropTabIndex].date.getTime());
      reASModel.printDateOnUtc.setHours(12, 0, 0);
      reASModel.printDateOnUtc = moment(reASModel.printDateOnUtc).format('YYYY-MM-DDTHH:mm:ss');
      // make message
      let dragFrDate = this.daysTab[this.daysTab.findIndex((d) => d.isActive)].date;
      if (!dragFrDate) {
        dragFrDate = this.tableData[elIndex[0]].date;
      }
      const mess = `Finishing schedule item successfully moved from 
      ${this.tableData[elIndex[0]].data[elIndex[1]].vendorName} on 
      ${moment(dragFrDate).format('M/D')} to
      ${this.tableData[elIndex[0]].data[elIndex[1]].vendorName} on 
      ${moment(reASModel.printDateOnUtc).format('M/D')}.`;
      // call api
      this._schedulerSv.reassignSchedule(
        this.tableData[elIndex[0]].data[elIndex[1]].data[elIndex[2]].id, reASModel)
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
    if (!this.dragInfo.allowDrop) {
      return;
    }
    this.dragInfo.status = 'dropped';
    // rearrange
    if (elId[1] === preId[1] && elId[0] === preId[0]) {
      if (!this.isTsc) {
        let listSchedulerIds = [];
        this.tableData[preId[0]].data[0].data.forEach((item, index) => {
          if (index !== +elId[2]) {
            listSchedulerIds.push(item.id);
          }
          if (index === +preId[2]) {
            listSchedulerIds.push(
              this.tableData[elId[0]].data[0].data[elId[2]].id
            );
          }
        });
        // call api
        this._schedulerSv.rearrangeSchedule(listSchedulerIds)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              this._toastrService.success(resp.message, 'Success');
              this.getPrintTabData();
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
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
      reASModel.type = 2;
      reASModel.vendorId = this.vendorId;
      if (!reASModel.vendorId) {
        reASModel.vendorId = this.tableData[preId[0]].data[preId[1]].data[preId[2]].vendorId;
      }
      // get list schedule by order
      let eMCIndex = 0;
      if (!this.isTsc) {
        let pMCIndex = +preId[1];
        eMCIndex = +elId[1];
        if (this.vendorId) {
          pMCIndex = 0;
          eMCIndex = 0;
        }
        this.tableData[preId[0]].data[pMCIndex].data.forEach((item, index) => {
          if (item) {
            reASModel.listReArranges.push(item.id);
            if (index === +preId[2]) {
              reASModel.listReArranges.push(
                this.tableData[elId[0]].data[eMCIndex].data[elId[2]].id
              );
            }
          }
        });
      }
      // call api
      this._schedulerSv.reassignSchedule(
        this.tableData[elId[0]].data[eMCIndex].data[elId[2]].id, reASModel)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this._toastrService.success(resp.message, 'Success');
            this.getPrintTabData();
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
    // remove at finishing schedule
    if (machineData.orderDetailId) {
      params = params.set('orderDetailId', machineData.orderDetailId.toString());
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
        .subscribe((resp: ResponseMessage<any>) => {
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

  public roundedTime(value) {
    let roundedNum = value - Number.parseInt(value);
    roundedNum = Math.round(roundedNum * 60);
    return Number.parseInt(value) + roundedNum / 60;
  }

  public updateProcessList(data) {
    data.forEach((dt) => {
      dt.data.forEach((item) => {
        let prs = this.processList.find((p) => p.number === item.processNumber);
        if (item.isCustomProcess && !prs) {
          this.processList.push(
            {number: item.processNumber, name: item.processNumber, isCustom: true}
          );
        }
      });
    });
    this.processList = _.sortBy(this.processList, 'number');
  }

  public ngOnDestroy() {
    this.activatedRouteSub.unsubscribe();
    this.onAppScrollDebounce.cancel();
    this.onScrollXDebounce.cancel();
    this._localStorageService.set('isShowAll_SchedulesFinishing', this.isShowAllColumns);
    this.destroy$.next();
    this.destroy$.complete();
    this._dragulaService.destroy('bag-one');
    let activeIndex = this.daysTab.findIndex((d) => d.isActive);
    if (activeIndex > -1) {
      if (this.vendorId) {
        this._localStorageService.set(
          'activeDate_SchedulesFinishing_' + this.vendorId,
          this.daysTab[activeIndex].date
        );
      } else {
        this._localStorageService.set(
          'activeDate_SchedulesFinishing',
          this.daysTab[activeIndex].date
        );
      }
    }
    this._localStorageService.set(
      'lastScrollPo_SchedulesFinishing', this._utilService.scrollElm.scrollTop
    );
  }
}
