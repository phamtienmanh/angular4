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
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { Subject } from 'rxjs';
import 'rxjs/add/operator/takeUntil';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';
import {
  NgbDropdownConfig,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import * as moment from 'moment';

// Services
import {
  CommonService
} from '../../../shared/services/common/common.service';
import {
  SchedulesPrintService
} from '../../schedules-print.service';
import {
  ThemeSetting
} from '../../../shared/services/theme-setting';
import {
  DragulaService
} from 'ng2-dragula/ng2-dragula';
import * as FileSaver from 'file-saver';
import {
  NeckLabelMainService
} from './neck-label-main.service';
import {
  ValidationService
} from '../../../shared/services/validation';
import {
  MyDatePickerService
} from '../../../shared/services/my-date-picker';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  Util
} from '../../../shared/services/util';
import { AuthService } from '../../../shared/services/auth/auth.service';
import {
  StyleService
} from '../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+style/style.service';
import { UserContext } from '../../../shared/services/user-context/user-context';
import {
  NeckLabelService
} from '../neck-label.service';
import { ProgressService } from '../../../shared/services/progress/progress.service';
import {
  EditUserService
} from '../../../+user-management/+edit-user/edit-user.service';
import {
  PrintMainService
} from '../../+tsc-print/+print-main/print-main.service';
import {
  SchedulerService
} from '../../+scheduler/scheduler.service';

// Component
import {
  CompletePrintJobComponent
} from '../../modules/complete-print-job';
import {
  JobsHistoryComponent
} from '../../modules/jobs-history/jobs-history.component';
import {
  AddCommentComponent
} from '../../modules/add-comment';

// Validators
import {
  MaxDate,
  MinDate
} from '../../../shared/validators';

