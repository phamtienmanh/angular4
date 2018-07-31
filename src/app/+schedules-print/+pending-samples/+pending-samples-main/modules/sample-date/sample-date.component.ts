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
  NgbActiveModal,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

import { IMyDateModel } from 'mydatepicker';

// Services
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../../shared/services/common';
import { ValidationService } from '../../../../../shared/services/validation';

// Validators
import {
  MaxDateToday
} from '../../../../../shared/validators';

// Interfaces
import {
  Status,
  TaskStatus
} from '../../../../../+order-log-v2/+order-main';
import {
  BasicGeneralInfo,
  ResponseMessage
} from '../../../../../shared/models';
import {
  MyDatePickerService
} from '../../../../../shared/services/my-date-picker';
import { ExtraValidators } from '../../../../../shared/services/validation';

@Component({
  selector: 'sample-date',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'sample-date.template.html',
  styleUrls: [
    'sample-date.styles.scss'
  ]
})
export class SampleDateComponent implements OnInit {
  @Input()
  public title = '';
  @Input()
  public orderId;
  @Input()
  public rowDetail;

  public statusData = Status.filter((stt) => stt.name === 'Scheduled');

  public frm: FormGroup;
  public formErrors = {
    dateDoneOnUtc: ''
  };
  public validationMessages = {
    sampleDateOnUtc: {
      maxLength: 'Date must be today’s date or earlier'
    },
    samplePrinterId: {
      required: 'Sample Printer is required.'
    },
    default: {
      required: 'This is required.'
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

  public sampleDateDoneOptions = {
    ...this.myDatePickerOptions
  };
  public samplePrinterDataOrigin: any[];
  public taskStatus = TaskStatus;

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _modalService: NgbModal,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    this.buildForm();
    this.updateForm(this.rowDetail);
    this.getCommonData();
  }

  public buildForm(): void {
    let controlConfig = {
      status: new FormControl(null, [Validators.required]),
      sampleDate: new FormControl(''),
      sampleDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'sampleDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)')
        ])
      ]),
      sampleDateDone: new FormControl(''),
      sampleDateDoneOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'sampleDateDoneOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
          MaxDateToday
        ])
      ]),
      samplePrinterId: new FormControl(null, [Validators.required]),
      samplePrinterType: new FormControl(''),
      formRequires: new FormControl({
        status: {
          required: true
        },
        sampleDateOnUtc: {
          required: false
        },
        sampleDateDoneOnUtc: {
          required: false
        },
        samplePrinterId: {
          required: true
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
        const listNotUpdateTime = [
          'sampleDateDoneOnUtc'
        ];
        const utcDate = new Date(this.frm.get(importName).value);
        let currentDate;
        if (listNotUpdateTime.indexOf(importName) > -1) {
          currentDate = new Date(this.frm.get(importName).value);
        } else {
          currentDate = new Date(Date.UTC(utcDate.getFullYear(),
            utcDate.getMonth(), utcDate.getDate(), utcDate.getHours(), utcDate.getMinutes()));
        }
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
    patchDateFunc('sampleDateOnUtc', 'sampleDate');
    patchDateFunc('sampleDateDoneOnUtc', 'sampleDateDone');
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

    switch (prop) {
      case 'sampleDateDoneOnUtc':
        // Config for cancel date options
        this.sampleDateDoneOptions = {
          ...this.sampleDateDoneOptions,
          enableDays: [],
          disableSince: currentDate
        };
        break;
      default:
        break;
    }
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
    if (key === 'sampleDateOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.SCHEDULED;
      frm.get('formRequires').value[key].required = status;
      return status;
    }
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getSamplesPrinter()
      .subscribe((resp: ResponseMessage<any[]>) => {
        if (resp.status) {
          if (!resp.data || !resp.data.length) {
            return;
          }
          resp.data.forEach((i) => {
            i.fakeId = [
              i.id,
              i.id = i.fakeId
            ][0];
          });
          this.samplePrinterDataOrigin = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public onSelectItem(val, frm, valProp: string, formControlName: string): void {
    if (val[valProp] || val[valProp] === 0) {
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

  public checkFormValid(): boolean {
    let isValid = true;
    const checkValidControlFunc = (frm: FormGroup, list: string[]): boolean => {
      let isControlValue = true;
      list.forEach((i) => isControlValue = isControlValue
        && (frm.get(i).valid || frm.get(i).disabled));
      return isControlValue;
    };
    if (!this.frm.get('status').value) {
      return false;
    }
    switch (+this.frm.get('status').value) {
      case this.taskStatus.SCHEDULED:
        isValid = checkValidControlFunc(this.frm, [
          'sampleDateOnUtc',
          'samplePrinterId'
        ]);
        break;
      case this.taskStatus.DONE:
        isValid = checkValidControlFunc(this.frm, [
          'sampleDateOnUtc'
        ]);
        break;
      default:
        break;
    }
    return isValid;
  }

  public onSubmitForm(): void {
    if (this.checkFormValid()) {
      this.myDatePickerService.addTimeToDateArray(this.frm, ['sampleDateOnUtc']);
      this.activeModal.close(this.frm.value);
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }
}
