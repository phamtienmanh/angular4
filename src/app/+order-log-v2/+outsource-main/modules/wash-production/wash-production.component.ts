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
  WashProductionService
} from './wash-production.service';

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
  ResponseMessage
} from '../../../../shared/models';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';
import {
  ExtraValidators
} from '../../../../shared/services/validation';
import { LeadEtaComponent } from '../+shared';
import { TypeColumns } from '../../../+order-main/modules/columns.model';

@Component({
  selector: 'wash-production',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'wash-production.template.html',
  styleUrls: [
    // 'wash-production.style.scss'
  ]
})
export class WashProductionComponent implements OnInit {
  @Input()
  public orderId;
  @Input()
  public orderDetailId;
  @Input()
  public isPageReadOnly = false;
  @Input()
  public rowDetail;

  @ViewChild(LeadEtaComponent)
  public leadEtaComponent: LeadEtaComponent;

  public statusData = Status.filter((stt) => [
    TaskStatus.BLANK,
    TaskStatus.SCHEDULED,
    TaskStatus.PARTIAL,
    TaskStatus.DONE
  ].indexOf(stt.id) > -1);

  public frm: FormGroup;
  public formErrors = {
    specialtyTreatmentDateStationId: '',
    specialtyTreatmentDateDateDoneOnUtc: '',
    specialtyTreatmentDatePartialFromOnUtc: '',
    specialtyTreatmentDatePartialToOnUtc: '',
    specialtyTreatmentDateScheduledFromOnUtc: '',
    specialtyTreatmentDateScheduledToOnUtc: ''
  };
  public validationMessages = {
    specialtyTreatmentDateStationId: {
      required: 'Vendor is required.'
    },
    specialtyTreatmentDateDoneOnUtc: {
      required: 'Specialty Treatment Date is required.'
    },
    specialtyTreatmentDatePartialFromOnUtc: {
      required: 'Specialty Treatment Date is required.',
      maxLength: 'Must be earlier than End Date.'
    },
    specialtyTreatmentDatePartialToOnUtc: {
      required: 'Specialty Treatment Date is required.',
      maxLength: 'Must be later than Start Date.'
    },
    specialtyTreatmentDateScheduledFromOnUtc: {
      required: 'Specialty Treatment Date is required.',
      maxLength: 'Must be earlier than End Date.'
    },
    specialtyTreatmentDateScheduledToOnUtc: {
      required: 'Specialty Treatment Date is required.',
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
  public specialtyTreatmentDateDoneOptions: any = {...this.myDatePickerOptions};
  public specialtyTreatmentDatePartialFromOptions: any = {...this.myDatePickerOptions};
  public specialtyTreatmentDatePartialToOptions: any = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public specialtyTreatmentDateScheduledFromOptions: any = {...this.myDatePickerOptions};
  public specialtyTreatmentDateScheduledToOptions: any = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public stationData: BasicGeneralInfo[] = [];
  public taskStatus = TaskStatus;
  private _storedData;

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _washProductionService: WashProductionService,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    this.buildForm();
    this.getCommonData();
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public buildForm(): void {
    let controlConfig = {
      columnId: new FormControl(this.rowDetail.columnId),
      specialtyTreatmentDateStatus: new FormControl(null),
      specialtyTreatmentDateStationId: new FormControl(null, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      specialtyTreatmentDateStationName: new FormControl(''),
      specialtyTreatmentDateDone: new FormControl(''),
      specialtyTreatmentDateDoneOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'specialtyTreatmentDateDoneOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      specialtyTreatmentDatePartialFrom: new FormControl(''),
      specialtyTreatmentDatePartialFromOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'specialtyTreatmentDatePartialFromOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('specialtyTreatmentDatePartialToOnUtc'),
          MaxDateToday
        ])
      ]),
      specialtyTreatmentDatePartialTo: new FormControl(''),
      specialtyTreatmentDatePartialToOnUtc: new FormControl('', [
        Validators.compose([
          // ExtraValidators.conditional(
          //   (group) => this.getSpecialRequireCase(group, 'specialtyTreatmentDatePartialToOnUtc'),
          //   Validators.compose([
          //     Validators.required
          //   ])
          // ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('specialtyTreatmentDatePartialFromOnUtc'),
          MaxDateToday
        ])
      ]),
      specialtyTreatmentDateScheduledFrom: new FormControl(''),
      specialtyTreatmentDateScheduledFromOnUtc: new FormControl('',
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('specialtyTreatmentDateScheduledToOnUtc')
        ])
      ),
      specialtyTreatmentDateScheduledTo: new FormControl(''),
      specialtyTreatmentDateScheduledToOnUtc: new FormControl('',
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('specialtyTreatmentDateScheduledFromOnUtc')
        ])
      ),
      formRequires: new FormControl({
        specialtyTreatmentDateStatus: {
          required: true
        },
        specialtyTreatmentDateStationId: {
          required: true
        },
        specialtyTreatmentDateDoneOnUtc: {
          required: false
        },
        specialtyTreatmentDatePartialFromOnUtc: {
          required: false
        },
        specialtyTreatmentDatePartialToOnUtc: {
          required: false
        },
        specialtyTreatmentDateScheduledFromOnUtc: {
          required: false
        },
        specialtyTreatmentDateScheduledToOnUtc: {
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
    let firstCaseList = [
      'specialtyTreatmentDateStatus'
    ];
    if (key === 'firstCase') {
      let status = false;
      firstCaseList.forEach((cas) => status = status
        || +frm.get(cas).value > 2);
      firstCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else if (key === 'specialtyTreatmentDateDoneOnUtc') {
      let status = +frm.get('specialtyTreatmentDateStatus').value === this.taskStatus.DONE;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'specialtyTreatmentDatePartialFromOnUtc'
      || key === 'specialtyTreatmentDatePartialToOnUtc') {
      let status = +frm.get('specialtyTreatmentDateStatus').value === this.taskStatus.PARTIAL;
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
    patchDateFunc('specialtyTreatmentDateDoneOnUtc', 'specialtyTreatmentDateDone');
    patchDateFunc('specialtyTreatmentDatePartialFromOnUtc', 'specialtyTreatmentDatePartialFrom');
    patchDateFunc('specialtyTreatmentDatePartialToOnUtc', 'specialtyTreatmentDatePartialTo');
    patchDateFunc('specialtyTreatmentDateScheduledFromOnUtc',
      'specialtyTreatmentDateScheduledFrom');
    patchDateFunc('specialtyTreatmentDateScheduledToOnUtc',
      'specialtyTreatmentDateScheduledTo');
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
    this._commonService.getStations(TypeColumns.SpecialtyTreatmentDate)
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.stationData = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._washProductionService.getDataColumn(this.orderId, this.orderDetailId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.updateForm(resp.data);
          this._storedData = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
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
  public onDateChangedBy(event: IMyDateModel, prop: string): void {
    let utcDate = Object.assign({}, event);
    this.frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');
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
        case 'specialtyTreatmentDatePartialFromOnUtc':
          // Config for cancel date options
          this.specialtyTreatmentDatePartialToOptions = {
            ...this.specialtyTreatmentDatePartialToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            enableDays: [],
            disableSince: currentDate,
            componentDisabled: true
          };
          this.specialtyTreatmentDatePartialFromOptions = {
            ...this.specialtyTreatmentDatePartialFromOptions,
            enableDays: [],
            disableSince: currentDate
          };
          if (this.frm) {
            this.frm.get('specialtyTreatmentDatePartialToOnUtc').setValue(null);
            this.frm.get('specialtyTreatmentDatePartialTo').setValue(null);
          }
          break;
        case 'specialtyTreatmentDatePartialToOnUtc':
          // Config for start date options
          this.specialtyTreatmentDatePartialFromOptions = {
            ...this.specialtyTreatmentDatePartialFromOptions,
            disableSince: currentDate
          };
          break;
        case 'specialtyTreatmentDateScheduledFromOnUtc':
          // Config for cancel date options
          this.specialtyTreatmentDateScheduledToOptions = {
            ...this.specialtyTreatmentDateScheduledToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            componentDisabled: true
          };
          this.specialtyTreatmentDateScheduledFromOptions = {
            ...this.specialtyTreatmentDateScheduledFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          if (this.frm) {
            this.frm.get('specialtyTreatmentDateScheduledToOnUtc').setValue(null);
            this.frm.get('specialtyTreatmentDateScheduledTo').setValue(null);
          }
          break;
        case 'specialtyTreatmentDateScheduledToOnUtc':
          // Config for start date options
          this.specialtyTreatmentDateScheduledFromOptions = {
            ...this.specialtyTreatmentDateScheduledFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          break;
        case 'specialtyTreatmentDateDoneOnUtc':
          // Config for cancel date options
          this.specialtyTreatmentDateDoneOptions = {
            ...this.specialtyTreatmentDateDoneOptions,
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
      case 'specialtyTreatmentDatePartialFromOnUtc':
        // Config for end date options
        this.specialtyTreatmentDatePartialToOptions = {
          ...this.specialtyTreatmentDatePartialToOptions,
          disableUntil: this.getMaxDate(currentDate, dateCurrentUntil),
          disableSince: currentDate,
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentUntil), currentDate)
            //   ? '' : dateCurrentUntil
          ],
          componentDisabled: false
        };
        break;
      case 'specialtyTreatmentDatePartialToOnUtc':
        // Config for start date options
        this.specialtyTreatmentDatePartialFromOptions = {
          ...this.specialtyTreatmentDatePartialFromOptions,
          disableSince: this.getMaxDate(currentDate, dateCurrentSince),
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentSince), currentDate)
            //   ? '' : dateCurrentSince
          ]
        };
        break;
      case 'specialtyTreatmentDateScheduledFromOnUtc':
        // Config for end date options
        this.specialtyTreatmentDateScheduledToOptions = {
          ...this.specialtyTreatmentDateScheduledToOptions,
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
      case 'specialtyTreatmentDateScheduledToOnUtc':
        // Config for start date options
        this.specialtyTreatmentDateScheduledFromOptions = {
          ...this.specialtyTreatmentDateScheduledFromOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        break;
      case 'specialtyTreatmentDateDoneOnUtc':
        // Config for end date options
        this.specialtyTreatmentDateDoneOptions = {
          ...this.specialtyTreatmentDateDoneOptions,
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
    if (!this.frm.get('specialtyTreatmentDateStatus').value) {
      return false;
    }
    switch (+this.frm.get('specialtyTreatmentDateStatus').value) {
      case this.taskStatus.BLANK:
        break;
      case this.taskStatus.PARTIAL:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'specialtyTreatmentDateStationId',
          'specialtyTreatmentDatePartialFromOnUtc',
          'specialtyTreatmentDatePartialToOnUtc'
        ]);
        break;
      case this.taskStatus.SCHEDULED:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'specialtyTreatmentDateStationId',
          'specialtyTreatmentDateScheduledFromOnUtc',
          'specialtyTreatmentDateScheduledToOnUtc'
        ]);
        break;
      case this.taskStatus.DONE:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'specialtyTreatmentDateStationId',
          'specialtyTreatmentDateDoneOnUtc'
        ]);
        break;
      default:
        break;
    }
    return isValid;
  }

  public onSubmitForm(): void {
    if (this.checkFormValid() && this.leadEtaComponent.checkFormValid()) {
      let listDate = [];
      if (+this.frm.get('specialtyTreatmentDateStatus').value === this.taskStatus.SCHEDULED) {
        listDate = [];
      } else if (+this.frm.get('specialtyTreatmentDateStatus').value === this.taskStatus.PARTIAL) {
        listDate = [
          'specialtyTreatmentDatePartialFromOnUtc',
          'specialtyTreatmentDatePartialToOnUtc'
        ];
      } else if (+this.frm.get('specialtyTreatmentDateStatus').value === this.taskStatus.DONE) {
        listDate = [
          'specialtyTreatmentDateDoneOnUtc'
        ];
      }
      this.myDatePickerService.addTimeToDateArray(this.frm, listDate);
      const modal = Object.assign({
        ...this._storedData,
        ...this.leadEtaComponent.getFormValue()
      }, this.frm.value);
      delete modal['formRequires'];
      this._washProductionService.changeStatusColumn(this.orderId, this.orderDetailId, modal)
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
