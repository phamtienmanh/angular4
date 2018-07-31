import {
  Component,
  ViewEncapsulation,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import {
  Validators,
  FormGroup,
  FormControl,
  FormBuilder,
  FormArray
} from '@angular/forms';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  ValidationService
} from '../../../../../shared/services/validation';
import {
  Util
} from '../../../../../shared/services/util';
import {
  MyDatePickerService
} from '../../../../../shared/services/my-date-picker';
import {
  CommonService
} from '../../../../../shared/services/common';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  PendingSamplesMainService
} from '../../pending-samples-main.service';
import { ProgressService } from '../../../../../shared/services/progress';
import _ from 'lodash';

// Validators
import {
  MinDate,
  MaxDate
} from '../../../../../shared/validators';

// Interfaces
import {
  IMyDate,
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  ResponseMessage,
  BasicGeneralInfo,
  TopPpColumnsTypes
} from '../../../../../shared/models';
import { FilerType } from './pending-samples-filter.model';
import { Subject } from 'rxjs/Subject';
import {
  FactoryTypes
} from '../../../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+style';
import { ExtraValidators } from '../../../../../shared/services/validation';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'pending-samples-filter',  // <forgot-password></forgot-password>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'pending-samples-filter.template.html',
  styleUrls: [
    'pending-samples-filter.style.scss'
  ]
})
export class PendingSamplesFilterComponent implements OnInit, OnDestroy {
  @Input()
  public isPageReadOnly = false;
  @Input()
  public fontSize = '11px';
  @Input()
  public showHideColumns;
  @Input()
  public columns;
  @Input()
  public isShowAllColumns = false;
  @Input()
  public pendingSamplesData;

  @Output()
  public onChangeFontSize = new EventEmitter<string>();
  @Output()
  public onExportOrder = new EventEmitter<any>();
  @Output()
  public onFilter = new EventEmitter<any>();
  @Output()
  public onUpdateFilter = new EventEmitter<any>();
  @Output()
  public onColumnChange = new EventEmitter<any>();

