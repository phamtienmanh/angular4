import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  NgbActiveModal,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

import {
  HttpParams
} from '@angular/common/http';

import { IMyDateModel } from 'mydatepicker';

// Services
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../shared/services/common';
import { ValidationService } from '../../../../shared/services/validation';
import {
  LocationDetailService
} from '../../../+sales-order/+order-styles/+styles-info/+print-location/+location-detail';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';
import { ExtraValidators } from '../../../../shared/services/validation';

// Validators
import {
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
  StyleUploadedType
} from '../../../+sales-order/+order-styles/+styles-info/+style';
import {
  UploadedType
} from '../../../+sales-order';
import {
  UploadComponent
} from '../../../+sales-order/+order-styles/+styles-info/+print-location/modules';

@Component({
  selector: 'teck-pack-sheet',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'teck-pack-sheet.template.html',
  styleUrls: [
    'teck-pack-sheet.styles.scss'
  ]
})
export class TeckPackSheetComponent implements OnInit {
  @Input()
  public title = '';
  @Input()
  public locationId;
  @Input()
  public rowDetail;

  public statusData = Status.filter((stt) => [
    TaskStatus.BLANK,
    TaskStatus.DONE
  ].indexOf(stt.id) > -1);

  public frm: FormGroup;
  public formErrors = {
    printTechSheetReadyDateOnUtc: ''
  };
  public validationMessages = {
    printTechSheetReadyDateOnUtc: {
      required: 'Print Tech Sheet Ready Date is required.'
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
  public taskStatus = TaskStatus;
  public styleUploadedType = StyleUploadedType;
  public uploadedType = UploadedType;
  public techSheetFiles = [];

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _locationDetailService: LocationDetailService,
              private _toastrService: ToastrService,
              private _modalService: NgbModal,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    this.buildForm();
    this.updateForm(this.rowDetail);
    this.refreshFileView();
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public buildForm(): void {
    let controlConfig = {
      status: new FormControl(null, [Validators.required]),
      printTechSheetReadyDate: new FormControl(''),
      printTechSheetReadyDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'printTechSheetReadyDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      artFiles: new FormControl([]),
      formRequires: new FormControl({
        status: {
          required: true
        },
        printTechSheetReadyDateOnUtc: {
          required: false
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
    patchDateFunc('printTechSheetReadyDateOnUtc', 'printTechSheetReadyDate');
  }

  public updateForm(data: any): void {
    if (data) {
      this.frm.patchValue(data);
      this.setDateValue();
    }
  }

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    if (key === 'printTechSheetReadyDateOnUtc') {
      let status = +frm.get('status').value === this.taskStatus.DONE;
      frm.get('formRequires').value[key].required = status;
      return status;
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

  public openUploader(type: number): void {
    let modalRef = this._modalService.open(UploadComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static',
      windowClass: 'super-lg'
    });
    let meg = 'Art file(s) uploaded successfully';
    if (this.techSheetFiles.length && type === 2) {
      let files = this.techSheetFiles.slice(0);
      modalRef.componentInstance.fileExist = files;
      meg = 'Save was successful.';
    }
    modalRef.componentInstance.title = 'Tech Sheet(s)';
    modalRef.componentInstance.uploadType = this.uploadedType.TechSheets;
    modalRef.componentInstance.locationType = type;
    modalRef.componentInstance.locationId = this.locationId;
    modalRef.result.then((res: any) => {
      if (res) {
        this.refreshFileView();
        if (res !== 'delete') {
          this._toastrService.success(meg, 'Success');
        } else {
          this._toastrService.success('Art file(s) removed successfully', 'Success');
        }
      } else {
        // if ((!this.fileViewReceived.length && type === 0) ||
        //     (!this.fileViewApproved.length && type === 1)) {
        //       this._toastrService
        //       .error('You must upload at least 1 art file for Art to be approved.', 'Error');
        // }
      }
    }, (err) => {
      // if not, error
    });
  }

  public refreshFileView() {
    let params: HttpParams = new HttpParams()
      .set('printLocationId', this.locationId);
    this._locationDetailService.getArtFiles(params)
      .subscribe((resp: ResponseMessage<any>): void => {
        if (resp.status) {
          this.techSheetFiles = resp.data.filter((item) => item.type === 2);
          this.techSheetFiles = this.insertSpace(this.techSheetFiles);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public insertSpace(data) {
    let result = data;
    result.forEach((item) => {
      // let l =  item.artFileTypeName.length;
      for (let i = 1; i < item.artFileTypeName.length; i++) {
        if (item.artFileTypeName[i] >= 'A' && item.artFileTypeName[i] <= 'Z') {
          item.artFileTypeName =
            item.artFileTypeName.slice(0, i) + ' ' + item.artFileTypeName.slice(i);
          i++;
        }
      }
    });
    return result;
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
    switch (+this.frm.get('status').value) {
      case this.taskStatus.DONE:
        isValid = isValid && checkValidControlFunc(this.frm, [
          'printTechSheetReadyDateOnUtc'
        ]);
        break;
      default:
        break;
    }
    return isValid;
  }

  public onSubmitForm(): void {
    if (this.checkFormValid()) {
      this.myDatePickerService.addTimeToDateArray(this.frm, ['printTechSheetReadyDateOnUtc']);
      this.activeModal.close({
        status: true,
        data: this.frm.value
      });
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }

  public onClosePopup(): void {
    this.activeModal.close({
      status: false,
      data: {
        isUploaded: this.techSheetFiles.length
      }
    });
  }
}
