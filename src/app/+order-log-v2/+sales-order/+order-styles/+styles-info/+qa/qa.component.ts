import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
  AfterViewInit
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  Router
} from '@angular/router';

// Components

// Services
import {
  Util
} from '../../../../../shared/services/util';
import {
  ToastrService
} from 'ngx-toastr';
import {
  QaService
} from './qa.service';
import {
  SalesOrderService
} from '../../../sales-order.service';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  ExtraValidators
} from '../../../../../shared/services/validation';
import {
  CommonService
} from '../../../../../shared/services/common';
import { AuthService } from '../../../../../shared/services/auth';
import { ValidationService } from '../../../../../shared/services/validation';
import {
  MyDatePickerService
} from '../../../../../shared/services/my-date-picker';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// Validators
import {
  MaxDateToday
} from '../../../../../shared/validators';

// Interfaces
import {
  BasicResponse,
  ResponseMessage
} from '../../../../../shared/models';
import {
  IMyDate,
  IMyDateModel
} from 'mydatepicker';
import {
  StyleUploadedType
} from '../+style';
import {
  UploadedFileModel,
  UploadedType
} from '../../../sales-order.model';
import {
  UploaderTypeComponent
} from '../../../../../shared/modules/uploader-type';
import { StyleService } from '../+style/style.service';
import { StylesInfoService } from '../styles-info.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs/Subscription';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'qa',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'qa.template.html',
  styleUrls: [
    'qa.style.scss'
  ]
})

export class QaComponent implements OnInit, OnDestroy {
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

