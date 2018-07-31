import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
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
import { AuthService } from '../../../shared/services/auth/auth.service';
import { CommonService } from '../../../shared/services/common/common.service';
import { ScheduledTaskService } from '../scheduled-task.service';

// Interfaces
import {
  ResponseMessage
} from '../../../shared/models/respone.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'create-or-update-scdt',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'create-or-update-scdt.template.html',
  styleUrls: [
    'create-or-update-scdt.style.scss'
  ],
  providers: [ScheduledTaskService]
})
export class CreateOrUpdateScdtComponent implements OnInit,
                                                    OnDestroy {
  public title: string;
  public lookupTableInfo: any;

  public frm: FormGroup;
  public formErrors = {
    seconds: '',
    hourStartOnEst: '',
    hourEndOnEst: ''
  };
  public validationMessages = {
    seconds: {
      required: 'Interval is required.'
    },
    hourStartOnEst: {
      required: 'Hour Start is required.',
      invalidValue: 'Must be 0 to 23.'
    },
    hourEndOnEst: {
      required: 'Hour End is required.',
      invalidValue: 'Must be 0 to 23.',
      endHourLessStart: 'End Hour must be over Start Hour.'
    }
  };

  public isPageReadOnly = false;

  constructor(public activeModal: NgbActiveModal,
              private _fb: FormBuilder,
              private _authService: AuthService,
              private _scheduledTaskService: ScheduledTaskService,
              private _commonService: CommonService,
              private _toastrService: ToastrService) {
    // this.isPageReadOnly = !this._authService.checkCanModify('Settings');
  }

  public ngOnInit(): void {
    const curDate = new Date();
    this.buildForm();
    setTimeout(() => {
      if (this.lookupTableInfo) {
        this.frm.patchValue(this.lookupTableInfo);
      }
    });
  }

  public buildForm(): void {
    this.frm = this._fb.group({
      id: new FormControl(''),
      isEnabled: new FormControl(''),
      seconds: new FormControl({
        value: '',
        disabled: this.isPageReadOnly
      }, [Validators.required]),
      hourStartOnEst: new FormControl({
        value: '',
        disabled: this.isPageReadOnly
      }),
      hourEndOnEst: new FormControl({
        value: '',
        disabled: this.isPageReadOnly
      })
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

  public onSubmit() {
    setTimeout(() => {
      if (this.frm.valid &&
        !this.validateHour(0, this.frm.get('hourStartOnEst').value) &&
        !this.validateHour(1, this.frm.get('hourEndOnEst').value)) {
        let model = this.frm.value;
        this._scheduledTaskService.updateTask(model)
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
        this._commonService.markAsDirtyForm(this.frm, true);
      }
    });
  }

  public validateHour(type, value) {
    value = parseInt(value, 10);
    if (value < 0 || value > 23) {
      return 1;
    }
    if (type === 1 && value < this.frm.get('hourStartOnEst').value) {
      return 2;
    }
    return 0;
  }

  public ngOnDestroy(): void {
    // empty
  }
}
