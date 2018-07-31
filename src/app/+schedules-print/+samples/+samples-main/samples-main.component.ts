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
  SchedulesPrintService
} from '../../schedules-print.service';
import {
  DragulaService
} from 'ng2-dragula/ng2-dragula';
import * as FileSaver from 'file-saver';
import {
  SamplesMainService
} from './samples-main.service';
import {
  CommonService,
  ThemeSetting,
  ValidationService,
  MyDatePickerService,
  AuthService,
  Util,
  UserContext,
  ProgressService
} from '../../../shared/services';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  OrderMainService
} from '../../../+order-log-v2/+order-main/order-main.service';
import {
  SamplesService
} from '../samples.service';
import {
  SampleJobService
} from '../../modules/sample-job/sample-job.servive';
import {
  EditUserService
} from '../../../+user-management/+edit-user/edit-user.service';
import {
  SampleService
} from '../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+samples/sample.service';

// Component
import {
  SampleJobComponent
} from '../../modules/sample-job';
import {
  ChangeBinidComponent
} from '../components/change-binid';

// Validators
import {
  MaxDate,
  MinDate
} from '../../../shared/validators';

// Interfaces
import {
  ResponseMessage
} from '../../../shared/models';
import {
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  ExtraValidators
} from '../../../shared/services/validation';
import { Subscription } from 'rxjs/Subscription';
import { AccessControlType } from '../../../+role-management/role-management.model';
import {
  StatusType,
  StatusTypeList
} from './samples-main.model';
import {
  ColConfigKey,
  HourOffset
} from '../../schedules-print.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'samples-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'samples-main.template.html',
  styleUrls: [
    'samples-main.style.scss'
  ]
})
export class SamplesMainComponent implements OnInit,
                                             OnDestroy {
  public tableData = [];
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
  public statusList = [
    {
      id: 1,
      name: 'Art Rip Pending'
    },
    {
      id: 2,
      name: 'Art Ripped'
    },
    {
      id: 3,
      name: 'Screen Pending'
    },
    {
      id: 4,
      name: 'Screen Made'
    },
    {
      id: 5,
      name: 'Not Approved'
    },
    {
      id: 6,
      name: 'Approved'
    },
    {
      id: 7,
      name: 'Pellon Pending'
    },
    {
      id: 8,
      name: 'Pellon Made'
    },
    {
      id: 9,
      name: 'Not Approved to Sample'
    },
    {
      id: 10,
      name: 'Approved to Sample'
    },
    {
      id: 11,
      name: 'Ink Pending'
    },
    {
      id: 12,
      name: 'Ink Ready'
    },
    {
      id: 13,
      name: 'Neck Label Pending'
    },
    {
      id: 14,
      name: 'Neck Label Ready'
    }
  ];
  public printerList = [];
  public excludeStaff;
  public searchObj = {
    keyword: ''
  };

  public frm: FormGroup;
  public formErrors = {
    customer: '',
    poId: '',
    // retailerPoId: '',
    styleName: '',
    status: '',
    sampleDate: '',
    sampleDateFromOnUtc: '',
    sampleDateToOnUtc: ''
  };
  public validationMessages = {
    sampleDateFromOnUtc: {
      maxLength: 'Must be earlier than Start Date End.'
    },
    sampleDateToOnUtc: {
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
  public printerFakeId: number;
  public activatedSub: Subscription;
  public destroy$ = new Subject<any>();
  public isPageReadOnly = false;
  public isFullPermission = false;
  public permissions = {
    update: false,
    prioritize: false,
    artRipped: false,
    approvedToSample: false,
    screenMade: false,
    inkReady: false,
    approved: false,
    pellonMade: false,
    neckLabelReady: false
  };
  public accessControlType = AccessControlType;
  public sampleFuncPermissions = [];
  public statusType = StatusType;
  public statusTypeList = StatusTypeList;
  public searchedObj;

  public sumSched;
  public isScreenPrint = false;

  public showHideColumns = [];
  public isCheckedAll = true;
  public columns = [];
  public isShowAllColumns = false;
  public colConfigKey = ColConfigKey;
  public colProp = [
    'CSR / Cust/PO # / Retailer / PO #',
    'Order Dates',
    'Style Name',
    'Art',
    'Neck Label',
    'Blank Color',
    'Bin #',
    'PP Qty',
    'Art Ripped',
    'Screen Made',
    'Ink Ready',
    'Neck Label Ready',
    'Approved to Sample',
    'Approved',
    'Pellon Made'
  ];

  private isShowSearchPanel = false;
  private _maxWidthTable: number;
  private _isEsc = false;
  private _isCorrectData = true;

  constructor(private _router: Router,
              private _modalService: NgbModal,
              private _commonService: CommonService,
              private _schedulesPrintService: SchedulesPrintService,
              private _localStorageService: LocalStorageService,
              private _validationService: ValidationService,
              private _sampleMainService: SamplesMainService,
              private _orderMainService: OrderMainService,
              private _themeSetting: ThemeSetting,
              private _toastrService: ToastrService,
              private _dragulaService: DragulaService,
              private _utilService: Util,
              private _changeDetectorRef: ChangeDetectorRef,
              private _activatedRoute: ActivatedRoute,
              private _userContext: UserContext,
              private _authService: AuthService,
              private _samplesSv: SamplesService,
              private _sampleJobSv: SampleJobService,
              private _ngbDropdownConfig: NgbDropdownConfig,
              private _progressService: ProgressService,
              private _editUserService: EditUserService,
              private _sampleService: SampleService,
              public myDatePickerService: MyDatePickerService) {
    this._ngbDropdownConfig.autoClose = false;

    _dragulaService.setOptions('bag-one', {
      moves: this.validDrag.bind(this),
      copy: true,
      copySortSource: true
    });
    _dragulaService.drop.asObservable().takeUntil(this.destroy$).subscribe((value) => {
      this.onDrop(value.slice(1));
    });
    _dragulaService.shadow
      .asObservable().takeUntil(this.destroy$).subscribe((value) => {
      this.onShadow(value.slice(1));
    });
    _dragulaService.out
      .asObservable().takeUntil(this.destroy$).subscribe((value) => {
      this.onOut(value.slice(1));
    });

    let fontSize = this._localStorageService.get('fontSize_Samples') as string;
    if (fontSize) {
      const modal = {'font-size': fontSize};
      Object.assign(this.myConfigStyle, modal);
      const fontSizeNumber = +fontSize.slice(0, fontSize.length - 2);
      this.fontSizeClass[`font-size-${fontSizeNumber}`] = true;
    } else {
      this._localStorageService.set('fontSize_Samples', this.myConfigStyle['font-size']);
    }

    // Config columns
    let colSchedulesConfigs = this._userContext.currentUser.schedulesColumnConfigs;
    const sampleConfig = this._userContext.currentUser
      .permissions.filter((i) => i.type === 8);
    if (colSchedulesConfigs && colSchedulesConfigs.length) {
      const colConfigs = colSchedulesConfigs
        .find((i) => i.key === this.colConfigKey.SchedulesSamples);
      if (!colConfigs || colConfigs.value.length !== sampleConfig.length) {
        this.showHideColumns = sampleConfig;
      } else {
        colConfigs.value.forEach((i) => {
          let col = sampleConfig.find((o) => o.id === i.id);
          if (col) {
            Object.assign(i, col);
          }
        });
        this.showHideColumns = colConfigs.value;
      }
      const storedColumnConfig = this._userContext.currentUser
        .permissions.filter((i) => i.type === 8);
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
      .permissions.filter((i) => i.type === 8);
    }

    this.showHideColumns.forEach((item) => {
      this.columns.push(Object.assign({}, item));
    });
    this.isCheckedAll = this.showHideColumns.every((i) => i.isView === true);
    this.isShowAllColumns = !!this._localStorageService.get('isShowAll_SchedulesSample');
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
    this.isFullPermission = this._samplesSv.isFullPermission;
    this.initialPermission();
    this.buildForm();
    this.getCommonData();
    this.activatedSub = this._activatedRoute.parent.params
      .subscribe((params: { id: number }) => {
        this.isShowSearchPanel = false;
        if (this._router.url.endsWith('all')) {
          this.isShowSearchPanel = true;
        }
        let id = Number(params.id);
        this.printerFakeId = isNaN(id) ? undefined : id;
        this.isScreenPrint = params.id.toString() === 'screen-print';
        this.getSearchFilterSv();
        if (this.printerList.length) {
          this.getSampleTabData().then((value: boolean) => {
            setTimeout(() => {
              if (this._utilService.scrollElm) {
                this._utilService.scrollElm
                  .scrollTop = this._utilService.scrollPosition;
              }
            }, 200);
          });
        }
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
    this.statusList = _.sortBy(this.statusList, 'name');
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public initialPermission(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Schedules.Samples');
    // Get Print Function Permission from user info
    const funcPermission = this._userContext.currentUser.permissions
      .filter((i) => i.type === this.accessControlType.Functions);
    this.sampleFuncPermissions = funcPermission
      .filter((i) => i.name.includes('Schedules.Samples'));
    // -------
    let propFunc = [
      'Update',
      'Prioritize',
      'ArtRipped.Update',
      'ApprovedToSample.Update',
      'ScreenMade.Update',
      'InkReady.Update',
      'Approved.Update',
      'PellonMade.Update',
      'NeckLabelReady.Update'
    ];
    Object.keys(this.permissions).forEach((p, index) => {
      this.permissions[p] = this.getIsModifyFunc('SampleJob.' + propFunc[index]);
    });
  }

  public buildForm(): void {
    let controlConfig = {
      customer: new FormControl(''),
      poId: new FormControl(''),
      // retailerPoId: new FormControl(''),
      status: new FormControl(null),
      sampleDate: new FormControl('This Week'),
      styleName: new FormControl(''),
      sampleDateFrom: new FormControl(''),
      sampleDateFromOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
          MaxDate('sampleDateToOnUtc', 1)
        ])
      ]),
      sampleDateTo: new FormControl(''),
      sampleDateToOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
          MinDate('sampleDateFromOnUtc', 1)
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
        status: {
          required: false
        },
        sampleDate: {
          required: false
        },
        sampleDateFromOnUtc: {
          required: false
        },
        sampleDateToOnUtc: {
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
      'sampleDateFromOnUtc',
      'sampleDateToOnUtc'
    ];
    if (key === 'firstCase') {
      let status = false;
      firstCaseList.forEach((cas) => status = status
        || frm.get('sampleDate').value === 'Custom'
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
    patchDateFunc('sampleDateFromOnUtc', 'sampleDateFrom');
    patchDateFunc('sampleDateToOnUtc', 'sampleDateTo');
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
    // get search filter service from nest tab
    if (this._sampleMainService.searchObj) {
      this.updateForm(this._sampleMainService.searchObj);
    } else {
      this._sampleMainService.searchObj = JSON.parse(JSON.stringify(this.frm.value));
      delete this._sampleMainService.searchObj.formRequires;
    }

    let data = this.frm.value;
    if (data['poId'] ||
      // data['retailerPoId'] ||
      data['customer'] ||
      data['styleName'] ||
      (data['status'] && data['status'].length) ||
      data['sampleDate'] === 'Custom') {
      this.isFilter = true;
    } else {
      this.isFilter = false;
    }

    // set last tab
    this._sampleMainService.searchFrom = 'samples';
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getSamplesPrinter()
      .subscribe((resp: ResponseMessage<any>): void => {
        if (resp.status) {
          if (!resp.data || !resp.data.length) {
            return;
          }
          this.printerList = resp.data;
          // set exclude staff
          resp.data.forEach((item) => {
            if (item.samplePrinterType) {
              this.excludeStaff = item.samplePrinterName;
            }
          });
          this.filterData();
          this.getSampleTabData().then((value: boolean) => {
            setTimeout(() => {
              if (this._utilService.scrollElm) {
                this._utilService.scrollElm
                  .scrollTop = this._utilService.scrollPosition;
              }
            }, 200);
          });
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
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

  public onAppScroll(event?: any) {
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
    if (event.target.scrollTop >= 100 && this.header.getBoundingClientRect().top < 0
      && fixedHeader && !fixedHeader.hasChildNodes()) {
      fixedHeader.appendChild(this.cloneHeader);
    } else if ((this.header.getBoundingClientRect().top >= 0) || (event.target.scrollTop < 300
        && fixedHeader && fixedHeader.hasChildNodes())) {
      while (fixedHeader.firstChild) {
        fixedHeader.removeChild(fixedHeader.firstChild);
      }
    }
  }

  public onScrollX(event): void {
    this.myConfigStyleHeader = {
      ...this.myConfigStyleHeader,
      left: this.header ? `${this.header.getBoundingClientRect().left}px` : 'auto',
      right: this.header ? `${this.header.getBoundingClientRect().right}px` : 'auto'
    };
  }

  public openModal(data, isNotExcludePrint, readOnly?) {
    let modalRef = this._modalService.open(SampleJobComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static'
    });

    modalRef.componentInstance.styleData = JSON.parse(JSON.stringify(data));
    modalRef.componentInstance.isNotExcludePrint = isNotExcludePrint;
    if (readOnly) {
      modalRef.componentInstance.isReadOnly = readOnly;
    }

    modalRef.result.then((res: any) => {
      if (readOnly) {
        return;
      }
      this._utilService.scrollPosition = this._utilService
        .scrollElm.scrollTop;
      this.getSampleTabData().then((value: boolean) => {
        setTimeout(() => {
          if (this._utilService.scrollElm) {
            this._utilService.scrollElm
              .scrollTop = this._utilService.scrollPosition;
          }
        }, 200);
      });
    }, (err) => {
      // if not, error
    });
  }

  public onFilter() {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
      return;
    }
    // const checkValueNotNull = (list: string[]) => {
    //   let status = true;
    //   list.forEach((i) => {
    //     status = status && !!this.frm.get(i).value;
    //   });
    //   return status;
    // };

    // set search filter service
    let newSearchObj = {...this._sampleMainService.searchObj, ...this.frm.value};
    this._sampleMainService.searchObj = JSON.parse(JSON.stringify(newSearchObj));
    delete this._sampleMainService.searchObj.formRequires;

    let data = this.frm.value;
    if (data['poId'] ||
      // data['retailerPoId'] ||
      data['customer'] ||
      data['styleName'] ||
      (data['status'] && data['status'].length) ||
      data['sampleDate'] === 'Custom') {
      this.isFilter = true;
    } else {
      this.isFilter = false;
    }
    this.getSampleTabData();
  }

  public changeFontSize(fontSize) {
    // deactive previous font size
    let fontSizeId = this.fontSizeData.indexOf(this.myConfigStyle['font-size']);
    this.fontSizeClass[this.fontSizeIndex[fontSizeId]] = false;

    // active new font size
    this.myConfigStyle['font-size'] = fontSize;
    this.myConfigStyleHeader['font-size'] = fontSize;
    this._localStorageService.set('fontSize_Samples', fontSize);
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

  public getDailyTotal(rowData): number {
    if (!rowData) {
      return 0;
    }
    let total = 0;
    rowData.forEach((row) => total += row.scheduledQty);
    return total;
  }

  /**
   * Search text change event
   * @param value
   */
  public onSearchChanged(value: string): void {
    this.searchObj.keyword = value;
    this.getSampleTabData();
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
        day: utcDate.getDate() + 1
      };
      dateCurrentUntil = {
        year: utcDate.getFullYear(),
        month: utcDate.getMonth() + 1,
        day: utcDate.getDate() - 1
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
      case 'sampleDateFromOnUtc':
        this.dateEndOptions = {
          ...this.dateEndOptions,
          disableUntil: dateCurrentUntil,
          enableDays: []
        };
        break;
      case 'sampleDateToOnUtc':
        this.dateBeginOptions = {
          ...this.dateBeginOptions,
          disableSince: dateCurrentSince,
          enableDays: []
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
                           sampleId: number): void {
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    if (!sampleId) {
      this._router
        .navigate(['order-log-v2', orderId, 'styles', styleId, 'print-location', printLocationId]);
    } else {
      this._router
        .navigate(['order-log-v2', orderId, 'styles', styleId, 'neck-labels']);
    }
  }

  public exportOrder(exportType: string) {
    if (exportType === 'test') {
      let curDate = new Date();
      let params: HttpParams = new HttpParams()
        .set('sampleDateFromOnUtc', moment.utc(curDate).format('YYYY-MM-DDTHH:mm:ss'))
        .set('hourOffset', (-1 * curDate.getTimezoneOffset() / 60).toString())
        .set('keyword', this.searchObj.keyword)
        .set('poId', this.searchObj['poId'])
        .set('customer', this.searchObj['customer'])
        .set('styleName', this.searchObj['styleName'])
        .set('status', this.searchObj['status']);

      switch (this.searchObj['sampleDate']) {
        case 'Yesterday':
          params = params.set('sampleDateFromOnUtc', moment.utc(curDate)
            .format('YYYY-MM-DDTHH:mm:ss'));
          break;
        case 'Today':
          break;
        case 'This Week':
          params = params.set('sampleDateFromOnUtc',
            moment.utc(this.tableData[0].date).format('YYYY-MM-DDTHH:mm:ss'));
          params = params.set('sampleDateToOnUtc',
            moment.utc(this.tableData[6].date).format('YYYY-MM-DDTHH:mm:ss'));
          break;
        case 'Custom':
          params = params.set('sampleDateFromOnUtc',
            moment.utc(this.searchObj['sampleDateFromOnUtc']).format('YYYY-MM-DDTHH:mm:ss'));
          params = params.set('sampleDateToOnUtc',
            moment.utc(this.searchObj['sampleDateToOnUtc']).format('YYYY-MM-DDTHH:mm:ss'));
          break;
        default:
          let sixDays = new Date();
          sixDays.setDate(curDate.getDate() + 6);
          params = params.set('sampleDateToOnUtc', moment.utc(sixDays)
            .format('YYYY-MM-DDTHH:mm:ss'));
          break;
      }

      this._schedulesPrintService.exportSchedulesData(params)
        .subscribe((resp: any): void => {
          if (resp.status) {
            let data = resp;
            let values = data.headers.get('Content-Disposition');
            let filename = values.split(';')[1].trim().split('=')[1];
            // remove " from file name
            filename = filename.replace(/"/g, '');
            let blob;
            if (exportType === 'test') {
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

  public isRowComplete(row, isNotExcludePrint) {
    let statusList = [
      'isArtRipped',
      'isApprovedToSample',
      'isScreenMade',
      'inkReady',
      'neckLabelReady',
      'isApproved',
      'isPellonMade'
    ];
    let excludePrinterStatus =
      ['isArtRipped', 'isApprovedToSample', 'neckLabelReady', 'isApproved'];
    if (!row.hasNeckLabel) {
      statusList.splice(4, 1);
      excludePrinterStatus.splice(2, 1);
    }
    let isComplete = true;
    if (isNotExcludePrint) {
      statusList.forEach((item) => {
        if (!row[item]) {
          isComplete = false;
        }
      });
    } else {
      excludePrinterStatus.forEach((item) => {
        if (!row[item]) {
          isComplete = false;
        }
      });
    }
    return isComplete;
  }

  public getSampleTabData(): Promise<boolean> {
    const data = this.frm.value;
    let curDate = new Date();
    curDate.setHours(-HourOffset, 0, 0);
    let params: HttpParams = new HttpParams()
      .set('sampleDateFromOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'))
      .set('hourOffset', HourOffset.toString())
      .set('poId', data['poId'])
      .set('customer', data['customer'])
      .set('styleName', data['styleName'])
      .set('status', data['status'] && data['status'].length ? data['status'].join(',') : '')
      .set('isScreenPrint', this.isScreenPrint.toString());
    if (this.printerFakeId) {
      let index = this.printerList.findIndex((item) => item.fakeId === this.printerFakeId);
      if (index > -1) {
        params = params.set('samplePrinterId', this.printerList[index].id);
        params = params.set('samplePrinterType', this.printerList[index].samplePrinterType);
      }
      if (!this.printerList.length) {
        this._isCorrectData = false;
      }
    }

    switch (data['sampleDate']) {
      case 'Yesterday':
        curDate.setDate(curDate.getDate() - 1);
        params = params.set('sampleDateFromOnUtc', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));
        break;
      case 'Today':
        break;
      case 'This Week':
        let thisWeek = [];
        let dOW = curDate.getDay();

        for (let i = 1; i < 8; i++) {
          curDate = new Date();
          curDate.setDate(curDate.getDate() - (dOW - i));
          thisWeek.push(curDate);
        }
        thisWeek[0].setHours(-HourOffset, 0, 0);
        thisWeek[6].setHours(23 - HourOffset, 59, 59);

        params = params.set('sampleDateFromOnUtc', moment(thisWeek[0])
          .format('YYYY-MM-DDTHH:mm:ss'));
        params = params.set('sampleDateToOnUtc', moment(thisWeek[6]).format('YYYY-MM-DDTHH:mm:ss'));
        break;
      case 'Custom':
        data['sampleDateFrom'].jsdate.setHours(-HourOffset, 0, 0);
        data['sampleDateTo'].jsdate.setHours(23 - HourOffset, 59, 59);
        params = params.set('sampleDateFromOnUtc',
          moment(data['sampleDateFrom'].jsdate).format('YYYY-MM-DDTHH:mm:ss'));
        params = params.set('sampleDateToOnUtc',
          moment(data['sampleDateTo'].jsdate).format('YYYY-MM-DDTHH:mm:ss'));
        break;
      default:
        let sixDays = new Date();
        sixDays.setDate(curDate.getDate() + 6);
        sixDays.setHours(23 - HourOffset, 59, 59);
        params = params.set('sampleDateToOnUtc', moment(sixDays).format('YYYY-MM-DDTHH:mm:ss'));
        break;
    }
    return new Promise((resolve, reject) => {
      this._sampleMainService.getSamplesTabData(params)
        .subscribe((resp: ResponseMessage<any>): void => {
          if (resp.status) {
            this.searchedObj = {...this.frm.value};
            if (data['sampleDate'] === 'This Week' || data['sampleDate'] === 'Next 7 Days') {
              // Set data
              let thisWeek = [];
              let currentDate = new Date();
              let dOW = currentDate.getDay();

              for (let i = 0; i < 7; i++) {
                currentDate = new Date();
                if (data['sampleDate'] === 'This Week') {
                  currentDate.setDate(currentDate.getDate() - (dOW - (i + 1)));
                } else if (data['sampleDate'] === 'Next 7 Days') {
                  currentDate.setDate(currentDate.getDate() + i);
                }
                currentDate = new Date(currentDate.getFullYear(),
                  currentDate.getMonth(), currentDate.getDate());
                let sameDate = resp.data.find((item) => {
                  if (item.sampleDate) {
                    const sampleDate = new Date(item.sampleDate);
                    return currentDate.getDate() === sampleDate.getDate();
                  }
                });
                if (sameDate) {
                  thisWeek.push(sameDate);
                } else {
                  thisWeek.push({
                    data: [],
                    sampleDate: currentDate
                  });
                }
              }
              this.tableData = thisWeek;
            } else {
              this.tableData = resp.data;
            }
            if (data['sampleDate'] === 'Custom') {
              this.tableData = _.sortBy(this.tableData, 'sampleDate');
            }
            this.filterData();
            this.tableData.forEach((d) => {
              d.data.forEach((d2) => {
                d2.data = _.sortBy(d2.data, 'orderNum');
              });
            });
            // only show day contain data if search mode on
            if (this.isFilter) {
              this.tableData = this.tableData.filter((d) => d.data.length);
            }
            this.totalSched();
            this._changeDetectorRef.markForCheck();
            resolve(true);
          } else {
            this._changeDetectorRef.markForCheck();
            this._toastrService.error(resp.errorMessages, 'Error');
            resolve(false);
          }
        });
    });
  }

  public filterData() {
    if (this.printerList.length &&
      this.tableData.length &&
      this.printerFakeId &&
      !this._isCorrectData) {
      let index = this.printerList.findIndex((item) => item.fakeId === this.printerFakeId);
      this.tableData.forEach((dayData) => {
        dayData.data =
          dayData.data.filter((item) => item.samplePrinterId === this.printerList[index].id &&
            item.samplePrinterName === this.printerList[index].samplePrinterName);
      });
      this._isCorrectData = true;
    }
  }

  /**
   * Prevent drag on invalid row
   */
  public validDrag(el, container, handle) {
    return handle.className.includes('fa-arrows');
  }

  public onShadow(args) {
    // scroll down if el close bottom
    let rect = args[0].getBoundingClientRect();
    if (window.innerHeight - rect.top < 220) {
      if (this._utilService.scrollElm) {
        this._utilService.scrollElm
          .scrollTop += 50;
      }
    }
    if (window.innerHeight - rect.top > 400) {
      if (this._utilService.scrollElm) {
        this._utilService.scrollElm
          .scrollTop -= 50;
      }
    }
  }

  /**
   * Handle out event
   */
  public onOut(args) {
    // empty
  }

  /**
   * Handle drop event
   */
  public onDrop(args) {
    // detect where drop
    let isPre = false;
    let sibIndex = args[3];
    if (!sibIndex || !sibIndex.id) {
      sibIndex = args[0].previousElementSibling;
      isPre = true;
    }
    if (sibIndex && sibIndex.id) {
      sibIndex = sibIndex.id.split('-');
    } else {
      return;
    }
    let elIndex = args[0].id.split('-');
    elIndex.forEach((item, index) => {
      elIndex[index] = Number.parseInt(elIndex[index]);
      if (sibIndex && sibIndex.length) {
        sibIndex[index] = Number.parseInt(sibIndex[index]);
      }
    });

    // get drag item data
    let dragItem;
    let isRearrange = false;
    let listSchedulerIds = [];
    try {
      dragItem = this.tableData[elIndex[0]].data[elIndex[1]].data[elIndex[2]];
    } catch (er) {
      return;
    }
    // rearrange
    if (this.tableData[elIndex[0]].sampleDate === this.tableData[sibIndex[0]].sampleDate &&
      this.tableData[elIndex[0]].data[elIndex[1]].samplePrinterId ===
      this.tableData[sibIndex[0]].data[sibIndex[1]].samplePrinterId &&
      this.tableData[elIndex[0]].data[elIndex[1]].samplePrinterType ===
      this.tableData[sibIndex[0]].data[sibIndex[1]].samplePrinterType) {
      isRearrange = true;
    }
    if (!isNaN(sibIndex[1])) {
      this.tableData[sibIndex[0]].data[sibIndex[1]]
        .data.forEach((item, index) => {
        if (index === sibIndex[2] && !isPre) {
          listSchedulerIds.push(
            dragItem.printLocationId
          );
        }
        if (index !== elIndex[2] && isRearrange) {
          listSchedulerIds.push(item.printLocationId);
        }
        if (!isRearrange) {
          listSchedulerIds.push(item.printLocationId);
        }
        if (index === sibIndex[2] && isPre) {
          listSchedulerIds.push(
            dragItem.printLocationId
          );
        }
      });
    }

    // reassign
    let sampleDate = new Date(this.tableData[sibIndex[0]].sampleDate);
    let model = {
      sampleDateOnUtc:
        moment.utc(
          sampleDate.setHours(12, 0, 0)
        ).format('YYYY-MM-DDTHH:mm:ss'),
      samplePrinterId: undefined,
      samplePrinterType: undefined,
      listReArranges: []
    };
    if (!isNaN(sibIndex[1])) {
      model.samplePrinterId = this.tableData[sibIndex[0]].data[sibIndex[1]].samplePrinterId;
      model.samplePrinterType = this.tableData[sibIndex[0]].data[sibIndex[1]].samplePrinterType;
      model.listReArranges = listSchedulerIds;
    }
    // drag to empty day
    if (isNaN(sibIndex[1])) {
      model.samplePrinterId = this.tableData[elIndex[0]].data[elIndex[1]].samplePrinterId;
      model.samplePrinterType = this.tableData[elIndex[0]].data[elIndex[1]].samplePrinterType;
    }

    // call api
    if (isRearrange) {
      this._sampleMainService.reArrangeSample(listSchedulerIds)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this._utilService.scrollPosition = this._utilService
              .scrollElm.scrollTop;
            this.getSampleTabData().then((value: boolean) => {
              setTimeout(() => {
                if (this._utilService.scrollElm) {
                  this._utilService.scrollElm
                    .scrollTop = this._utilService.scrollPosition;
                }
              }, 200);
            });
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
      return;
    }
    if (!model.samplePrinterId) {
      return;
    }
    this._sampleMainService.reAssignSample(dragItem.printLocationId, model)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this._utilService.scrollPosition = this._utilService
            .scrollElm.scrollTop;
          this.getSampleTabData().then((value: boolean) => {
            setTimeout(() => {
              if (this._utilService.scrollElm) {
                this._utilService.scrollElm
                  .scrollTop = this._utilService.scrollPosition;
              }
            }, 200);
          });
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public getIsModifyFunc(name: string): boolean {
    const status = this.sampleFuncPermissions.find((i) => i.name.includes(name));
    return status ? status.isModify : true;
  }

  public changeStatus(styleData, type, isNotExcludePrint) {
    if (this.isRowComplete(styleData, isNotExcludePrint) && !this.isFullPermission) {
      this._toastrService.success('', 'Status already done!');
      return;
    }
    const prop = this.statusTypeList[type].prop;
    const status = this.statusTypeList[type].status;
    if (!this.permissions[prop]) {
      this._toastrService.error('You are not authorized to change '
        + this.statusTypeList[type].name + ' status.', 'Error');
      return;
    }
    let curDate = new Date();
    let params: HttpParams = new HttpParams()
      .set('utcOffset', (-1 * curDate.getTimezoneOffset() / 60).toString())
      .set('currentDate', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));
    this._sampleJobSv
      .changeStatus(styleData.printLocationId, type, !styleData[status], params)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
          styleData[status] = !styleData[status];
          styleData[prop + 'UpdatedOnUtc'] = resp.data.updatedOnUtc;
          styleData[prop + 'UpdatedByUser'] = resp.data.fullName;
          if (styleData[status]) {
            this.createJob(styleData, {activeItem: [{text: this.statusTypeList[type].name}]});
            // if approved and not approved to sample then approved to sample too
            if (prop === 'approved' && !styleData.isApprovedToSample) {
              styleData.isApprovedToSample = true;
              styleData['approvedToSampleUpdatedOnUtc'] = resp.data.updatedOnUtc;
              styleData['approvedToSampleUpdatedByUser'] = resp.data.fullName;
            }
          }
          // update colors when approved
          if (type === this.statusType.Approved) {
            styleData.colors = resp.data.colors;
          }
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public createJob(styleData, content) {
    if (content.activeItem.length || content.ngSelect.inputValue) {
      let model = {
        jobContent: (content.activeItem.length ? content.activeItem[0].text :
          content.ngSelect.inputValue)
      };
      let curDate = new Date();
      let params: HttpParams = new HttpParams()
        .set('utcOffset', (-1 * curDate.getTimezoneOffset() / 60).toString())
        .set('currentDate', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));
      this._sampleJobSv.createJob(styleData.printLocationId, params, model)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            // this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
  }

  public totalSched() {
    this.sumSched = 0;
    this.tableData.forEach((dayData) => {
      dayData.data.forEach((rowData) => {
        this.sumSched += rowData.data.length;
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
        this._progressService.start();
        setTimeout(() => {
          this.showHideColumns.forEach((item, index) => {
            Object.assign(this.columns[index], item);
          });

          if (this._userContext.currentUser.permissions) {
            const pagePermissions = this._userContext.currentUser.permissions
              .filter((i) => i.type === 8);
            this._editUserService.updateSchedulesColumnsConfig(this._userContext.currentUser.id,
              this.showHideColumns, this.colConfigKey.SchedulesSamples)
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
      this._progressService.done();
      this._localStorageService.set('isShowAll_SchedulesSample', this.isShowAllColumns);
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  //#endregion

  public isSendToCustomer(approvalTypes: string) {
    return approvalTypes.includes('Send To Customer');
  }

  public onChangeBinId(row): void {
    if (!row.orderDetailId) {
      this._toastrService.error('Order Detail must be specified before you can assign Bin #',
        'Error');
      return;
    }
    setTimeout(() => {
      let modalRef = this._modalService.open(ChangeBinidComponent, {
        size: 'sm',
        keyboard: false,
        backdrop: 'static'
      });
      modalRef.componentInstance.styleId = row.orderDetailId;
      modalRef.componentInstance.sampleBinId = row.sampleBinId;
      modalRef.componentInstance.sampleBinName = row.sampleBinName;
      modalRef.result.then((res) => {
        if (res) {
          this._sampleService.updateSampleBin(row.orderDetailId, res)
            .subscribe((resp: ResponseMessage<any>) => {
              if (resp.status) {
                row.sampleBinId = res.sampleBinId;
                row.sampleBinName = res.sampleBinName;
                this._changeDetectorRef.markForCheck();
                this._toastrService.success(resp.message, 'Success');
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
      }, (err) => {
        // empty
      });
    }, 200);
  }

  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this._dragulaService.destroy('bag-one');
    this.activatedSub.unsubscribe();
    this._localStorageService.set('isShowAll_SchedulesSample', this.isShowAllColumns);
  }
}
