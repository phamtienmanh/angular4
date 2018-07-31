import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
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
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

import {
  IMyDate,
  IMyDateModel
} from 'mydatepicker';

// Services
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../shared/services/common';
import { ValidationService } from '../../../../shared/services/validation';
import { ReadyToShipService } from './ready-to-ship.service';
import { OrderMainService } from '../../order-main.service';
import { ExtraValidators } from '../../../../shared/services/validation';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';

// Validators

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
  Columns
} from '../columns.model';
import { ItemTypes } from '../../../+sales-order/+order-styles/order-styles.model';

@Component({
  selector: 'ready-to-ship',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'ready-to-ship.template.html',
  styleUrls: [
    'ready-to-ship.style.scss'
  ]
})
export class ReadyToShipComponent implements OnInit {
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

  public statusData = Status.filter((stt) => [
    TaskStatus.BLANK,
    TaskStatus.SCHEDULED,
    TaskStatus.PARTIAL,
    TaskStatus.DONE
  ].indexOf(stt.id) > -1);

  public frm: FormGroup;
  public formErrors = {
    vendorId: '',
    readyToShipStartDateOnUtc: '',
    readyToShipEndDateOnUtc: '',
    schedReadyToShipStartDateOnUtc: '',
    schedReadyToShipEndDateOnUtc: ''
  };
  public validationMessages = {
    vendorId: {
      required: 'Vendor is required.'
    },
    readyToShipStartDateOnUtc: {
      required: 'Ready To Ship Date is required.',
      maxLength: 'Must be earlier than End Date.'
    },
    readyToShipEndDateOnUtc: {
      required: 'Ready To Ship Date is required.',
      maxLength: 'Must be later than Start Date.'
    },
    schedReadyToShipStartDateOnUtc: {
      required: 'Ready To Ship Date is required.',
      maxLength: 'Must be earlier than End Date.'
    },
    schedReadyToShipEndDateOnUtc: {
      required: 'Ready To Ship Date is required.',
      maxLength: 'Must be later than Start Date.'
    },
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
  };
  public readyToShipStartDateOptions: any = {...this.myDatePickerOptions};
  public readyToShipEndDateOptions: any = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public schedReadyToShipStartDateOptions: any = {...this.myDatePickerOptions};
  public schedReadyToShipEndDateOptions: any = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public vendorData: BasicGeneralInfo[] = [];
  public taskStatus = TaskStatus;
  public originData: any = {};
  public isOriginDataChange = {value: false};

  constructor(public activeModal: NgbActiveModal,
              private _fb: FormBuilder,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _readyToShipService: ReadyToShipService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _toastrService: ToastrService,
              private _orderMainService: OrderMainService,
              public myDatePickerService: MyDatePickerService) {
    // empty
  }

