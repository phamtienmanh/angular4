import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

import {
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

import {
  QcSampleShipTopService
} from './qc-sample-ship-top.service';

// Services
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
  ShippingService
} from '../../../+sales-order/+order-styles/+styles-info/+tops-v2/+tops-detail/tops-detail.service';

// Validators
import {
  MaxDateToday
} from '../../../../shared/validators';

// Interfaces
import {
  Status,
  TaskStatus
} from '../../outsource-main.model';
import {
  BasicGeneralInfo,
  ResponseMessage
} from '../../../../shared/models';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';
import {
  ExtraValidators
} from '../../../../shared/services/validation';
import { LeadEtaComponent } from '../+shared';

@Component({
  selector: 'qc-sample-ship-top',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'qc-sample-ship-top.template.html',
  styleUrls: [
    // 'qc-sample-ship-top.style.scss'
  ]
})
export class QcSampleShipTopComponent implements OnInit {
  @Input()
  public orderId;
  @Input()
  public orderDetailId;
  @Input()
  public isPageReadOnly = false;
  @Input()
  public isLeadTimeReadOnly = false;
  @Input()
  public rowDetail;
  @Input()
  public type = 'outsource';

  @ViewChild(LeadEtaComponent)
  public leadEtaComponent: LeadEtaComponent;

  public statusData = Status.filter((stt) => stt.name === 'Rejected'
    || stt.name === 'Approved');

