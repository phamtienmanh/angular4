import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
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

// Services
import { ExtraValidators } from '../../../../shared/services/validation';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../shared/services/common';
import { ValidationService } from '../../../../shared/services/validation';
import { OrderMainService } from '../../order-main.service';

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
import {
  ResponseMessage
} from '../../../../shared/models';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';
import { BasicVendorInfo } from '../../../../shared/models';
import { ScheduleColType } from '../../../order-log.model';
import { TypePrintSchedule } from '../columns.model';

@Component({
  selector: 'finishing-date',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'finishing-date.template.html',
  styleUrls: [
    'finishing-date.style.scss'
  ]
})
export class FinishingDateComponent implements OnInit {
  @Input()
  public title = '';
  @Input()
  public orderDetailId;
  @Input()
  public orderId;
  @Input()
  public rowDetail;

  public statusData;

  public frm: FormGroup;
  public formErrors = {
    vendorId: '',
    printDateOnUtc: '',
    finishingDateDoneFromOnUtc: '',
    finishingDateDoneToOnUtc: ''
  };
  public validationMessages = {
    vendorId: {
      required: 'Vendor is required.'
    },
    printDateOnUtc: {
      required: 'Finishing Date is required.'
    },
    finishingDateDoneFromOnUtc: {
      required: 'Finishing Date is required.',
      maxLength: 'Must be earlier than End Date.'
    },
    finishingDateDoneToOnUtc: {
      required: 'Finishing Date is required.',
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
    alignSelectorRight: false,
    openSelectorOnInputClick: true,
    editableDateField: true,
    selectionTxtFontSize: '12px',
    height: '28px',
    firstDayOfWeek: 'su',
    sunHighlight: false
  };
  public finishingDateOptions = {...this.myDatePickerOptions};
  public finishingDateDoneFromOptions = {...this.myDatePickerOptions};
  public finishingDateDoneToOptions = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public vendorData: any[] = [];
  public processesData: any[] = [];
  public isTscVendor = false;
  public taskStatus = TaskStatus;

  constructor(public activeModal: NgbActiveModal,
              private _fb: FormBuilder,
              private _validationService: ValidationService,
              private _orderMainService: OrderMainService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
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
      finishings: this._fb.array([])
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  public get finishings(): FormArray {
    return this.frm.get('finishings') as FormArray;
  };

  public setFinishings(finishings: any[]) {
    const finishingFGs = finishings.map((finishing: any) => this._validationService.buildForm({
      id: new FormControl(finishing.id),
      processNumber: new FormControl(finishing.processNumber, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'processNumber'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      status: new FormControl(finishing.status, [Validators.required]),
      orderDetailId: new FormControl(finishing.orderDetailId),
      isMachine: new FormControl(finishing.isMachine),
      vendorId: new FormControl(finishing.vendorId, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      vendorName: new FormControl(finishing.vendorName),
      type: new FormControl(TypePrintSchedule.Finishing),
      finishingDateDoneFrom: new FormControl(''),
      finishingDateDoneFromOnUtc: new FormControl(finishing.finishingDateDoneFromOnUtc, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'finishingDateDoneFromOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('finishingDateDoneToOnUtc'),
          MaxDateToday
        ])
      ]),
      finishingDateDoneFromOptions: new FormControl(this.finishingDateDoneFromOptions),
      finishingDateDoneTo: new FormControl(''),
      finishingDateDoneToOnUtc: new FormControl(finishing.finishingDateDoneToOnUtc, [
        Validators.compose([
          // ExtraValidators.conditional(
          //   (group) => this.getSpecialRequireCase(group, 'finishingDateDoneToOnUtc'),
          //   Validators.compose([
          //     Validators.required
          //   ])
          // ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('finishingDateDoneFromOnUtc'),
          MaxDateToday
        ])
      ]),
      finishingDateDoneToOptions: new FormControl(this.finishingDateDoneToOptions),
      printDate: new FormControl(''),
      printDateOnUtc: new FormControl(finishing.printDateOnUtc, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'printDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      finishingDateOptions: new FormControl(this.finishingDateOptions),
      previousPrintDateOnUtc: new FormControl(finishing.printDateOnUtc),
      formRequires: new FormControl({
        processNumber: {
          required: false
        },
        status: {
          required: true
        },
        vendorId: {
          required: true
        },
        finishingDateDoneFromOnUtc: {
          required: false
        },
        finishingDateDoneToOnUtc: {
          required: false
        },
        printDateOnUtc: {
          required: false
        }
      })
    }, this.formErrors, this.validationMessages));
    const contactFormArray = this._fb.array(finishingFGs);
    this.frm.setControl('finishings', contactFormArray);
  }

  public addFinshing() {
    this.finishings.push(this._validationService.buildForm({
      id: new FormControl(''),
      processNumber: new FormControl(null, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'processNumber'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      status: new FormControl(null, [Validators.required]),
      orderDetailId: new FormControl(this.orderDetailId),
      isMachine: new FormControl(''),
      vendorId: new FormControl(null, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      vendorName: new FormControl(''),
      type: new FormControl(TypePrintSchedule.Finishing),
      finishingDateDoneFrom: new FormControl(''),
      finishingDateDoneFromOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'finishingDateDoneFromOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('finishingDateDoneToOnUtc'),
          MaxDateToday
        ])
      ]),
      finishingDateDoneFromOptions: new FormControl(this.finishingDateDoneFromOptions),
      finishingDateDoneTo: new FormControl(''),
      finishingDateDoneToOnUtc: new FormControl('', [
        Validators.compose([
          // ExtraValidators.conditional(
          //   (group) => this.getSpecialRequireCase(group, 'finishingDateDoneToOnUtc'),
          //   Validators.compose([
          //     Validators.required
          //   ])
          // ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('finishingDateDoneFromOnUtc'),
          MaxDateToday
        ])
      ]),
      finishingDateDoneToOptions: new FormControl(this.finishingDateDoneToOptions),
      printDate: new FormControl(''),
      printDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'printDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      finishingDateOptions: new FormControl(this.finishingDateOptions),
      previousPrintDateOnUtc: new FormControl(''),
      formRequires: new FormControl({
        processNumber: {
          required: false
        },
        status: {
          required: true
        },
        vendorId: {
          required: true
        },
        finishingDateDoneFromOnUtc: {
          required: false
        },
        finishingDateDoneToOnUtc: {
          required: false
        },
        printDateOnUtc: {
          required: false
        }
      })
    }, this.formErrors, this.validationMessages));
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
      'status'
    ];
    if (key === 'firstCase') {
      let status = false;
      firstCaseList.forEach((cas) => status = status
        || +frm.get(cas).value > 2);
      firstCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else if (key === 'printDateOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.SCHEDULED;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'finishingDateDoneFromOnUtc'
      || key === 'finishingDateDoneToOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.DONE;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'processNumber') {
      let status = frm.get('vendorName').value
        && frm.get('vendorName').value.toLowerCase() === 'tsc';
      frm.get('formRequires').value[key].required = status;
      return status;
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
    patchDateFunc('finishingDateDoneFromOnUtc', 'finishingDateDoneFrom');
    patchDateFunc('finishingDateDoneToOnUtc', 'finishingDateDoneTo');
    patchDateFunc('printDateOnUtc', 'printDate');
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getMachineNVendor('Finishing')
      .subscribe((resp: ResponseMessage<any[]>) => {
        if (resp.status) {
          this.vendorData = resp.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._commonService.getProcesses()
      .subscribe((resp: ResponseMessage<any[]>) => {
        if (resp.status) {
          this.processesData = resp.data;
          this.processesData.forEach((p) => {
            p.displayName = p.processNumber + ' - ' + p.name;
          });
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    if (this.rowDetail.orderDetailId) {
      this._orderMainService.getScheduleColumnsInfo(this.orderId,
        ScheduleColType.FinishingDate, null, null, this.rowDetail.orderDetailId)
        .subscribe((response: ResponseMessage<BasicVendorInfo[]>) => {
          if (response.status) {
            this.setFinishings(response.data);
            for (let print of this.finishings.controls) {
              this.setDateValue(print);
            }
            this.isTscVendor = this.finishings.value
              .some((i) => i.vendorName.toLowerCase() === 'tsc');
            this._changeDetectorRef.markForCheck();
          } else {
            this._toastrService.error(response.errorMessages, 'Error');
          }
        });
    } else if (this.rowDetail.status === TaskStatus.BLANK) {
      this.setFinishings([Object.assign(this.rowDetail,
        {orderDetailId: this.orderDetailId})]);
      for (let print of this.finishings.controls) {
        this.setDateValue(print);
      }
    } else {
      this.addFinshing();
      for (let print of this.finishings.controls) {
        this.setDateValue(print);
      }
    }
    this._changeDetectorRef.markForCheck();
  }

  public onSelectItem(val, frm, valProp: string, formControlName: string): void {
    if (val[valProp]) {
      frm.get(formControlName).patchValue(val[valProp]);
    } else {
      // add new
      frm.get(formControlName).patchValue(val);
    }
    this.isTscVendor = this.finishings.value
      .some((i) => i.vendorName.toLowerCase() === 'tsc');
  }

  /**
   * Fire date change event
   * @param event
   */
  public onDateChangedBy(event: IMyDateModel, frm: any, prop: string): void {
    let utcDate = Object.assign({}, event);
    frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');
    if (prop === 'printDateOnUtc') {
      frm.get('previousPrintDateOnUtc').setValue(utcDate.jsdate ? utcDate.formatted : '');
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
        case 'finishingDateDoneFromOnUtc':
          // Config for cancel date options
          const finishingDateDoneToOptions = {
            ...this.finishingDateDoneToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            enableDays: [],
            disableSince: currentDate,
            componentDisabled: true
          };
          const finishingDateDoneFromOptions = {
            ...this.finishingDateDoneFromOptions,
            enableDays: [],
            disableSince: currentDate
          };
          if (frm) {
            frm.get('finishingDateDoneToOnUtc').setValue(null);
            frm.get('finishingDateDoneTo').setValue(null);
          }
          frm.get('finishingDateDoneToOptions').setValue(finishingDateDoneToOptions);
          frm.get('finishingDateDoneFromOptions').setValue(finishingDateDoneFromOptions);
          break;
        case 'finishingDateDoneToOnUtc':
          // Config for start date options
          const finishingDateDoneFromOptions2 = {
            ...this.finishingDateDoneFromOptions,
            disableSince: currentDate
          };
          frm.get('finishingDateDoneFromOptions').setValue(finishingDateDoneFromOptions2);
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
      case 'finishingDateDoneFromOnUtc':
        // Config for end date options
        const finishingDateDoneToOptions = {
          ...this.finishingDateDoneToOptions,
          disableUntil: this.getMaxDate(currentDate, dateCurrentUntil),
          disableSince: currentDate,
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentUntil), currentDate)
            //   ? '' : dateCurrentUntil
          ],
          componentDisabled: false
        };
        frm.get('finishingDateDoneToOptions').setValue(finishingDateDoneToOptions);
        break;
      case 'finishingDateDoneToOnUtc':
        // Config for start date options
        const finishingDateDoneFromOptions = {
          ...this.finishingDateDoneFromOptions,
          disableSince: this.getMaxDate(currentDate, dateCurrentSince),
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentSince), currentDate)
            //   ? '' : dateCurrentSince
          ]
        };
        frm.get('finishingDateDoneFromOptions').setValue(finishingDateDoneFromOptions);
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
    if (this.finishings.value.findIndex((i) => !i.status) > -1) {
      return false;
    }
    this.finishings.controls.forEach((finishing: any) => {
      switch (+finishing.get('status').value) {
        case this.taskStatus.BLANK:
          break;
        case this.taskStatus.SCHEDULED:
          isValid = isValid && checkValidControlFunc(finishing, [
            'processNumber',
            'vendorName',
            'printDateOnUtc'
          ]);
          break;
        case this.taskStatus.DONE:
          isValid = isValid && checkValidControlFunc(finishing, [
            'processNumber',
            'vendorName',
            'finishingDateDoneFromOnUtc',
            'finishingDateDoneToOnUtc'
          ]);
          finishing.get('printDateOnUtc')
            .patchValue(finishing.get('previousPrintDateOnUtc').value);
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
    setTimeout(() => {
      if (this.checkFormValid()) {
        this.finishings.controls.forEach((finishing: FormGroup) => {
          let listDate = [];
          if (+finishing.get('status').value === this.taskStatus.SCHEDULED) {
            listDate = [];
          } else if (+finishing.get('status').value === this.taskStatus.DONE) {
            listDate = [
              'finishingDateDoneFromOnUtc',
              'finishingDateDoneToOnUtc'
            ];
          }
          this.myDatePickerService.addTimeToDateArray(finishing, listDate);
        });
        this.activeModal.close(this.finishings.value);
      } else {
        for (let print of this.finishings.controls) {
          this._commonService.markAsDirtyForm(print as FormGroup, true);
        }
        this._changeDetectorRef.markForCheck();
      }
    });
  }
}
