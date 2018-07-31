import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  FormBuilder,
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
import { OrderMainService } from '../../order-main.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../shared/services/common';
import { ValidationService } from '../../../../shared/services/validation';
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
} from '../../order-main.model';
import {
  ResponseMessage,
  BasicResponse
} from '../../../../shared/models';
import { UploaderTypeComponent } from '../../../../shared/modules/uploader-type';
import {
  UploadedFileModel,
  UploadedType
} from '../../../+sales-order';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';
import { ExtraValidators } from '../../../../shared/services/validation';
import { ItemTypes } from '../../../+sales-order/+order-styles/order-styles.model';
import {
  StyleUploadedType
} from '../../../+sales-order/+order-styles/+styles-info/+style';

@Component({
  selector: 'teck-pack-ready',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'teck-pack-ready.template.html',
  styleUrls: [
    'teck-pack-ready.style.scss'
  ]
})
export class TeckPackReadyComponent implements OnInit {
  @Input()
  public title = '';
  @Input()
  public orderId;
  @Input()
  public orderDetailId;
  @Input()
  public rowDetail;
  @Input()
  public styleList;

  public statusData = Status.filter((stt) => [
    TaskStatus.BLANK,
    TaskStatus.DONE
  ].indexOf(stt.id) > -1);

  public frm: FormGroup;
  public formErrors = {
    techPackReadyDateOnUtc: ''
  };
  public validationMessages = {
    techPackReadyDateOnUtc: {
      required: 'Tech Pack Ready Date is required.',
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
    sunHighlight: false,
    disableSince: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 1
    }
  };
  public styleUploadedType = StyleUploadedType;
  public uploadedType = UploadedType;
  public taskStatus = TaskStatus;
  public orderTypeData = [
    {
      id: StyleUploadedType.OrderWorkSheets,
      name: 'OrderWorkSheets'
    },
    {
      id: StyleUploadedType.TechPacks,
      name: 'TechPacks'
    }
  ];

  constructor(public activeModal: NgbActiveModal,
              private _el: ElementRef,
              private _fb: FormBuilder,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _styleService: StyleService,
              private _orderMainService: OrderMainService,
              private _modalService: NgbModal,
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
      orderDetailId: new FormControl(this.orderDetailId),
      techPackReadyDate: new FormControl(''),
      techPackReadyDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'techPackReadyDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      styleFiles: new FormControl([]),
      isUploaded: new FormControl(false),
      applyToStyles: new FormControl([]),
      techPackApplyToStyles: new FormControl([]),
      formRequires: new FormControl({
        status: {
          required: true
        },
        techPackReadyDateOnUtc: {
          required: false
        }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);
  }

  // public get listOwsTp(): FormArray {
  //   return this.frm.get('listOwsTp') as FormArray;
  // }
  //
  // public addOwsTp(): void {
  //   this.listOwsTp.push(this._validationService.buildForm({
  //     status: new FormControl('', [Validators.required]),
  //     techPackReadyDate: new FormControl(''),
  //     techPackReadyDateOnUtc: new FormControl('', [
  //       Validators.compose([
  //         ExtraValidators.conditional(
  //           (group) => this.getSpecialRequireCase(group, 'techPackReadyDateOnUtc'),
  //           Validators.compose([
  //             Validators.required
  //           ])
  //         ),
  //         Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
  //           '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
  //         MaxDateToday
  //       ])
  //     ]),
  //     styleFiles: new FormControl([]),
  //     techPackApplyToStyles: new FormControl([]),
  //     formRequires: new FormControl({
  //       status: {
  //         required: true
  //       },
  //       techPackReadyDateOnUtc: {
  //         required: false
  //       }
  //     })
  //   }, this.formErrors, this.validationMessages));
  //   // (re)set validation messages now
  //   this.onValueChanged(this.listOwsTp.controls[this.listOwsTp.controls.length - 1]);
  //   // (re)set validation by getSpecialRequireCase func
  //   const frm: any = this.listOwsTp.controls[this.listOwsTp.controls.length - 1];
  //   for (const field of Object.keys(frm.controls)) {
  //     frm.get(field).updateValueAndValidity();
  //   }
  // }
  //
  // public setOwsTp(listOwsTp): void {
  //   let controlFGs = listOwsTp.map((owsTp) => this._validationService.buildForm({
  //     status: new FormControl(owsTp.status, [Validators.required]),
  //     techPackReadyDate: new FormControl(''),
  //     techPackReadyDateOnUtc: new FormControl(owsTp.techPackReadyDateOnUtc, [
  //       Validators.compose([
  //         ExtraValidators.conditional(
  //           (group) => this.getSpecialRequireCase(group, 'techPackReadyDateOnUtc'),
  //           Validators.compose([
  //             Validators.required
  //           ])
  //         ),
  //         Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
  //           '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
  //         MaxDateToday
  //       ])
  //     ]),
  //     styleFiles: new FormControl(owsTp.styleFiles),
  //     techPackApplyToStyles: new FormControl(owsTp.techPackApplyToStyles || []),
  //     formRequires: new FormControl({
  //       status: {
  //         required: true
  //       },
  //       techPackReadyDateOnUtc: {
  //         required: false
  //       }
  //     })
  //   }, this.formErrors, this.validationMessages));
  //   const controlArray = this._fb.array(controlFGs);
  //   this.frm.setControl('listOwsTp', controlArray);
  //
  //   this.listOwsTp.controls.forEach((shipment) => {
  //     this.onValueChanged(shipment); // (re)set validation messages now
  //   });
  // }
  //
  // public deleteOwsTp(index: number): void {
  //   if (this.listOwsTp.length < 2) {
  //     return;
  //   }
  //   this.listOwsTp.removeAt(index);
  // }

  public onValueChanged(form: any): void {
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

  public setDateValue(frm): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (frm.get(importName).value) {
        const utcDate = new Date(frm.get(importName).value);
        let currentDate = new Date(Date.UTC(utcDate.getFullYear(),
          utcDate.getMonth(), utcDate.getDate(), utcDate.getHours(), utcDate.getMinutes()));
        frm.get(exportName).setValue({
          date: {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            day: currentDate.getDate()
          }
        });
      } else {
        frm.get(importName).patchValue(null);
        frm.get(exportName).patchValue(null);
      }
    };
    patchDateFunc('techPackReadyDateOnUtc', 'techPackReadyDate');
  }

