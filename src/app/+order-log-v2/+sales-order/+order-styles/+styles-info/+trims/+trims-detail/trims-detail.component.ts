import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  SalesOrderService
} from '../../../../sales-order.service';
import {
  TrimsInfoDetailService
} from './trims-detail.service';
import {
  CommonService
} from '../../../../../../shared/services/common';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  ValidationService
} from '../../../../../../shared/services/validation';
import {
  Util
} from '../../../../../../shared/services/util';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  UserContext
} from '../../../../../../shared/services/user-context';
import { AuthService } from '../../../../../../shared/services/auth/auth.service';
import * as NProgress from 'nprogress';

// Validators
import {
  MaxDate,
  MinDate
} from '../../../../../../shared/validators';

// Interfaces
import {
  BasicResponse,
  ResponseMessage,
  BasicCustomerInfo,
  BasicGeneralInfo,
  UploadedImage
} from '../../../../../../shared/models';
import {
  TrimDetail
} from './trims-detail.model';
import {
  UploadedFileModel,
  UploadedType
} from '../../../../sales-order.model';
import {
  IMyDate,
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  UploaderTypeComponent
} from '../../../../../../shared/modules/uploader-type';
import {
  ExtraValidators
} from '../../../../../../shared/services/validation';
import { Subscription } from 'rxjs';
import {
  MyDatePickerService
} from '../../../../../../shared/services/my-date-picker';
import {
  FileItem,
  FileUploader
} from 'ng2-file-upload';
import {
  TrimUploadedType,
  Vendor
} from './trims-detail.model';
import { StylesInfoService } from '../../styles-info.service';
import { ItemTypes } from '../../../order-styles.model';
import * as _ from 'lodash';
import { AppConstant } from '../../../../../../app.constant';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'trims-detail',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'trims-detail.template.html',
  styleUrls: [
    'trims-detail.style.scss'
  ]
})
export class TrimsDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  public frm: FormGroup;
  public formErrors = {
    vendorName: '',
    poNumber: '',
    poDateOnUtc: '',
    etaToVendor: '',
    deliveryTrackingNumber: '',
    deliverToVendorName: '',
    shipViaName: '',
    artDesignName: '',
    artReceivedDateOnUtc: '',
    artApprovedDateOnUtc: '',
    estDeliveryDateFromOnUtc: '',
    estDeliveryDateToOnUtc: '',
    receivedDateFromOnUtc: '',
    receivedDateToOnUtc: '',
    checkedDateFromOnUtc: '',
    checkedDateToOnUtc: '',
    imageUrl: ''
  };
  public validationMessages = {
    vendorName: {
      required: 'Vendor is required.'
    },
    poNumber: {
      required: 'PO # is required.'
    },
    poDateOnUtc: {
      required: 'PO Date is required.'
    },
    poComment: {
      required: 'PO Comments is required.'
    },
    carrierId: {
      required: 'Carrier is required.'
    },
    trackingNumber: {
      required: 'Tracking # is required.'
    },
    deliverToVendorName: {
      required: 'Deliver To Vendor is required.'
    },
    shipViaName: {
      required: 'Ship Via is required.'
    },
    artDesignName: {
      required: 'Art Design ID is required.'
    },
    artReceivedDateOnUtc: {
      required: 'Art Received is required.'
    },
    artApprovedDateOnUtc: {
      required: 'Art Approved is required.'
    },
    estDeliveryDateFromOnUtc: {
      required: 'EST Delivery Date Start is required.',
      maxLength: 'Must be earlier than EST Delivery Date End.'
    },
    estDeliveryDateToOnUtc: {
      required: 'EST Delivery Date End is required.',
      maxLength: 'Must be later than EST Delivery Date Start.'
    },
    receivedDateFromOnUtc: {
      required: 'Received Date Start is required.',
      maxLength: 'Must be earlier than Received Date End.'
    },
    receivedDateToOnUtc: {
      required: 'Received Date End is required.',
      maxLength: 'Must be later than Received Date Start.'
    },
    checkedDateFromOnUtc: {
      required: 'Checked Date Start is required.',
      maxLength: 'Must be earlier than Checked Date End.'
    },
    checkedDateToOnUtc: {
      required: 'Checked Date End is required.',
      maxLength: 'Must be later than Checked Date Start.'
    },
    artSentToVendorOnUtc: {
      required: 'Art Sent to Vendor is required.'
    },
    shipDestination: {
      required: 'Ship Destination is required.'
    }
  };

  public orderId: number;
  public styleId: number;
  public trimId: number;
  public vendorData: BasicCustomerInfo[];
  public deliverToVendorData: BasicCustomerInfo[];
  public shipViaData: BasicGeneralInfo[];
  public designData: BasicGeneralInfo[];

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
  public onTopDateOptions = {
    ...this.myDatePickerOptions,
    openSelectorTopOfInput: true
  };
  public estDeliveryFromOptions = {...this.onTopDateOptions};
  public estDeliveryToOptions = {
    ...this.onTopDateOptions,
    componentDisabled: true
  };
  public receivedFromOptions = {...this.onTopDateOptions};
  public receivedToOptions = {
    ...this.onTopDateOptions,
    componentDisabled: true
  };
  public checkedFromOptions = {...this.onTopDateOptions};
  public checkedToOptions = {
    ...this.onTopDateOptions,
    componentDisabled: true
  };

  public activatedRouteSub: Subscription;
  public isUseForAllStyles: boolean;
  public trimUploadedType = TrimUploadedType;
  public uploadedType = UploadedType;
  public typeMsg = [
    'Art Received',
    'Art Approved',
    'Po'
  ];
  public uploader: FileUploader;
  public shippingCarrier = [];

  public isPageReadOnly = false;
  public isStyleReadOnly = false;
  public isOrderArchived = false;
  public isOrderCancelled = false;
  public isStyleCancelled = false;
  public trimDetailData: any;
  public isUpdateUI = false;
  public preTrimData;

  public isShowStickyBtn = false;
  private _subOrderStatus: Subscription;
  private _subOrderData: Subscription;
  private _subStyleStatus: Subscription;

  constructor(private _fb: FormBuilder,
              private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _modalService: NgbModal,
              private _toastrService: ToastrService,
              private _utilService: Util,
              private _changeDetectorRef: ChangeDetectorRef,
              private _userContext: UserContext,
              private _localStorageService: LocalStorageService,
              private _trimsInfoDetailService: TrimsInfoDetailService,
              private _salesOrderService: SalesOrderService,
              private _stylesInfoService: StylesInfoService,
              public myDatePickerService: MyDatePickerService) {
    this.orderId = +this._salesOrderService.orderIndex.orderId;
    this.styleId = +this._salesOrderService.orderIndex.styleId;
    this.activatedRouteSub = this._activatedRoute.params.subscribe((params: { id: number }) => {
      this.trimId = Number(params.id);
      this.isUseForAllStyles = false;
      this.buildForm();
      this.getTrimsDetailData();
      this._changeDetectorRef.markForCheck();
    });
  }

  public ngOnInit(): void {
    this._subOrderStatus = this._salesOrderService.getUpdateStatusOrder().subscribe((status) => {
      this.isPageReadOnly = status;
      this._changeDetectorRef.markForCheck();
    });
    this._subOrderData = this._salesOrderService.getUpdateOrder().subscribe((orderData) => {
      this.isOrderArchived = orderData.isArchived;
      this.isOrderCancelled = orderData.isCancelled;
      this._changeDetectorRef.markForCheck();
    });
    this._subStyleStatus = this._stylesInfoService.getUpdateStyle().subscribe((styleData) => {
      this.isStyleCancelled = styleData.isCancelled;
      this._changeDetectorRef.markForCheck();
    });
    this.buildForm();
    this.uploader = new FileUploader({
      url: `${AppConstant.domain}/api/v1/common/images/styles`,
      authToken: 'Bearer ' + this._userContext.userToken.accessToken
    });
    this.getCommonData();
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      if (this._utilService.scrollElm) {
        if (this._utilService.scrollElm
            .scrollHeight - window.innerHeight > 95) {
          this.isShowStickyBtn = true;
          this._changeDetectorRef.markForCheck();
        }
      }
    }, 1000);
  }

  /**
   * getTrimsDetailData
   */
  public getTrimsDetailData(): void {
    if (this.styleId) {
      this._trimsInfoDetailService.getTrimFileById(this.trimId)
        .subscribe((fileResp: ResponseMessage<UploadedFileModel[]>) => {
          if (fileResp.status) {
            const files = fileResp.data;
            this._trimsInfoDetailService.getStyleTrimById(this.styleId, this.trimId)
              .subscribe((resp: ResponseMessage<TrimDetail>) => {
                if (resp.status) {
                  this.trimDetailData = {
                    ...resp.data,
                    files
                  };
                  this.updateForm(this.trimDetailData);
                  if (!resp.data.isUseForAllStyles) {
                    this.estDeliveryFromOptions = {...this.onTopDateOptions};
                    this.estDeliveryToOptions = {
                      ...this.onTopDateOptions,
                      componentDisabled: true
                    };
                    this.receivedFromOptions = {...this.onTopDateOptions};
                    this.receivedToOptions = {
                      ...this.onTopDateOptions,
                      componentDisabled: true
                    };
                    this.checkedFromOptions = {...this.onTopDateOptions};
                    this.checkedToOptions = {
                      ...this.onTopDateOptions,
                      componentDisabled: true
                    };
                  }
                  this.preTrimData = _.cloneDeep(this.frm.getRawValue());
                } else {
                  // this._router.navigate(['order-log-v2', this.orderId, 'trims-info']);
                }
              });
          } else {
            this._toastrService.error(fileResp.errorMessages, 'Error');
          }
        });
    } else {
      this.isUseForAllStyles = true;
      this.preTrimData = _.cloneDeep(this.frm.getRawValue());
    }
  }

  /**
   * getCommonData
   */
  public getCommonData(): void {
    this._commonService.getMachineNVendor('Trims')
      .subscribe((resp: ResponseMessage<BasicCustomerInfo[]>) => {
        if (resp.status) {
          this.vendorData = resp.data;
          this.deliverToVendorData = resp.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._commonService.getShipViaList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.shipViaData = resp.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._commonService.getDesignList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.designData = resp.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._commonService.getShippingCarrier()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.shippingCarrier = resp.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * buildForm
   */
  public buildForm(): void {
    let controlConfig = {
      id: new FormControl(''),
      isUseForAllStyles: new FormControl(false),
      isAllPoSpecified: new FormControl(false),
      deliverToVendorId: new FormControl(null),
      deliverToVendorName: new FormControl(''),
      artDesignId: new FormControl(null),
      artDesignName: new FormControl(''),
      artSentToVendorDate: new FormControl(null),
      artSentToVendorDateOnUtc: new FormControl('',
        Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
          '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')),
      artReceivedDate: new FormControl(null),
      artReceivedDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      artApprovedDate: new FormControl(null),
      artApprovedDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'secondCase'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      isArtRequired: new FormControl(false),
      isShipToTsc: new FormControl(false),
      files: new FormControl([]),
      imageUrl: new FormControl(''),
      absoluteUrl: new FormControl(''),
      listPurchasing: this._fb.array([]),
      styles: new FormControl([]),
      allStyles: new FormControl([]),
      formRequires: new FormControl({
        deliverToVendorName: {
          required: false
        },
        artReceivedDateOnUtc: {
          required: false
        },
        artApprovedDateOnUtc: {
          required: false
        },
        artDesignName: {
          required: false
        },
        artSentToVendorDateOnUtc: {
          required: false
        }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);

    this.onValueChanged(); // (re)set validation messages now
  }

  public checkPreFormIsValid(): boolean {
    let isValid = true;
    this.vendors.controls.forEach((vendor: FormGroup, index) => {
      this._commonService.markAsDirtyForm(vendor);
      isValid = isValid && vendor.valid;
    });
    return isValid;
  }

  public addVendor() {
    if (this.checkPreFormIsValid()) {
      this.vendors.push(this._validationService.buildForm({
        id: new FormControl(''),
        vendorId: new FormControl(null),
        vendorName: new FormControl('', [Validators.required]),
        poNumber: new FormControl(''),
        poDate: new FormControl(''),
        poDateOnUtc: new FormControl('', [
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ]),
        poComment: new FormControl(''),
        shipViaId: new FormControl(null),
        shipViaName: new FormControl(''),
        estDeliveryDateFrom: new FormControl(''),
        estDeliveryDateFromOnUtc: new FormControl('',
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MaxDate('estDeliveryDateToOnUtc')
          ])
        ),
        estDeliveryDateTo: new FormControl(''),
        estDeliveryDateToOnUtc: new FormControl('',
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MinDate('estDeliveryDateFromOnUtc')
          ])
        ),
        receivedDateFrom: new FormControl(''),
        receivedDateFromOnUtc: new FormControl('',
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MaxDate('receivedDateToOnUtc')
          ])
        ),
        receivedDateTo: new FormControl(''),
        receivedDateToOnUtc: new FormControl('',
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MinDate('receivedDateFromOnUtc')
          ])
        ),
        checkedDateFrom: new FormControl(''),
        checkedDateFromOnUtc: new FormControl('',
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MaxDate('checkedDateToOnUtc')
          ])
        ),
        checkedDateTo: new FormControl(''),
        checkedDateToOnUtc: new FormControl('',
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MinDate('checkedDateFromOnUtc')
          ])
        ),
        carrierId: new FormControl(null),
        carrierName: new FormControl(''),
        trackingNumber: new FormControl(''),
        deliverToVendorId: new FormControl(null),
        deliverToVendorName: new FormControl(''),
        isShipToTsc: new FormControl(false),
        files: new FormControl([]),
        stylesChanges: new FormControl([]),
        applyChangesToStyleIds: new FormControl([this.styleId]),
        formRequires: new FormControl({
          vendorName: {
            required: true
          },
          poNumber: {
            required: false
          },
          poDateOnUtc: {
            required: false
          },
          poComment: {
            required: false
          },
          shipViaName: {
            required: false
          },
          estDeliveryDateFromOnUtc: {
            required: false
          },
          estDeliveryDateToOnUtc: {
            required: false
          },
          receivedDateFromOnUtc: {
            required: false
          },
          receivedDateToOnUtc: {
            required: false
          },
          checkedDateFromOnUtc: {
            required: false
          },
          checkedDateToOnUtc: {
            required: false
          },
          carrierId: {
            required: false
          },
          trackingNumber: {
            required: false
          },
          deliverToVendorName: {
            required: false
          }
        })
      }, this.formErrors, this.validationMessages));
      if (this.isUseForAllStyles) {
        let stylesChanges = [];
        this.getStylesList().forEach((style) => {
          stylesChanges.push({id: style.id, trimId: style.trimId});
        });
        for (let vendor of this.vendors.controls) {
          vendor.get('stylesChanges').patchValue(stylesChanges);
        }
      } else {
        for (let vendor of this.vendors.controls) {
          vendor.get('stylesChanges').patchValue([{id: this.styleId, trimId: this.trimId}]);
        }
      }
      if (this._utilService.scrollElm) {
        setTimeout(() => {
          this.onAppScroll({target: {scrollingElement: this._utilService.scrollElm}});
        }, 250);
      }
    }
  }

  public deleteVendor(i: number) {
    this.vendors.removeAt(i);
    if (this._utilService.scrollElm) {
      setTimeout(() => {
        this.onAppScroll({target: {scrollingElement: this._utilService.scrollElm}});
      }, 250);
    }
  }

  public setVendors(vendors: Vendor[]) {
    const vendorFGs = vendors.map((vendor: Vendor, i) =>
      this._validationService.buildForm({
        id: new FormControl(vendor.id),
        vendorId: new FormControl(vendor.vendorId),
        vendorName: new FormControl(vendor.vendorName, [Validators.required]),
        poNumber: new FormControl(vendor.poNumber),
        poDate: new FormControl(''),
        poDateOnUtc: new FormControl(vendor.poDateOnUtc, [
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ]),
        poComment: new FormControl(vendor.poComment),
        shipViaId: new FormControl(vendor.shipViaId),
        shipViaName: new FormControl(vendor.shipViaName),
        estDeliveryDateFrom: new FormControl(''),
        estDeliveryDateFromOnUtc: new FormControl(vendor.estDeliveryDateFromOnUtc,
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MaxDate('estDeliveryDateToOnUtc')
          ])
        ),
        estDeliveryDateTo: new FormControl(''),
        estDeliveryDateToOnUtc: new FormControl(vendor.estDeliveryDateToOnUtc,
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MinDate('estDeliveryDateFromOnUtc')
          ])
        ),
        receivedDateFrom: new FormControl(''),
        receivedDateFromOnUtc: new FormControl(vendor.receivedDateFromOnUtc,
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MaxDate('receivedDateToOnUtc')
          ])
        ),
        receivedDateTo: new FormControl(''),
        receivedDateToOnUtc: new FormControl(vendor.receivedDateToOnUtc,
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MinDate('receivedDateFromOnUtc')
          ])
        ),
        checkedDateFrom: new FormControl(''),
        checkedDateFromOnUtc: new FormControl(vendor.checkedDateFromOnUtc,
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MaxDate('checkedDateToOnUtc')
          ])
        ),
        checkedDateTo: new FormControl(''),
        checkedDateToOnUtc: new FormControl(vendor.checkedDateToOnUtc,
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MinDate('checkedDateFromOnUtc')
          ])
        ),
        carrierId: new FormControl(vendor.carrierId),
        carrierName: new FormControl(vendor.carrierName),
        trackingNumber: new FormControl(vendor.trackingNumber),
        deliverToVendorId: new FormControl(vendor.deliverToVendorId),
        deliverToVendorName: new FormControl(vendor.deliverToVendorName),
        isShipToTsc: new FormControl(vendor.isShipToTsc),
        files: new FormControl(vendor.files || []),
        stylesChanges: new FormControl([]),
        applyChangesToStyleIds: new FormControl(vendor.applyChangesToStyleIds),
        formRequires: new FormControl({
          vendorName: {
            required: true
          },
          poNumber: {
            required: false
          },
          poDateOnUtc: {
            required: false
          },
          poComment: {
            required: false
          },
          shipViaName: {
            required: false
          },
          estDeliveryDateFromOnUtc: {
            required: false
          },
          estDeliveryDateToOnUtc: {
            required: false
          },
          receivedDateFromOnUtc: {
            required: false
          },
          receivedDateToOnUtc: {
            required: false
          },
          checkedDateFromOnUtc: {
            required: false
          },
          checkedDateToOnUtc: {
            required: false
          },
          carrierId: {
            required: false
          },
          trackingNumber: {
            required: false
          },
          deliverToVendorName: {
            required: false
          }
        })
      }, this.formErrors, this.validationMessages));
    const vendorFormArray = this._fb.array(vendorFGs);
    this.frm.setControl('listPurchasing', vendorFormArray);
  }

  public get vendors(): FormArray {
    return this.frm.get('listPurchasing') as FormArray;
  };

  public getStylesList(): any[] {
    if (this.isUseForAllStyles) {
      return this.frm.get('allStyles').value;
    } else {
      return this.frm.get('styles').value;
    }
  }

  public setStyleChangeForVendors(frm: any): void {
    const styleList = this.isUseForAllStyles ?
      this.frm.get('allStyles').value : this.frm.get('styles').value;
    const applyStyles = frm.get('applyChangesToStyleIds').value;
    let stylesChanges = [];
    applyStyles.forEach((styleId: number) => {
      const currentStyle = styleList.find((i) => i.id === styleId);
      if (currentStyle) {
        stylesChanges.push({id: styleId, trimId: currentStyle.trimId});
      }
    });
    frm.get('stylesChanges').patchValue(stylesChanges);
  }

  /**
   * onValueChanged
   * @param data
   */
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
   * setDateValue
   */
  public setDateValue(frm: any, isMainForm = true): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (frm.get(importName).value) {
        let dateRegex = /^\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})$/;
        if (dateRegex.test(frm.get(importName).value)) {
          const newDateTime = new Date(frm.get(importName).value);
          frm.get(importName).patchValue(newDateTime);
          // ------
          const currentDate = new Date(frm.get(importName).value);
          this.configDateOptions(frm, importName, currentDate);
          frm.get(exportName).setValue({
            date: {
              year: currentDate.getFullYear(),
              month: currentDate.getMonth() + 1,
              day: currentDate.getDate()
            }
          });
        } else {
          const listNotUpdateTime = [
            'artSentToVendorDateOnUtc'
          ];
          const utcDate = new Date(frm.get(importName).value);
          let currentDate;
          if (listNotUpdateTime.indexOf(importName) > -1) {
            currentDate = new Date(frm.get(importName).value);
          } else {
            currentDate = new Date(Date.UTC(utcDate.getFullYear(),
              utcDate.getMonth(), utcDate.getDate(), utcDate.getHours(), utcDate.getMinutes()));
          }
          this.configDateOptions(frm, importName, currentDate);

          frm.get(exportName).setValue({
            date: {
              year: currentDate.getFullYear(),
              month: currentDate.getMonth() + 1,
              day: currentDate.getDate()
            }
          });
        }
      } else {
        frm.get(importName).patchValue(null);
        frm.get(exportName).patchValue(null);
        this.configDateOptions(frm, importName, null);
      }
    };
    if (isMainForm) {
      patchDateFunc('artReceivedDateOnUtc', 'artReceivedDate');
      patchDateFunc('artApprovedDateOnUtc', 'artApprovedDate');
      patchDateFunc('artSentToVendorDateOnUtc', 'artSentToVendorDate');
    } else {
      patchDateFunc('poDateOnUtc', 'poDate');
      patchDateFunc('estDeliveryDateFromOnUtc', 'estDeliveryDateFrom');
      patchDateFunc('estDeliveryDateToOnUtc', 'estDeliveryDateTo');
      patchDateFunc('receivedDateFromOnUtc', 'receivedDateFrom');
      patchDateFunc('receivedDateToOnUtc', 'receivedDateTo');
      patchDateFunc('checkedDateFromOnUtc', 'checkedDateFrom');
      patchDateFunc('checkedDateToOnUtc', 'checkedDateTo');
    }
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
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
   * Bind UTC date to form
   * @param event
   * @param prop
   */
  public onDateChangedBy(event: IMyDateModel, frm: any, prop: string): void {
    let utcDate = Object.assign({}, event);
    frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');
    this.configDateOptions(frm, prop, utcDate.jsdate);

    // Update status for form control whose value changed
    frm.get(prop).markAsDirty();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Convert Date to IMyDate & Reconfig date options
   * @param prop
   * @param utcDate
   * @param i
   */
  public configDateOptions(frm: any, prop: string, utcDate: Date): void {
    if (!utcDate) {
      switch (prop) {
        case 'estDeliveryDateFromOnUtc':
          // Config for cancel date options
          this.estDeliveryToOptions = {
            ...this.estDeliveryToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            componentDisabled: true
          };
          this.estDeliveryFromOptions = {
            ...this.estDeliveryFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          if (frm) {
            frm.get('estDeliveryDateToOnUtc').setValue(null);
            frm.get('estDeliveryDateTo').setValue(null);
          }
          break;
        case 'estDeliveryDateToOnUtc':
          // Config for start date options
          this.estDeliveryFromOptions = {
            ...this.estDeliveryFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          break;
        case 'receivedDateFromOnUtc':
          // Config for cancel date options
          this.receivedToOptions = {
            ...this.receivedToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            componentDisabled: true
          };
          this.receivedFromOptions = {
            ...this.receivedFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          if (frm) {
            frm.get('receivedDateToOnUtc').setValue(null);
            frm.get('receivedDateTo').setValue(null);
          }
          break;
        case 'receivedDateToOnUtc':
          // Config for start date options
          this.receivedFromOptions = {
            ...this.receivedFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          break;
        case 'checkedDateFromOnUtc':
          // Config for cancel date options
          this.checkedToOptions = {
            ...this.checkedToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            componentDisabled: true
          };
          this.checkedFromOptions = {
            ...this.checkedFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          if (frm) {
            frm.get('checkedDateToOnUtc').setValue(null);
            frm.get('checkedDateTo').setValue(null);
          }
          break;
        case 'checkedDateToOnUtc':
          // Config for start date options
          this.checkedFromOptions = {
            ...this.checkedFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
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
      case 'estDeliveryDateFromOnUtc':
        // Config for end date options
        this.estDeliveryToOptions = {
          ...this.estDeliveryToOptions,
          disableUntil: dateCurrentUntil,
          enableDays: [],
          componentDisabled: false
        };
        break;
      case 'estDeliveryDateToOnUtc':
        // Config for start date options
        this.estDeliveryFromOptions = {
          ...this.estDeliveryFromOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        break;
      case 'receivedDateFromOnUtc':
        // Config for end date options
        this.receivedToOptions = {
          ...this.receivedToOptions,
          disableUntil: dateCurrentUntil,
          enableDays: [],
          componentDisabled: false
        };
        break;
      case 'receivedDateToOnUtc':
        // Config for start date options
        this.receivedFromOptions = {
          ...this.receivedFromOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        break;
      case 'checkedDateFromOnUtc':
        // Config for end date options
        this.checkedToOptions = {
          ...this.checkedToOptions,
          disableUntil: dateCurrentUntil,
          enableDays: [],
          componentDisabled: false
        };
        break;
      case 'checkedDateToOnUtc':
        // Config for start date options
        this.checkedFromOptions = {
          ...this.checkedFromOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        break;
      default:
        break;
    }
  }

  /**
   * onShipChange
   * @param $event
   * @param formName
   */
  public onShipChange($event, frm: any, formProp: string): void {
    frm.get('isShipToTsc').setValue(formProp === 'isShipToTsc'
      ? $event.target.checked : !$event.target.checked);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * onUseAllStyleChange
   * @param $event
   */
  public onUseAllStyleChange($event): void {
    this.isUseForAllStyles = $event.target.checked;
    if (this.isUseForAllStyles) {
      let stylesChanges = [];
      this.getStylesList().forEach((style) => {
        stylesChanges.push({id: style.id, trimId: style.trimId});
      });
      for (let vendor of this.vendors.controls) {
        vendor.get('stylesChanges').patchValue(stylesChanges);
      }
    } else {
      for (let vendor of this.vendors.controls) {
        vendor.get('stylesChanges').patchValue([{id: this.styleId, trimId: this.trimId}]);
      }
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * activeStylesChanges
   * @param frm
   * @param {number} styleId
   * @returns {boolean}
   */
  public activeStylesChanges(frm: any, styleId: number): boolean {
    if (styleId === this.styleId) {
      return true;
    }
    return frm.get('stylesChanges').value.findIndex((i) => i.id === styleId) > -1;
  }

  public onSelectStyle(event: any, frm: any, styleId: number, trimId: number): void {
    const checked = event.target.checked;
    if (!frm.get('stylesChanges').value) {
      frm.get('stylesChanges').patchValue([]);
    }
    if (checked) {
      const stylesChanges = frm.get('stylesChanges').value;
      stylesChanges.push({id: styleId, trimId});
      frm.get('stylesChanges').patchValue(stylesChanges);
    } else {
      const stylesChanges = frm.get('stylesChanges').value;
      const deletedStyleIndex = stylesChanges.findIndex((i) => i.id === styleId);
      if (deletedStyleIndex > -1) {
        stylesChanges.splice(deletedStyleIndex, 1);
      }
      frm.get('stylesChanges').patchValue(stylesChanges);
    }
  }

  /**
   * resetConfigDate
   */
  public resetConfigDate(): void {
    const options = {
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
      openSelectorTopOfInput: true,
      disableUntil: {
        year: 0,
        month: 0,
        day: 0
      },
      disableSince: {
        year: 0,
        month: 0,
        day: 0
      }
    };
    this.estDeliveryFromOptions = {...options};
    this.estDeliveryToOptions = {
      ...options,
      componentDisabled: true
    };
    this.receivedFromOptions = {...options};
    this.receivedToOptions = {
      ...options,
      componentDisabled: true
    };
    this.checkedFromOptions = {...options};
    this.checkedToOptions = {
      ...options,
      componentDisabled: true
    };
    this._changeDetectorRef.markForCheck();
  }

  /**
   * backupData
   */
  public backupData(): void {
    let data = Object.assign({}, this.frm.value);
    this._localStorageService.set('backupData', data);
  }

  /**
   * revertData
   */
  public revertData(): void {
    let tFrm = this._localStorageService.get('backupData');
    this.frm.patchValue(tFrm);
    this.backupData();
  }

  /**
   * onCancel
   */
  public onCancel(): void {
    let previousRoute: string = this._utilService.previousRouteUrl;
    if (previousRoute) {
      this._router.navigate([previousRoute]);
    } else {
      this._router.navigate(['order-log-v2', this.orderId, 'styles', this.styleId, 'trims']);
    }
  }

  /**
   * checkLengthUploaderByType
   * @param {number} type
   * @returns {boolean}
   */
  public checkLengthUploaderByType(frm: any, type: number): boolean {
    return frm.get('files').value.some((i) => i.type === type);
  }

  /**
   * openUploader
   * @param {number} type
   * @param {string} formProp
   */
  public openUploader(frm: any, type: number, formProp?: string, isUpload = false): void {
    this.backupData();
    const fileList = frm.get('files').value.filter((i) => isUpload ? i.type === type : i);
    // if (isUpload && !fileList.length) {
    //   return;
    // }
    if (formProp && !frm.get(formProp).value) {
      frm.get(formProp).setErrors({required: true});
      frm.get(formProp).markAsDirty();
      if (!this.checkLengthUploaderByType(frm, type)) {
        return;
      }
    }
    if (!this.trimId) {
      this._toastrService.error('Please update detail first!',
        'Error');
      return;
    }
    let currentTypeList = Object.assign([], fileList);
    let modalRef = this._modalService.open(UploaderTypeComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static',
      windowClass: 'super-lg'
    });
    modalRef.componentInstance.title = this.typeMsg[type];
    Object.assign(modalRef.componentInstance.uploadOptions, {
      id: this.trimId,
      uploadType: type === this.trimUploadedType.ArtApproved ? this.uploadedType.ArtApprovedTrim
        : type === this.trimUploadedType.ArtReceived ? this.uploadedType.ArtReceivedTrim
          : type === this.trimUploadedType.PoTrim ? this.uploadedType.PoTrim : '',
      fileList: fileList.filter((i) => i),
      fileType: type,
      isReadOnly: this.isPageReadOnly || this.isStyleReadOnly
      || this.isStyleCancelled || this.isOrderArchived
      || this.isOrderCancelled
    });

    modalRef.result.then((res) => {
      if (isUpload) {
        this.uploadFileToTrim(res, frm, type, formProp, currentTypeList);
      } else {
        this.updateFileToTrim(res, frm);
      }
    }, (err) => {
      // empty
    });
  }

  public uploadFileToTrim(res: any, frm: any, type: number,
                          formProp: string, currentTypeList: any): void {
    if (res.status) {
      if (formProp && frm.get(formProp)) {
        frm.get(formProp).markAsDirty();
      }
      if ((res.newList && res.newList.length)
        || (res.deletedList && res.deletedList.length)
        || (res.updateList && res.updateList.length)) {
        // NProgress.start();
      }
      let isShowMsg = false;
      let currentFiles = frm.get('files').value.filter((i) => i.type !== type);
      if (res.newList && res.newList.length) {
        this._trimsInfoDetailService.addTrimFileToTrimDetail(this.trimId,
          this.styleId, res.newList)
          .subscribe((resp: ResponseMessage<UploadedFileModel[]>) => {
            if (resp.status) {
              if (currentTypeList.length) {
                if (!isShowMsg) {
                  this._toastrService
                    .success(`Art file(s) updated successfully.`, 'Success');
                  isShowMsg = true;
                }
              } else {
                this._toastrService
                  .success(`Art file(s) uploaded successfully.`, 'Success');
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
                frm.get('files').setValue([...currentFiles, ...currentTypeList]);
              });
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
            this._changeDetectorRef.markForCheck();
          });
      }
      if (res.deletedList && res.deletedList.length) {
        this._trimsInfoDetailService
          .deleteTrimFileDetail(this.trimId, this.styleId, res.deletedList.map((i) => i.id))
          .subscribe((resp: BasicResponse) => {
            if (resp.status) {
              res.deletedList.forEach((item) => {
                let indexItem = currentTypeList.findIndex((i) => i.id === item.id);
                if (indexItem > -1) {
                  currentTypeList.splice(indexItem, 1);
                }
              });
              frm.get('files').setValue([...currentFiles, ...currentTypeList]);

              if (currentTypeList.length === 0 && res.newList.length === 0) {
                this._toastrService
                  .success(`Art file(s) removed successfully.`, 'Success');
              } else {
                if (!isShowMsg) {
                  this._toastrService
                    .success(`Art file(s) updated successfully.`, 'Success');
                  isShowMsg = true;
                }
              }
              this._changeDetectorRef.markForCheck();
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
      if (res.updateList && res.updateList.length) {
        this._trimsInfoDetailService.updateTrimFiles(this.trimId, res.updateList)
          .subscribe((resp: BasicResponse) => {
            if (resp.status) {
              if (!isShowMsg) {
                this._toastrService
                  .success(`${this.typeMsg[type]} updated successfully.`, 'Success');
                isShowMsg = true;
              }
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
    } else {
      let tFrm = this._localStorageService.get('backupData');
      frm.get('files').patchValue(tFrm['files']);
    }
  }

  public updateFileToTrim(res: any, frm: any): void {
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
            .success(`Po file(s) removed successfully.`, 'Success');
        }
        frm.get('files').setValue([...currentTypeList]);
        this._changeDetectorRef.markForCheck();
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
        this._changeDetectorRef.markForCheck();
      }
      if (res.newList && res.newList.length) {
        let currentTypeList = frm.get('files').value;
        if (!currentTypeList.length) {
          isShownMsg = true;
          this._toastrService
            .success(`Po file(s) uploaded successfully.`, 'Success');
        }

        if (res.duplicatedList && res.duplicatedList.length) {
          res.duplicatedList.forEach((i) => {
            if (currentTypeList.indexOf(i) > -1) {
              currentTypeList.splice(currentTypeList.indexOf(i), 1);
            }
          });
        }
        frm.get('files').setValue([...currentTypeList, ...res.newList]);
        this._changeDetectorRef.markForCheck();
      }

      if (!isShownMsg) {
        this._toastrService
          .success(`Po file(s) updated successfully.`, 'Success');
      }
    }
  }

  /**
   * updateForm
   * @param {TrimDetail} data
   */
  public updateForm(data: TrimDetail): void {
    if (data) {
      this.isUseForAllStyles = data.isUseForAllStyles;
      this.frm.patchValue(data);
      this.setDateValue(this.frm);
      if (!this.isPageReadOnly && !this.isStyleReadOnly
        && !this.isStyleCancelled && !this.isOrderArchived
        && !this.isOrderCancelled) {
        this.frm.get('isArtRequired').enable();
        this.frm.get('isAllPoSpecified').enable();
      } else {
        this.frm.get('isArtRequired').disable();
        this.frm.get('isAllPoSpecified').disable();
      }
      if (data.listPurchasing && data.listPurchasing.length) {
        this.setVendors(data.listPurchasing);
        for (let vendor of this.vendors.controls) {
          if (vendor.get('applyChangesToStyleIds').value
            .findIndex((i) => i === this.styleId) === -1) {
            vendor.get('applyChangesToStyleIds')
              .patchValue([
                this.styleId,
                ...vendor.get('applyChangesToStyleIds').value
              ]);
          }
          this.setDateValue(vendor, false);
          // if (!this.isPageReadOnly && !this.isStyleReadOnly
          //   && !this.isStyleCancelled && !this.isOrderArchived
          //   && !this.isOrderCancelled) {
          //   vendor.get('poNumber').enable();
          //   vendor.get('poComment').enable();
          //   vendor.get('carrier').enable();
          //   vendor.get('trackingNumber').enable();
          //   vendor.get('isShipToTsc').enable();
          // } else {
          //   vendor.get('poNumber').disable();
          //   vendor.get('poComment').disable();
          //   vendor.get('carrier').disable();
          //   vendor.get('trackingNumber').disable();
          //   vendor.get('isShipToTsc').disable();
          // }
          this.setStyleChangeForVendors(vendor);
        }
      } else {
        this.frm.get('listPurchasing').patchValue([]);
        // this.addVendor();
      }
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * formClick
   * @param {MouseEvent} e
   */
  public formClick(e: MouseEvent) {
    if (e.toElement &&
      e.toElement.tagName !== 'BUTTON' &&
      !e.toElement.classList.contains('form-control') &&
      !e.toElement.classList.contains('icon-mydpcalendar') &&
      !e.toElement.classList.contains('selection')) {

      let eventClick = new Event('click');
      document.dispatchEvent(eventClick);
    }
  }

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    let artReceivedRequire = this.checkLengthUploaderByType(frm,
      this.trimUploadedType.ArtReceived);
    let artApprovedRequire = this.checkLengthUploaderByType(frm,
      this.trimUploadedType.ArtApproved);
    if (key === 'artReceivedDateOnUtc') {
      frm.get('formRequires').value[key].required = artReceivedRequire;
      return artReceivedRequire;
    } else if (key === 'artApprovedDateOnUtc') {
      frm.get('formRequires').value[key].required = artApprovedRequire;
      return artApprovedRequire;
    } else {
      return false;
    }
  }

  /*-----------Drag & Drop Image Event-----------*/
  /**
   * drop
   * @param ev
   * @returns {boolean}
   */
  @HostListener('document:drop', ['$event'])
  public drop(ev) {
    // do something meaningful with it
    let items = ev.dataTransfer.items;

    if (this.isPageReadOnly || this.isStyleReadOnly
      || this.isStyleCancelled || this.isOrderArchived
      || this.isOrderCancelled) {
      return;
    }
    /*
     *  Loop through items.
     */
    for (let item of items) {
      // Get the dropped item as a 'webkit entry'.
      let entry = item.webkitGetAsEntry();

      if (entry && entry.isDirectory) {
        /*
         *  getAsFile() returns a File object that contains
         *  some useful informations on the file/folder that has
         *  been dropped.
         *
         *  You get the following properties :
         *    - lastModified (timestamp)
         *    - lastModifiedDate
         *    - name (...of the file)
         *    - path (fullpath)
         *    - size
         *    - type
         *    - etc. (...some other properties and methods)
         *
         *  So you can do the following to retrieve the path of the
         *  dropped folder.
         */
      }
    }
    this.uploader.addToQueue(ev.dataTransfer.files);
    ev.path.map((item) => {
      if (item.className && item.className.includes('upload-box trim-upload-box')) {
        this.uploadImage();
      }
    });
    ev.preventDefault();
    return false;
  }

  /**
   * dragenter
   * @param {KeyboardEvent} ev
   * @returns {boolean}
   */
  @HostListener('document:dragenter', ['$event'])
  public dragenter(ev: KeyboardEvent) {
    ev.preventDefault();
    return false;
  }

  /**
   * dragover
   * @param {KeyboardEvent} ev
   * @returns {boolean}
   */
  @HostListener('document:dragover', ['$event'])
  public dragover(ev: KeyboardEvent) {
    ev.preventDefault();
    return false;
  }

  /*-----------Drag & Drop Image Event-----------*/

  /**
   * Upload image
   * @param event
   */
  public uploadImage() {
    // Start upload avatar
    this.uploader.queue[0].upload();
    // Start loading bar while uploading
    this.uploader.onProgressItem = () => NProgress.start();
    this.uploader.onCompleteAll = () => NProgress.done();
    this.uploader.onSuccessItem = (item: FileItem, resp: string) => {
      let res: ResponseMessage<UploadedImage> = JSON.parse(resp);
      if (res.status) {
        this.frm.patchValue({
          imageUrl: res.data.relativeUrl,
          absoluteUrl: res.data.absoluteUrl
        });
        this.frm.get('imageUrl')
          .markAsDirty();
        this.frm.get('imageUrl')
          .markAsTouched();
        this._changeDetectorRef.markForCheck();
        // Clear uploaded item in uploader
        this.uploader.clearQueue();
      } else {
        this._toastrService.error(res.errorMessages, 'Error');
      }
    };
  }

  /**
   * Remove image
   */
  public removeImage(frm: FormGroup) {
    frm.patchValue({
      imageUrl: '',
      absoluteUrl: ''
    });
    frm.get('imageUrl').markAsDirty();
    frm.get('imageUrl').markAsTouched();
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
   * onSubmitForm
   */
  public onSubmitForm(): void {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
      this.vendors.controls.forEach((vendor: any) => {
        this._commonService.markAsDirtyForm(vendor);
      });
      return;
    }
    if (this._stylesInfoService.styleIndex.trimsList
        .findIndex((i) => i.id === +this.trimId) > -1) {
      this.myDatePickerService.addTimeToDateArray(this.frm, [
        'artReceivedDateOnUtc',
        'artApprovedDateOnUtc'
      ]);
      this.vendors.controls.forEach((vendor: FormGroup) => {
        if (vendor.get('isShipToTsc').value) {
          vendor.get('deliverToVendorId').patchValue(null);
          vendor.get('deliverToVendorName').patchValue('');
        }
        vendor.value.stylesChanges.forEach((style) => {
          if (!this.getStylesList().some((i) => i.id === style.id)) {
            style.id = '';
          }
        });
        vendor.get('stylesChanges').patchValue(vendor.get('stylesChanges')
          .value.filter((i) => i.id));
        let listDate = [
          'poDateOnUtc',
          'estDeliveryDateFromOnUtc',
          'estDeliveryDateToOnUtc',
          'receivedDateFromOnUtc',
          'receivedDateToOnUtc',
          'checkedDateFromOnUtc',
          'checkedDateToOnUtc'
        ];
        this.myDatePickerService.addTimeToDateArray(vendor, listDate);
      });
      this._trimsInfoDetailService.updateStyleTrim(this.trimId, this.styleId, this.frm.value)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            Object.assign(this.trimDetailData, {
              ...resp.data,
              files: this.frm.get('files').value || []
            });
            this.updateForm(this.trimDetailData);
            this.getCommonData();
            this.preTrimData = _.cloneDeep(this.frm.getRawValue());
            this._changeDetectorRef.markForCheck();
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  public onAppScroll(event: any) {
    if (event.type === 'resize') {
      if (this._utilService.scrollElm &&
        this._utilService.scrollElm.scrollHeight  - (this._utilService.scrollElm.scrollTop
          + window.innerHeight) < 95) {
      this.isShowStickyBtn = false;
      this._changeDetectorRef.markForCheck();
      } else if (this._utilService.scrollElm) {
        this.isShowStickyBtn = true;
        this._changeDetectorRef.markForCheck();
      }
      return;
    }
    if (event.target.scrollingElement.scrollHeight  - (event.target.scrollingElement
        .scrollTop + window.innerHeight) < 95) {
      this.isShowStickyBtn = false;
      this._changeDetectorRef.markForCheck();
    } else {
      this.isShowStickyBtn = true;
      this._changeDetectorRef.markForCheck();
    }
  }

  public ngOnDestroy(): void {
    this.activatedRouteSub.unsubscribe();
    this._subOrderStatus.unsubscribe();
    this._subOrderData.unsubscribe();
    this._subStyleStatus.unsubscribe();
  }
}
