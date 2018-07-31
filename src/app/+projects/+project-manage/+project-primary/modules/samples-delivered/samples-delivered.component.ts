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
  SamplesDeliveredService
} from './samples-delivered.service';

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
import {
  ProjectPrimaryService
} from '../../project-primary.service';

// Validators
import {
  MaxDateToday
} from '../../../../../shared/validators';

// Interfaces
import {
  ColumnType,
  Status,
  TaskStatus,
  UploadedType
} from '../../project-primary.model';
import {
  BasicResponse,
  ResponseMessage
} from '../../../../../shared/models';
import {
  LeadEtaComponent
} from '../index';
import { UploaderTypeComponent } from '../../../../../shared/modules/uploader-type';

@Component({
  selector: 'samples-delivered',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'samples-delivered.template.html',
  styleUrls: [
    // 'samples-delivered.style.scss'
  ]
})
export class SamplesDeliveredComponent implements OnInit {
  @Input()
  public isPageReadOnly = false;
  @Input()
  public rowDetail;
  @Input()
  public projectId;
  @Input()
  public productId;

  @ViewChild(LeadEtaComponent)
  public leadEtaComponent: LeadEtaComponent;

  public statusData = Status.filter((stt) => stt.name === 'Done');

  public frm: FormGroup;
  public formErrors = {
    samplesDeliveredToCustomerPpCarrierId: '',
    samplesDeliveredToCustomerPpTracking: '',
    samplesDeliveredToCustomerPpDateDeliveredOnUtc: ''
  };
  public validationMessages = {
    samplesDeliveredToCustomerPpCarrierId: {},
    samplesDeliveredToCustomerPpTracking: {},
    samplesDeliveredToCustomerPpDateDeliveredOnUtc: {},
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
  public shippingCarrier = [];
  private _storedData;

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _modalService: NgbModal,
              private _projectPrimaryService: ProjectPrimaryService,
              private _samplesDeliveredToCustomerPpService: SamplesDeliveredService,
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
      samplesDeliveredToCustomerPpStatus: new FormControl(null),
      samplesDeliveredToCustomerPpCarrierId: new FormControl(null),
      samplesDeliveredToCustomerPpCarrierName: new FormControl(''),
      samplesDeliveredToCustomerPpTracking: new FormControl(''),
      samplesDeliveredToCustomerPpDateDelivered: new FormControl(''),
      samplesDeliveredToCustomerPpDateDeliveredOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.required
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ]),
      ]),
      files: new FormControl([]),
      formRequires: new FormControl({
        samplesDeliveredToCustomerPpStatus: {
          required: false
        },
        samplesDeliveredToCustomerPpCarrierId: {
          required: false
        },
        samplesDeliveredToCustomerPpTracking: {
          required: false
        },
        samplesDeliveredToCustomerPpDateDeliveredOnUtc: {
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
    if (key === 'firstCase') {
      let listCase = [
        'samplesDeliveredToCustomerPpDateDeliveredOnUtc'
      ];
      let isRequired = [
        this.taskStatus.DONE
      ].indexOf(+this.frm.get('samplesDeliveredToCustomerPpStatus').value) > -1;
      listCase.forEach((caseStr) => {
        frm.get('formRequires').value[caseStr].required = isRequired;
      });
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
    patchDateFunc('samplesDeliveredToCustomerPpDateDeliveredOnUtc',
      'samplesDeliveredToCustomerPpDateDelivered');
  }

  public openUploader(frm: FormGroup): void {
    const funcUpload = (fileList: any[]) => {
      let modalRef = this._modalService.open(UploaderTypeComponent, {
        size: 'lg',
        keyboard: false,
        backdrop: 'static',
        windowClass: 'super-lg'
      });
      modalRef.componentInstance.title = 'Samples delivered to Customer (PP)';
      Object.assign(modalRef.componentInstance.uploadOptions, {
        uploadType: this.uploadedType.SamplesDeliveredToCustomerPp,
        fileList: fileList.filter((i) => i),
        isReadOnly: this.isPageReadOnly
      });

      modalRef.result.then((res) => {
        if (res.status) {
          let isShownMsg = false;
          let currentFiles = frm.get('files').value;
          if (res.newList && res.newList.length) {
            this._projectPrimaryService
              .uploadFile(this.projectId, this.productId,
                ColumnType.SamplesDeliveredToCustomer, res.newList)
              .subscribe((resp: ResponseMessage<any[]>) => {
                if (resp.status) {
                  if (resp.data.length) {
                    if (currentFiles.length) {
                      this._toastrService
                        .success(`Samples delivered to Customer (PP) file(s) updated successfully.`,
                          'Success');
                    } else {
                      this._toastrService
                        .success(`Samples delivered to Customer
                         (PP) file(s) uploaded successfully.`,
                          'Success');
                    }
                    isShownMsg = true;
                    currentFiles = [
                      ...resp.data
                    ];
                    frm.get('files').setValue(currentFiles);
                  }
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
          }
          if (res.deletedList && res.deletedList.length) {
            this._projectPrimaryService.deleteFile(this.projectId, this.productId,
              res.deletedList.map((i) => i.id))
              .subscribe((resp: BasicResponse) => {
                if (resp.status) {
                  res.deletedList.forEach((item) => {
                    let indexItem = currentFiles.findIndex((i) => i.id === item.id);
                    if (indexItem > -1) {
                      currentFiles.splice(indexItem, 1);
                    }
                  });
                  frm.get('files').setValue(currentFiles);
                  if (!isShownMsg) {
                    if (currentFiles.length === 0 && res.newList.length === 0) {
                      this._toastrService
                        .success(`Samples delivered to Customer (PP) file(s) removed successfully.`,
                          'Success');
                    } else {
                      this._toastrService
                        .success(`Samples delivered to Customer (PP) file(s) updated successfully.`,
                          'Success');
                    }
                    isShownMsg = true;
                  }
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
          }
          if (res.updateList && res.updateList.length) {
            this._projectPrimaryService
              .updateFile(this.projectId, this.productId,
                ColumnType.SamplesDeliveredToCustomer, res.updateList)
              .subscribe((resp: BasicResponse) => {
                if (resp.status) {
                  if (!isShownMsg) {
                    this._toastrService
                      .success(`Samples delivered to Customer (PP) file(s) updated successfully.`,
                        'Success');
                    isShownMsg = true;
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
    let fileList = frm.get('files').value || [];
    funcUpload(fileList);
  }

  public checkLengthUploaderByType(frm): boolean {
    return frm.get('files').value && frm.get('files').value.length;
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
    this._commonService.getShippingCarrier()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.shippingCarrier = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._projectPrimaryService
      .getFiles(this.projectId, this.productId, ColumnType.SamplesDeliveredToCustomer)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.frm.get('files').patchValue(resp.data);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._samplesDeliveredToCustomerPpService
      .getDataColumn(this.projectId, this.productId, ColumnType.SamplesDeliveredToCustomer)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.updateForm(resp.data);
          this._storedData = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
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
    if (this.checkFormValid() && this.leadEtaComponent.checkFormValid()) {
      let listDate = [
        'samplesDeliveredToCustomerPpDateDeliveredOnUtc'
      ];
      this.myDatePickerService.addTimeToDateArray(this.frm, listDate);
      const modal = Object.assign({
        ...this._storedData,
        ...this.leadEtaComponent.getFormValue()
      }, this.frm.value);
      delete modal['formRequires'];
      this._samplesDeliveredToCustomerPpService
        .changeStatusColumn(this.projectId, this.productId,
          ColumnType.SamplesDeliveredToCustomer, modal)
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

  public onClosePopup(): void {
    this.activeModal.close({
      status: false,
      data: {
        isUploaded: this.checkLengthUploaderByType(this.frm)
      }
    });
  }
}
