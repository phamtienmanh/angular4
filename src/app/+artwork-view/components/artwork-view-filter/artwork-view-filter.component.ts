import {
  Component,
  ViewEncapsulation,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import {
  Validators,
  FormGroup,
  FormControl
} from '@angular/forms';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  ValidationService
} from '../../../shared/services/validation';
import {
  Util
} from '../../../shared/services/util';
import {
  MyDatePickerService
} from '../../../shared/services/my-date-picker';
import {
  CommonService
} from '../../../shared/services/common';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  ArtworkViewService
} from '../../artwork-view.service';
import {
  MaxDate,
  MinDate
} from '../../../shared/validators';

// Interfaces
import {
  IMyDate,
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import { FilerType } from './artwork-view-filter.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'artwork-view-filter',  // <forgot-password></forgot-password>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'artwork-view-filter.template.html',
  styleUrls: [
    'artwork-view-filter.style.scss'
  ]
})
export class ArtworkViewFilterComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public isPageReadOnly = false;
  @Input()
  public fontSize = '11px';

  @Output()
  public onChangeFontSize = new EventEmitter<string>();
  @Output()
  public onExportOrder = new EventEmitter<any>();
  @Output()
  public onFilter = new EventEmitter<any>();
  @Output()
  public onUpdateFilter = new EventEmitter<any>();

  public frm: FormGroup;
  public formErrors = {
    customerPo: '',
    retailerPO: '',
    customer: '',
    styleName: '',
    designId: '',
    printMethod: '',
    approvedDateFromOnUtc: '',
    approvedDateToOnUtc: ''
  };
  public validationMessages = {
    approvedDateFromOnUtc: {
      maxLength: 'Must be earlier than End Date.'
    },
    approvedDateToOnUtc: {
      maxLength: 'Must be later than Start Date.'
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
  public approvedDateFromOptions: any = {
    ...this.myDatePickerOptions
  };
  public approvedDateToOptions: any = {
    ...this.myDatePickerOptions
  };

  public fontSizeData = ['8px', '9px', '10px', '11px', '12px'];
  public searchedObj = {};

  constructor(private _toastrService: ToastrService,
              private _commonService: CommonService,
              private _utilService: Util,
              private _validationService: ValidationService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _localStorageService: LocalStorageService,
              private _artworkViewService: ArtworkViewService,
              public myDatePickerService: MyDatePickerService) {

  }

  public ngOnInit(): void {
    this.buildForm();
    // this.getCommonData();
    // Config filter
    let filterStore = this._localStorageService.get('ArtworkView_FilterModel');
    if (filterStore) {
      if (this.frm) {
        this.frm.patchValue(filterStore);
        this.setDateValue();
        this.searchedObj = {...this.frm.value};
        this.onUpdateFilter.next({
          filter: this.getFilterParam()
        });
        this._changeDetectorRef.markForCheck();
      }
    } else {
      this.onUpdateFilter.next({
        filter: this.getFilterParam()
      });
    }
    // --------------
  }

  public ngOnChanges(changes: SimpleChanges): void {
    // empty
  }

  public buildForm(): void {
    let controlConfig = {
      customerPo: new FormControl(''),
      retailerPO: new FormControl(''),
      customer: new FormControl(''),
      styleName: new FormControl(''),
      designId: new FormControl(''),
      printMethod: new FormControl(''),
      approvedDateFrom: new FormControl(''),
      approvedDateFromOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
          MaxDate('approvedDateToOnUtc')
        ])
      ]),
      approvedDateTo: new FormControl(''),
      approvedDateToOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
          MinDate('approvedDateFromOnUtc')
        ])
      ]),
      formRequires: new FormControl({
        customerPo: {
          required: false
        },
        retailerPO: {
          required: false
        },
        customer: {
          required: false
        },
        styleName: {
          required: false
        },
        designId: {
          required: false
        },
        printMethod: {
          required: false
        },
        approvedDateFromOnUtc: {
          required: false
        },
        approvedDateToOnUtc: {
          required: false
        }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);

    this.onValueChanged(); // (re)set validation messages now
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
   * Active value to my date picker
   * @param {FormGroup} form
   */
  public setDateValue(): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (this.frm.get(importName).value) {
        const currentDate = new Date(this.frm.get(importName).value);
        currentDate.setHours(0, 0, 0);
        this.frm.get(exportName).setValue({
          date: {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            day: currentDate.getDate()
          },
          jsdate: currentDate
        });
        this.configDateOptions(importName, currentDate);
      } else {
        this.configDateOptions(importName, null);
        this.frm.get(importName).patchValue(null);
        this.frm.get(exportName).patchValue(null);
      }
    };
    patchDateFunc('approvedDateFromOnUtc', 'approvedDateFrom');
    patchDateFunc('approvedDateToOnUtc', 'approvedDateTo');
  }

  public configDateOptions(prop: string, utcDate: Date): void {
    if (!utcDate) {
      switch (prop) {
        case 'approvedDateFromOnUtc':
          // Config for cancel date options
          this.approvedDateToOptions = {
            ...this.approvedDateToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          this.approvedDateFromOptions = {
            ...this.approvedDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          if (this.frm) {
            this.frm.get('approvedDateToOnUtc').setValue(null);
            this.frm.get('approvedDateTo').setValue(null);
          }
          break;
        case 'approvedDateToOnUtc':
          // Config for start date options
          this.approvedDateFromOptions = {
            ...this.approvedDateFromOptions,
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
      case 'approvedDateFromOnUtc':
        // Config for end date options
        this.approvedDateToOptions = {
          ...this.approvedDateToOptions,
          disableUntil: dateCurrentUntil,
          enableDays: []
        };
        break;
      case 'approvedDateToOnUtc':
        // Config for start date options
        this.approvedDateFromOptions = {
          ...this.approvedDateFromOptions,
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

  /**
   * Get filter value
   * @returns {string}
   */
  public getFilterParam(): string {
    let filterParam = [
      {
        filterType: FilerType.CustomerPO.toString(),
        value: this.frm.get('customerPo').value || ''
      },
      {
        filterType: FilerType.RetailerPO.toString(),
        value: this.frm.get('retailerPO').value || ''
      },
      {
        filterType: FilerType.Customer.toString(),
        value: this.frm.get('customer').value || ''
      },
      {
        filterType: FilerType.StyleName.toString(),
        value: this.frm.get('styleName').value || ''
      },
      {
        filterType: FilerType.DesignId.toString(),
        value: this.frm.get('designId').value || ''
      },
      {
        filterType: FilerType.PrintMethod.toString(),
        value: this.frm.get('printMethod').value || ''
      }
    ];
    let dateFilter = [
      {
        type: FilerType.ApprovedDateFrom,
        prop: 'approvedDateFromOnUtc'
      },
      {
        type: FilerType.ApprovedDateTo,
        prop: 'approvedDateToOnUtc'
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
      filter: this.getFilterParam()
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
    this._localStorageService.set('ArtworkView_FilterModel',
      this.getFilterModel());

    // set search filter service
    this.onFilter.emit({
      filter: this.getFilterParam()
    });
    this.searchedObj = {
      ...this.frm.value
    };
  }

  public ngOnDestroy(): void {
    // this._utilService.globalSearch = '';
    if (this.frm.valid) {
      this._localStorageService.set('ArtworkView_FilterModel',
        this.getFilterModel());
    }
  }
}
