import {
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

import { IMyDateModel } from 'mydatepicker';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  CommonService,
  ValidationService,
  MyDatePickerService
} from '../../../../../shared/services';

// Interfaces
import {
  Status,
  TaskStatus
} from '../../../../../+order-log-v2/+order-main/order-main.model';
import {
  Size
} from '../../top-pp-samples-main.model';
import {
  ResponseMessage
} from '../../../../../shared/models';
import {
  UploaderTypeComponent
} from '../../../../../shared/modules/uploader-type';
import {
  UploadedType
} from '../../../../../+order-log-v2/+sales-order';
import {
  StyleUploadedType
} from '../../../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+style';
import {
  TopPpSamplesMainService
} from '../../top-pp-samples-main.service';

@Component({
  selector: 'ship-date',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'ship-date.template.html',
  styleUrls: [
    'ship-date.style.scss'
  ]
})
export class ShipDateComponent implements OnInit {
  @Input()
  public title = '';
  @Input()
  public topPpId;
  @Input()
  public isPageReadOnly = false;
  public shipDateDetails;

  public statusData = Status.filter((stt) => stt.name === 'Done'
    || stt.name === 'Partial');

  public frm: FormGroup;
  public formErrors = {
    shipFromDateShippedOnUtc: '',
    shipToTracking: '',
    comments: ''
  };
  public validationMessages = {
    status: {
      required: 'Status is required.'
    },
    shippedQtys: {
      required: 'Shipped Qty value must be specified.',
      invalidValue: 'Shipped Qty must be less than ' +
      'or equal to Requested for every Size.'
    },
    shipFromDateShippedOnUtc: {
      required: 'Date Shipped is required.',
      maxLength: 'Date must be today’s date or earlier'
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
  public styleUploadedType = StyleUploadedType;
  public uploadedType = UploadedType;
  public taskStatus = TaskStatus;
  public orderTypeData = [
    {
      id: StyleUploadedType.OrderWorkSheets,
      name: 'OrderWorkSheets'
    },
    {
      id: StyleUploadedType.TechPacks,
      name: 'TechPacks'
    }
  ];
  public inputOldValue = 0;

  constructor(public activeModal: NgbActiveModal,
              private _el: ElementRef,
              private _fb: FormBuilder,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _topPpSamplesMainService: TopPpSamplesMainService,
              private _modalService: NgbModal,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    this.buildForm();
    this.getShipDateDetails();
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public buildForm(): void {
    this.frm = this._fb.group({
      topPpShipments: this._fb.array([])
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(this.frm));

    this.onValueChanged(this.frm); // (re)set validation messages now
  }

  public get topPpShipments(): FormArray {
    return this.frm.get('topPpShipments') as FormArray;
  };

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
        frm.get(importName).patchValue(null);
        frm.get(exportName).patchValue(null);
      }
    };
    patchDateFunc('shipFromDateShippedOnUtc', 'shipFromDateShipped');
  }

  public getShipDateDetails(): void {
    this._topPpSamplesMainService.getShipDate(this.topPpId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.shipDateDetails = resp.data;
          this.frm.patchValue(resp.data);
          this.setShipDates(resp.data.topPpShipments);
          // this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public setShipDates(topPpShipments) {
    if (topPpShipments && topPpShipments.length) {
      let shipDateFGs = [];
      topPpShipments.forEach((shipDate) => {
        let shipDateFrm = this._validationService.buildForm({
          topPpId: new FormControl(shipDate.topPpId, [Validators.required]),
          topPpName: new FormControl(
            shipDate.styleName + '/' + shipDate.partnerStyleName,
            [Validators.required]),
          status: new FormControl(shipDate.status, [Validators.required]),
          shippedQtys: this._fb.array([]),
          shipFromDateShipped: new FormControl(''),
          shipFromDateShippedOnUtc: new FormControl(shipDate.shipFromDateShippedOnUtc, [
            Validators.required,
            Validators.compose([
              Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
                '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
            ])
          ]),
          topPpFiles: new FormControl(shipDate.topPpFiles),
          shipToTracking: new FormControl(shipDate.shipToTracking),
          comments: new FormControl(shipDate.comments),
          imageUrl: new FormControl(shipDate.imageUrl)
        }, {}, {});
        this.setDateValue(shipDateFrm);
        this.setQtyArr(shipDate.shippedQtys, shipDateFrm);
        shipDateFGs.push(shipDateFrm);
      });
      const shipDateFormArray = this._fb.array(shipDateFGs);
      this.frm.setControl('topPpShipments', shipDateFormArray);
    }
  }

  public setQtyArr(data: Size[], frm) {
    if (!data.length) {
      return;
    }
    const shippedQtysFGs = data.map((size: Size) => this._validationService.buildForm({
      size: new FormControl(size.size),
      qty: new FormControl(size.qty),
      type: new FormControl(size.type)
    }, {}, {}));
    const topsFormArray = this._fb.array(shippedQtysFGs);
    frm.setControl('shippedQtys', topsFormArray);
    this.sizesValidateInvalid(frm);
  }

  public sizesValidateInvalid(frm) {
    let shippedQtys = frm.get('shippedQtys').value;
    if (shippedQtys && shippedQtys.length) {
      frm.get('shippedQtys')['required'] = shippedQtys.every((s) => {
        return s.qty === 0 || s.qty === '0' || s.qty === '';
      });
    }
    return frm.get('shippedQtys')['required'];
  }

  public onFocus(event) {
    this.inputOldValue = event.target.value;
    event.target.select();
  }

  public onBlur(event, size: FormControl) {
    if (event.target && !/^\d+$/.test(event.target.value)) {
      size.get('qty').patchValue(0);
    }
  }

  public onKeyUp(event, frm) {
    this.sizesValidateInvalid(frm);
    let e = <KeyboardEvent> event;
    if (e.keyCode === 27) {
      event.preventDefault();
      event.target.value = this.inputOldValue;
      return;
    }
    if (e.keyCode === 39 && e.code === 'ArrowRight'
      || e.keyCode === 40 && e.code === 'ArrowDown'
      || e.keyCode === 13) {
      let nextInput;
      if (event.target.parentNode // td
        && event.target.parentNode.nextSibling // next td
        && event.target.parentNode.nextSibling.firstElementChild) {
        nextInput = event.target.parentNode.nextSibling.firstElementChild;
      }
      if (nextInput && nextInput.tagName === 'INPUT') {
        nextInput.focus();
      }
    } else if (e.keyCode === 37 && e.code === 'ArrowLeft'
      || e.keyCode === 38 && e.code === 'ArrowUp') {
      let preInput;
      if (event.target.parentNode // td
        && event.target.parentNode.previousSibling // previous td
        && event.target.parentNode.previousSibling.firstElementChild) {
        preInput = event.target.parentNode.previousSibling.firstElementChild;
      }
      if (preInput && preInput.tagName === 'INPUT') {
        preInput.focus();
      }
    }
  }

  public calTotal(sizeArr: FormArray): number {
    let total = 0;
    sizeArr.controls.forEach((s) => {
      total += s.get('qty').value - 0;
    });
    return total;
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
      modalRef.componentInstance.title = 'Shipping Label Receipt';
      Object.assign(modalRef.componentInstance.uploadOptions, {
        // id: this.styleId,
        uploadType: this.uploadedType.ShippingFile,
        fileList: fileList.filter((i) => i),
        fileType: type,
        isReadOnly: this.isPageReadOnly
      });

      modalRef.result.then((res) => {
        this._el.nativeElement.className = '';
        if (res.status) {
          let isShownMsg = false;
          if (res.deletedList && res.deletedList.length) {
            let currentTypeList = frm.get('topPpFiles').value;
            res.deletedList.forEach((item) => {
              let indexItem = currentTypeList.findIndex((i) => i.id === item.id);
              if (indexItem > -1) {
                currentTypeList.splice(indexItem, 1);
              }
            });
            if (currentTypeList.length === 0 && res.newList.length === 0) {
              isShownMsg = true;
              this._toastrService
                .success(`Shipping Label Receipt removed successfully.`, 'Success');
            }

            frm.get('topPpFiles').setValue([...currentTypeList]);
          }
          if (res.updateList && res.updateList.length) {
            let currentTypeList = frm.get('topPpFiles').value;
            res.updateList.forEach((item) => {
              let indexItem = currentTypeList.findIndex((i) => i.fileName === item.fileName);
              if (indexItem > -1) {
                currentTypeList[indexItem] = item;
              }
            });

            frm.get('topPpFiles').setValue([...currentTypeList]);
          }
          if (res.newList && res.newList.length) {
            let currentTypeList = frm.get('topPpFiles').value;
            if (!currentTypeList.length) {
              isShownMsg = true;
              this._toastrService
                .success(`Shipping Label Receipt uploaded successfully.`, 'Success');
            }

            if (res.duplicatedList && res.duplicatedList.length) {
              res.duplicatedList.forEach((i) => {
                if (currentTypeList.indexOf(i) > -1) {
                  currentTypeList.splice(currentTypeList.indexOf(i), 1);
                }
              });
            }
            frm.get('topPpFiles').setValue([...currentTypeList, ...res.newList]);
          }

          if (!isShownMsg) {
            this._toastrService
              .success(`Shipping Label Receipt updated successfully.`, 'Success');
          }
        }
      }, (err) => {
        this._el.nativeElement.className = '';
      });
    };
    const fileList = frm.get('topPpFiles').value ? frm.get('topPpFiles').value : [];
    funcUpload(fileList);
  }

  public checkLengthUploaderByType(frm): boolean {
    return frm.get('topPpFiles').value &&
      !!frm.get('topPpFiles').value.length;
  }

  public onSubmitForm(): void {
    let sizeInvalid = false;
    this.topPpShipments.controls.forEach((shipDate) => {
      sizeInvalid = sizeInvalid || this.sizesValidateInvalid(shipDate);
    });
    if (this.frm.invalid || sizeInvalid) {
      this._commonService.markAsDirtyForm(this.frm, true);
      return;
    }
    this.activeModal.close({
      status: true,
      data: this.frm.value.topPpShipments
    });
  }

  public onClosePopup(): void {
    this.activeModal.close({
      status: false
    });
  }
}
