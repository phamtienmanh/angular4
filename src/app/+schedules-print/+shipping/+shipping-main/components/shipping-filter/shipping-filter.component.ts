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
  BasicGeneralInfo
} from '../../../../../shared/models';
import { FilerType } from './shipping-filter.model';
import { Subject } from 'rxjs/Subject';
import {
  FactoryTypes
} from '../../../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+style';
import { ExtraValidators } from '../../../../../shared/services/validation';
import {
  ColumnsType
} from '../../pending-samples-main.model';
import { ShippingMainService } from '../../shipping-main.service';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'shipping-filter',  // <forgot-password></forgot-password>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'shipping-filter.template.html',
  styleUrls: [
    'shipping-filter.style.scss'
  ]
})
export class ShippingFilterComponent implements OnInit, OnDestroy {
  @Input()
  public isPageReadOnly = false;

  @Output()
  public onFilter = new EventEmitter<any>();

  public frm: FormGroup;
  public formErrors = {
    customerPoId: '',
    printDate: '',
    shipDateFromOnUtc: '',
    shipDateToOnUtc: ''
  };
  public validationMessages = {
    shipDateFromOnUtc: {
      maxLength: 'Must be earlier than Start Date End.'
    },
    shipDateToOnUtc: {
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
  public searchedObj;
  public isFilter;

  constructor(private _toastrService: ToastrService,
              private _commonService: CommonService,
              private _utilService: Util,
              private _fb: FormBuilder,
              private _validationService: ValidationService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _localStorageService: LocalStorageService,
              private _shippingMainService: ShippingMainService,
              private _progressService: ProgressService,
              public myDatePickerService: MyDatePickerService) {

  }

  public ngOnInit(): void {
    this.buildForm();
    this.getSearchFilterSv();
  }

  public buildForm(): void {
    let controlConfig = {
      customerPoId: new FormControl(''),
      printDate: new FormControl('Next 7 Days'),
      shipDateFrom: new FormControl(''),
      shipDateFromOnUtc: new FormControl('', [
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
          MaxDate('shipDateToOnUtc', 1)
        ])
      ]),
      shipDateTo: new FormControl(''),
      shipDateToOnUtc: new FormControl('', [
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
          MinDate('shipDateFromOnUtc', 1)
        ])
      ]),
      formRequires: new FormControl({
        customerPoId: {
          required: false
        },
        printDate: {
          required: false
        },
        shipDateFromOnUtc: {
          required: false
        },
        shipDateToOnUtc: {
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
      'shipDateFromOnUtc',
      'shipDateToOnUtc'
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
    patchDateFunc('shipDateFromOnUtc', 'shipDateFrom');
    patchDateFunc('shipDateToOnUtc', 'shipDateTo');
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
    if (this._shippingMainService.searchObj) {
      this.updateForm(this._shippingMainService.searchObj);
    } else {
      this._shippingMainService.searchObj = JSON.parse(JSON.stringify(this.frm.value));
      delete this._shippingMainService.searchObj.formRequires;
    }

    let data = this.frm.value;
    if (data['customerPoId'] ||
      data['printDate'] === 'Custom') {
      this.onFilter.emit(true);
    } else {
      this.onFilter.emit(false);
    }
    // set last tab
    this._shippingMainService.searchFrom = 'shipping';
  }

  public getFilterModel(): any {
    return this.frm.getRawValue();
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
      case 'shipDateFromOnUtc':
        this.dateEndOptions = {
          ...this.dateEndOptions,
          disableUntil: dateCurrentUntil,
          enableDays: [dateCurrentUntil]
        };
        break;
      case 'shipDateToOnUtc':
        this.dateBeginOptions = {
          ...this.dateBeginOptions,
          disableSince: dateCurrentSince,
          enableDays: [dateCurrentSince]
        };
        break;
      default:
        return;
    }
    this._changeDetectorRef.markForCheck();
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  /**
   * Fire filter event
   */
  public filter(): void {
    if (this.frm.invalid) {
      return;
    }

    // set search filter service
    let newSearchObj = {...this._shippingMainService.searchObj, ...this.frm.value};
    this._shippingMainService.searchObj = JSON.parse(JSON.stringify(newSearchObj));
    delete this._shippingMainService.searchObj.formRequires;

    this.searchedObj = {...this.frm.value};
    this.onFilter.emit(true);
  }

  public ngOnDestroy(): void {
    // this._utilService.globalSearch = '';
    // if (this.frm.valid) {
    //   this._localStorageService.set('PendingSamples_FilterModel',
    //     this.getFilterModel());
    // }
  }
}
