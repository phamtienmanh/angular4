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
  StyleService
} from '../../../+sales-order/+order-styles/+styles-info/+style/style.service';
import { OrderMainService } from '../../order-main.service';

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
  ResponseMessage
} from '../../../../shared/models';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';
import {
  StyleUploadedType
} from '../../../+sales-order/+order-styles/+styles-info/+style';
import {
  UploaderTypeComponent
} from '../../../../shared/modules/uploader-type';
import {
  UploadedFileModel,
  UploadedType
} from '../../../+sales-order';
import { BasicResponse } from '../../../../shared/models';

@Component({
  selector: 'qa',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'qa.template.html',
  styleUrls: [
    'qa.style.scss'
  ]
})
export class QaComponent implements OnInit {
  @Input()
  public title = '';
  @Input()
  public orderId;
  @Input()
  public styleId;
  @Input()
  public rowDetail;

  public statusData = Status.filter((stt) => [
    TaskStatus.PENDING,
    TaskStatus.PASS,
    TaskStatus.FAIL
  ].indexOf(stt.id) > -1);
  public frm: FormGroup;
  public formErrors = {
    auditorId: '',
    auditDateOnUtc: '',
    auditType: ''
  };
  public validationMessages = {
    auditorId: {
      required: 'Auditor is required.'
    },
    auditDateOnUtc: {
      required: 'Audit Date is required.'
    },
    auditType: {
      required: 'Audit Type is required.'
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
  public auditDateOptions: any = {...this.myDatePickerOptions};
  public auditorData: any[] = [];
  public styleUploadedType = StyleUploadedType;
  public uploadedType = UploadedType;
  public taskStatus = TaskStatus;

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _styleService: StyleService,
              private _modalService: NgbModal,
              private _orderMainService: OrderMainService,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    if (this.rowDetail &&
      (this.rowDetail.auditType !== 1 && this.rowDetail.auditType !== 2)) {
      this.rowDetail.auditType = 1;
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
      auditorId: new FormControl(null, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'auditorId'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      auditor: new FormControl(''),
      auditDate: new FormControl(''),
      auditDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      auditType: new FormControl(1, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      files: new FormControl([]),
      comment: new FormControl(''),
      isUploaded: new FormControl(''),
      formRequires: new FormControl({
        status: {
          required: true
        },
        auditorId: {
          required: false
        },
        auditDateOnUtc: {
          required: false
        },
        auditType: {
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
      'auditDateOnUtc',
      'auditType'
    ];
    if (key === 'firstCase') {
      let status = true;
      firstCaseList.forEach((cas) => status = status
        && +frm.get('status').value > 2);
      firstCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else if (key === 'auditorId') {
      let status = (+frm.get('status').value === this.taskStatus.PASS
        || +frm.get('status').value === this.taskStatus.FAIL)
        && (!frm.get(key).value || !frm.get(key).value.length);
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
    patchDateFunc('auditDateOnUtc', 'auditDate');
  }

  public updateForm(data: any): void {
    if (data) {
      this.frm.patchValue(data);
      this.frm.get('auditType').patchValue(this.frm.get('auditType').value.toString());
      this.setDateValue();
    }
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getQualityUsers()
      .subscribe((resp: ResponseMessage<any[]>) => {
        if (resp.status) {
          this.auditorData = resp.data;
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
        case 'auditDateOnUtc':
          // Config for done date options
          this.auditDateOptions = {
            ...this.auditDateOptions,
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
      case 'auditDateOnUtc':
        // Config for end date options
        this.auditDateOptions = {
          ...this.auditDateOptions,
          enableDays: [],
          disableSince: currentDate
        };
        break;
      default:
        break;
    }
  }

  public openUploader(type: number): void {
    const funcUpload = (fileList) => {
      let currentTypeList = Object.assign([], fileList);
      let modalRef = this._modalService.open(UploaderTypeComponent, {
        size: 'lg',
        keyboard: false,
        backdrop: 'static',
        windowClass: 'super-lg'
      });
      modalRef.componentInstance.title = 'QA';
      Object.assign(modalRef.componentInstance.uploadOptions, {
        id: this.styleId,
        uploadType: this.uploadedType.QA,
        fileList: fileList.filter((i) => i),
        fileType: type
      });

      modalRef.result.then((res) => {
        if (res.status) {
          let isShowMsg = false;
          let currentFiles = this.frm.get('files').value.filter((i) => i.type !== type);
          if (res.newList && res.newList.length) {
            this._styleService.uploadFileToStyle(this.styleId, res.newList)
              .subscribe((resp: ResponseMessage<UploadedFileModel[]>) => {
                if (resp.status) {
                  if (currentTypeList.length) {
                    if (!isShowMsg) {
                      this._toastrService
                        .success(`QA file(s) updated successfully.`,
                          'Success');
                      isShowMsg = true;
                    }
                  } else {
                    this.frm.get('isUploaded').patchValue(true);
                    this._toastrService
                      .success(`QA file(s) uploaded successfully.`,
                        'Success');
                  }

                  if (res.duplicatedList && res.duplicatedList.length) {
                    res.duplicatedList.forEach((i) => {
                      if (currentTypeList.indexOf(i) > -1) {
                        currentTypeList.splice(currentTypeList.indexOf(i), 1);
                      }
                    });
                  }
                  resp.data.forEach((item) => {
                    currentTypeList.push(item);
                    this.frm.get('files').setValue([
                      ...currentFiles,
                      ...currentTypeList
                    ]);
                  });
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
          }
          if (res.deletedList && res.deletedList.length) {
            this._styleService
              .deleteUploadedStyleFile(this.styleId,
                res.deletedList.map((i) => i.id))
              .subscribe((resp: BasicResponse) => {
                if (resp.status) {
                  res.deletedList.forEach((item) => {
                    let indexItem = currentTypeList.findIndex((i) => i.id === item.id);
                    if (indexItem > -1) {
                      currentTypeList.splice(indexItem, 1);
                    }
                  });
                  this.frm.get('files').setValue([
                    ...currentFiles,
                    ...currentTypeList
                  ]);

                  if (currentTypeList.length === 0 && res.newList.length === 0) {
                    this.frm.get('isUploaded').patchValue(false);
                    this._toastrService
                      .success(`QA file(s) removed successfully.`,
                        'Success');
                  } else {
                    if (!isShowMsg) {
                      this._toastrService
                        .success(`QA file(s) updated successfully.`,
                          'Success');
                      isShowMsg = true;
                    }
                  }
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
          }
          if (res.updateList && res.updateList.length) {
            this._styleService.updateStyleFiles(this.styleId, res.updateList)
              .subscribe((resp: BasicResponse) => {
                if (resp.status) {
                  if (!isShowMsg) {
                    this._toastrService
                      .success(`QA file(s) updated successfully.`,
                        'Success');
                    isShowMsg = true;
                  }
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
          }
        }
      }, (err) => {
        // empty
      });
    };
    if ((this.frm.get('files').value && this.frm.get('files').value.length)
      || !this.checkLengthUploaderByType()) {
      const fileList = this.frm.get('files').value.filter((i) => i.type === type);
      funcUpload(fileList);
    } else {
      this._orderMainService.getStyleFilesById(this.styleId)
        .subscribe((response: ResponseMessage<any>) => {
          if (response.status) {
            this.frm.get('files').patchValue(response.data);
            const fileList = this.frm.get('files').value.filter((i) => i.type === type);
            funcUpload(fileList);
          }
        });
    }
  }

  public checkLengthUploaderByType(): boolean {
    return this.frm.get('isUploaded').value;
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
      case this.taskStatus.PENDING:
        return true;
      default:
        isValid = isValid && this.frm.valid;
        break;
    }
    return isValid;
  }

  public onSubmitForm(): void {
    if (this.checkFormValid()) {
      this.frm.get('auditType').patchValue(+this.frm.get('auditType').value);
      this.myDatePickerService.addTimeToDateArray(this.frm, ['auditDateOnUtc']);
      this.activeModal.close(this.frm.value);
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }
}
