import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  AfterViewInit,
  HostListener
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
import {
  UploaderTypeComponent
} from '../../../../../../shared/modules/uploader-type';

// Services
import {
  Util
} from '../../../../../../shared/services/util';
import {
  ToastrService
} from 'ngx-toastr';
import {
  ShippingService
} from './shipping.service';
import {
  SalesOrderService
} from '../../../../sales-order.service';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  CommonService
} from '../../../../../../shared/services/common';
import { AuthService } from '../../../../../../shared/services/auth';
import { ValidationService } from '../../../../../../shared/services/validation';
import {
  MyDatePickerService
} from '../../../../../../shared/services/my-date-picker';
import { StylesInfoService } from '../../styles-info.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// Validators

// Interfaces
import {
  ResponseMessage
} from '../../../../../../shared/models';
import {
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  UploadedType
} from '../../../../sales-order.model';
import { Subscription } from 'rxjs/Subscription';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'shipping',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'shipping.template.html',
  styleUrls: [
    'shipping.style.scss'
  ]
})
export class ShippingComponent implements OnInit,
                                          OnDestroy,
                                          AfterViewInit {
  public shippingDetail;
  public frm: FormGroup;
  public formErrors = {
    shipFromName: '',
    shipFromAddress1: '',
    shipFromCity: '',
    shipFromState: '',
    shipFromZip: '',
    shipFromPhone: '',
    shipFromTops: '',
    shipToName: '',
    shipToAddress1: '',
    shipToCity: '',
    shipToState: '',
    shipToZip: '',
    shipToPhone: '',
    shipToPO: '',
    shippingCarrierName: '',
    shippingMethodName: '',
    saturdayDelivery: '',
    shipToType: ''
  };
  public validationMessages = {
    shipFromName: {
      required: 'Name is required.'
    },
    shipFromAddress1: {
      required: 'Address 1 is required.'
    },
    shipFromCity: {
      required: 'City is required.'
    },
    shipFromState: {
      required: 'State is required.'
    },
    shipFromZip: {
      required: 'Zip is required.'
    },
    shipFromPhone: {
      required: 'Phone is required.'
    },
    shipFromTops: {
      required: 'TOPS is required.'
    },
    shipToName: {
      required: 'Name is required.'
    },
    shipToAddress1: {
      required: 'Address 1 is required.'
    },
    shipToCity: {
      required: 'City is required.'
    },
    shipToState: {
      required: 'State is required.'
    },
    shipToZip: {
      required: 'Zip is required.'
    },
    shipToPhone: {
      required: 'Phone is required.'
    },
    shipToPO: {
      required: 'PO # is required.'
    },
    shippingCarrierName: {
      required: 'Carrier is required.'
    },
    shippingMethodName: {
      required: 'Service is required.'
    },
    saturdayDelivery: {
      required: 'Saturday Delivery is required.'
    },
    shipToType: {
      required: 'Type is required.'
    },
    default: {
      required: 'This is required.'
    }
  };

  public orderIndex = {
    orderId: 0,
    styleId: 0,
    styleName: ''
  };
  public myDatePickerOptions: IMyDpOptions = {
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

  public isPageReadOnly = false;
  public isStyleReadOnly = false;
  public isOrderArchived = false;
  public isOrderCancelled = false;
  public isStyleCancelled = false;
  public preTopData;

  public shippingUser = [];
  public shippingCarrier = [];
  public shippingCarrierSv = [];
  public confirmData = [
    {
      id: 'true',
      name: 'Yes'
    },
    {
      id: 'false',
      name: 'No'
    }
  ];
  public shippingTypeData = [
    {
      id: 1,
      name: 'Business'
    },
    {
      id: 2,
      name: 'Residential'
    }
  ];
  public approvedData;

  public uploadedType = UploadedType;

  public isShowStickyBtn = false;
  private _subOrderStatus: Subscription;
  private _subOrderData: Subscription;
  private _subStyleStatus: Subscription;

  constructor(private _fb: FormBuilder,
              private _router: Router,
              private _toastrService: ToastrService,
              private _localStorageService: LocalStorageService,
              private _validationService: ValidationService,
              private _salesOrderService: SalesOrderService,
              private _stylesInfoService: StylesInfoService,
              private _commonService: CommonService,
              private _shippingService: ShippingService,
              private _authService: AuthService,
              private _utilService: Util,
              private _modalService: NgbModal,
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
    this.getCommonData();
    this.getShippingData();
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      if (this._utilService.scrollElm) {
        if (this._utilService.scrollElm
            .scrollHeight - window.innerHeight > 70) {
          this.isShowStickyBtn = true;
        }
      }
    }, 1000);
  }

  public updateForm(data): void {
    if (data) {
      this.frm.patchValue(data);
      // patch date value
      this.setDateValue(this.frm);
      this.backupData();
    }
  }

  public getCommonData() {
    this._shippingService.getShippingUser()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.shippingUser = resp.data;
        }
      });
    this._commonService.getShippingCarrier()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.shippingCarrier = resp.data;
        }
      });
    this._shippingService.getApproved()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.approvedData = resp.data;
        }
      });
  }

  public getCarrierSvById(carrierId, clearValue?) {
    this._shippingService.getShippingCarrierSv(carrierId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.shippingCarrierSv = resp.data;
          if (clearValue) {
            this.frm.get('shippingMethodId').setValue(null);
            this.frm.get('shippingMethodName').setValue(null);
          }
        }
      });
  }

  public getShippingData(): void {
    if (this.orderIndex.styleId) {
      this._shippingService.getShippingDetail(this.orderIndex.styleId)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this.shippingDetail = resp.data;
            if (this.shippingDetail.shippingCarrierId) {
              this.getCarrierSvById(this.shippingDetail.shippingCarrierId);
            }
            this.convertBoolToString();
            this.updateForm(this.shippingDetail);
            this.preTopData = this.frm.getRawValue();
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    } else {
      this.preTopData = this.frm.getRawValue();
    }
  }

  public buildForm(): void {
    let controlConfig = {
      shippingId: new FormControl(''),
      shipFromName: new FormControl('', [Validators.required]),
      shipFromAddress1: new FormControl('', [Validators.required]),
      shipFromAddress2: new FormControl(''),
      shipFromCity: new FormControl('', [Validators.required]),
      shipFromState: new FormControl('', [Validators.required]),
      shipFromZip: new FormControl('', [Validators.required]),
      shipFromPhone: new FormControl('', [Validators.required]),
      shipFromPreparedById: new FormControl(null),
      shipFromPreparedByName: new FormControl(''),
      shipFromApprovedById: new FormControl(null),
      shipFromApprovedByName: new FormControl(''),
      shipFromDateShipped: new FormControl(''),
      shipFromDateShippedOnUtc: new FormControl(''),
      shipFromTops: new FormControl('', [Validators.required]),
      shipToName: new FormControl('', [Validators.required]),
      shipToAddress1: new FormControl('', [Validators.required]),
      shipToAddress2: new FormControl(''),
      shipToCity: new FormControl('', [Validators.required]),
      shipToState: new FormControl('', [Validators.required]),
      shipToZip: new FormControl('', [Validators.required]),
      shipToPhone: new FormControl('', [Validators.required]),
      shipToPO: new FormControl('', [Validators.required]),
      shipToRef2: new FormControl(''),
      shipToRef3: new FormControl(''),
      shippingCarrierId: new FormControl(null),
      shippingCarrierName: new FormControl('', [Validators.required]),
      shippingMethodId: new FormControl(null),
      shippingMethodName: new FormControl('', [Validators.required]),
      saturdayDelivery: new FormControl(null, [Validators.required]),
      shipToType: new FormControl(null, [Validators.required]),
      shipToTracking: new FormControl(''),
      shippingLabelReceipt: new FormControl(''),
      formRequires: new FormControl({
        shipFromName: {
          required: true
        },
        shipFromAddress1: {
          required: true
        },
        shipFromCity: {
          required: true
        },
        shipFromState: {
          required: true
        },
        shipFromZip: {
          required: true
        },
        shipFromPhone: {
          required: true
        },
        shipFromTops: {
          required: true
        },
        shipToName: {
          required: true
        },
        shipToAddress1: {
          required: true
        },
        shipToCity: {
          required: true
        },
        shipToState: {
          required: true
        },
        shipToZip: {
          required: true
        },
        shipToPhone: {
          required: true
        },
        shipToPO: {
          required: true
        },
        shippingCarrierName: {
          required: true
        },
        shippingMethodName: {
          required: true
        },
        saturdayDelivery: {
          required: true
        },
        shipToType: {
          required: true
        }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);

    this.onValueChanged(); // (re)set validation messages now
    this.backupData();
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
   * Set date value to bind to mydatepicker
   * @param form
   */
  public setDateValue(form: FormGroup): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (form.get(importName).value) {
        let dateRegex = /^\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})$/;
        if (dateRegex.test(form.get(importName).value)) {
          const newDateTime = new Date(form.get(importName).value);
          form.get(importName).patchValue(newDateTime);
          // ------
          const currentDate = new Date(form.get(importName).value);
          // this.configDateOptions(importName, currentDate);
          form.get(exportName).setValue({
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
          const utcDate = new Date(form.get(importName).value);
          let currentDate;
          if (listNotUpdateTime.indexOf(importName) > -1) {
            currentDate = new Date(form.get(importName).value);
          } else {
            currentDate = new Date(Date.UTC(utcDate.getFullYear(),
              utcDate.getMonth(), utcDate.getDate(), utcDate.getHours(), utcDate.getMinutes()));
          }
          // this.configDateOptions(importName, currentDate);

          form.get(exportName).setValue({
            date: {
              year: currentDate.getFullYear(),
              month: currentDate.getMonth() + 1,
              day: currentDate.getDate()
            }
          });
        }
      } else {
        form.get(importName).patchValue(null);
        form.get(exportName).patchValue(null);
        // this.configDateOptions(importName, null);
      }
    };
    patchDateFunc('shipFromDateShippedOnUtc', 'shipFromDateShipped');
  }

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    let firstCaseList = [
      // 'blanksDeliveredToArtDeptFromOnUtc',
      // 'blanksDeliveredToArtDeptToOnUtc'
    ];
    let secondCaseList = [
      // 'topDueDateFromOnUtc',
      // 'topDueDateToOnUtc'
    ];
    let thirdCaseList = [
      // 'topShipDateFromOnUtc',
      // 'topShipDateToOnUtc'
    ];
    if (key === 'firstCase') {
      let status = false;
      firstCaseList.forEach((cas) => status = status || !!frm.get(cas).value);
      firstCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else if (key === 'secondCase') {
      let status = false;
      secondCaseList.forEach((cas) => status = status || !!frm.get(cas).value);
      secondCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else if (key === 'thirdCase') {
      let status = false;
      thirdCaseList.forEach((cas) => status = status || !!frm.get(cas).value);
      thirdCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else {
      return false;
    }
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public onSelectItem(val, frm, valProp: string, formControlName: string): void {
    if (formControlName === 'shippingCarrierName'
      && val.id && val.id !== frm.get(formControlName).value) {
      this.getCarrierSvById(val.id, true);
    }
    if (val[valProp]) {
      frm.get(formControlName).patchValue(val[valProp]);
    } else {
      // add new
      frm.get(formControlName).patchValue(val);
    }
  }

  /**
   * Bind UTC date to form
   * @param event
   * @param prop
   */
  public onDateChangedBy(event: IMyDateModel, prop: string): void {
    let utcDate = Object.assign({}, event);
    this.frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');
    // this.configDateOptions(prop, utcDate.jsdate);
    // Update status for form control whose value changed
    this.frm.get(prop).markAsDirty();
  }

  public onSaved(frm: FormGroup): void {
    if (frm.invalid) {
      this._commonService.markAsDirtyForm(frm);
      return;
    }
    this.myDatePickerService.addTimeToDateArray(frm, [
      'shipFromDateShippedOnUtc'
    ]);
    // if (!frm.get('shippingId').value) {
    //   // NProgress.start();
    //   this._shippingService
    //     .addTopDetail(this.orderIndex.styleId, frm.value)
    //     .subscribe((resp: ResponseMessage<any>) => {
    //       if (resp.status) {
    //         this.frm.get('shippingId').patchValue(resp.data.shippingId);
    //         this.preTopData = this.frm.getRawValue();
    //         // ------------------------------------------------------------
    //         this._toastrService.success(resp.message, 'Success');
    //       } else {
    //         this._toastrService.error(resp.errorMessages, 'Error');
    //       }
    //       // NProgress.done();
    //     });
    // } else {
    //   // NProgress.start();
    //   this._shippingService
    //     .updateTopDetail(this.orderIndex.styleId, frm.value)
    //     .subscribe((resp: ResponseMessage<TopDetail>) => {
    //       if (resp.status) {
    //         Object.assign(this.shippingDetail, resp.data);
    //         this.updateForm(this.shippingDetail);
    //         this.preTopData = this.frm.getRawValue();
    //         // ------------------------------------------------------------
    //         this._toastrService.success(resp.message, 'Success');
    //       } else {
    //         this._toastrService.error(resp.errorMessages, 'Error');
    //       }
    //       // NProgress.done();
    //     });
    // }

    this._shippingService
      .updateShippingDetail(this.orderIndex.styleId, frm.value)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          Object.assign(this.shippingDetail, resp.data);
          this.convertBoolToString();
          this.updateForm(this.shippingDetail);
          this.preTopData = this.frm.getRawValue();
          // ------------------------------------------------------------
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        // NProgress.done();
      });
  }

  public openUploader(frm: FormGroup, type: number): void {
    const funcUpload = (fileList: any[]) => {
      let modalRef = this._modalService.open(UploaderTypeComponent, {
        size: 'lg',
        keyboard: false,
        backdrop: 'static',
        windowClass: 'super-lg'
      });
      modalRef.componentInstance.title = 'Shipping Label Receipt';
      Object.assign(modalRef.componentInstance.uploadOptions, {
        // id: this.styleId,
        uploadType: this.uploadedType.ShippingFile,
        fileList: fileList.filter((i) => i),
        fileType: type,
        isReadOnly: this.isPageReadOnly || this.isStyleReadOnly
        || this.isStyleCancelled || this.isOrderArchived
        || this.isOrderCancelled
      });

      modalRef.result.then((res) => {
        if (res.status) {
          let isShownMsg = false;
          if (res.deletedList && res.deletedList.length) {
            let currentTypeList = frm.get('shippingLabelReceipt').value;
            res.deletedList.forEach((item) => {
              let indexItem = currentTypeList.findIndex((i) => i.id === item.id);
              if (indexItem > -1) {
                currentTypeList.splice(indexItem, 1);
              }
            });
            if (currentTypeList.length === 0 && res.newList.length === 0) {
              isShownMsg = true;
              this._toastrService
                .success(`Shipping Label Receipt removed successfully.`, 'Success');
            }

            frm.get('shippingLabelReceipt').setValue([...currentTypeList]);
          }
          if (res.updateList && res.updateList.length) {
            let currentTypeList = frm.get('shippingLabelReceipt').value;
            res.updateList.forEach((item) => {
              let indexItem = currentTypeList.findIndex((i) => i.fileName === item.fileName);
              if (indexItem > -1) {
                currentTypeList[indexItem] = item;
              }
            });

            frm.get('shippingLabelReceipt').setValue([...currentTypeList]);
          }
          if (res.newList && res.newList.length) {
            let currentTypeList = frm.get('shippingLabelReceipt').value;
            if (!currentTypeList.length) {
              isShownMsg = true;
              this._toastrService
                .success(`Shipping Label Receipt uploaded successfully.`, 'Success');
            }

            if (res.duplicatedList && res.duplicatedList.length) {
              res.duplicatedList.forEach((i) => {
                if (currentTypeList.indexOf(i) > -1) {
                  currentTypeList.splice(currentTypeList.indexOf(i), 1);
                }
              });
            }
            frm.get('shippingLabelReceipt').setValue([...currentTypeList, ...res.newList]);
          }

          if (!isShownMsg) {
            this._toastrService
              .success(`Shipping Label Receipt updated successfully.`, 'Success');
          }
        }
      }, (err) => {
        // empty
      });
    };
    // const fileList = frm.get('shippingLabelReceipt').value.filter((i) => i.type === type);
    const fileList = frm.get('shippingLabelReceipt').value;
    funcUpload(fileList);
  }

  public checkLengthUploaderByType(type: number): boolean {
    return this.frm.get('shippingLabelReceipt').value &&
      !!this.frm.get('shippingLabelReceipt').value.length;
    // if (frm.get('shippingLabelReceipt').value && frm.get('shippingLabelReceipt').value.length) {
    //   return frm.get('shippingLabelReceipt').value.some((i) => i.type === type);
    // } else {
    //   return false;
    // }
  }

  public backupData(): void {
    let data = Object.assign({}, this.frm.value);
    this._localStorageService.set('backupData', data);
  }

  public revertData(): void {
    let tFrm = this._localStorageService.get('backupData');
    this.frm
      .patchValue(tFrm);
    this.backupData();
  }

  public onCancel(): void {
    let previousRoute: string = this._utilService.previousRouteUrl;
    if (previousRoute) {
      this._router.navigate([previousRoute]);
    } else {
      this._router.navigate(['order-log-v2', this.orderIndex.orderId]);
    }
  }

  public convertBoolToString() {
    let propList = ['shipFromTops', 'saturdayDelivery'];
    propList.forEach((p) => {
      if (this.shippingDetail[p] !== null) {
        this.shippingDetail[p] = this.shippingDetail[p].toString();
      }
    });
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  public onAppScroll(event: any) {
    if (event.type === 'resize') {
      if (this._utilService.scrollElm &&
        this._utilService.scrollElm.scrollHeight - (this._utilService.scrollElm.scrollTop
          + window.innerHeight) < 70) {
        this.isShowStickyBtn = false;
      } else if (this._utilService.scrollElm) {
        this.isShowStickyBtn = true;
      }
      return;
    }
    if (event.target.scrollingElement.scrollHeight - (event.target.scrollingElement
        .scrollTop + window.innerHeight) < 70) {
      this.isShowStickyBtn = false;
    } else {
      this.isShowStickyBtn = true;
    }
  }

  public ngOnDestroy(): void {
    // this.frm = undefined;
    this._subOrderStatus.unsubscribe();
    this._subOrderData.unsubscribe();
    this._subStyleStatus.unsubscribe();
  }
}
