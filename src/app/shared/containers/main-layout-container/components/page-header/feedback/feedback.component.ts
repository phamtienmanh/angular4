import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  QueryList,
  ViewChildren,
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

// Services
import { FeedbackService } from './feedback.service';
import {
  ValidationService
} from '../../../../../services/validation/validation.service';
import { ToastrService } from 'ngx-toastr';
import {
  CommonService
} from '../../../../../services/common/common.service';

// Interfaces
import {
  FeedbackRequest
} from './feedback.model';
import { BasicResponse } from '../../../../../models/respone.model';

@Component({
  selector: 'feedback',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'feedback.template.html',
  styleUrls: [
    'feedback.style.scss'
  ]
})
export class FeedbackComponent implements OnInit {
  @Input()
  public title = '';
  @Input()
  public userData: FeedbackRequest;

  public frm: FormGroup;
  public formErrors = {
    fullName: '',
    email: '',
    message: ''
  };
  public validationMessages = {
    fullName: {
      required: 'Name is required.'
    },
    email: {
      required: 'Email is required.',
      pattern: 'Email address is not valid'
    },
    message: {
      required: 'Message is required.'
    },
    default: {
      required: 'This is required.'
    }
  };
  public isSubmitting = false;

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _feedbackService: FeedbackService) {
  }

  public ngOnInit(): void {
    this.buildForm();
    this.updateForm(this.userData);
  }

  public buildForm(): void {
    let controlConfig = {
      fullName: new FormControl('', [Validators.required]),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@'
          + '[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$')
      ])),
      message: new FormControl('', [Validators.required]),
      url: new FormControl(''),
      formRequires: new FormControl({
        fullName: {
          required: true
        },
        email: {
          required: true
        },
        message: {
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

  public updateForm(data: FeedbackRequest): void {
    if (data) {
      this.frm.patchValue(data);
    }
  }

  public onSubmitForm(): void {
    if (this.frm.valid) {
      this.isSubmitting = true;
      this._feedbackService.requestFeedback(this.frm.value)
        .subscribe((resp: BasicResponse) => {
          this.isSubmitting = false;
          if (resp.status) {
            this._toastrService.success(resp.message, 'Success');
            this.activeModal.close(this.frm.value);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    } else {
      this._commonService.markAsDirtyForm(this.frm);
    }
  }
}
