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
  BlankGoodsService
} from './blank-goods.service';
import {
  NgbActiveModal,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  ToastrService
} from 'ngx-toastr';
import {
  CommonService
} from '../../../../shared/services/common';
import {
  ValidationService
} from '../../../../shared/services/validation';
import {
  StyleService
} from '../../../+sales-order/+order-styles/+styles-info/+style/style.service';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';
import {
  ExtraValidators
} from '../../../../shared/services/validation';
import { OrderMainService } from '../../order-main.service';

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
import {
  IMyDate,
  IMyDateModel
} from 'mydatepicker';
import {
  BasicCustomerInfo,
  BasicVendorInfo
} from '../../../../shared/models';
import {
  StyleUploadedType
} from '../../../+sales-order/+order-styles/+styles-info/+style';
import {
  UploadedFileModel,
  UploadedType
} from '../../../+sales-order';
import { BasicResponse } from '../../../../shared/models';
import {
  UploaderTypeComponent
} from '../../../../shared/modules/uploader-type';
import {
  ItemTypes
} from '../../../+sales-order/+order-styles/order-styles.model';

@Component({
  selector: 'blank-goods',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'blank-goods.template.html',
  styleUrls: [
    'blank-goods.style.scss'
  ]
})
export class BlankGoodsComponent implements OnInit, AfterViewChecked {
  @ViewChildren('labelList')
  public labelList: QueryList<ElementRef>;
  @Input()
  public title = '';
  @Input()
  public orderId;
  @Input()
  public styleId;
  @Input()
  public rowDetails;
  @Input()
  public rowDetail;
  @Input()
  public styleList;
  @Input()
  public isBlankNotApplicable;
  @Input()
  public isPageReadOnly = false;

  public statusData;

