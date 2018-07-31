import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  FormControl,
  FormGroup
} from '@angular/forms';

import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../shared/services/common';
import { ValidationService } from '../../../shared/services/validation';
import {
  AddCommentService
} from './add-comment.service';

// Validators

// Interfaces
import {
  BasicGeneralInfo,
  ResponseMessage
} from '../../../shared/models';
import {
  MyDatePickerService
} from '../../../shared/services/my-date-picker';

@Component({
  selector: 'add-comment',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'add-comment.template.html',
  styleUrls: [
    'add-comment.styles.scss'
  ]
})
export class AddCommentComponent implements OnInit {
  @Input()
  public schedulerId;

  @Input()
  public isView = false;

  public frm: FormGroup;
  public formErrors = {};
  public validationMessages = {};
  public commentsData;

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _addCmtSv: AddCommentService,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    // this.getCommonData();
    // this.updateForm({comment: this.comment});
    if (this.isView) {
      this.getComments();
    } else {
      this.buildForm();
    }
  }

  public getComments() {
    this._addCmtSv.getComment(this.schedulerId)
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.commentsData = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public buildForm(): void {
    let controlConfig = {
      comment: new FormControl(''),
      formRequires: new FormControl({
        // status: {
        //   required: true
        // },
        // machine: {
        //   required: true
        // }
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

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string) {
    // if (key === 'creditApprovedDateOnUtc') {
    //   let status = +frm.get('status').value === this.taskStatus.APPROVED;
    //   frm.get('formRequires').value[key].required = status;
    //   return status;
    // }
  }

  public updateForm(data: any): void {
    if (data) {
      this.frm.patchValue(data);
    }
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    // this._commonService.getServiceCode()
    //   .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
    //     if (resp.status) {
    //       this.printMethodData = resp.data;
    //     } else {
    //       this._toastrService.error(resp.errorMessages, 'Error');
    //     }
    //   });
  }

  /**
   * Fire select value change event
   * @param value
   * @param prop
   */
  public onSelectValueChange(value: any, valueProp: string, formProp: string): void {
    // Ng Select return valid data with current value
    if (value[valueProp]) {
      this.frm.get(formProp).setValue(value[valueProp]);
    } else {
      // Ng Select return valid data with new value
      if (value.text) {
        this.frm.get(formProp).setValue(value.text);
      } else {
        // Ng Select return invalid data
        this.frm.get(formProp).setValue(value);
      }
    }

    // Update status for form control whose value changed
    this.frm.get(formProp).markAsDirty();
  }

  public onSubmitForm(): void {
    this._addCmtSv.addComment(this.schedulerId, this.frm.get('comment').value)
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
          this.activeModal.close(true);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }
}
