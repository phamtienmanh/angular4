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

import _ from 'lodash';
import * as moment from 'moment';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  ExtraValidators,
  ValidationService,
  Util,
  MyDatePickerService,
  CommonService,
  ProgressService
} from '../../../../../shared/services';
import {
  LocalStorageService
} from 'angular-2-local-storage';

// Validators
import {
  MinDate,
  MaxDate
} from '../../../../../shared/validators';

// Interfaces
import {
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  ResponseMessage,
  BasicGeneralInfo,
  TopPpColumnsTypes
} from '../../../../../shared/models';
import { Subject } from 'rxjs/Subject';
import {
  FactoryTypes
} from '../../../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+style';
import {
  HourOffset
} from '../../../../schedules-print.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'top-pp-samples-filter',  // <forgot-password></forgot-password>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'top-pp-samples-filter.template.html',
  styleUrls: [
    'top-pp-samples-filter.style.scss'
  ]
})
export class TopPpSamplesFilterComponent implements OnInit, OnDestroy {
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
  public topPpSamplesData;
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
    topPpCancelDateFromOnUtc: '',
    topPpCancelDateToOnUtc: ''
  };
  public validationMessages = {
    topPpCancelDateFromOnUtc: {
      maxLength: 'Must be earlier than Date End.'
    },
    topPpCancelDateToOnUtc: {
      maxLength: 'Must be later than Date Begin.'
    },
    default: {
      pattern: 'Date is not valid',
      required: 'This is required.'
    }
  };
  public scheduleTypeData = [
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
  public topPpCancelDateFromOptions: any = {
    ...this.myDatePickerOptions
  };
  public topPpCancelDateToOptions: any = {
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

  constructor(private _toastrService: ToastrService,
              private _commonService: CommonService,
              private _utilService: Util,
              private _fb: FormBuilder,
              private _validationService: ValidationService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _localStorageService: LocalStorageService,
              private _progressService: ProgressService,
              public myDatePickerService: MyDatePickerService) {
    // e
  }

  public ngOnInit(): void {
    this.isShowAllColumns = !!this._localStorageService.get('isShowAll_SchedulesTopPpSample');
    this.onColumnChange.emit({showAll: this.isShowAllColumns, cols: this.showHideColumns});
    this.buildForm();
    // this.getCommonData();
    // Config filter
    let filterStore: any = this._localStorageService.get('TopPpSamples_FilterModel');
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
    } else {
      this.onUpdateFilter.next({
        filter: this.getFilterParam(),
        status: this.getStatusFilter()
      });
    }
    // --------------
    if (this.showHideColumns && this.showHideColumns.length) {
      this.isCheckedAll = this.showHideColumns.every((i) => i.isView === true);
    }
  }

  public buildForm(): void {
    let controlConfig = {
      daysTab: new FormControl([]),
      customer: new FormControl(''),
      poId: new FormControl(''),
      colsName: this._fb.array([]),
      factoryName: new FormControl(null),
      styleName: new FormControl(''),
      sampleDate: new FormControl('This Week'),
      topPpCancelDateFrom: new FormControl(''),
      topPpCancelDateFromOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
          MinDate('topPpCancelDateToOnUtc')
        ])
      ]),
      topPpCancelDateTo: new FormControl(''),
      topPpCancelDateToOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
          MaxDate('topPpCancelDateFromOnUtc')
        ])
      ]),
      formRequires: new FormControl({
        customer: {
          required: false
        },
        poId: {
          required: false
        },
        styleName: {
          required: false
        },
        factoryName: {
          required: false
        },
        topPpCancelDateFromOnUtc: {
          required: false
        },
        topPpCancelDateToOnUtc: {
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
    let firstCaseList = [
      'topPpCancelDateFromOnUtc',
      'topPpCancelDateToOnUtc'
    ];
    if (key === 'firstCase') {
      let status = false;
      firstCaseList.forEach((cas) => status = status
        || frm.get('sampleDate').value === 'Custom'
        || !!frm.get(cas).value);
      firstCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else if (key === 'status') {
      let status = !!frm.get('id').value;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else {
      return false;
    }
  }

  public getStatusFilter() {
    let status = [];
    this.frm.get('colsName').value.forEach((col) => {
      if (col.id) {
        status.push({
          type: col.id,
          status: col.status.map((s) => s.id).join(',')
        });
      }
    });
    return status;
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
    patchDateFunc('topPpCancelDateFromOnUtc', 'topPpCancelDateFrom');
    patchDateFunc('topPpCancelDateToOnUtc', 'topPpCancelDateTo');
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
      case 'topPpCancelDateFromOnUtc':
        this.topPpCancelDateToOptions = {
          ...this.topPpCancelDateToOptions,
          disableUntil: dateCurrentUntil,
          enableDays: []
        };
        break;
      case 'topPpCancelDateToOnUtc':
        this.topPpCancelDateFromOptions = {
          ...this.topPpCancelDateFromOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        break;
      default:
        return;
    }
    this._changeDetectorRef.markForCheck();
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

  public onSelectChanged($event, prop) {
    if (prop === 'sampleDate') {
      this.frm.get('topPpCancelDateFromOnUtc').patchValue(null);
      this.frm.get('topPpCancelDateFrom').patchValue(null);
      this.frm.get('topPpCancelDateToOnUtc').patchValue(null);
      this.frm.get('topPpCancelDateTo').patchValue(null);
    }
  }

  /**
   * Get filter value
   * @returns {string}
   */
  public getFilterParam(): string {
    let daysTab = [];
    let sampleDate = this.frm.get('sampleDate').value;
    let curDate = new Date();
    curDate.setHours(-HourOffset, 0, 0);
    this.frm.get('topPpCancelDateFromOnUtc').patchValue(
      moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));
    switch (sampleDate) {
      case 'Yesterday':
        curDate.setDate(curDate.getDate() - 1);
        this.frm.get('topPpCancelDateFromOnUtc').patchValue(
          moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));
        daysTab.push({
          date: moment(curDate).format('YYYY-MM-DDTHH:mm:ss'),
          isActive: false
        });
        curDate.setHours(23 - HourOffset, 59, 59);
        this.frm.get('topPpCancelDateToOnUtc').patchValue(
          moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));
        break;
      case 'Today':
        daysTab.push({
          date: moment(curDate).format('YYYY-MM-DDTHH:mm:ss'),
          isActive: false
        });
        curDate.setHours(23 - HourOffset, 59, 59);
        this.frm.get('topPpCancelDateToOnUtc').patchValue(
          moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));
        break;
      case 'This Week':
        let thisWeek = [];
        let dOW = curDate.getDay();

        for (let i = 1; i < 8; i++) {
          curDate = new Date();
          curDate.setDate(curDate.getDate() - (dOW - i));
          thisWeek.push(curDate);
          daysTab.push({
            date: moment(curDate.setHours(-HourOffset, 0, 0)).format('YYYY-MM-DDTHH:mm:ss'),
            isActive: false
          });
        }
        thisWeek[0].setHours(-HourOffset, 0, 0);
        thisWeek[6].setHours(23 - HourOffset, 59, 59);

        this.frm.get('topPpCancelDateFromOnUtc').patchValue(
          moment(thisWeek[0]).format('YYYY-MM-DDTHH:mm:ss'));
        this.frm.get('topPpCancelDateToOnUtc').patchValue(
          moment(thisWeek[6]).format('YYYY-MM-DDTHH:mm:ss'));
        break;
      case 'Custom':
        this.frm.get('topPpCancelDateFrom').value.jsdate.setHours(-HourOffset, 0, 0);
        this.frm.get('topPpCancelDateTo').value.jsdate.setHours(23 - HourOffset, 59, 59);
        this.frm.get('topPpCancelDateFromOnUtc').patchValue(
          moment(this.frm.get('topPpCancelDateFrom').value.jsdate).format('YYYY-MM-DDTHH:mm:ss'));
        this.frm.get('topPpCancelDateToOnUtc').patchValue(
          moment(this.frm.get('topPpCancelDateTo').value.jsdate).format('YYYY-MM-DDTHH:mm:ss'));
        break;
      default:
        for (let i = 0; i < 7; i++) {
          let nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + i);
          daysTab.push({
            date: moment(nextDate.setHours(-HourOffset, 0, 0)).format('YYYY-MM-DDTHH:mm:ss'),
            isActive: false
          });
        }
        let sixDays = new Date();
        sixDays.setDate(curDate.getDate() + 6);
        sixDays.setHours(23 - HourOffset, 59, 59);
        this.frm.get('topPpCancelDateToOnUtc').patchValue(
          moment(sixDays).format('YYYY-MM-DDTHH:mm:ss'));
        break;
    }
    this.frm.get('daysTab').patchValue(daysTab);
    return this.frm.getRawValue();
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
      this._commonService.markAsDirtyForm(this.frm, true);
      return;
    }
    // set search filter service
    this._localStorageService.set('TopPpSamples_FilterModel',
      this.getFilterModel());

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
  }

  /**
   * changeCheckedCol
   * @param {Event} event
   */
  public changeCheckedCol(event: Event): void {
    this.isCheckedAll = this.showHideColumns.findIndex((col) => col.isView === false) === -1;
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
      this._localStorageService.set('isShowAll_SchedulesTopPpSample', this.isShowAllColumns);
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  //#endregion

  public ngOnDestroy(): void {
    // this._utilService.globalSearch = '';
    if (this.frm && this.frm.valid) {
      this._localStorageService.set('TopPpSamples_FilterModel',
        this.getFilterModel());
    }
  }
}
