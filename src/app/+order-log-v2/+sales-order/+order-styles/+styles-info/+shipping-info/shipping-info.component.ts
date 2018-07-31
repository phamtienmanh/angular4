import {
  Component,
  ViewEncapsulation,
  OnInit,
  AfterViewInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

// Services
import {
  CommonService
} from '../../../../../shared/services/common';
import {
  ToastrService
} from 'ngx-toastr';
import {
  ExtraValidators,
  ValidationService
} from '../../../../../shared/services/validation';
import {
  Util
} from '../../../../../shared/services/util';
import {
  ShippingInfoService
} from './shipping-info.service';
import { AuthService } from '../../../../../shared/services/auth';
import {
  MyDatePickerService
} from '../../../../../shared/services/my-date-picker';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SalesOrderService } from '../../../sales-order.service';

// Interfaces
import {
  UploadedType
} from '../../../../+sales-order';
import {
  SalesShippingInfo,
  ShippingUploadType
} from './shipping-info.model';
import {
  ResponseMessage,
  BasicGeneralInfo
} from '../../../../../shared/models';
import {
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  Subscription
} from 'rxjs/Subscription';
import {
  UploaderTypeComponent
} from '../../../../../shared/modules/uploader-type';
import * as _ from 'lodash';
import { StylesInfoService } from '../styles-info.service';
import { ItemTypes } from '../../order-styles.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'shipping-info',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'shipping-info.template.html',
  styleUrls: [
    'shipping-info.style.scss'
  ]
})
export class ShippingInfoComponent implements OnInit, AfterViewInit, OnDestroy {
  public orderId: number;
  public styleId: number;
  public frm: FormGroup;
  public formErrors = {
    paidBy: '',
    vendorName: '',
    bolNumber: '',
    cost: '',
    chargeToCustomer: '',
    shipDateOnUtc: '',
    shipVia: '',
    shipViaName: '',
    trackingNumber: '',
    deliveryEtaDateOnUtc: '',
    deliveryConfirmedDateOnUtc: '',
    comments: ''
  };
  public validationMessages = {
    bolNumber: {
      required: 'BOL is required.'
    },
    paidBy: {
      required: 'Paid By is required.'
    },
    vendorName: {
      required: 'Vendor is required.'
    },
    cost: {
      required: 'Cost is required.'
    },
    chargeToCustomer: {
      required: 'Charge to Customer is required.'
    },
    shipDateOnUtc: {
      required: 'Ship Date is required.'
    },
    shipVia: {
      required: 'Ship Via is required.'
    },
    shipViaName: {
      required: 'Ship Via is required.'
    },
    trackingNumber: {
      required: 'Pro / Tracking is required.'
    },
    deliveryEtaDateOnUtc: {
      required: 'Delivery ETA Date is required.'
    },
    deliveryConfirmedDateOnUtc: {
      required: 'Delivery Confirmed Date is required.'
    },
    comments: {
      required: 'Comments is required.'
    },
    default: {
      required: 'This is required.'
    }
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
  public shipDateOptions = {
    ...this.myDatePickerOptions
  };
  public deliveryEtaDateOptions = {
    ...this.myDatePickerOptions
  };
  public deliveryConfirmedDateOptions = {
    ...this.myDatePickerOptions
  };
  public vendorData: any[] = [];
  public styleList: any[] = [];
  public shipViaList: BasicGeneralInfo[] = [];

  public uploadedType = UploadedType;
  public shippingTypeData = [
    {
      id: ShippingUploadType.BOL,
      name: 'BOL'
    },
    {
      id: ShippingUploadType.PackingList,
      name: 'PackingList'
    },
    {
      id: ShippingUploadType.Other,
      name: 'Other'
    }
  ];
  public paidByData = [
    {
      id: 1,
      name: 'TSC'
    },
    {
      id: 2,
      name: 'Customer'
    }
  ];
  public activatedSub: Subscription;

  public shippingInfoData: any;
  public preShippingInfoData: any;
  public isPageReadOnly = false;
  public isOrderCancelled = false;
  public isOrderArchived = false;
  public isStyleReadOnly = false;
  public isStyleCancelled = false;

  public isShowStickyBtn = false;

  private _subOrderStatus: Subscription;
  private _subOrderData: Subscription;

  constructor(private _fb: FormBuilder,
              private _utilService: Util,
              private _activatedRoute: ActivatedRoute,
              private _validationService: ValidationService,
              private _toastrService: ToastrService,
              private _shippingInfoService: ShippingInfoService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _stylesInfoService: StylesInfoService,
              private _salesOrderService: SalesOrderService,
              private _router: Router,
              private _authService: AuthService,
              private _commonService: CommonService,
              private _modalService: NgbModal,
              public myDatePickerService: MyDatePickerService) {
    this.orderId = +this._salesOrderService.orderIndex.orderId;
    this.styleId = +this._salesOrderService.orderIndex.styleId;
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
    this._stylesInfoService.getUpdateStyle().subscribe((styleData) => {
      this.isStyleCancelled = styleData.isCancelled;
      this._changeDetectorRef.markForCheck();
    });
    this.buildForm();
    this.getCommonData();
    this.getShippingData();
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      if (this._utilService.scrollElm) {
        if (this._utilService.scrollElm
            .scrollHeight - window.innerHeight > 70) {
          this.isShowStickyBtn = true;
          this._changeDetectorRef.markForCheck();
        }
      }
    }, 1000);
  }

  /**
   * setDateValue
   */
  public setDateValue(frm: any): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (frm.get(importName).value) {
        const listNotUpdateTime = [
          ''
        ];
        const utcDate = new Date(frm.get(importName).value);
        let currentDate;
        if (listNotUpdateTime.indexOf(importName) > -1) {
          currentDate = new Date(frm.get(importName).value);
        } else {
          currentDate = new Date(Date.UTC(utcDate.getFullYear(),
            utcDate.getMonth(), utcDate.getDate(), utcDate.getHours(), utcDate.getMinutes()));
        }
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
    patchDateFunc('shipDateOnUtc', 'shipDate');
    patchDateFunc('deliveryEtaDateOnUtc', 'deliveryEtaDate');
    patchDateFunc('deliveryConfirmedDateOnUtc', 'deliveryConfirmedDate');
    this._changeDetectorRef.markForCheck();
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
    if (formControlName === 'status') {
      this.shipments.controls.forEach((ship: any) => {
        ship.get('schedShipDateOnUtc').updateValueAndValidity();
        ship.get('shipDateOnUtc').updateValueAndValidity();
      });
    }
  }

  /**
   * buildForm
   */
  public buildForm(): void {
    let controlConfig = {
      shipments: this._fb.array([])
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);

    this.onValueChanged(); // (re)set validation messages now
  }

  public addShip() {
    this.shipments.push(this._fb.group({
      actualShipmentId: new FormControl(0),
      paidBy: new FormControl(null, [Validators.required]),
      vendorId: new FormControl(null),
      vendorName: new FormControl('', [Validators.required]),
      bolNumber: new FormControl('', [Validators.required]),
      cost: new FormControl('', [Validators.required]),
      chargeToCustomer: new FormControl('', [Validators.required]),
      shipDate: new FormControl(null),
      shipDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.required,
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      shipVia: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'shipVia'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      shipViaId: new FormControl(''),
      shipViaName: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'shipViaName'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      trackingNumber: new FormControl({
        value: '',
        disabled: this.isPageReadOnly
      }, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'trackingNumber'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      deliveryEtaDate: new FormControl(null),
      deliveryEtaDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'deliveryEtaDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      deliveryConfirmedDate: new FormControl(null),
      deliveryConfirmedDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'deliveryConfirmedDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      comments: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'comments'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      files: new FormControl([]),
      applyToStyles: new FormControl([this.styleId]),
      formRequires: new FormControl({
        paidBy: {
          required: true
        },
        vendorName: {
          required: true
        },
        bolNumber: {
          required: true
        },
        cost: {
          required: true
        },
        chargeToCustomer: {
          required: true
        },
        shipDateOnUtc: {
          required: true
        },
        shipVia: {
          required: false
        },
        shipViaName: {
          required: false
        },
        trackingNumber: {
          required: false
        },
        deliveryEtaDateOnUtc: {
          required: false
        },
        deliveryConfirmedDateOnUtc: {
          required: false
        },
        comments: {
          required: false
        }
      })
    }));
    if (this._utilService.scrollElm) {
      setTimeout(() => {
        this.onAppScroll({target: {scrollingElement: this._utilService.scrollElm}});
        this._changeDetectorRef.markForCheck();
      }, 250);
    }
    this.setDateValue(this.shipments
      .controls[this.shipments.controls.length - 1]);
    // (re)set validation messages now
    this.onValueChanged(this.shipments
      .controls[this.shipments.controls.length - 1]);
    // (re)set validation by getSpecialRequireCase func
    const frm: any = this.shipments
      .controls[this.shipments.controls.length - 1];
    for (const field of Object.keys(frm.controls)) {
      frm.get(field).updateValueAndValidity();
    }
    this._changeDetectorRef.markForCheck();
  }

  public setShipment(ships: any[]) {
    const blankFGs = ships.map((ship: any, i) => this._fb.group({
      actualShipmentId: new FormControl(ship.actualShipmentId),
      paidBy: new FormControl(ship.paidBy, [Validators.required]),
      vendorId: new FormControl(ship.vendorId),
      vendorName: new FormControl(ship.vendorName, [Validators.required]),
      bolNumber: new FormControl(ship.bolNumber, [Validators.required]),
      cost: new FormControl(ship.cost, [Validators.required]),
      chargeToCustomer: new FormControl(ship.chargeToCustomer, [Validators.required]),
      shipDate: new FormControl(''),
      shipDateOnUtc: new FormControl(ship.shipDateOnUtc, [
        Validators.compose([
          Validators.required,
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      shipVia: new FormControl(ship.shipVia, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'shipVia'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      shipViaId: new FormControl(ship.shipViaId),
      shipViaName: new FormControl(ship.shipViaName, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'shipViaName'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      trackingNumber: new FormControl({
        value: ship.trackingNumber,
        disabled: this.isPageReadOnly
      }, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'trackingNumber'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      deliveryEtaDate: new FormControl(''),
      deliveryEtaDateOnUtc: new FormControl(ship.deliveryEtaDateOnUtc, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'deliveryEtaDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      deliveryConfirmedDate: new FormControl(''),
      deliveryConfirmedDateOnUtc: new FormControl(ship.deliveryConfirmedDateOnUtc, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'deliveryConfirmedDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      comments: new FormControl(ship.comments, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'comments'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      files: new FormControl(ship.files || []),
      applyToStyles: new FormControl(ship.applyToStyles || [this.styleId]),
      formRequires: new FormControl({
        paidBy: {
          required: true
        },
        vendorName: {
          required: true
        },
        bolNumber: {
          required: true
        },
        cost: {
          required: true
        },
        chargeToCustomer: {
          required: true
        },
        shipDateOnUtc: {
          required: true
        },
        shipVia: {
          required: false
        },
        shipViaName: {
          required: false
        },
        trackingNumber: {
          required: false
        },
        deliveryEtaDateOnUtc: {
          required: false
        },
        deliveryConfirmedDateOnUtc: {
          required: false
        },
        comments: {
          required: false
        }
      })
    }));
    const blankFormArray = this._fb.array(blankFGs);
    this.frm.setControl('shipments', blankFormArray);

    this.shipments.controls.forEach((shipment) => {
      this.onValueChanged(shipment); // (re)set validation messages now
    });
  }

  public get shipments(): FormArray {
    return this.frm.get('shipments') as FormArray;
  };

  public deleteShip(i: number) {
    this.shipments.removeAt(i);
    if (this._utilService.scrollElm) {
      setTimeout(() => {
        this.onAppScroll({target: {scrollingElement: this._utilService.scrollElm}});
        this._changeDetectorRef.markForCheck();
      }, 250);
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * onValueChanged
   * @param {SalesShippingInfo} data
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
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    let firstCaseList = [
      'shipVia',
      // 'shipViaName',
      'trackingNumber',
      'deliveryEtaDateOnUtc',
      'deliveryConfirmedDateOnUtc'
    ];
    let getStatus = (caseList: string[]): boolean => {
      let status = false;
      caseList.forEach((cas) => status = status || !!frm.get(cas).value);
      caseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    };

    if (firstCaseList.findIndex((cas) => cas === key) > -1) {
      return getStatus(firstCaseList);
    }
    return false;
  }

  /**
   * Bind UTC date to form
   * @param event
   * @param prop
   */
  public onDateChangedBy(event: IMyDateModel, frm: FormGroup, prop: string): void {
    let utcDate = Object.assign({}, event);

    frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');

    // Special case
    let dateCurrentSince = Object.assign({}, event.date);
    if (dateCurrentSince.day) {
      dateCurrentSince.day++;
    }
    let dateCurrentUntil = Object.assign({}, event.date);
    if (dateCurrentUntil.day) {
      dateCurrentUntil.day--;
    }

    // Update status for form control whose value changed
    frm.get(prop).markAsDirty();
    this._changeDetectorRef.markForCheck();
  }

  public openUploader(frm: FormGroup, type: number): void {
    const funcUpload = (fileList: any[]) => {
      let modalRef = this._modalService.open(UploaderTypeComponent, {
        size: 'lg',
        keyboard: false,
        backdrop: 'static',
        windowClass: 'super-lg'
      });
      modalRef.componentInstance.title = 'Shipment';
      modalRef.componentInstance.selectTypeData = this.shippingTypeData;
      Object.assign(modalRef.componentInstance.uploadOptions, {
        // id: this.styleId,
        fileList: fileList.filter((i) => i.type !== ShippingUploadType.Freight),
        isReadOnly: this.isPageReadOnly || this.isStyleReadOnly
        || this.isStyleCancelled || this.isOrderArchived || this.isOrderCancelled
      });

      modalRef.result.then((res) => {
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
                .success(`Shipment removed successfully.`, 'Success');
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
                .success(`Shipment uploaded successfully.`, 'Success');
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
              .success(`Shipment updated successfully.`, 'Success');
          }
        }
      }, (err) => {
        // empty
      });
    };
    // const fileList = frm.get('files').value.filter((i) => i.type === type);
    const fileList = frm.get('files').value;
    funcUpload(fileList);
  }

  public openFreightUploader(frm: FormGroup, type: number): void {
    const funcUpload = (fileList: any[]) => {
      let modalRef = this._modalService.open(UploaderTypeComponent, {
        size: 'lg',
        keyboard: false,
        backdrop: 'static',
        windowClass: 'super-lg'
      });
      modalRef.componentInstance.title = 'Freight';
      modalRef.componentInstance.selectTypeData = [
        {
          id: ShippingUploadType.Freight,
          name: 'Freight'
        }
      ];
      Object.assign(modalRef.componentInstance.uploadOptions, {
        // id: this.styleId,
        fileList: fileList.filter((i) => i.type === ShippingUploadType.Freight),
        isReadOnly: this.isPageReadOnly || this.isStyleReadOnly
        || this.isStyleCancelled || this.isOrderArchived || this.isOrderCancelled
      });

      modalRef.result.then((res) => {
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
                .success(`Freight removed successfully.`, 'Success');
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
                .success(`Freight uploaded successfully.`, 'Success');
            }

            if (res.duplicatedList && res.duplicatedList.length) {
              res.duplicatedList.forEach((i) => {
                if (currentTypeList.indexOf(i) > -1) {
                  currentTypeList.splice(currentTypeList.indexOf(i), 1);
                }
              });
            }
            frm.get('files').setValue([
              ...currentTypeList,
              ...res.newList
            ]);
            this._changeDetectorRef.markForCheck();
          }

          if (!isShownMsg) {
            this._toastrService
              .success(`Freight updated successfully.`, 'Success');
          }
        }
      }, (err) => {
        // empty
      });
    };
    const fileList = frm.get('files').value;
    funcUpload(fileList);
  }

  public trackByFn(index, item) {
    return index; // or item.id
  }

  public checkLengthUploaderByType(frm: any, files: string): boolean {
    let fileArr = frm.get('files').value;
    if (files === 'freightFiles') {
      fileArr = fileArr.filter((i) => i.type === ShippingUploadType.Freight);
    } else {
      fileArr = fileArr.filter((i) => i.type !== ShippingUploadType.Freight);
    }
    return fileArr && fileArr.length;
  }

  /**
   * Get current order info if has
   */
  public getShippingData(): void {
    const updateFormFunc = () => {
      if (this.shippingInfoData && this.shippingInfoData.length) {
        this.updateForm(this.shippingInfoData);
      } else if (!this.isPageReadOnly) {
        this.addShip();
        this.preShippingInfoData = _.cloneDeep(this.frm.getRawValue());
      }
    };
    this._shippingInfoService.getShippingInfo(this.orderId, this.styleId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.shippingInfoData = resp.data.shipments;
          updateFormFunc();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getMachineNVendor('Shipment')
      .subscribe((resp: ResponseMessage<any[]>) => {
        if (resp.status) {
          this.vendorData = resp.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._commonService.getShipViaList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.shipViaList = resp.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._stylesInfoService.getStyleList(this.orderId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.styleList =
            _.sortBy(resp.data, [
              'type',
              'partnerStyle',
              'partnerStyleName',
              'blankStyle',
              'blankColor'
            ]);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * Update form value
   * @param data
   */
  public updateForm(data: any[]): void {
    this.setShipment(data);
    this.shipments.controls.forEach((ship: any) => this.setDateValue(ship));
    setTimeout(() => {
      this.preShippingInfoData = _.cloneDeep(this.frm.getRawValue());
    });
    this.getCommonData();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * onSubmitForm
   */
  public onSubmitForm(): void {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
      this.shipments.controls.forEach((f: any, i) => {
        this._commonService.markAsDirtyForm(f);
      });
      this._changeDetectorRef.markForCheck();
      return;
    }
    this.shipments.controls.forEach((ship: any) => {
      this.myDatePickerService.addTimeToDateArray(ship, [
        'shipDateOnUtc',
        'deliveryEtaDateOnUtc',
        'deliveryConfirmedDateOnUtc'
      ]);
    });
    this._shippingInfoService.updateShippingInfo(this.orderId, this.styleId, this.shipments.value)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.shippingInfoData = resp.data.shipments;
          if (this.shippingInfoData && this.shippingInfoData.length) {
            this.updateForm(this.shippingInfoData);
          } else {
            this.addShip();
            setTimeout(() => {
              this.preShippingInfoData = _.cloneDeep(this.frm.getRawValue());
            });
          }
          this._changeDetectorRef.markForCheck();
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
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
   * activeStylesChanges
   * @param frm
   * @param {number} styleId
   * @returns {boolean}
   */
  public activeStylesChanges(frm: any, styleId: number): boolean {
    if (styleId === this.styleId) {
      return true;
    }
    return frm.get('applyToStyles').value.findIndex((i) => i === styleId) > -1;
  }

  public onSelectStyle(event: any, frm: any, styleId: number): void {
    const checked = event.target.checked;
    if (!frm.get('applyToStyles').value) {
      frm.get('applyToStyles').patchValue([]);
    }
    if (checked) {
      const applyToStyles = frm.get('applyToStyles').value;
      applyToStyles.push(styleId);
      frm.get('applyToStyles').patchValue(applyToStyles);
    } else {
      const applyToStyles = frm.get('applyToStyles').value;
      const deletedStyleIndex = applyToStyles.findIndex((i) => i === styleId);
      if (deletedStyleIndex > -1) {
        applyToStyles.splice(deletedStyleIndex, 1);
      }
      frm.get('applyToStyles').patchValue(applyToStyles);
    }
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
    leftLabel += `${style.partnerStyleName ? style.partnerStyleName : ''}${style.partnerStyleName
    && style.blankStyle ? ' - ' : ''}${style.blankStyle ? style.blankStyle : ''}`;
    // ------------------------------------------
    let rightLabel = style.blankColor ? style.blankColor : '';
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
    this._changeDetectorRef.markForCheck();
  }

  public ngOnDestroy(): void {
    this._subOrderStatus.unsubscribe();
    this._subOrderData.unsubscribe();
  }
}
