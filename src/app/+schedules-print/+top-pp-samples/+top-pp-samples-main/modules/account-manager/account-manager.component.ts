import {
  Component,
  ElementRef,
  Input,
  OnInit,
  AfterViewChecked,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChildren,
  QueryList,
  OnDestroy
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

import {
  Subject
} from 'rxjs/Subject';

import * as _ from 'lodash';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  CommonService,
  ExtraValidators,
  ValidationService
} from '../../../../../shared/services';
import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';
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
  FieldType,
  FormErrors,
  FormProp,
  FormRequires,
  SaturdayDeliveryData,
  TypeData,
  ValidationMessages
} from './account-manager.model';
import {
  ItemTypes
} from '../../../../../+order-log-v2/+sales-order/+order-styles/order-styles.model';
import {
  Size,
  TopPps
} from '../../top-pp-samples-main.model';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'account-manager',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'account-manager.template.html',
  styleUrls: [
    'account-manager.style.scss'
  ]
})
export class AccountManagerComponent implements OnInit, AfterViewChecked, OnDestroy {
  @Input()
  public orderId;
  @Input()
  public styleId;
  @Input()
  public isSMPL = false;
  @Input()
  public isPageReadOnly = false;

  @ViewChildren('labelList')
  public labelList: QueryList<ElementRef>;
  public nameChanged = [];

  public frm: FormGroup;
  public formErrors = FormErrors;
  public fieldType = FieldType;
  public formRequires = FormRequires;
  public formProp = FormProp;
  public validationMessages = ValidationMessages;

  public taskStatus = TaskStatus;
  public topPpsName = TopPps;
  public statusSelectData = [];
  public ngSelectData = [];
  public inputOldValue = 0;
  public labelHeights = [];
  public isLabelListChecked = false;

  constructor(public activeModal: NgbActiveModal,
              private _el: ElementRef,
              private _toastrService: ToastrService,
              private _fb: FormBuilder,
              private _router: Router,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _topPpSamplesMainService: TopPpSamplesMainService,
              private _changeDetectorRef: ChangeDetectorRef) {
    // empty
  }

  public ngOnInit(): void {
    this.statusSelectData = Status.filter((stt) => stt.id === TaskStatus.PENDING
      || stt.id === TaskStatus.APPROVEDANDDONE || stt.id === TaskStatus.APPROVEDANDHOLD);
    this.buildForm();
    this.getAccountManager(this.styleId);
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

  public getAccountManager(styleId) {
    this._topPpSamplesMainService
      .getAccountManager(styleId)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            let allApplicableStyles = [];
            resp.data.topPps.forEach((topPp) => {
              allApplicableStyles = allApplicableStyles.concat(topPp.applicableStyles);
            });
            resp.data.allApplicableStyles = _.uniqBy(allApplicableStyles, 'orderDetailId');
            this.frm.patchValue(resp.data);
            this.setTopPps(resp.data);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public onSelectOpen(select: NgSelectComponent): void {
    if (!select.multiple && select.selectedItems && select.selectedItems.length) {
      let filterVal = select.selectedItems[0].label;
      select.filterValue = filterVal ? filterVal : '';
    }
  }

  public onSelectItem(val, frm, frmIndex, prop): void {
    if (prop === 'shippingCarrierId'
      && val.id) {
      this.getServicesByCarrierId(val.id, frm, frmIndex, true);
    }
  }

  public getServicesByCarrierId(carrierId, frm, frmIndex, clearValue?) {
    this._topPpSamplesMainService.getShippingCarrierSv(carrierId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.ngSelectData[frmIndex]['shipToMethodId'] = resp.data;
          if (clearValue) {
            frm.get('shipToMethodId').setValue(null);
          }
        }
      });
  }

