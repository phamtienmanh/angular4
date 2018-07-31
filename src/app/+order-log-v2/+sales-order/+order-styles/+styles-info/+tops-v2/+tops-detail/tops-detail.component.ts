import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  AfterViewInit,
  HostListener,
  EventEmitter
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  HttpParams
} from '@angular/common/http';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  distinctUntilChanged,
  debounceTime,
  switchMap,
  filter
} from 'rxjs/operators';

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
} from './tops-detail.service';
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
import _  from 'lodash';
import {
  ProgressService
} from '../../../../../../shared/services/progress';

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
import { ItemTypes } from '../../../order-styles.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'shipping',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'tops-detail.template.html',
  styleUrls: [
    'tops-detail.style.scss'
  ]
})
export class ShippingComponent implements OnInit,
                                          OnDestroy,
                                          AfterViewInit {
  public shippingDetail;
  public frm: FormGroup;
  public formErrors = {
    billCustomer: '',
    accountType: '',
    customerAccount: '',
    billingName: '',
    billingAddress1: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingPhone: '',
    freightCost: '',
    shipFromName: '',
    shipFromAddress1: '',
    shipFromCity: '',
    shipFromState: '',
    shipFromZip: '',
    shipFromPhone: '',
    shipToName: '',
    shipToAddress1: '',
    shipToCity: '',
    shipToState: '',
    shipToZip: '',
    shipToPhone: '',
    shipToPO: '',
    shipToCarrierName: '',
    shipToMethodName: '',
    shipToSaturdayDelivery: '',
    shipToType: ''
  };
  public validationMessages = {
    billCustomer: {
      required: 'Bill Customer is required.'
    },
    accountType: {
      required: 'Account Type is required.'
    },
    customerAccount: {
      required: 'Customer Account is required.'
    },
    billingName: {
      required: 'Name is required.'
    },
    billingAddress1: {
      required: 'Address 1 is required.'
    },
    billingCity: {
      required: 'City is required.'
    },
    billingState: {
      required: 'State is required.'
    },
    billingZip: {
      required: 'Zip is required.'
    },
    billingPhone: {
      required: 'Phone is required.'
    },
    freightCost: {
      pattern: 'Freight Cost must be number.'
    },
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
    shipToCarrierName: {
      required: 'Carrier is required.'
    },
    shipToMethodName: {
      required: 'Service is required.'
    },
    shipToSaturdayDelivery: {
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
  public styleList: any[] = [];
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
  public accountTypeData = [
    {
      id: 1,
      name: 'TSC'
    },
    {
      id: 2,
      name: 'Receiver'
    },
    {
      id: 3,
      name: '3rd Party'
    }
  ];
  public approvedData;

  public uploadedType = UploadedType;

  public activatedRouteSub: Subscription;
  public ppTopType;

  public serverSideshipNameData = [];
  public shipNameTypeahead = new EventEmitter<string>();
  public customerAccountTypeahead = new EventEmitter<string>();

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
              private _progressService: ProgressService,
              private _activatedRoute: ActivatedRoute,
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
    this.orderIndex.styleId = +this.orderIndex.styleId;
    this.activatedRouteSub = this._activatedRoute.params
      .subscribe((params: { id: number }) => {
        let id = Number(params.id);
        this.ppTopType = isNaN(id) ? undefined : params.id;
        this.buildForm();
        this.serverSideSearch();
        this.getCommonData();
        this.getShippingData();
      });
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

  public serverSideSearch() {
    this.shipNameTypeahead.pipe(
      distinctUntilChanged(),
      debounceTime(500),
      filter((val: string) => val && val.length >= 3),
      switchMap((value: string) =>
        this._shippingService.getAddressList(value === null ? '' : value, false))
    ).subscribe((resp: ResponseMessage<any>) => {
      if (resp.status) {
        this.serverSideshipNameData = resp.data;
      } else {
        this._toastrService.error(resp.errorMessages, 'Error');
      }
    }, (err) => {
      this.serverSideshipNameData = [];
    });
    this.customerAccountTypeahead.pipe(
      distinctUntilChanged(),
      debounceTime(500),
      filter((val: string) => val && val.length >= 3),
      switchMap((value: string) =>
        this._shippingService.getAddressList(value === null ? '' : value, true))
    ).subscribe((resp: ResponseMessage<any>) => {
      if (resp.status) {
        this.serverSideshipNameData = resp.data;
      } else {
        this._toastrService.error(resp.errorMessages, 'Error');
      }
    }, (err) => {
      this.serverSideshipNameData = [];
    });
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
    // this._stylesInfoService.getStyleList(this.orderIndex.orderId)
    //   .subscribe((resp: ResponseMessage<any>) => {
    //     if (resp.status) {
    //       this.styleList =
    //         _.sortBy(resp.data, [
    //           'type',
    //           'partnerStyle',
    //           'partnerStyleName',
    //           'blankStyle',
    //           'blankColor'
    //         ]);
    //     } else {
    //       this._toastrService.error(resp.errorMessages, 'Error');
    //     }
    //   });
  }

  public getCarrierSvById(carrierId, clearValue?) {
    this._shippingService.getShippingCarrierSv(carrierId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.shippingCarrierSv = resp.data;
          if (clearValue) {
            this.frm.get('shipToMethodId').setValue(null);
            this.frm.get('shipToMethodName').setValue(null);
          }
        }
      });
  }

  public getShippingData(): void {
    if (this.orderIndex.styleId) {
      let params: HttpParams = new HttpParams()
        .set('topPpType', this.ppTopType);
      this._shippingService.getTopPpDetail(this.orderIndex.styleId, params)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this.shippingDetail = resp.data;
            if (this.shippingDetail.shipToCarrierId) {
              this.getCarrierSvById(this.shippingDetail.shipToCarrierId);
            }
            if (this.shippingDetail.applicableStyles) {
              this.styleList =
                _.sortBy(this.shippingDetail.applicableStyles, [
                  'itemType',
                  'partnerStyleId',
                  'partnerStyleName',
                  'blankStyle',
                  'colorName'
                ]);
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
      billCustomer: new FormControl(null, [Validators.required]),
      accountType: new FormControl(null, [Validators.required]),
      customerAccount: new FormControl(''),
      billingName: new FormControl(''),
      billingAddress1: new FormControl(''),
      billingAddress2: new FormControl(''),
      billingCity: new FormControl(''),
      billingState: new FormControl(''),
      billingZip: new FormControl(''),
      billingPhone: new FormControl(''),
      freightCost: new FormControl('',
        Validators.compose([
          Validators.pattern('^(([0-9]+)|(([0-9]+)\\.([0-9]+)))$')
        ])
      ),
      shippingId: new FormControl(''),
      shipFromName: new FormControl('', [Validators.required]),
      shipFromAddress1: new FormControl('', [Validators.required]),
      shipFromAddress2: new FormControl(''),
      shipFromCity: new FormControl('', [Validators.required]),
      shipFromState: new FormControl('', [Validators.required]),
      shipFromZip: new FormControl('', [Validators.required]),
      shipFromPhone: new FormControl('', [Validators.required]),
      preparedById: new FormControl(null),
      preparedByName: new FormControl(''),
      approvedById: new FormControl(null),
      approvedByName: new FormControl(''),
      shipFromDateShipped: new FormControl(''),
      shipFromDateShippedOnUtc: new FormControl(''),
      qtyShipped: new FormControl(''),
      comments: new FormControl(''),
      isShipToTbd: new FormControl(false),
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
      shipToCarrierId: new FormControl(null),
      shipToCarrierName: new FormControl('', [Validators.required]),
      shipToMethodId: new FormControl(null),
      shipToMethodName: new FormControl('', [Validators.required]),
      shipToSaturdayDelivery: new FormControl(null, [Validators.required]),
      shipToType: new FormControl(null, [Validators.required]),
      shipToTracking: new FormControl(''),
      topPpFiles: new FormControl(''),
      applyToStyleIds: new FormControl([this.orderIndex.styleId]),
      formRequires: new FormControl({
        billCustomer: {
          required: true
        },
        accountType: {
          required: true
        },
        customerAccount: {
          required: true
        },
        billingName: {
          required: true
        },
        billingAddress1: {
          required: true
        },
        billingCity: {
          required: true
        },
        billingState: {
          required: true
        },
        billingZip: {
          required: true
        },
        billingPhone: {
          required: true
        },
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
        shipToCarrierName: {
          required: true
        },
        shipToMethodName: {
          required: true
        },
        shipToSaturdayDelivery: {
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

  public onSelectItem(val, frm, valProp: string, formControlName: string, nameSelected?): void {
    if (formControlName === 'shipToCarrierName'
      && val.id && val.id !== frm.get(formControlName).value) {
      this.getCarrierSvById(val.id, true);
    }
    if (val[valProp]) {
      frm.get(formControlName).patchValue(val[valProp]);
    } else {
      // add new
      frm.get(formControlName).patchValue(val);
    }
    // auto fill address by name
    if ((formControlName === 'customerAccount' ||
      formControlName === 'billingName' ||
      formControlName === 'shipFromName' ||
      formControlName === 'shipToName') && val[valProp]) {
      let address = this.serverSideshipNameData.filter((add) => add.name === val[valProp]);
      if (nameSelected === 0) {
        address = this.serverSideshipNameData.filter((add) => add.customerAccount === val[valProp]);
      }
      console.log(this.serverSideshipNameData, val[valProp]);
      let typeProp = [
        [
          'billingName',
          'billingAddress1',
          'billingAddress2',
          'billingCity',
          'billingState',
          'billingZip',
          'billingPhone'
        ],
        [
          'customerAccount',
          'billingAddress1',
          'billingAddress2',
          'billingCity',
          'billingState',
          'billingZip',
          'billingPhone'
        ],
        [
          'shipFromAddress1',
          'shipFromAddress2',
          'shipFromCity',
          'shipFromState',
          'shipFromZip',
          'shipFromPhone'
        ],
        [
          'shipToAddress1',
          'shipToAddress2',
          'shipToCity',
          'shipToState',
          'shipToZip',
          'shipToPhone'
        ]
      ];
      let addProp = [
        'address1',
        'address2',
        'city',
        'state',
        'zip',
        'phone',
      ];
      if (nameSelected === 0) {
        addProp.unshift('name');
      }
      if (nameSelected === 1) {
        addProp.unshift('customerAccount');
      }
      if (address.length) {
        typeProp[nameSelected].forEach((p, index) => {
          this.frm.get(p).patchValue(address[0][addProp[index]]);
        });
      }
    }
    // make billing require if select receiver or 3rd party
    let requireList = [
      'customerAccount',
      'billingName',
      'billingAddress1',
      'billingCity',
      'billingState',
      'billingZip',
      'billingPhone'
    ];
    if (formControlName === 'accountType' && val.id === 3) {
      requireList.forEach((r) => {
        setTimeout(() => {
          frm.controls[r].setValidators(Validators.required);
          frm.controls[r].updateValueAndValidity();
        });
      });
    } else if (formControlName === 'accountType' && val.id !== 3) {
      requireList.forEach((r) => {
        setTimeout(() => {
          frm.controls[r].clearValidators();
          frm.controls[r].updateValueAndValidity();
        });
      });
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
    let params: HttpParams = new HttpParams()
      .set('topPpType', this.ppTopType);
    this._progressService.start();
    this._shippingService
      .updateTopPpDetail(this.orderIndex.styleId, params, frm.value)
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
        this._progressService.done();
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
      modalRef.componentInstance.title = 'Packing Documents';
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
            let currentTypeList = frm.get('topPpFiles').value;
            res.deletedList.forEach((item) => {
              let indexItem = currentTypeList.findIndex((i) => i.id === item.id);
              if (indexItem > -1) {
                currentTypeList.splice(indexItem, 1);
              }
            });
            if (currentTypeList.length === 0 && res.newList.length === 0) {
              isShownMsg = true;
              this._toastrService
                .success(`Packing Documents removed successfully.`, 'Success');
            }

            frm.get('topPpFiles').setValue([...currentTypeList]);
          }
          if (res.updateList && res.updateList.length) {
            let currentTypeList = frm.get('topPpFiles').value;
            res.updateList.forEach((item) => {
              let indexItem = currentTypeList.findIndex((i) => i.fileName === item.fileName);
              if (indexItem > -1) {
                currentTypeList[indexItem] = item;
              }
            });

            frm.get('topPpFiles').setValue([...currentTypeList]);
          }
          if (res.newList && res.newList.length) {
            let currentTypeList = frm.get('topPpFiles').value;
            if (!currentTypeList.length) {
              isShownMsg = true;
              this._toastrService
                .success(`Packing Documents uploaded successfully.`, 'Success');
            }

            if (res.duplicatedList && res.duplicatedList.length) {
              res.duplicatedList.forEach((i) => {
                if (currentTypeList.indexOf(i) > -1) {
                  currentTypeList.splice(currentTypeList.indexOf(i), 1);
                }
              });
            }
            frm.get('topPpFiles').setValue([...currentTypeList, ...res.newList]);
          }

          if (!isShownMsg) {
            this._toastrService
              .success(`Packing Documents updated successfully.`, 'Success');
          }
        }
      }, (err) => {
        // empty
      });
    };
    // const fileList = frm.get('topPpFiles').value.filter((i) => i.type === type);
    const fileList = frm.get('topPpFiles').value;
    funcUpload(fileList);
  }

  public checkLengthUploaderByType(type: number): boolean {
    return this.frm.get('topPpFiles').value &&
      !!this.frm.get('topPpFiles').value.length;
    // if (frm.get('topPpFiles').value && frm.get('topPpFiles').value.length) {
    //   return frm.get('topPpFiles').value.some((i) => i.type === type);
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
    let propList = ['billCustomer', 'shipToSaturdayDelivery'];
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

  /**
   * activeStylesChanges
   * @param frm
   * @param {number} styleId
   * @returns {boolean}
   */
  public activeStylesChanges(frm: any, styleId: number): boolean {
    if (styleId === this.orderIndex.styleId) {
      return true;
    }
    if (!frm.get('applyToStyleIds').value) {
      frm.get('applyToStyleIds').patchValue([this.orderIndex.styleId]);
    }
    return frm.get('applyToStyleIds').value.findIndex((i) => i === styleId) > -1;
  }

  public onSelectStyle(event: any, frm: any, styleId: number): void {
    const checked = event.target.checked;
    if (!frm.get('applyToStyleIds').value) {
      frm.get('applyToStyleIds').patchValue([]);
    }
    if (checked) {
      const applyToStyleIds = frm.get('applyToStyleIds').value;
      applyToStyleIds.push(styleId);
      frm.get('applyToStyleIds').patchValue(applyToStyleIds);
    } else {
      const applyToStyleIds = frm.get('applyToStyleIds').value;
      const deletedStyleIndex = applyToStyleIds.findIndex((i) => i === styleId);
      if (deletedStyleIndex > -1) {
        applyToStyleIds.splice(deletedStyleIndex, 1);
      }
      frm.get('applyToStyleIds').patchValue(applyToStyleIds);
    }
  }

  /**
   * getLabelString
   * @param style
   * @returns {string}
   */
  public getLabelString(style): string {
    let leftLabel = '';
    if (style.partnerStyleId) {
      leftLabel += `(${style.partnerStyleId}) `;
    }
    leftLabel += `${style.partnerStyleName ? style.partnerStyleName : ''}${style.partnerStyleName
    && style.blankStyle ? ' - ' : ''}${style.blankStyle ? style.blankStyle : ''}`;
    // ------------------------------------------
    let rightLabel = style.colorName ? style.colorName : '';
    // ------------------------------------------
    let itemType = '';
    switch (style.type) {
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

  public onSelectShipToTBD(event: any, frm: any): void {
    const checked = event.target.checked;
    frm.get('isShipToTbd').patchValue(checked);
    // make shipto unrequire if TBD is checked
    let requireList = [
      'shipToName',
      'shipToAddress1',
      'shipToCity',
      'shipToState',
      'shipToZip',
      'shipToPhone',
      'shipToPO',
      'shipToCarrierName',
      'shipToMethodName',
      'shipToSaturdayDelivery',
      'shipToType'
    ];
    if (!checked) {
      requireList.forEach((r) => {
        setTimeout(() => {
          frm.controls[r].setValidators(Validators.required);
          frm.controls[r].updateValueAndValidity();
        });
      });
    } else {
      requireList.forEach((r) => {
        setTimeout(() => {
          frm.controls[r].clearValidators();
          frm.controls[r].updateValueAndValidity();
        });
      });
    }
  }

  public onNameChange(value, type) {
    let params: HttpParams = new HttpParams();
    if (type === 1) {
      if (this.frm.get('customerAccount').value) {
        params = params.set('customerAccount', this.frm.get('customerAccount').value);
      }
      if (this.frm.get('billingName').value) {
        params = params.set('name', this.frm.get('billingName').value);
      }
    } else {
      params = params.set('name', value);
    }
    this._shippingService.getAddressByType(type, params)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          let typeProp = [
            [],
            [
              'billingAddress1',
              'billingAddress2',
              'billingCity',
              'billingState',
              'billingZip',
              'billingPhone'
            ],
            [
              'shipFromAddress1',
              'shipFromAddress2',
              'shipFromCity',
              'shipFromState',
              'shipFromZip',
              'shipFromPhone'
            ],
            [
              'shipToAddress1',
              'shipToAddress2',
              'shipToCity',
              'shipToState',
              'shipToZip',
              'shipToPhone'
            ]
          ];
          if (resp.data[typeProp[type][0]]) {
            typeProp[type].forEach((p) => {
              this.frm.get(p).patchValue(resp.data[p]);
            });
          }
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public ngOnDestroy(): void {
    // this.frm = undefined;
    this._subOrderStatus.unsubscribe();
    this._subOrderData.unsubscribe();
    this._subStyleStatus.unsubscribe();
    this.activatedRouteSub.unsubscribe();
  }
}
