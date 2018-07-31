import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
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
  IMyDate,
  IMyDateModel
} from 'mydatepicker';

// Services
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../shared/services/common';
import { ValidationService } from '../../../../shared/services/validation';

// Validators
import {
  MinDate,
  MaxDate,
  MaxDateToday
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
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';
import { ExtraValidators } from '../../../../shared/services/validation';
import { ItemTypes } from '../../../+sales-order/+order-styles/order-styles.model';

@Component({
  selector: 'folder-submitted',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'folder-submitted.template.html',
  styleUrls: [
    'folder-submitted.styles.scss'
  ]
})
export class FolderSubmittedComponent implements OnInit {
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

  public statusData = Status.filter((stt) => stt.name === 'Completed'
    || stt.name === 'Received' || stt.name === 'Rejected');

  public frm: FormGroup;
  public formErrors = {
    status: '',
    folderSubmittedToAccountingCompletedOnUtc: '',
    folderSubmittedToAccountingReceivedOnUtc: '',
    folderSubmittedToAccountingComments: ''
  };
  public validationMessages = {
    folderSubmittedToAccountingCompletedOnUtc: {
      required: 'Completed Date is required.',
      maxLength: 'Must be earlier than or equal to Received Date.'
    },
    folderSubmittedToAccountingReceivedOnUtc: {
      required: 'Received Date is required.',
      maxLength: 'Must be later than or equal to Completed Date.'
    },
    folderSubmittedToAccountingComments: {
      required: 'Comments is required.'
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
    sunHighlight: false,
    disableSince: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 1
    }
  };
  public folderSubmittedToAccountingCompletedOptions = {...this.myDatePickerOptions};
  public folderSubmittedToAccountingRejectedOptions = {...this.myDatePickerOptions};
  public folderSubmittedToAccountingReceivedOptions = {
    ...this.myDatePickerOptions
  };
  public taskStatus = TaskStatus;
  public rejectOwnerData = [];

  constructor(public activeModal: NgbActiveModal,
              private _fb: FormBuilder,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _modalService: NgbModal,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    this.buildForm();
    this.updateForm(this.rowDetail);
    this.getCommonData();
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public buildForm(): void {
    let controlConfig = {
      status: new FormControl(null, [Validators.required]),
      orderDetailId: new FormControl(this.orderDetailId),
      folderSubmittedToAccountingCompleted: new FormControl(''),
      folderSubmittedToAccountingCompletedOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group,
              'folderSubmittedToAccountingCompletedOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)' +
            '|([0-9]{2})\-([0-9]{2})\-([0-9]{4})$'),
          MaxDate('folderSubmittedToAccountingReceivedOnUtc', 1),
          MaxDateToday
        ])
      ]),
      folderSubmittedToAccountingCompletedOptions:
        new FormControl(this.folderSubmittedToAccountingCompletedOptions),
      folderSubmittedToAccountingReceived: new FormControl(''),
      folderSubmittedToAccountingReceivedOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group,
              'folderSubmittedToAccountingReceivedOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)' +
            '|([0-9]{2})\-([0-9]{2})\-([0-9]{4})$'),
          MinDate('folderSubmittedToAccountingCompletedOnUtc', 1),
          MaxDateToday
        ])
      ]),
      folderSubmittedToAccountingReceivedOptions:
        new FormControl(this.folderSubmittedToAccountingReceivedOptions),
      folderSubmittedToAccountingRejected: new FormControl(''),
      folderSubmittedToAccountingRejectedOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group,
              'folderSubmittedToAccountingRejectedOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)' +
            '|([0-9]{2})\-([0-9]{2})\-([0-9]{4})$'),
          MaxDateToday
        ])
      ]),
      folderSubmittedToAccountingRejectedOptions:
        new FormControl(this.folderSubmittedToAccountingRejectedOptions),
      folderSubmittedToAccountingRejectOwnerId: new FormControl(null, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group,
              'folderSubmittedToAccountingRejectOwnerId'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      folderSubmittedToAccountingRejectOwnerName: new FormControl(''),
      folderSubmittedToAccountingComments: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group,
              'folderSubmittedToAccountingComments'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      applyToStyles: new FormControl([]),
      folderSubmittedToAccountingApplyToStyles: new FormControl([]),
      formRequires: new FormControl({
        status: {
          required: true
        },
        folderSubmittedToAccountingCompletedOnUtc: {
          required: false
        },
        folderSubmittedToAccountingReceivedOnUtc: {
          required: false
        },
        folderSubmittedToAccountingRejectedOnUtc: {
          required: false
        },
        folderSubmittedToAccountingRejectOwnerId: {
          required: false
        },
        folderSubmittedToAccountingComments: {
          required: false
        }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);
  }

  // public get listFolder(): FormArray {
  //   return this.frm.get('listFolder') as FormArray;
  // }
  //
  // public addFolder(): void {
  //   this.listFolder.push(this._validationService.buildForm({
  //     status: new FormControl('', [Validators.required]),
  //     folderSubmittedToAccountingCompleted: new FormControl(''),
  //     folderSubmittedToAccountingCompletedOnUtc: new FormControl('', [
  //       Validators.compose([
  //         ExtraValidators.conditional(
  //           (group) => this.getSpecialRequireCase(group,
  //             'folderSubmittedToAccountingCompletedOnUtc'),
  //           Validators.compose([
  //             Validators.required
  //           ])
  //         ),
  //         Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
  //           '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)' +
  //           '|([0-9]{2})\-([0-9]{2})\-([0-9]{4})$'),
  //         MaxDate('folderSubmittedToAccountingReceivedOnUtc', 1),
  //         MaxDateToday
  //       ])
  //     ]),
  //     folderSubmittedToAccountingCompletedOptions:
  //       new FormControl(this.folderSubmittedToAccountingCompletedOptions),
  //     folderSubmittedToAccountingReceived: new FormControl(''),
  //     folderSubmittedToAccountingReceivedOnUtc: new FormControl('', [
  //       Validators.compose([
  //         ExtraValidators.conditional(
  //           (group) => this.getSpecialRequireCase(group,
  //             'folderSubmittedToAccountingReceivedOnUtc'),
  //           Validators.compose([
  //             Validators.required
  //           ])
  //         ),
  //         Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
  //           '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)' +
  //           '|([0-9]{2})\-([0-9]{2})\-([0-9]{4})$'),
  //         MinDate('folderSubmittedToAccountingCompletedOnUtc', 1),
  //         MaxDateToday
  //       ])
  //     ]),
  //     folderSubmittedToAccountingReceivedOptions:
  //       new FormControl(this.folderSubmittedToAccountingReceivedOptions),
  //     folderSubmittedToAccountingComments: new FormControl('', [
  //       Validators.compose([
  //         ExtraValidators.conditional(
  //           (group) => this.getSpecialRequireCase(group,
  //             'folderSubmittedToAccountingComments'),
  //           Validators.compose([
  //             Validators.required
  //           ])
  //         )
  //       ])
  //     ]),
  //     folderSubmittedToAccountingApplyToStyles: new FormControl([]),
  //     formRequires: new FormControl({
  //       status: {
  //         required: true
  //       },
  //       folderSubmittedToAccountingCompletedOnUtc: {
  //         required: false
  //       },
  //       folderSubmittedToAccountingReceivedOnUtc: {
  //         required: false
  //       },
  //       folderSubmittedToAccountingComments: {
  //         required: false
  //       }
  //     })
  //   }, this.formErrors, this.validationMessages));
  //   // (re)set validation messages now
  //   this.onValueChanged(this.listFolder.controls[this.listFolder.controls.length - 1]);
  //   // (re)set validation by getSpecialRequireCase func
  //   const frm: any = this.listFolder.controls[this.listFolder.controls.length - 1];
  //   for (const field of Object.keys(frm.controls)) {
  //     frm.get(field).updateValueAndValidity();
  //   }
  // }
  //
  // public setFolder(listFolder): void {
  //   let controlFGs = listFolder.map((folder) => this._validationService.buildForm({
  //     status: new FormControl(folder.status, [Validators.required]),
  //     folderSubmittedToAccountingCompleted: new FormControl(''),
  //     folderSubmittedToAccountingCompletedOnUtc:
  //       new FormControl(folder.folderSubmittedToAccountingCompletedOnUtc, [
  //         Validators.compose([
  //           ExtraValidators.conditional(
  //             (group) => this.getSpecialRequireCase(group,
  //               'folderSubmittedToAccountingCompletedOnUtc'),
  //             Validators.compose([
  //               Validators.required
  //             ])
  //           ),
  //           Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
  //             '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)' +
  //             '|([0-9]{2})\-([0-9]{2})\-([0-9]{4})$'),
  //           MaxDate('folderSubmittedToAccountingReceivedOnUtc', 1),
  //           MaxDateToday
  //         ])
  //       ]),
  //     folderSubmittedToAccountingCompletedOptions:
  //       new FormControl(this.folderSubmittedToAccountingCompletedOptions),
  //     folderSubmittedToAccountingReceived: new FormControl(''),
  //     folderSubmittedToAccountingReceivedOnUtc:
  //       new FormControl(folder.folderSubmittedToAccountingReceivedOnUtc, [
  //         Validators.compose([
  //           ExtraValidators.conditional(
  //             (group) => this.getSpecialRequireCase(group,
  //               'folderSubmittedToAccountingReceivedOnUtc'),
  //             Validators.compose([
  //               Validators.required
  //             ])
  //           ),
  //           Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
  //             '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)' +
  //             '|([0-9]{2})\-([0-9]{2})\-([0-9]{4})$'),
  //           MinDate('folderSubmittedToAccountingCompletedOnUtc', 1),
  //           MaxDateToday
  //         ])
  //       ]),
  //     folderSubmittedToAccountingReceivedOptions:
  //       new FormControl(this.folderSubmittedToAccountingReceivedOptions),
  //     folderSubmittedToAccountingComments:
  // new FormControl(folder.folderSubmittedToAccountingComments, [
  //       Validators.compose([
  //         ExtraValidators.conditional(
  //           (group) => this.getSpecialRequireCase(group,
  //             'folderSubmittedToAccountingComments'),
  //           Validators.compose([
  //             Validators.required
  //           ])
  //         )
  //       ])
  //     ]),
  //     folderSubmittedToAccountingApplyToStyles:
  // new FormControl(folder.folderSubmittedToAccountingApplyToStyles || []),
  //     formRequires: new FormControl({
  //       status: {
  //         required: true
  //       },
  //       folderSubmittedToAccountingCompletedOnUtc: {
  //         required: false
  //       },
  //       folderSubmittedToAccountingReceivedOnUtc: {
  //         required: false
  //       },
  //       folderSubmittedToAccountingComments: {
  //         required: false
  //       }
  //     })
  //   }, this.formErrors, this.validationMessages));
  //   const controlArray = this._fb.array(controlFGs);
  //   this.frm.setControl('listFolder', controlArray);
  //
  //   this.listFolder.controls.forEach((shipment) => {
  //     this.onValueChanged(shipment); // (re)set validation messages now
  //   });
  // }
  //
  // public deleteFolder(index: number): void {
  //   if (this.listFolder.length < 2) {
  //     return;
  //   }
  //   this.listFolder.removeAt(index);
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
        this.configDateOptions(importName, frm, currentDate);
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
        this.configDateOptions(importName, frm, null);
      }
    };
    patchDateFunc('folderSubmittedToAccountingCompletedOnUtc',
      'folderSubmittedToAccountingCompleted');
    patchDateFunc('folderSubmittedToAccountingReceivedOnUtc',
      'folderSubmittedToAccountingReceived');
    patchDateFunc('folderSubmittedToAccountingRejectedOnUtc',
      'folderSubmittedToAccountingRejected');
  }

  /**
   * Convert Date to IMyDate & Reconfig date options
   * @param prop
   * @param utcDate
   * @param i
   */
  public configDateOptions(prop: string, frm, utcDate: Date): void {
    const currentDate = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 1
    };

    if (!utcDate) {
      switch (prop) {
        case 'folderSubmittedToAccountingCompletedOnUtc':
          // Config for cancel date options
          frm.get('folderSubmittedToAccountingReceivedOptions').patchValue({
            ...this.folderSubmittedToAccountingReceivedOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            disableSince: currentDate
          });
          frm.get('folderSubmittedToAccountingCompletedOptions').patchValue({
            ...this.folderSubmittedToAccountingCompletedOptions,
            disableSince: currentDate
          });
          if (this.frm) {
            frm.get('folderSubmittedToAccountingReceivedOnUtc').setValue(null);
            frm.get('folderSubmittedToAccountingReceived').setValue(null);
          }
          break;
        case 'folderSubmittedToAccountingReceivedOnUtc':
          // Config for start date options
          frm.get('folderSubmittedToAccountingCompletedOptions').patchValue({
            ...this.folderSubmittedToAccountingCompletedOptions,
            disableSince: currentDate
          });
          break;
        case 'folderSubmittedToAccountingRejectedOnUtc':
          // Config for start date options
          frm.get('folderSubmittedToAccountingCompletedOptions').patchValue({
            ...this.folderSubmittedToAccountingCompletedOptions,
            disableSince: currentDate
          });
          break;
        default:
          break;
      }
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
      case 'folderSubmittedToAccountingCompletedOnUtc':
        // Config for end date options
        frm.get('folderSubmittedToAccountingReceivedOptions').patchValue({
          ...this.folderSubmittedToAccountingReceivedOptions,
          disableUntil: this.getMaxDate(currentDate, dateCurrentUntil),
          enableDays: [dateCurrentUntil]
        });
        break;
      case 'folderSubmittedToAccountingReceivedOnUtc':
        // Config for start date options
        frm.get('folderSubmittedToAccountingCompletedOptions').patchValue({
          ...this.folderSubmittedToAccountingCompletedOptions,
          disableSince: this.getMaxDate(currentDate, dateCurrentSince),
          enableDays: [dateCurrentSince]
        });
        break;
      case 'folderSubmittedToAccountingRejectedOnUtc':
        // Config for start date options
        frm.get('folderSubmittedToAccountingCompletedOptions').patchValue({
          ...this.folderSubmittedToAccountingCompletedOptions,
          disableSince: this.getMaxDate(currentDate, dateCurrentSince),
          enableDays: [dateCurrentSince]
        });
        break;
      default:
        break;
    }
  }

  public getMaxDate(currentDate: IMyDate, dateCompare: IMyDate): IMyDate {
    const timeCurrent = new Date(`${currentDate.month}/${currentDate.day}/${currentDate.year}`)
      .getTime();
    const timeDate = new Date(`${dateCompare.month}/${dateCompare.day}/${dateCompare.year}`)
      .getTime();
    return timeDate >= timeCurrent ? currentDate : dateCompare;
  }

  public updateForm(data: any): void {
    if (data) {
      // this.setFolder(data);
      // this.listFolder.controls.forEach((folder) => {
      this.frm.patchValue(data);
      this.frm.get('folderSubmittedToAccountingApplyToStyles')
        .patchValue(this.frm.get('applyToStyles').value);
      if (this.frm.get('folderSubmittedToAccountingApplyToStyles').value
        .indexOf(this.orderDetailId) === -1) {
        let styleIds = this.frm.get('folderSubmittedToAccountingApplyToStyles').value;
        styleIds.push(this.orderDetailId);
        this.frm.get('folderSubmittedToAccountingApplyToStyles').patchValue(styleIds);
      }
      this.setDateValue(this.frm);
      // });
    }
  }

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    if (key === 'folderSubmittedToAccountingCompletedOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.COMPLETED
        || +frm.get('status').value === this.taskStatus.RECEIVED
        || +frm.get('status').value === this.taskStatus.REJECTED;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'folderSubmittedToAccountingReceivedOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.RECEIVED;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'folderSubmittedToAccountingRejectedOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.REJECTED;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'folderSubmittedToAccountingRejectOwnerId') {
      let status = +frm.get('status').value === this.taskStatus.REJECTED;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'folderSubmittedToAccountingComments') {
      let status = +frm.get('status').value === this.taskStatus.REJECTED;
      frm.get('formRequires').value[key].required = status;
      return status;
    }
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getRejectOwnerList().subscribe((resp: ResponseMessage<any>) => {
      if (resp.status) {
        this.rejectOwnerData = resp.data;
      } else {
        this._toastrService.error(resp.errorMessages, 'Error');
      }
    });
  }

  public onSelectItem(val, frm, valProp: string, formControlName: string): void {
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
    this.configDateOptions(prop, frm, utcDate.jsdate);
    // Update status for form control whose value changed
    frm.get(prop).markAsDirty();
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
    let currentDetailType = frm.get('folderSubmittedToAccountingApplyToStyles').value;
    const duplTypeIndex = currentDetailType.indexOf(orderDetailId);
    if (duplTypeIndex > -1) {
      currentDetailType.splice(duplTypeIndex, 1);
    } else {
      currentDetailType.push(orderDetailId);
    }
    frm.get('folderSubmittedToAccountingApplyToStyles').patchValue(currentDetailType);
  }

  public activeStylesChanges(frm, orderDetailId: number): boolean {
    if (orderDetailId === this.orderDetailId) {
      return true;
    }
    return frm.get('folderSubmittedToAccountingApplyToStyles')
      .value.findIndex((i) => i === orderDetailId) > -1;
  }

  public checkFormValid(): boolean {
    let isValid = true;
    const checkValidControlFunc = (frm: any, list: string[]): boolean => {
      let isControlValue = true;
      list.forEach((i) => isControlValue = isControlValue
        && (frm.get(i).valid || frm.get(i).disabled));
      return isControlValue;
    };
    // this.listFolder.controls.forEach((folder) => {
    if (!this.frm.get('status').value) {
      return false;
    }
    switch (+this.frm.get('status').value) {
      case this.taskStatus.COMPLETED:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'folderSubmittedToAccountingCompletedOnUtc'
        ]);
        break;
      case this.taskStatus.RECEIVED:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'folderSubmittedToAccountingCompletedOnUtc',
          'folderSubmittedToAccountingReceivedOnUtc'
        ]);
        break;
      case this.taskStatus.REJECTED:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'folderSubmittedToAccountingCompletedOnUtc',
          'folderSubmittedToAccountingRejectedOnUtc',
          'folderSubmittedToAccountingRejectOwnerId',
          'folderSubmittedToAccountingComments'
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
      let listDate = [];
      switch (+this.frm.get('status').value) {
        case this.taskStatus.COMPLETED:
          listDate = [
            'folderSubmittedToAccountingCompletedOnUtc'
          ];
          break;
        case this.taskStatus.RECEIVED:
          listDate = [
            'folderSubmittedToAccountingCompletedOnUtc',
            'folderSubmittedToAccountingReceivedOnUtc'
          ];
          break;
        case this.taskStatus.REJECTED:
          listDate = [
            'folderSubmittedToAccountingCompletedOnUtc',
            'folderSubmittedToAccountingRejectedOnUtc'
          ];
          break;
        default:
          break;
      }
      this.myDatePickerService.addTimeToDateArray(this.frm, listDate);
      this.activeModal.close(this.frm.value);
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }
}
