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
  NgbActiveModal,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

import { IMyDateModel } from 'mydatepicker';

// Services
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../shared/services/common';
import { ValidationService } from '../../../../shared/services/validation';

// Validators

// Interfaces
import {
  Status,
  TaskStatus
} from '../../order-main.model';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';
import { ExtraValidators } from '../../../../shared/services/validation';
import { ItemTypes } from '../../../+sales-order/+order-styles/order-styles.model';

@Component({
  selector: 'invoiced',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'invoiced.template.html',
  styleUrls: [
    'invoiced.styles.scss'
  ]
})
export class InvoicedComponent implements OnInit {
  @Input()
  public title = '';
  @Input()
  public orderId;
  @Input()
  public orderDetailId;
  @Input()
  public rowDetail;
  @Input()
  public styleList;

  public statusData;

  public frm: FormGroup;
  public formErrors = {
    invoicedId: '',
    invoicedOnUtc: ''
  };
  public validationMessages = {
    invoicedId: {
      required: 'Invoice # is required.'
    },
    invoicedOnUtc: {
      required: 'Invoice Date is required.',
      maxLength: 'Date must be today’s date or earlier'
    },
    // folderReceivedDateOnUtc: {
    //   required: 'Folder Received Date is required.',
    //   maxLength: 'Date must be today’s date or earlier'
    // },
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
  public isReadOnly = false;

  constructor(public activeModal: NgbActiveModal,
              private _fb: FormBuilder,
              private _validationService: ValidationService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _modalService: NgbModal,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    this.buildForm();
    this.updateForm(this.rowDetail);
    this.addStatusData();
    this.getCommonData();
    this._changeDetectorRef.markForCheck();
  }

  public addStatusData(): void {
    if (!this.frm.get('isManualInvoice').value) {
      if (!this.frm.get('isA2000Import').value) {
        this.statusData = [];
      } else {
        this.statusData = Status.filter((stt) => stt.name === 'Done');
        this.frm.get('status').patchValue(this.statusData[0].id);
      }
    } else {
      if (!this.frm.get('isA2000Import').value) {
        this.statusData = Status.filter((stt) => stt.name === 'Partial');
      } else {
        this.statusData = Status.filter((stt) =>
          stt.name === 'Partial' || stt.name === 'Done');
      }
    }
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public buildForm(): void {
    let controlConfig = {
      status: new FormControl(null, [Validators.required]),
      orderDetailId: new FormControl(this.orderDetailId),
      isManualInvoice: new FormControl(false),
      isA2000Import: new FormControl(false),
      isRequiredManualInvoice: new FormControl(false),
      a2000ImportInvoicedId: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'a2000ImportInvoicedId'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      a2000ImportInvoiced: new FormControl(''),
      a2000ImportInvoicedOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'a2000ImportInvoicedOnUtc'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      invoicedId: new FormControl(''),
      invoiced: new FormControl(''),
      invoicedOnUtc: new FormControl(''),
      // folderReceivedDate: new FormControl(''),
      // folderReceivedDateOnUtc: new FormControl('', [
      //   Validators.compose([
      //     ExtraValidators.conditional(
      //       (group) => this.getSpecialRequireCase(group, 'folderReceivedDateOnUtc'),
      //       Validators.compose([
      //         Validators.required
      //       ])
      //     ),
      //     Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
      //       '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
      //     MaxDateToday
      //   ])
      // ]),
      applyToStyles: new FormControl([]),
      invoicedApplyToStyles: new FormControl([]),
      formRequires: new FormControl({
        status: {
          required: true
        },
        a2000ImportInvoicedId: {
          required: true
        },
        a2000ImportInvoicedOnUtc: {
          required: true
        },
        invoicedId: {
          required: false
        },
        invoicedOnUtc: {
          required: false
        }
        // folderReceivedDateOnUtc: {
        //   required: false
        // }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);

    this.onValueChanged();
  }

  // public get listInvoiced(): FormArray {
  //   return this.frm.get('listInvoiced') as FormArray;
  // }
  //
  // public addInvoice(): void {
  //   this.listInvoiced.push(this._validationService.buildForm({
  //     status: new FormControl('', [Validators.required]),
  //     invoicedId: new FormControl('', [
  //       Validators.compose([
  //         ExtraValidators.conditional(
  //           (group) => this.getSpecialRequireCase(group, 'invoicedId'),
  //           Validators.compose([
  //             Validators.required
  //           ])
  //         )
  //       ])
  //     ]),
  //     invoiced: new FormControl(''),
  //     invoicedOnUtc: new FormControl('', [
  //       Validators.compose([
  //         ExtraValidators.conditional(
  //           (group) => this.getSpecialRequireCase(group, 'invoicedOnUtc'),
  //           Validators.compose([
  //             Validators.required
  //           ])
  //         ),
  //         Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
  //           '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
  //         MaxDateToday
  //       ])
  //     ]),
  //     folderReceivedDate: new FormControl(''),
  //     folderReceivedDateOnUtc: new FormControl('', [
  //       Validators.compose([
  //         ExtraValidators.conditional(
  //           (group) => this.getSpecialRequireCase(group, 'folderReceivedDateOnUtc'),
  //           Validators.compose([
  //             Validators.required
  //           ])
  //         ),
  //         Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
  //           '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
  //         MaxDateToday
  //       ])
  //     ]),
  //     applyToStyles: new FormControl([]),
  //     formRequires: new FormControl({
  //       status: {
  //         required: true
  //       },
  //       invoicedId: {
  //         required: false
  //       },
  //       invoicedOnUtc: {
  //         required: false
  //       },
  //       folderReceivedDateOnUtc: {
  //         required: false
  //       }
  //     })
  //   }, this.formErrors, this.validationMessages));
  //   // (re)set validation messages now
  //   this.onValueChanged(this.listInvoiced.controls[this.listInvoiced.controls.length - 1]);
  //   // (re)set validation by getSpecialRequireCase func
  //   const frm: any = this.listInvoiced.controls[this.listInvoiced.controls.length - 1];
  //   for (const field of Object.keys(frm.controls)) {
  //     frm.get(field).updateValueAndValidity();
  //   }
  // }
  //
  // public setInvoice(listInvoiced): void {
  //   let controlFGs = listInvoiced.map((invoice) => this._validationService.buildForm({
  //     status: new FormControl(invoice.status, [Validators.required]),
  //     invoicedId: new FormControl(invoice.invoicedId, [
  //       Validators.compose([
  //         ExtraValidators.conditional(
  //           (group) => this.getSpecialRequireCase(group, 'invoicedId'),
  //           Validators.compose([
  //             Validators.required
  //           ])
  //         )
  //       ])
  //     ]),
  //     invoiced: new FormControl(''),
  //     invoicedOnUtc: new FormControl(invoice.invoicedOnUtc, [
  //       Validators.compose([
  //         ExtraValidators.conditional(
  //           (group) => this.getSpecialRequireCase(group, 'invoicedOnUtc'),
  //           Validators.compose([
  //             Validators.required
  //           ])
  //         ),
  //         Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
  //           '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
  //         MaxDateToday
  //       ])
  //     ]),
  //     folderReceivedDate: new FormControl(''),
  //     folderReceivedDateOnUtc: new FormControl(invoice.folderReceivedDateOnUtc, [
  //       Validators.compose([
  //         ExtraValidators.conditional(
  //           (group) => this.getSpecialRequireCase(group, 'folderReceivedDateOnUtc'),
  //           Validators.compose([
  //             Validators.required
  //           ])
  //         ),
  //         Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
  //           '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
  //         MaxDateToday
  //       ])
  //     ]),
  //     applyToStyles: new FormControl(invoice.applyToStyles || []),
  //     formRequires: new FormControl({
  //       status: {
  //         required: true
  //       },
  //       invoicedId: {
  //         required: false
  //       },
  //       invoicedOnUtc: {
  //         required: false
  //       },
  //       folderReceivedDateOnUtc: {
  //         required: false
  //       }
  //     })
  //   }, this.formErrors, this.validationMessages));
  //   const controlArray = this._fb.array(controlFGs);
  //   this.frm.setControl('listInvoiced', controlArray);
  //
  //   this.listInvoiced.controls.forEach((shipment) => {
  //     this.onValueChanged(shipment); // (re)set validation messages now
  //   });
  // }
  //
  // public deleteInvoice(index: number): void {
  //   if (this.listInvoiced.length < 2) {
  //     return;
  //   }
  //   this.listInvoiced.removeAt(index);
  // }

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

  public setDateValue(frm): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (frm.get(importName).value) {
        const utcDate = new Date(frm.get(importName).value);
        let currentDate = new Date(Date.UTC(utcDate.getFullYear(),
          utcDate.getMonth(), utcDate.getDate(), utcDate.getHours(), utcDate.getMinutes()));
        frm.get(exportName).setValue({
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
    patchDateFunc('invoicedOnUtc', 'invoiced');
    patchDateFunc('a2000ImportInvoicedOnUtc', 'a2000ImportInvoiced');
    // patchDateFunc('folderReceivedDateOnUtc', 'folderReceivedDate');
    this._changeDetectorRef.markForCheck();
  }

  public updateForm(data: any): void {
    if (data) {
      // this.setInvoice(data);
      this.frm.patchValue(data);
      // this.listInvoiced.controls.forEach((owsTp) => {
      this.setDateValue(this.frm);
      if (!data.status) {
        this.frm.get('invoicedId').patchValue('');
      }
      // });
    } else {
      // this.addInvoice();
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    if (key === 'invoicedOnUtc' || key === 'folderReceivedDateOnUtc' || key === 'invoicedId') {
      let status = +frm.get('status').value === this.taskStatus.DONE
        || +frm.get('status').value === this.taskStatus.PARTIAL;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'a2000ImportInvoicedId' || key === 'a2000ImportInvoicedOnUtc') {
      let status = frm.get('isA2000Import').value;
      frm.get('formRequires').value[key].required = status;
      return status;
    }
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    // empty
  }

  /**
   * Fire date change event
   * @param event
   */
  public onDateChangedBy(event: IMyDateModel, frm, prop: string): void {
    let utcDate = Object.assign({}, event);
    frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');
    // Update status for form control whose value changed
    frm.get(prop).markAsDirty();
    this._changeDetectorRef.markForCheck();
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

  /**
   * onSelectStyle
   * @param {number} orderDetailId
   */
  public onSelectStyle(frm, orderDetailId: number): void {
    let currentDetailType = frm.get('applyToStyles').value;
    const duplTypeIndex = currentDetailType.indexOf(orderDetailId);
    if (duplTypeIndex > -1) {
      currentDetailType.splice(duplTypeIndex, 1);
    } else {
      currentDetailType.push(orderDetailId);
    }
    frm.get('applyToStyles').patchValue(currentDetailType);
  }

  public activeStylesChanges(frm, orderDetailId: number): boolean {
    if (orderDetailId === this.orderDetailId) {
      return true;
    }
    return frm.get('applyToStyles').value.findIndex((i) => i === orderDetailId) > -1;
  }

  public checkFormValid(): boolean {
    let isValid = true;
    const checkValidControlFunc = (frm: any, list: string[]): boolean => {
      let isControlValue = true;
      list.forEach((i) => isControlValue = isControlValue
        && (frm.get(i).valid || frm.get(i).disabled));
      return isControlValue;
    };
    // this.listInvoiced.controls.forEach((invoice) => {
    if (!this.frm.get('status').value) {
      return false;
    }
    switch (+this.frm.get('status').value) {
      case this.taskStatus.PARTIAL:
      case this.taskStatus.DONE:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'invoicedId',
          'invoicedOnUtc'
          // 'folderReceivedDateOnUtc'
        ]);
        break;
      default:
        break;
    }
    // });
    return isValid;
  }

  public onSubmitForm(): void {
    if (this.checkFormValid()) {
      this.myDatePickerService.addTimeToDateArray(this.frm, [
        'invoicedOnUtc'
      ]);
      let applyToStyles = this.frm.get('applyToStyles').value;
      if (this.frm.get('applyToStyles').value.indexOf(this.orderDetailId) === -1) {
        applyToStyles.unshift(this.orderDetailId);
        this.frm.get('applyToStyles').patchValue(applyToStyles);
      }
      this.frm.get('invoicedApplyToStyles').patchValue(applyToStyles);
      this.activeModal.close(this.frm.value);
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }
}