  public frm: FormGroup;
  public formErrors = {
    qcSampleDateRejectedOnUtc: '',
    qcSampleDateOnUtc: '',
    shipToCarrierId: '',
    shipToMethodId: '',
    shipToTracking: '',
    shipFromDateShippedOnUtc: '',
    qcSampleDateComment: '',
  };
  public validationMessages = {
    qcSampleDateRejectedOnUtc: {},
    qcSampleDateOnUtc: {},
    shipToCarrierId: {},
    shipToMethodId: {},
    shipToTracking: {},
    shipFromDateShippedOnUtc: {},
    qcSampleDateComment: {},
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
    // disableSince: {
    //   year: new Date().getFullYear(),
    //   month: new Date().getMonth() + 1,
    //   day: new Date().getDate() + 1
    // }
  };
  public myTodayPickerOptions = {
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
    disableSince: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 1
    }
  };
  public taskStatus = TaskStatus;
  public shippingCarrier = [];
  public shippingCarrierSv = [];
  private _storedData;

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _qcSampleShipTopService: QcSampleShipTopService,
              private _shippingService: ShippingService,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    this.buildForm();
    this.getCommonData();
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public buildForm(): void {
    let controlConfig = {
      columnId: new FormControl(this.rowDetail.columnId),
      qcSampleDateStatus: new FormControl(null),
      qcSampleDateRejected: new FormControl(''),
      qcSampleDateRejectedOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'secondCase'),
            Validators.required
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ]),
      ]),
      qcSampleDate: new FormControl(''),
      qcSampleDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.required
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ]),
      ]),
      shipToCarrierId: new FormControl(null, Validators.compose([
        ExtraValidators.conditional(
          (group) => this.getSpecialRequireCase(group, 'firstCase'),
          Validators.required
        )
      ])),
      shipToCarrierName: new FormControl(''),
      shipToMethodId: new FormControl(null, Validators.compose([
        ExtraValidators.conditional(
          (group) => this.getSpecialRequireCase(group, 'firstCase'),
          Validators.required
        )
      ])),
      shipToMethodName: new FormControl(''),
      shipToTracking: new FormControl('', Validators.compose([
        ExtraValidators.conditional(
          (group) => this.getSpecialRequireCase(group, 'firstCase'),
          Validators.required
        )
      ])),
      shipFromDateShipped: new FormControl(''),
      shipFromDateShippedOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'firstCase'),
            Validators.required
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ]),
      ]),
      qcSampleDateComment: new FormControl(''),
      formRequires: new FormControl({
        qcSampleDateStatus: {
          required: false
        },
        qcSampleDateRejectedOnUtc: {
          required: false
        },
        qcSampleDateOnUtc: {
          required: false
        },
        shipToCarrierId: {
          required: false
        },
        shipToMethodId: {
          required: false
        },
        shipToTracking: {
          required: false
        },
        shipFromDateShippedOnUtc: {
          required: false
        },
        qcSampleDateComment: {
          required: false
        }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);

    this.onValueChanged(); // (re)set validation messages now
  }

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    if (key === 'firstCase') {
      let listCase = [
        'qcSampleDateOnUtc',
        'shipToCarrierId',
        'shipToMethodId',
        'shipToTracking',
        'shipFromDateShippedOnUtc'
      ];
      let isRequired = [
        this.taskStatus.APPROVED
      ].indexOf(+this.frm.get('qcSampleDateStatus').value) > -1;
      listCase.forEach((caseStr) => {
        frm.get('formRequires').value[caseStr].required = isRequired;
      });
      return isRequired;
    } else if (key === 'secondCase') {
      let listCase = [
        'qcSampleDateRejectedOnUtc'
      ];
      let isRequired = [
        this.taskStatus.REJECTED
      ].indexOf(+this.frm.get('qcSampleDateStatus').value) > -1;
      listCase.forEach((caseStr) => {
        frm.get('formRequires').value[caseStr].required = isRequired;
      });
      return isRequired;
    } else {
      return false;
    }
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

  public setDateValue(): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (this.frm.get(importName).value) {
        const utcDate = new Date(this.frm.get(importName).value);
        let currentDate = new Date(Date.UTC(utcDate.getFullYear(),
          utcDate.getMonth(), utcDate.getDate(), utcDate.getHours(), utcDate.getMinutes()));
        this.frm.get(exportName).setValue({
          date: {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            day: currentDate.getDate()
          }
        });
      } else {
        this.frm.get(importName).patchValue(null);
        this.frm.get(exportName).patchValue(null);
      }
    };
    patchDateFunc('shipFromDateShippedOnUtc', 'shipFromDateShipped');
    patchDateFunc('qcSampleDateRejectedOnUtc', 'qcSampleDateRejected');
    patchDateFunc('qcSampleDateOnUtc', 'qcSampleDate');
  }

  public updateForm(data: any): void {
    if (data) {
      this.frm.patchValue(data);
      this.setDateValue();
    }
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getShippingCarrier()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.shippingCarrier = resp.data;
        }
      });
    this._qcSampleShipTopService.getDataColumn(this.orderId, this.orderDetailId, this.type)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.updateForm(resp.data);
          if (resp.data.shipToCarrierId) {
            this.getCarrierSvById(resp.data.shipToCarrierId);
          }
          this._storedData = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
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

  public onCarrierChange(e): void {
    if (!!this.frm.get('shipToCarrierId').value) {
      this.getCarrierSvById(this.frm.get('shipToCarrierId').value, true);
    }
  }

  public onSelectItem(val, valProp: string, formControlName: string): void {
    if (val[valProp]) {
      this.frm.get(formControlName).patchValue(val[valProp]);
    } else {
      // add new
      this.frm.get(formControlName).patchValue(val);
    }
  }

  /**
   * Fire date change event
   * @param event
   */
  public onDateChangedBy(event: IMyDateModel, prop: string): void {
    let utcDate = Object.assign({}, event);
    this.frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');
    // Update status for form control whose value changed
    this.frm.get(prop).markAsDirty();
  }

  public getMaxDate(currentDate: IMyDate, dateCompare: IMyDate): IMyDate {
    const timeCurrent = new Date(`${currentDate.month}/${currentDate.day}/${currentDate.year}`)
      .getTime();
    const timeDate = new Date(`${dateCompare.month}/${dateCompare.day}/${dateCompare.year}`)
      .getTime();
    return timeDate >= timeCurrent ? currentDate : dateCompare;
  }

  public checkFormValid(): boolean {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
    return this.frm.valid;
  }

  public onSubmitForm(): void {
    if (this.checkFormValid() && this.leadEtaComponent.checkFormValid()) {
      let listDate = [
        'shipFromDateShippedOnUtc',
        'qcSampleDateRejectedOnUtc',
        'qcSampleDateOnUtc'
      ];
      this.myDatePickerService.addTimeToDateArray(this.frm, listDate);
      const modal = Object.assign({
        ...this._storedData,
        ...this.leadEtaComponent.getFormValue()
      }, this.frm.value);
      delete modal['formRequires'];
      this._qcSampleShipTopService
        .changeStatusColumn(this.orderId, this.orderDetailId, this.type, modal)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this.activeModal.close(resp);
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }
}
