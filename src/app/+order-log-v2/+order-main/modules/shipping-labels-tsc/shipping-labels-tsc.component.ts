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
  ShippingLabelsTscService
} from './shipping-labels-tsc.service';

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
  StyleService
} from '../../../+sales-order/+order-styles/+styles-info/+style/style.service';

// Validators
import {
  MaxDateToday
} from '../../../../shared/validators';

// Interfaces
import {
  Status,
  TaskStatus
} from '../../../+outsource-main/outsource-main.model';
import {
  BasicResponse,
  ResponseMessage
} from '../../../../shared/models';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';
import {
  ExtraValidators
} from '../../../../shared/services/validation';
import { UploadedFileModel } from '../../../+sales-order/sales-order.model';
import { UploaderTypeComponent } from '../../../../shared/modules/uploader-type';
import { UploadedType } from '../../../+sales-order';
import { StyleUploadedType } from '../../../+sales-order/+order-styles/+styles-info/+style';

@Component({
  selector: 'shipping-labels-tsc',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'shipping-labels-tsc.template.html',
  styleUrls: [
    // 'shipping-labels-tsc.style.scss'
  ]
})
export class ShippingLabelsTscComponent implements OnInit {
  @Input()
  public orderId;
  @Input()
  public orderDetailId;
  @Input()
  public isPageReadOnly = false;
  @Input()
  public rowDetail;

  public statusData = Status.filter((stt) => stt.name === 'Done');

  public frm: FormGroup;
  public formErrors = {
    shippingLabelsTscPackingListOnUtc: ''
  };
  public validationMessages = {
    shippingLabelsTscPackingListOnUtc: {},
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
  public uploadedType = UploadedType;
  public styleUploadedType = StyleUploadedType;

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _styleService: StyleService,
              private _modalService: NgbModal,
              private _shippingLabelsTscService: ShippingLabelsTscService,
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
      shippingLabelsTscPackingListStatus: new FormControl(null, [Validators.required]),
      shippingLabelsTscPackingList: new FormControl(''),
      shippingLabelsTscPackingListOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'shippingLabelsTscPackingListOnUtc'),
            Validators.required
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      styleFiles: new FormControl([]),
      formRequires: new FormControl({
        shippingLabelsTscPackingListStatus: {
          required: true
        },
        shippingLabelsTscPackingListOnUtc: {
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
    if (key === 'shippingLabelsTscPackingListOnUtc') {
      let isRequired = [
        this.taskStatus.DONE
      ].indexOf(+this.frm.get('shippingLabelsTscPackingListStatus').value) > -1;
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
    patchDateFunc('shippingLabelsTscPackingListOnUtc', 'shippingLabelsTscPackingList');
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
    this._styleService.getStyleFiles(this.orderDetailId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.frm.get('styleFiles').setValue(resp.data);
          // this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    // this._shippingLabelsTscService.getDataColumn(this.orderId, this.orderDetailId)
    //   .subscribe((resp: ResponseMessage<any>) => {
    //     if (resp.status) {
    //       this.updateForm(resp.data);
    //     } else {
    //       this._toastrService.error(resp.errorMessages, 'Error');
    //     }
    //   });
  }

  public checkLengthUploaderByType(frm, type): boolean {
    return frm.get('styleFiles').value
      .some((i) => i.type === type);
  }

  public openUploader(frm, type, typeName): void {
    const fileList = frm.get('styleFiles').value
      .filter((i) => i.type === type);
    let currentTypeList = Object.assign([], fileList);
    let modalRef = this._modalService.open(UploaderTypeComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static',
      windowClass: 'super-lg'
    });
    // modalRef.componentInstance.selectTypeData = this.styleTypeData;
    modalRef.componentInstance.title = typeName;
    Object.assign(modalRef.componentInstance.uploadOptions, {
      id: '',
      fileList: fileList.filter((i) => i),
      uploadType: type === this.styleUploadedType.ShippingLabels
        ? this.uploadedType.ShippingLabels : this.uploadedType.TscPackingList,
      fileType: type,
      isReadOnly: this.isPageReadOnly
    });
    modalRef.result.then((res) => {
      if (res.status) {
        let isShowMsg = false;
        let currentFiles = frm.get('styleFiles').value
          .filter((i) => i.type !== type) || [];
        if (res.newList && res.newList.length) {
          this._styleService.uploadFileToStyle(this.orderDetailId, res.newList)
            .subscribe((resp: ResponseMessage<UploadedFileModel[]>) => {
              if (resp.status) {
                if (currentTypeList.length) {
                  if (!isShowMsg) {
                    this._toastrService
                      .success(`${typeName} updated successfully.`, 'Success');
                    isShowMsg = true;
                  }
                } else {
                  this._toastrService
                    .success(`${typeName} uploaded successfully.`, 'Success');
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
                  frm.get('styleFiles').setValue([...currentFiles, ...currentTypeList]);
                });
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
        if (res.deletedList && res.deletedList.length) {
          this._styleService
            .deleteUploadedStyleFile(this.orderDetailId, res.deletedList.map((i) => i.id))
            .subscribe((resp: BasicResponse) => {
              if (resp.status) {
                res.deletedList.forEach((item) => {
                  let indexItem = currentTypeList.findIndex((i) => i.id === item.id);
                  if (indexItem > -1) {
                    currentTypeList.splice(indexItem, 1);
                  }
                });
                frm.get('styleFiles').setValue([...currentFiles, ...currentTypeList]);

                if (currentTypeList.length === 0 && res.newList.length === 0) {
                  this._toastrService
                    .success(`${typeName} removed successfully.`, 'Success');
                } else {
                  if (!isShowMsg) {
                    this._toastrService
                      .success(`${typeName} updated successfully.`, 'Success');
                    isShowMsg = true;
                  }
                }
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
        if (res.updateList && res.updateList.length) {
          this._styleService.updateStyleFiles(this.orderDetailId, res.updateList)
            .subscribe((resp: BasicResponse) => {
              if (resp.status) {
                if (!isShowMsg) {
                  this._toastrService
                    .success(`${typeName} updated successfully.`, 'Success');
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
    if (this.checkFormValid()) {
      let listDate = [
        'shippingLabelsTscPackingListOnUtc'
      ];
      this.myDatePickerService.addTimeToDateArray(this.frm, listDate);
      const modal = this.frm.getRawValue();
      delete modal['formRequires'];
      this.activeModal.close({
        status: true,
        data: {
          ...modal
        }
      });
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }

  public onClosePopup(): void {
    this.activeModal.close({
      status: false,
      data: {
        isUploaded: this.frm.get('styleFiles').value
        && this.frm.get('styleFiles').value
          .filter((i) => [
            this.styleUploadedType.ShippingLabels,
            this.styleUploadedType.TscPackingList
          ].indexOf(i.type) > -1).length > 0
      }
    });
  }
}
