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
  IMyDate,
  IMyDateModel
} from 'mydatepicker';

import {
  PoIssueDateService
} from './po-issue-date.service';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  CommonService
} from '../../../../../shared/services/common/index';
import {
  ValidationService
} from '../../../../../shared/services/validation/index';
import * as moment from 'moment';
import * as _ from 'lodash';

// Validators
import {
  MaxDateToday
} from '../../../../../shared/validators/index';

// Interfaces
import {
  MyDatePickerService
} from '../../../../../shared/services/my-date-picker/index';
import {
  ExtraValidators
} from '../../../../../shared/services/validation/index';

@Component({
  selector: 'lead-eta',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'lead-eta.template.html',
  styleUrls: [
    'lead-eta.style.scss'
  ]
})
export class LeadEtaComponent implements OnInit {
  @Input()
  public isPageReadOnly = false;
  @Input()
  public rowDetail;
  @Input()
  public parentClass = 'col-7';
  @Input()
  public parentSubClass = 'col-4';
  @Input()
  public labelClass = 'col-6';
  @Input()
  public controlClass = 'col-6';

  public frm: FormGroup;
  public formErrors = {
    leadTime: '',
    etaDateOnUtc: '',
    etaDateReviseOnUtc: ''
    // dateCompletedOnUtc: '',
    // comment: ''
  };
  public validationMessages = {
    leadTime: {},
    etaDateOnUtc: {},
    etaDateReviseOnUtc: {},
    // dateCompletedOnUtc: {},
    // comment: {},
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
  public isReviseLeadTime = false;
  public isReviseEtaDate = false;
  public isMinLengthLeadTime = false;

  constructor(private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    this.buildForm();
    this.updateForm(this.rowDetail);
    const etaStartDateOnUtc = new Date(`${this.frm.get('etaStartDateOnUtc').value}Z`);
    this.myDatePickerOptions = {
      ...this.myDatePickerOptions,
      disableUntil: {
        year: etaStartDateOnUtc.getFullYear(),
        month: etaStartDateOnUtc.getMonth() + 1,
        day: etaStartDateOnUtc.getDate()
      },
      enableDays: []
    };
    this.getCommonData();
  }

  public buildForm(): void {
    let controlConfig = {
      leadTime: new FormControl(''),
      leadTimeRevise: new FormControl(''),
      etaDate: new FormControl(''),
      etaDateOnUtc: new FormControl(''),
      etaStartDateOnUtc: new FormControl(''),
      etaDateRevise: new FormControl(''),
      etaDateReviseOnUtc: new FormControl(''),
      // dateCompleted: new FormControl(''),
      // dateCompletedOnUtc: new FormControl('', [
      //   Validators.compose([
      //     Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
      //       '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
      //     MaxDateToday
      //   ])
      // ]),
      // comment: new FormControl(''),
      formRequires: new FormControl({
        leadTimeRevise: {
          required: false
        },
        etaDateReviseOnUtc: {
          required: false
        }
        // dateCompletedOnUtc: {
        //   required: false
        // },
        // comment: {
        //   required: false
        // }
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
    // patchDateFunc('dateCompletedOnUtc', 'dateCompleted');
    patchDateFunc('etaDateOnUtc', 'etaDate');
    patchDateFunc('etaDateReviseOnUtc', 'etaDateRevise');
  }

  public updateForm(data: any): void {
    if (data) {
      this.frm.patchValue(data);
      this.setDateValue();
    }
  }

  public onReviseLeadTime(): void {
    this.isReviseLeadTime = true;
    // if (!this.frm.get('leadTimeRevise').value) {
    //   this.frm.get('leadTimeRevise').patchValue(this.frm.get('leadTime').value);
    // }
  }

  public onReviseEtaDate(): void {
    this.isReviseEtaDate = true;
    // if (!this.frm.get('etaDateReviseOnUtc').value) {
    //   this.frm.get('etaDateRevise').patchValue(this.frm.get('etaDate').value);
    //   this.frm.get('etaDateReviseOnUtc').patchValue(this.frm.get('etaDateOnUtc').value);
    // }
  }

  public isNaN(num: number): boolean {
    return num === null || num === undefined || isNaN(num);
  }

  public onLeadTimeChange(event): void {
    this.isMinLengthLeadTime = !this.isNaN(event.target.value) && +event.target.value === 0;

    let etaDateReviseOnUtc = new Date(this.frm.get('etaStartDateOnUtc').value);
    etaDateReviseOnUtc.setHours(etaDateReviseOnUtc.getHours()
      + event.target.value * 24);
    this.frm.get('etaDateReviseOnUtc')
      .patchValue(moment(etaDateReviseOnUtc).toISOString());
    this.setDateValue();
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    // empty
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
  public onDateChangedBy(event: IMyDateModel, prop: string, isEtaDateChange = false): void {
    let utcDate = Object.assign({}, event);
    this.frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');
    if (isEtaDateChange) {
      let etaDateOnUtc = new Date(this.frm.get('etaStartDateOnUtc').value);
      let etaDateReviseOnUtc = new Date(utcDate.formatted);
      etaDateReviseOnUtc.setHours(etaDateOnUtc.getHours());
      let leadTimeRevise = (etaDateReviseOnUtc.getTime() - etaDateOnUtc.getTime()) / 86400000;
      this.frm.get('leadTimeRevise').patchValue(Math.round(leadTimeRevise));
    }
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
    if (this.isReviseEtaDate && !this.frm.get('etaDateReviseOnUtc').value) {
      return false;
    }
    return this.frm.valid && !this.isMinLengthLeadTime;
  }

  public getFormValue(): any {
    // let listDate = [
    //   'etaDateReviseOnUtc'
    // ];
    // this.myDatePickerService.addUtcTimeToDateArray(this.frm, listDate);
    const modal = {
      ...this.frm.value
    };
    delete modal['formRequires'];
    return modal;
  }
}
