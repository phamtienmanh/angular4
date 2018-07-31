import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormArray
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
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';

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
import { BasicVendorInfo } from '../../../../shared/models';
import { ScheduleColType } from '../../../order-log.model';
import { TypePrintSchedule } from '../columns.model';

@Component({
  selector: 'print-date',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'print-date.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: [
    'print-date.style.scss'
  ]
})
export class PrintDateComponent implements OnInit {
  @Input()
  public title = '';
  @Input()
  public orderId;
  @Input()
  public printLocationId;
  @Input()
  public rowDetail;

  public statusData;

  public frm: FormGroup;
  public formErrors = {
    vendorId: '',
    printDateDoneFromOnUtc: '',
    printDateDoneToOnUtc: '',
    printDateOnUtc: ''
  };
  public validationMessages = {
    vendorId: {
      required: 'Vendor is required.'
    },
    printDateDoneFromOnUtc: {
      required: 'Print Date is required.',
      maxLength: 'Must be earlier than End Date.'
    },
    printDateDoneToOnUtc: {
      required: 'Print Date is required.',
      maxLength: 'Must be later than Start Date.'
    },
    printDateOnUtc: {
      required: 'Print Date is required.'
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
  public printDateOptions: any = {...this.myDatePickerOptions};
  public printDateDoneFromOptions: any = {...this.myDatePickerOptions};
  public printDateDoneToOptions: any = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public taskStatus = TaskStatus;
  public vendorData: any[] = [];

  constructor(public activeModal: NgbActiveModal,
              private _fb: FormBuilder,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _orderMainService: OrderMainService,
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
      prints: this._fb.array([])
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  public get prints(): FormArray {
    return this.frm.get('prints') as FormArray;
  };

  public setPrints(prints: any[]) {
    const printFGs = prints.map((print: any) => this._validationService.buildForm({
      id: new FormControl(print.id),
      status: new FormControl(print.status, [Validators.required]),
      printLocationId: new FormControl(print.printLocationId),
      isMachine: new FormControl(print.isMachine),
      vendorId: new FormControl(print.vendorId, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      vendorName: new FormControl(print.vendorName),
      type: new FormControl(TypePrintSchedule.Print),
      printDateDoneFrom: new FormControl(''),
      printDateDoneFromOnUtc: new FormControl(print.printDateDoneFromOnUtc, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'printDateDoneFromOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('printDateDoneToOnUtc'),
          MaxDateToday
        ])
      ]),
      printDateDoneFromOptions: new FormControl(this.printDateDoneFromOptions),
      printDateDoneTo: new FormControl(''),
      printDateDoneToOnUtc: new FormControl(print.printDateDoneToOnUtc, [
        Validators.compose([
          // ExtraValidators.conditional(
          //   (group) => this.getSpecialRequireCase(group, 'printDateDoneToOnUtc'),
          //   Validators.compose([
          //     Validators.required
          //   ])
          // ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('printDateDoneFromOnUtc'),
          MaxDateToday
        ])
      ]),
      printDateDoneToOptions: new FormControl(this.printDateDoneToOptions),
      printDate: new FormControl(''),
      printDateOnUtc: new FormControl(print.printDateOnUtc, [
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
      printDateOptions: new FormControl(this.printDateOptions),
      previousPrintDateOnUtc: new FormControl(print.printDateOnUtc),
      formRequires: new FormControl({
        status: {
          required: true
        },
        vendorId: {
          required: true
        },
        printDateDoneFromOnUtc: {
          required: false
        },
        printDateDoneToOnUtc: {
          required: false
        },
        printDateOnUtc: {
          required: false
        }
      })
    }, this.formErrors, this.validationMessages));
    const contactFormArray = this._fb.array(printFGs);
    this.frm.setControl('prints', contactFormArray);
  }

  public addPrint() {
    this.prints.push(this._validationService.buildForm({
      id: new FormControl(''),
      status: new FormControl(null, [Validators.required]),
      printLocationId: new FormControl(this.printLocationId),
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
      type: new FormControl(TypePrintSchedule.Print),
      printDateDoneFrom: new FormControl(''),
      printDateDoneFromOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'printDateDoneFromOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('printDateDoneToOnUtc'),
          MaxDateToday
        ])
      ]),
      printDateDoneFromOptions: new FormControl(this.printDateDoneFromOptions),
      printDateDoneTo: new FormControl(''),
      printDateDoneToOnUtc: new FormControl('', [
        Validators.compose([
          // ExtraValidators.conditional(
          //   (group) => this.getSpecialRequireCase(group, 'printDateDoneToOnUtc'),
          //   Validators.compose([
          //     Validators.required
          //   ])
          // ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('printDateDoneFromOnUtc'),
          MaxDateToday
        ])
      ]),
      printDateDoneToOptions: new FormControl(this.printDateDoneToOptions),
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
      printDateOptions: new FormControl(this.printDateOptions),
      previousPrintDateOnUtc: new FormControl(''),
      formRequires: new FormControl({
        status: {
          required: true
        },
        vendorId: {
          required: true
        },
        printDateDoneFromOnUtc: {
          required: false
        },
        printDateDoneToOnUtc: {
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
    } else if (key === 'printDateDoneFromOnUtc'
      || key === 'printDateDoneToOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.DONE;
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
    patchDateFunc('printDateDoneFromOnUtc', 'printDateDoneFrom');
    patchDateFunc('printDateDoneToOnUtc', 'printDateDoneTo');
    patchDateFunc('printDateOnUtc', 'printDate');
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getMachineNVendor('Print')
      .subscribe((resp: ResponseMessage<any[]>) => {
        if (resp.status) {
          this.vendorData = resp.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    if (this.rowDetail.printLocationId) {
      this._orderMainService.getScheduleColumnsInfo(this.orderId,
        ScheduleColType.PrintDate, this.rowDetail.printLocationId, null, null)
        .subscribe((response: ResponseMessage<BasicVendorInfo[]>) => {
          if (response.status) {
            this.setPrints(response.data);
            for (let print of this.prints.controls) {
              this.setDateValue(print);
            }
            this._changeDetectorRef.markForCheck();
          } else {
            this._toastrService.error(response.errorMessages, 'Error');
          }
        });
    } else if (this.rowDetail.status === TaskStatus.BLANK) {
      this.setPrints([
        Object.assign(this.rowDetail,
          {printLocationId: this.printLocationId})
      ]);
      for (let print of this.prints.controls) {
        this.setDateValue(print);
      }
    } else {
      this.addPrint();
      for (let print of this.prints.controls) {
        this.setDateValue(print);
      }
    }
  }

  public onSelectItem(val, frm, valProp: string, formControlName: string): void {
    if (formControlName === 'vendorName') {
      frm.get('isMachine').patchValue(val['isMachine']);
    }
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
        case 'printDateDoneFromOnUtc':
          // Config for cancel date options
          const printDateDoneToOptions = {
            ...this.printDateDoneToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            enableDays: [],
            disableSince: currentDate,
            componentDisabled: true
          };
          const printDateDoneFromOptions = {
            ...this.printDateDoneFromOptions,
            enableDays: [],
            disableSince: currentDate
          };
          if (frm) {
            frm.get('printDateDoneToOnUtc').setValue(null);
            frm.get('printDateDoneTo').setValue(null);
          }
          frm.get('printDateDoneToOptions').setValue(printDateDoneToOptions);
          frm.get('printDateDoneFromOptions').setValue(printDateDoneFromOptions);
          break;
        case 'printDateDoneToOnUtc':
          // Config for start date options
          const printDateDoneFromOptions2 = {
            ...this.printDateDoneFromOptions,
            disableSince: currentDate
          };
          frm.get('printDateDoneFromOptions').setValue(printDateDoneFromOptions2);
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
      case 'printDateDoneFromOnUtc':
        // Config for end date options
        const printDateDoneToOptions = {
          ...this.printDateDoneToOptions,
          disableUntil: this.getMaxDate(currentDate, dateCurrentUntil),
          disableSince: currentDate,
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentUntil), currentDate)
            //   ? '' : dateCurrentUntil
          ],
          componentDisabled: false
        };
        frm.get('printDateDoneToOptions').setValue(printDateDoneToOptions);
        break;
      case 'printDateDoneToOnUtc':
        // Config for start date options
        const printDateDoneFromOptions = {
          ...this.printDateDoneFromOptions,
          disableSince: this.getMaxDate(currentDate, dateCurrentSince),
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentSince), currentDate)
            //   ? '' : dateCurrentSince
          ]
        };
        frm.get('printDateDoneFromOptions').setValue(printDateDoneFromOptions);
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

  public isExceedToday(date: string): boolean {
    const dateArr = date.split('/');
    if (!dateArr && dateArr.length !== 3) {
      return false;
    }
    const todayModel = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 1
    };
    const todayDate = new Date(todayModel.year, todayModel.month, todayModel.day);
    const currentDate = new Date(+dateArr[2], +dateArr[0], +dateArr[1]);
    return currentDate.getTime() >= todayDate.getTime();
  }

  public checkFormValid(): boolean {
    let isValid = true;
    const checkValidControlFunc = (frm: FormGroup, list: string[]): boolean => {
      let isControlValue = true;
      list.forEach((i) => isControlValue = isControlValue
        && (frm.get(i).valid || frm.get(i).disabled));
      return isControlValue;
    };
    if (this.prints.value.findIndex((i) => !i.status) > -1) {
      return false;
    }
    this.prints.controls.forEach((print: any) => {
      switch (+print.get('status').value) {
        case this.taskStatus.BLANK:
          break;
        case this.taskStatus.SCHEDULED:
          isValid = isValid && checkValidControlFunc(print, [
            'vendorId',
            'printDateOnUtc'
          ]);
          break;
        case this.taskStatus.DONE:
          isValid = isValid && checkValidControlFunc(print, [
            'vendorId',
            'printDateDoneFromOnUtc',
            'printDateDoneToOnUtc'
          ]);
          print.get('printDateOnUtc')
            .patchValue(print.get('previousPrintDateOnUtc').value);
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
    if (this.checkFormValid()) {
      this.prints.controls.forEach((print: FormGroup) => {
        let listDate = [];
        if (+print.get('status').value === this.taskStatus.SCHEDULED) {
          listDate = [];
        } else if (+print.get('status').value === this.taskStatus.DONE) {
          listDate = [
            'printDateDoneFromOnUtc',
            'printDateDoneToOnUtc'
          ];
        }
        this.myDatePickerService.addTimeToDateArray(print, listDate);
      });
      this.activeModal.close(this.prints.value);
    } else {
      for (let print of this.prints.controls) {
        this._commonService.markAsDirtyForm(print as FormGroup, true);
      }
      this._changeDetectorRef.markForCheck();
    }
  }
}
