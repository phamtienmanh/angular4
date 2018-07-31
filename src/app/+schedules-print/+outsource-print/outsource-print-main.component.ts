import {
  Component,
  OnInit,
  ViewEncapsulation,
  AfterViewInit,
  AfterViewChecked,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Subject
} from 'rxjs';
import 'rxjs/add/operator/takeUntil';

import {
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  Subscription
} from 'rxjs/Subscription';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';
import {
  NgbDropdownConfig,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import _ from 'lodash';
import * as moment from 'moment';

// Services
import {
  RouterService
} from '../../core/router';
import {
  Util
} from '../../shared/services/util';
import {
  CommonService
} from '../../shared/services/common/common.service';
import {
  SchedulesPrintService
} from '../schedules-print.service';
import {
  ThemeSetting
} from '../../shared/services/theme-setting';
import * as FileSaver from 'file-saver';
import {
  OutsourcePrintMainService
} from './outsource-print-main.service';
import { AuthService } from '../../shared/services/auth/auth.service';
import {
  ValidationService
} from '../../shared/services/validation/validation.service';
import {
  MyDatePickerService
} from '../../shared/services/my-date-picker/my-date-picker.service';
import {
  ExtraValidators
} from '../../shared/services/validation/extra-validators';
import {
  UserContext
} from '../../shared/services/user-context/user-context';
import {
  TscPrintService
} from '../+tsc-print/tsc-print.service';
import {
  EditUserService
} from '../../+user-management/+edit-user/edit-user.service';
import { ProgressService } from '../../shared/services/progress/progress.service';
import {
  SchedulerService
} from '../+scheduler/scheduler.service';
import {
  DragulaService
} from 'ng2-dragula/ng2-dragula';

// Component
import {
  CompletePrintJobComponent
} from '../modules/complete-print-job';
import {
  JobsHistoryComponent
} from '../modules/jobs-history/jobs-history.component';
import {
  AddCommentComponent
} from '../modules/add-comment';
import { RuntimeComponent } from '../modules/runtime/runtime.component';

// Interfaces
import {
  ResponseMessage
} from '../../shared/models/index';
import {
  ConfirmDialogComponent
} from '../../shared/modules/confirm-dialog/confirm-dialog.component';
import {
  MachineList,
  SchedulesType,
  TaskStatus,
  ColConfigKey,
  HourOffset
} from '../schedules-print.model';
import {
  BasicGeneralInfo
} from '../../shared/models/common.model';
import {
  MyDatePicker,
  IMyDateModel,
  IMyDpOptions,
  IMyDate
} from 'mydatepicker';
import {
  PrintMainService
} from '../+tsc-print/+print-main/print-main.service';
import {
  UploaderTypeComponent
} from '../../shared/modules/uploader-type';
import {
  UploadedType
} from '../../+order-log-v2/+sales-order/sales-order.model';
import {
  MaxDate,
  MinDate
} from '../../shared/validators';
import {
  StyleUploadedType
} from '../../+order-log-v2/+sales-order/+order-styles/+styles-info/+style/style.model';
import {
  AccessControlType
} from '../../+role-management/role-management.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'outsource-print-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'outsource-print-main.template.html',
  styleUrls: [
    'outsource-print-main.style.scss'
  ]
})
export class OutsourcePrintMainComponent implements OnInit,
                                                    AfterViewInit,
                                                    AfterViewChecked,
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
  public searchedObj;
  public frm: FormGroup;
  public formErrors = {
    customer: '',
    poId: '',
    // retailerPoId: '',
    styleName: '',
    partnerStyle: '',
    printDate: '',
    dateBeginConfigOnUtc: '',
    dateEndConfigOnUtc: '',
    cancelDateFromConfigOnUtc: '',
    cancelDateToConfigOnUtc: ''
  };
  public validationMessages = {
    cancelDateFromConfigOnUtc: {
      maxLength: 'Must be earlier than Cancel Date End.'
    },
    cancelDateToConfigOnUtc: {
      maxLength: 'Must be later than Cancel Date Begin.'
    },
    dateBeginConfigOnUtc: {
      maxLength: 'Must be earlier than Start Date End.'
    },
    dateEndConfigOnUtc: {
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
  public goodsWillBeDeliveredOptions: any = {
    ...this.myDatePickerOptions,
    showClearDateBtn: false
  };
  public neededByDateOptions: any = {
    ...this.myDatePickerOptions,
    showClearDateBtn: false
  };
  public shipDateOptions: any = {
    ...this.myDatePickerOptions,
    showClearDateBtn: false
  };

  public fixedHeader = false;
  public preMenuPin;

  public isFilter = false;
  public isNoData = false;
  public tableDateModel = {date: null};
  public totalsSchedQty = 0;
  public totalsCompQty = 0;
  public taskStatus = TaskStatus;
  public vendorId: number;
  public isAllVendor: boolean = false;
  public activatedRouteSub: Subscription;
  public oldInputValue: string = '';
  public oldDatePickerValue: string = '';
  public calendarEsc: boolean = false;
  public styleUploadedType = StyleUploadedType;
  public uploadedType = UploadedType;

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

  public isPageReadOnly = false;
  public accessControlType = AccessControlType;
  public printFuncPermissions = [];
  public sumSched;

  public showHideColumns = [];
  public isCheckedAll = true;
  public columns = [];
  public isShowAllColumns = false;
  public totalColspan = { first: 7, second: 5 };
  public colConfigKey = ColConfigKey;
  // public colProp = [
  //   'Cust / PO #',
  //   'Rerun / New',
  //   'Cut Ticket #',
  //   'Design # / Description',
  //   'Garment Style / Color',
  //   'Print Location',
  //   '# of Print Colors',
  //   'Qty (Pcs)',
  //   'Setup / Run Time',
  //   'Goods Will Be Delivered On',
  //   'Needed By Date',
  //   'Ship Date',
  //   'Ship From',
  //   'Comments'
  // ];
  public colProp = [];

  public isAllowDrag = false;
  public dragInfo = {
    status: '',
    allowDrop: true,
    isDragging: false,
    draggingMirror: null
  };
  public destroy$ = new Subject<any>();

  private _isDelete = false;
  private _lastScrollPo;

  constructor(private _router: Router,
              private _modalService: NgbModal,
              private _authService: AuthService,
              private _routerService: RouterService,
              private _utilService: Util,
              private _commonService: CommonService,
              private _schedulesPrintService: SchedulesPrintService,
              private _outsourcePrintMainSv: OutsourcePrintMainService,
              private _printMainSv: PrintMainService,
              private _themeSetting: ThemeSetting,
              private _toastrService: ToastrService,
              private _validationService: ValidationService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _activatedRoute: ActivatedRoute,
              private _localStorageService: LocalStorageService,
              private _userContext: UserContext,
              private _tscPrintSv: TscPrintService,
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

    this.buildForm();
    this.activatedRouteSub = this._activatedRoute.params
      .subscribe((params: { id: number }) => {
        // save active date tab
        let activeIndex = this.daysTab.findIndex((d) => d.isActive);
        if (activeIndex > -1) {
          if (this.vendorId) {
            this._localStorageService.set(
              'activeDate_SchedulesOutsource_' + this.vendorId,
              this.daysTab[activeIndex].date
            );
          } else {
            this._localStorageService.set(
              'activeDate_SchedulesOutsource',
              this.daysTab[activeIndex].date
            );
          }
        }

        let id = Number(params.id);
        this.vendorId = isNaN(id) ? undefined : params.id;
        // reset days tab when change vendor
        this.daysTab = [];
        this.lateJobData = [];
        this.getSearchFilterSv();
        this.getPrintTabData();
        this.getLateJobData();
      });
    let fontSize = this._localStorageService.get('fontSize_OutsourcePrint') as string;
    if (fontSize) {
      const modal = {'font-size': fontSize};
      Object.assign(this.myConfigStyle, modal);
      const fontSizeNumber = +fontSize.slice(0, fontSize.length - 2);
      this.fontSizeClass[`font-size-${fontSizeNumber}`] = true;
    } else {
      this._localStorageService.set('fontSize_OutsourcePrint', this.myConfigStyle['font-size']);
    }

    // Config columns
    let colSchedulesConfigs = this._userContext.currentUser.schedulesColumnConfigs;
    const printConfig = this._userContext.currentUser
      .permissions.filter((i) => i.type === 9);
    if (colSchedulesConfigs && colSchedulesConfigs.length) {
      const colConfigs = colSchedulesConfigs
        .find((i) => i.key === this.colConfigKey.SchedulesOutsourcePrint);
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
        .permissions.filter((i) => i.type === 9);
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
      .permissions.filter((i) => i.type === 9);
    }

    this.showHideColumns.forEach((item) => {
      this.columns.push(Object.assign({}, item));
      this.colProp.push(item.description);
    });
    this.isCheckedAll = this.showHideColumns.every((i) => i.isView === true);
    this.isShowAllColumns = !!this._localStorageService.get('isShowAll_SchedulesOutsourcePrint');
    this.checkColspanChange();
    // --------------
  }

  public ngOnInit(): void {
    this.initialPermission();
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
    this.isPageReadOnly = !this._authService.checkCanModify('Schedules.Print');
    // Get Print Function Permission from user info
    const funcPermission = this._userContext.currentUser.permissions
      .filter((i) => i.type === this.accessControlType.Functions);
    this.printFuncPermissions = funcPermission
      .filter((i) => i.name.includes('Schedules.Print'));
    // -------
  }

  public ngAfterViewChecked() {
    // Check if the table size has changed
    // if (this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
    //   this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
    //   setTimeout(() => {
    //     this.table.recalculate();
    //   }, 200);
    // }
  }

  // -----------------Select Row By Checkbox-----------------
  /**
   * Active/Inactive checkbox when switch page
   */
  public ngAfterViewInit(): void {
    // document.getElementsByClassName('ng-sidebar__content')[0]['onscroll']
    //   = this.onAppScroll.bind(this);
  }

  public getPrintTabData(search?) {
    let subDataTable = [];
    const data = this.frm.value;
    let curDate = new Date();
    curDate.setHours(-HourOffset, 0, 0);
    let params: HttpParams = new HttpParams()
      .set('printDateFromOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'))
      .set('hourOffset', HourOffset.toString());
    if (isNaN(this.vendorId)) {
      this.isAllVendor = true;
    } else if (this.vendorId) {
      params = params.set('vendorId', this.vendorId.toString());
      this.isAllVendor = false;
    }
    params = params.set('keyword', this.searchObj.keyword);

    params = params.set('poId', data['poId']);
    params = params.set('customer', data['customer']);
    params = params.set('styleName', data['styleName']);
    params = params.set('partnerStyle', data['partnerStyle']);
    params = params.set('cancelDateFromOnUtc', data['cancelDateFromConfigOnUtc']);
    params = params.set('cancelDateToOnUtc', data['cancelDateToConfigOnUtc']);
    switch (data['printDate']) {
      case 'Yesterday':
        curDate.setDate(curDate.getDate() - 1);
        subDataTable.push(
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
        subDataTable.push(
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
          subDataTable.push(
            {
              date: curDate,
              data: [],
              totalsSchedQty: 0,
              totalsCompQty: 0,
              totalRecord: 0
            }
          );
        }

        let startDate = new Date(subDataTable[0].date.getTime());
        startDate.setHours(-HourOffset, 0, 0);
        let endDate = new Date(subDataTable[6].date.getTime());
        endDate.setHours(23 - HourOffset, 59, 59);
        params = params.set('printDateFromOnUtc', moment(startDate).format('YYYY-MM-DDTHH:mm:ss'));
        params = params.set('printDateToOnUtc', moment(endDate).format('YYYY-MM-DDTHH:mm:ss'));
        break;
      case 'Custom':
        if (!data['dateBeginConfig'] || !data['dateEndConfig']) {
          this._toastrService.error('Please select start date and end date!', 'Error');
        } else {
          let timeDiff =
                Math.abs(data['dateEndConfig'].jsdate.getTime() -
                  data['dateBeginConfig'].jsdate.getTime());
          for (let i = 0; i < Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; i++) {
            curDate = new Date(data['dateBeginConfig'].jsdate.getTime());
            curDate.setDate(curDate.getDate() + i);
            subDataTable.push(
              {
                date: curDate,
                data: [],
                totalsSchedQty: 0,
                totalsCompQty: 0,
                totalRecord: 0
              }
            );
          }

          let dateBegin = new Date(data['dateBeginConfig'].jsdate.getTime());
          let dateEnd = new Date(data['dateEndConfig'].jsdate.getTime());
          dateBegin.setHours(-HourOffset, 0, 0);
          dateEnd.setHours(23 - HourOffset, 59, 59);
          params = params.set('printDateFromOnUtc',
            moment(dateBegin).format('YYYY-MM-DDTHH:mm:ss'));
          params = params.set('printDateToOnUtc',
            moment(dateEnd).format('YYYY-MM-DDTHH:mm:ss'));
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
          subDataTable.push(
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

    this._outsourcePrintMainSv.getPrintTabData(params)
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
          this.tableData = subDataTable;
          this.setDataTable(resp.data, search);
          if (!this.daysTab.length || (this.daysTab.length === 1 && !this.daysTab[0].date)) {
            let activeDate = this.vendorId ?
              this._localStorageService.get('activeDate_SchedulesOutsource_' + this.vendorId) :
              this._localStorageService.get('activeDate_SchedulesOutsource');
            let lastScrollPo = this._localStorageService.get('lastScrollPo_SchedulesOutsource');
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
            this.setDaysTab(activeIndex);
          }
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
    let params: HttpParams = new HttpParams();
    params = params.set('hourOffset', HourOffset.toString());
    params = params.set('isLateJob', 'true');
    params = params.set('vendorId', this.vendorId ? this.vendorId.toString() : '');
    // // get last scroll
    // this._lastScrollPo = this._utilService.scrollElm.scrollTop;
    this._outsourcePrintMainSv.getPrintTabData(params)
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
          this.setDataTable(resp.data, true, true);
          // first time get late data
          if (!this.daysTab.length ||
            (this.daysTab.length && this.daysTab[0].date !== null)) {
            this.daysTab.unshift({isActive: false, date: null});
            let activeDate = this.vendorId ?
              this._localStorageService.get('activeDate_SchedulesOutsource_' + this.vendorId) :
              this._localStorageService.get('activeDate_SchedulesOutsource');
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
      partnerStyle: new FormControl(''),
      printDate: new FormControl('Next 7 Days'),
      styleName: new FormControl(''),
      cancelDateFromConfig: new FormControl(''),
      cancelDateFromConfigOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)' +
            '|([0-9]{2})\-([0-9]{2})\-([0-9]{4})$'),
          MaxDate('cancelDateToConfigOnUtc', 1)
        ])
      ]),
      cancelDateToConfig: new FormControl(''),
      cancelDateToConfigOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)' +
            '|([0-9]{2})\-([0-9]{2})\-([0-9]{4})$'),
          MinDate('cancelDateFromConfigOnUtc', 1)
        ])
      ]),
      dateBeginConfig: new FormControl(''),
      dateBeginConfigOnUtc: new FormControl('', [
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
          MaxDate('dateEndConfigOnUtc', 1)
        ])
      ]),
      dateEndConfig: new FormControl(''),
      dateEndConfigOnUtc: new FormControl('', [
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
          MinDate('dateBeginConfigOnUtc', 1)
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
        cancelDateFromConfigOnUtc: {
          required: false
        },
        cancelDateToConfigOnUtc: {
          required: false
        },
        dateBeginConfigOnUtc: {
          required: false
        },
        dateEndConfigOnUtc: {
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
      'dateBeginConfigOnUtc',
      'dateEndConfigOnUtc'
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
    patchDateFunc('dateBeginConfigOnUtc', 'dateBeginConfig');
    patchDateFunc('dateEndConfigOnUtc', 'dateEndConfig');
    patchDateFunc('cancelDateFromConfigOnUtc', 'cancelDateFromConfig');
    patchDateFunc('cancelDateToConfigOnUtc', 'cancelDateToConfig');
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
    if (this._tscPrintSv.searchObj) {
      if (this._tscPrintSv.searchFrom === 'print-tsc') {
        this._tscPrintSv.convertToOutsource();
      }
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
      data['cancelDateFromConfigOnUtc'] ||
      data['cancelDateToConfigOnUtc'] ||
      data['printDate'] === 'Custom') {
      this.isFilter = true;
    } else {
      this.isFilter = false;
    }
    // set last tab
    this._tscPrintSv.searchFrom = 'print-outsource';
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
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

    // modalRef.componentInstance.isFromPrint = true;
    modalRef.componentInstance.machineData = data;
    modalRef.componentInstance.schedulerId = data.id;
    modalRef.componentInstance.isTsc = this._tscPrintSv.isTsc;
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

  public setDataTable(data, search?: boolean, isLateJob?: boolean) {
    this.totalsSchedQty = 0;
    this.totalsCompQty = 0;
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
        // set fake id for maintenance job
        data[index].data.forEach((d) => {
          if (d.isMaintenanceJob && d.type === 0) {
            d.printLocationId = 'maintenance';
          }
          if (d.isMaintenanceJob && d.type === 1) {
            d.neckLabelId = 'maintenance';
          }
        });

        dayData.totalRecord = data[index].data.length;
        dayData.rowSpan = 0;
        let vendorGroupObj = _.groupBy(data[index].data, 'vendorName');
        Object.keys(vendorGroupObj).forEach((key) => {
          let printOrderData = vendorGroupObj[key].filter((order) => !!order['printLocationId']);
          let neckOrderData = vendorGroupObj[key].filter((order) => !!order['neckLabelId']);
          // order by printLocation, neckLabel
          let orderData = _.orderBy(printOrderData, ['orderNum']).concat(
            _.orderBy(neckOrderData, ['orderNum']));
          let sumUnits = 0;
          let groupsByType = 1;
          orderData.forEach((vendor: any, i) => {
            vendor.setuptime = vendor.setuptime ? vendor.setuptime : 0;
            vendor.setuptime = Math.round(vendor.setuptime);
            vendor.runtime = vendor.runtime ? vendor.runtime : 0;
            this.setDateValue(vendor);
            sumUnits += vendor.scheduledQty;
            dayData.totalsSchedQty += vendor.scheduledQty;
            dayData.totalsCompQty += vendor.completedQty;
            // mark last printLocation
            if (vendor['printLocationId'] &&
              orderData[i + 1] &&
              orderData[i + 1]['neckLabelId']) {
              vendor.isLastPrintLocation = true;
              groupsByType = 2;
            } else if (vendor['printLocationId'] &&
              !orderData[i + 1]) {
              vendor.isLastPrintLocation = true;
            }
          });
          dayData.data.push({
            vendorName: key.toString(),
            data: orderData,
            sumQty: sumUnits,
            rowSpan: orderData.length + groupsByType
          });
          dayData.rowSpan += orderData.length + groupsByType;
        });
        this.totalsSchedQty += dayData.totalsSchedQty;
        this.totalsCompQty += dayData.totalsCompQty;
      } else if (!search) {
        dayData.data = [
          {
            vendorName: '',
            data: [null],
            sumQty: 0,
            rowSpan: 0
          }
        ];
        dayData.isNoData = true;
        dayData.rowSpan = 1;
      }
    });
    // only show day contain data if search mode on
    if (this.isFilter) {
      this.tableData = this.tableData.filter((d) => !d.isNoData);
    }
    if (!isLateJob) {
      // save origin data
      this.tableDataOrigin = _.cloneDeep(this.tableData);
    } else {
      this.lateJobData = _.cloneDeep(this.tableData);
      this.lateJobData = this.lateJobData.filter((l) => l.data.length);
    }
    this._changeDetectorRef.markForCheck();
  }

  public onFilter() {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
      return;
    }

    // set search filter service
    let newSearchObj = {...this._tscPrintSv.searchObj, ...this.frm.value};
    this._tscPrintSv.searchObj = JSON.parse(JSON.stringify(newSearchObj));
    delete this._tscPrintSv.searchObj.formRequires;

    // reset days tab when search
    this.daysTab = [];
    if (this.vendorId) {
      this._localStorageService.set('activeDate_SchedulesOutsource_' + this.vendorId, null);
    } else {
      this._localStorageService.set('activeDate_SchedulesOutsource', null);
    }
    this._localStorageService.set('lastScrollPo_SchedulesOutsource', 0);

    let data = this.frm.value;
    if (data['poId'] ||
      // data['retailerPoId'] ||
      data['customer'] ||
      data['styleName'] ||
      data['partnerStyle'] ||
      data['cancelDateFromConfigOnUtc'] ||
      data['cancelDateToConfigOnUtc'] ||
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
      case 'dateBeginConfigOnUtc':
        this.dateEndOptions = {
          ...this.dateEndOptions,
          disableUntil: dateCurrentUntil,
          enableDays: [dateCurrentUntil]
        };
        break;
      case 'dateEndConfigOnUtc':
        this.dateBeginOptions = {
          ...this.dateBeginOptions,
          disableSince: dateCurrentSince,
          enableDays: [dateCurrentSince]
        };
        break;
      case 'cancelDateFromConfigOnUtc':
        this.cancelDateEnd = {
          ...this.cancelDateEnd,
          disableUntil: dateCurrentUntil,
          enableDays: [dateCurrentUntil]
        };
        break;
      case 'cancelDateToConfigOnUtc':
        this.cancelDateBegin = {
          ...this.cancelDateBegin,
          disableSince: dateCurrentSince,
          enableDays: [dateCurrentSince]
        };
        break;
      default:
        return;
    }
    this._changeDetectorRef.markForCheck();
  }

  public updateDate(value: string, cal: MyDatePicker, prop: string, vendor: any) {
    if (new Date(this.oldDatePickerValue).getTime() === new Date(value).getTime()
      || this.oldDatePickerValue === value) {
      return;
    }
    this.oldDatePickerValue = value;
    vendor[prop] = value;
    this.updateVendor(vendor);
    let input = cal.elem.nativeElement.getElementsByTagName('input');
    if (input[0]) {
      input[0].blur();
      setTimeout(() => {
        input[0].blur();
      }, 500);
    }
  }

  public updateVendor(vendor, $event?, time?: string) {
    if ($event) {
      if (this.checkTimeInput(vendor.setuptime, vendor.runtime) !== '' && time) {
        $event.target.value = this.oldInputValue;
        vendor[time] = this.oldInputValue;
        $event.target.style.width = this.oldInputValue.toString().length * 8 + 'px';
        return;
      }
      if ($event.target.value === this.oldInputValue) {
        if (time) {
          vendor[time] = this.oldInputValue;
        }
        return;
      }
    }
    vendor.runtime -= 0;
    vendor.setuptime -= 0;
    let model = {
      runtime: vendor.runtime,
      setuptime: vendor.setuptime,
      goodsWillBeDeliveredOnUtc: vendor.goodsWillBeDeliveredOnUtc,
      neededByDateOnUtc: vendor.neededByDateOnUtc,
      shipDateOnUtc: vendor.shipDateOnUtc,
      shipFrom: vendor.shipFrom
    };
    let params: HttpParams = new HttpParams();
    if (vendor.printLocationId && !vendor.isMaintenanceJob) {
      params = params.set('printLocationId', vendor.printLocationId.toString());
    }
    if (vendor.neckLabelId && !vendor.isMaintenanceJob) {
      params = params.set('neckLabelId', vendor.neckLabelId.toString());
      params = params.set('isPrintNeckLabel', 'true');
    }
    if (vendor.orderDetailId) {
      params = params.set('orderDetailId', vendor.orderDetailId.toString());
    }
    if (vendor.isMaintenanceJob) {
      params = params.set('isMaintenanceJob', vendor.isMaintenanceJob);
    }
    this._schedulesPrintService.updateSchedulesDetail(vendor.id, model, params)
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
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

  public exportOutsourcePrint(exportType: string) {
    let activeDate = this.daysTab.find((d) => d.isActive);
    if (!activeDate.date) {
      this._toastrService.error('Cannot export late job!', 'Error');
      return;
    }
    let hasData = false;
    this.tableData.forEach((d) => {
      if (!d.isNoData) {
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
        .set('hourOffset', HourOffset.toString());
      if (isNaN(this.vendorId)) {
        this.isAllVendor = true;
      } else if (this.vendorId) {
        params = params.set('vendorId', this.vendorId.toString());
        this.isAllVendor = false;
      }
      params = params.set('keyword', this.searchObj.keyword);

      params = params.set('poId', data['poId']);
      // params = params.set('retailerPoId', data['retailerPoId']);
      params = params.set('customer', data['customer']);
      params = params.set('styleName', data['styleName']);
      params = params.set('partnerStyle', data['partnerStyle']);
      params = params.set('cancelDateFromOnUtc', data['cancelDateFromConfigOnUtc']);
      params = params.set('cancelDateToOnUtc', data['cancelDateToConfigOnUtc']);

      curDate.setHours(23 - HourOffset, 59, 59);
      params = params.set('printDateToOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));

      if (this.searchObj['machine'] && this.searchObj['machine'].length) {
        params = params.set('machines', this.searchObj['machine'].toString());
      }

      this._outsourcePrintMainSv.exportOutsourcePrintData(params)
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

  public calculateRunTime(vendors: any): number {
    let sumRunTime = 0;
    vendors.forEach((vendor) => {
      if (vendor && vendor.printLocationId) {
        sumRunTime += (vendor.setuptime - 0) / 60 + (vendor.runtime - 0);
      }
    });
    return sumRunTime;
  }

  public calculateDailyRunTime(dayData: any): number {
    let sumRunTime = 0;
    dayData.forEach((vendors) => {
      sumRunTime += this.calculateRunTime(vendors.data);
    });
    return sumRunTime;
  }

  public sumQtyByType(vendors, type) {
    let sumSched = 0;
    let sumComp = 0;
    vendors.forEach((vendor) => {
      if (vendor && vendor[type]) {
        sumSched += vendor.scheduledQty;
        sumComp += vendor.completedQty;
      }
    });
    return {sumSchedQty: sumSched, sumCompQty: sumComp};
  }

  public setDateValue(vendor: any): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (vendor[importName]) {
        let currentDate = new Date(vendor[importName]);
        vendor[exportName] = {
          date: {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            day: currentDate.getDate()
          }
        };
      }
    };
    patchDateFunc('goodsWillBeDeliveredOnUtc', 'goodsWillBeDelivered');
    patchDateFunc('neededByDateOnUtc', 'neededByDate');
    patchDateFunc('shipDateOnUtc', 'shipDate');
    this._changeDetectorRef.markForCheck();
  }

  public inputClick($event) {
    this.oldInputValue = $event.target.value;
    $event.target.select();
  }

  public calendarClick(cal: MyDatePicker) {
    let input = cal.elem.nativeElement.getElementsByTagName('input');
    if (input[0]) {
      this.oldDatePickerValue = input[0].value;
      input[0].select();
      const handler = (e) => {
        e.preventDefault();
        let key = e.which || e.keyCode;
        if (key === 27) { // key esc
          input[0].value = this.oldDatePickerValue;
          this.calendarEsc = true;
          input[0].blur();
        } else if (key === 13) { // key enter
          input[0].blur();
          setTimeout(() => {
            input[0].blur();
          }, 500);
        }
        e.stopPropagation();
      };
      input[0].removeEventListener('keyup', handler, false);
      input[0].addEventListener('keyup', handler, false);
    }
  }

  public calendarToggle($event, cal: MyDatePicker) {
    let input = cal.elem.nativeElement.getElementsByTagName('input');
    // on select date
    if ($event === 2 && input[0]) {
      setTimeout(() => {
        input[0].blur();
      }, 200);
    }
  }

  public onInputFocusBlur($event, cal: MyDatePicker, prop: string, vendor): boolean {
    if ($event.reason === 1) {  // focus in
      return;
    }
    if (this.calendarEsc) {
      this.calendarEsc = false;
      return;
    }
    let dateRegex = /^\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})$/;
    let dateFromPicker =
          cal.selectedDate.month + '/' + cal.selectedDate.day + '/' + cal.selectedDate.year;
    let datePicker = new Date(dateFromPicker);
    let validDate = isNaN(datePicker.getTime()) ? $event.value : dateFromPicker;
    let date = new Date(validDate);
    let alertSpan = cal.elem.nativeElement.nextElementSibling;
    if (!alertSpan || alertSpan.tagName !== 'SPAN') {
      return false;
    }
    if (!$event.value) {
      if (!alertSpan.classList.contains('hide')) {
        alertSpan.className += ' hide';
      }
      this.updateDate($event.value, cal, prop, vendor);
      return true;
    } else if ($event.value.length >= 6 &&
      dateRegex.test($event.value) &&
      !isNaN(date.getTime())) {
      if (!alertSpan.classList.contains('hide')) {
        alertSpan.className += ' hide';
      }
      this.updateDate(validDate, cal, prop, vendor);
      return true;
    } else {
      if (alertSpan.classList.contains('hide')) {
        alertSpan.classList.remove('hide');
      }
    }
    return false;
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

  public checkTimeInput(setuptime: any, runtime: any): string {
    if (isNaN(setuptime) || isNaN(runtime) || setuptime === '' || runtime === '') {
      return 'Invalid number!';
    } else if (setuptime - 0 > 120) {
      return 'Start Time cannot exceed 120 minutes!';
    // } else if (runtime - 0 > 100) {
    //   return 'Run Time cannot exceed 100 hours!';
    } else {
      return '';
    }
  }

  public inputEsc($event, isTime?: boolean) {
    $event.target.value = this.oldInputValue;
    if (isTime) {
      $event.target.style.width = this.oldInputValue.toString().length * 8 + 'px';
    }
    $event.target.blur();
  }

  public changeFontSize(fontSize) {
    // deactive previous font size
    let fontSizeId = this.fontSizeData.indexOf(this.myConfigStyle['font-size']);
    this.fontSizeClass[this.fontSizeIndex[fontSizeId]] = false;

    // active new font size
    this.myConfigStyle['font-size'] = fontSize;
    this._localStorageService.set('fontSize_OutsourcePrint', fontSize);
    fontSizeId = this.fontSizeData.indexOf(fontSize);
    this.fontSizeClass[this.fontSizeIndex[fontSizeId]] = true;
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

  public configRuntime(machineData) {
    if (this.isPageReadOnly) {
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
        this._changeDetectorRef.markForCheck();
      }
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

  public getIsModifyFunc(name: string): boolean {
    const status = this.printFuncPermissions.find((i) => i.name.includes(name));
    return status ? status.isModify : true;
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
              .filter((i) => i.type === 9);
            this._editUserService.updateSchedulesColumnsConfig(this._userContext.currentUser.id,
              this.showHideColumns, this.colConfigKey.SchedulesOutsourcePrint)
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
        this.totalColspan = { first: 7, second: 5 };
      } else {
        this.checkColspanChange();
      }
      this._progressService.done();
      this._localStorageService.set('isShowAll_SchedulesOutsourcePrint', this.isShowAllColumns);
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  public checkColspanChange() {
    if (this.isShowAllColumns) {
      return;
    }
    const leftCol = this.colProp.slice(0, 7);
    const rightCol = this.colProp.slice(9, 14);
    this.totalColspan = { first: 7, second: 5 };
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
      const colCount = 14;
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
      if (elId[2] === '0' && args[0].cells.length > colCount) {
        args[0].deleteCell(0);
      }
      //#endregion

      //#region prevent drag to other process
      if (args[1].classList.contains('invalid-area')) {
        args[1].classList.remove('invalid-area');
        this.dragInfo.allowDrop = true;
      }
      if (elId.length < 3 || preId.length < 3) {
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
        type: 1
      };
      reASModel.vendorId = this.vendorId;
      reASModel.type = this.tableData[elIndex[0]].data[elIndex[1]].data[elIndex[2]].type;
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
      const mess = `Outsource schedule item successfully moved from 
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
      reASModel.vendorId = this.vendorId;
      if (!reASModel.vendorId) {
        reASModel.vendorId = this.tableData[preId[0]].data[preId[1]].data[preId[2]].vendorId;
      }
      // get list schedule by order
      let eMCIndex = 0;
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

    if (!this.daysTab[index]) {
      index = 0;
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
    let params: HttpParams = new HttpParams();
    params = params.set('orderId', machineData.orderId);
    // remove at print schedule
    if (machineData.printLocationId) {
      params = params.set('printLocationId', machineData.printLocationId.toString());
    }
    // remove at neck label schedule
    if (machineData.neckLabelId) {
      params = params.set('neckLabelId', machineData.neckLabelId.toString());
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
    this.activatedRouteSub.unsubscribe();
    this._localStorageService.set('isShowAll_SchedulesOutsourcePrint', this.isShowAllColumns);
    let activeIndex = this.daysTab.findIndex((d) => d.isActive);
    if (activeIndex > -1) {
      if (this.vendorId) {
        this._localStorageService.set(
          'activeDate_SchedulesOutsource_' + this.vendorId,
          this.daysTab[activeIndex].date
        );
      } else {
        this._localStorageService.set(
          'activeDate_SchedulesOutsource',
          this.daysTab[activeIndex].date
        );
      }
      this._localStorageService.set(
        'lastScrollPo_SchedulesOutsource', this._utilService.scrollElm.scrollTop
      );
    }
  }
}
