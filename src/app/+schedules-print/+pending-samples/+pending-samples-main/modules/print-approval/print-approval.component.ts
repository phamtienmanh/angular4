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
import { StatusColumns } from '../../pending-samples-main.model';

@Component({
  selector: 'print-approval',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'print-approval.template.html',
  styleUrls: [
    'print-approval.styles.scss'
  ]
})
export class PrintApprovalComponent implements OnInit {
  @Input()
  public title = '';
  @Input()
  public orderId;
  @Input()
  public rowDetail;
  @Input()
  public type;

  public statusColumns = StatusColumns;
  public statusData = Status.filter((stt) => [
    TaskStatus.PENDING,
    TaskStatus.APPROVED
  ].indexOf(stt.id) > -1);

  public frm: FormGroup;
  public formErrors = {
    printApprovalDateOnUtc: ''
  };
  public validationMessages = {
    approveArtByUserId: {
      required: 'Approve Art required.'
    },
    printApprovalDateOnUtc: {
      maxLength: 'Date must be today’s date or earlier'
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
  public taskStatus = TaskStatus;
  public artManagers = [];

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _modalService: NgbModal,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    if (this.type === this.statusColumns.ApprovedToSample) {
      this.rowDetail = {
        ...this.rowDetail,
        printApprovalDateOnUtc: this.rowDetail.approvedToSampleDateOnUtc
      };
    }
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
      approveArtByUserId: new FormControl(null, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'approveArtByUserId'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      approvedToSampleDateOnUtc: new FormControl(''),
      printApprovalDate: new FormControl(''),
      printApprovalDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'printApprovalDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
          MaxDateToday
        ])
      ]),
      formRequires: new FormControl({
        status: {
          required: true
        },
        approveArtByUserId: {
          required: false
        },
        printApprovalDateOnUtc: {
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

  public setDateValue(): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (this.frm.get(importName).value) {
        const listNotUpdateTime = [
          ''
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
    patchDateFunc('printApprovalDateOnUtc', 'printApprovalDate');
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
      case 'printApprovalDateOnUtc':
        // Config for cancel date options
        this.myDatePickerOptions = {
          ...this.myDatePickerOptions,
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
      if ([
        this.taskStatus.PENDING,
        this.taskStatus.APPROVED
      ].indexOf(data.status) === -1) {
        data.status = null;
      }
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
    if (key === 'printApprovalDateOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.APPROVED;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'approveArtByUserId') {
      let status = +frm.get('status').value === this.taskStatus.APPROVED
        && this.type === this.statusColumns.PrintApproval;
      frm.get('formRequires').value[key].required = status;
      return status;
    }
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getArtManagers()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.artManagers = resp.data;
          let activeManager = this.artManagers.find((o) => o.isLoggedinUser);
          if (activeManager && !this.frm.get('approveArtByUserId').value) {
            this.frm.get('approveArtByUserId').patchValue(activeManager.id);
          }
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
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
      case this.taskStatus.APPROVED:
        isValid = checkValidControlFunc(this.frm, [
          'printApprovalDateOnUtc',
          'approveArtByUserId'
        ]);
        break;
      default:
        break;
    }
    return isValid;
  }

  public onSubmitForm(): void {
    if (this.checkFormValid()) {
      this.myDatePickerService.addTimeToDateArray(this.frm, ['printApprovalDateOnUtc']);
      this.frm.get('approvedToSampleDateOnUtc').patchValue(
        this.frm.get('printApprovalDateOnUtc').value
      );
      this.activeModal.close(this.frm.value);
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }
}