  public orderIndex = {
    orderId: 0,
    styleId: 0,
    styleName: ''
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
  public auditDateOptions = {...this.myDatePickerOptions};
  public auditorData: any[] = [];
  public styleUploadedType = StyleUploadedType;
  public uploadedType = UploadedType;

  public isPageReadOnly = false;
  public isStyleReadOnly = false;
  public isOrderArchived = false;
  public isOrderCancelled = false;
  public isStyleCancelled = false;
  public qaData: any;
  public preQaData: any;

  private _subOrderStatus: Subscription;
  private _subOrderData: Subscription;
  private _subStyleStatus: Subscription;

  constructor(private _fb: FormBuilder,
              private _router: Router,
              private _toastrService: ToastrService,
              private _localStorageService: LocalStorageService,
              private _validationService: ValidationService,
              private _salesOrderService: SalesOrderService,
              private _styleService: StyleService,
              private _commonService: CommonService,
              private _stylesInfoService: StylesInfoService,
              private _qaService: QaService,
              private _authService: AuthService,
              private _modalService: NgbModal,
              private _utilService: Util,
              public myDatePickerService: MyDatePickerService) {
    // empty
  }

  public ngOnInit(): void {
    this._subOrderStatus = this._salesOrderService.getUpdateStatusOrder().subscribe((status) => {
      this.isPageReadOnly = status;
    });
    this._subOrderData = this._salesOrderService.getUpdateOrder().subscribe((orderData) => {
      this.isOrderArchived = orderData.isArchived;
      this.isOrderCancelled = orderData.isCancelled;
    });
    this._subStyleStatus = this._stylesInfoService.getUpdateStyle().subscribe((styleData) => {
      this.isStyleCancelled = styleData.isCancelled;
    });
    this.orderIndex = this._salesOrderService.orderIndex;
    this.buildForm();
    this.getCommonData().then((res) => {
      this.getQaDetailData();
    });
  }

  public getQaDetailData(): void {
    if (this.orderIndex.styleId) {
      this._qaService.getQaDetail(this.orderIndex.styleId)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this.qaData = resp.data;
            if (this.qaData &&
              (this.qaData.auditType !== 1 && this.qaData.auditType !== 2)) {
              this.qaData.auditType = 1;
            }
            this.updateForm(this.qaData);
            this.preQaData = _.cloneDeep(this.frm.getRawValue());
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
  }

  public buildForm(): void {
    let controlConfig = {
      id: new FormControl(''),
      auditorId: new FormControl(null, [
        Validators.required
      ]),
      auditDate: new FormControl(null),
      auditDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.required,
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      auditType: new FormControl({
        value: 1,
        disabled: this.isPageReadOnly || this.isStyleReadOnly
      }, [
        Validators.compose([
          Validators.required
        ])
      ]),
      files: new FormControl([]),
      comment: new FormControl({
        value: '',
        disabled: this.isPageReadOnly || this.isStyleReadOnly
      }),
      formRequires: new FormControl({
        auditorId: {
          required: true
        },
        auditDateOnUtc: {
          required: true
        },
        auditType: {
          required: true
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
   * Get data & Bind to select
   */
  public getCommonData(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._commonService.getQualityUsers()
        .subscribe((resp: ResponseMessage<any[]>) => {
          if (resp.status) {
            this.auditorData = resp.data;
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          resolve(true);
        });
    });
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  /**
   * Set date value to bind to mydatepicker
   * @param form
   */
  public setDateValue(): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (this.frm.get(importName).value) {
        let dateRegex = /^\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})$/;
        if (dateRegex.test(this.frm.get(importName).value)) {
          const newDateTime = new Date(this.frm.get(importName).value);
          this.frm.get(importName).patchValue(newDateTime);
          // ------
          const currentDate = new Date(this.frm.get(importName).value);
          this.configDateOptions(importName, currentDate);
          this.frm.get(exportName).setValue({
            date: {
              year: currentDate.getFullYear(),
              month: currentDate.getMonth() + 1,
              day: currentDate.getDate()
            }
          });
        } else {
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
        }
      } else {
        this.frm.get(importName).patchValue(null);
        this.frm.get(exportName).patchValue(null);
        this.configDateOptions(importName, null);
      }
    };
    patchDateFunc('auditDateOnUtc', 'auditDate');
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
        id: this.orderIndex.styleId,
        uploadType: this.uploadedType.QA,
        fileList: fileList.filter((i) => i),
        fileType: type,
        isReadOnly: this.isPageReadOnly || this.isStyleReadOnly
        || this.isStyleCancelled || this.isOrderArchived
        || this.isOrderCancelled
      });

      modalRef.result.then((res) => {
        if (res.status) {
          let isShowMsg = false;
          let currentFiles = this.frm.get('files').value.filter((i) => i.type !== type);
          if (res.newList && res.newList.length) {
            this._styleService.uploadFileToStyle(this.orderIndex.styleId, res.newList)
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
                    this.frm.get('files').setValue([...currentFiles, ...currentTypeList]);
                  });
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
          }
          if (res.deletedList && res.deletedList.length) {
            this._styleService
              .deleteUploadedStyleFile(this.orderIndex.styleId,
                res.deletedList.map((i) => i.id))
              .subscribe((resp: BasicResponse) => {
                if (resp.status) {
                  res.deletedList.forEach((item) => {
                    let indexItem = currentTypeList.findIndex((i) => i.id === item.id);
                    if (indexItem > -1) {
                      currentTypeList.splice(indexItem, 1);
                    }
                  });
                  this.frm.get('files').setValue([...currentFiles, ...currentTypeList]);

                  if (currentTypeList.length === 0 && res.newList.length === 0) {
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
            this._styleService.updateStyleFiles(this.orderIndex.styleId, res.updateList)
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
    const fileList = this.frm.get('files').value;
    funcUpload(fileList);
  }

  public checkLengthUploaderByType(): boolean {
    return this.frm.get('files').value && this.frm.get('files').value.length;
  }

  /**
   * Bind UTC date to form
   * @param event
   * @param prop
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

  public updateForm(data: any): void {
    if (data) {
      this.frm.patchValue(data);
      this.frm.get('auditType').patchValue(this.frm.get('auditType').value.toString());
      this.setDateValue();
    }
  }

  public onSubmitForm(): void {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
      return;
    }
    this.myDatePickerService.addTimeToDateArray(this.frm, [
      'auditDateOnUtc'
    ]);
    this.frm.get('auditType').patchValue(+this.frm.get('auditType').value);
    this._qaService
      .updateQaDetail(this.orderIndex.styleId, this.frm.value)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          Object.assign(this.qaData, {
            ...resp.data,
            files: this.frm.get('files').value
          });
          this.updateForm(this.qaData);
          this.preQaData = _.cloneDeep(this.frm.getRawValue());
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public onCancel(): void {
    let previousRoute: string = this._utilService.previousRouteUrl;
    if (previousRoute) {
      this._router.navigate([previousRoute]);
    } else {
      this._router.navigate(['order-log-v2', this.orderIndex.orderId]);
    }
  }

  public ngOnDestroy(): void {
    this._subOrderStatus.unsubscribe();
    this._subOrderData.unsubscribe();
    this._subStyleStatus.unsubscribe();
  }
}
