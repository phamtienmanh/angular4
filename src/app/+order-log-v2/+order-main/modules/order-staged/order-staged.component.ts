import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
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

// Services
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../shared/services/common';
import { ValidationService } from '../../../../shared/services/validation';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';
import { ExtraValidators } from '../../../../shared/services/validation';

// Validators
import {
  MinDate,
  MaxDate,
  MaxDateToday
} from '../../../../shared/validators';

// Interfaces
import {
  Status,
  TaskStatus
} from '../../order-main.model';

@Component({
  selector: 'order-staged',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'order-staged.template.html',
  styleUrls: [
    // 'order-staged.styles.scss'
  ]
})
export class OrderStagedComponent implements OnInit {
  @Input()
  public title = '';
  @Input()
  public orderId;
  @Input()
  public rowDetail;

  public statusData = Status.filter((stt) => stt.name === 'Partial' || stt.name === 'Done');

  public frm: FormGroup;
  public formErrors = {
    orderStagedDoneFromOnUtc: '',
    orderStagedDoneToOnUtc: '',
    orderStagedPartialFromOnUtc: '',
    orderStagedPartialToOnUtc: ''
  };
  public validationMessages = {
    orderStagedDoneFromOnUtc: {
      required: 'Order Staged Date is required.',
      maxLength: 'Must be earlier than End Date.'
    },
    orderStagedDoneToOnUtc: {
      required: 'Order Staged Date is required.',
      maxLength: 'Must be later than Start Date.'
    },
    orderStagedPartialFromOnUtc: {
      required: 'Order Staged Date is required.',
      maxLength: 'Must be earlier than End Date.'
    },
    orderStagedPartialToOnUtc: {
      required: 'Order Staged Date is required.',
      maxLength: 'Must be later than Start Date.'
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
    sunHighlight: false,
    disableSince: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 1
    }
  };
  public orderStagedDoneFromOptions: any = {...this.myDatePickerOptions};
  public orderStagedDoneToOptions: any = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public orderStagedPartialFromOptions: any = {...this.myDatePickerOptions};
  public orderStagedPartialToOptions: any = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public taskStatus = TaskStatus;

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    this.buildForm();
    this.getCommonData();
    this.updateForm(this.rowDetail);
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public buildForm(): void {
    let controlConfig = {
      status: new FormControl(null),
      orderStagedPartialFrom: new FormControl(''),
      orderStagedPartialFromOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'orderStagedPartialFromOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('orderStagedPartialToOnUtc'),
          MaxDateToday
        ])
      ]),
      orderStagedPartialTo: new FormControl(''),
      orderStagedPartialToOnUtc: new FormControl('', [
        Validators.compose([
          // ExtraValidators.conditional(
          //   (group) => this.getSpecialRequireCase(group, 'orderStagedPartialToOnUtc'),
          //   Validators.compose([
          //     Validators.required
          //   ])
          // ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('orderStagedPartialFromOnUtc'),
          MaxDateToday
        ])
      ]),
      orderStagedDoneFrom: new FormControl(''),
      orderStagedDoneFromOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'orderStagedDoneFromOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('orderStagedDoneToOnUtc'),
          MaxDateToday
        ])
      ]),
      orderStagedDoneTo: new FormControl(''),
      orderStagedDoneToOnUtc: new FormControl('', [
        Validators.compose([
          // ExtraValidators.conditional(
          //   (group) => this.getSpecialRequireCase(group, 'orderStagedDoneToOnUtc'),
          //   Validators.compose([
          //     Validators.required
          //   ])
          // ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('orderStagedDoneFromOnUtc'),
          MaxDateToday
        ])
      ]),
      formRequires: new FormControl({
        status: {
          required: false
        },
        orderStagedDoneFromOnUtc: {
          required: false
        },
        orderStagedDoneToOnUtc: {
          required: false
        },
        orderStagedPartialFromOnUtc: {
          required: false
        },
        orderStagedPartialToOnUtc: {
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

  public setDateValue(): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (this.frm.get(importName).value) {
        const utcDate = new Date(this.frm.get(importName).value);
        let currentDate = new Date(Date.UTC(utcDate.getFullYear(),
          utcDate.getMonth(), utcDate.getDate(), utcDate.getHours(), utcDate.getMinutes()));
        this.configDateOptions(importName, currentDate);
        this.frm.get(exportName).setValue({
          date: {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            day: currentDate.getDate()
          }
        });
      } else {
        this.frm.get(importName).patchValue(null);
        this.frm.get(exportName).patchValue(null);
        this.configDateOptions(importName, null);
      }
    };
    patchDateFunc('orderStagedDoneFromOnUtc', 'orderStagedDoneFrom');
    patchDateFunc('orderStagedDoneToOnUtc', 'orderStagedDoneTo');
    patchDateFunc('orderStagedPartialFromOnUtc', 'orderStagedPartialFrom');
    patchDateFunc('orderStagedPartialToOnUtc', 'orderStagedPartialTo');
  }

  public updateForm(data: any): void {
    if (data) {
      this.frm.patchValue(data);
      this.setDateValue();
    }
  }

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    if (key === 'orderStagedDoneFromOnUtc' || key === 'orderStagedDoneToOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.DONE;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'orderStagedPartialFromOnUtc' || key === 'orderStagedPartialToOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.PARTIAL;
      frm.get('formRequires').value[key].required = status;
      return status;
    }
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    // this._commonService.getServiceCode()
    //   .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
    //     if (resp.status) {
    //       this.printMethodData = resp.data;
    //     } else {
    //       this._toastrService.error(resp.errorMessages, 'Error');
    //     }
    //   });
  }

  /**
   * Fire date change event
   * @param event
   */
  public onDateChangedBy(event: IMyDateModel, prop: string): void {
    let utcDate = Object.assign({}, event);
    // if (utcDate.jsdate) {
    // utcDate.jsdate.setHours(utcDate.jsdate.getHours() - utcDate.jsdate.getTimezoneOffset() / 60);
    // }
    this.frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');
    this.configDateOptions(prop, utcDate.jsdate);
    // Update status for form control whose value changed
    this.frm.get(prop).markAsDirty();
  }

  /**
   * Convert Date to IMyDate & Reconfig date options
   * @param prop
   * @param utcDate
   * @param i
   */
  public configDateOptions(prop: string, utcDate: Date): void {
    const currentDate = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 1
    };

    if (!utcDate) {
      switch (prop) {
        case 'orderStagedDoneFromOnUtc':
          // Config for cancel date options
          this.orderStagedDoneToOptions = {
            ...this.orderStagedDoneToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            disableSince: currentDate,
            componentDisabled: true
          };
          this.orderStagedDoneFromOptions = {
            ...this.orderStagedDoneFromOptions,
            disableSince: currentDate
          };
          if (this.frm) {
            this.frm.get('orderStagedDoneToOnUtc').setValue(null);
            this.frm.get('orderStagedDoneTo').setValue(null);
          }
          break;
        case 'orderStagedDoneToOnUtc':
          // Config for start date options
          this.orderStagedDoneFromOptions = {
            ...this.orderStagedDoneFromOptions,
            disableSince: currentDate
          };
          break;
        case 'orderStagedPartialFromOnUtc':
          // Config for cancel date options
          this.orderStagedPartialToOptions = {
            ...this.orderStagedPartialToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            disableSince: currentDate,
            componentDisabled: true
          };
          this.orderStagedPartialFromOptions = {
            ...this.orderStagedPartialFromOptions,
            disableSince: currentDate
          };
          if (this.frm) {
            this.frm.get('orderStagedPartialToOnUtc').setValue(null);
            this.frm.get('orderStagedPartialTo').setValue(null);
          }
          break;
        case 'orderStagedPartialToOnUtc':
          // Config for start date options
          this.orderStagedPartialFromOptions = {
            ...this.orderStagedPartialFromOptions,
            disableSince: currentDate
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
      case 'orderStagedDoneFromOnUtc':
        // Config for end date options
        this.orderStagedDoneToOptions = {
          ...this.orderStagedDoneToOptions,
          disableUntil: this.getMaxDate(currentDate, dateCurrentUntil),
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentUntil), currentDate)
            //              ? '' : dateCurrentUntil
          ],
          componentDisabled: false
        };
        break;
      case 'orderStagedDoneToOnUtc':
        // Config for start date options
        this.orderStagedDoneFromOptions = {
          ...this.orderStagedDoneFromOptions,
          disableSince: this.getMaxDate(currentDate, dateCurrentSince),
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentSince), currentDate)
            //              ? '' : dateCurrentSince
          ]
        };
        break;
      case 'orderStagedPartialFromOnUtc':
        // Config for end date options
        this.orderStagedPartialToOptions = {
          ...this.orderStagedPartialToOptions,
          disableUntil: this.getMaxDate(currentDate, dateCurrentUntil),
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentUntil), currentDate)
            //              ? '' : dateCurrentUntil
          ],
          componentDisabled: false
        };
        break;
      case 'orderStagedPartialToOnUtc':
        // Config for start date options
        this.orderStagedPartialFromOptions = {
          ...this.orderStagedPartialFromOptions,
          disableSince: this.getMaxDate(currentDate, dateCurrentSince),
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentSince), currentDate)
            //              ? '' : dateCurrentSince
          ]
        };
        break;
      default:
        break;
    }
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
    // if (!this.frm.get('status').value) {
    //   return false;
    // }
    switch (+this.frm.get('status').value) {
      case this.taskStatus.PARTIAL:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'orderStagedPartialFromOnUtc',
          'orderStagedPartialToOnUtc'
        ]);
        break;
      case this.taskStatus.DONE:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'orderStagedDoneFromOnUtc',
          'orderStagedDoneToOnUtc'
        ]);
        break;
      default:
        break;
    }
    return isValid;
  }

  public onSubmitForm(): void {
    if (this.checkFormValid()) {
      let listDate = [];
      if (+this.frm.get('status').value === this.taskStatus.PARTIAL) {
        listDate = [
          'orderStagedPartialFromOnUtc',
          'orderStagedPartialToOnUtc'
        ];
      } else if (+this.frm.get('status').value === this.taskStatus.DONE) {
        listDate = [
          'orderStagedDoneFromOnUtc',
          'orderStagedDoneToOnUtc'
        ];
      }
      this.myDatePickerService.addTimeToDateArray(this.frm, listDate);
      this.activeModal.close(this.frm.value);
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }
}
