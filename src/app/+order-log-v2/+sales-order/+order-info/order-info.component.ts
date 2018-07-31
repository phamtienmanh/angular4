import {
  Component,
  ViewEncapsulation,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  NavigationEnd,
  Router
} from '@angular/router';

// Services
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  CommonService
} from '../../../shared/services/common';
import {
  AuthService
} from '../../../shared/services/auth';
import {
  ToastrService
} from 'ngx-toastr';
import {
  ExtraValidators,
  ValidationService
} from '../../../shared/services/validation';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  Util
} from '../../../shared/services/util';
import {
  OrderInfoService
} from './order-info.service';
import * as moment from 'moment';
import {
  SalesOrderService
} from '../sales-order.service';
import {
  MyDatePickerService
} from '../../../shared';
import {
  UserContext
} from '../../../shared/services/user-context';
import * as _ from 'lodash';

// Validators
import {
  MaxDate,
  MinDate
} from '../../../shared/validators';

// Interfaces
import {
  SalesOrder,
  UploadedFileModel,
  UploadedType
} from '../sales-order.model';
import {
  SalesOrderInfo,
  OrderInfoUploadedType
} from './order-info.model';
import {
  BasicResponse,
  ResponseMessage,
  BasicCsrInfo,
  BasicCustomerInfo
} from '../../../shared/models';
import {
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  Subscription
} from 'rxjs/Subscription';
import {
  UploaderTypeComponent
} from '../../../shared/modules/uploader-type';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'order-info',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'order-info.template.html',
  styleUrls: [
    'order-info.style.scss'
  ]
})
export class OrderInfoComponent implements OnInit, AfterViewInit, OnDestroy {
  public isAdmin: boolean;
  public orderId: number;
  public frm: FormGroup;
  public formErrors;
  public validationMessages = {
    csr: {
      required: 'CSR is required.'
    },
    customerName: {
      required: 'Customer Name is required.'
    },
    customerEmails: {
      pattern: 'Email address is not valid'
    },
    customerPoId: {
      required: 'Customer PO # is required.'
    },
    customerPoFile: {
      required: 'PO file is required.'
    },
    orderDateOnUtc: {
      required: 'Order Date is required.'
    },
    customer2Type: {
      required: 'Customer 2 is required.'
    },
    retailerName: {
      required: 'Name is required.'
    },
    retailerPoId: {
      required: 'Retailer PO # is required.'
    },
    fulfillmentType: {
      required: 'Order Type is required.'
    },
    startShipDateOnUtc: {
      required: 'Start Ship Date is required.',
      maxLength: 'Must be earlier than'
    },
    cancelDateOnUtc: {
      required: 'Cancel Date is required.',
      maxLength: 'Must be later than Start Ship Date.'
    },
    productionCancelDateOnUtc: {
      required: 'Production Cancel Date is required.'
    },
    endDateOnUtc: {
      required: 'End Receive Date is required.',
      maxLength: 'Must be later than Start Ship Date.'
    },
    transitTime: {
      required: 'Transit Time is required.'
    },
    // factoryName: {
    //   required: 'Factory is required.'
    // },
    // exFactoryDateOnUtc: {
    //   required: 'Ex-Factory Date is required.'
    // },
    // etaTscDateOnUtc: {
    //   required: 'ETA TSC is required.'
    // },
    default: {
      required: 'This is required.'
    }
  };
  public myDatePickerOptions: IMyDpOptions;
  public startShipDateOptions;
  public cancelShipDateOptions;
  public onTopDateOptions;
  public salesOrderInfoData: SalesOrderInfo;
  public csrsData: BasicCsrInfo[] = [];
  public csrsBindData: BasicCsrInfo[] = [];
  public vendorData: BasicCustomerInfo[];
  public customersData: BasicCustomerInfo[] = [];
  public customersData2: BasicCustomerInfo[] = [];
  // public orderTypeList: BasicGeneralInfo[] = [];
  public customerEmailList: string[] = [];
  public orderInfoUploadedType = OrderInfoUploadedType;
  public uploadedType = UploadedType;
  public typeMsg = [
    'Customer PO',
    'Customer 2 PO'
  ];
  public orderTypeData = [
    {
      id: 1,
      name: 'In Fulfillment'
    },
    {
      id: 2,
      name: 'In DC'
    },
    {
      id: 3,
      name: 'Drop Ship'
    },
    {
      id: 4,
      name: 'In Store'
    }
  ];
  public customer2TypeData = [
    {
      id: 1,
      name: 'None'
    },
    {
      id: 2,
      name: 'Retailer'
    },
    {
      id: 3,
      name: 'Licensor'
    }
  ];

  public isPageReadOnly = false;
  public isSubmitted = false;

  // lookup table list
  public activatedSub: Subscription;
  public routeSub: Subscription;
  public count = 0;
  public poRange = [];
  public preOrderInfoData;
  public isShowStickyBtn = false;
  public isArchived = false;
  public isCancelled = false;

