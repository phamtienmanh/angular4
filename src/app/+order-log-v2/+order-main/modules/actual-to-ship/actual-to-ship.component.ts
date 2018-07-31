import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  NgbActiveModal,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

import {
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';

// Services
import { ExtraValidators } from '../../../../shared/services/validation';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../shared/services/common';
import { ValidationService } from '../../../../shared/services/validation';
import {
  StyleService
} from '../../../+sales-order/+order-styles/+styles-info/+style/style.service';
import { OrderMainService } from '../../order-main.service';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';

// Interfaces
import {
  Status,
  TaskStatus
} from '../../order-main.model';
import {
  BasicGeneralInfo,
  ResponseMessage
} from '../../../../shared/models';
import {
  UploaderTypeComponent
} from '../../../../shared/modules/uploader-type';
import {
  UploadedType
} from '../../../+sales-order';
import { ItemTypes } from '../../../+sales-order/+order-styles/order-styles.model';
import {
  ShippingInfoService
} from '../../../+sales-order/+order-styles/+styles-info/+shipping-info/shipping-info.service';
import {
  ShippingUploadType
} from '../../../+sales-order/+order-styles/+styles-info/+shipping-info';
import { Columns } from '../columns.model';

@Component({
  selector: 'actual-to-ship',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'actual-to-ship.template.html',
  styleUrls: [
    'actual-to-ship.style.scss'
  ]
})
export class ActualToShipComponent implements OnInit {
  @Input()
  public title = '';
  @Input()
  public orderId;
  @Input()
  public orderFilterType;
  @Input()
  public itemType;
  @Input()
  public orderDetailId;
  @Input()
  public rowDetail;
  @Input()
  public styleList;
  @Input()
  public responseType;

  public statusData = Status.filter((stt) => [
    TaskStatus.BLANK,
    TaskStatus.SCHEDULED,
    TaskStatus.PARTIAL,
    TaskStatus.DELIVERYCONFIRM,
    TaskStatus.DONE
  ].indexOf(stt.id) > -1);

  public frm: FormGroup;
  public formErrors = {
    status: '',
    paidBy: '',
    vendorName: '',
    bolNumber: '',
    cost: '',
    chargeToCustomer: '',
    shipDateOnUtc: '',
    schedShipDateOnUtc: '',
    shipVia: '',
    // shipViaName: '',
    trackingNumber: '',
    deliveryEtaDateOnUtc: '',
    deliveryConfirmedDateOnUtc: ''
  };
  public validationMessages = {
    status: {
      required: 'Status is required.'
    },
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
    schedShipDateOnUtc: {
      required: 'Ship Date is required.'
    },
    shipVia: {
      required: 'Ship Via is required.'
    },
    // shipViaName: {
    //   required: 'Ship Via is required.'
    // },
    trackingNumber: {
      required: 'Pro / Tracking is required.'
    },
    deliveryEtaDateOnUtc: {
      required: 'Delivery ETA Date is required.'
    },
    deliveryConfirmedDateOnUtc: {
      required: 'Delivery Confirmed Date is required.'
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
  public schedShipDateOptions = {
    ...this.myDatePickerOptions
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
  public shipViaList: BasicGeneralInfo[] = [];
  public taskStatus = TaskStatus;
  public uploadedType = UploadedType;
  // public typeMsg = [
  //   'Tech Sheet(s)',
  //   'Blank Submission Form(s)',
  //   'PO',
  //   'Shipment'
  // ];
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

  public originData: any = {};
  public isOriginDataChange = {value: false};

  constructor(public activeModal: NgbActiveModal,
              private _el: ElementRef,
              private _fb: FormBuilder,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _shippingInfoService: ShippingInfoService,
              private _toastrService: ToastrService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _styleService: StyleService,
              private _orderMainService: OrderMainService,
              private _modalService: NgbModal,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    this.buildForm();
    this.getCommonData();
    this.getShippingData();
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public buildForm(): void {
    let controlConfig = {
      status: new FormControl(null, [Validators.required]),
      orderDetailId: new FormControl(this.orderDetailId),
      actualShipDateApplyToStyles: new FormControl([]),
      listUpdateActualShipDateModel: this._fb.array([])
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);
  }

  public get listUpdateActualShipDateModel(): FormArray {
    return this.frm.get('listUpdateActualShipDateModel') as FormArray;
  };

  public addShip() {
    // if (!this.frm.get('status').value) {
    //   this._commonService.markAsDirtyForm(this.frm, true);
    //   this.listUpdateActualShipDateModel.controls.forEach((ship: any) => {
    //     this._commonService.markAsDirtyForm(ship, true);
    //   });
    //   return;
    // }
    this.listUpdateActualShipDateModel.push(this._validationService.buildForm({
      actualShipmentId: new FormControl(0),
      paidBy: new FormControl(null, [Validators.required]),
      vendorId: new FormControl(null),
      vendorName: new FormControl('', [Validators.required]),
      bolNumber: new FormControl('', [Validators.required]),
      cost: new FormControl('', [Validators.required]),
      chargeToCustomer: new FormControl('', [Validators.required]),
      schedShipDate: new FormControl(''),
      schedShipDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'schedShipDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      shipDate: new FormControl(''),
      shipDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'shipDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
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
      // shipViaId: new FormControl(''),
      // shipViaName: new FormControl('', [
      //   Validators.compose([
      //     ExtraValidators.conditional(
      //       (group) => this.getSpecialRequireCase(group, 'shipViaName'),
      //       Validators.compose([
      //         Validators.required
      //       ])
      //     )
      //   ])
      // ]),
      trackingNumber: new FormControl('', [
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
      deliveryEtaDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'deliveryEtaDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)')
        ])
      ]),
      deliveryConfirmedDate: new FormControl(''),
      deliveryConfirmedDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'deliveryConfirmedDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)')
        ])
      ]),
      comments: new FormControl(''),
      files: new FormControl([]),
      applyToStyles: new FormControl([this.orderDetailId]),
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
        schedShipDateOnUtc: {
          required: false
        },
        shipDateOnUtc: {
          required: false
        },
        shipVia: {
          required: false
        },
        // shipViaName: {
        //   required: false
        // },
        trackingNumber: {
          required: false
        },
        deliveryEtaDateOnUtc: {
          required: false
        },
        deliveryConfirmedDateOnUtc: {
          required: false
        }
      })
    }, this.formErrors, this.validationMessages));
    this.setDateValue(this.listUpdateActualShipDateModel
      .controls[this.listUpdateActualShipDateModel.controls.length - 1]);
    // (re)set validation messages now
    this.onValueChanged(this.listUpdateActualShipDateModel
      .controls[this.listUpdateActualShipDateModel.controls.length - 1]);
    // (re)set validation by getSpecialRequireCase func
    const frm: any = this.listUpdateActualShipDateModel
      .controls[this.listUpdateActualShipDateModel.controls.length - 1];
    for (const field of Object.keys(frm.controls)) {
      frm.get(field).updateValueAndValidity();
    }
    this._changeDetectorRef.markForCheck();
  }

  public setShipment(ships: any[]) {
    const blankFGs = ships.map((ship: any, i) => this._validationService.buildForm({
      actualShipmentId: new FormControl(ship.actualShipmentId),
      paidBy: new FormControl(ship.paidBy, [Validators.required]),
      vendorId: new FormControl(ship.vendorId),
      vendorName: new FormControl(ship.vendorName, [Validators.required]),
      bolNumber: new FormControl(ship.bolNumber, [Validators.required]),
      cost: new FormControl(ship.cost, [Validators.required]),
      chargeToCustomer: new FormControl(ship.chargeToCustomer, [Validators.required]),
      schedShipDate: new FormControl(''),
      schedShipDateOnUtc: new FormControl(ship.schedShipDateOnUtc, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'schedShipDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      shipDate: new FormControl(''),
      shipDateOnUtc: new FormControl(ship.shipDateOnUtc, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'shipDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
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
      // shipViaId: new FormControl(ship.shipViaId),
      // shipViaName: new FormControl(ship.shipViaName, [
      //   Validators.compose([
      //     ExtraValidators.conditional(
      //       (group) => this.getSpecialRequireCase(group, 'shipViaName'),
      //       Validators.compose([
      //         Validators.required
      //       ])
      //     )
      //   ])
      // ]),
      trackingNumber: new FormControl(ship.trackingNumber, [
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
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)')
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
      comments: new FormControl(ship.comments),
      files: new FormControl(ship.files || []),
      applyToStyles: new FormControl(ship.applyToStyles || []),
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
        schedShipDateOnUtc: {
          required: false
        },
        shipDateOnUtc: {
          required: false
        },
        shipVia: {
          required: false
        },
        // shipViaName: {
        //   required: false
        // },
        trackingNumber: {
          required: false
        },
        deliveryEtaDateOnUtc: {
          required: false
        },
        deliveryConfirmedDateOnUtc: {
          required: false
        }
      })
    }, this.formErrors, this.validationMessages));
    const blankFormArray = this._fb.array(blankFGs);
    this.frm.setControl('listUpdateActualShipDateModel', blankFormArray);

    this.listUpdateActualShipDateModel.controls.forEach((shipment) => {
      this.onValueChanged(shipment); // (re)set validation messages now
    });
  }

  public trackByFn(index, item) {
    return index; // or item.id
  }

  public deleteShip(i: number) {
    if (this.listUpdateActualShipDateModel.length < 2) {
      return;
    }
    this.listUpdateActualShipDateModel.removeAt(i);
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
      let status = this.frm.get('status').value === this.taskStatus.DELIVERYCONFIRM;
      caseList.forEach((cas) => status = status || !!frm.get(cas).value);
      caseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    };

    if (firstCaseList.findIndex((cas) => cas === key) > -1) {
      return getStatus(firstCaseList);
    } else if (key === 'schedShipDateOnUtc') {
      let status = this.frm.get('status').value === this.taskStatus.SCHEDULED;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'shipDateOnUtc') {
      let status = this.frm.get('status').value === this.taskStatus.PARTIAL
        || this.frm.get('status').value === this.taskStatus.DONE
        || this.frm.get('status').value === this.taskStatus.DELIVERYCONFIRM;
      frm.get('formRequires').value[key].required = status;
      return status;
    }
    return false;
  }

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
    patchDateFunc('schedShipDateOnUtc', 'schedShipDate');
    patchDateFunc('deliveryEtaDateOnUtc', 'deliveryEtaDate');
    patchDateFunc('deliveryConfirmedDateOnUtc', 'deliveryConfirmedDate');
  }

  public onSelectItem(val, frm, valProp: string, formControlName: string): void {
    if (val[valProp]) {
      frm.get(formControlName).patchValue(val[valProp]);
    } else {
      // add new
      frm.get(formControlName).patchValue(val);
    }
    if (formControlName === 'status') {
      this.listUpdateActualShipDateModel.controls.forEach((ship: any) => {
        ship.get('schedShipDateOnUtc').updateValueAndValidity();
        ship.get('shipDateOnUtc').updateValueAndValidity();
      });
    }
  }

  public updateIds(data: any): void {
    if (data) {
      if (data.actualShipDateApplyToStyles && data.actualShipDateApplyToStyles
        .findIndex((i) => i === this.orderDetailId) === -1) {
        data.actualShipDateApplyToStyles.push(this.orderDetailId);
      } else {
        data.actualShipDateApplyToStyles = [this.orderDetailId];
      }
      this.frm.get('actualShipDateApplyToStyles').patchValue(data.actualShipDateApplyToStyles);
      this.originData.actualShipDateApplyToStyles
        = JSON.parse(JSON.stringify(data.actualShipDateApplyToStyles));
      this._changeDetectorRef.markForCheck();
    }
  }

  public updateForm(data: any[]): void {
    if (data && data.length) {
      this.setShipment(data);
      this.listUpdateActualShipDateModel.controls.forEach((ship: any) => {
        this.setDateValue(ship);
        if (ship.get('applyToStyles').value
          .indexOf(this.orderDetailId) === -1) {
          let styleIds = ship.get('applyToStyles').value;
          styleIds.push(this.orderDetailId);
          ship.get('applyToStyles').patchValue(styleIds);
        }
      });
    } else {
      this.addShip();
    }
    this._changeDetectorRef.markForCheck();
  }

  public getShippingData(): void {
    this._shippingInfoService.getShippingInfo(this.orderId, this.orderDetailId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.frm.get('status').patchValue(resp.data.status);
          this.originData.status = this.rowDetail.status;
          this.updateIds(resp.data);
          if (resp.data.shipments && resp.data.shipments.length) {
            this.updateForm(resp.data.shipments);
            this.originData.listUpdateActualShipDateModel
              = JSON.parse(JSON.stringify(resp.data.shipments));
          } else {
            this.addShip();
          }
          this._changeDetectorRef.markForCheck();
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
  }

  /**
   * Fire date change event
   * @param event
   */
  public onDateChangedBy(event: IMyDateModel, frm: FormGroup, prop: string): void {
    let utcDate = Object.assign({}, event);
    frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');

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
      this._el.nativeElement.className = 'hide';
      modalRef.componentInstance.title = 'Shipment';
      modalRef.componentInstance.selectTypeData = this.shippingTypeData;
      Object.assign(modalRef.componentInstance.uploadOptions, {
        // id: this.styleId,
        fileList: fileList.filter((i) => i.type !== ShippingUploadType.Freight)
      });

      modalRef.result.then((res) => {
        this._el.nativeElement.className = '';
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
            frm.get('files').setValue([
              ...currentTypeList,
              ...res.newList
            ]);
            this._changeDetectorRef.markForCheck();
          }

          if (!isShownMsg) {
            this._toastrService
              .success(`Shipment updated successfully.`, 'Success');
          }
        }
      }, (err) => {
        this._el.nativeElement.className = '';
      });
    };
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
      this._el.nativeElement.className = 'hide';
      modalRef.componentInstance.title = 'Freight';
      modalRef.componentInstance.selectTypeData = [
        {
          id: ShippingUploadType.Freight,
          name: 'Freight'
        }
      ];
      Object.assign(modalRef.componentInstance.uploadOptions, {
        // id: this.styleId,
        fileList: fileList.filter((i) => i.type === ShippingUploadType.Freight)
      });

      modalRef.result.then((res) => {
        this._el.nativeElement.className = '';
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
        this._el.nativeElement.className = '';
      });
    };
    const fileList = frm.get('files').value;
    funcUpload(fileList);
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
   * getLabelString
   * @param style
   * @returns {string}
   */
  public getLabelString(style): string {
    let leftLabel = '';
    if (style.partnerStyle || style.partnerStyleName) {
      leftLabel += `(${style.partnerStyle || style.partnerStyleName}) `;
    }
    leftLabel += `${style.styleName ? style.styleName : ''}${style.styleName
    && (style.blankStyle || style.vendorStyleName) ?
      ' - ' : ''}${(style.blankStyle || style.vendorStyleName) ?
      (style.blankStyle || style.vendorStyleName) : ''}`;
    // ------------------------------------------
    let rightLabel = (style.color || style.colorName) ? (style.color || style.colorName) : '';
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

  public checkStatus(): void {
    if (!this.frm.get('status').value) {
      this._commonService.markAsDirtyForm(this.frm, true);
      this.listUpdateActualShipDateModel.controls.forEach((ship: any) => {
        this._commonService.markAsDirtyForm(ship, true);
      });
      return;
    }
    this.addShip();
  }

  /**
   * onSelectStyle
   * @param {number} orderDetailId
   */
  public onSelectStyle(frm, orderDetailId: number, prop): void {
    let currentDetailType = frm.get(prop).value || [];
    const duplTypeIndex = currentDetailType.indexOf(orderDetailId);
    if (duplTypeIndex > -1) {
      currentDetailType.splice(duplTypeIndex, 1);
    } else {
      currentDetailType.push(orderDetailId);
    }
    frm.get(prop).patchValue(currentDetailType);
  }

  public activeStylesChanges(frm, orderDetailId: number, prop): boolean {
    if (orderDetailId === this.orderDetailId) {
      return true;
    }
    return frm.get(prop).value && frm.get(prop).value.findIndex((i) => i === orderDetailId) > -1;
  }

  public checkFormValid(): boolean {
    if (!this.frm.get('status').value) {
      this._commonService.markAsDirtyForm(this.frm, true);
      return false;
    } else if (this.frm.get('status').value === this.taskStatus.BLANK) {
      return true;
    }
    let isValid = true;
    this.listUpdateActualShipDateModel.controls.forEach((ship: any) => {
      if (ship.invalid) {
        this._commonService.markAsDirtyForm(ship, true);
      }
      isValid = isValid && ship.valid;
    });
    return isValid;
  }

  public onSubmitForm(): void {
    if (this.checkFormValid()) {
      this.listUpdateActualShipDateModel.controls.forEach((ship: any) => {
        this.myDatePickerService.addUtcTimeToDateArray(ship, [
          'schedShipDateOnUtc'
        ]);
        this.myDatePickerService.addTimeToDateArray(ship, [
          'shipDateOnUtc',
          'deliveryEtaDateOnUtc',
          'deliveryConfirmedDateOnUtc'
        ]);
      });
      const formValue = Object.assign({}, this.frm.value);
      if (this.frm.get('status').value === this.taskStatus.BLANK) {
        formValue['listUpdateActualShipDateModel'] = [];
      }
      // is data change
      this._orderMainService
        .checkValueChange(this.originData, formValue, this.isOriginDataChange, true);
      if (this.isOriginDataChange.value) {
        formValue.isChanged = true;
      }
      this._orderMainService.changeStatusColumn(this.orderId, Columns.ActualShipDate,
        this.orderFilterType, this.itemType, formValue, this.responseType)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this.activeModal.close(resp.data);
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    } else {
      this.listUpdateActualShipDateModel.controls.forEach((ship: any) => {
        this._commonService.markAsDirtyForm(ship, true);
      });
      this._changeDetectorRef.markForCheck();
    }
  }
}
