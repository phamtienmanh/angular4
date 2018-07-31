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
  MaxDateToday
} from '../../../../shared/validators';

// Interfaces
import {
  Status,
  TaskStatus
} from '../../order-main.model';
import {
  BasicGeneralInfo
} from '../../../../shared/models';

@Component({
  selector: 'print-approval',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'print-approval.template.html',
  styleUrls: [
    // 'print-approval.styles.scss'
  ]
})
export class SampleApprovalComponent implements OnInit {
  @Input()
  public title = '';
  @Input()
  public orderId;
  @Input()
  public rowDetail;

  public statusData = Status.filter((stt) => stt.name === 'Rerun' || stt.name === 'Scheduled'
    || stt.name === 'Approved');

  public frm: FormGroup;
  public formErrors = {
    // stationName: '',
    // approvalTypes: '',
    printApprovedDateOnUtc: '',
    printScheduledDateOnUtc: ''
    // printScheduledDateToOnUtc: ''
  };
  public validationMessages = {
    // stationName: {
    //   required: 'Vendor is required.'
    // },
    // approvalTypes: {
    //   required: 'Approval Type is required.'
    // },
    printApprovedDateOnUtc: {
      required: 'Print Approval Date is required.'
    },
    printScheduledDateOnUtc: {
      required: 'Print Approval Date is required.',
      maxLength: 'Must be earlier than End Date.'
    },
    // printScheduledDateToOnUtc: {
    //   required: 'Print Approval Date is required.',
    //   maxLength: 'Must be later than Start Date.'
    // },
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
  };
  public printApprovedDateOptions: any = {...this.myDatePickerOptions};
  public printScheduledDateOptions: any = {...this.myDatePickerOptions};
  // public printScheduledDateToOptions = {
  //   ...this.myDatePickerOptions,
  //   componentDisabled: true
  // };
  public stationData: BasicGeneralInfo[] = [];
  public approvalProcessDataOrigin: BasicGeneralInfo[];
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
      status: new FormControl(null, [Validators.required]),
      // stationId: new FormControl(''),
      // stationName: new FormControl('', [Validators.required]),
      // approvalTypes: new FormControl(''),
      printApprovedDate: new FormControl(''),
      printApprovedDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'printApprovedDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      printScheduledDate: new FormControl(''),
      printScheduledDateOnUtc: new FormControl('',
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'printScheduledDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
          // MaxDate('printScheduledDateToOnUtc')
        ])
      ),
      // printScheduledDateTo: new FormControl(''),
      // printScheduledDateToOnUtc: new FormControl('',
      //   Validators.compose([
      //     Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
      //       '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
      //     MinDate('printScheduledDateOnUtc')
      //   ])
      // ),
      formRequires: new FormControl({
        status: {
          required: true
        },
        // stationName: {
        //   required: true
        // },
        // approvalTypes: {
        //   required: false
        // },
        printApprovedDateOnUtc: {
          required: false
        },
        printScheduledDateOnUtc: {
          required: false
        }
        // printScheduledDateToOnUtc: {
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
    patchDateFunc('printApprovedDateOnUtc', 'printApprovedDate');
    patchDateFunc('printScheduledDateOnUtc',
      'printScheduledDate');
    // patchDateFunc('printScheduledDateToOnUtc', 'printScheduledDateTo');
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
    // this._commonService.getApprovalTypeList()
    //   .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
    //     if (resp.status) {
    //       this.approvalProcessDataOrigin = resp.data;
    //       if (this.approvalProcessDataOrigin && this.approvalProcessDataOrigin.length) {
    // let activatedValue = [];
    // let value = this.rowDetail.approvalTypes;
    // if (value) {
    //   value.forEach((item) => {
    //     activatedValue.push(this.approvalProcessDataOrigin.find((s) => s.name === item));
    //   });
    // }
    // setTimeout(() => {
    //   this.multiprocess.activeValue(Object.assign([], activatedValue));
    // });
    // }
    //   } else {
    //     this._toastrService.error(resp.errorMessages, 'Error');
    //   }
    // });
  }

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    if (key === 'printApprovedDateOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.APPROVED;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'printScheduledDateOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.SCHEDULED;
      frm.get('formRequires').value[key].required = status;
      return status;
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
        // case 'printScheduledDateOnUtc':
        // Config for cancel date options
        // this.printScheduledDateToOptions = {
        //   ...this.printScheduledDateToOptions,
        //   disableUntil: {
        //     year: 0,
        //     month: 0,
        //     day: 0
        //   },
        //   componentDisabled: true
        // };
        // this.printScheduledDateOptions = {
        //   ...this.printScheduledDateOptions,
        //   disableSince: {
        //     year: 0,
        //     month: 0,
        //     day: 0
        //   }
        // };
        // if (this.frm) {
        // this.frm.get('printScheduledDateToOnUtc').setValue(null);
        // this.frm.get('printScheduledDateTo').setValue(null);
        // }
        // break;
        // case 'printScheduledDateToOnUtc':
        //   // Config for start date options
        //   this.printScheduledDateOptions = {
        //     ...this.printScheduledDateOptions,
        //     disableSince: {
        //       year: 0,
        //       month: 0,
        //       day: 0
        //     }
        //   };
        //   break;
        case 'printApprovedDateOnUtc':
          // Config for cancel date options
          this.printApprovedDateOptions = {
            ...this.printApprovedDateOptions,
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
      // case 'printScheduledDateOnUtc':
      //   // Config for end date options
      //   this.printScheduledDateToOptions = {
      //     ...this.printScheduledDateToOptions,
      //     disableUntil: dateCurrentUntil,
      //     disableSince: {
      //       year: 0,
      //       month: 0,
      //       day: 0
      //     },
      //     enableDays: [],
      //     componentDisabled: false
      //   };
      //   break;
      // case 'printScheduledDateToOnUtc':
      //   // Config for start date options
      //   this.printScheduledDateOptions = {
      //     ...this.printScheduledDateOptions,
      //     disableSince: dateCurrentSince,
      //     enableDays: []
      //   };
      //   break;
      case 'printApprovedDateOnUtc':
        // Config for end date options
        this.printApprovedDateOptions = {
          ...this.printApprovedDateOptions,
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
      case this.taskStatus.RERUN:
        break;
      case this.taskStatus.SCHEDULED:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'printScheduledDateOnUtc'
          // 'printScheduledDateToOnUtc'
        ]);
        break;
      case this.taskStatus.APPROVED:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'printApprovedDateOnUtc'
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
      } else if (+this.frm.get('status').value === this.taskStatus.APPROVED) {
        listDate = [
          'printApprovedDateOnUtc'
        ];
      }
      this.myDatePickerService.addTimeToDateArray(this.frm, listDate);
      this.activeModal.close(this.frm.value);
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }
}
