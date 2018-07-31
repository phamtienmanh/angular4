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
  NgbActiveModal,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

import {
  IMyDate,
  IMyDateModel
} from 'mydatepicker';

import {
  PpSampleDueService
} from './pp-sample-due.service';

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
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';
import {
  ExtraValidators
} from '../../../../shared/services/validation';

// Validators
import {
  MaxDateToday
} from '../../../../shared/validators';

// Interfaces
import {
  Status,
  TaskStatus
} from '../../imports-main.model';
import {
  ResponseMessage,
  UploadedType
} from '../../../../shared/models';
import {
  LeadEtaComponent
} from '../index';
import { UploaderTypeComponent } from '../../../../shared/modules/uploader-type';

@Component({
  selector: 'pp-sample-due',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'pp-sample-due.template.html',
  styleUrls: [
    'pp-sample-due.style.scss'
  ]
})
export class PpSampleDueComponent implements OnInit {
  @Input()
  public isPageReadOnly = false;
  @Input()
  public rowDetail;
  @Input()
  public orderId;
  @Input()
  public orderDetailId;
  @Input()
  public ppSampleId;

  @ViewChild(LeadEtaComponent)
  public leadEtaComponent: LeadEtaComponent;

  public statusData = Status.filter((stt) => [
    'Approved',
    'Approved w/ Changes',
    'Rejected',
    'Dropped'
  ].indexOf(stt.name) > -1);

  public frm: FormGroup;
  public formErrors = {
    techDesignDateReceivedOnUtc: '',
    approvalDateOnUtc: '',
    rejectedDateOnUtc: '',
    droppedDateOnUtc: '',
    approvalByUserId: ''
  };
  public validationMessages = {
    techDesignDateReceivedOnUtc: {},
    approvalDateOnUtc: {},
    rejectedDateOnUtc: {},
    droppedDateOnUtc: {},
    approvalByUserId: {},
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
  public approvalByList = [];
  public uploadedType = UploadedType;
  private _storedData;

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _modalService: NgbModal,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _ppSampleDueService: PpSampleDueService,
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
      approvalStatus: new FormControl(null),
      approvalDate: new FormControl(''),
      approvalDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional((group) =>
              this.getSpecialRequireCase(group, 'approvalDateOnUtc'),
            Validators.required
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      rejectedDate: new FormControl(''),
      rejectedDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional((group) =>
              this.getSpecialRequireCase(group, 'rejectedDateOnUtc'),
            Validators.required
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      droppedDate: new FormControl(''),
      droppedDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional((group) =>
              this.getSpecialRequireCase(group, 'droppedDateOnUtc'),
            Validators.required
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      comment: new FormControl(''),
      techDesignDateReceived: new FormControl(''),
      techDesignDateReceivedOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      files: new FormControl([]),
      approvalByUserId: new FormControl(null),
      approvalByUserName: new FormControl(''),
      formRequires: new FormControl({
        techDesignDateReceivedOnUtc: {
          required: false
        },
        approvalStatus: {
          required: false
        },
        approvalDateOnUtc: {
          required: false
        },
        rejectedDateOnUtc: {
          required: false
        },
        droppedDateOnUtc: {
          required: false
        },
        approvalByUserId: {
          required: false
        },
        comment: {
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
    if (key === 'approvalDateOnUtc') {
      let isRequired = [
        this.taskStatus.APPROVED,
        this.taskStatus.APPROVEDWCHANGES
      ].indexOf(+this.frm.get('approvalStatus').value) > -1;
      frm.get('formRequires').value[key].required = isRequired;
      return isRequired;
    } else if (key === 'rejectedDateOnUtc') {
      let isRequired = [
        this.taskStatus.REJECTED
      ].indexOf(+this.frm.get('approvalStatus').value) > -1;
      frm.get('formRequires').value[key].required = isRequired;
      return isRequired;
    } else if (key === 'droppedDateOnUtc') {
      let isRequired = [
        this.taskStatus.DROPPED
      ].indexOf(+this.frm.get('approvalStatus').value) > -1;
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
    patchDateFunc('approvalDateOnUtc',
      'approvalDate');
    patchDateFunc('rejectedDateOnUtc',
      'rejectedDate');
    patchDateFunc('droppedDateOnUtc',
      'droppedDate');
    patchDateFunc('techDesignDateReceivedOnUtc',
      'techDesignDateReceived');
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
    this._commonService.getImportsDeptList()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.approvalByList = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._ppSampleDueService
      .getDataColumn(this.orderId, this.orderDetailId)
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

  public openUploader(frm: FormGroup, type: number): void {
    const funcUpload = (fileList: any[]) => {
      let modalRef = this._modalService.open(UploaderTypeComponent, {
        size: 'lg',
        keyboard: false,
        backdrop: 'static',
        windowClass: 'super-lg'
      });
      modalRef.componentInstance.title = 'PP Sample';
      Object.assign(modalRef.componentInstance.uploadOptions, {
        id: this.orderDetailId,
        fileList,
        uploadType: type,
        fileType: type,
        isReadOnly: this.isPageReadOnly
      });

      modalRef.result.then((res) => {
        if (res.status) {
          let isShownMsg = false;
          if (res.deletedList && res.deletedList.length) {
            let currentTypeList = frm.get('files').value;
            res.deletedList.forEach((item) => {
              let indexItem = currentTypeList.findIndex((i) => i.id === item.id);
              if (indexItem > -1) {
                currentTypeList.splice(indexItem, 1);
              }
            });
            if (currentTypeList.length === 0 && res.newList.length === 0) {
              isShownMsg = true;
              this._toastrService
                .success(`PP Sample files removed successfully.`, 'Success');
            }

            frm.get('files').setValue([...currentTypeList]);
          }
          if (res.updateList && res.updateList.length) {
            let currentTypeList = frm.get('files').value;
            res.updateList.forEach((item) => {
              let indexItem = currentTypeList.findIndex((i) => i.fileName === item.fileName);
              if (indexItem > -1) {
                currentTypeList[indexItem] = item;
              }
            });

            frm.get('files').setValue([...currentTypeList]);
          }
          if (res.newList && res.newList.length) {
            let currentTypeList = frm.get('files').value;
            if (!currentTypeList.length) {
              isShownMsg = true;
              this._toastrService
                .success(`PP Sample files uploaded successfully.`, 'Success');
            }

            if (res.duplicatedList && res.duplicatedList.length) {
              res.duplicatedList.forEach((i) => {
                if (currentTypeList.indexOf(i) > -1) {
                  currentTypeList.splice(currentTypeList.indexOf(i), 1);
                }
              });
            }
            frm.get('files').setValue([...currentTypeList, ...res.newList]);
          }

          if (!isShownMsg) {
            this._toastrService
              .success(`Updated successfully.`, 'Success');
          }
        }
      }, (err) => {
        // empty
      });
    };
    // const fileList = frm.get('files').value.filter((i) => i.type === type);
    const fileList = frm.get('files').value;
    funcUpload(fileList);
  }

  public checkLengthUploaderByType(frm: any, type: number): boolean {
    return frm.get('files').value && frm.get('files').value.length;
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
        'approvalDateOnUtc',
        'rejectedDateOnUtc',
        'droppedDateOnUtc',
        'techDesignDateReceivedOnUtc'
      ];
      this.myDatePickerService.addTimeToDateArray(this.frm, listDate);
      const modal = Object.assign({
        ...this._storedData,
        ...this.leadEtaComponent.getFormValue()
      }, this.frm.value);
      delete modal['formRequires'];
      this._ppSampleDueService
        .changeStatusColumn(this.orderId, this.orderDetailId, modal)
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
