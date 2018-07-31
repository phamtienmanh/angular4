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
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../shared/services/common';
import { ValidationService } from '../../../../shared/services/validation';
import { OrderInfoService } from '../../../+sales-order/+order-info';
import { OrderMainService } from '../../order-main.service';

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
  ResponseMessage
} from '../../../../shared/models';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';
import { ExtraValidators } from '../../../../shared/services/validation';
import {
  OrderInfoUploadedType
} from '../../../+sales-order/+order-info';
import {
  UploaderTypeComponent
} from '../../../../shared/modules/uploader-type';
import { UploadedFileModel } from '../../../+sales-order';
import { BasicResponse } from '../../../../shared/models';

@Component({
  selector: 'folder-ready',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'folder-ready.template.html',
  styleUrls: [
    'folder-ready.styles.scss'
  ]
})
export class FolderReadyComponent implements OnInit {
  @Input()
  public title = '';
  @Input()
  public orderId;
  @Input()
  public rowDetail;

  public statusData = Status.filter((stt) => stt.name === 'Created' || stt.name === 'Received');

  public frm: FormGroup;
  public formErrors = {
    folderReadyForLogisticsCreatedDateOnUtc: '',
    folderReadyForLogisticsReceivedDateOnUtc: ''
  };
  public validationMessages = {
    folderReadyForLogisticsCreatedDateOnUtc: {
      required: 'Created Date is required.',
      maxLength: 'Must be earlier than or equal to Received Date.'
    },
    folderReadyForLogisticsReceivedDateOnUtc: {
      required: 'Received Date is required.',
      maxLength: 'Must be later than or equal to Created Date.'
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
    sunHighlight: false,
    disableSince: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 1
    }
  };
  public folderReadyForLogisticsCreatedDateOptions = {...this.myDatePickerOptions};
  public folderReadyForLogisticsReceivedDateOptions = {
    ...this.myDatePickerOptions
  };
  public taskStatus = TaskStatus;
  public orderTypeData = [
    {
      id: OrderInfoUploadedType.CustomerPO,
      name: 'CustomerPO'
    },
    {
      id: OrderInfoUploadedType.Customer2PO,
      name: 'Customer2PO'
    }
  ];

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _modalService: NgbModal,
              private _orderInfoService: OrderInfoService,
              private _orderMainService: OrderMainService,
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
      folderReadyForLogisticsCreatedDate: new FormControl(''),
      folderReadyForLogisticsCreatedDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'folderReadyForLogisticsCreatedDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)' +
            '|([0-9]{2})\-([0-9]{2})\-([0-9]{4})$'),
          MaxDate('folderReadyForLogisticsReceivedDateOnUtc', 1),
          MaxDateToday
        ])
      ]),
      folderReadyForLogisticsReceivedDate: new FormControl(''),
      folderReadyForLogisticsReceivedDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group,
              'folderReadyForLogisticsReceivedDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)' +
            '|([0-9]{2})\-([0-9]{2})\-([0-9]{4})$'),
          MinDate('folderReadyForLogisticsCreatedDateOnUtc', 1),
          MaxDateToday
        ])
      ]),
      poFiles: new FormControl([]),
      formRequires: new FormControl({
        status: {
          required: true
        },
        folderReadyForLogisticsCreatedDateOnUtc: {
          required: false
        },
        folderReadyForLogisticsReceivedDateOnUtc: {
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
    patchDateFunc('folderReadyForLogisticsCreatedDateOnUtc', 'folderReadyForLogisticsCreatedDate');
    patchDateFunc('folderReadyForLogisticsReceivedDateOnUtc',
      'folderReadyForLogisticsReceivedDate');
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
        case 'folderReadyForLogisticsCreatedDateOnUtc':
          // Config for cancel date options
          this.folderReadyForLogisticsReceivedDateOptions = {
            ...this.folderReadyForLogisticsReceivedDateOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            disableSince: currentDate
          };
          this.folderReadyForLogisticsCreatedDateOptions = {
            ...this.folderReadyForLogisticsCreatedDateOptions,
            disableSince: currentDate
          };
          if (this.frm) {
            this.frm.get('folderReadyForLogisticsReceivedDateOnUtc').setValue(null);
            this.frm.get('folderReadyForLogisticsReceivedDate').setValue(null);
          }
          break;
        case 'folderReadyForLogisticsReceivedDateOnUtc':
          // Config for start date options
          this.folderReadyForLogisticsCreatedDateOptions = {
            ...this.folderReadyForLogisticsCreatedDateOptions,
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
      case 'folderReadyForLogisticsCreatedDateOnUtc':
        // Config for end date options
        this.folderReadyForLogisticsReceivedDateOptions = {
          ...this.folderReadyForLogisticsReceivedDateOptions,
          disableUntil: this.getMaxDate(currentDate, dateCurrentUntil),
          enableDays: [dateCurrentUntil]
        };
        break;
      case 'folderReadyForLogisticsReceivedDateOnUtc':
        // Config for start date options
        this.folderReadyForLogisticsCreatedDateOptions = {
          ...this.folderReadyForLogisticsCreatedDateOptions,
          disableSince: this.getMaxDate(currentDate, dateCurrentSince),
          enableDays: [dateCurrentSince]
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

  public updateForm(data: any): void {
    if (data) {
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
    if (key === 'folderReadyForLogisticsCreatedDateOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.CREATED
        || +frm.get('status').value === this.taskStatus.RECEIVED;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'folderReadyForLogisticsReceivedDateOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.RECEIVED;
      frm.get('formRequires').value[key].required = status;
      return status;
    }
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._orderMainService.getPoDocumentById(this.orderId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.frm.get('poFiles').setValue(resp.data);
          // this._toastrService.success(resp.message, 'Success');
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
  public onSelectValueChange(value: any, valueProp: string, formProp: string): void {
    // Ng Select return valid data with current value
    if (value[valueProp]) {
      this.frm.get(formProp).setValue(value[valueProp]);
    } else {
      // Ng Select return valid data with new value
      if (value.text) {
        this.frm.get(formProp).setValue(value.text);
      } else {
        // Ng Select return invalid data
        this.frm.get(formProp).setValue(value);
      }
    }

    // Update status for form control whose value changed
    this.frm.get(formProp).markAsDirty();
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

  public checkLengthUploaderByType(): boolean {
    return this.frm.get('poFiles').value.length > 0;
  }

  public openUploader(): void {
    const fileList = this.frm.get('poFiles').value.filter((i) => i.type === 0 || i.type === 1);
    let currentTypeList = Object.assign([], fileList);
    let modalRef = this._modalService.open(UploaderTypeComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static',
      windowClass: 'super-lg'
    });
    modalRef.componentInstance.selectTypeData = this.orderTypeData;
    Object.assign(modalRef.componentInstance.uploadOptions, {
      id: '',
      fileList: fileList.filter((i) => i)
    });
    modalRef.result.then((res) => {
      let isShowMsg = false;
      if (res.newList && res.newList.length) {
        this._orderInfoService.uploadFileToOrder(this.orderId, res.newList)
          .subscribe((resp: ResponseMessage<UploadedFileModel[]>) => {
            if (resp.status) {
              if (currentTypeList.length) {
                if (!isShowMsg) {
                  this._toastrService
                    .success(`Updated successfully.`, 'Success');
                  isShowMsg = true;
                }
              } else {
                this._toastrService
                  .success(`Uploaded successfully.`, 'Success');
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
                this.frm.get('poFiles').setValue([...currentTypeList]);
              });
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
      if (res.deletedList && res.deletedList.length) {
        this._orderInfoService.deleteUploadedFile(this.orderId, res.deletedList.map((i) => i.id))
          .subscribe((resp: BasicResponse) => {
            if (resp.status) {
              res.deletedList.forEach((item) => {
                let indexItem = currentTypeList.findIndex((i) => i.id === item.id);
                if (indexItem > -1) {
                  currentTypeList.splice(indexItem, 1);
                }
              });
              this.frm.get('poFiles').setValue([...currentTypeList]);

              if (currentTypeList.length === 0 && res.newList.length === 0) {
                this._toastrService
                  .success(`Removed successfully.`, 'Success');
              } else {
                if (!isShowMsg) {
                  this._toastrService
                    .success(`Updated successfully.`, 'Success');
                  isShowMsg = true;
                }
              }
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
      if (res.updateList && res.updateList.length) {
        this._orderInfoService.updateOrderFiles(this.orderId, res.updateList)
          .subscribe((resp: BasicResponse) => {
            if (resp.status) {
              if (!isShowMsg) {
                this._toastrService
                  .success(`Updated successfully.`, 'Success');
                isShowMsg = true;
              }
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
    }, (err) => {
      // empty
    });
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
      case this.taskStatus.CREATED:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'folderReadyForLogisticsCreatedDateOnUtc'
        ]);
        break;
      case this.taskStatus.RECEIVED:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'folderReadyForLogisticsCreatedDateOnUtc',
          'folderReadyForLogisticsReceivedDateOnUtc'
        ]);
        break;
      default:
        break;
    }
    return isValid;
  }

  public onSubmitForm(): void {
    if (this.checkFormValid()) {
      this.myDatePickerService.addTimeToDateArray(this.frm, [
        'folderReadyForLogisticsCreatedDateOnUtc',
        'folderReadyForLogisticsReceivedDateOnUtc'
      ]);
      this.activeModal.close({
        status: true,
        data: this.frm.value
      });
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }

  public onClosePopup(): void {
    this.activeModal.close({
      status: false,
      data: {
        isUploaded: this.checkLengthUploaderByType()
      }
    });
  }
}
