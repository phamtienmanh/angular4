import {
  Component,
  OnInit,
  ViewEncapsulation,
  Input
} from '@angular/core';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

// 3rd modules
import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import {
  CommonService,
  ExtraValidators
} from '../../../shared/services';
import {
  ToastrService
} from 'ngx-toastr';

// Interfaces
import {
  Days,
  RecurTypes,
  SendTypes,
  Times,
  WeekDays
} from '../../reports.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'edit-schedule',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'edit-schedule.template.html',
  styleUrls: [
    'edit-schedule.style.scss'
  ],
  providers: []
})
export class EditScheduleComponent implements OnInit {
  @Input()
  public title: string = 'Edit Schedule';
  @Input()
  public scheduleInfo: any;

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
  public frm: FormGroup;
  public formErrors = {
    recurType: '',
    recurValue: '',
    sendType: '',
    sendTypeValue: '',
    startedDateOnUtc: '',
    startedTime: '',
    isActivedSendTypeValue: ''
  };
  public validationMessages = {
    recurType: {
      required: 'Recur Type is required.'
    },
    recurValue: {
      required: 'Recur is required.'
    },
    sendType: {
      required: 'Send Type is required.'
    },
    sendTypeValue: {
      required: 'Send Type value is required.'
    },
    startedDateOnUtc: {
      required: 'Start Date/Time is required.'
    },
    startedTime: {
      required: 'Start Date/Time is required.'
    }
  };
  public recurTypes = RecurTypes;
  public sendTypes = SendTypes;
  public weekDays = WeekDays;
  public days = Days;
  public times = Times;

  constructor(public activeModal: NgbActiveModal,
              private _toastrService: ToastrService,
              private _commonService: CommonService,
              private _fb: FormBuilder) {
    // e
  }

  public ngOnInit(): void {
    this.buildForm();
    if (this.scheduleInfo) {
      const model = {
        ...this.scheduleInfo,
        sendTypeValue: this.scheduleInfo.sendTypeValue ?
          this.scheduleInfo.sendTypeValue.split(',') : []
      };
      this.frm.patchValue(model);
    }
    this.setDateValue(this.frm);
  }

  public buildForm(): void {
    // convert to +07:00; -07:00...
    let timeZone: any = -(new Date().getTimezoneOffset() / 60); // 7, -7
    if (timeZone >= 10) {
      timeZone = '+' + timeZone;
    } else if (timeZone >= 0 && timeZone < 10) {
      timeZone = '+0' + timeZone;
    } else if (timeZone >= -10 && timeZone < 0) {
      timeZone = '-0' + timeZone * (-1);
    } else {
      timeZone = timeZone.toString();
    }
    timeZone += ':00';
    let isoDateString = new Date().toISOString();
    // Remove char 'Z' from model, it made 'new Date' parse utc to local date by timezone
    isoDateString = isoDateString.slice(0, isoDateString.length - 1);
    this.frm = this._fb.group({
      id: new FormControl(null),
      recurType: new FormControl(null, [Validators.required]),
      recurValue: new FormControl(null, [Validators.required]),
      sendType: new FormControl(null, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      sendTypeValue: new FormControl([], [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      isActivedSendTypeValue: new FormControl(true),
      startedDate: new FormControl(null),
      startedDateOnUtc: new FormControl(isoDateString, [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      startedTime: new FormControl(null, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'secondCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      timeZone: new FormControl(timeZone),
      formRequires: new FormControl({
        recurType: {
          required: true
        },
        recurValue: {
          required: true
        },
        sendType: {
          required: false
        },
        sendTypeValue: {
          required: false
        },
        startedDateOnUtc: {
          required: false
        },
        startedTime: {
          required: true
        }
      })
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));
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

  public setDateValue(frm: any): void {
    let patchDateFunc = (importName: string, exportName: string, timeName: string) => {
      if (frm.get(importName).value) {
        const utcDate = new Date(frm.get(importName).value);
        let currentDate = new Date(Date.UTC(utcDate.getFullYear(),
          utcDate.getMonth(), utcDate.getDate(), utcDate.getHours(), utcDate.getMinutes()));
        frm.get(exportName).setValue({
          date: {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            day: currentDate.getDate()
          }
        });
        // currentDate get time in format 'HH:MM'
        let hours: any = currentDate.getHours();
        let mins: any = currentDate.getMinutes();
        hours = hours < 10 ? ('0' + hours) : hours;
        mins = mins < 10 ? ('0' + mins) : mins;
        let time = hours + ':' + mins;
        if (!this.times.some((t) => t.value === time)) {
          time = this.times[0].value;
        }
        frm.get(timeName).patchValue(time);
      } else {
        if (importName === 'startedDateOnUtc') {
          const utcDate = new Date();
          let currentDate = new Date(Date.UTC(utcDate.getFullYear(),
            utcDate.getMonth(), utcDate.getDate(), utcDate.getHours(), utcDate.getMinutes()));
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
        }
      }
    };
    patchDateFunc('startedDateOnUtc', 'startedDate', 'startedTime');
  }

  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    let firstCaseList = [
      'sendType',
      'sendTypeValue'
    ];
    let secondCaseList = [
      'startedTime'
    ];
    if (key === 'firstCase') {
      // recurType week or month
      let status = frm.get('recurType').value >= 4;
      firstCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else if (key === 'secondCase') {
      // recurType week or month
      let status = frm.get('recurType').value >= 3;
      secondCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else {
      return false;
    }
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public onSelectChanged(e, prop): void {
    if (prop === 'sendType') {
      this.frm.get('sendTypeValue').patchValue([]);
    } else if (prop === 'recurType') {
      this.frm.get('sendTypeValue').patchValue([]);
      if (this.frm.get('recurType').value === 4) {
        // recurType Weeks => sendType must be Week Days
        this.frm.get('sendType').patchValue(2);
      } else if (this.frm.get('recurType').value === 5) {
        // recurType Months => sendType must be Days
        this.frm.get('sendType').patchValue(1);
      } else {
        this.frm.get('sendType').patchValue(null);
      }
    }
  }

  public setHours(prop, selectedTime) {
    if (this.frm.get(prop).value && selectedTime) {
      let newDateTime = new Date(this.frm.get(prop).value);
      newDateTime.setHours(selectedTime.slice(0, 2), selectedTime.slice(3, 5), 0, 0);
      let isoDateString = newDateTime.toISOString();
      // Remove char 'Z' from model, it made 'new Date' parse utc to local date by timezone
      isoDateString = isoDateString.slice(0, isoDateString.length - 1);
      this.frm.get(prop).patchValue(isoDateString);
    }
  }

  public onSubmit() {
    if (this.frm.valid) {
      this.setHours('startedDateOnUtc', this.frm.get('startedTime').value);
      if (this.frm.get('sendTypeValue').value instanceof Array) {
        this.frm.get('sendTypeValue').patchValue(this.frm.get('sendTypeValue').value.join(','));
      }
      let model = {
        ...this.frm.value
      };
      this.activeModal.close({
        frm: model
      });
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }
}
