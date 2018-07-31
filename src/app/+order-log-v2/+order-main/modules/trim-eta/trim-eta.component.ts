import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormArray
} from '@angular/forms';

import {
  Router
} from '@angular/router';

// Services
import {
  TrimEtaService
} from './trim-eta.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../shared/services/common';
import { ValidationService } from '../../../../shared/services/validation';
import { OrderMainService } from '../../order-main.service';
import {
  NgbActiveModal,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  TrimsInfoDetailService
} from '../../../+sales-order/+order-styles/+styles-info/+trims/+trims-detail';
import { ExtraValidators } from '../../../../shared/services/validation';
import * as _ from 'lodash';

// Validators
import {
  MinDate,
  MaxDate
} from '../../../../shared/validators';

// Interfaces
import {
  Status,
  TaskStatus
} from '../../order-main.model';
import {
  ResponseMessage
} from '../../../../shared/models';
import { BasicCustomerInfo } from '../../../../shared/models';
import {
  IMyDate,
  IMyDateModel
} from 'mydatepicker';
import {
  UploadedType
} from '../../../+sales-order';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';
import {
  UploaderTypeComponent
} from '../../../../shared/modules/uploader-type';
import {
  TrimUploadedType
} from '../../../+sales-order/+order-styles/+styles-info/+trims/+trims-detail';
import {
  ItemTypes
} from '../../../+sales-order/+order-styles/order-styles.model';

@Component({
  selector: 'trim-eta',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'trim-eta.template.html',
  styleUrls: [
    'trim-eta.style.scss'
  ]
})
export class TrimEtaComponent implements OnInit, AfterViewChecked {
  @ViewChildren('trimNameList')
  public trimNameList: QueryList<ElementRef>;
  @ViewChildren('labelList')
  public labelList: QueryList<ElementRef>;
  @Input()
  public title = '';
  @Input()
  public orderId;
  @Input()
  public rowDetails;
  @Input()
  public rowDetail;
  @Input()
  public styleList;
  @Input()
  public orderDetailId;
  @Input()
  public isPageReadOnly = false;

  public statusData;

  public frm: FormGroup;
  public formErrors = {
    vendorId: '',
    poNumber: '',
    estDeliveryDateFromOnUtc: '',
    estDeliveryDateToOnUtc: '',
    receivedDateFromOnUtc: '',
    receivedDateToOnUtc: ''
  };
  public validationMessages = {
    vendorId: {
      required: 'Vendor is required.'
    },
    poNumber: {
      required: 'PO # is required.'
    },
    estDeliveryDateFromOnUtc: {
      required: 'Trim ETA Date is required.',
      maxLength: 'Must be earlier than End Date.'
    },
    estDeliveryDateToOnUtc: {
      required: 'Trim ETA Date is required.',
      maxLength: 'Must be later than Start Date.'
    },
    receivedDateFromOnUtc: {
      required: 'Trim Received Date is required.',
      maxLength: 'Must be earlier than End Date.'
    },
    receivedDateToOnUtc: {
      required: 'Trim Received Date is required.',
      maxLength: 'Must be later than Start Date.'
    },
    default: {
      required: 'This is required.'
    }
  };
  public myDatePickerOptions = {
    dateFormat: 'mm/dd/yyyy',
    showTodayBtn: false,
    showClearDateBtn: true,
    openSelectorTopOfInput: true,
    editableDateField: true,
    selectionTxtFontSize: '12px',
    selectorWidth: '220px',
    height: '28px',
    firstDayOfWeek: 'su',
    sunHighlight: false
  };
  public estDeliveryDateFromOptions: any = {...this.myDatePickerOptions};
  public estDeliveryDateToOptions: any = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public receivedDateFromOptions: any = {...this.myDatePickerOptions};
  public receivedDateToOptions: any = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public checkedDateFromOptions: any = {...this.myDatePickerOptions};
  public checkedDateToOptions: any = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public taskStatus = TaskStatus;
  public vendorData: BasicCustomerInfo[] = [];
  public trimEtaData = [];
  public shippingCarrier = [];
  public trimList = [];

