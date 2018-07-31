import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

import {
  IMyDate,
  IMyDateModel
} from 'mydatepicker';

import {
  ProductionDueV2Service
} from './production-due-v2.service';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  CommonService
} from '../../../../shared/services/common';
import {
  ValidationService
} from '../../../../shared/services/validation';

// Validators
import {
  MaxDate,
  MaxDateToday,
  MinDate
} from '../../../../shared/validators';

// Interfaces
import {
  Status,
  TaskStatus
} from '../../outsource-main.model';
import {
  BasicGeneralInfo,
  BasicVendorInfo,
  ResponseMessage
} from '../../../../shared/models';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';
import {
  ExtraValidators
} from '../../../../shared/services/validation';
import { LeadEtaComponent } from '../+shared';
import { TypePrintSchedule } from '../../../+order-main/modules/columns.model';
import { ScheduleColType } from '../../../order-log.model';

@Component({
  selector: 'production-due-v2',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'production-due-v2.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: [
    'production-due-v2.style.scss'
  ]
})
export class ProductionDueV2Component implements OnInit {
  @Input()
  public orderId;
  @Input()
  public orderDetailId;
  @Input()
  public isPageReadOnly = false;
  @Input()
  public isLeadTimeReadOnly = false;
  @Input()
  public rowDetail;
  @Input()
  public type = 'outsource';

  @ViewChild(LeadEtaComponent)
  public leadEtaComponent: LeadEtaComponent;

  public statusData;