// Interfaces
import {
  ResponseMessage
} from '../../../shared/models/index';
import {
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  ExtraValidators
} from '../../../shared/services/validation/extra-validators';
import { Subscription } from 'rxjs/Subscription';
import {
  UploaderTypeComponent
} from '../../../shared/modules/uploader-type';
import {
  UploadedType
} from '../../../+order-log-v2/+sales-order/sales-order.model';
import {
  StyleUploadedType
} from '../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+style/style.model';
import {
  AccessControlType
} from '../../../+role-management/role-management.model';
import {
  ConfirmDialogComponent
} from '../../../shared/modules/confirm-dialog/confirm-dialog.component';
import {
  TaskStatus,
  ColConfigKey,
  HourOffset
} from '../../schedules-print.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'neck-label-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'neck-label-main.template.html',
  styleUrls: [
    'neck-label-main.style.scss'
  ]
})
export class NeckLabelMainComponent implements OnInit,
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
    cancelDateFromOnUtc: '',
    cancelDateToOnUtc: '',
    neckLabelDateFromOnUtc: '',
    neckLabelDateToOnUtc: ''
  };
  public validationMessages = {
    cancelDateFromOnUtc: {
      maxLength: 'Must be earlier than Cancel Date End.'
    },
    cancelDateToOnUtc: {
      maxLength: 'Must be later than Cancel Date Begin.'
    },
    neckLabelDateFromOnUtc: {
      maxLength: 'Must be earlier than Start Date End.'
    },
    neckLabelDateToOnUtc: {
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
  public cancelDateBeginOptions: any = {
    ...this.myDatePickerOptions
  };
  public cancelDateEndOptions: any = {
    ...this.myDatePickerOptions
  };
  public dateBeginOptions: any = {
    ...this.myDatePickerOptions
  };
  public dateEndOptions: any = {
    ...this.myDatePickerOptions
  };
  public tableDateOptions: any = {
    ...this.myDatePickerOptions,
    showClearDateBtn: false
  };

  public fixedHeader = false;
  public preMenuPin;

  public isFilter = false;

  public header;
  public cloneHeader;
  public fontSizeData = ['8px', '9px', '10px', '11px', '12px'];
  public myConfigStyle = {
    'font-size': '11px'
  };
  public myConfigStyleHeader = {
    'font-size': '11px'
  };
  public fontSizeIndex = [
    'font-size-8',
    'font-size-9',
    'font-size-10',
    'font-size-11',
    'font-size-12'
  ];
  public fontSizeClass = {
    'font-size-8': false,
    'font-size-9': false,
    'font-size-10': false,
    'font-size-11': false,
    'font-size-12': false
  };
  public vendorId: number;
  public styleUploadedType = StyleUploadedType;
  public uploadedType = UploadedType;
  public activatedSub: Subscription;

  public isPageReadOnly = false;
  public accessControlType = AccessControlType;
  public neckLabelFuncPermissions = [];
  public searchedObj = {};
  public sumSched;

  public showHideColumns = [];
  public isCheckedAll = true;
  public columns = [];
  public isShowAllColumns = false;
  public totalColspan = { first: 7, second: 12 };
  public colConfigKey = ColConfigKey;
  // public colProp = [
  //   'Cut Ticket #',
  //   'Cust / PO #',
  //   'Design # / Description',
  //   'Image',
  //   'Blank Style / Description',
  //   'Garment Color',
  //   'Size / Qtys',
  //   'Total Pcs',
  //   'Print Method',
  //   'Neck Label ID',
  //   'Neck Label Image',
  //   'Coo',
  //   'Neck Label Color',
  //   'Blank Goods ETA',
  //   'Start / Cancel Ship Date',
  //   'Comments'
  // ];
  public colProp = [];

  public printMethods = [];
  public isAllowDrag = false;
  public dragInfo = {
    status: '',
    allowDrop: true,
    isDragging: false,
    draggingMirror: null
  };
  public destroy$ = new Subject<any>();
  public taskStatus = TaskStatus;

  private _maxWidthTable: number;
  private _isEsc = false;
  private _lastScrollPo;

  constructor(private _router: Router,
              private _modalService: NgbModal,
              private _commonService: CommonService,
              private _authService: AuthService,
              private _schedulesPrintService: SchedulesPrintService,
              private _localStorageService: LocalStorageService,
              private _validationService: ValidationService,
              private _neckLabelMainService: NeckLabelMainService,
              private _styleService: StyleService,
              private _themeSetting: ThemeSetting,
              private _toastrService: ToastrService,
              private _dragulaService: DragulaService,
              private _utilService: Util,
              private _userContext: UserContext,
              private _changeDetectorRef: ChangeDetectorRef,
              private _activatedRoute: ActivatedRoute,
              private _neckLabelSv: NeckLabelService,
              private _ngbDropdownConfig: NgbDropdownConfig,
              private _progressService: ProgressService,
              private _editUserService: EditUserService,
              private _printMainSv: PrintMainService,
              private _schedulerSv: SchedulerService,
              public myDatePickerService: MyDatePickerService) {
    // drag config
    _dragulaService.setOptions('bag-one', {
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
    let fontSize = this._localStorageService.get('fontSize_NeckLabel') as string;
    if (fontSize) {
      const modal = {'font-size': fontSize};
      Object.assign(this.myConfigStyle, modal);
      const fontSizeNumber = +fontSize.slice(0, fontSize.length - 2);
      this.fontSizeClass[`font-size-${fontSizeNumber}`] = true;
    } else {
      this._localStorageService.set('fontSize_NeckLabel', this.myConfigStyle['font-size']);
    }

    // Config columns
    let colSchedulesConfigs = this._userContext.currentUser.schedulesColumnConfigs;
    const neckLabelConfig = this._userContext.currentUser
      .permissions.filter((i) => i.type === 5);
    if (colSchedulesConfigs && colSchedulesConfigs.length) {
      const colConfigs = colSchedulesConfigs
        .find((i) => i.key === this.colConfigKey.SchedulesNeckLabel);
      if (!colConfigs || colConfigs.value.length !== neckLabelConfig.length) {
        this.showHideColumns = neckLabelConfig;
      } else {
        colConfigs.value.forEach((i) => {
          let col = neckLabelConfig.find((o) => o.id === i.id);
          if (col) {
            Object.assign(i, col);
          }
        });
        this.showHideColumns = colConfigs.value;
      }
      const storedColumnConfig = this._userContext.currentUser
        .permissions.filter((i) => i.type === 5);
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
      .permissions.filter((i) => i.type === 5);
    }

    this.showHideColumns.forEach((item) => {
      this.columns.push(Object.assign({}, item));
      this.colProp.push(item.description);
    });
    this.isCheckedAll = this.showHideColumns.every((i) => i.isView === true);
    this.isShowAllColumns = !!this._localStorageService.get('isShowAll_SchedulesNeckLabel');
    this.checkColspanChange();
    // --------------
  }

  @HostListener('window:resize', ['$event'])
  public onResize(event) {
    this._maxWidthTable = null;
    setTimeout(() => {
      this.updateHeader();
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  public ngOnInit(): void {
    this.initialPermission();
    this.buildForm();
    this.getCommonData();
    this.activatedSub = this._activatedRoute.parent.params
      .subscribe((params: { id: number }) => {
        let id = Number(params.id);
        this.vendorId = isNaN(id) ? undefined : params.id;
        this.getSearchFilterSv();
        this.getPrintTabData().then((value: boolean) => {
          setTimeout(() => {
            if (this._utilService.scrollElm) {
              this._utilService.scrollElm
                .scrollTop = this._utilService.scrollPosition;
            }
          }, 200);
        });
        this.getLateJobData();
      });
    // Prevent user navigate to another page when data not loaded yet
    const backdropElm = document.getElementById('backdrop');
    if (backdropElm) {
      backdropElm.className = '';
      this._changeDetectorRef.markForCheck();
    }
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
    this.isPageReadOnly = !this._authService.checkCanModify('Schedules.NeckLabel');
    // Get Print Function Permission from user info
    const funcPermission = this._userContext.currentUser.permissions
      .filter((i) => i.type === this.accessControlType.Functions);
    this.neckLabelFuncPermissions = funcPermission
      .filter((i) => i.name.includes('Schedules.NeckLabel'));
    // -------
  }

  public buildForm(): void {
    let controlConfig = {
      customer: new FormControl(''),
      poId: new FormControl(''),
      // retailerPoId: new FormControl(''),
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
      neckLabelDateFrom: new FormControl(''),
      neckLabelDateFromOnUtc: new FormControl('', [
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
          MaxDate('neckLabelDateToOnUtc', 1)
        ])
      ]),
      neckLabelDateTo: new FormControl(''),
      neckLabelDateToOnUtc: new FormControl('', [
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
          MinDate('neckLabelDateFromOnUtc', 1)
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
        cancelDateFromOnUtc: {
          required: false
        },
        cancelDateToOnUtc: {
          required: false
        },
        neckLabelDateFromOnUtc: {
          required: false
        },
        neckLabelDateToOnUtc: {
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
      'neckLabelDateFromOnUtc',
      'neckLabelDateToOnUtc'
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
    patchDateFunc('neckLabelDateFromOnUtc', 'neckLabelDateFrom');
    patchDateFunc('neckLabelDateToOnUtc', 'neckLabelDateTo');
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
    if (this._neckLabelSv.searchObj) {
      this.updateForm(this._neckLabelSv.searchObj);
    } else {
      this._neckLabelSv.searchObj = JSON.parse(JSON.stringify(this.frm.value));
      delete this._neckLabelSv.searchObj.formRequires;
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
    this._neckLabelSv.searchFrom = 'neck-label';
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

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getPrintMethods()
      .subscribe((resp) => {
        if (resp.status) {
          this.printMethods = resp.data;
          this.printMethods.push({name: null});
        }
      });
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
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

  public getMaxWidthTable(): string {
    return this._maxWidthTable > 0 ? `${this._maxWidthTable}px` : 'auto';
  }

  @HostListener('window:scroll', ['$event'])
  public onAppScroll(event: any) {
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

  public onScrollX(event): void {
    this.myConfigStyleHeader = {
      ...this.myConfigStyleHeader,
      left: this.header ? `${this.header.getBoundingClientRect().left}px` : 'auto',
      right: this.header ? `${this.header.getBoundingClientRect().right}px` : 'auto'
    };
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

  public onFilter() {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
      return;
    }

    // set search filter service
    let newSearchObj = {...this._neckLabelSv.searchObj, ...this.frm.value};
    this._neckLabelSv.searchObj = JSON.parse(JSON.stringify(newSearchObj));
    delete this._neckLabelSv.searchObj.formRequires;

    // reset days tab when search
    this.daysTab = [];
    this._localStorageService.set('activeDate_SchedulesNeckLabel', null);
    this._localStorageService.set('lastScrollPo_SchedulesNeckLabel', 0);

    // const checkValueNotNull = (list: string[]) => {
    //   let status = true;
    //   list.forEach((i) => {
    //     status = status && !!this.frm.get(i).value;
    //   });
    //   return status;
    // };
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

  public changeFontSize(fontSize) {
    // deactive previous font size
    let fontSizeId = this.fontSizeData.indexOf(this.myConfigStyle['font-size']);
    this.fontSizeClass[this.fontSizeIndex[fontSizeId]] = false;

    // active new font size
    this.myConfigStyle['font-size'] = fontSize;
    this.myConfigStyleHeader['font-size'] = fontSize;
    this._localStorageService.set('fontSize_NeckLabel', fontSize);
    fontSizeId = this.fontSizeData.indexOf(fontSize);
    this.fontSizeClass[this.fontSizeIndex[fontSizeId]] = true;
    setTimeout(() => {
      this.updateHeader();
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  public getMinWidthDependFontSize(minWidth: number): string {
    const fontSize = +this.myConfigStyle['font-size']
      .slice(0, this.myConfigStyle['font-size'].length - 2);
    return `${minWidth - (11 - fontSize) * 3}px`;
  }

  public getDailyTotal(rowData) {
    if (!rowData) {
      return 0;
    }
    let totalSched = 0;
    let totalComp = 0;
    rowData.forEach((row) => {
      totalSched += row.scheduledQty;
      totalComp += row.completedQty;
    });
    return {totalSchedQty: totalSched, totalCompQty: totalComp};
  }

  /**
   * Search text change event
   * @param value
   */
  public onSearchChanged(value: string): void {
    this.searchObj.keyword = value;
    this.getPrintTabData();
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
      case 'neckLabelDateFromOnUtc':
        this.dateEndOptions = {
          ...this.dateEndOptions,
          disableUntil: dateCurrentUntil,
          enableDays: [dateCurrentUntil]
        };
        break;
      case 'neckLabelDateToOnUtc':
        this.dateBeginOptions = {
          ...this.dateBeginOptions,
          disableSince: dateCurrentSince,
          enableDays: [dateCurrentSince]
        };
        break;
      case 'cancelDateFromOnUtc':
        this.cancelDateEndOptions = {
          ...this.cancelDateEndOptions,
          disableUntil: dateCurrentUntil,
          enableDays: [dateCurrentUntil]
        };
        break;
      case 'cancelDateToOnUtc':
        this.cancelDateBeginOptions = {
          ...this.cancelDateEndOptions,
          disableSince: dateCurrentSince,
          enableDays: [dateCurrentSince]
        };
        break;
      default:
        return;
    }
    this._changeDetectorRef.markForCheck();
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

  public openUploader(orderDetailId: number, type: number, title: string): void {
    let fileList = [];
    this._styleService.getStyleFiles(orderDetailId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          fileList = Object.assign([], resp.data.filter((i) => i.type === type));
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
            // empty
          }, (err) => {
            // empty
          });
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public showInput(event): void {
    if (!this.isPageReadOnly) {
      let inputE = event.getElementsByTagName('input');
      let valueE = event.getElementsByTagName('span');

      if (inputE.length) {
        if (inputE[0].hidden) {
          valueE[0].hidden = true;
          inputE[0].hidden = false;
          inputE[0].focus();
          inputE[0].select();
        }
      }
    }
  }

  public hiddenInput(event): void {
    let inputE = event.getElementsByTagName('input');
    let valueE = event.getElementsByTagName('span');

    if (inputE.length) {
      this._isEsc = true;
      inputE[0].hidden = true;
      valueE[0].hidden = false;
    }
  }

  public updatePlateScreen(event, inputElement, plateScreenEl, row): void {
    if (this._isEsc) {
      this._isEsc = false;
      return;
    }
    let valueE = plateScreenEl.getElementsByTagName('span');
    const model = {
      plateScreen: inputElement.value
    };
    this._neckLabelMainService
      .updateSchedulesDetail(model, row.id, row.neckLabelId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          row.plateScreen = inputElement.value;
          this._toastrService.success(resp.message, 'Success');
          inputElement.hidden = true;
          valueE[0].hidden = false;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public exportNeckLabel(exportType: string) {
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
      const data = this.frm.value;
      let curDate = moment(activeDate.date).toDate();
      curDate.setHours(-HourOffset, 0, 0);
      let params: HttpParams = new HttpParams()
        .set('printDateFromOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'))
        .set('vendorId', this.vendorId ? this.vendorId.toString() : '')
        .set('hourOffset', HourOffset.toString())
        .set('keyword', this.searchObj.keyword)
        .set('poId', data['poId'])
        .set('customer', data['customer'])
        .set('styleName', data['styleName'])
        .set('cancelDateFromOnUtc',
          (data['cancelDateFromOnUtc'] ?
            moment.utc(data['cancelDateFrom'].jsdate).format('YYYY-MM-DDTHH:mm:ss') : undefined))
        .set('cancelDateToOnUtc', (
          data['cancelDateToOnUtc'] ?
            moment.utc(data['cancelDateTo'].jsdate).format('YYYY-MM-DDTHH:mm:ss') : undefined));

      curDate.setHours(23 - HourOffset, 59, 59);
      params = params.set('printDateToOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));

      this._neckLabelMainService.exportTscNeckLabel(params)
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

  public getIsModifyFunc(name: string): boolean {
    const status = this.neckLabelFuncPermissions.find((i) => i.name.includes(name));
    return status ? status.isModify : true;
  }

  public getPrintTabData(): Promise<boolean> {
    const data = this.frm.value;
    let curDate = new Date();
    curDate.setHours(-HourOffset, 0, 0);
    let params: HttpParams = new HttpParams()
      .set('printDateFromOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'))
      .set('vendorId', this.vendorId ? this.vendorId.toString() : '')
      .set('hourOffset', HourOffset.toString())
      .set('keyword', this.searchObj.keyword)
      .set('poId', data['poId'])
      .set('customer', data['customer'])
      .set('styleName', data['styleName'])
      .set('cancelDateFromOnUtc',
        (data['cancelDateFromOnUtc'] ?
          moment.utc(data['cancelDateFrom'].jsdate).format('YYYY-MM-DDTHH:mm:ss') : undefined))
      .set('cancelDateToOnUtc', (
        data['cancelDateToOnUtc'] ?
          moment.utc(data['cancelDateTo'].jsdate).format('YYYY-MM-DDTHH:mm:ss') : undefined));

    switch (data['printDate']) {
      case 'Yesterday':
        curDate.setDate(curDate.getDate() - 1);
        params = params.set('printDateFromOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));
        curDate.setHours(23 - HourOffset, 59, 59);
        params = params.set('printDateToOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));
        break;
      case 'Today':
        curDate.setHours(23 - HourOffset, 59, 59);
        params = params.set('printDateToOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));
        break;
      case 'This Week':
        let thisWeek = [];
        let dOW = curDate.getDay();

        for (let i = 1; i < 8; i++) {
          curDate = new Date();
          curDate.setDate(curDate.getDate() - (dOW - i));
          thisWeek.push(curDate);
        }

        let startDate = new Date(thisWeek[0].getTime());
        startDate.setHours(-HourOffset, 0, 0);
        let endDate = new Date(thisWeek[6].getTime());
        endDate.setHours(23 - HourOffset, 59, 59);
        params = params.set('printDateFromOnUtc', moment(startDate).format('YYYY-MM-DDTHH:mm:ss'));
        params = params.set('printDateToOnUtc', moment(endDate).format('YYYY-MM-DDTHH:mm:ss'));
        break;
      case 'Custom':
        let dateFrom = new Date(data['neckLabelDateFrom'].jsdate.getTime());
        let dateTo = new Date(data['neckLabelDateTo'].jsdate.getTime());
        dateFrom.setHours(-HourOffset, 0, 0);
        dateTo.setHours(23 - HourOffset, 59, 59);
        params = params.set('printDateFromOnUtc',
          moment(dateFrom).format('YYYY-MM-DDTHH:mm:ss'));
        params = params.set('printDateToOnUtc',
          moment(dateTo).format('YYYY-MM-DDTHH:mm:ss'));
        break;
      default:
        let sixDays = new Date();
        sixDays.setDate(curDate.getDate() + 6);
        sixDays.setHours(23 - HourOffset, 59, 59);
        params = params.set('printDateToOnUtc', moment(sixDays).format('YYYY-MM-DDTHH:mm:ss'));
        break;
    }

    return new Promise((resolve, reject) => {
      this._neckLabelMainService.getNeckLabelTabData(params)
        .subscribe((resp: ResponseMessage<any>): void => {
          if (resp.status) {
            this.searchedObj = {...this.frm.value};
            if (data['printDate'] === 'This Week' || data['printDate'] === 'Next 7 Days') {
              // Set data
              let thisWeek = [];
              let currentDate = new Date();
              let dOW = currentDate.getDay();

              for (let i = 0; i < 7; i++) {
                currentDate = new Date();
                if (data['printDate'] === 'This Week') {
                  currentDate.setDate(currentDate.getDate() - (dOW - (i + 1)));
                } else if (data['printDate'] === 'Next 7 Days') {
                  currentDate.setDate(currentDate.getDate() + i);
                }
                currentDate = new Date(currentDate.getFullYear(),
                  currentDate.getMonth(), currentDate.getDate());
                let sameDate = resp.data.find((item) => {
                  if (item.printDate) {
                    const printDate = new Date(moment(item.printDate).toDate().getTime());
                    return currentDate.getDate() === printDate.getDate();
                  }
                });
                if (sameDate) {
                  sameDate.printDate = moment(sameDate.printDate).toDate();
                  thisWeek.push(sameDate);
                } else {
                  thisWeek.push({
                    data: [],
                    printDate: currentDate
                  });
                }
              }
              this.tableData = thisWeek;
            } else {
              this.tableData = resp.data;
              this.tableData.forEach((d) => {
                d.printDate = moment(d.printDate).toDate();
              });
            }
            if (data['printDate'] === 'Custom') {
              this.tableData = _.sortBy(this.tableData, 'printDate');
            }
            // only show day contain data if search mode on
            if (this.isFilter) {
              this.tableData = this.tableData.filter((d) => d.data.length);
            }
            this.tableData.forEach((d) => {
              d.data = _.sortBy(d.data, 'orderNum');
            });
            this.moveSpecialTaskToEnd();
            this.calculateActualRuntime(this.tableData);
            // save origin data
            this.tableDataOrigin = _.cloneDeep(this.tableData);
            if (!this.daysTab.length || (this.daysTab.length === 1 && !this.daysTab[0].date)) {
              let activeDate = this._localStorageService.get('activeDate_SchedulesNeckLabel');
              let lastScrollPo = this._localStorageService.get('lastScrollPo_SchedulesNeckLabel');
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
            resolve(true);
          } else {
            this._changeDetectorRef.markForCheck();
            this._toastrService.error(resp.errorMessages, 'Error');
            resolve(false);
          }
          // Prevent user navigate to another page when data not loaded yet
          const backdropElm = document.getElementById('backdrop');
          if (backdropElm) {
            backdropElm.className = 'none';
            this._changeDetectorRef.markForCheck();
          }
        });
    });
  }

  public getLateJobData() {
    let params: HttpParams = new HttpParams();
    params = params.set('hourOffset', HourOffset.toString());
    params = params.set('isLateJob', 'true');
    // // get last scroll
    // this._lastScrollPo = this._utilService.scrollElm.scrollTop;
    this._neckLabelMainService.getNeckLabelTabData(params)
      .subscribe((resp) => {
        if (resp.status) {
          if (!resp.data || !resp.data.length) {
            return;
          }
          resp.data.forEach((d) => {
            d.printDate = moment(d.printDate).toDate();
          });
          resp.data = _.sortBy(resp.data, 'printDate');
          resp.data = resp.data.filter((d) => d.data.length);
          resp.data.forEach((d) => {
            d.data = _.sortBy(d.data, 'orderNum');
          });
          this.lateJobData = _.cloneDeep(resp.data);
          this.calculateActualRuntime(this.lateJobData);
          // first time get late data
          if (!this.daysTab.length ||
            (this.daysTab.length && this.daysTab[0].date !== null)) {
            this.daysTab.unshift({isActive: false, date: null});
            let activeDate = this._localStorageService.get('activeDate_SchedulesNeckLabel');
            if (!activeDate) {
              this.setDaysTab(0);
            }
          }
          // other time get late data
          if (this.lateJobData.length && this.isOnLateTab) {
            this.tableData = this.lateJobData;
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
      dayData.data.forEach((mcData) => {
        if (mcData) {
          this.sumSched++;
        }
      });
    });
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
        // this.showHideColumns.forEach((item, index) => {
        //   Object.assign(this.columns[index], item);
        // });
        // this.checkColspanChange();
        this._progressService.start();
        setTimeout(() => {
          this.showHideColumns.forEach((item, index) => {
            Object.assign(this.columns[index], item);
          });
          this.checkColspanChange();
          if (this._userContext.currentUser.permissions) {
            const pagePermissions = this._userContext.currentUser.permissions
              .filter((i) => i.type === 5);
            this._editUserService.updateSchedulesColumnsConfig(this._userContext.currentUser.id,
              this.showHideColumns, this.colConfigKey.SchedulesNeckLabel)
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
        this.totalColspan = { first: 7, second: 12 };
      } else {
        this.checkColspanChange();
      }
      this._progressService.done();
      this._localStorageService.set('isShowAll_SchedulesNeckLabel', this.isShowAllColumns);
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  public checkColspanChange() {
    if (this.isShowAllColumns) {
      return;
    }
    const leftCol = this.colProp.slice(0, 7);
    const rightCol = this.colProp.slice(8, 16);
    this.totalColspan = { first: 7, second: 12 };
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

  public getIsModifyStatusBy(statusName: string): boolean {
    if (this.isPageReadOnly) {
      return false;
    }
    switch (statusName) {
      case 'DELIVERED':
        return this.getIsModifyFunc('Status.Delivered');
      case 'RECEIVED':
        return this.getIsModifyFunc('Status.Received');
      default:
        return;
    }
  }

  public changeStatus(row, type, prop) {
    if (row.isArchived) {
      return;
    }
    this._printMainSv.changeStatus(row.id, type, !row[prop])
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          row[prop] = !row[prop];
          this._changeDetectorRef.markForCheck();
          this._toastrService.success(resp.message, 'Success');
          // this.getPrintTabData();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public hasPrintMethod(data, printMethod) {
    return data.some(
      (i) => i.printMethod === printMethod && !i.isMaintenanceJob
    );
  }

  public calculateQtyByProcess(data, printMethod) {
    let sumSched = 0;
    let sumComp = 0;
    let sumRT = 0;
    data.forEach((d) => {
      if (d.printMethod === printMethod) {
        sumSched += d.scheduledQty;
        sumComp += d.completedQty;
        if (d.actualRT) {
          sumRT += d.actualRT;
        }
      }
    });
    return {sumSchedQty: sumSched, sumCompQty: sumComp, sumRuntime: sumRT};
  }

  //#region drag event
  /**
   * Prevent drag on invalid row
   */
  public validDrag(el, container, handle) {
    return handle.className.includes('fa-arrows');
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

      //#region prevent drag to other print method
      if (args[1].classList.contains('invalid-area')) {
        args[1].classList.remove('invalid-area');
        this.dragInfo.allowDrop = true;
      }
      if ((elId[0] === preId[0] && elId[1] !== preId[1]) ||
        elId.length < 3 || preId.length < 3) {
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
      reASModel.vendorId = this.tableData[elIndex[0]].data[elIndex[2]].vendorId;
      reASModel.printDateOnUtc = new Date(this.daysTab[dropTabIndex].date.getTime());
      reASModel.printDateOnUtc.setHours(12, 0, 0);
      reASModel.printDateOnUtc = moment(reASModel.printDateOnUtc).format('YYYY-MM-DDTHH:mm:ss');
      // make message
      let dragFrDate = this.daysTab[this.daysTab.findIndex((d) => d.isActive)].date;
      if (!dragFrDate) {
        dragFrDate = this.tableData[elIndex[0]].printDate;
      }
      const mess = `Neck Label schedule item successfully moved from 
      TSC on 
      ${moment(dragFrDate).format('M/D')} to
      TSC on 
      ${moment(reASModel.printDateOnUtc).format('M/D')}.`;
      // call api
      this._schedulerSv.reassignSchedule(
        this.tableData[elIndex[0]].data[elIndex[2]].id, reASModel)
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
      let listSchedulerIds = [];
      this.tableData[preId[0]].data.forEach((item, index) => {
        if (index !== +elId[2]) {
          listSchedulerIds.push(item.id);
        }
        if (index === +preId[2]) {
          listSchedulerIds.push(
            this.tableData[elId[0]].data[elId[2]].id
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
      reASModel.printDateOnUtc = new Date(this.tableData[preId[0]].printDate);
      reASModel.printDateOnUtc.setHours(12, 0, 0);
      reASModel.printDateOnUtc = moment(reASModel.printDateOnUtc).format('YYYY-MM-DDTHH:mm:ss');
      reASModel.type = 1;
      reASModel.vendorId = this.tableData[preId[0]].data[preId[2]].vendorId;
      // get list schedule by order
      this.tableData[preId[0]].data.forEach((item, index) => {
        if (item) {
          reASModel.listReArranges.push(item.id);
          if (index === +preId[2]) {
            reASModel.listReArranges.push(
              this.tableData[elId[0]].data[elId[2]].id
            );
          }
        }
      });
      // call api
      this._schedulerSv.reassignSchedule(
        this.tableData[elId[0]].data[elId[2]].id, reASModel)
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

  public moveSpecialTaskToEnd() {
    this.tableData.forEach((dayData) => {
      dayData.data.forEach((d, index) => {
        if (d.isMaintenanceJob) {
          dayData.data.push(d);
          dayData.data.splice(index, 1);
        }
      });
    });
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
        date: d.printDate
      });
      if (activeDate && d.printDate.getDate() === activeDate.getDate() &&
        d.printDate.getMonth() === activeDate.getMonth()) {
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
        (d) => new Date(d.printDate).getTime() === this.daysTab[index].date.getTime()
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

  public calculateActualRuntime(data) {
    data.forEach((dayData) => {
      let sumActualRT = 0;
      if (dayData.data.length) {
        dayData.data.forEach((d) => {
          let timeDiff = 0;
          if (d.startedTimeOnUtc && d.completedTimeOnUtc) {
            let start = moment(d.startedTimeOnUtc).toDate();
            let comp = moment(d.completedTimeOnUtc).toDate();
            timeDiff = Math.abs(comp.getTime() - start.getTime());
            d.actualRT = timeDiff / (1000 * 3600);
            sumActualRT += timeDiff / (1000 * 3600);
          }
        });
      }
      dayData.sumActualRT = sumActualRT;
    });
  }

  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this._dragulaService.destroy('bag-one');
    this.activatedSub.unsubscribe();
    this._localStorageService.set('isShowAll_SchedulesNeckLabel', this.isShowAllColumns);
    let activeIndex = this.daysTab.findIndex((d) => d.isActive);
    if (activeIndex > -1) {
      this._localStorageService.set(
        'activeDate_SchedulesNeckLabel',
        this.daysTab[activeIndex].date
      );
    }
    this._localStorageService.set(
      'lastScrollPo_SchedulesNeckLabel', this._utilService.scrollElm.scrollTop
    );
  }
}
