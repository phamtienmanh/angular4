import {
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

import _ from 'lodash';

// Services
import {
  ToastrService }
  from 'ngx-toastr';
import {
  CommonService,
  ValidationService
} from '../../../../../shared/services';
import {
  TopPpSamplesMainService
} from '../../top-pp-samples-main.service';

// Interfaces
import {
  Status,
  TaskStatus,
  ResponseMessage
} from '../../../../../shared/models';
import {
  Size
} from '../../top-pp-samples-main.model';

@Component({
  selector: 'qa-change-status',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'qa-change-status.template.html',
  styleUrls: [
    'qa-change-status.styles.scss'
  ]
})
export class QaChangeStatusComponent implements OnInit {
  @Input()
  public styleId;
  @Input()
  public isSMPL = false;
  public statusData = Status.filter((stt) => stt.name === 'In Picking' ||
    stt.name === 'Pass' || stt.name === 'Fail');
  public qaDetail;
  public frm: FormGroup;
  public formErrors = {
    status: '',
    topPulleds: ''
  };
  public validationMessages = {
    status: {
      maxLength: 'Status is required.'
    },
    topPulleds: {
      required: 'Qty Pulled value must be specified.',
      invalidValue: 'Qty Pulled must be less than ' +
      'or equal to Requested for every Size.'
    }
  };
  public taskStatus = TaskStatus;
  public inputOldValue = 0;
  public qtyLabel = '';

  constructor(public activeModal: NgbActiveModal,
              private _toastrService: ToastrService,
              private _validationService: ValidationService,
              private _fb: FormBuilder,
              private _commonService: CommonService,
              private _topPpSamplesMainService: TopPpSamplesMainService) {
  }

  public ngOnInit(): void {
    this.qtyLabel = this.isSMPL ? 'PP Customer' : 'TOP Sample';
    this.buildForm();
    this.getQaDetail(this.styleId);
  }

  public getQaDetail(styleId) {
    this._topPpSamplesMainService
      .getQaDetail(styleId)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this.qaDetail = resp.data;
            this.updateForm(this.qaDetail);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
  }

  public buildForm(): void {
    let controlConfig = {
      status: new FormControl(null, [Validators.required]),
      tops: this._fb.array([]),
      topPulleds: this._fb.array([]),
      formRequires: new FormControl({
        status: {
          required: true
        }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);

    this.onValueChanged(); // (re)set validation messages now
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

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public get tops(): FormArray {
    return this.frm.get('tops') as FormArray;
  }

  public get topPulleds(): FormArray {
    return this.frm.get('topPulleds') as FormArray;
  }

  public updateForm(data: any): void {
    if (data) {
      this.frm.patchValue(data);
      this.setQtyArr(data);
    }
  }

  public setQtyArr(data) {
    if (!data.tops || !data.tops.length) {
      return;
    }
    let sizeNameArr = _.uniq(_.map(data.tops.concat(data.topPulleds), (size: Size) => size.size));
    const qtyByNameType = (sizeArr: Size[], name: string, type: string) => {
      let size = _.findLast(sizeArr, (s) => {
        return s.size === name && s.type === type;
      });
      if (size) {
        return size.qty;
      }
      return 0;
    };

    let topsFGs = [];
    let topPulledsFGs = [];
    sizeNameArr.forEach((sizeName: string) => {
      let rFrm = this._validationService.buildForm({
        size: new FormControl(sizeName),
        qty: new FormControl(qtyByNameType(data.tops, sizeName, 'TopQty')),
        type: new FormControl('TopQty')
      }, {}, {});
      topsFGs.push(rFrm);
      let pFrm = this._validationService.buildForm({
        size: new FormControl(sizeName),
        qty: new FormControl(qtyByNameType(data.topPulleds, sizeName, 'TopPulled')),
        type: new FormControl('TopPulled')
      }, {}, {});
      topPulledsFGs.push(pFrm);
    });
    const topsFormArray = this._fb.array(topsFGs);
    this.frm.setControl('tops', topsFormArray);

    const topPulledsFormArray = this._fb.array(topPulledsFGs);
    this.frm.setControl('topPulleds', topPulledsFormArray);
    this.sizesValidateInvalid();
  }

  public calTotal(sizeArr: FormArray): number {
    let total = 0;
    sizeArr.controls.forEach((s) => {
      total += s.get('qty').value - 0;
    });
    return total;
  }

  public sizesValidateInvalid() {
    if (this.topPulleds.value && this.topPulleds.value.length) {
      this.topPulleds['required'] = this.frm.get('status').value === this.taskStatus.PASS
        && this.tops.value.some((s) => s.qty !== 0)
        && this.topPulleds.value
          .every((s) => {
            return s.qty === 0 || s.qty === '0' || s.qty === '';
          });
      this.topPulleds['invalidValue'] = this.frm.get('status').value === this.taskStatus.PASS
        && this.topPulleds.value
          .some((s, index) => s.qty > this.tops.value[index].qty);
    }
    return this.topPulleds['required'] || this.topPulleds['invalidValue'];
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

  public onKeyUp(event) {
    this.sizesValidateInvalid();
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

  public onSubmitForm(): void {
    if (this.frm.invalid || this.sizesValidateInvalid()) {
      this._commonService.markAsDirtyForm(this.frm, true);
      return;
    }
    this.activeModal.close(this.frm.value);
  }
}