  public trimUploadedType = TrimUploadedType;
  public uploadedType = UploadedType;
  public typeMsg = [
    'Art Received',
    'Art Approved',
    'Po'
  ];
  public isAllPoSpecified = false;
  public trimNameMaxHeight = '';
  public labelHeights = [];
  public isTrimNameChecked = false;
  public isLabelListChecked = false;
  public isSelectListChecked = false;

  public originData: any = {};
  public isOriginDataChange = [];

  constructor(public activeModal: NgbActiveModal,
              private _el: ElementRef,
              public myDatePickerService: MyDatePickerService,
              private _modalService: NgbModal,
              private _fb: FormBuilder,
              private _router: Router,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _trimEtaService: TrimEtaService,
              private _trimsInfoDetailService: TrimsInfoDetailService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _orderMainService: OrderMainService,
              private _toastrService: ToastrService) {
    // empty
  }

  public ngOnInit(): void {
    if (this.rowDetails.styleInfo.itemType === ItemTypes.IMPORTS) {
      this.statusData = Status.filter((stt) => stt.name === 'TBD'
        || stt.name === 'Scheduled' || stt.name === 'Received'
        || stt.name === 'Partially Received' || stt.name === 'Completed');
    } else {
      this.statusData = Status.filter((stt) => stt.name === 'TBD'
        || stt.name === 'Scheduled' || stt.name === 'Received'
        || stt.name === 'Partially Received');
    }
    this.buildForm();
    this.getCommonData();
  }

