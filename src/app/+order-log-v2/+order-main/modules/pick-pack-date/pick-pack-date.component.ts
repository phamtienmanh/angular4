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
import { ExtraValidators } from '../../../../shared/services/validation';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../shared/services/common';
import { ValidationService } from '../../../../shared/services/validation';
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
  BasicGeneralInfo,
  ResponseMessage
} from '../../../../shared/models';
import {
  TypeColumns
} from '../columns.model';

@Component({
  selector: 'pick-pack-date',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'pick-pack-date.template.html',
  styleUrls: [
    // 'print-date.styles.scss'
  ]
})
export class PickPackDateComponent implements OnInit {
  @Input()
  public title = '';
  @Input()
  public orderId;
  @Input()
  public rowDetail;

  public statusData = Status.filter((stt) => [
    TaskStatus.BLANK,
    TaskStatus.SCHEDULED,
    TaskStatus.DONE
  ].indexOf(stt.id) > -1);

  public frm: FormGroup;
  public formErrors = {
    stationId: '',
    pickAndPackDateDoneOnUtc: '',
    pickAndPackDateScheduledFromOnUtc: '',
    pickAndPackDateScheduledToOnUtc: ''
  };
  public validationMessages = {
    stationId: {
      required: 'Vendor is required.'
    },
    pickAndPackDateDoneOnUtc: {
      required: 'Pick & Pack Date is required.'
    },
    pickAndPackDateScheduledFromOnUtc: {
      required: 'Pick & Pack Date is required.',
      maxLength: 'Must be earlier than End Date.'
    },
    pickAndPackDateScheduledToOnUtc: {
      required: 'Pick & Pack Date is required.',
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
    sunHighlight: false
  };
  public pickAndPackDateDoneOptions: any = {...this.myDatePickerOptions};
  public pickAndPackDateScheduledFromOptions: any = {...this.myDatePickerOptions};
  public pickAndPackDateScheduledToOptions: any = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public stationData: BasicGeneralInfo[] = [];
  public taskStatus = TaskStatus;

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
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
      status: new FormControl(null, [Validators.required]),
      stationId: new FormControl(null, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      stationName: new FormControl(''),
      pickAndPackDateDone: new FormControl(''),
      pickAndPackDateDoneOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'pickAndPackDateDoneOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      pickAndPackDateScheduledFrom: new FormControl(''),
      pickAndPackDateScheduledFromOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'pickAndPackDateScheduledFromOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('pickAndPackDateScheduledToOnUtc')
        ])
      ]),
      pickAndPackDateScheduledTo: new FormControl(''),
      pickAndPackDateScheduledToOnUtc: new FormControl('',
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('pickAndPackDateScheduledFromOnUtc')
        ])
      ),
      formRequires: new FormControl({
        status: {
          required: true
        },
        stationId: {
          required: true
        },
        pickAndPackDateDoneOnUtc: {
          required: false
        },
        pickAndPackDateScheduledFromOnUtc: {
          required: false
        },
        pickAndPackDateScheduledToOnUtc: {
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
    } else if (key === 'pickAndPackDateDoneOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.DONE;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'pickAndPackDateScheduledFromOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.SCHEDULED;
      frm.get('formRequires').value[key].required = status;
      return status;
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
    patchDateFunc('pickAndPackDateDoneOnUtc', 'pickAndPackDateDone');
    patchDateFunc('pickAndPackDateScheduledFromOnUtc', 'pickAndPackDateScheduledFrom');
    patchDateFunc('pickAndPackDateScheduledToOnUtc', 'pickAndPackDateScheduledTo');
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
    this._commonService.getStations(TypeColumns.PickAndPackDate)
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.stationData = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * Fire select value change event
   * @param value
   * @param prop
   */
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
        case 'pickAndPackDateScheduledFromOnUtc':
          // Config for cancel date options
          this.pickAndPackDateScheduledToOptions = {
            ...this.pickAndPackDateScheduledToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            componentDisabled: true
          };
          this.pickAndPackDateScheduledFromOptions = {
            ...this.pickAndPackDateScheduledFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          if (this.frm) {
            this.frm.get('pickAndPackDateScheduledToOnUtc').setValue(null);
            this.frm.get('pickAndPackDateScheduledTo').setValue(null);
          }
          break;
        case 'pickAndPackDateScheduledToOnUtc':
          // Config for start date options
          this.pickAndPackDateScheduledFromOptions = {
            ...this.pickAndPackDateScheduledFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          break;
        case 'pickAndPackDateDoneOnUtc':
          // Config for done date options
          this.pickAndPackDateDoneOptions = {
            ...this.pickAndPackDateDoneOptions,
            enableDays: [],
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
      case 'pickAndPackDateScheduledFromOnUtc':
        // Config for end date options
        this.pickAndPackDateScheduledToOptions = {
          ...this.pickAndPackDateScheduledToOptions,
          disableUntil: dateCurrentUntil,
          disableSince: {
            year: 0,
            month: 0,
            day: 0
          },
          enableDays: [],
          componentDisabled: false
        };
        break;
      case 'pickAndPackDateScheduledToOnUtc':
        // Config for start date options
        this.pickAndPackDateScheduledFromOptions = {
          ...this.pickAndPackDateScheduledFromOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        break;
      case 'pickAndPackDateDoneOnUtc':
        // Config for end date options
        this.pickAndPackDateDoneOptions = {
          ...this.pickAndPackDateDoneOptions,
          enableDays: [],
          disableSince: currentDate
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
    if (!this.frm.get('status').value) {
      return false;
    }
    switch (+this.frm.get('status').value) {
      case this.taskStatus.SCHEDULED:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'stationId',
          'pickAndPackDateScheduledFromOnUtc',
          'pickAndPackDateScheduledToOnUtc'
        ]);
        break;
      case this.taskStatus.DONE:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'stationId',
          'pickAndPackDateDoneOnUtc'
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
      if (+this.frm.get('status').value === this.taskStatus.SCHEDULED) {
        listDate = [];
      } else if (+this.frm.get('status').value === this.taskStatus.DONE) {
        listDate = [
          'pickAndPackDateDoneOnUtc'
        ];
      }
      this.myDatePickerService.addTimeToDateArray(this.frm, listDate);
      this.activeModal.close(this.frm.value);
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }
}