  public frm: FormGroup;
  public formErrors = {
    productionDueVendorId: '',
    productionDueDateDoneFromOnUtc: '',
    productionDueDateDoneToOnUtc: '',
    productionDueDateScheduledOnUtc: ''
  };
  public validationMessages = {
    productionDueVendorId: {
      required: 'Vendor is required.'
    },
    productionDueDateDoneFromOnUtc: {
      required: 'Neck Label Date is required.',
      maxLength: 'Must be earlier than End Date.'
    },
    productionDueDateDoneToOnUtc: {
      required: 'Neck Label Date is required.',
      maxLength: 'Must be later than Start Date.'
    },
    productionDueDateScheduledOnUtc: {
      required: 'Neck Label Date is required.'
    },
    default: {
      required: 'This is required.',
      maxLength: 'Date must be today’s date or earlier'
    }
  };
  public myDatePickerOptions = {
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
    // disableSince: {
    //   year: new Date().getFullYear(),
    //   month: new Date().getMonth() + 1,
    //   day: new Date().getDate() + 1
    // }
  };
  public myTodayPickerOptions = {
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
    sunHighlight: false,
    disableSince: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 1
    }
  };
  public productionDueDateScheduledOptions = {...this.myDatePickerOptions};
  public productionDueDateDoneFromOptions = {...this.myDatePickerOptions};
  public productionDueDateDoneToOptions = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public taskStatus = TaskStatus;
  public vendorData: any[] = [];
  private _storedData;

  constructor(public activeModal: NgbActiveModal,
              private _fb: FormBuilder,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _productionDueV2Service: ProductionDueV2Service,
              private _changeDetectorRef: ChangeDetectorRef,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    this.statusData = Status.filter((stt) => [
      TaskStatus.BLANK,
      TaskStatus.SCHEDULED,
      TaskStatus.DONE
    ].indexOf(stt.id) > -1);
    this.buildForm();
    this.getCommonData();
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public buildForm(): void {
    this.frm = this._fb.group({
      productionDues: this._fb.array([])
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  public get productionDues(): FormArray {
    return this.frm.get('productionDues') as FormArray;
  };

  public setProductions(productionDues: any[]) {
    const productFGs = productionDues.map((neckLabel: any) => this._validationService.buildForm({
      id: new FormControl(neckLabel.id),
      productionDueStatus: new FormControl(neckLabel.productionDueStatus, [Validators.required]),
      productionDueVendorId: new FormControl(neckLabel.productionDueVendorId, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      productionDueVendorName: new FormControl(neckLabel.productionDueVendorName),
      productionDueDateDoneFrom: new FormControl(''),
      productionDueDateDoneFromOnUtc: new FormControl(neckLabel.productionDueDateDoneFromOnUtc, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'productionDueDateDoneFromOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('productionDueDateDoneToOnUtc'),
          MaxDateToday
        ])
      ]),
      productionDueDateDoneFromOptions: new FormControl(this.productionDueDateDoneFromOptions),
      productionDueDateDoneTo: new FormControl(''),
      productionDueDateDoneToOnUtc: new FormControl(neckLabel.productionDueDateDoneToOnUtc, [
        Validators.compose([
          // ExtraValidators.conditional(
          //   (group) => this.getSpecialRequireCase(group, 'productionDueDateDoneToOnUtc'),
          //   Validators.compose([
          //     Validators.required
          //   ])
          // ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('productionDueDateDoneFromOnUtc'),
          MaxDateToday
        ])
      ]),
      productionDueDateDoneToOptions: new FormControl(this.productionDueDateDoneToOptions),
      productionDueDateScheduled: new FormControl(''),
      productionDueDateScheduledOnUtc: new FormControl(neckLabel.productionDueDateScheduledOnUtc, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'productionDueDateScheduledOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      productionDueDateScheduledOptions: new FormControl(this.productionDueDateScheduledOptions),
      previousProductionDueDateScheduledOnUtc:
        new FormControl(neckLabel.productionDueDateScheduledOnUtc),
      formRequires: new FormControl({
        productionDueStatus: {
          required: true
        },
        productionDueVendorId: {
          required: true
        },
        productionDueDateDoneFromOnUtc: {
          required: false
        },
        productionDueDateDoneToOnUtc: {
          required: false
        },
        productionDueDateScheduledOnUtc: {
          required: false
        }
      })
    }, this.formErrors, this.validationMessages));
    const contactFormArray = this._fb.array(productFGs);
    this.frm.setControl('productionDues', contactFormArray);
  }

  public addNeckLabel() {
    this.productionDues.push(this._validationService.buildForm({
      id: new FormControl(''),
      productionDueStatus: new FormControl(null, [Validators.required]),
      // neckLabelId: new FormControl(this.neckLabelId),
      productionDueVendorId: new FormControl(null, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      productionDueVendorName: new FormControl(''),
      productionDueDateDoneFrom: new FormControl(''),
      productionDueDateDoneFromOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'productionDueDateDoneFromOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('productionDueDateDoneToOnUtc'),
          MaxDateToday
        ])
      ]),
      productionDueDateDoneFromOptions: new FormControl(this.productionDueDateDoneFromOptions),
      productionDueDateDoneTo: new FormControl(''),
      productionDueDateDoneToOnUtc: new FormControl('', [
        Validators.compose([
          // ExtraValidators.conditional(
          //   (group) => this.getSpecialRequireCase(group, 'productionDueDateDoneToOnUtc'),
          //   Validators.compose([
          //     Validators.required
          //   ])
          // ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('productionDueDateDoneFromOnUtc'),
          MaxDateToday
        ])
      ]),
      productionDueDateDoneToOptions: new FormControl(this.productionDueDateDoneToOptions),
      productionDueDateScheduled: new FormControl(''),
      productionDueDateScheduledOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'productionDueDateScheduledOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      productionDueDateScheduledOptions: new FormControl(this.productionDueDateScheduledOptions),
      previousProductionDueDateScheduledOnUtc: new FormControl(''),
      formRequires: new FormControl({
        productionDueStatus: {
          required: true
        },
        productionDueVendorId: {
          required: true
        },
        productionDueDateDoneFromOnUtc: {
          required: false
        },
        productionDueDateDoneToOnUtc: {
          required: false
        },
        productionDueDateScheduledOnUtc: {
          required: false
        }
      })
    }, this.formErrors, this.validationMessages));
  }

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    let firstCaseList = [
      'productionDueStatus'
    ];
    if (key === 'firstCase') {
      let status = false;
      firstCaseList.forEach((cas) => status = status
        || +frm.get(cas).value > 2);
      firstCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else if (key === 'productionDueDateScheduledOnUtc') {
      let status = +frm.get('productionDueStatus').value === this.taskStatus.SCHEDULED;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'productionDueDateDoneFromOnUtc'
      || key === 'productionDueDateDoneToOnUtc') {
      let status = +frm.get('productionDueStatus').value === this.taskStatus.DONE;
      frm.get('formRequires').value[key].required = status;
      return status;
    }
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

  public setDateValue(frm: any): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (frm.get(importName).value) {
        const utcDate = new Date(frm.get(importName).value);
        let currentDate = new Date(Date.UTC(utcDate.getFullYear(),
          utcDate.getMonth(), utcDate.getDate(), utcDate.getHours(), utcDate.getMinutes()));
        this.configDateOptions(frm, importName, currentDate);
        frm.get(exportName).setValue({
          date: {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            day: currentDate.getDate()
          }
        });
      } else {
        frm.get(importName).patchValue(null);
        frm.get(exportName).patchValue(null);
        this.configDateOptions(frm, importName, null);
      }
    };
    patchDateFunc('productionDueDateDoneFromOnUtc', 'productionDueDateDoneFrom');
    patchDateFunc('productionDueDateDoneToOnUtc', 'productionDueDateDoneTo');
    patchDateFunc('productionDueDateScheduledOnUtc', 'productionDueDateScheduled');
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getMachineNVendor('NeckLabel')
      .subscribe((resp: ResponseMessage<any[]>) => {
        if (resp.status) {
          this.vendorData = resp.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._productionDueV2Service.getDataColumn(this.orderId, this.orderDetailId, this.type)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.setProductions([resp.data]);
          for (let product of this.productionDues.controls) {
            this.setDateValue(product);
          }
          this._storedData = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._changeDetectorRef.markForCheck();
  }

  public onSelectItem(val, frm, valProp: string, formControlName: string): void {
    if (val[valProp]) {
      frm.get(formControlName).patchValue(val[valProp]);
    } else {
      // add new
      frm.get(formControlName).patchValue(val);
    }
  }

  /**
   * Fire date change event
   * @param event
   */
  public onDateChangedBy(event: IMyDateModel, frm: any, prop: string): void {
    let utcDate = Object.assign({}, event);
    frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');
    if (prop === 'productionDueDateScheduledOnUtc') {
      frm.get('previousProductionDueDateScheduledOnUtc')
        .setValue(utcDate.jsdate ? utcDate.formatted : '');
    }
    this.configDateOptions(frm, prop, utcDate.jsdate);
    // Update status for form control whose value changed
    frm.get(prop).markAsDirty();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Convert Date to IMyDate & Reconfig date options
   * @param prop
   * @param utcDate
   * @param i
   */
  public configDateOptions(frm: any, prop: string, utcDate: Date): void {
    const currentDate = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 1
    };

    if (!utcDate) {
      switch (prop) {
        case 'productionDueDateDoneFromOnUtc':
          // Config for cancel date options
          const productionDueDateDoneToOptions = {
            ...this.productionDueDateDoneToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            enableDays: [],
            disableSince: currentDate,
            componentDisabled: true
          };
          const productionDueDateDoneFromOptions = {
            ...this.productionDueDateDoneFromOptions,
            enableDays: [],
            disableSince: currentDate
          };
          if (frm) {
            frm.get('productionDueDateDoneToOnUtc').setValue(null);
            frm.get('productionDueDateDoneTo').setValue(null);
          }
          frm.get('productionDueDateDoneToOptions').setValue(productionDueDateDoneToOptions);
          frm.get('productionDueDateDoneFromOptions').setValue(productionDueDateDoneFromOptions);
          break;
        case 'productionDueDateDoneToOnUtc':
          // Config for start date options
          const productionDueDateDoneFromOptions2 = {
            ...this.productionDueDateDoneFromOptions,
            disableSince: currentDate
          };
          frm.get('productionDueDateDoneFromOptions').setValue(productionDueDateDoneFromOptions2);
          break;
        default:
          break;
      }
      this._changeDetectorRef.markForCheck();
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
      case 'productionDueDateDoneFromOnUtc':
        // Config for end date options
        const productionDueDateDoneToOptions = {
          ...this.productionDueDateDoneToOptions,
          disableUntil: this.getMaxDate(currentDate, dateCurrentUntil),
          disableSince: currentDate,
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentUntil), currentDate)
            //   ? '' : dateCurrentUntil
          ],
          componentDisabled: false
        };
        frm.get('productionDueDateDoneToOptions').setValue(productionDueDateDoneToOptions);
        break;
      case 'productionDueDateDoneToOnUtc':
        // Config for start date options
        const productionDueDateDoneFromOptions = {
          ...this.productionDueDateDoneFromOptions,
          disableSince: this.getMaxDate(currentDate, dateCurrentSince),
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentSince), currentDate)
            //   ? '' : dateCurrentSince
          ]
        };
        frm.get('productionDueDateDoneFromOptions').setValue(productionDueDateDoneFromOptions);
        break;
      default:
        break;
    }
    this._changeDetectorRef.markForCheck();
  }

  public getMaxDate(currentDate: IMyDate, dateCompare: IMyDate): IMyDate {
    const timeCurrent = new Date(`${currentDate.month}/${currentDate.day}/${currentDate.year}`)
      .getTime();
    const timeDate = new Date(`${dateCompare.month}/${dateCompare.day}/${dateCompare.year}`)
      .getTime();
    return timeDate >= timeCurrent ? currentDate : dateCompare;
  }

  public checkFormValid(): boolean {
    let isValid = true;
    const checkValidControlFunc = (frm: FormGroup, list: string[]): boolean => {
      let isControlValue = true;
      list.forEach((i) => isControlValue = isControlValue
        && (frm.get(i).valid || frm.get(i).disabled));
      return isControlValue;
    };
    if (this.productionDues.value.findIndex((i) => !i.productionDueStatus) > -1) {
      return false;
    }
    this.productionDues.controls.forEach((product: any) => {
      switch (+product.get('productionDueStatus').value) {
        case this.taskStatus.BLANK:
          break;
        case this.taskStatus.SCHEDULED:
          isValid = isValid && checkValidControlFunc(product, [
            'productionDueVendorId',
            'productionDueDateScheduledOnUtc'
          ]);
          break;
        case this.taskStatus.DONE:
          isValid = isValid && checkValidControlFunc(product, [
            'productionDueVendorId',
            'productionDueDateDoneFromOnUtc',
            'productionDueDateDoneToOnUtc'
          ]);
          product.get('productionDueDateScheduledOnUtc')
            .patchValue(product.get('previousProductionDueDateScheduledOnUtc').value);
          break;
        default:
          break;
      }
    });
    return isValid;
  }

  public formClick(e: MouseEvent) {
    if (e.toElement &&
      e.toElement.tagName !== 'BUTTON' &&
      !e.toElement.classList.contains('form-control') &&
      !e.toElement.classList.contains('icon-mydpcalendar') &&
      !e.toElement.classList.contains('selection')) {

      let eventClick = new Event('click');
      document.dispatchEvent(eventClick);
    }
  }

  public onSubmitForm(): void {
    if (this.checkFormValid() && this.leadEtaComponent.checkFormValid()) {
      this.productionDues.controls.forEach((product: FormGroup) => {
        let listDate = [];
        if (+product.get('productionDueStatus').value === this.taskStatus.SCHEDULED) {
          listDate = [];
        } else if (+product.get('productionDueStatus').value === this.taskStatus.DONE) {
          listDate = [
            'productionDueDateDoneFromOnUtc',
            'productionDueDateDoneToOnUtc'
          ];
        }
        this.myDatePickerService.addTimeToDateArray(product, listDate);
      });
      const frmModel = this.frm.value;
      frmModel.productionDues.forEach((i) => {
        delete i['formRequires'];
      });
      const modal = Object.assign({
        columnId: this.rowDetail.columnId,
        ...this._storedData,
        ...this.leadEtaComponent.getFormValue()
      }, frmModel.productionDues[0]);
      this._productionDueV2Service
        .changeStatusColumn(this.orderId, this.orderDetailId, this.type, modal)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this.activeModal.close(resp);
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }
}
