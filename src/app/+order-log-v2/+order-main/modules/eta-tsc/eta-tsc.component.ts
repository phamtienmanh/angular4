import {
  Component,
  Input,
  OnInit,
  ViewChild,
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

import {
  EtaTscService
} from './eta-tsc.service';

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
  MaxDateToday
} from '../../../../shared/validators';

// Interfaces
import {
  Status,
  TaskStatus
} from '../../order-main.model';
import {
  BasicGeneralInfo,
  ResponseMessage
} from '../../../../shared/models';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';
import {
  ExtraValidators
} from '../../../../shared/services/validation';

@Component({
  selector: 'eta-tsc',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'eta-tsc.template.html',
  styleUrls: [
    // 'eta-tsc.style.scss'
  ]
})
export class EtaTscComponent implements OnInit {
  @Input()
  public orderId;
  @Input()
  public orderDetailId;
  @Input()
  public isPageReadOnly = false;
  @Input()
  public rowDetail;

  public statusData = Status.filter((stt) => stt.name === 'Scheduled' || stt.name === 'Done');

  public frm: FormGroup;
  public formErrors = {
    etaTscDateOnUtc: '',
    etaTscDateComment: ''
  };
  public validationMessages = {
    etaTscDateOnUtc: {},
    etaTscDateComment: {},
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
  public taskStatus = TaskStatus;

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _etaTscService: EtaTscService,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    this.buildForm();
    this.updateForm(this.rowDetail);
    this.getCommonData();
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public buildForm(): void {
    let controlConfig = {
      etaTscDateStatus: new FormControl(null, [Validators.required]),
      etaTscDate: new FormControl(''),
      etaTscDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'etaTscDateOnUtc'),
            Validators.required
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ]),
      ]),
      etaTscDateComment: new FormControl(''),
      formRequires: new FormControl({
        etaTscDateStatus: {
          required: true
        },
        etaTscDateComment: {
          required: false
        },
        etaTscDateOnUtc: {
          required: false
        }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);

    this.onValueChanged(); // (re)set validation messages now
  }

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    if (key === 'etaTscDateOnUtc') {
      let isRequired = [
        this.taskStatus.SCHEDULED,
        this.taskStatus.DONE
      ].indexOf(+this.frm.get('etaTscDateStatus').value) > -1;
      frm.get('formRequires').value[key].required = isRequired;
      return isRequired;
    } else {
      return false;
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

  public setDateValue(): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (this.frm.get(importName).value) {
        const utcDate = new Date(this.frm.get(importName).value);
        let currentDate = new Date(Date.UTC(utcDate.getFullYear(),
          utcDate.getMonth(), utcDate.getDate(), utcDate.getHours(), utcDate.getMinutes()));
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
      }
    };
    patchDateFunc('etaTscDateOnUtc', 'etaTscDate');
  }

  public updateForm(data: any): void {
    if (data) {
      this.frm.patchValue(data);
      this.setDateValue();
    }
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    // this._etaTscService.getDataColumn(this.orderId, this.orderDetailId)
    //   .subscribe((resp: ResponseMessage<any>) => {
    //     if (resp.status) {
    //       this.updateForm(resp.data);
    //     } else {
    //       this._toastrService.error(resp.errorMessages, 'Error');
    //     }
    //   });
  }

  public onSelectItem(val, valProp: string, formControlName: string): void {
    if (val[valProp]) {
      this.frm.get(formControlName).patchValue(val[valProp]);
    } else {
      // add new
      this.frm.get(formControlName).patchValue(val);
    }
  }

  /**
   * Fire date change event
   * @param event
   */
  public onDateChangedBy(event: IMyDateModel, prop: string): void {
    let utcDate = Object.assign({}, event);
    this.frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');
    // Update status for form control whose value changed
    this.frm.get(prop).markAsDirty();
  }

  public getMaxDate(currentDate: IMyDate, dateCompare: IMyDate): IMyDate {
    const timeCurrent = new Date(`${currentDate.month}/${currentDate.day}/${currentDate.year}`)
      .getTime();
    const timeDate = new Date(`${dateCompare.month}/${dateCompare.day}/${dateCompare.year}`)
      .getTime();
    return timeDate >= timeCurrent ? currentDate : dateCompare;
  }

  public checkFormValid(): boolean {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
    return this.frm.valid;
  }

  public onSubmitForm(): void {
    if (this.checkFormValid()) {
      let listDate = [
        'etaTscDateOnUtc'
      ];
      this.myDatePickerService.addTimeToDateArray(this.frm, listDate);
      const modal = this.frm.getRawValue();
      delete modal['formRequires'];
      this.activeModal.close(modal);
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }
}
