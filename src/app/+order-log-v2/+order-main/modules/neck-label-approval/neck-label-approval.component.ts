import {
  Component,
  Input,
  OnDestroy,
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

import {
  IMyDate,
  IMyDateModel
} from 'mydatepicker';

// Services
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../shared/services/common';
import { ValidationService } from '../../../../shared/services/validation';
import { LocalStorageService } from 'angular-2-local-storage';
import { ExtraValidators } from '../../../../shared/services/validation';

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
import { UploaderTypeComponent } from '../../../../shared/modules/uploader-type';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';

enum UploadedType {
  ArtReceived = 0,
  ArtApproved = 1
}

@Component({
  selector: 'neck-label-approval',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'neck-label-approval.template.html',
  styleUrls: [
    'neck-label-approval.styles.scss'
  ]
})
export class NeckLabelApprovalComponent implements OnInit, OnDestroy {
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
    approvalTypes: '',
    neckLabelApprovalApprovedDateOnUtc: '',
    neckLabelApprovalScheduledFromDateOnUtc: '',
    neckLabelApprovalScheduledToDateOnUtc: ''
  };
  public validationMessages = {
    approvalTypes: {
      required: 'Approval Type is required.'
    },
    neckLabelApprovalApprovedDateOnUtc: {
      required: 'Neck Label Approval Date is required.'
    },
    neckLabelApprovalScheduledFromDateOnUtc: {
      required: 'Neck Label Approval Date is required.',
      maxLength: 'Must be earlier than Start End.'
    },
    neckLabelApprovalScheduledToDateOnUtc: {
      required: 'Neck Label Approval Date is required.',
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
  public neckLabelApprovalApprovedDateOptions: any = {...this.myDatePickerOptions};
  public neckLabelApprovalScheduledDateFromOptions: any = {...this.myDatePickerOptions};
  public neckLabelApprovalScheduledDateToOptions: any = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public uploadedType = UploadedType;
  public approvalProcessDataOrigin: BasicGeneralInfo[];
  public taskStatus = TaskStatus;
  public serviceDataOrigin: BasicGeneralInfo[];

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _localStorageService: LocalStorageService,
              private _modalService: NgbModal,
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
      isReRun: new FormControl(null),
      approvalTypes: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'approvalTypes'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      neckLabelApprovalApprovedDate: new FormControl(''),
      neckLabelApprovalApprovedDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'neckLabelApprovalApprovedDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      neckLabelApprovalScheduledDateFrom: new FormControl(''),
      neckLabelApprovalScheduledFromDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'neckLabelApprovalScheduledFromDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('neckLabelApprovalScheduledToDateOnUtc')
        ])
      ]),
      neckLabelApprovalScheduledDateTo: new FormControl(''),
      neckLabelApprovalScheduledToDateOnUtc: new FormControl('',
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('neckLabelApprovalScheduledFromDateOnUtc')
        ])
      ),
      trimFiles: new FormControl([]),
      formRequires: new FormControl({
        status: {
          required: true
        },
        approvalTypes: {
          required: false
        },
        neckLabelApprovalApprovedDateOnUtc: {
          required: false
        },
        neckLabelApprovalScheduledFromDateOnUtc: {
          required: false
        },
        neckLabelApprovalScheduledToDateOnUtc: {
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
    patchDateFunc('neckLabelApprovalApprovedDateOnUtc', 'neckLabelApprovalApprovedDate');
    patchDateFunc('neckLabelApprovalScheduledFromDateOnUtc',
      'neckLabelApprovalScheduledDateFrom');
    patchDateFunc('neckLabelApprovalScheduledToDateOnUtc', 'neckLabelApprovalScheduledDateTo');
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
    this._commonService.getApprovalTypeList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.approvalProcessDataOrigin = resp.data;
          setTimeout(() => {
            if (this.approvalProcessDataOrigin && this.approvalProcessDataOrigin.length) {
              let activatedValue = [];
              let value = this.rowDetail.approvalTypes;
              if (value) {
                value.forEach((item) => {
                  activatedValue.push(this.approvalProcessDataOrigin.find((s) => s.name === item));
                });
              }
            }
          });
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    // this._commonService.getServiceCode()
    //   .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
    //     if (resp.status) {
    //       this.serviceDataOrigin = resp.data;
    //     } else {
    //       this._toastrService.error(resp.errorMessages, 'Error');
    //     }
    //   });
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
        case 'neckLabelApprovalScheduledFromDateOnUtc':
          // Config for cancel date options
          this.neckLabelApprovalScheduledDateToOptions = {
            ...this.neckLabelApprovalScheduledDateToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            componentDisabled: true
          };
          this.neckLabelApprovalScheduledDateFromOptions = {
            ...this.neckLabelApprovalScheduledDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          if (this.frm) {
            this.frm.get('neckLabelApprovalScheduledToDateOnUtc').setValue(null);
            this.frm.get('neckLabelApprovalScheduledDateTo').setValue(null);
          }
          break;
        case 'neckLabelApprovalScheduledToDateOnUtc':
          // Config for start date options
          this.neckLabelApprovalScheduledDateFromOptions = {
            ...this.neckLabelApprovalScheduledDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          break;
        case 'neckLabelApprovalApprovedDateOnUtc':
          // Config for cancel date options
          this.neckLabelApprovalApprovedDateOptions = {
            ...this.neckLabelApprovalApprovedDateOptions,
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
      case 'neckLabelApprovalScheduledFromDateOnUtc':
        // Config for end date options
        this.neckLabelApprovalScheduledDateToOptions = {
          ...this.neckLabelApprovalScheduledDateToOptions,
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
      case 'neckLabelApprovalScheduledToDateOnUtc':
        // Config for start date options
        this.neckLabelApprovalScheduledDateFromOptions = {
          ...this.neckLabelApprovalScheduledDateFromOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        break;
      case 'neckLabelApprovalApprovedDateOnUtc':
        // Config for cancel date options
        this.neckLabelApprovalApprovedDateOptions = {
          ...this.neckLabelApprovalApprovedDateOptions,
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

  public checkLengthUploaderByType(type: number): boolean {
    return this.frm.get('trimFiles').value.some((i) => i.type === type);
  }

  public openUploader(type: number, formProp?: string): void {
    this.backupData();
    if (formProp && !this.frm.get(formProp).value) {
      this.frm.get(formProp).setErrors({required: true});
      this.frm.get(formProp).markAsDirty();
      if (!this.checkLengthUploaderByType(type)) {
        return;
      }
    }
    const fileList = this.frm.get('trimFiles').value.filter((i) => i.type === type);
    let currentTypeList = Object.assign([], fileList);
    let modalRef = this._modalService.open(UploaderTypeComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static',
      windowClass: 'super-lg'
    });
    modalRef.componentInstance.title = 'Art Approved';
    Object.assign(modalRef.componentInstance.uploadOptions, {
      id: '',
      uploadType: this.uploadedType.ArtApproved,
      fileList: fileList.filter((i) => i),
      fileType: type
    });
    modalRef.result.then((res) => {
      // empty
    }, (err) => {
      // empty
    });
  }

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    let artReceivedRequire = this.checkLengthUploaderByType(this.uploadedType.ArtReceived);
    let artApprovedRequire = this.checkLengthUploaderByType(this.uploadedType.ArtApproved);
    if (key === 'firstCase') {
      frm.get('formRequires').value['artReceivedDateOnUtc'].required = artReceivedRequire;
      return artReceivedRequire;
    } else if (key === 'secondCase') {
      frm.get('formRequires').value['dateOnUtc'].required = artApprovedRequire;
      return artApprovedRequire;
    } else if (key === 'neckLabelApprovalApprovedDateOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.APPROVED;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'approvalTypes') {
      let status = +frm.get('status').value === this.taskStatus.SCHEDULED
        || +frm.get('status').value === this.taskStatus.APPROVED;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'neckLabelApprovalScheduledFromDateOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.SCHEDULED;
      frm.get('formRequires').value[key].required = status;
      return status;
    }
  }

  public backupData(): void {
    let data = Object.assign({}, this.frm.value);
    this._localStorageService.set('backupData', data);
  }

  public revertData(isEdit: boolean): void {
    if (!isEdit) {
      // Assign init value because this properties become null after reset
      this.buildForm();
      return;
    }
    this.frm.patchValue(this._localStorageService.get('backupData'));
    this.backupData();
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
          'approvalTypes',
          'neckLabelApprovalScheduledFromDateOnUtc',
          'neckLabelApprovalScheduledToDateOnUtc'
        ]);
        break;
      case this.taskStatus.APPROVED:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'approvalTypes',
          'neckLabelApprovalApprovedDateOnUtc'
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
          'neckLabelApprovalApprovedDateOnUtc'
        ];
      }
      this.myDatePickerService.addTimeToDateArray(this.frm, listDate);
      const formValue = this.frm.getRawValue();
      delete formValue['formRequires'];
      this.activeModal.close(formValue);
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }

  public ngOnDestroy(): void {
    this._localStorageService.remove('backupData');
  }
}