  public frm: FormGroup;
  public formErrors = {
    customer: '',
    poId: '',
    colsName: '',
    styleName: '',
    factoryName: '',
    orderDateFromOnUtc: '',
    orderDateToOnUtc: '',
    startDateFromOnUtc: '',
    startDateToOnUtc: '',
    cancelDateFromOnUtc: '',
    cancelDateToOnUtc: ''
  };
  public validationMessages = {
    orderDateFromOnUtc: {
      maxLength: 'Must be earlier than Order Date End.'
    },
    orderDateToOnUtc: {
      maxLength: 'Must be later than Order Date Begin.'
    },
    startDateFromOnUtc: {
      maxLength: 'Must be earlier than Start Date End.'
    },
    startDateToOnUtc: {
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
  public orderDateFromOptions: any = {
    ...this.myDatePickerOptions
  };
  public orderDateToOptions: any = {
    ...this.myDatePickerOptions
  };
  public startDateFromOptions: any = {
    ...this.myDatePickerOptions
  };
  public startDateToOptions: any = {
    ...this.myDatePickerOptions
  };
  public cancelDateFromOptions: any = {
    ...this.myDatePickerOptions
  };
  public cancelDateToOptions: any = {
    ...this.myDatePickerOptions
  };
  public dateBeginOptions: any = {
    ...this.myDatePickerOptions
  };
  public dateEndOptions: any = {
    ...this.myDatePickerOptions
  };

  public factoryData = [];
  public factoryTypes = FactoryTypes;
  public fontSizeData = ['8px', '9px', '10px', '11px', '12px'];
  public searchedObj;
  public listColumnName = _.sortBy(TopPpColumnsTypes, 'name');
  public listColumnStatus = [];
  public approvalTypeList = [];

  public isCheckedAll = true;
  // public isShowAllColumns = false;

  constructor(private _toastrService: ToastrService,
              private _commonService: CommonService,
              private _utilService: Util,
              private _fb: FormBuilder,
              private _validationService: ValidationService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _localStorageService: LocalStorageService,
              private _pendingSamplesMainSv: PendingSamplesMainService,
              private _progressService: ProgressService,
              public myDatePickerService: MyDatePickerService) {

  }

  public ngOnInit(): void {
    this.buildForm();
    this.getCommonData();
    // Config filter
    // let filterStore = this._localStorageService.get('PendingSamples_FilterModel');
    let filterStore = this._pendingSamplesMainSv.searchObj;
    if (filterStore) {
      if (this.frm) {
        this.frm.patchValue(filterStore);
        if (filterStore.colsName && filterStore.colsName.length) {
          this.setColsName(filterStore.colsName);
        } else {
          this.addColName();
        }
        this.setDateValue();
        this.searchedObj = {...this.frm.value};
        this.onUpdateFilter.next({
          filter: this.getFilterParam(),
          status: this.getStatusFilter()
        });
        this._changeDetectorRef.markForCheck();
      }
    }
    // --------------
    if (this.showHideColumns && this.showHideColumns.length) {
      this.isCheckedAll = this.showHideColumns.every((i) => i.isView === true);
    }
  }

  public buildForm(): void {
    let controlConfig = {
      customer: new FormControl(''),
      poId: new FormControl(''),
      // retailerPoId: new FormControl(''),
      colsName: this._fb.array([]),
      factoryName: new FormControl(null),
      styleName: new FormControl(''),
      orderDateFrom: new FormControl(''),
      orderDateFromOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
          MinDate('orderDateToOnUtc')
        ])
      ]),
      orderDateTo: new FormControl(''),
      orderDateToOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
          MaxDate('orderDateFromOnUtc')
        ])
      ]),
      startDateFrom: new FormControl(''),
      startDateFromOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
          MinDate('startDateToOnUtc')
        ])
      ]),
      startDateTo: new FormControl(''),
      startDateToOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
          MaxDate('startDateFromOnUtc')
        ])
      ]),
      cancelDateFrom: new FormControl(''),
      cancelDateFromOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
          MinDate('cancelDateToOnUtc')
        ])
      ]),
      cancelDateTo: new FormControl(''),
      cancelDateToOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
          MinDate('cancelDateFromOnUtc')
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
        factoryName: {
          required: false
        },
        orderDateFromOnUtc: {
          required: false
        },
        orderDateToOnUtc: {
          required: false
        },
        startDateFromOnUtc: {
          required: false
        },
        startDateToOnUtc: {
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
    this.addColName();
    this.onValueChanged(); // (re)set validation messages now
  }

  public get colsName(): FormArray {
    return this.frm.get('colsName') as FormArray;
  }

  public setColsName(colsName: any[]) {
    let colsNameFGs = [];
    colsName.forEach((colName, index) => {
      let colsNameFrm = this._validationService.buildForm({
        id: new FormControl(colName.id),
        name: new FormControl(colName.name),
        status: new FormControl(colName.status, [
          Validators.compose([
            ExtraValidators.conditional(
              (group) => this.getSpecialRequireCase(group, 'status'),
              Validators.compose([
                Validators.required
              ])
            )
          ])
        ]),
        formRequires: new FormControl({
          status: {
            required: false
          }
        })
      }, {}, {});
      colsNameFGs.push(colsNameFrm);

      if (index === colsName.length - 1) {
        let selected = TopPpColumnsTypes.find((i) => i.id === colName.id);
        this.listColumnStatus = selected ? selected['listStatus'] : [];
      }
    });
    const colsNameFormArray = this._fb.array(colsNameFGs);
    this.frm.setControl('colsName', colsNameFormArray);
    this.frm.get('colsName').updateValueAndValidity();
  }

  public addColName() {
    if (this.colsName.invalid) {
      this.frm.get('colsName').updateValueAndValidity();
      return;
    }
    this.colsName.push(this._validationService.buildForm({
      id: new FormControl(null),
      name: new FormControl(''),
      status: new FormControl([], [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'status'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      formRequires: new FormControl({
        status: {
          required: false
        }
      })
    }, {}, {}));
  }

  public listColumnNameFilter() {
    let selectedIds = this.colsName.value.map((col) => col.id);
    return _.sortBy(TopPpColumnsTypes, 'name').filter((s) => !selectedIds.includes(s.id));
  }

  public toStatusString(status: any[]) {
    return status.map((s) => s.name).join(', ');
  }

  public removeStatus(index: number) {
    this.colsName.removeAt(index);
    this.listColumnName = this.listColumnNameFilter();
  }

  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    if (key === 'status') {
      let status = !!frm.get('id').value;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else {
      return false;
    }
  }

  public getStatusFilter(): string {
    let status = [];
    this.frm.get('colsName').value.forEach((col) => {
      if (col.id) {
        status.push({
          type: col.id,
          status: col.status.map((s) => s.id).join(',')
        });
      }
    });
    return JSON.stringify(status);
  }

  /**
   * onValueChanged
   * @param data
   */
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

  public getFilterModel(): any {
    return this.frm.getRawValue();
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): Promise<boolean> {
    const initStreamNum = 2;
    let streamThread = new Subject<boolean>();
    this._commonService.getFactoryList(this.factoryTypes.All)
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.factoryData = resp.data;
          streamThread.next(true);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._commonService.getApprovalTypeList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.approvalTypeList = resp.data;
          streamThread.next(true);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
    return new Promise((resolve, reject) => {
      let doneStreamNum = 0;
      streamThread.subscribe((isDone: boolean) => {
        if (isDone) {
          doneStreamNum++;
        }
        if (doneStreamNum === initStreamNum) {
          this._changeDetectorRef.markForCheck();
          resolve(true);
        }
      });
    });
  }

  public onSelectItem(val, frm, valProp: string,
                      formControlName: string, isColName?: boolean): void {
    if (isColName) {
      frm.get('status').patchValue([]);
      this.listColumnStatus = val['listStatus'];
      this.listColumnName = this.listColumnNameFilter();
      if (valProp === 'id' && val[valProp] === 1) {
        // Sample Approval Type
        this.listColumnStatus = this.approvalTypeList;
      }
    }
    if (val[valProp]) {
      frm.get(formControlName).patchValue(val[valProp]);
    } else {
      // add new
      frm.get(formControlName).patchValue(val);
    }
  }

  /**
   * Active value to my date picker
   * @param {FormGroup} form
   */
  public setDateValue(): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (this.frm.get(importName).value) {
        const currentDate = new Date(this.frm.get(importName).value);
        currentDate.setHours(0, 0, 0);
        this.configDateOptions(importName, currentDate);
        this.frm.get(exportName).setValue({
          date: {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            day: currentDate.getDate()
          },
          jsdate: currentDate
        });
      } else {
        this.frm.get(importName).patchValue(null);
        this.frm.get(exportName).patchValue(null);
        this.configDateOptions(importName, null);
      }
    };
    patchDateFunc('orderDateFromOnUtc', 'orderDateFrom');
    patchDateFunc('orderDateToOnUtc', 'orderDateTo');
    patchDateFunc('startDateFromOnUtc', 'startDateFrom');
    patchDateFunc('startDateToOnUtc', 'startDateTo');
    patchDateFunc('cancelDateFromOnUtc', 'cancelDateFrom');
    patchDateFunc('cancelDateToOnUtc', 'cancelDateTo');
  }

  /**
   * Convert Date to IMyDate & Reconfig date options
   * @param prop
   * @param utcDate
   * @param i
   */
  public configDateOptions(prop: string, utcDate: Date): void {
    if (!utcDate) {
      switch (prop) {
        case 'orderDateFromOnUtc':
          // Config for cancel date options
          this.orderDateToOptions = {
            ...this.orderDateToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          this.orderDateFromOptions = {
            ...this.orderDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          if (this.frm) {
            this.frm.get('orderDateToOnUtc').setValue(null);
            this.frm.get('orderDateTo').setValue(null);
          }
          break;
        case 'orderDateToOnUtc':
          // Config for start date options
          this.orderDateFromOptions = {
            ...this.orderDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          break;
        case 'startDateFromOnUtc':
          // Config for cancel date options
          this.startDateToOptions = {
            ...this.startDateToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          this.startDateFromOptions = {
            ...this.startDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          if (this.frm) {
            this.frm.get('startDateToOnUtc').setValue(null);
            this.frm.get('startDateTo').setValue(null);
          }
          break;
        case 'startDateToOnUtc':
          // Config for start date options
          this.startDateFromOptions = {
            ...this.startDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          break;
        case 'cancelDateFromOnUtc':
          // Config for cancel date options
          this.cancelDateToOptions = {
            ...this.cancelDateToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          this.cancelDateFromOptions = {
            ...this.cancelDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          if (this.frm) {
            this.frm.get('cancelDateTo').setValue(null);
            this.frm.get('cancelDateToOnUtc').setValue(null);
          }
          break;
        case 'cancelDateToOnUtc':
          // Config for start date options
          this.cancelDateFromOptions = {
            ...this.cancelDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          break;
        default:
          break;
      }
      return;
    }
    let dateCurrentSince: IMyDate = {
      year: utcDate.getFullYear(),
      month: utcDate.getMonth() + 1,
      day: utcDate.getDate()
    };
    let dateCurrentUntil: IMyDate = {
      year: utcDate.getFullYear(),
      month: utcDate.getMonth() + 1,
      day: utcDate.getDate()
    };

    switch (prop) {
      case 'orderDateFromOnUtc':
        // Config for end date options
        this.orderDateToOptions = {
          ...this.orderDateToOptions,
          disableUntil: dateCurrentUntil,
          enableDays: []
        };
        break;
      case 'orderDateToOnUtc':
        // Config for start date options
        this.orderDateFromOptions = {
          ...this.orderDateFromOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        break;
      case 'startDateFromOnUtc':
        // Config for end date options
        this.startDateToOptions = {
          ...this.startDateToOptions,
          disableUntil: dateCurrentUntil,
          enableDays: []
        };
        break;
      case 'startDateToOnUtc':
        // Config for start date options
        this.startDateFromOptions = {
          ...this.startDateFromOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        break;
      case 'cancelDateFromOnUtc':
        // Config for end date options
        this.cancelDateToOptions = {
          ...this.cancelDateToOptions,
          disableUntil: dateCurrentUntil,
          enableDays: []
        };
        break;
      case 'cancelDateToOnUtc':
        // Config for start date options
        this.cancelDateFromOptions = {
          ...this.cancelDateFromOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        break;
      default:
        break;
    }
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
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  /**
   * Get filter value
   * @returns {string}
   */
  public getFilterParam(): string {
    let filterParam = [
      {
        filterType: FilerType.Customer.toString(),
        value: this.frm.get('customer').value || ''
      },
      {
        filterType: FilerType.PoId.toString(),
        value: this.frm.get('poId').value || ''
      },
      // {
      //   filterType: FilerType.RetailerPoId.toString(),
      //   value: this.frm.get('retailerPoId').value || ''
      // },
      {
        filterType: FilerType.FactoryName.toString(),
        value: this.frm.get('factoryName').value || ''
      },
      {
        filterType: FilerType.StyleName.toString(),
        value: this.frm.get('styleName').value || ''
      }
    ];
    let dateFilter = [
      {
        type: FilerType.OrderDateFromOnUtc,
        prop: 'orderDateFromOnUtc'
      },
      {
        type: FilerType.OrderDateToOnUtc,
        prop: 'orderDateToOnUtc'
      },
      {
        type: FilerType.StartDateFromOnUtc,
        prop: 'startDateFromOnUtc'
      },
      {
        type: FilerType.StartDateToOnUtc,
        prop: 'startDateToOnUtc'
      },
      {
        type: FilerType.CancelDateFromOnUtc,
        prop: 'cancelDateFromOnUtc'
      },
      {
        type: FilerType.CancelDateToOnUtc,
        prop: 'cancelDateToOnUtc'
      }
    ];
    dateFilter.forEach((filter) => {
      if (this.frm.get(filter.prop).value) {
        filterParam.push({
          filterType: filter.type.toString(),
          value: this.frm.get(filter.prop).value
        });
      }
    });
    return JSON.stringify(filterParam);
  }

  /**
   * Export selected orders
   */
  public exportOrder(type: string): void {
    this.onExportOrder.emit({
      type,
      filter: this.getFilterParam(),
      status: this.getStatusFilter()
    });
  }

  /**
   * changeFontSize
   * @param {string} fontSize
   */
  public changeFontSize(fontSize: string): void {
    this.onChangeFontSize.emit(fontSize);
  }

  /**
   * Fire filter event
   */
  public filter(): void {
    if (this.frm.invalid) {
      return;
    }
    // this._localStorageService.set('PendingSamples_FilterModel',
    //   this.getFilterModel());

    // set search filter service
    let newSearchObj = {...this._pendingSamplesMainSv.searchObj, ...this.frm.value};
    this._pendingSamplesMainSv.searchObj = JSON.parse(JSON.stringify(newSearchObj));
    delete this._pendingSamplesMainSv.searchObj.formRequires;

    this.searchedObj = {...this.frm.value};
    this.onFilter.emit({
      filter: this.getFilterParam(),
      status: this.getStatusFilter()
    });
    this.listColumnName = this.listColumnNameFilter();
  }

  //#region show hide column

  /**
   * onChangeShowHideColumn
   * @param {boolean} isOpen
   */
  public onChangeShowHideColumn(isOpen: boolean): void {
    this.onColumnChange.emit({open: isOpen, cols: this.showHideColumns});
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
   * showAllColumns
   * @param {boolean} isShowAll
   */
  public showAllColumns(isShowAll: boolean): void {
    this._progressService.start();
    setTimeout(() => {
      this.isShowAllColumns = isShowAll;
      this.onColumnChange.emit({showAll: isShowAll, cols: this.showHideColumns});
      this._progressService.done();
      this._localStorageService.set('isShowAll_SchedulesPendingSample', this.isShowAllColumns);
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  //#endregion

  public ngOnDestroy(): void {
    // this._utilService.globalSearch = '';
    // if (this.frm.valid) {
    //   this._localStorageService.set('PendingSamples_FilterModel',
    //     this.getFilterModel());
    // }
  }
}