  public getNgSelectData(frmIndex, isLast): void {
    this.ngSelectData[frmIndex]['shippingCarrierId'] = [];
    this.ngSelectData[frmIndex]['shipToMethodId'] = [];
    this.ngSelectData[frmIndex]['shipToSaturdayDelivery'] = SaturdayDeliveryData;
    this.ngSelectData[frmIndex]['shipToType'] = TypeData;
    if (isLast) {
      this._commonService.getShippingCarrier()
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            while (frmIndex >= 0) {
              this.ngSelectData[frmIndex--]['shippingCarrierId'] = resp.data;
            }
          }
          this._changeDetectorRef.markForCheck();
        });
    }
  }

  public buildForm(): void {
    this.frm = this._fb.group({
      status: new FormControl(null, [Validators.required]),
      allApplicableStyles: new FormControl([]),
      topPps: this._fb.array([])
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  public get topPps(): FormArray {
    return this.frm.get('topPps') as FormArray;
  };

  public get allApplicableStyles() {
    return this.frm.get('allApplicableStyles').value;
  };

  public get statusDoneOrHold(): boolean {
    return this.frm && this.frm.get('status') &&
      (this.frm.get('status').value === this.taskStatus.APPROVEDANDDONE ||
      this.frm.get('status').value === this.taskStatus.APPROVEDANDHOLD);
  };

  public setTopPps(data) {
    const formObject = (topPp) => FormProp.reduce((result, prop) => {
      result[prop.name] = new FormControl(topPp[prop.name], [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => prop.isRequired && this.statusDoneOrHold,
            Validators.compose([Validators.required])
          )])
      ]);
      return result;
    }, {
      tops: this._fb.array([]),
      topPulleds: this._fb.array([]),
      applyToStyleIds: new FormControl(topPp.applyToStyleIds),
      applicableStyles: this._fb.array([]),
      formRequires : new FormControl(this.formRequires)
    });
    let topPps = data.topPps;
    let topPpsFGs = [];
    topPps.forEach((topPp, index) => {
      let topPpForm = this._validationService.buildForm(
        formObject(topPp), this.formErrors, this.validationMessages);
      this.nameChanged[index] = new Subject<string>();
      this.nameChanged[index].debounceTime(500)
        .distinctUntilChanged()
          .subscribe((name) => {
            this.getShippingToByName(name, topPpForm);
          });
      this.setQtyArr(topPp, topPpForm);
      this.setApplyToStyle(data.allApplicableStyles,
        topPp.applicableStyles, topPp.applyToStyleIds, topPpForm);
      // get ngSelectData
      this.ngSelectData[index] = {};
      this.getNgSelectData(index, index === topPps.length - 1);
      if (topPp.shippingCarrierId) {
        this.getServicesByCarrierId(topPp.shippingCarrierId, topPpForm, index);
      }
      topPpsFGs.push(topPpForm);
    });
    const topPpsFormArray = this._fb.array(topPpsFGs);
    this.frm.setControl('topPps', topPpsFormArray);
    this._changeDetectorRef.markForCheck();
  }

  public setQtyArr(data, frm) {
    if (!data.tops || !data.tops.length) {
      return;
    }
    let sizeNameArr = _.uniq(_.map(data.tops.concat(data.topPulleds), (size: Size) => size.size));
    const qtyByName = (sizeArr: Size[], name: string) => {
      let size = _.findLast(sizeArr, (s) => {
        return s.size === name;
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
        qty: new FormControl(qtyByName(data.tops, sizeName)),
        type: new FormControl('TopQty')
      }, {}, {});
      topsFGs.push(rFrm);
      let pFrm = this._validationService.buildForm({
        size: new FormControl(sizeName),
        qty: new FormControl(qtyByName(data.topPulleds, sizeName)),
        type: new FormControl('TopPulled')
      }, {}, {});
      topPulledsFGs.push(pFrm);
    });
    const topsFormArray = this._fb.array(topsFGs);
    frm.setControl('tops', topsFormArray);

    const topPulledsFormArray = this._fb.array(topPulledsFGs);
    frm.setControl('topPulleds', topPulledsFormArray);
    this.sizesValidateInvalid(frm);
  }

  public setApplyToStyle(allApplicableStyles, applicableStyles, applyToStyleIds, frm) {
    if (allApplicableStyles && allApplicableStyles.length) {
      // build select form
      const applicableStyleFGs = allApplicableStyles
        .map((style) => this._validationService.buildForm({
          orderDetailId: new FormControl(style.orderDetailId),
          styleFullName: new FormControl(this.getLabelString(style)),
          isShow: new FormControl(applicableStyles.some((s) =>
            s.orderDetailId === style.orderDetailId)),
          isSelected: new FormControl(applyToStyleIds.some((id) => id === style.orderDetailId))
        }, {}, {}));
      const applicableStyleFormArray = this._fb.array(applicableStyleFGs);
      frm.setControl('applicableStyles', applicableStyleFormArray);
    }
  }

  public sizesValidateInvalid(frm) {
    let topPulleds = frm.get('topPulleds').value;
    let tops = frm.get('tops').value;
    if (topPulleds && topPulleds.length) {
      frm.get('topPulleds')['required'] = this.statusDoneOrHold
        && tops.some((s) => s.qty !== 0)
        && topPulleds.every((s) => {
            return s.qty === 0 || s.qty === '0' || s.qty === '';
          });
      frm.get('topPulleds')['invalidValue'] = this.statusDoneOrHold
        && topPulleds.some((s, index) => s.qty > tops[index].qty);
    }
    return frm.get('topPulleds')['required'] || frm.get('topPulleds')['invalidValue'];
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

  public onNameChange($event, prop, frmIndex) {
    if (prop === 'shipToName' && $event.target && this.nameChanged && this.nameChanged[frmIndex]) {
      this.nameChanged[frmIndex].next($event.target.value);
    }
  }

  public getShippingToByName(name, frm) {
    this._topPpSamplesMainService.getShippingToByName(name)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          let props = [
            'shipToAddress1',
            'shipToAddress2',
            'shipToCity',
            'shipToState',
            'shipToZip',
            'shipToPhone'
          ];
          props.forEach((p) => {
            frm.get(p).patchValue(resp.data[p]);
          });
          this._commonService.markAsDirtyForm(frm, true);
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
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

  public onSubmitForm(): void {
    let sizeInvalid = false;
    this.topPps.controls.forEach((topPp) => {
      sizeInvalid = sizeInvalid || this.sizesValidateInvalid(topPp);
      if (topPp.get('applicableStyles').value && topPp.get('applicableStyles').value.length) {
        let idsArr = [];
        topPp.get('applicableStyles').value.forEach((style) => {
          if (style.isSelected) {
            idsArr.push(style.orderDetailId);
          }
        });
        topPp.get('applyToStyleIds').patchValue(idsArr);
      }
    });
    if (this.frm.invalid || sizeInvalid) {
      this._commonService.markAsDirtyForm(this.frm, true);
      this._changeDetectorRef.markForCheck();
      return;
    }
    this.activeModal.close({
      status: true,
      data: this.frm.value
    });
  }

  public ngOnDestroy() {
    if (this.nameChanged && this.nameChanged.length) {
      this.nameChanged.forEach((nC) => {
        nC.unsubscribe();
      });
    }
  }
}
