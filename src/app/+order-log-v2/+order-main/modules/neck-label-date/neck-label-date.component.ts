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
  selector: 'neck-label-date',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'neck-label-date.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: [
    'neck-label-date.style.scss'
  ]
})
export class NeckLabelDateComponent implements OnInit {
  @Input()
  public title = '';
  @Input()
  public neckLabelId;
  @Input()
  public orderId;
  @Input()
  public rowDetail;

  public statusData;

  public frm: FormGroup;
  public formErrors = {
    vendorId: '',
    neckLabelDateDoneFromOnUtc: '',
    neckLabelDateDoneToOnUtc: '',
    printDateOnUtc: ''
  };
  public validationMessages = {
    vendorId: {
      required: 'Vendor is required.'
    },
    neckLabelDateDoneFromOnUtc: {
      required: 'Neck Label Date is required.',
      maxLength: 'Must be earlier than End Date.'
    },
    neckLabelDateDoneToOnUtc: {
      required: 'Neck Label Date is required.',
      maxLength: 'Must be later than Start Date.'
    },
    printDateOnUtc: {
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
    alignSelectorRight: false,
    openSelectorOnInputClick: true,
    editableDateField: true,
    selectionTxtFontSize: '12px',
    height: '28px',
    firstDayOfWeek: 'su',
    sunHighlight: false
  };
  public neckLabelDateOptions = {...this.myDatePickerOptions};
  public neckLabelDateDoneFromOptions = {...this.myDatePickerOptions};
  public neckLabelDateDoneToOptions = {
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
      neckLabels: this._fb.array([])
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  public get neckLabels(): FormArray {
    return this.frm.get('neckLabels') as FormArray;
  };

  public setNeckLabels(neckLabels: any[]) {
    const printFGs = neckLabels.map((neckLabel: any) => this._validationService.buildForm({
      id: new FormControl(neckLabel.id),
      status: new FormControl(neckLabel.status, [Validators.required]),
      neckLabelId: new FormControl(neckLabel.neckLabelId),
      isMachine: new FormControl(neckLabel.isMachine),
      vendorId: new FormControl(neckLabel.vendorId, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      vendorName: new FormControl(neckLabel.vendorName),
      type: new FormControl(TypePrintSchedule.NeckLabel),
      neckLabelDateDoneFrom: new FormControl(''),
      neckLabelDateDoneFromOnUtc: new FormControl(neckLabel.neckLabelDateDoneFromOnUtc, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'neckLabelDateDoneFromOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('neckLabelDateDoneToOnUtc'),
          MaxDateToday
        ])
      ]),
      neckLabelDateDoneFromOptions: new FormControl(this.neckLabelDateDoneFromOptions),
      neckLabelDateDoneTo: new FormControl(''),
      neckLabelDateDoneToOnUtc: new FormControl(neckLabel.neckLabelDateDoneToOnUtc, [
        Validators.compose([
          // ExtraValidators.conditional(
          //   (group) => this.getSpecialRequireCase(group, 'neckLabelDateDoneToOnUtc'),
          //   Validators.compose([
          //     Validators.required
          //   ])
          // ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('neckLabelDateDoneFromOnUtc'),
          MaxDateToday
        ])
      ]),
      neckLabelDateDoneToOptions: new FormControl(this.neckLabelDateDoneToOptions),
      printDate: new FormControl(''),
      printDateOnUtc: new FormControl(neckLabel.printDateOnUtc, [
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
      neckLabelDateOptions: new FormControl(this.neckLabelDateOptions),
      previousPrintDateOnUtc: new FormControl(neckLabel.printDateOnUtc),
      formRequires: new FormControl({
        status: {
          required: true
        },
        vendorId: {
          required: true
        },
        neckLabelDateDoneFromOnUtc: {
          required: false
        },
        neckLabelDateDoneToOnUtc: {
          required: false
        },
        printDateOnUtc: {
          required: false
        }
      })
    }, this.formErrors, this.validationMessages));
    const contactFormArray = this._fb.array(printFGs);
    this.frm.setControl('neckLabels', contactFormArray);
  }

  public addNeckLabel() {
    this.neckLabels.push(this._validationService.buildForm({
      id: new FormControl(''),
      status: new FormControl(null, [Validators.required]),
      neckLabelId: new FormControl(this.neckLabelId),
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
      type: new FormControl(TypePrintSchedule.NeckLabel),
      neckLabelDateDoneFrom: new FormControl(''),
      neckLabelDateDoneFromOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'neckLabelDateDoneFromOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('neckLabelDateDoneToOnUtc'),
          MaxDateToday
        ])
      ]),
      neckLabelDateDoneFromOptions: new FormControl(this.neckLabelDateDoneFromOptions),
      neckLabelDateDoneTo: new FormControl(''),
      neckLabelDateDoneToOnUtc: new FormControl('', [
        Validators.compose([
          // ExtraValidators.conditional(
          //   (group) => this.getSpecialRequireCase(group, 'neckLabelDateDoneToOnUtc'),
          //   Validators.compose([
          //     Validators.required
          //   ])
          // ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('neckLabelDateDoneFromOnUtc'),
          MaxDateToday
        ])
      ]),
      neckLabelDateDoneToOptions: new FormControl(this.neckLabelDateDoneToOptions),
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
      neckLabelDateOptions: new FormControl(this.neckLabelDateOptions),
      previousPrintDateOnUtc: new FormControl(''),
      formRequires: new FormControl({
        status: {
          required: true
        },
        vendorId: {
          required: true
        },
        neckLabelDateDoneFromOnUtc: {
          required: false
        },
        neckLabelDateDoneToOnUtc: {
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
    } else if (key === 'neckLabelDateDoneFromOnUtc'
      || key === 'neckLabelDateDoneToOnUtc') {
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
    patchDateFunc('neckLabelDateDoneFromOnUtc', 'neckLabelDateDoneFrom');
    patchDateFunc('neckLabelDateDoneToOnUtc', 'neckLabelDateDoneTo');
    patchDateFunc('printDateOnUtc', 'printDate');
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
    if (this.rowDetail.neckLabelId) {
      this._orderMainService.getScheduleColumnsInfo(this.orderId,
        ScheduleColType.NeckLabelDate, null, this.rowDetail.neckLabelId)
        .subscribe((response: ResponseMessage<BasicVendorInfo[]>) => {
          if (response.status) {
            this.setNeckLabels(response.data);
            for (let print of this.neckLabels.controls) {
              this.setDateValue(print);
            }
            this._changeDetectorRef.markForCheck();
          } else {
            this._toastrService.error(response.errorMessages, 'Error');
          }
        });
    } else if (this.rowDetail.status === TaskStatus.BLANK) {
      this.setNeckLabels([
        Object.assign(this.rowDetail,
          {neckLabelId: this.neckLabelId})
      ]);
      for (let print of this.neckLabels.controls) {
        this.setDateValue(print);
      }
    } else {
      this.addNeckLabel();
      for (let print of this.neckLabels.controls) {
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
        case 'neckLabelDateDoneFromOnUtc':
          // Config for cancel date options
          const neckLabelDateDoneToOptions = {
            ...this.neckLabelDateDoneToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            enableDays: [],
            disableSince: currentDate,
            componentDisabled: true
          };
          const neckLabelDateDoneFromOptions = {
            ...this.neckLabelDateDoneFromOptions,
            enableDays: [],
            disableSince: currentDate
          };
          if (frm) {
            frm.get('neckLabelDateDoneToOnUtc').setValue(null);
            frm.get('neckLabelDateDoneTo').setValue(null);
          }
          frm.get('neckLabelDateDoneToOptions').setValue(neckLabelDateDoneToOptions);
          frm.get('neckLabelDateDoneFromOptions').setValue(neckLabelDateDoneFromOptions);
          break;
        case 'neckLabelDateDoneToOnUtc':
          // Config for start date options
          const neckLabelDateDoneFromOptions2 = {
            ...this.neckLabelDateDoneFromOptions,
            disableSince: currentDate
          };
          frm.get('neckLabelDateDoneFromOptions').setValue(neckLabelDateDoneFromOptions2);
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
      case 'neckLabelDateDoneFromOnUtc':
        // Config for end date options
        const neckLabelDateDoneToOptions = {
          ...this.neckLabelDateDoneToOptions,
          disableUntil: this.getMaxDate(currentDate, dateCurrentUntil),
          disableSince: currentDate,
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentUntil), currentDate)
            //   ? '' : dateCurrentUntil
          ],
          componentDisabled: false
        };
        frm.get('neckLabelDateDoneToOptions').setValue(neckLabelDateDoneToOptions);
        break;
      case 'neckLabelDateDoneToOnUtc':
        // Config for start date options
        const neckLabelDateDoneFromOptions = {
          ...this.neckLabelDateDoneFromOptions,
          disableSince: this.getMaxDate(currentDate, dateCurrentSince),
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentSince), currentDate)
            //   ? '' : dateCurrentSince
          ]
        };
        frm.get('neckLabelDateDoneFromOptions').setValue(neckLabelDateDoneFromOptions);
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
    if (this.neckLabels.value.findIndex((i) => !i.status) > -1) {
      return false;
    }
    this.neckLabels.controls.forEach((print: any) => {
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
            'neckLabelDateDoneFromOnUtc',
            'neckLabelDateDoneToOnUtc'
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
      this.neckLabels.controls.forEach((print: FormGroup) => {
        let listDate = [];
        if (+print.get('status').value === this.taskStatus.SCHEDULED) {
          listDate = [];
        } else if (+print.get('status').value === this.taskStatus.DONE) {
          listDate = [
            'neckLabelDateDoneFromOnUtc',
            'neckLabelDateDoneToOnUtc'
          ];
        }
        this.myDatePickerService.addTimeToDateArray(print, listDate);
      });
      this.activeModal.close(this.neckLabels.value);
    } else {
      for (let print of this.neckLabels.controls) {
        this._commonService.markAsDirtyForm(print as FormGroup, true);
      }
      this._changeDetectorRef.markForCheck();
    }
  }
}