  public ngOnInit(): void {
    this.buildForm();
    this.frm.get('status').patchValue(this.rowDetail.status);
    this.originData.status = this.rowDetail.status;
    this.updateIds(this.rowDetail);
    this.getCommonData();
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public buildForm(): void {
    let controlConfig = {
      status: new FormControl(null, [Validators.required]),
      orderDetailId: new FormControl(this.orderDetailId),
      readyToShipApplyToStyles: new FormControl([]),
      listUpdateReadyToShip: this._fb.array([])
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);
  }

  public get listUpdateReadyToShip(): FormArray {
    return this.frm.get('listUpdateReadyToShip') as FormArray;
  }

  public addShipment(): void {
    this.listUpdateReadyToShip.push(this._validationService.buildForm({
      readyShipmentId: new FormControl(0),
      vendorId: new FormControl(null, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'vendorId'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      vendorName: new FormControl(''),
      schedReadyToShipStartDate: new FormControl(''),
      schedReadyToShipStartDateOnUtc:
        new FormControl('', [
          Validators.compose([
            ExtraValidators.conditional(
              (group) => this.getSpecialRequireCase(group, 'schedReadyToShipStartDateOnUtc'),
              Validators.compose([
                Validators.required
              ])
            ),
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
          ])
        ]),
      schedReadyToShipEndDate: new FormControl(''),
      schedReadyToShipEndDateOnUtc:
        new FormControl('', [
          Validators.compose([
            ExtraValidators.conditional(
              (group) => this.getSpecialRequireCase(group, 'schedReadyToShipEndDateOnUtc'),
              Validators.compose([
                Validators.required
              ])
            ),
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
          ])
        ]),
      schedReadyToShipStartDateOptions:
        new FormControl(this.schedReadyToShipStartDateOptions),
      schedReadyToShipEndDateOptions:
        new FormControl(this.schedReadyToShipEndDateOptions),

      readyToShipStartDate: new FormControl(''),
      readyToShipStartDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'readyToShipStartDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      readyToShipEndDate: new FormControl(''),
      readyToShipEndDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'readyToShipEndDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      readyToShipStartDateOptions: new FormControl(this.readyToShipStartDateOptions),
      readyToShipEndDateOptions: new FormControl(this.readyToShipEndDateOptions),
      applyToStyles: new FormControl([this.orderDetailId]),
      formRequires: new FormControl({
        vendorId: {
          required: true
        },
        schedReadyToShipStartDateOnUtc: {
          required: false
        },
        schedReadyToShipEndDateOnUtc: {
          required: false
        },
        readyToShipStartDateOnUtc: {
          required: false
        },
        readyToShipEndDateOnUtc: {
          required: false
        }
      })
    }, this.formErrors, this.validationMessages));
    this.setDateValue(this.listUpdateReadyToShip
      .controls[this.listUpdateReadyToShip.controls.length - 1]);
    // (re)set validation messages now
    this.onValueChanged(this.listUpdateReadyToShip
      .controls[this.listUpdateReadyToShip.controls.length - 1]);
    // (re)set validation by getSpecialRequireCase func
    const frm: any = this.listUpdateReadyToShip
      .controls[this.listUpdateReadyToShip.controls.length - 1];
    for (const field of Object.keys(frm.controls)) {
      frm.get(field).updateValueAndValidity();
    }
    this._changeDetectorRef.markForCheck();
  }

  public setShipment(listUpdateReadyToShip): void {
    let controlFGs = listUpdateReadyToShip.map((shipment) => this._validationService.buildForm({
      readyShipmentId: new FormControl(shipment.readyShipmentId),
      vendorId: new FormControl(shipment.vendorId, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'vendorId'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      vendorName: new FormControl(shipment.vendorName),
      schedReadyToShipStartDate: new FormControl(''),
      schedReadyToShipStartDateOnUtc:
        new FormControl(shipment.schedReadyToShipStartDateOnUtc, [
          Validators.compose([
            ExtraValidators.conditional(
              (group) => this.getSpecialRequireCase(group, 'schedReadyToShipStartDateOnUtc'),
              Validators.compose([
                Validators.required
              ])
            ),
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
          ])
        ]),
      schedReadyToShipEndDate: new FormControl(''),
      schedReadyToShipEndDateOnUtc:
        new FormControl(shipment.schedReadyToShipEndDateOnUtc, [
          Validators.compose([
            ExtraValidators.conditional(
              (group) => this.getSpecialRequireCase(group, 'schedReadyToShipEndDateOnUtc'),
              Validators.compose([
                Validators.required
              ])
            ),
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
          ])
        ]),
      schedReadyToShipStartDateOptions:
        new FormControl(this.schedReadyToShipStartDateOptions),
      schedReadyToShipEndDateOptions:
        new FormControl(this.schedReadyToShipEndDateOptions),

      readyToShipStartDate: new FormControl(''),
      readyToShipStartDateOnUtc: new FormControl(shipment.readyToShipStartDateOnUtc, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'readyToShipStartDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      readyToShipEndDate: new FormControl(''),
      readyToShipEndDateOnUtc: new FormControl(shipment.readyToShipEndDateOnUtc, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'readyToShipEndDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      readyToShipStartDateOptions: new FormControl(this.readyToShipStartDateOptions),
      readyToShipEndDateOptions: new FormControl(this.readyToShipEndDateOptions),
      applyToStyles: new FormControl(shipment.applyToStyles),
      formRequires: new FormControl({
        vendorId: {
          required: true
        },
        schedReadyToShipStartDateOnUtc: {
          required: false
        },
        schedReadyToShipEndDateOnUtc: {
          required: false
        },
        readyToShipStartDateOnUtc: {
          required: false
        },
        readyToShipEndDateOnUtc: {
          required: false
        }
      })
    }, this.formErrors, this.validationMessages));
    const controlArray = this._fb.array(controlFGs);
    this.frm.setControl('listUpdateReadyToShip', controlArray);

    this.listUpdateReadyToShip.controls.forEach((shipment) => {
      this.onValueChanged(shipment); // (re)set validation messages now
    });
    this._changeDetectorRef.markForCheck();
  }

  public deleteShipment(index: number): void {
    if (this.listUpdateReadyToShip.length < 2) {
      return;
    }
    this.listUpdateReadyToShip.removeAt(index);
    this._changeDetectorRef.markForCheck();
  }

  public onValueChanged(form: any): void {
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
    if (key === 'vendorId') {
      let status = this.frm.get('status').value > this.taskStatus.BLANK;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'schedReadyToShipStartDateOnUtc') {
      let status = this.frm.get('status').value === this.taskStatus.SCHEDULED;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'readyToShipStartDateOnUtc') {
      let status = +this.frm.get('status').value
        === this.taskStatus.PARTIAL || +this.frm.get('status').value
        === this.taskStatus.DONE;
      frm.get('formRequires').value[key].required = status;
      return status;
    }
  }

  public setDateValue(frm): void {
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
    patchDateFunc('schedReadyToShipStartDateOnUtc', 'schedReadyToShipStartDate');
    patchDateFunc('schedReadyToShipEndDateOnUtc', 'schedReadyToShipEndDate');
    patchDateFunc('readyToShipStartDateOnUtc', 'readyToShipStartDate');
    patchDateFunc('readyToShipEndDateOnUtc', 'readyToShipEndDate');
    this._changeDetectorRef.markForCheck();
  }

  public updateIds(data: any): void {
    if (data) {
      if (data.readyToShipApplyToStyles && data.readyToShipApplyToStyles
        .findIndex((i) => i === this.orderDetailId) === -1) {
        data.readyToShipApplyToStyles.push(this.orderDetailId);
      } else {
        data.readyToShipApplyToStyles = [this.orderDetailId];
      }
      this.frm.get('readyToShipApplyToStyles').patchValue(data.readyToShipApplyToStyles);
      this.originData.readyToShipApplyToStyles
        = JSON.parse(JSON.stringify(data.readyToShipApplyToStyles));
      this._changeDetectorRef.markForCheck();
    }
  }

  public updateForm(data: any): void {
    if (data && data.length) {
      this.setShipment(data);
      this.listUpdateReadyToShip.controls.forEach((shipment) => {
        this.setDateValue(shipment);
        if (shipment.get('applyToStyles').value
          .indexOf(this.orderDetailId) === -1) {
          let styleIds = shipment.get('applyToStyles').value;
          styleIds.push(this.orderDetailId);
          shipment.get('applyToStyles').patchValue(styleIds);
        }
      });
    } else {
      this.addShipment();
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getVendorList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.vendorData = resp.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._readyToShipService.getListReadyToShip(this.orderId, this.orderDetailId)
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.updateForm(resp.data);
          this.originData.listUpdateReadyToShip = JSON.parse(JSON.stringify(resp.data));
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
      this.listUpdateReadyToShip.controls.forEach((ship: any) => {
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
  public onDateChangedBy(event: IMyDateModel, frm, prop: string): void {
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
        case 'schedReadyToShipStartDateOnUtc':
          // Config for cancel date options
          frm.get('schedReadyToShipEndDateOptions').patchValue({
            ...this.schedReadyToShipEndDateOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            componentDisabled: true
          });
          frm.get('schedReadyToShipStartDateOptions').patchValue({
            ...this.schedReadyToShipStartDateOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          });
          if (frm) {
            frm.get('schedReadyToShipEndDateOnUtc').setValue(null);
            frm.get('schedReadyToShipEndDate').setValue(null);
          }
          break;
        case 'schedReadyToShipEndDateOnUtc':
          // Config for start date options
          frm.get('schedReadyToShipStartDateOptions').patchValue({
            ...this.schedReadyToShipStartDateOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          });
          break;
        case 'readyToShipStartDateOnUtc':
          // Config for cancel date options
          frm.get('readyToShipEndDateOptions').patchValue({
            ...this.readyToShipEndDateOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            componentDisabled: true
          });
          frm.get('readyToShipStartDateOptions').patchValue({
            ...this.readyToShipStartDateOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          });
          if (frm) {
            frm.get('readyToShipEndDateOnUtc').setValue(null);
            frm.get('readyToShipEndDate').setValue(null);
          }
          break;
        case 'readyToShipEndDateOnUtc':
          // Config for start date options
          frm.get('readyToShipStartDateOptions').patchValue({
            ...this.readyToShipStartDateOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          });
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
      case 'readyToShipStartDateOnUtc':
        // Config for end date options
        frm.get('readyToShipEndDateOptions').patchValue({
          ...this.readyToShipEndDateOptions,
          disableUntil: this.getMaxDate(currentDate, dateCurrentUntil),
          disableSince: currentDate,
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentUntil), currentDate)
            //   ? '' : dateCurrentUntil
          ],
          componentDisabled: false
        });
        break;
      case 'readyToShipEndDateOnUtc':
        // Config for start date options
        frm.get('readyToShipStartDateOptions').patchValue({
          ...this.readyToShipStartDateOptions,
          disableSince: this.getMaxDate(currentDate, dateCurrentSince),
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentSince), currentDate)
            //   ? '' : dateCurrentSince
          ]
        });
        break;
      case 'schedReadyToShipStartDateOnUtc':
        // Config for end date options
        frm.get('schedReadyToShipEndDateOptions').patchValue({
          ...this.schedReadyToShipEndDateOptions,
          disableUntil: dateCurrentUntil,
          disableSince: {
            year: 0,
            month: 0,
            day: 0
          },
          enableDays: [],
          componentDisabled: false
        });
        break;
      case 'schedReadyToShipEndDateOnUtc':
        // Config for start date options
        frm.get('schedReadyToShipStartDateOptions').patchValue({
          ...this.schedReadyToShipStartDateOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        });
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

  public checkFormValid(): boolean {
    let isValid = true;
    const checkValidControlFunc = (frm: FormGroup, list: string[]): boolean => {
      let isControlValue = true;
      list.forEach((i) => isControlValue = isControlValue
        && (frm.get(i).valid || frm.get(i).disabled));
      return isControlValue;
    };
    if (!this.frm.get('status').value) {
      return false;
    }
    this.listUpdateReadyToShip.controls.forEach((shipment: any) => {
      switch (+this.frm.get('status').value) {
        case this.taskStatus.BLANK:
          break;
        case this.taskStatus.SCHEDULED:
          isValid = isValid && checkValidControlFunc(shipment, [
            'vendorId',
            'schedReadyToShipStartDateOnUtc',
            'schedReadyToShipEndDateOnUtc'
          ]);
          break;
        case this.taskStatus.PARTIAL:
        case this.taskStatus.DONE:
          isValid = isValid && checkValidControlFunc(shipment, [
            'vendorId',
            'readyToShipStartDateOnUtc',
            'readyToShipEndDateOnUtc'
          ]);
          break;
        default:
          break;
      }
    });
    return isValid;
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
    return `${leftLabel}${leftLabel && rightLabel ? ' / ' : ''}${rightLabel} (${itemType})`;
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

  public checkStatus(): void {
    if (!this.frm.get('status').value) {
      this._commonService.markAsDirtyForm(this.frm, true);
      this.listUpdateReadyToShip.controls.forEach((ship: any) => {
        this._commonService.markAsDirtyForm(ship, true);
      });
      return;
    }
    this.addShipment();
  }

  public activeStylesChanges(frm, orderDetailId: number, prop): boolean {
    if (orderDetailId === this.orderDetailId) {
      return true;
    }
    return frm.get(prop).value && frm.get(prop).value.findIndex((i) => i === orderDetailId) > -1;
  }

  public onSubmitForm(): void {
    if (this.checkFormValid()) {
      let listDate = [];
      if (+this.frm.get('status').value === this.taskStatus.SCHEDULED) {
        listDate = [];
      } else if (+this.frm.get('status').value === this.taskStatus.PARTIAL
        || +this.frm.get('status').value === this.taskStatus.DONE) {
        listDate = [
          'readyToShipStartDateOnUtc',
          'readyToShipEndDateOnUtc'
        ];
      }
      this.listUpdateReadyToShip.controls.forEach((ship: any) => {
        this.myDatePickerService.addTimeToDateArray(ship, listDate);
      });
      const formValue = Object.assign({}, this.frm.value);
      if (this.frm.get('status').value === this.taskStatus.BLANK) {
        formValue['listUpdateReadyToShip'] = [];
      }
      // is data change
      this._orderMainService
        .checkValueChange(this.originData, formValue, this.isOriginDataChange, true);
      if (this.isOriginDataChange.value) {
        formValue.isChanged = true;
      }
      this._orderMainService.changeStatusColumn(this.orderId, Columns.ReadyToShipDate,
        this.orderFilterType, this.itemType, formValue)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this.activeModal.close(resp.data);
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
      this.listUpdateReadyToShip.controls.forEach((ship: any) => {
        this._commonService.markAsDirtyForm(ship, true);
      });
      this._changeDetectorRef.markForCheck();
    }
  }
}