  public ngAfterViewChecked(): void {
    if (!this.isTrimNameChecked && this.trimNameList.length) {
      this.trimNameMaxHeight = `${Math.max(...this.trimNameList
        .map((i) => +i.nativeElement.offsetHeight))}px`;
      this.isTrimNameChecked = true;
      setTimeout(() => {
        this._changeDetectorRef.markForCheck();
      });
    }
    if (!this.isLabelListChecked && this.labelList.length) {
      this.labelHeights = this.labelList
        .map((i) => `${+i.nativeElement.offsetHeight}px`);
      this.isLabelListChecked = true;
      setTimeout(() => {
        this._changeDetectorRef.markForCheck();
      });
    }
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public buildForm(): void {
    this.frm = this._fb.group({
      listPurchasing: this._fb.array([])
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  public get vendors(): FormArray {
    return this.frm.get('listPurchasing') as FormArray;
  };

  public setTrims(vendors: any[]) {
    const trimFGs = vendors.map((vendor: any) => this._validationService.buildForm({
      id: new FormControl(vendor.id),
      isUseForAllStyles: new FormControl(vendor.isUseForAllStyles),
      status: new FormControl(vendor.status),
      trimId: new FormControl(vendor.trimId),
      trimName: new FormControl(vendor.trimName),
      poNumber: new FormControl(vendor.poNumber, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'poNumber'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      vendorId: new FormControl(vendor.vendorId, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'vendorId'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      vendorName: new FormControl(vendor.vendorName),
      poComment: new FormControl(vendor.poComment),
      estDeliveryDateFrom: new FormControl(''),
      estDeliveryDateFromOnUtc: new FormControl(vendor.estDeliveryDateFromOnUtc,
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'estDeliveryDateFromOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('estDeliveryDateToOnUtc')
        ])
      ),
      previousEstDeliveryDateFromOnUtc: new FormControl(vendor.estDeliveryDateFromOnUtc),
      estDeliveryDateFromOptions: new FormControl(this.estDeliveryDateFromOptions),
      estDeliveryDateTo: new FormControl(''),
      estDeliveryDateToOnUtc: new FormControl(vendor.estDeliveryDateToOnUtc,
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('estDeliveryDateFromOnUtc')
        ])
      ),
      previousEstDeliveryDateToOnUtc: new FormControl(vendor.estDeliveryDateToOnUtc),
      estDeliveryDateToOptions: new FormControl(this.estDeliveryDateToOptions),
      receivedDateFrom: new FormControl(''),
      receivedDateFromOnUtc: new FormControl(vendor.receivedDateFromOnUtc,
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'receivedDateFromOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('receivedDateToOnUtc')
        ])
      ),
      previousReceivedDateFromOnUtc: new FormControl(vendor.receivedDateFromOnUtc),
      receivedDateFromOptions: new FormControl(this.receivedDateFromOptions),
      receivedDateTo: new FormControl(''),
      receivedDateToOnUtc: new FormControl(vendor.receivedDateToOnUtc,
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('receivedDateFromOnUtc')
        ])
      ),
      previousReceivedDateToOnUtc: new FormControl(vendor.receivedDateToOnUtc),
      receivedDateToOptions: new FormControl(this.receivedDateToOptions),
      checkedDateFrom: new FormControl(''),
      checkedDateFromOnUtc: new FormControl(vendor.checkedDateFromOnUtc,
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('checkedDateToOnUtc')
        ])
      ),
      checkedDateFromOptions: new FormControl(this.checkedDateFromOptions),
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
      checkedDateToOptions: new FormControl(this.checkedDateToOptions),
      files: new FormControl(vendor.files || []),
      styles: new FormControl(vendor.styles || []),
      mergeStyles: new FormControl(vendor.mergeStyles || []),
      stylesChanges: new FormControl(vendor.stylesChanges || []),
      stylesChangesOrigin: new FormControl(vendor.stylesChanges || []),
      applyChangesToStyleIds: new FormControl(vendor.applyChangesToStyleIds || []),
      formRequires: new FormControl({
        status: {
          required: false
        },
        vendorId: {
          required: false
        },
        poNumber: {
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
        carrierId: {
          required: false
        },
        trankingNumber: {
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
        }
      })
    }, this.formErrors, this.validationMessages));
    const contactFormArray = this._fb.array(trimFGs);
    this.frm.setControl('listPurchasing', contactFormArray);
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
    if (key === 'poNumber') {
      let status = +frm.get('status').value > 2
        && (frm.get('vendorName').value !== null && frm.get('vendorName').value !== undefined
          && [
            'tee shirt central',
            'customer supplies trims',
            'tsc',
            'tsc warehouse',
            'factory supplies trims',
            'factory 1',
            'factory 1 warehouse',
            'tsc - whs'
          ].indexOf(frm.get('vendorName').value.toLowerCase()) === -1);
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'estDeliveryDateFromOnUtc') {
      let status = (+frm.get('status').value === this.taskStatus.SCHEDULED ||
        +frm.get('status').value === this.taskStatus.PARTIALLYRECEIVED)
        && frm.get('vendorName').value !== null
        && frm.get('vendorName').value !== undefined
        && [
          'tee shirt central',
          'customer supplies trims',
          'tsc',
          'tsc warehouse',
          'factory supplies trims',
          'factory 1',
          'factory 1 warehouse',
          'tsc - whs'
        ].indexOf(frm.get('vendorName').value.toLowerCase()) === -1;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'receivedDateFromOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.RECEIVED
        || +frm.get('status').value === this.taskStatus.PARTIALLYRECEIVED;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'vendorName') {
      let status = !!frm.get('status').value;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else {
      return false;
    }
  }

  public setDateValue(frm: any): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (frm.get(importName).value) {
        const utcDate = new Date(frm.get(importName).value);
        let currentDate = new Date(Date.UTC(utcDate.getFullYear(),
          utcDate.getMonth(), utcDate.getDate(), utcDate.getHours(), utcDate.getMinutes()));
        this.configDateOptions(frm, importName, currentDate);
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
        this.configDateOptions(frm, importName, null);
      }
    };
    patchDateFunc('estDeliveryDateFromOnUtc', 'estDeliveryDateFrom');
    patchDateFunc('estDeliveryDateToOnUtc', 'estDeliveryDateTo');
    patchDateFunc('receivedDateFromOnUtc', 'receivedDateFrom');
    patchDateFunc('receivedDateToOnUtc', 'receivedDateTo');
    patchDateFunc('checkedDateFromOnUtc', 'checkedDateFrom');
    patchDateFunc('checkedDateToOnUtc', 'checkedDateTo');
    this._changeDetectorRef.markForCheck();
  }

  public getStyleList(): any[] {
    let styleList = this.styleList.map((i) => i.styleInfo);
    styleList.forEach((style, index) => {
      style.id = this.styleList[index].orderDetailId;
    });
    return styleList;
  }

  public getAllStyleList(): any[] {
    let styles = [];
    for (let vendor of this.vendors.controls) {
      vendor.get('styles').value.forEach((style) => {
        styles.push(style);
      });
    }
    return _.uniqBy(styles, 'id').filter((i: any) => i.id);
  }

  public setStyleChangeForVendors(frm: any): void {
    if (frm.get('isUseForAllStyles').value) {
      let stylesChanges = [];
      frm.get('styles').value.filter((i) => i.id).forEach((style) => {
        stylesChanges.push({
          id: style.id,
          trimId: style.trimId
        });
      });
      frm.get('stylesChanges').patchValue(stylesChanges);
      frm.get('stylesChangesOrigin').patchValue(_.cloneDeep(frm.get('stylesChanges').value));
    } else {
      const styleList = frm.get('styles').value || [];
      const applyStyles = frm.get('applyChangesToStyleIds').value;
      let stylesChanges = [];
      applyStyles.forEach((styleId: number) => {
        const currentStyle = styleList.find((i) => i.id === styleId);
        if (currentStyle) {
          stylesChanges.push({
            id: styleId,
            trimId: currentStyle.trimId
          });
        }
      });
      frm.get('stylesChanges').patchValue(stylesChanges);
      frm.get('stylesChangesOrigin').patchValue(_.cloneDeep(frm.get('stylesChanges').value));
    }
  }

  /**
   * activeStylesChanges
   * @param frm
   * @param {number} styleId
   * @returns {boolean}
   */
  public activeStylesChanges(frm: any, styleId: number): boolean {
    if (styleId === this.orderDetailId) {
      return true;
    }
    return frm.get('stylesChanges').value.findIndex((i) => i.id === styleId) > -1;
  }

  public onSelectStyle(event: any, frm: any, styleId: number): void {
    const checked = event.target.checked;
    if (!frm.get('stylesChanges').value) {
      frm.get('stylesChanges').patchValue([]);
    }
    if (checked) {
      const stylesChanges = frm.get('stylesChanges').value;
      const curStyle = frm.get('styles').value.find((i) => i.id === styleId);
      stylesChanges.push({
        id: styleId,
        trimId: curStyle.trimId
      });
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
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getMachineNVendor('Trims')
      .subscribe((resp: ResponseMessage<BasicCustomerInfo[]>) => {
        if (resp.status) {
          this.vendorData = resp.data;
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
    this._trimEtaService.getListTrimETA(this.orderId, this.orderDetailId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          if (resp.data && resp.data.length) {
            this.trimEtaData = _.sortBy(resp.data, 'trimName');
            let styleArr = [];
            this.trimEtaData.map((i) => i.styles).forEach((i) => {
              i.forEach((o) => {
                styleArr.push(o);
              });
            });
            let styles = _.uniqBy(styleArr, 'id');
            this.trimEtaData.forEach((trim) => {
              let styleList = [];
              styles.forEach((style) => {
                if (!trim.styles.some((i) => i.id === style.id)) {
                  styleList.push({id: null});
                } else {
                  styleList.push(style);
                }
              });
              trim.mergeStyles = styleList;
            });
            this.setTrims(this.trimEtaData);
            for (let vendor of this.vendors.controls) {
              if (vendor.get('applyChangesToStyleIds').value
                  .findIndex((i) => i === this.orderDetailId) === -1) {
                vendor.get('applyChangesToStyleIds')
                  .patchValue([
                    this.orderDetailId,
                    ...vendor.get('applyChangesToStyleIds').value
                  ]);
              }
              this.setDateValue(vendor);
              this.setStyleChangeForVendors(vendor);
            }
            this.prepareOriginData(this.trimEtaData);
            this.trimList = this.getTrimList();
          } else {
            // this.addTrim();
          }
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * Fire select value change event
   * @param value
   * @param prop
   */
  public onSelectItem(val, frm, valProp: string, formControlName: string): void {
    if (formControlName === 'status') {
      if ([
        this.taskStatus.RECEIVED,
        this.taskStatus.PARTIALLYRECEIVED
      ].indexOf(val[valProp]) > -1) {
        frm.get('stylesChanges').patchValue(frm.get('stylesChangesOrigin').value);
      }
      return;
    }
    if (val[valProp]) {
      frm.get(formControlName).patchValue(val[valProp]);
    } else {
      // add new
      frm.get(formControlName).patchValue(val);
    }
  }

  /**
   * Fire date change event
   * @param event
   */
  public onDateChangedBy(event: IMyDateModel, frm: any, prop: string): void {
    let utcDate = Object.assign({}, event);
    frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');
    if (prop === 'estDeliveryDateToOnUtc') {
      frm.get('previousEstDeliveryDateToOnUtc').setValue(utcDate.jsdate ? utcDate.formatted : '');
    } else if (prop === 'estDeliveryDateFromOnUtc') {
      frm.get('previousEstDeliveryDateFromOnUtc').setValue(utcDate.jsdate ? utcDate.formatted : '');
    } else if (prop === 'receivedDateFromOnUtc') {
      frm.get('previousReceivedDateFromOnUtc').setValue(utcDate.jsdate ? utcDate.formatted : '');
    } else if (prop === 'receivedDateToOnUtc') {
      frm.get('previousReceivedDateToOnUtc').setValue(utcDate.jsdate ? utcDate.formatted : '');
    }
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
    const currentDate = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 1
    };

    if (!utcDate) {
      switch (prop) {
        case 'estDeliveryDateFromOnUtc':
          // Config for cancel date options
          const estDeliveryDateToOptions = {
            ...this.estDeliveryDateToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            componentDisabled: true
          };
          const estDeliveryDateFromOptions = {
            ...this.estDeliveryDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          frm.get('estDeliveryDateToOptions').setValue(estDeliveryDateToOptions);
          frm.get('estDeliveryDateFromOptions').setValue(estDeliveryDateFromOptions);
          if (frm) {
            frm.get('estDeliveryDateToOnUtc').setValue(null);
            frm.get('estDeliveryDateTo').setValue(null);
          }
          break;
        case 'estDeliveryDateToOnUtc':
          // Config for start date options
          const estDeliveryDateFromOptions2 = {
            ...this.estDeliveryDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          frm.get('estDeliveryDateFromOptions').setValue(estDeliveryDateFromOptions2);
          break;
        case 'receivedDateFromOnUtc':
          // Config for cancel date options
          const receivedDateToOptions = {
            ...this.receivedDateToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            componentDisabled: true
          };
          const receivedDateFromOptions = {
            ...this.receivedDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          frm.get('receivedDateToOptions').setValue(receivedDateToOptions);
          frm.get('receivedDateFromOptions').setValue(receivedDateFromOptions);
          if (frm) {
            frm.get('receivedDateToOnUtc').setValue(null);
            frm.get('receivedDateTo').setValue(null);
          }
          break;
        case 'receivedDateToOnUtc':
          // Config for start date options
          const receivedDateFromOptions2 = {
            ...this.receivedDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          frm.get('receivedDateFromOptions').setValue(receivedDateFromOptions2);
          break;
        case 'checkedDateFromOnUtc':
          // Config for cancel date options
          const checkedDateToOptions = {
            ...this.checkedDateToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            componentDisabled: true
          };
          const checkedDateFromOptions = {
            ...this.checkedDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          frm.get('checkedDateToOptions').setValue(checkedDateToOptions);
          frm.get('checkedDateFromOptions').setValue(checkedDateFromOptions);
          if (frm) {
            frm.get('checkedDateToOnUtc').setValue(null);
            frm.get('checkedDateTo').setValue(null);
          }
          break;
        case 'checkedDateToOnUtc':
          // Config for start date options
          const checkedDateFromOptions2 = {
            ...this.checkedDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          frm.get('checkedDateFromOptions').setValue(checkedDateFromOptions2);
          break;
        default:
          break;
      }
      this._changeDetectorRef.markForCheck();
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
        const estDeliveryDateToOptions = {
          ...this.estDeliveryDateToOptions,
          disableUntil: dateCurrentUntil,
          disableSince: {
            year: 0,
            month: 0,
            day: 0
          },
          enableDays: [],
          componentDisabled: false
        };
        frm.get('estDeliveryDateToOptions').setValue(estDeliveryDateToOptions);
        break;
      case 'estDeliveryDateToOnUtc':
        // Config for start date options
        const estDeliveryDateFromOptions = {
          ...this.estDeliveryDateFromOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        frm.get('estDeliveryDateFromOptions').setValue(estDeliveryDateFromOptions);
        break;
      case 'receivedDateFromOnUtc':
        // Config for end date options
        const receivedDateToOptions = {
          ...this.receivedDateToOptions,
          disableUntil: dateCurrentUntil,
          disableSince: {
            year: 0,
            month: 0,
            day: 0
          },
          enableDays: [],
          componentDisabled: false
        };
        frm.get('receivedDateToOptions').setValue(receivedDateToOptions);
        break;
      case 'receivedDateToOnUtc':
        // Config for start date options
        const receivedDateFromOptions = {
          ...this.receivedDateFromOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        frm.get('receivedDateFromOptions').setValue(receivedDateFromOptions);
        break;
      case 'checkedDateFromOnUtc':
        // Config for end date options
        const checkedDateToOptions = {
          ...this.checkedDateToOptions,
          disableUntil: dateCurrentUntil,
          disableSince: {
            year: 0,
            month: 0,
            day: 0
          },
          enableDays: [],
          componentDisabled: false
        };
        frm.get('checkedDateToOptions').setValue(checkedDateToOptions);
        break;
      case 'checkedDateToOnUtc':
        // Config for start date options
        const checkedDateFromOptions = {
          ...this.checkedDateFromOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        frm.get('checkedDateFromOptions').setValue(checkedDateFromOptions);
        break;
      default:
        break;
    }
    this._changeDetectorRef.markForCheck();
  }

  public getMaxDate(currentDate: IMyDate, dateCompare: IMyDate): IMyDate {
    const timeCurrent = new Date(`${currentDate.month}/${currentDate.day}/${currentDate.year}`)
      .getTime();
    const timeDate = new Date(`${dateCompare.month}/${dateCompare.day}/${dateCompare.year}`)
      .getTime();
    return timeDate >= timeCurrent ? currentDate : dateCompare;
  }

  public checkLengthUploaderByType(frm: any): boolean {
    return frm.get('files').value && frm.get('files').value.length;
  }

  public openUploader(frm: any, type: number, formProp?: string): void {
    if (formProp && !frm.get(formProp).value) {
      frm.get(formProp).setErrors({required: true});
      frm.get(formProp).markAsDirty();
      this._changeDetectorRef.markForCheck();
      if (!this.checkLengthUploaderByType(frm)) {
        return;
      }
    }
    const funcUpload = (fileList) => {
      let modalRef = this._modalService.open(UploaderTypeComponent, {
        size: 'lg',
        keyboard: false,
        backdrop: 'static',
        windowClass: 'super-lg'
      });
      this._el.nativeElement.className = 'hide';
      modalRef.componentInstance.title = this.typeMsg[type];
      Object.assign(modalRef.componentInstance.uploadOptions, {
        id: frm.value.trimId,
        uploadType: type === this.trimUploadedType.ArtApproved ? this.uploadedType.ArtApprovedTrim
          : type === this.trimUploadedType.ArtReceived ? this.uploadedType.ArtReceivedTrim
            : type === this.trimUploadedType.PoTrim ? this.uploadedType.PoTrim : '',
        fileList: fileList.filter((i) => i),
        fileType: type,
        isTrimPopup: true,
        isReadOnly: this.isPageReadOnly
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
      }, (err) => {
        this._el.nativeElement.className = '';
      });
    };
    if ((frm.get('files').value && frm.get('files').value.length)
      || !this.checkLengthUploaderByType(frm)) {
      const fileList = frm.get('files').value;
      funcUpload(fileList);
    } else {
      this._trimsInfoDetailService.getTrimFileById(frm.value.trimId)
        .subscribe((response: ResponseMessage<any>) => {
          if (response.status) {
            frm.get('files').patchValue(response.data);
            const fileList = frm.get('files').value;
            funcUpload(fileList);
          }
        });
    }
  }

  public goToTrimDetail(trimId: number): void {
    this.activeModal.close();
    if (!this.orderDetailId) {
      this._router.navigate(['order-log-v2', this.orderId, 'trims-info', trimId]);
    } else {
      this._router.navigate([
        'order-log-v2', this.orderId,
        'styles', this.orderDetailId, 'trims', trimId
      ]);
    }
  }

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
   * getLabelString
   * @param style
   * @returns {string}
   */
  public getLabelString(style): string {
    let leftLabel = '';
    if (style.partnerStyleId || style.partnerStyle) {
      leftLabel += `(${style.partnerStyleId || style.partnerStyle}) `;
    }
    leftLabel += `${(style.partnerStyleName || style.styleName) ?
      (style.partnerStyleName || style.styleName) : ''}${(style.partnerStyleName || style.styleName)
    && style.blankStyle ? ' - ' : ''}${style.blankStyle ? style.blankStyle : ''}`;
    // ------------------------------------------
    let rightLabel = (style.colorName || style.color) ? (style.colorName || style.color) : '';
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
    if (!leftLabel && !rightLabel) {
      return '';
    }
    return `${leftLabel}${leftLabel && rightLabel ? ' / ' : ''}${rightLabel}${itemType ?
      ` (${itemType})` : ''}`;
  }

  public getLengthSameTrim(trimName: number): number {
    return _.uniq(this.trimEtaData.map((i) => i.trimName)).length;
  }

  public getLengthEachTrim(trimName: number): number {
    return this.trimEtaData.map((i) => i.trimName).length;
  }

  public getTrimList(): string[] {
    let trimList = this.vendors.value.map((i, index) => {
      return {
        trimName: i.trimName,
        trimId: i.trimId
      };
    });
    const trimNameList = _.uniq(this.vendors.value.map((i) => i.trimName));
    let trimGroup: any = _.groupBy(trimList, 'trimName');
    let trimResult = [];
    Object.keys(trimGroup).forEach((key, index) => {
      trimGroup[key].forEach((trim, trimIndex) => {
        if (trimIndex !== Math.floor((trimGroup[key].length - 1) / 2)) {
          trim.trimName = '';
        }
        trimResult.push(trim);
      });
    });
    return trimResult;
  }

  public isShowBorderRight(index: number): boolean {
    if (index >= this.vendors.length - 1) {
      return false;
    }
    return this.vendors.get((index + 1).toString()).value.trimName
      !== this.vendors.get(index.toString()).value.trimName;
  }

  public checkFormValid(): boolean {
    let isValid = true;
    const checkValidControlFunc = (frm: FormGroup, list: string[]): boolean => {
      let isControlValue = true;
      list.forEach((i) => isControlValue = isControlValue
        && (frm.get(i).valid || frm.get(i).disabled));
      return isControlValue;
    };
    if (!this.vendors.value.some((i) => i.status)) {
      return false;
    }
    this.vendors.controls.forEach((trim: any) => {
      switch (+trim.get('status').value) {
        case this.taskStatus.TBD:
        case this.taskStatus.SCHEDULED:
          isValid = isValid && checkValidControlFunc(trim, [
            'vendorId',
            'poNumber',
            'estDeliveryDateFromOnUtc',
            'estDeliveryDateToOnUtc'
          ]);
          break;
        case this.taskStatus.RECEIVED:
          isValid = isValid && checkValidControlFunc(trim, [
            'vendorId',
            'poNumber',
            'receivedDateFromOnUtc',
            'receivedDateToOnUtc',
            'checkedDateFromOnUtc',
            'checkedDateToOnUtc'
          ]);
          trim.get('estDeliveryDateFromOnUtc')
            .patchValue(trim.get('previousEstDeliveryDateFromOnUtc').value);
          trim.get('estDeliveryDateToOnUtc')
            .patchValue(trim.get('previousEstDeliveryDateToOnUtc').value);
          break;
        case this.taskStatus.PARTIALLYRECEIVED:
          isValid = isValid && checkValidControlFunc(trim, [
            'vendorId',
            'poNumber',
            'receivedDateFromOnUtc',
            'receivedDateToOnUtc',
            'checkedDateFromOnUtc',
            'checkedDateToOnUtc'
          ]);
          trim.get('receivedDateFromOnUtc')
            .patchValue(trim.get('previousReceivedDateFromOnUtc').value);
          trim.get('receivedDateToOnUtc')
            .patchValue(trim.get('previousReceivedDateToOnUtc').value);
          break;
        case this.taskStatus.COMPLETED:
          isValid = isValid && checkValidControlFunc(trim, [
            'vendorId'
          ]);
          break;
        default:
          break;
      }
    });
    return isValid;
  }

  public onSubmitForm(): void {
    if (!this.vendors.value.filter((i) => !!i.status).length) {
      this._toastrService
        .error('You must specify at least one Status to save changes.', 'Error');
      return;
    }
    let isReturn = false;
    let trimGroup = _.groupBy(this.vendors.value, 'trimId');
    Object.keys(trimGroup).forEach((key) => {
      if (!isReturn) {
        const listVendorId = trimGroup[key].map((i: any) => i.vendorId);
        isReturn = _.intersection(listVendorId, listVendorId).length !== listVendorId.length;
      }
    });

    if (isReturn) {
      this._toastrService
        .error('Vendor names cannot be duplicated for the same trim type.', 'Error');
      return;
    }
    if (this.checkFormValid()) {
      this.vendors.controls.forEach((vendor: FormGroup) => {
        let listDate = [];
        if (+vendor.get('status').value === this.taskStatus.SCHEDULED) {
          listDate = [
            'estDeliveryDateFromOnUtc',
            'estDeliveryDateToOnUtc'
          ];
        } else if (+vendor.get('status').value === this.taskStatus.RECEIVED) {
          listDate = [
            'receivedDateFromOnUtc',
            'receivedDateToOnUtc',
            'checkedDateFromOnUtc',
            'checkedDateToOnUtc'
          ];
        } else if (+vendor.get('status').value === this.taskStatus.PARTIALLYRECEIVED) {
          listDate = [
            'receivedDateFromOnUtc',
            'receivedDateToOnUtc',
            'checkedDateFromOnUtc',
            'checkedDateToOnUtc'
          ];
        }
        this.myDatePickerService.addTimeToDateArray(vendor, listDate);
      });
      // is data change
      this.checkValueChange();
      this.activeModal.close({
        status: true,
        data: this.frm.value
      });
    } else {
      for (let vendor of this.vendors.controls) {
        this._commonService.markAsDirtyForm(vendor as FormGroup, true);
      }
      this._changeDetectorRef.markForCheck();
    }
  }

  public onClosePopup(): void {
    let isUploaded = false;
    this.vendors.controls.forEach((vendor) => {
      if (vendor.get('files').value && vendor.get('files').value.length) {
        isUploaded = true;
      }
    });
    this.activeModal.close({
      status: false,
      data: {
        isUploaded
      }
    });
  }

  public prepareOriginData(data) {
    this.originData.listPurchasing = JSON.parse(JSON.stringify(data));
    this.originData.listPurchasing.forEach((p, index) => {
      if (p.files == null) {
        p.files = [];
      }
      delete p.isUploadedPo;
      p.stylesChanges
        = JSON.parse(JSON.stringify(this.frm.value.listPurchasing[index].stylesChanges));
      Object.keys(p).forEach((k) => {
        if (k.includes('OnUtc')) {
          p[k] = this.frm.value.listPurchasing[index][k];
        }
      });
    });
  }

  public checkValueChange() {
    if (!this.originData.listPurchasing) {
      this.frm.value.isChanged = true;
      this.frm.value.listPurchasing.forEach((item) => {
        item.isChanged = true;
      });
      return;
    }
    this.isOriginDataChange = [];
    this.originData.listPurchasing.forEach((p, index) => {
      let isDataChange = {value: false};
      this._orderMainService
        .checkValueChange(p, this.frm.value.listPurchasing[index], isDataChange, true);
      if (isDataChange.value) {
        this.isOriginDataChange.push(index);
      }
    });
    if (this.isOriginDataChange.length) {
      this.frm.value.isChanged = true;
      this.isOriginDataChange.forEach((i) => {
        this.frm.value.listPurchasing[i].isChanged = true;
      });
    }
  }
}
