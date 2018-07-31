import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  Input
} from '@angular/core';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';
import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { CommonService } from '../../../../shared/services/common/common.service';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker/my-date-picker.service';
import {
  OrderNotificationService
} from '../order-notification.service';

// Interfaces
import {
  ResponseMessage
} from '../../../../shared/models/respone.model';
import { BasicCustomerInfo } from '../../../../shared/models/common.model';
import { IMyDateModel } from 'mydatepicker';
import { ExtraValidators } from '../../../../shared/services/validation/extra-validators';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'add-order',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'add-order.template.html',
  styleUrls: [
    'add-order.style.scss'
  ],
  providers: [OrderNotificationService]
})
export class AddOrderComponent implements OnInit, OnDestroy {
  @Input()
  public title: string;
  @Input()
  public orderInfo: any;

  public frm: FormGroup;
  public formErrors = {
    customerId: '',
    customer2Type: '',
    customer2Id: '',
    customerPoId: '',
    cancelDateOnUtc: '',
    units: ''
  };
  public validationMessages = {
    customerId: {
      required: 'Customer is required.'
    },
    customer2Type: {
      required: 'Customer 2 is required.'
    },
    customer2Id: {
      required: 'Name is required.'
    },
    customerPoId: {
      required: 'Customer PO is required.'
    },
    cancelDateOnUtc: {
      required: 'Cancel Date is required.'
    },
    styles: {
      required: 'Styles is required.',
      invalidValue: '# Styles from 1 to 99.'
    },
    units: {
      required: 'Units is required.',
      invalidValue: '# Units from 1 to 999999.'
    }
  };

  public isPageReadOnly = false;

  public myDateRangePickerOptions = {
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

  public customersData = [];
  public customers2Data = [
    { id: 1, name: 'None' },
    { id: 2, name: 'Retailer' },
    { id: 3, name: 'Licensor' },
  ];

  constructor(public activeModal: NgbActiveModal,
              private _fb: FormBuilder,
              private _authService: AuthService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _orderNotifiSv: OrderNotificationService,
              public myDatePickerService: MyDatePickerService) {
    // this.isPageReadOnly = !this._authService.checkCanModify('Settings');
  }

  public ngOnInit(): void {
    this.buildForm();
    this.getCommonData();
    if (this.orderInfo) {
      this.frm.patchValue(this.orderInfo);
      this.setDateValue(this.frm);
    }
  }

  public getCommonData() {
    this._commonService.getCustomersList()
      .subscribe((resp: ResponseMessage<BasicCustomerInfo[]>) => {
        if (resp.status) {
          this.customersData = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
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
    patchDateFunc('cancelDateOnUtc', 'cancelDate');
  }

  public buildForm(): void {
    this.frm = this._fb.group({
      id: new FormControl(''),
      customerId: new FormControl({
        value: null,
        disabled: this.isPageReadOnly
      }, [Validators.required]),
      customerName: new FormControl(''),
      customer2Type: new FormControl({
        value: null,
        disabled: this.isPageReadOnly
      }, [Validators.required]),
      customer2Id: new FormControl({
        value: null,
        disabled: this.isPageReadOnly
      }, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'customer2Id'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      customer2Name: new FormControl(''),
      customerPoId: new FormControl({
        value: '',
        disabled: this.isPageReadOnly
      }, [Validators.required]),
      poRange: new FormControl({
        value: '',
        disabled: this.isPageReadOnly
      }),
      cancelDate: new FormControl(''),
      cancelDateOnUtc: new FormControl({
        value: '',
        disabled: this.isPageReadOnly
      }, [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'), Validators.required])
      ]),
      styles: new FormControl({
        value: '',
        disabled: this.isPageReadOnly
      }, this.validValue(1, 99)),
      units: new FormControl({
        value: '',
        disabled: this.isPageReadOnly
      }, [Validators.required, this.validValue(1, 999999)])
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));
    this.onValueChanged(); // (re)set validation messages now
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
   * Reset value form
   */
  public resetData(): void {
    this.buildForm();
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

  public validValue(from: number, to: number) {
    return (input: FormControl) => {
      if (input.value === '' || input.value === null) {
        return;
      }
      if (+input.value < from || +input.value > to) {
        // hasError invalidValue true
        return {invalidValue: true};
      }
      return null;
    };
  }

  public onSelectValueChange(value: any,
                             valueProp: string,
                             formProp: string,
                             frm: FormControl): void {
    if (formProp === 'customerIds') {
      let cusSelected = [];
      value.activeItem.forEach((i) => {
        cusSelected.push(i.id);
      });
      frm.get(formProp).setValue(cusSelected);
      // Update status for form control whose value changed
      frm.get(formProp).markAsDirty();
      return;
    }
    // Ng Select return valid data with current value
    if (value[valueProp]) {
      frm.get(formProp).setValue(value[valueProp]);
    } else {
      // Ng Select return valid data with new value
      if (value.text) {
        frm.get(formProp).setValue(value.text);
      } else {
        // Ng Select return invalid data
        frm.get(formProp).setValue(value);
      }
    }
    // Update status for form control whose value changed
    frm.get(formProp).markAsDirty();
  }

  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    if (key === 'customer2Id') {
      let status = frm.get('customer2Type').value === 2
        || frm.get('customer2Type').value === 3;
      return status;
    } else {
      return false;
    }
  }

  /**
   * Fire date change event with prop
   * @param event
   */
  public onDateChanged(event: IMyDateModel, prop: string) {
    let utcDate = Object.assign({}, event);
    this.frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');
    // Update status for form control whose value changed
    this.frm.get(prop).markAsDirty();
  }

  public onSubmit() {
    setTimeout(() => {
      if (this.frm.valid) {
        this.myDatePickerService.addTimeToDateArray(this.frm, [
          'cancelDateOnUtc'
        ]);
        if (!this.frm.value.id) {
          this._orderNotifiSv.addOrder(this.frm.value)
            .subscribe((resp: ResponseMessage<any>) => {
              if (resp.status) {
                this._toastrService.success(resp.message, 'Success');
                this.activeModal.close(true);
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
                this.activeModal.close(false);
              }
            });
        } else {
          this._orderNotifiSv.updateOrder(this.frm.value)
            .subscribe((resp: ResponseMessage<any>) => {
              if (resp.status) {
                this._toastrService.success(resp.message, 'Success');
                this.activeModal.close(true);
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
                this.activeModal.close(false);
              }
            });
        }
      } else {
        this._commonService.markAsDirtyForm(this.frm, true);
      }
    });
  }

  public ngOnDestroy(): void {
    // empty
  }
}
