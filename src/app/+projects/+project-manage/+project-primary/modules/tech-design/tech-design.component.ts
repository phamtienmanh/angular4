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
  TechDesignService
} from './tech-design.service';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  CommonService
} from '../../../../../shared/services/common';
import {
  ValidationService
} from '../../../../../shared/services/validation';
import {
  MyDatePickerService
} from '../../../../../shared/services/my-date-picker';
import {
  ExtraValidators
} from '../../../../../shared/services/validation';

// Validators
import {
  MaxDateToday
} from '../../../../../shared/validators';

// Interfaces
import {
  ColumnType,
  Status,
  TaskStatus
} from '../../project-primary.model';
import {
  ResponseMessage
} from '../../../../../shared/models';
import {
  LeadEtaComponent
} from '../index';

@Component({
  selector: 'tech-design',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'tech-design.template.html',
  styleUrls: [
    // 'tech-design.style.scss'
  ]
})
export class TechDesignComponent implements OnInit {
  @Input()
  public isPageReadOnly = false;
  @Input()
  public rowDetail;
  @Input()
  public orderId;
  @Input()
  public orderDetailId;
  @Input()
  public projectId;
  @Input()
  public productId;

  @ViewChild(LeadEtaComponent)
  public leadEtaComponent: LeadEtaComponent;

  public statusData = Status.filter((stt) => [
    'Approved',
    'Approved w/ Changes',
    'Rejected'
  ].indexOf(stt.name) > -1);

  public frm: FormGroup;
  public formErrors = {
    techDesignReviewDatePpDateApprovedOnUtc: '',
    techDesignReviewDatePpDateRejectedOnUtc: '',
  };
  public validationMessages = {
    techDesignReviewDatePpDateApprovedOnUtc: {},
    techDesignReviewDatePpDateRejectedOnUtc: {},
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
  private _storedData;

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _techDesignReviewDatePpService: TechDesignService,
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
      columnId: new FormControl(''),
      techDesignReviewDatePpStatus: new FormControl(null),
      techDesignReviewDatePpDateApproved: new FormControl(''),
      techDesignReviewDatePpDateApprovedOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'techDesignReviewDatePpDateApprovedOnUtc'),
            Validators.required
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ]),
      ]),
      techDesignReviewDatePpDateRejected: new FormControl(''),
      techDesignReviewDatePpDateRejectedOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'techDesignReviewDatePpDateRejectedOnUtc'),
            Validators.required
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ]),
      ]),
      techDesignReviewDatePpComments: new FormControl(''),
      formRequires: new FormControl({
        techDesignReviewDatePpStatus: {
          required: false
        },
        techDesignReviewDatePpDateApprovedOnUtc: {
          required: false
        },
        techDesignReviewDatePpDateRejectedOnUtc: {
          required: false
        },
        techDesignReviewDatePpComments: {
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
    if (key === 'techDesignReviewDatePpDateApprovedOnUtc') {
      let isRequired = [
        this.taskStatus.APPROVED,
        this.taskStatus.APPROVEDWCHANGES
      ].indexOf(+this.frm.get('techDesignReviewDatePpStatus').value) > -1;
      frm.get('formRequires').value[key].required = isRequired;
      return isRequired;
    } else if (key === 'techDesignReviewDatePpDateRejectedOnUtc') {
      let isRequired = [
        this.taskStatus.REJECTED
      ].indexOf(+this.frm.get('techDesignReviewDatePpStatus').value) > -1;
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
    patchDateFunc('techDesignReviewDatePpDateApprovedOnUtc', 'techDesignReviewDatePpDateApproved');
    patchDateFunc('techDesignReviewDatePpDateRejectedOnUtc', 'techDesignReviewDatePpDateRejected');
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
    if (this.projectId && this.productId) {
      this._techDesignReviewDatePpService
        .getDataColumn(this.projectId, this.productId, ColumnType.TechDesignReviewDate)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this.updateForm(resp.data);
            this._storedData = resp.data;
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    } else {
      this._techDesignReviewDatePpService
        .getDataImportColumn(this.orderId, this.orderDetailId)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this.updateForm(resp.data);
            this._storedData = resp.data;
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
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
    if (this.checkFormValid() && this.leadEtaComponent.checkFormValid()) {
      let listDate = [
        'techDesignReviewDatePpDateApprovedOnUtc',
        'techDesignReviewDatePpDateRejectedOnUtc'
      ];
      this.myDatePickerService.addTimeToDateArray(this.frm, listDate);
      const modal = Object.assign({
        ...this._storedData,
        ...this.leadEtaComponent.getFormValue()
      }, this.frm.value);
      delete modal['formRequires'];
      if (this.projectId && this.productId) {
        this._techDesignReviewDatePpService
          .changeStatusColumn(this.projectId, this.productId,
            ColumnType.TechDesignReviewDate, modal)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              this.activeModal.close(resp);
              this._toastrService.success(resp.message, 'Success');
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      } else {
        this._techDesignReviewDatePpService
          .changeStatusImportColumn(this.orderId, this.orderDetailId, modal)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              this.activeModal.close(resp);
              this._toastrService.success(resp.message, 'Success');
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }
}