  public updateForm(data: any): void {
    // this.setOwsTp(data);
    this.frm.patchValue(data);
    this.frm.get('techPackApplyToStyles').patchValue(this.frm.get('applyToStyles').value);
    if (this.frm.get('techPackApplyToStyles').value
      .indexOf(this.orderDetailId) === -1) {
      let styleIds = this.frm.get('techPackApplyToStyles').value;
      styleIds.push(this.orderDetailId);
      this.frm.get('techPackApplyToStyles').patchValue(styleIds);
    }
    this.setDateValue(this.frm);
  }

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    if (key === 'techPackReadyDateOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.DONE;
      frm.get('formRequires').value[key].required = status;
      return status;
    }
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._styleService.getOwsStyleFiles(this.orderDetailId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.frm.get('styleFiles').setValue(resp.data);
          // this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * Fire date change event
   * @param event
   */
  public onDateChangedBy(event: IMyDateModel, frm, prop: string): void {
    let utcDate = Object.assign({}, event);
    frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');

    // Update status for form control whose value changed
    frm.get(prop).markAsDirty();
  }

  public checkLengthUploaderByType(frm): boolean {
    return frm.get('styleFiles').value
      .some((i) => i.type === this.styleUploadedType.OrderWorkSheets
        || i.type === this.styleUploadedType.TechPacks);
  }

  public openUploader(frm): void {
    const fileList = frm.get('styleFiles').value
      .filter((i) => i.type === this.styleUploadedType.OrderWorkSheets
        || i.type === this.styleUploadedType.TechPacks);
    let currentTypeList = Object.assign([], fileList);
    let modalRef = this._modalService.open(UploaderTypeComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static',
      windowClass: 'super-lg'
    });
    this._el.nativeElement.className = 'hide';
    modalRef.componentInstance.selectTypeData = this.orderTypeData;
    Object.assign(modalRef.componentInstance.uploadOptions, {
      id: '',
      fileList: fileList.filter((i) => i)
    });
    modalRef.result.then((res) => {
      this._el.nativeElement.className = '';
      if (res.status) {
        let isShowMsg = false;
        let currentFiles = frm.get('styleFiles').value
          .filter((i) => i.type !== this.styleUploadedType.OrderWorkSheets
            && i.type !== this.styleUploadedType.TechPacks) || [];
        if (res.newList && res.newList.length) {
          this._styleService.uploadOwsStyleFiles(this.orderDetailId, res.newList)
            .subscribe((resp: ResponseMessage<UploadedFileModel[]>) => {
              if (resp.status) {
                if (currentTypeList.length) {
                  if (!isShowMsg) {
                    this._toastrService
                      .success(`OWS / Tech Pack(s) updated successfully.`, 'Success');
                    isShowMsg = true;
                  }
                } else {
                  this._toastrService
                    .success(`OWS / Tech Pack(s) uploaded successfully.`, 'Success');
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
                  frm.get('styleFiles').setValue([
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
            .deleteOwsStyleFiles(this.orderDetailId, res.deletedList.map((i) => i.id))
            .subscribe((resp: BasicResponse) => {
              if (resp.status) {
                res.deletedList.forEach((item) => {
                  let indexItem = currentTypeList.findIndex((i) => i.id === item.id);
                  if (indexItem > -1) {
                    currentTypeList.splice(indexItem, 1);
                  }
                });
                frm.get('styleFiles').setValue([
                  ...currentFiles,
                  ...currentTypeList
                ]);

                if (currentTypeList.length === 0 && res.newList.length === 0) {
                  this._toastrService
                    .success(`OWS / Tech Pack(s) removed successfully.`, 'Success');
                } else {
                  if (!isShowMsg) {
                    this._toastrService
                      .success(`OWS / Tech Pack(s) updated successfully.`, 'Success');
                    isShowMsg = true;
                  }
                }
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
        if (res.updateList && res.updateList.length) {
          this._styleService.updateOwsStyleFiles(this.orderDetailId, res.updateList)
            .subscribe((resp: BasicResponse) => {
              if (resp.status) {
                if (!isShowMsg) {
                  this._toastrService
                    .success(`OWS / Tech Pack(s) updated successfully.`, 'Success');
                  isShowMsg = true;
                }
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
      }
    }, (err) => {
      this._el.nativeElement.className = '';
    });
  }

  /**
   * getLabelString
   * @param style
   * @returns {string}
   */
  public getLabelString(style): string {
    let leftLabel = '';
    if (style.partnerStyle) {
      leftLabel += `(${style.partnerStyle}) `;
    }
    leftLabel += `${style.styleName ? style.styleName : ''}${style.styleName
    && style.blankStyle ? ' - ' : ''}${style.blankStyle ? style.blankStyle : ''}`;
    // ------------------------------------------
    let rightLabel = style.color ? style.color : '';
    // ------------------------------------------
    let itemType = '';
    switch (style.itemType) {
      case ItemTypes.DOMESTIC:
        itemType = 'Domestic';
        break;
      case ItemTypes.OUTSOURCE:
        itemType = 'Outsource';
        break;
      case ItemTypes.IMPORTS:
        itemType = 'Imports';
        break;
      default:
        itemType = 'None';
        break;
    }
    return `${leftLabel}${leftLabel && rightLabel ? ' / ' : ''}${rightLabel} (${itemType})`;
  }

  /**
   * onSelectStyle
   * @param {number} orderDetailId
   */
  public onSelectStyle(frm, orderDetailId: number): void {
    let currentDetailType = frm.get('techPackApplyToStyles').value;
    const duplTypeIndex = currentDetailType.indexOf(orderDetailId);
    if (duplTypeIndex > -1) {
      currentDetailType.splice(duplTypeIndex, 1);
    } else {
      currentDetailType.push(orderDetailId);
    }
    frm.get('techPackApplyToStyles').patchValue(currentDetailType);
  }

  public activeStylesChanges(frm, orderDetailId: number): boolean {
    if (orderDetailId === this.orderDetailId) {
      return true;
    }
    return frm.get('techPackApplyToStyles').value.findIndex((i) => i === orderDetailId) > -1;
  }

  public checkFormValid(): boolean {
    let isValid = true;
    const checkValidControlFunc = (frm: any, list: string[]): boolean => {
      let isControlValue = true;
      list.forEach((i) => isControlValue = isControlValue
        && (frm.get(i).valid || frm.get(i).disabled));
      return isControlValue;
    };
    // this.listOwsTp.controls.forEach((owsTp) => {
    if (!this.frm.get('status').value) {
      return false;
    }
    switch (+this.frm.get('status').value) {
      case this.taskStatus.DONE:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'techPackReadyDateOnUtc'
        ]);
        break;
      default:
        break;
    }
    // });
    return isValid;
  }

  public onSubmitForm(): void {
    if (this.checkFormValid()) {
      this.myDatePickerService.addTimeToDateArray(this.frm, ['techPackReadyDateOnUtc']);
      this.activeModal.close({
        status: true,
        data: this.frm.value
      });
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }

  public onClosePopup(): void {
    let isUploaded = this.checkLengthUploaderByType(this.frm);
    this.activeModal.close({
      status: false,
      data: {
        isUploaded
      }
    });
  }
}
