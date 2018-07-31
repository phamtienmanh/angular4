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
} from '../../../../shared/services/validation';
import {
  Util
} from '../../../../shared/services/util';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';
import {
  CommonService
} from '../../../../shared/services/common';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import * as _ from 'lodash';

// Validators
import {
  MinDate,
  MaxDate
} from '../../../../shared/validators';

// Interfaces
import {
  IMyDate,
  IMyDateModel
} from 'mydatepicker';
import {
  ResponseMessage,
  BasicCsrInfo
} from '../../../../shared/models';
import { FilerType } from './order-main-filter.model';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { ExtraValidators } from '../../../../shared/services/validation';
import { ColumnsType } from '../../order-main.model';
import { ItemTypes } from '../../../+sales-order/+order-styles/order-styles.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'order-main-filter',  // <forgot-password></forgot-password>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'order-main-filter.template.html',
  styleUrls: [
    'order-main-filter.style.scss'
  ]
})
export class OrderMainFilterComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public fontSize = '11px';
  @Input()
  public isHaveData = false;
  @Input()
  public isShowExportBulkPo = false;
  @Input()
  public canExportLayout = false;

  @Output()
  public onChangeFontSize = new EventEmitter<string>();
  @Output()
  public onExportOrder = new EventEmitter<any>();
  @Output()
  public onExportLayout = new EventEmitter<any>();
  @Output()
  public onExportBulkPo = new EventEmitter<any>();
  @Output()
  public onFilter = new EventEmitter<any>();
  @Output()
  public onUpdateFilter = new EventEmitter<any>();

  public frm: FormGroup;
  public formErrors = {
    csr: '',
    customer: '',
    poId: '',
    designName: '',
    colsName: '',
    fulfillmentType: '',
    partnerStyle: '',
    orderDateBegin: '',
    orderDateBeginOnUtc: '',
    orderDateEnd: '',
    orderDateEndOnUtc: '',
    startDateBegin: '',
    startDateBeginOnUtc: '',
    startDateEnd: '',
    startDateEndOnUtc: '',
    cancelDateBegin: '',
    cancelDateBeginOnUtc: '',
    cancelDateEnd: '',
    cancelDateEndOnUtc: '',
    shipDateBegin: '',
    shipDateBeginOnUtc: '',
    shipDateEnd: '',
    shipDateEndOnUtc: ''
  };
  public validationMessages = {
    orderDateBeginOnUtc: {
      maxLength: 'Must be earlier than End Date.'
    },
    orderDateEndOnUtc: {
      maxLength: 'Must be later than Start Date.'
    },
    startDateBeginOnUtc: {
      maxLength: 'Must be earlier than End Date .'
    },
    startDateEndOnUtc: {
      maxLength: 'Must be later than Start Date.'
    },
    cancelDateBeginOnUtc: {
      maxLength: 'Must be earlier than End Date .'
    },
    cancelDateEndOnUtc: {
      maxLength: 'Must be later than Start Date.'
    },
    shipDateBeginOnUtc: {
      maxLength: 'Must be later than End Date.'
    },
    shipDateEndOnUtc: {
      maxLength: 'Must be later than Start Date.'
    },
    default: {
      pattern: 'Date is not valid',
      required: 'This is required.'
    }
  };

  public myDateRangePickerOptions = {
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
  public orderDateBeginOptions: any = {
    ...this.myDateRangePickerOptions
  };
  public orderDateEndOptions: any = {
    ...this.myDateRangePickerOptions
  };
  public startDateBeginOptions: any = {
    ...this.myDateRangePickerOptions
  };
  public startDateEndOptions: any = {
    ...this.myDateRangePickerOptions
  };
  public cancelDateBeginOptions: any = {
    ...this.myDateRangePickerOptions
  };
  public cancelDateEndOptions: any = {
    ...this.myDateRangePickerOptions
  };
  public shipDateBeginOptions: any = {
    ...this.myDateRangePickerOptions
  };
  public shipDateEndOptions: any = {
    ...this.myDateRangePickerOptions
  };

  public csrsData: BasicCsrInfo[] = [];
  public fontSizeData = [
    '8px',
    '9px',
    '10px',
    '11px',
    '12px'
  ];

  public keyword = this._utilService.globalSearch;
  public subscription: Subscription;

  public listColumnName = _.sortBy(ColumnsType, 'name');
  public listColumnStatus = [];

  public itemTypeData = [
    {
      id: ItemTypes.DOMESTIC,
      name: 'Domestic'
    },
    {
      id: ItemTypes.OUTSOURCE,
      name: 'Outsource'
    },
    {
      id: ItemTypes.IMPORTS,
      name: 'Imports'
    },
    {
      id: ItemTypes.UNASSIGNED,
      name: 'Unassigned'
    }
  ];
  public orderTypeData = [
    {
      id: 1,
      name: 'In Fulfillment'
    },
    {
      id: 2,
      name: 'In DC'
    },
    {
      id: 3,
      name: 'Drop Ship'
    },
    {
      id: 4,
      name: 'In Store'
    }
  ];
  public colNameData = [];
  public searchedObj = {};

  constructor(private _toastrService: ToastrService,
              private _commonService: CommonService,
              private _utilService: Util,
              private _fb: FormBuilder,
              private _validationService: ValidationService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _localStorageService: LocalStorageService,
              public myDatePickerService: MyDatePickerService) {
    window.onbeforeunload = () => {
      this.ngOnDestroy();
    };
  }

  public ngOnInit(): void {
    this.buildForm();
    this.getCommonData();
    this.subscription = this._utilService.onGlobalSearchChange$.subscribe(
      () => {
        this.keyword = this._utilService.globalSearch;
        this.filter();
      });
    // Config filter
    let filterStore = this._localStorageService.get('OrderLog_FilterModel') as any;
    if (filterStore) {
      if (this.frm) {
        delete filterStore['formRequires'];
        this.frm.patchValue(filterStore);
        if (filterStore.colsName && filterStore.colsName.length) {
          this.setColsName(filterStore.colsName);
        } else {
          this.addColName();
        }
        this.setDateValue();
        this.listColumnNameFilter();
        this.searchedObj = {...this.frm.value};
        this.onUpdateFilter.emit({
          keyword: this.keyword,
          filter: this.getFilterParam(),
          status: this.getStatusFilter(),
          itemType: this.frm.get('itemType').value ? this.frm.get('itemType')
            .value
            .map((i) => i.id)
            .join(',') : ''
        });
        this._changeDetectorRef.markForCheck();
      }
    } else {
      this.addColName();
      this.listColumnNameFilter();
      this.searchedObj = {...this.frm.value};
      this.onUpdateFilter.emit({
        keyword: this.keyword,
        filter: this.getFilterParam(),
        status: this.getStatusFilter(),
        itemType: this.frm.get('itemType').value ? this.frm.get('itemType')
          .value
          .map((i) => i.id)
          .join(',') : ''
      });
    }
    // --------------
  }

  public ngOnChanges(changes: SimpleChanges): void {
    // empty
  }

  public buildForm(): void {
    let controlConfig = {
      csr: new FormControl(null),
      colsName: this._fb.array([]),
      customer: new FormControl(null),
      poId: new FormControl(''),
      designName: new FormControl(''),
      fulfillmentType: new FormControl(null),
      fulfillmentName: new FormControl(''),
      partnerStyle: new FormControl(''),
      itemType: new FormControl(null),
      isExcludeSmpl: new FormControl(false),
      orderDateBegin: new FormControl(''),
      orderDateBeginOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('orderDateEndOnUtc')
        ])
      ]),
      orderDateEnd: new FormControl(''),
      orderDateEndOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('orderDateBeginOnUtc')
        ])
      ]),
      startDateBegin: new FormControl(''),
      startDateBeginOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('startDateEndOnUtc')
        ])
      ]),
      startDateEnd: new FormControl(''),
      startDateEndOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('startDateBeginOnUtc')
        ])
      ]),
      cancelDateBegin: new FormControl(''),
      cancelDateBeginOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('cancelDateEndOnUtc')
        ])
      ]),
      cancelDateEnd: new FormControl(''),
      cancelDateEndOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('cancelDateBeginOnUtc')
        ])
      ]),
      shipDateBegin: new FormControl(''),
      shipDateBeginOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('shipDateEndOnUtc')
        ])
      ]),
      shipDateEnd: new FormControl(''),
      shipDateEndOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('shipDateBeginOnUtc')
        ])
      ]),
      formRequires: new FormControl({
        csr: {
          required: false
        },
        customer: {
          required: false
        },
        poId: {
          required: false
        },
        designName: {
          required: false
        },
        fulfillmentType: {
          required: false
        },
        partnerStyle: {
          required: false
        },
        itemType: {
          required: false
        },
        orderDateBeginOnUtc: {
          required: false
        },
        orderDateEndOnUtc: {
          required: false
        },
        startDateBeginOnUtc: {
          required: false
        },
        startDateEndOnUtc: {
          required: false
        },
        cancelDateBeginOnUtc: {
          required: false
        },
        cancelDateEndOnUtc: {
          required: false
        },
        shipDateBeginOnUtc: {
          required: false
        },
        shipDateEndOnUtc: {
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
      name: new FormControl(null),
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
    this.listColumnNameFilter();
  }

  public listColumnNameFilter() {
    let selectedIds = this.colsName.value.map((col) => col.id);
    this.colNameData = this.listColumnName.filter((s) => !selectedIds.includes(s.id));
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

  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    if (key === 'status') {
      let status = !!frm.get('id').value;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else {
      return false;
    }
  }

  public getFilterModel(): any {
    const model = this.frm.getRawValue();
    delete model['formRequires'];
    return model;
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): Promise<boolean> {
    const initStreamNum = 1;
    let streamThread = new Subject<boolean>();
    this._commonService.getAccountManagerList()
      .subscribe((resp: ResponseMessage<BasicCsrInfo[]>) => {
        if (resp.status) {
          this.csrsData = resp.data;
          streamThread.next(true);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
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

  public onChangeColName(e, frm): void {
    frm.get('status').patchValue([]);
    if (e) {
      frm.get('name').patchValue(e.name);
      this.listColumnStatus = e['listStatus'];
    }
  }

  public toStatusString(status: any[]) {
    return status.map((s) => s.name).join(', ');
  }

  public removeStatus(index: number) {
    this.colsName.removeAt(index);
    this.listColumnNameFilter();
  }

  /**
   * Active value to my date picker
   * @param {FormGroup} form
   */
  public setDateValue(): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (this.frm.get(importName).value) {
        const currentDate = new Date(this.frm.get(importName).value);
        this.configDateOptions(importName, currentDate);
      } else {
        this.configDateOptions(importName, null);
        this.frm.get(importName).patchValue(null);
        this.frm.get(exportName).patchValue(null);
      }
    };
    patchDateFunc('orderDateBeginOnUtc', 'orderDateBegin');
    patchDateFunc('orderDateEndOnUtc', 'orderDateEnd');
    patchDateFunc('startDateBeginOnUtc', 'startDateBegin');
    patchDateFunc('startDateEndOnUtc', 'startDateEnd');
    patchDateFunc('cancelDateBeginOnUtc', 'cancelDateBegin');
    patchDateFunc('cancelDateEndOnUtc', 'cancelDateEnd');
    patchDateFunc('shipDateBeginOnUtc', 'shipDateBegin');
    patchDateFunc('shipDateEndOnUtc', 'shipDateEnd');
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
        case 'orderDateBeginOnUtc':
          // Config for cancel date options
          this.orderDateEndOptions = {
            ...this.orderDateEndOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          this.orderDateBeginOptions = {
            ...this.orderDateBeginOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          if (this.frm) {
            this.frm.get('orderDateEndOnUtc').setValue(null);
            this.frm.get('orderDateEnd').setValue(null);
          }
          break;
        case 'orderDateEndOnUtc':
          // Config for start date options
          this.orderDateBeginOptions = {
            ...this.orderDateBeginOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          break;
        case 'startDateBeginOnUtc':
          // Config for cancel date options
          this.startDateEndOptions = {
            ...this.startDateEndOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          this.startDateBeginOptions = {
            ...this.startDateBeginOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          if (this.frm) {
            this.frm.get('startDateEndOnUtc').setValue(null);
            this.frm.get('startDateEnd').setValue(null);
          }
          break;
        case 'startDateEndOnUtc':
          // Config for start date options
          this.startDateBeginOptions = {
            ...this.startDateBeginOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          break;
        case 'cancelDateBeginOnUtc':
          // Config for cancel date options
          this.cancelDateEndOptions = {
            ...this.cancelDateEndOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          this.cancelDateBeginOptions = {
            ...this.cancelDateBeginOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          if (this.frm) {
            this.frm.get('cancelDateEnd').setValue(null);
            this.frm.get('cancelDateEndOnUtc').setValue(null);
          }
          break;
        case 'cancelDateEndOnUtc':
          // Config for start date options
          this.cancelDateBeginOptions = {
            ...this.cancelDateBeginOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          break;
        case 'shipDateBeginOnUtc':
          // Config for ship date options
          this.shipDateEndOptions = {
            ...this.shipDateEndOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          this.shipDateBeginOptions = {
            ...this.shipDateBeginOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          if (this.frm) {
            this.frm.get('shipDateEnd').setValue(null);
            this.frm.get('shipDateEndOnUtc').setValue(null);
          }
          break;
        case 'shipDateEndOnUtc':
          // Config for start date options
          this.shipDateBeginOptions = {
            ...this.shipDateBeginOptions,
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
      case 'orderDateBeginOnUtc':
        // Config for end date options
        this.orderDateEndOptions = {
          ...this.orderDateEndOptions,
          disableUntil: dateCurrentUntil,
          enableDays: []
        };
        break;
      case 'orderDateEndOnUtc':
        // Config for start date options
        this.orderDateBeginOptions = {
          ...this.orderDateBeginOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        break;
      case 'startDateBeginOnUtc':
        // Config for end date options
        this.startDateEndOptions = {
          ...this.startDateEndOptions,
          disableUntil: dateCurrentUntil,
          enableDays: []
        };
        break;
      case 'startDateEndOnUtc':
        // Config for start date options
        this.startDateBeginOptions = {
          ...this.startDateBeginOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        break;
      case 'cancelDateBeginOnUtc':
        // Config for end date options
        this.cancelDateEndOptions = {
          ...this.cancelDateEndOptions,
          disableUntil: dateCurrentUntil,
          enableDays: []
        };
        break;
      case 'cancelDateEndOnUtc':
        // Config for start date options
        this.cancelDateBeginOptions = {
          ...this.cancelDateBeginOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        break;
      case 'shipDateBeginOnUtc':
        // Config for end date options
        this.shipDateEndOptions = {
          ...this.shipDateEndOptions,
          disableUntil: dateCurrentUntil,
          enableDays: []
        };
        break;
      case 'shipDateEndOnUtc':
        // Config for start date options
        this.shipDateBeginOptions = {
          ...this.shipDateBeginOptions,
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
        filterType: FilerType.Csr.toString(),
        value: this.frm.get('csr').value || ''
      },
      {
        filterType: FilerType.PoId.toString(),
        value: this.frm.get('poId').value || ''
      },
      {
        filterType: FilerType.FulfillmentType.toString(),
        value: this.frm.get('fulfillmentType').value || ''
      },
      {
        filterType: FilerType.Customer.toString(),
        value: this.frm.get('customer').value || ''
      },
      {
        filterType: FilerType.DesignName.toString(),
        value: this.frm.get('designName').value || ''
      },
      {
        filterType: FilerType.PartnerStyle.toString(),
        value: this.frm.get('partnerStyle').value || ''
      },
      {
        filterType: FilerType.ExcludeSmpl.toString(),
        value: this.frm.get('isExcludeSmpl').value.toString()
      },
      {
        filterType: FilerType.ItemType.toString(),
        value: this.frm.get('itemType').value ? this.frm.get('itemType')
          .value
          .map((i) => i.id)
          .join(',') : ''
      }
    ];
    let dateFilter = [
      {
        type: FilerType.OrderDateFrom,
        prop: 'orderDateBeginOnUtc'
      },
      {
        type: FilerType.OrderDateTo,
        prop: 'orderDateEndOnUtc'
      },
      {
        type: FilerType.StartDateFrom,
        prop: 'startDateBeginOnUtc'
      },
      {
        type: FilerType.StartDateTo,
        prop: 'startDateEndOnUtc'
      },
      {
        type: FilerType.CancelDateFrom,
        prop: 'cancelDateBeginOnUtc'
      },
      {
        type: FilerType.CancelDateTo,
        prop: 'cancelDateEndOnUtc'
      },
      {
        type: FilerType.ShipDateFrom,
        prop: 'shipDateBeginOnUtc'
      },
      {
        type: FilerType.ShipDateTo,
        prop: 'shipDateEndOnUtc'
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

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
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
   * Export selected orders
   */
  public exportOrder(type: string): void {
    this.onExportOrder.emit({
      type,
      keyword: this.keyword,
      filter: this.getFilterParam(),
      status: this.getStatusFilter()
    });
  }

  /**
   * Export selected orders
   */
  public exportLayout(type: string): void {
    this.onExportLayout.emit({
      type,
      keyword: this.keyword,
      filter: this.getFilterParam(),
      status: this.getStatusFilter()
    });
  }

  /**
   * Export Bulk Po
   * @param {string} type
   */
  public exportBulkPo(type: string): void {
    this.onExportBulkPo.emit({
      type,
      keyword: this.keyword,
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

  public onKeyup(event): void {
    let e = <KeyboardEvent> event;
    if (e.keyCode === 13 && e.key === 'Enter') {
      this.filter();
    }
  }

  /**
   * Fire filter event
   */
  public filter(): void {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
      return;
    }
    this._localStorageService.set('OrderLog_FilterModel',
      this.getFilterModel());
    this.onFilter.emit({
      keyword: this.keyword,
      filter: this.getFilterParam(),
      status: this.getStatusFilter(),
      itemType: this.frm.get('itemType').value ? this.frm.get('itemType')
        .value
        .map((i) => i.id)
        .join(',') : ''
    });
    this.searchedObj = {...this.frm.value};
  }

  public ngOnDestroy(): void {
    // this._utilService.globalSearch = '';
    this.subscription.unsubscribe();
    const lastColsName = this.colsName.value[this.colsName.length - 1];
    if (lastColsName.id !== null) {
      if (!lastColsName.status.length) {
        this.removeStatus(this.colsName.length - 1);
      }
      this.addColName();
    }
    if (this.frm.valid) {
      this._localStorageService.set('OrderLog_FilterModel',
        this.getFilterModel());
    }
  }
}