  public frm: FormGroup;
  public formErrors = {
    vendorId: '',
    poNumber: '',
    comments: '',
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
      required: 'Blank ETA Start Date is required.',
      maxLength: 'Must be earlier than End Date.'
    },
    estDeliveryDateToOnUtc: {
      required: 'Blank ETA End Date is required.',
      maxLength: 'Must be later than Start Date.'
    },
    receivedDateFromOnUtc: {
      required: 'Blank Received Start Date is required.',
      maxLength: 'Must be earlier than End Date.'
    },
    receivedDateToOnUtc: {
      required: 'Blank Received End Date is required.',
      maxLength: 'Must be later than Start Date.'
    },
    default: {
      required: 'This is required.'
    }
  };
  public myDatePickerOptions = {
    selectorWidth: '220px',
    dateFormat: 'mm/dd/yyyy',
    showTodayBtn: false,
    showClearDateBtn: true,
    alignSelectorRight: true,
    openSelectorOnInputClick: true,
    openSelectorTopOfInput: true,
    editableDateField: true,
    selectionTxtFontSize: '12px',
    height: '28px',
    firstDayOfWeek: 'su',
    sunHighlight: false
  };
  public estDeliveryDateFromOptions = {...this.myDatePickerOptions};
  public estDeliveryDateToOptions = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public receivedDateFromOptions = {...this.myDatePickerOptions};
  public receivedDateToOptions = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public taskStatus = TaskStatus;
  public vendorData: BasicCustomerInfo[] = [];
  public blankGoodsEtaData = [];
  public styleUploadedType = StyleUploadedType;
  public uploadedType = UploadedType;
  public typeMsg = [
    'Tech Sheet(s)',
    'Blank Submission Form(s)',
    'Po'
  ];
  public labelHeights = [];
  public isLabelListChecked = false;

  public originData: any = {};
  public isOriginDataChange = [];

  constructor(public activeModal: NgbActiveModal,
              private _el: ElementRef,
              public myDatePickerService: MyDatePickerService,
              private _fb: FormBuilder,
              private _router: Router,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _styleService: StyleService,
              private _modalService: NgbModal,
              private _blankGoodsService: BlankGoodsService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _orderMainService: OrderMainService,
              private _toastrService: ToastrService) {
  }

  public ngOnInit(): void {
    if (this.rowDetails.styleInfo.itemType === ItemTypes.IMPORTS) {
      this.statusData = Status.filter((stt) => [
        TaskStatus.BLANK,
        TaskStatus.TBD,
        TaskStatus.SCHEDULED,
        TaskStatus.RECEIVED,
        TaskStatus.PARTIALLYRECEIVED,
        TaskStatus.COMPLETED
      ].indexOf(stt.id) > -1);
    } else {
      this.statusData = Status.filter((stt) => [
        TaskStatus.BLANK,
        TaskStatus.TBD,
        TaskStatus.SCHEDULED,
        TaskStatus.RECEIVED,
        TaskStatus.PARTIALLYRECEIVED
      ].indexOf(stt.id) > -1);
    }
    this.buildForm();
    this.getCommonData();
  }

  public ngAfterViewChecked(): void {
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
      blankGoods: this._fb.array([])
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  public get blankGoods(): FormArray {
    return this.frm.get('blankGoods') as FormArray;
  };

  public setBlankGoods(blankGoods: any[]) {
    const blankGoodsFGs = blankGoods.map((blankGood: any) => this._validationService.buildForm({
      status: new FormControl(blankGood.status, [Validators.required]),
      blankId: new FormControl(blankGood.blankId),
      poNumber: new FormControl(blankGood.poNumber, [
          Validators.compose([
            ExtraValidators.conditional(
              (group) => this.getSpecialRequireCase(group, 'poNumber'),
              Validators.compose([
                Validators.required
              ])
            )
          ])
        ]
      ),
      comments: new FormControl(blankGood.comments),
      vendorId: new FormControl(blankGood.vendorId,
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'vendorId'),
            Validators.compose([
              Validators.required
            ])
          )
        ])),
      vendorName: new FormControl(blankGood.vendorName),
      estDeliveryDateFrom: new FormControl(''),
      estDeliveryDateFromOnUtc: new FormControl(blankGood.estDeliveryDateFromOnUtc,
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
      previousEstDeliveryDateFromOnUtc: new FormControl(blankGood.estDeliveryDateFromOnUtc),
      estDeliveryDateFromOptions: new FormControl(this.estDeliveryDateFromOptions),
      estDeliveryDateTo: new FormControl(''),
      estDeliveryDateToOnUtc: new FormControl(blankGood.estDeliveryDateToOnUtc,
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('estDeliveryDateFromOnUtc')
        ])
      ),
      previousEstDeliveryDateToOnUtc: new FormControl(blankGood.estDeliveryDateToOnUtc),
      estDeliveryDateToOptions: new FormControl(this.estDeliveryDateToOptions),
      receivedDateFrom: new FormControl(''),
      receivedDateFromOnUtc: new FormControl(blankGood.receivedDateFromOnUtc,
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
      receivedDateFromOptions: new FormControl(this.receivedDateFromOptions),
      receivedDateTo: new FormControl(''),
      receivedDateToOnUtc: new FormControl(blankGood.receivedDateToOnUtc,
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('receivedDateFromOnUtc')
        ])
      ),
      receivedDateToOptions: new FormControl(this.receivedDateToOptions),
      styleList: this._fb.array([]),
      styleListOrigin: new FormControl([]),
      applyToStyles: new FormControl(''),
      files: new FormControl(blankGood.files || []),
      isUploadedPo: new FormControl(blankGood.isUploadedPo),
      formRequires: new FormControl({
        status: {
          required: true
        },
        vendorId: {
          required: false
        },
        poNumber: {
          required: false
        },
        comments: {
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
        }
      })
    }, this.formErrors, this.validationMessages));
    blankGoodsFGs.forEach((blank, i) => {
      if (this.styleList && this.styleList.length) {
        // checked styleId arr
        let applyToStylesIdArr = [];
        if (blankGoods[i] && blankGoods[i].applyToStyles) {
          applyToStylesIdArr = blankGoods[i].applyToStyles.split(',');
        }
        applyToStylesIdArr.push(this.styleId.toString());
        // build select form
        const styleFGs = this.styleList.map((style) => this._validationService.buildForm({
          styleId: new FormControl(style.orderDetailId),
          isSelected: new FormControl(
            applyToStylesIdArr.some((id) => id === style.orderDetailId.toString()))
        }, {}, {}));
        const styleFormArray = this._fb.array(styleFGs);
        blank.setControl('styleList', styleFormArray);
        blank.get('styleListOrigin').patchValue(blank.get('styleList').value);
      }
    });
    const contactFormArray = this._fb.array(blankGoodsFGs);
    this.frm.setControl('blankGoods', contactFormArray);
  }

  public addBlankGoods() {
    const blankGoodsFGs = this._validationService.buildForm({
      status: new FormControl(this.isBlankNotApplicable ? 1 : null, [Validators.required]),
      blankId: new FormControl(0),
      poNumber: new FormControl('',
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'poNumber'),
            Validators.compose([
              Validators.required
            ])
          )
        ])),
      comments: new FormControl(''),
      vendorId: new FormControl(null,
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'vendorId'),
            Validators.compose([
              Validators.required
            ])
          )
        ])),
      vendorName: new FormControl(''),
      estDeliveryDateFrom: new FormControl(''),
      estDeliveryDateFromOnUtc: new FormControl('',
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
      previousEstDeliveryDateFromOnUtc: new FormControl(''),
      estDeliveryDateFromOptions: new FormControl(this.estDeliveryDateFromOptions),
      estDeliveryDateTo: new FormControl(''),
      estDeliveryDateToOnUtc: new FormControl('',
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('estDeliveryDateFromOnUtc')
        ])
      ),
      previousEstDeliveryDateToOnUtc: new FormControl(''),
      estDeliveryDateToOptions: new FormControl(this.estDeliveryDateToOptions),
      receivedDateFrom: new FormControl(''),
      receivedDateFromOnUtc: new FormControl('',
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
      receivedDateFromOptions: new FormControl(this.receivedDateFromOptions),
      receivedDateTo: new FormControl(''),
      receivedDateToOnUtc: new FormControl('',
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('receivedDateFromOnUtc')
        ])
      ),
      receivedDateToOptions: new FormControl(this.receivedDateToOptions),
      styleList: this._fb.array([]),
      styleListOrigin: new FormControl([]),
      applyToStyles: new FormControl(''),
      files: new FormControl([]),
      isUploadedPo: new FormControl(''),
      formRequires: new FormControl({
        status: {
          required: true
        },
        vendorId: {
          required: false
        },
        poNumber: {
          required: false
        },
        comments: {
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
        }
      })
    }, this.formErrors, this.validationMessages);
    if (this.styleList && this.styleList.length) {
      // checked styleId arr
      let applyToStylesIdArr = [];
      applyToStylesIdArr.push(this.styleId.toString());
      // build select form
      const styleFGs = this.styleList.map((style) => this._validationService.buildForm({
        styleId: new FormControl(style.orderDetailId),
        isSelected: new FormControl(
          applyToStylesIdArr.some((id) => id === style.orderDetailId.toString()))
      }, {}, {}));
      const styleFormArray = this._fb.array(styleFGs);
      blankGoodsFGs.setControl('styleList', styleFormArray);
      blankGoodsFGs.get('styleListOrigin').patchValue(blankGoodsFGs.get('styleList').value);
    }
    this.blankGoods.push(blankGoodsFGs);
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
        && frm.get('vendorName').value !== null && frm.get('vendorName').value !== undefined
        && [
          'tee shirt central',
          'customer supplies blanks',
          'tsc',
          'tsc warehouse',
          'factory supplies blanks',
          'factory 1',
          'factory 1 warehouse'
        ].indexOf(frm.get('vendorName').value.toLowerCase()) === -1;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'estDeliveryDateFromOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.SCHEDULED
        && frm.get('vendorName').value !== null && frm.get('vendorName').value !== undefined
        && [
          'tee shirt central',
          'customer supplies blanks',
          'tsc',
          'tsc - whs',
          'tsc warehouse',
          'factory supplies blanks',
          'factory 1',
          'factory 1 warehouse'
        ].indexOf(frm.get('vendorName').value.toLowerCase()) === -1;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'receivedDateFromOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.RECEIVED
        || +frm.get('status').value === this.taskStatus.PARTIALLYRECEIVED;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'vendorId') {
      let status = +frm.get('status').value > this.taskStatus.TBD || frm.get('blankId').value === 0;
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
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getMachineNVendor('Blanks')
      .subscribe((resp: ResponseMessage<BasicVendorInfo[]>) => {
        if (resp.status) {
          this.vendorData = resp.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._blankGoodsService.getListBlankGoods(this.orderId, this.styleId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.blankGoodsEtaData = resp.data;
          if (resp.data && resp.data.length) {
            this.setBlankGoods(this.blankGoodsEtaData);
            for (let blankGoods of this.blankGoods.controls) {
              this.setDateValue(blankGoods);
            }
            this.prepareOriginData(this.blankGoodsEtaData);
          } else {
            this.addBlankGoods();
          }
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public onSelectItem(val, frm, valProp: string, formControlName: string): void {
    if (formControlName === 'status') {
      if ([
        this.taskStatus.RECEIVED,
        this.taskStatus.PARTIALLYRECEIVED
      ].indexOf(val[valProp]) > -1) {
        frm.get('styleList').patchValue(frm.get('styleListOrigin').value);
      }
      this.blankGoods.controls.forEach((ship: any) => {
        for (const field of Object.keys(ship.controls)) {
          ship.get(field).updateValueAndValidity();
        }
      });
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
      default:
        break;
    }
    this._changeDetectorRef.markForCheck();
  }

  public openUploader(frm: FormGroup, type: number, formProp?: string): void {
    let isCallApi = true;
    if (this.blankGoods.controls.length === 1 && !this.blankGoods.value[0].blankId) {
      isCallApi = false;
    }
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
        id: this.styleId,
        uploadType: type === this.styleUploadedType.ProductionPO ? this.uploadedType.CutTickets
          : type === this.styleUploadedType.BlankSubmission ? this.uploadedType.BlankSubmissionForm
            : type === this.styleUploadedType.QA ? this.uploadedType.PoStyle : '',
        fileList: fileList.filter((i) => i),
        fileType: type,
        isTrimPopup: true,
        isReadOnly: this.isPageReadOnly
      });

      modalRef.result.then((res) => {
        this._el.nativeElement.className = '';
        if (res.status) {
          let isShownMsg = false;
          if (isCallApi) {
            let currentTypeList = Object.assign([], fileList);
            if (res.newList && res.newList.length) {
              this._blankGoodsService
                .addBlankFileToBlankDetail(frm.get('blankId').value, res.newList)
                .subscribe((resp: ResponseMessage<UploadedFileModel[]>) => {
                  if (resp.status) {
                    if (currentTypeList.length) {
                      if (!isShownMsg) {
                        this._toastrService.success(
                          `${this.typeMsg[type]} file(s) updated successfully.`, 'Success');
                        isShownMsg = true;
                      }
                    } else {
                      frm.get('isUploadedPo').patchValue(true);
                      this._toastrService.success(
                        `${this.typeMsg[type]} file(s) uploaded successfully.`, 'Success');
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
                      // frm.get('files').setValue([...currentFiles, ...currentTypeList]);
                      frm.get('files').setValue([...currentTypeList]);
                    });
                    this._changeDetectorRef.markForCheck();
                  } else {
                    this._toastrService.error(resp.errorMessages, 'Error');
                  }
                });
            }
            if (res.deletedList && res.deletedList.length) {
              let deleteArr = res.deletedList.map((i) => i.id);
              this._blankGoodsService.deleteBlankFileDetail(frm.get('blankId').value, deleteArr)
                .subscribe((resp: BasicResponse) => {
                  if (resp.status) {
                    res.deletedList.forEach((item) => {
                      let indexItem = currentTypeList.findIndex((i) => i.id === item.id);
                      if (indexItem > -1) {
                        currentTypeList.splice(indexItem, 1);
                      }
                    });
                    // frm.get('files').setValue([...currentFiles, ...currentTypeList]);
                    frm.get('files').setValue([...currentTypeList]);

                    if (currentTypeList.length === 0 && res.newList.length === 0) {
                      frm.get('isUploadedPo').patchValue(false);
                      this._toastrService
                        .success(`${this.typeMsg[type]} file(s) removed successfully.`, 'Success');
                    } else {
                      if (!isShownMsg) {
                        this._toastrService.success(
                          `${this.typeMsg[type]} file(s) updated successfully.`, 'Success');
                        isShownMsg = true;
                      }
                    }
                    this._changeDetectorRef.markForCheck();
                  } else {
                    this._toastrService.error(resp.errorMessages, 'Error');
                  }
                });
            }
            if (res.updateList && res.updateList.length) {
              this._blankGoodsService.updateBlankFiles(frm.get('blankId').value, res.updateList)
                .subscribe((resp: BasicResponse) => {
                  if (resp.status) {
                    if (!isShownMsg) {
                      this._toastrService
                        .success(`${this.typeMsg[type]} file(s) updated successfully.`, 'Success');
                      isShownMsg = true;
                    }
                    this._changeDetectorRef.markForCheck();
                  } else {
                    this._toastrService.error(resp.errorMessages, 'Error');
                  }
                });
            }
          } else {
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
                frm.get('isUploadedPo').patchValue(false);
                this._toastrService
                  .success(`${this.typeMsg[type]} removed successfully.`, 'Success');
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
                frm.get('isUploadedPo').patchValue(true);
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
              frm.get('files').setValue([
                ...currentTypeList,
                ...res.newList
              ]);
              this._changeDetectorRef.markForCheck();
            }

            if (!isShownMsg) {
              this._toastrService
                .success(`${this.typeMsg[type]} updated successfully.`, 'Success');
            }
          }
        }
      }, (err) => {
        this._el.nativeElement.className = '';
      });
    };
    if ((frm.get('files').value && frm.get('files').value.length)
      || !this.checkLengthUploaderByType(frm)) {
      // const fileList = frm.get('files').value.filter((i) => i.type === type);
      const fileList = frm.get('files').value.filter((i) => i);
      funcUpload(fileList);
    } else {
      this._blankGoodsService.getBlankFileById(frm.get('blankId').value)
        .subscribe((response: ResponseMessage<any>) => {
          if (response.status) {
            frm.get('files').patchValue(response.data);
            // const fileList = frm.get('files').value.filter((i) => i.type === type);
            const fileList = frm.get('files').value.filter((i) => i);
            funcUpload(fileList);
          }
        });
    }
  }

  public checkLengthUploaderByType(frm: any): boolean {
    return frm.get('isUploadedPo').value;
  }

  public getMaxDate(currentDate: IMyDate, dateCompare: IMyDate): IMyDate {
    const timeCurrent = new Date(`${currentDate.month}/${currentDate.day}/${currentDate.year}`)
      .getTime();
    const timeDate = new Date(`${dateCompare.month}/${dateCompare.day}/${dateCompare.year}`)
      .getTime();
    return timeDate >= timeCurrent ? currentDate : dateCompare;
  }

  public formClick(e: MouseEvent) {
    if (e.toElement &&
      e.toElement.tagName !== 'BUTTON' &&
      !e.toElement.classList.contains('form-control') &&
      !e.toElement.classList.contains('icon-mydpcalendar') &&
      !e.toElement.classList.contains('selection')) {

      let eventClick = new Event('click');
      document.dispatchEvent(eventClick);
      this._changeDetectorRef.markForCheck();
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
    if (!leftLabel && !rightLabel) {
      return '';
    }
    return `${leftLabel}${leftLabel && rightLabel ? ' / ' : ''}${rightLabel}${itemType ?
      ` (${itemType})` : ''}`;
  }

  public checkFormValid(): boolean {
    let isValid = true;
    const checkValidControlFunc = (frm: FormGroup, list: string[]): boolean => {
      let isControlValue = true;
      list.forEach((i) => isControlValue = isControlValue
        && (frm.get(i).valid || frm.get(i).disabled));
      return isControlValue;
    };
    if (this.blankGoods.value.findIndex((i) => !i.status) > -1) {
      return false;
    }
    this.blankGoods.controls.forEach((blank: any) => {
      switch (+blank.get('status').value) {
        case this.taskStatus.TBD:
        case this.taskStatus.SCHEDULED:
          isValid = isValid && checkValidControlFunc(blank, [
            'vendorId',
            'estDeliveryDateFromOnUtc',
            'estDeliveryDateToOnUtc'
          ]);
          break;
        case this.taskStatus.RECEIVED:
        case this.taskStatus.PARTIALLYRECEIVED:
          isValid = isValid && checkValidControlFunc(blank, [
            'vendorId',
            'receivedDateFromOnUtc',
            'receivedDateToOnUtc'
          ]);
          blank.get('estDeliveryDateFromOnUtc')
            .patchValue(blank.get('previousEstDeliveryDateFromOnUtc').value);
          blank.get('estDeliveryDateToOnUtc')
            .patchValue(blank.get('previousEstDeliveryDateToOnUtc').value);
          break;
        case this.taskStatus.COMPLETED:
          isValid = isValid && checkValidControlFunc(blank, [
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
    if (this.checkFormValid()) {
      this.blankGoods.controls.forEach((blank: FormGroup) => {
        let listDate = [];
        if (+blank.get('status').value === this.taskStatus.SCHEDULED) {
          listDate = [
            'estDeliveryDateFromOnUtc',
            'estDeliveryDateToOnUtc'
          ];
        } else if (+blank.get('status').value === this.taskStatus.RECEIVED
          || +blank.get('status').value === this.taskStatus.PARTIALLYRECEIVED) {
          listDate = [
            'receivedDateFromOnUtc',
            'receivedDateToOnUtc'
          ];
        }
        this.myDatePickerService.addTimeToDateArray(blank, listDate);
      });
      // convert applyToStyles-form-array to ids-string
      this.blankGoods.controls.forEach((blank) => {
        if (blank.get('styleList').value && blank.get('styleList').value.length) {
          let idsArr = [];
          blank.get('styleList').value.forEach((style) => {
            if (style.isSelected) {
              idsArr.push(style.styleId);
            }
          });
          blank.get('applyToStyles').patchValue(idsArr.join());
        }
      });
      // is data change
      this.checkValueChange();
      this.activeModal.close({
        status: true,
        data: this.frm.value
      });
    } else {
      for (let blank of this.blankGoods.controls) {
        this._commonService.markAsDirtyForm(blank as FormGroup, true);
        this._changeDetectorRef.markForCheck();
      }
    }
  }

  public onClosePopup(): void {
    let isUploaded = false;
    this.blankGoods.controls.forEach((blank) => {
      if (blank.get('isUploadedPo').value) {
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
    this.originData.blankGoods = JSON.parse(JSON.stringify(data));
    this.originData.blankGoods.forEach((p, index) => {
      if (p.files == null) {
        p.files = [];
      }
      delete p.isUploadedPo;
      Object.keys(p).forEach((k) => {
        if (k.includes('OnUtc')) {
          p[k] = this.frm.value.blankGoods[index][k];
        }
      });
    });
  }

  public checkValueChange() {
    if (!this.originData.blankGoods) {
      this.frm.value.isChanged = true;
      this.frm.value.blankGoods.forEach((item) => {
        item.isChanged = true;
      });
      return;
    }
    this.isOriginDataChange = [];
    this.originData.blankGoods.forEach((p, index) => {
      let isDataChange = {value: false};
      this._orderMainService
        .checkValueChange(p, this.frm.value.blankGoods[index], isDataChange, true);
      if (isDataChange.value) {
        this.isOriginDataChange.push(index);
      }
    });
    if (this.isOriginDataChange.length) {
      this.frm.value.isChanged = true;
      this.isOriginDataChange.forEach((i) => {
        this.frm.value.blankGoods[i].isChanged = true;
      });
    }
  }
}
