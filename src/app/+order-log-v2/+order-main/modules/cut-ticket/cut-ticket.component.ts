import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
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
import {
  StyleService
} from '../../../+sales-order/+order-styles/+styles-info/+style/style.service';
import {
  StyleUploadedType
} from '../../../+sales-order/+order-styles/+styles-info/+style';
import {
  ItemTypes
} from '../../../+sales-order/+order-styles/order-styles.model';

@Component({
  selector: 'cut-ticket',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'cut-ticket.template.html',
  styleUrls: [
    'cut-ticket.style.scss'
  ]
})
export class CutTicketComponent implements OnInit, OnDestroy {
  @Input()
  public title = '';
  @Input()
  public orderId;
  @Input()
  public orderDetailId;
  @Input()
  public styleList;
  @Input()
  public rowDetail;

  public statusData = Status.filter((stt) => stt.name === 'Pending Approval'
    || stt.name === 'Rejected'
    || stt.name === 'Approved');

  public frm: FormGroup;
  public formErrors = {
    cutTicketNumber: '',
    cutTicketCreatedOnUtc: ''
  };
  public validationMessages = {
    cutTicketNumber: {
      required: 'Production PO – Cut Ticket # is required.'
    },
    cutTicketCreatedOnUtc: {
      required: 'Cut Ticket Created is required.'
    },
    cutTicketApprovedOnUtc: {
      required: 'Cut Ticket Approved Date is required.'
    },
    cutTicketComment: {
      required: 'Comment is required.'
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
  public cutTicketPickerOptions = {
    ...this.myDatePickerOptions
  };
  public approvedPickerOptions = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };

  public styleUploadedType = StyleUploadedType;
  public uploadedType = UploadedType;
  public taskStatus = TaskStatus;
  public isMissingImage = false;

  constructor(public activeModal: NgbActiveModal,
              private _el: ElementRef,
              private _validationService: ValidationService,
              private _localStorageService: LocalStorageService,
              private _modalService: NgbModal,
              private _commonService: CommonService,
              private _styleService: StyleService,
              private _toastrService: ToastrService,
              private _changeDetectorRef: ChangeDetectorRef,
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
      cutTicketNumber: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      cutTicketCreated: new FormControl(''),
      cutTicketCreatedOnUtc: new FormControl('', [
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
      cutTicketApproved: new FormControl(''),
      cutTicketApprovedOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      styleFiles: new FormControl([]),
      cutTicketComment: new FormControl([], [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'secondCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      styleIds: new FormControl([]),
      formRequires: new FormControl({
        status: {
          required: true
        },
        cutTicketNumber: {
          required: true
        },
        cutTicketCreatedOnUtc: {
          required: true
        },
        cutTicketApprovedOnUtc: {
          required: false
        },
        cutTicketComment: {
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
        if (['cutTicketCreatedOnUtc'].indexOf(importName) > -1) {
          this.configDateOptions(importName, utcDate);

          this.frm.get(exportName).setValue({
            date: {
              year: utcDate.getFullYear(),
              month: utcDate.getMonth() + 1,
              day: utcDate.getDate()
            }
          });
        } else {
          this.configDateOptions(importName, currentDate);

          this.frm.get(exportName).setValue({
            date: {
              year: currentDate.getFullYear(),
              month: currentDate.getMonth() + 1,
              day: currentDate.getDate()
            }
          });
        }
      } else {
        this.frm.get(importName).patchValue(null);
        this.frm.get(exportName).patchValue(null);
        this.configDateOptions(importName, null);
      }
    };
    patchDateFunc('cutTicketCreatedOnUtc', 'cutTicketCreated');
    patchDateFunc('cutTicketApprovedOnUtc', 'cutTicketApproved');
  }

  public updateForm(data: any): void {
    if (data) {
      if (data.styleIds && data.styleIds
          .findIndex((i) => i === this.orderDetailId) === -1) {
        data.styleIds.push(this.orderDetailId);
      }
      this.frm.patchValue(data);
      this.setDateValue();
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._styleService.getStyleFiles(this.orderDetailId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.frm.get('styleFiles').setValue(resp.data.filter((i) =>
            i.type === this.styleUploadedType.ProductionPO));
          this._changeDetectorRef.markForCheck();
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
        case 'cutTicketCreatedOnUtc':
          // Config for cancel date options
          this.approvedPickerOptions = {
            ...this.approvedPickerOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            enableDays: [],
            disableSince: currentDate,
            componentDisabled: true
          };
          this.cutTicketPickerOptions = {
            ...this.cutTicketPickerOptions,
            enableDays: [],
            disableSince: currentDate
          };
          if (this.frm) {
            this.frm.get('cutTicketApprovedOnUtc').setValue(null);
            this.frm.get('cutTicketApproved').setValue(null);
          }
          break;
        case 'cutTicketApprovedOnUtc':
          // Config for start date options
          this.cutTicketPickerOptions = {
            ...this.cutTicketPickerOptions,
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
      case 'cutTicketCreatedOnUtc':
        // Config for end date options
        this.approvedPickerOptions = {
          ...this.approvedPickerOptions,
          disableUntil: this.getMaxDate(currentDate, dateCurrentUntil),
          disableSince: currentDate,
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentUntil), currentDate)
            //   ? '' : dateCurrentUntil
          ],
          componentDisabled: false
        };
        break;
      case 'cutTicketApprovedOnUtc':
        // Config for start date options
        this.cutTicketPickerOptions = {
          ...this.cutTicketPickerOptions,
          disableSince: this.getMaxDate(currentDate, dateCurrentSince),
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentSince), currentDate)
            //   ? '' : dateCurrentSince
          ]
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

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    let firstCaseList = [
      'cutTicketNumber',
      'cutTicketCreatedOnUtc'
    ];
    let secondCaseList = [
      'cutTicketComment'
    ];
    if (key === 'firstCase') {
      let status = true;
      // firstCaseList.forEach((cas) => status = status
      //   || this.checkLengthUploaderByType(this.styleUploadedType.ProductionPO)
      //   || !!frm.get(cas).value || +frm.get('status').value !== this.taskStatus.REJECTED);
      // firstCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else if (key === 'secondCase') {
      let status = false;
      secondCaseList.forEach((cas) => status = status
        || +frm.get('status').value === this.taskStatus.REJECTED);
      secondCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else if (key === 'cutTicketCreatedOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.PENDINGAPPROVAL
        || +frm.get('status').value === this.taskStatus.APPROVED;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'cutTicketApprovedOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.APPROVED;
      frm.get('formRequires').value[key].required = status;
      return status;
    }
  }

  public checkLengthUploaderByType(type: number): boolean {
    return this.frm.get('styleFiles').value.some((i) => i.type === type);
  }

  public openUploader(type: number, formProp?: string): void {
    this.backupData();
    let typeName = 'Production PO - Cut Ticket';
    if (formProp && !this.frm.get(formProp).value) {
      this.frm.get(formProp).setErrors({required: true});
      this.frm.get(formProp).markAsDirty();
      if (!this.checkLengthUploaderByType(type)) {
        return;
      }
    }
    const fileList = this.frm.get('styleFiles').value.filter((i) => i.type === type);
    let currentTypeList = Object.assign([], fileList);
    let modalRef = this._modalService.open(UploaderTypeComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static',
      windowClass: 'super-lg'
    });
    this._el.nativeElement.className = 'hide';
    modalRef.componentInstance.title = typeName;
    Object.assign(modalRef.componentInstance.uploadOptions, {
      id: '',
      uploadType: this.uploadedType.CutTickets,
      fileList: fileList.filter((i) => i),
      fileType: type
    });
    modalRef.result.then((res) => {
      this._el.nativeElement.className = '';
      let isShowMsg = false;
      let currentFiles = this.frm.get('styleFiles').value.filter((i) => i.type !== type) || [];
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
                this.frm.get('styleFiles').setValue([...currentFiles, ...currentTypeList]);
              });
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
            this.isMissingImage = !this.checkLengthUploaderByType(
              this.styleUploadedType.ProductionPO);
            this._changeDetectorRef.markForCheck();
          });
      }
      if (res.deletedList && res.deletedList.length) {
        this._styleService.deleteUploadedStyleFile(this.orderDetailId,
          res.deletedList.map((i) => i.id)).subscribe((resp: BasicResponse) => {
          if (resp.status) {
            res.deletedList.forEach((item) => {
              let indexItem = currentTypeList.findIndex((i) => i.id === item.id);
              if (indexItem > -1) {
                currentTypeList.splice(indexItem, 1);
              }
            });
            this.frm.get('styleFiles').setValue([...currentFiles, ...currentTypeList]);

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
          this.isMissingImage = !this.checkLengthUploaderByType(
            this.styleUploadedType.ProductionPO);
          this._changeDetectorRef.markForCheck();
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
            this.isMissingImage = !this.checkLengthUploaderByType(
              this.styleUploadedType.ProductionPO);
            this._changeDetectorRef.markForCheck();
          });
      }
    }, (err) => {
      this._el.nativeElement.className = '';
    });
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
  public onSelectStyle(orderDetailId: number): void {
    let currentDetailType = this.frm.get('styleIds').value;
    const duplTypeIndex = currentDetailType.indexOf(orderDetailId);
    if (duplTypeIndex > -1) {
      currentDetailType.splice(duplTypeIndex, 1);
    } else {
      currentDetailType.push(orderDetailId);
    }
    this.frm.get('styleIds').patchValue(currentDetailType);
  }

  public activeStylesChanges(styleId: number): boolean {
    if (styleId === this.orderDetailId) {
      return true;
    }
    return this.frm.get('styleIds').value.findIndex((i) => i === styleId) > -1;
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
      case this.taskStatus.PENDINGAPPROVAL:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'cutTicketNumber',
          'cutTicketCreatedOnUtc'
        ]);
        break;
      case this.taskStatus.APPROVED:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'cutTicketNumber',
          'cutTicketCreatedOnUtc',
          'cutTicketApprovedOnUtc'
        ]);
        break;
      case this.taskStatus.REJECTED:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'cutTicketComment'
        ]);
        break;
      default:
        break;
    }
    return isValid;
  }

  public onSubmitForm(): void {
    this.isMissingImage = false;
    if (this.checkFormValid()) {
      let listDate = [];
      if (+this.frm.get('status').value === this.taskStatus.PENDINGAPPROVAL) {
        listDate = [];
      } else if (+this.frm.get('status').value === this.taskStatus.APPROVED) {
        if (!this.checkLengthUploaderByType(this.styleUploadedType.ProductionPO)) {
          this.isMissingImage = true;
          return;
        }
        const today = new Date();
        const getDate = (d: number): string => {
          return d.toString().length > 1 ? `${d}` : `0${d}`;
        };
        const stringToday = `${getDate(today.getMonth() + 1)}/${getDate(today
          .getDate())}/${getDate(today.getFullYear())}`;
        this.frm.get('cutTicketApprovedOnUtc').patchValue(stringToday);
        listDate = [
          'cutTicketApprovedOnUtc'
        ];
      }
      this.myDatePickerService.addTimeToDateArray(this.frm, listDate);
      this.activeModal.close(this.frm.value);
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }

  public ngOnDestroy(): void {
    this._localStorageService.remove('backupData');
  }
}