  private _preStatus;
  private _preStatusData;
  private _subStatus;
  private _subOrder;

  constructor(private _validationService: ValidationService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _localStorageService: LocalStorageService,
              private _orderInfoService: OrderInfoService,
              private _salesOrderService: SalesOrderService,
              private _commonService: CommonService,
              private _userContext: UserContext,
              private _toastrService: ToastrService,
              private _utilService: Util,
              private _modalService: NgbModal,
              private _authService: AuthService,
              public myDatePickerService: MyDatePickerService) {
    this.activatedSub = this._activatedRoute.parent.parent.params
      .subscribe((params: { id: number }) => {
        let id = Number(params.id);
        this.orderId = isNaN(id) ? undefined : params.id;
        this._preStatus = null;
        this._preStatusData = null;
      });
    this.isAdmin = this._authService.isAdmin();
    this.routeSub = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        const regex = new RegExp(`^/order-log-v2/[0-9A-Za-z\-]+/order-info$`);
        if (regex.test(val.urlAfterRedirects)) {
          this.configureDate();
          this.buildForm();
          this.getOrderInfoData().then((res) => {
            this.getCommonData();
          });
        }
      }
    });
  }

  public ngOnInit(): void {
    this._subOrder = this._salesOrderService.getUpdateOrder().subscribe((orderData) => {
      this.isArchived = orderData.isArchived;
      this.isCancelled = orderData.isCancelled;
      this._changeDetectorRef.markForCheck();
    });
    this._subStatus = this._salesOrderService.getUpdateStatusOrder().subscribe((status) => {
      this.isPageReadOnly = status;
      this._changeDetectorRef.markForCheck();
    });
    this.buildForm();
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      if (this._utilService.scrollElm) {
        if (this._utilService.scrollElm.scrollHeight - (this._utilService.scrollElm.scrollTop
            + window.innerHeight) > 130) {
          this.isShowStickyBtn = true;
          this._changeDetectorRef.markForCheck();
        }
      }
    }, 1000);
  }

  /**
   * configureDate
   */
  public configureDate(): void {
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
    this.myDatePickerOptions = options;
    this.startShipDateOptions = {
      ...options
    };
    this.cancelShipDateOptions = {
      ...options
    };
    this.onTopDateOptions = {
      ...options,
      openSelectorTopOfInput: true
    };
  }

  /**
   * Get current order info if has
   */
  public getOrderInfoData(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.orderId) {
        this._salesOrderService.getOrderInfo(this.orderId)
          .subscribe((resp: ResponseMessage<SalesOrder>) => {
            if (resp.status) {
              this.salesOrderInfoData = resp.data.orderInfo;
              this.salesOrderInfoData.orderFiles = resp.data.orderFileModel;
              if (this.salesOrderInfoData.fulfillmentType === 0) {
                this.salesOrderInfoData.fulfillmentType = null;
              }
              if (this.salesOrderInfoData.customer2Type === 0) {
                this.salesOrderInfoData.customer2Type = null;
              }
              this.salesOrderInfoData.customer2TypeName = _.get(_.find(this.customer2TypeData,
                (i) => i.id === +resp.data.orderInfo.customer2Type), 'name', '');

              this.updateForm(this.salesOrderInfoData);
              this.onStatusChange();
              this._commonService.getCustomerEmails(this.salesOrderInfoData.customerId)
                .subscribe((res: ResponseMessage<string[]>) => {
                  if (res.status) {
                    this.customerEmailList = res.data;
                    this._changeDetectorRef.markForCheck();
                  }
                });
              this._changeDetectorRef.markForCheck();
              this.getPoRange();
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
            resolve(true);
          });
      } else {
        this.onStatusChange();
        this.frm.get('customerPoId').enable();
        // this.frm.get('customerPoFile').disable();
        this.salesOrderInfoData = undefined;
        this.preOrderInfoData = _.cloneDeep(this.frm.getRawValue());
        this._changeDetectorRef.markForCheck();
        resolve(true);
      }
    });
  }

  public getPoRange() {
    if (this.frm && this.frm.get('customerName').value && this.frm.get('customerPoId').value) {
      this._commonService.getPoRange(
        this.frm.get('customerName').value,
        this.frm.get('customerPoId').value)
        .subscribe((resp: ResponseMessage<string[]>) => {
          if (resp.status) {
            this.poRange = resp.data;
            this._changeDetectorRef.markForCheck();
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
  }

  /**
   * buildForm
   */
  public buildForm(): void {
    this.formErrors = {
      csr: '',
      customerName: '',
      customerEmails: '',
      customerPoId: '',
      orderDateOnUtc: '',
      customer2Type: '',
      retailerName: '',
      retailerPoId: '',
      // orderTypeId: '',
      fulfillmentType: '',
      startShipDateOnUtc: '',
      cancelDateOnUtc: '',
      productionCancelDateOnUtc: '',
      transitTime: ''
    };
    let controlConfig = {
      csr: new FormControl(null, [Validators.required]),
      csrName: new FormControl(''),
      customerId: new FormControl(null),
      customerName: new FormControl('', [Validators.required]),
      createdBy: new FormControl(''),
      customerEmails: new FormControl([]),
      customerPoId: new FormControl({
        value: '',
        disabled: this.isPageReadOnly || this.isArchived || this.isCancelled || this.isA2000Order()
      }, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'customerPoId'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      customerPoFile: new FormControl(''),
      orderDate: new FormControl(null),
      orderDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.required,
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      customer2Type: new FormControl(null, [Validators.required]),
      customer2TypeName: new FormControl(''),
      // retailerId: new FormControl(null),
      retailerName: new FormControl(null, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'retailerName'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      retailerPoId: new FormControl({
        value: '',
        disabled: this.isPageReadOnly || this.isArchived || this.isCancelled
      }, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      // orderTypeId: new FormControl(''),
      isNewOrder: new FormControl({
        value: false,
        disabled: true
      }),
      isCod: new FormControl({
        value: false,
        disabled: true
      }),
      isCreditApproved: new FormControl({
        value: false,
        disabled: true
      }),
      isStylesCreated: new FormControl({
        value: false,
        disabled: true
      }),
      isFolderCreated: new FormControl({
        value: false,
        disabled: true
      }),
      isFolderCompleted: new FormControl({
        value: false,
        disabled: true
      }),
      isReadyToShip: new FormControl({
        value: false,
        disabled: true
      }),
      isPartialShipment: new FormControl({
        value: false,
        disabled: true
      }),
      isShipped: new FormControl({
        value: false,
        disabled: true
      }),
      isInvoiced: new FormControl({
        value: false,
        disabled: true
      }),
      isFolderSubmitted: new FormControl({
        value: false,
        disabled: true
      }),
      isRetailerPO: new FormControl({
        value: false,
        disabled: true
      }),
      isCustomerPO: new FormControl({
        value: false,
        disabled: true
      }),
      isUnits: new FormControl({
        value: false,
        disabled: true
      }),
      isCancelDate: new FormControl({
        value: false,
        disabled: true
      }),
      fulfillmentType: new FormControl({
        value: null,
        disabled: this.isPageReadOnly || this.isArchived || this.isCancelled
      }, [Validators.required]),
      startShipDate: new FormControl(null),
      startShipDateOnUtc: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('cancelDateOnUtc')
        ])
      ),
      cancelDate: new FormControl(null),
      cancelDateOnUtc: new FormControl('',
        Validators.compose([
          Validators.required,
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('startShipDateOnUtc')
        ])
      ),
      productionCancelDate: new FormControl(null),
      productionCancelDateOnUtc: new FormControl('',
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ),
      transitTime: new FormControl({
        value: '',
        disabled: this.isPageReadOnly || this.isArchived || this.isCancelled
      }, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'transitTime'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      firstDateToShip: new FormControl(null),
      firstDateToShipOnUtc: new FormControl('',
        Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
          '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')),
      lastDateToShip: new FormControl(null),
      lastDateToShipOnUtc: new FormControl('',
        Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
          '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')),
      description: new FormControl({
        value: '',
        disabled: this.isPageReadOnly || this.isArchived || this.isCancelled
      }),
      orderFiles: new FormControl([],
        this.isCustomerPoFile()),
      isA2000Order: new FormControl(''),
      formRequires: new FormControl({
        csr: {
          required: true
        },
        customerName: {
          required: true
        },
        customerEmails: {
          required: false
        },
        customerPoId: {
          required: false
        },
        orderDateOnUtc: {
          required: true
        },
        retailerName: {
          required: false
        },
        retailerPoId: {
          required: false
        },
        fulfillmentType: {
          required: true
        },
        startShipDateOnUtc: {
          required: true
        },
        cancelDateOnUtc: {
          required: true
        },
        productionCancelDateOnUtc: {
          required: false
        },
        customer2Type: {
          required: true
        },
        transitTime: {
          required: true
        }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);

    this.onValueChanged(); // (re)set validation messages now
    this.backupData();
  }

  public isCustomerPoFile() {
    return (input: FormControl) => {
      if (this.orderId && this.frm && this.frm.get('customerPoId').value
        && !this.frm.get('customerPoId').value.toLowerCase().startsWith('smpl')
        && !this.checkLengthUploaderByType(this.orderInfoUploadedType.CustomerPO)) {
        // hasError invalidValue true
        return {invalidCustomerPoFile: true};
      }
      return null;
    };
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getAccountManagerList()
      .subscribe((resp: ResponseMessage<BasicCsrInfo[]>) => {
        if (resp.status) {
          this.csrsData = resp.data;

          if (this.orderId) {
            if (resp.data.findIndex((i) => this.salesOrderInfoData
                && i.id === +this.salesOrderInfoData.csr) === -1) {
              this.salesOrderInfoData.csr = null;
              this.frm.get('csr').patchValue(null);
            }
          }

          if (this._authService.isAdmin()
            || this._authService.checkAssignedRolesOr(['Pre-Production', 'Account Supervisor'])) {
            this.csrsBindData = resp.data.filter((i) => i.isActive);
          } else {
            const userTeamAMList = this._userContext.currentUser.csrAndAmUsers;
            if (userTeamAMList) {
              this.csrsBindData = this.csrsData.filter((i) =>
                userTeamAMList.some((o) => o.id === i.id)
                || (this.salesOrderInfoData && i.id === +this.salesOrderInfoData.csr));
            } else {
              this.csrsBindData = this.csrsData.filter((i) =>
                this.salesOrderInfoData && i.id === +this.salesOrderInfoData.csr);
            }
          }

          const csrDefault = this.csrsBindData.find((csr) => csr.isLoggedinUser);
          if (csrDefault && !this.orderId) {
            this.frm.patchValue({
              csr: csrDefault.id,
              csrName: csrDefault.fullName
            });
          }

          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._commonService.getVendorList()
      .subscribe((resp: ResponseMessage<BasicCustomerInfo[]>) => {
        if (resp.status) {
          this.vendorData = resp.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    // this._commonService.getOrderTypeList()
    //   .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
    //     if (resp.status) {
    //       this.orderTypeList = resp.data;
    //       this._changeDetectorRef.markForCheck();
    //     } else {
    //       this._toastrService.error(resp.errorMessages, 'Error');
    //     }
    //   });
    this.getCommonDataWithNewValue();
  }

  public getCommonDataWithNewValue(): void {
    this._commonService.getCustomersList()
      .subscribe((resp: ResponseMessage<BasicCustomerInfo[]>) => {
        if (resp.status) {
          this.customersData = resp.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._commonService.getCustomersList(true)
      .subscribe((resp: ResponseMessage<BasicCustomerInfo[]>) => {
        if (resp.status) {
          this.customersData2 = resp.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public onSelectItem(val, frm, valProp: string, formControlName: string): void {
    if (formControlName === 'customerName') {
      this.frm.get('customerEmails').patchValue([]);
    }
    if (val[valProp]) {
      frm.get(formControlName).patchValue(val[valProp]);
      if (formControlName === 'customerName') {
        this._commonService.getCustomerEmails(val['id'])
          .subscribe((resp: ResponseMessage<string[]>) => {
            if (resp.status) {
              this.customerEmailList = resp.data.filter((i) => i);
              this._changeDetectorRef.markForCheck();
            }
          });
      } else if (formControlName === 'fulfillmentType') {
        this.configureDate();
        this.setDateValue(this.frm, true);
        this.calculateDateToShip();
      }
    } else {
      // add new
      frm.get(formControlName).patchValue(val);
    }
  }

  /**
   * setDateValue
   * @param {FormGroup} form
   */
  public setDateValue(form: FormGroup, isChangeOrderType = false): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (form.get(importName).value) {
        const utcDate = new Date(form.get(importName).value);
        if ([
            'startShipDateOnUtc',
            'cancelDateOnUtc',
            'firstDateToShipOnUtc',
            'lastDateToShipOnUtc'
          ].indexOf(importName) > -1) {
          this.configDateOptions(importName, utcDate);
          this.calculateDateToShip();

          form.get(exportName).setValue({
            date: {
              year: utcDate.getFullYear(),
              month: utcDate.getMonth() + 1,
              day: utcDate.getDate()
            }
          });
        } else {
          const listNotUpdateTime = [
            'startShipDateOnUtc',
            'cancelDateOnUtc',
            'firstDateToShipOnUtc',
            'lastDateToShipOnUtc'
          ];
          let currentDate;
          if (listNotUpdateTime.indexOf(importName) > -1) {
            currentDate = new Date(form.get(importName).value);
          } else {
            currentDate = new Date(Date.UTC(utcDate.getFullYear(),
              utcDate.getMonth(), utcDate.getDate(), utcDate.getHours(), utcDate.getMinutes()));
          }
          this.configDateOptions(importName, currentDate);

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
        this.configDateOptions(importName, null);
      }
    };
    if (!isChangeOrderType) {
      patchDateFunc('orderDateOnUtc', 'orderDate');
      patchDateFunc('productionCancelDateOnUtc', 'productionCancelDate');
    }
    patchDateFunc('startShipDateOnUtc', 'startShipDate');
    patchDateFunc('cancelDateOnUtc', 'cancelDate');
    patchDateFunc('firstDateToShipOnUtc', 'firstDateToShip');
    patchDateFunc('lastDateToShipOnUtc', 'lastDateToShip');

    this._changeDetectorRef.markForCheck();
  }

  public isA2000Order(): boolean {
    return this._salesOrderService.orderIndex.isA2000Order;
  }

  public isEditAM(): boolean {
    const isEdit = this._authService.isAdmin() ||
      this._authService.checkAssignedRolesOr([
        'Pre-Production',
        'Account Supervisor',
        'Account Manager',
        'Customer Service'
      ]);
    if (isEdit) {
      return isEdit;
    } else {
      return this.salesOrderInfoData && this.salesOrderInfoData
        .isA2000Order && !this.salesOrderInfoData.isEdi;
    }
  }

  /**
   * onValueChanged
   * @param data
   */
  public onValueChanged(data?): void {
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
    if (key === 'customerPoId') {
      let status = !this.isA2000Order();
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'retailerName') {
      // customer type Retailer | Licensor
      let status = frm.get('customer2Type').value === 2;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'transitTime') {
      let status = frm.get('fulfillmentType').value === 2
        || frm.get('fulfillmentType').value === 4;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else {
      return false;
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
    this.configDateOptions(prop, utcDate.jsdate);
    this.calculateDateToShip();
    // Update status for form control whose value changed
    this.frm.get(prop).markAsDirty();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Config show/hide control on order type
   * @param {number} orderType
   */
  public configOrderType(orderType: number): void {
    const resetDateControl = (nameArr, isClear) => {
      nameArr.forEach((name) => {
        if (isClear) {
          this.frm.get(name).clearValidators();
          this.frm.get(name).setValue('');
        }
        this.frm.get(name).markAsPristine();
        this.frm.get(name).markAsUntouched();
        this.frm.get(name).updateValueAndValidity();
      });
    };
    switch (orderType) {
      case 1:
      case 3:
        this.frm.get('startShipDateOnUtc').setValidators([
          Validators.compose([
            Validators.required,
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MaxDate('cancelDateOnUtc')
          ])
        ]);
        this.frm.get('cancelDateOnUtc').setValidators([
          Validators.compose([
            Validators.required,
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MinDate('startShipDateOnUtc')
          ])
        ]);
        this.frm.get('endReceiveDateOnUtc').setValidators([
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MinDate('startShipDateOnUtc')
          ])
        ]);
        this.frm.get('transitTime').clearValidators();

        resetDateControl([
          'startShipDateOnUtc',
          'cancelDateOnUtc'
        ], false);

        break;
      case 2:
      case 4:
        this.frm.get('endReceiveDateOnUtc').setValidators([
          Validators.compose([
            Validators.required,
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MinDate('startShipDateOnUtc')
          ])
        ]);
        if (!this.frm.get('endReceiveDateOnUtc').value) {
          this.frm.get('endReceiveDateOnUtc').setErrors({required: true});
        }
        this.frm.get('startShipDateOnUtc').setValidators([
          Validators.compose([
            Validators.required,
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MaxDate('endReceiveDateOnUtc')
          ])
        ]);
        this.frm.get('transitTime').setValidators([Validators.required]);
        this.frm.get('cancelDateOnUtc').setValidators([
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MinDate('startShipDateOnUtc')
          ])
        ]);

        resetDateControl([
          'startShipDateOnUtc',
          'transitTime'
        ], false);

        break;
      default:
        break;
    }
  }

  /**
   * Convert Date to IMyDate & Reconfig date options
   * @param prop
   * @param utcDate
   */
  public configDateOptions(prop: string, utcDate: Date): void {
    let dateCurrentSince;
    let dateCurrentUntil;
    if (utcDate) {
      dateCurrentSince = {
        year: utcDate.getFullYear(),
        month: utcDate.getMonth() + 1,
        day: utcDate.getDate()
      };
      dateCurrentUntil = {
        year: utcDate.getFullYear(),
        month: utcDate.getMonth() + 1,
        day: utcDate.getDate()
      };
    } else {
      dateCurrentSince = {
        year: 0,
        month: 0,
        day: 0
      };
      dateCurrentUntil = {
        year: 0,
        month: 0,
        day: 0
      };
    }
    switch (prop) {
      case 'startShipDateOnUtc':
        // Config for cancel date options
        this.cancelShipDateOptions = {
          ...this.cancelShipDateOptions,
          disableUntil: dateCurrentUntil,
          enableDays: []
        };
        break;
      case 'cancelDateOnUtc':
        this.startShipDateOptions = {
          ...this.startShipDateOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        break;
      default:
        break;
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * toDateObject
   * @param {string} utcDate
   * @returns {any}
   */
  public toDateObject(utcDate: string) {
    if (utcDate && this.frm.get('transitTime').value >= 0) {
      let dateRegex = /^\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})$/;
      if (dateRegex.test(utcDate)) {
        const dateArr = utcDate.split('/');
        let newDateObj = new Date(+dateArr[2], +dateArr[0] - 1, +dateArr[1], 0, 0, 0);
        newDateObj.setDate(newDateObj.getDate() - this.frm.get('transitTime').value);
        return {
          date: {
            year: newDateObj.getFullYear(),
            month: newDateObj.getMonth() + 1,
            day: newDateObj.getDate()
          }
        };
      } else {
        const dateObj = new Date(utcDate);
        let newDateObj = new Date(dateObj.getFullYear(),
          dateObj.getMonth(), dateObj.getDate(), dateObj.getHours(), dateObj.getMinutes());
        newDateObj.setDate(newDateObj.getDate() - this.frm.get('transitTime').value);
        return {
          date: {
            year: newDateObj.getFullYear(),
            month: newDateObj.getMonth() + 1,
            day: newDateObj.getDate()
          }
        };
      }
    }
    return '';
  }

  /**
   * toDateUtc
   * @param {string} utcDate
   * @returns {any}
   */
  public toDateUtc(utcDate: string) {
    if (utcDate && this.frm.get('transitTime').value) {
      let dateRegex = /^\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})$/;
      if (dateRegex.test(utcDate)) {
        const dateArr = utcDate.split('/');
        let newDateObj = new Date(+dateArr[2], +dateArr[0] - 1, +dateArr[1], 0, 0, 0);
        newDateObj.setDate(newDateObj.getDate() - this.frm.get('transitTime').value);
        return moment(newDateObj).format('MM/DD/YYYY');
      } else {
        const dateObj = new Date(utcDate);
        let newDateObj = new Date(dateObj.getFullYear(),
          dateObj.getMonth(), dateObj.getDate(), dateObj.getHours(), dateObj.getMinutes());
        newDateObj.setDate(newDateObj.getDate() - this.frm.get('transitTime').value);
        return moment(newDateObj).format('MM/DD/YYYY');
      }
    }
    return '';
  }

  public reduceTransitTime(utcDate: string, isToObject) {
    const reduceWorkingDay = (date: Date, transitTime: number) => {
      while (transitTime > 0) {
        date.setDate(date.getDate() - 1);
        if (date.getDay() !== 0 && date.getDay() !== 6) {
          // not sat or sun
          transitTime--;
        }
      }
    };
    if (utcDate && this.frm.get('transitTime').value >= 0) {
      let dateRegex = /^\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})$/;
      let newDate;
      if (dateRegex.test(utcDate)) {
        const dateArr = utcDate.split('/');
        newDate = new Date(+dateArr[2], +dateArr[0] - 1, +dateArr[1], 0, 0, 0);
      } else {
        const dateObj = new Date(utcDate);
        newDate = new Date(dateObj.getFullYear(),
          dateObj.getMonth(), dateObj.getDate(), dateObj.getHours(), dateObj.getMinutes());
      }
      reduceWorkingDay(newDate, this.frm.get('transitTime').value);
      if (isToObject) {
        return {
          date: {
            year: newDate.getFullYear(),
            month: newDate.getMonth() + 1,
            day: newDate.getDate()
          }
        };
      }
      return moment(newDate).format('MM/DD/YYYY');
    }
    return '';
  }

  /**
   * calculateDateToShip
   */
  public calculateDateToShip() {
    if (Number.parseInt(this.frm.get('transitTime').value) >= 0) {
      this.frm.get('firstDateToShip').setValue(
        this.reduceTransitTime(this.frm.get('startShipDateOnUtc').value, true));
      this.frm.get('firstDateToShipOnUtc').setValue(
        this.reduceTransitTime(this.frm.get('startShipDateOnUtc').value, false));
      this.frm.get('lastDateToShip').setValue(
        this.reduceTransitTime(this.frm.get('cancelDateOnUtc').value, true));
      this.frm.get('lastDateToShipOnUtc').setValue(
        this.reduceTransitTime(this.frm.get('cancelDateOnUtc').value, false));
    }
  }

  /**
   * Update form value
   * @param data
   */
  public updateForm(data: SalesOrderInfo): void {
    this.frm.patchValue(data);
    this.setDateValue(this.frm, false);
    if (this.frm.get('fulfillmentType').value === 2
      || +this.frm.get('fulfillmentType').value === 4) {
      this.calculateDateToShip();
    }
    const orderIndexModel = {
      customerName: data.customerName,
      customerPoId: data.customerPoId,
      customer2Type: data.customer2Type,
      retailerName: data.retailerName,
      retailerPoId: data.retailerPoId
    };
    this._salesOrderService.updateOrderIndex(orderIndexModel);
    this._salesOrderService.setBreadcrumb(data);
    this.backupData();
    setTimeout(() => {
      this.preOrderInfoData = _.cloneDeep(this.frm.getRawValue());
    });
    this._changeDetectorRef.markForCheck();
  }

  /**
   * onStatusChangeOr
   * @param {boolean} value
   * @param {string} name
   */
  public onStatusChangeOr(value: boolean, name: string): void {
    if (value) {
      this.frm.get(name).patchValue(false);
    }
  }

  /**
   * onStatusChange
   */
  public onStatusChange(): void {
    if (this.frm.value.isCreditApproved) {
      this.frm.get('isCod').patchValue(false);
    } else if (this.frm.value.isCod) {
      this.frm.get('isCreditApproved').patchValue(false);
    }

    if ((this.frm.value.isCreditApproved || this.frm.value.isCod)
      && this.frm.value.isStylesCreated && this.frm.value.isFolderCompleted) {
      this.frm.get('isReadyToShip').enable();
      if (this.frm.value.isReadyToShip) {
        this.frm.get('isPartialShipment').enable();
        this.frm.get('isShipped').enable();
        if (this.frm.value.isPartialShipment || this.frm.value.isShipped) {
          this.frm.get('isFolderSubmitted').enable();
          if (this.frm.value.isFolderSubmitted) {
            this.frm.get('isInvoiced').enable();
          } else {
            this.frm.get('isInvoiced').disable();
            this.frm.get('isInvoiced').patchValue(false);
          }
        } else {
          this.frm.get('isFolderSubmitted').disable();
          this.frm.get('isFolderSubmitted').patchValue(false);
        }
        if (this.frm.value.isPartialShipment) {
          this.frm.get('isShipped').disable();
          this.frm.get('isShipped').patchValue(false);
        } else if (this.frm.value.isShipped) {
          this.frm.get('isPartialShipment').disable();
          this.frm.get('isPartialShipment').patchValue(false);
        }
      } else {
        this.frm.get('isPartialShipment').disable();
        this.frm.get('isPartialShipment').patchValue(false);
        this.frm.get('isShipped').disable();
        this.frm.get('isShipped').patchValue(false);
        this.frm.get('isInvoiced').disable();
        this.frm.get('isInvoiced').patchValue(false);
        this.frm.get('isFolderSubmitted').disable();
        this.frm.get('isFolderSubmitted').patchValue(false);
      }
    } else {
      this.frm.get('isReadyToShip').disable();
      this.frm.get('isReadyToShip').patchValue(false);
      this.frm.get('isPartialShipment').disable();
      this.frm.get('isPartialShipment').patchValue(false);
      this.frm.get('isShipped').disable();
      this.frm.get('isShipped').patchValue(false);
      this.frm.get('isInvoiced').disable();
      this.frm.get('isInvoiced').patchValue(false);
      this.frm.get('isFolderSubmitted').disable();
      this.frm.get('isFolderSubmitted').patchValue(false);
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * checkLengthUploaderByType
   * @param {number} type
   * @returns {boolean}
   */
  public checkLengthUploaderByType(type: number): boolean {
    return this.frm.get('orderFiles').value.some((i) => i.type === type);
  }

  /**
   * openUploader
   * @param {number} type
   * @param {string} formProp
   */
  public openUploader(type: number, formProp?: string): void {
    this.backupData();
    if (formProp && !this.frm.get(formProp).value) {
      this.frm.get(formProp).setErrors({required: true});
      this.frm.get(formProp).markAsDirty();
      if (!this.checkLengthUploaderByType(type)) {
        return;
      }
    }
    if (!this.orderId) {
      this._toastrService.error('Please update detail first!',
        'Error');
      return;
    }
    const fileList = this.frm.get('orderFiles').value.filter((i) => i.type === type);
    let currentTypeList = Object.assign([], fileList);
    let modalRef = this._modalService.open(UploaderTypeComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static',
      windowClass: 'super-lg'
    });
    modalRef.componentInstance.title = this.typeMsg[type];
    Object.assign(modalRef.componentInstance.uploadOptions, {
      id: this.orderId,
      uploadType: type < 2 ? this.uploadedType.PoFiles : type < 4 ? this.uploadedType.CutTickets :
        (type === 4 ? this.uploadedType.OrderWorkSheets
          : this.uploadedType.TechPacks),
      fileList: fileList.filter((i) => i),
      fileType: type,
      isReadOnly: this.isPageReadOnly || this.isArchived || this.isCancelled
    });

    modalRef.result.then((res) => {
      if (res.status) {
        if (formProp && this.frm.get(formProp)) {
          this.frm.get(formProp).markAsDirty();
        }
        let isShowMsg = false;
        let currentFiles = this.frm.get('orderFiles').value.filter((i) => i.type !== type);
        if (res.newList && res.newList.length) {
          this._orderInfoService.uploadFileToOrder(this.orderId, res.newList)
            .subscribe((resp: ResponseMessage<UploadedFileModel[]>) => {
              if (resp.status) {
                // revalidate before publish
                if (this._salesOrderService.hasErBeforePublish) {
                  this._salesOrderService.reValidate(this.orderId);
                }
                if (currentTypeList.length) {
                  if (!isShowMsg) {
                    this._toastrService
                      .success(`${this.typeMsg[type]} updated successfully.`, 'Success');
                    isShowMsg = true;
                  }
                } else {
                  this._toastrService
                    .success(`${this.typeMsg[type]} uploaded successfully.`, 'Success');
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
                  this.frm.get('orderFiles').setValue([...currentFiles, ...currentTypeList]);
                  this._changeDetectorRef.markForCheck();
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
                this.frm.get('orderFiles').setValue([...currentFiles, ...currentTypeList]);

                if (currentTypeList.length === 0 && res.newList.length === 0) {
                  this._toastrService
                    .success(`${this.typeMsg[type]} removed successfully.`, 'Success');
                } else {
                  if (!isShowMsg) {
                    this._toastrService
                      .success(`${this.typeMsg[type]} updated successfully.`, 'Success');
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
          this._orderInfoService.updateOrderFiles(this.orderId, res.updateList)
            .subscribe((resp: BasicResponse) => {
              if (resp.status) {
                if (!isShowMsg) {
                  this._toastrService
                    .success(`${this.typeMsg[type]} updated successfully.`, 'Success');
                  isShowMsg = true;
                }
                this._changeDetectorRef.markForCheck();
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
      } else {
        let tFrm = this._localStorageService.get('backupData') as SalesOrderInfo;
        this.frm.get('orderFiles').patchValue(tFrm.orderFiles);
      }
    }, (err) => {
      // empty
    });
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
   * @param {boolean} isEdit
   */
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
   * onCancel
   */
  public onCancel(): void {
    let previousRoute: string = this._utilService.previousRouteUrl;
    if (previousRoute) {
      this._router.navigate([previousRoute]);
    } else {
      this._router.navigate(['order-log-v2']);
    }
  }

  /**
   * checkRegExpEmail
   * @param {FormControl} control
   * @returns {any}
   */
  public checkRegExpEmail(control: FormControl) {
    const reg = new RegExp('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@'
      + '[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$');
    if (reg.test(control.value) || control.value === '') {
      return null;
    } else {
      return {pattern: true};
    }
  }

  /**
   * onValidationError
   * @param event
   */
  public onValidationError(event): void {
    const reg = new RegExp('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@'
      + '[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$');
    if (reg.test(event['value'])) {
      const currentValue = this.frm.get('customerEmails').value;
      this.frm.get('customerEmails').patchValue([...currentValue, event['value']]);
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
   * onSubmitForm
   */
  public onSubmitForm(): void {
    this.isSubmitted = true;
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
      return;
    }
    this.myDatePickerService.addTimeToDateArray(this.frm, [
      'orderDateOnUtc',
      'productionCancelDateOnUtc'
    ]);

    // Clear data depend on order type
    const clearFrmValue = (propName: string[]): void => {
      propName.forEach((prop) => {
        this.frm.get(prop).patchValue('');
      });
    };
    if (+this.frm.get('fulfillmentType').value === 1
      || +this.frm.get('fulfillmentType').value === 3) {
      clearFrmValue([
        'transitTime',
        'firstDateToShip',
        'firstDateToShipOnUtc',
        'lastDateToShip',
        'lastDateToShipOnUtc'
      ]);
    }
    // -------------------------------
    if (!this.frm.get('customer2Type').value) {
      this.frm.get('customer2Type').patchValue(0);
    }

    // getRawValue: get all form control value, including any disabled controls
    let model = this.frm.getRawValue();
    if (this.orderId) {
      this._orderInfoService.updateOrderInfo(this.orderId, model)
        .subscribe((resp: ResponseMessage<SalesOrderInfo>) => {
          if (resp.status) {
            Object.assign(this.salesOrderInfoData, {
              ...resp.data,
              orderFiles: this.frm.get('orderFiles').value
            });
            if (this.salesOrderInfoData.customer2Type === 0) {
              this.salesOrderInfoData.customer2Type = null;
            }
            this.salesOrderInfoData.customer2TypeName = _.get(_.find(this.customer2TypeData,
              (i) => i.id === +this.salesOrderInfoData.customer2Type), 'name', '');
            this.updateForm(this.salesOrderInfoData);
            this._salesOrderService.setAM(!!this.frm.get('csr').value);
            this.getCommonDataWithNewValue();
            this._toastrService.success(resp.message, 'Success');
            // revalidate before publish
            if (this._salesOrderService.hasErBeforePublish) {
              this._salesOrderService.reValidate(this.orderId);
            }
            this._salesOrderService.setUpdateOrder(this.salesOrderInfoData);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    } else {
      this._orderInfoService.createOrder(model)
        .subscribe((resp: ResponseMessage<SalesOrderInfo>) => {
          if (resp.status) {
            this._router.navigate(['order-log-v2', resp.data.id]);
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
  }

  public copyToClipBoard($event) {
    if ($event.target) {
      $event.target.select();
      document.execCommand('copy');
    }
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  public onAppScroll(event: any) {
    if (event.type === 'resize') {
      if (this._utilService.scrollElm &&
        this._utilService.scrollElm.scrollHeight - (this._utilService.scrollElm.scrollTop
          + window.innerHeight) < 130) {
        this.isShowStickyBtn = false;
        this._changeDetectorRef.markForCheck();
      } else if (this._utilService.scrollElm) {
        this.isShowStickyBtn = true;
        this._changeDetectorRef.markForCheck();
      }
      return;
    }
    if (event.target.scrollingElement.scrollHeight - (event.target.scrollingElement
        .scrollTop + window.innerHeight) < 130) {
      this.isShowStickyBtn = false;
      this._changeDetectorRef.markForCheck();
    } else {
      this.isShowStickyBtn = true;
      this._changeDetectorRef.markForCheck();
    }
  }

  public ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
    this.routeSub.unsubscribe();
    this._subStatus.unsubscribe();
    this._subOrder.unsubscribe();
  }
}
