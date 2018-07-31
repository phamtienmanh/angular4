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
import {
  AuthService,
  CommonService
} from '../../../shared/services';
import { ProcessesService } from '../processes.service';

// Interfaces
import {
  ResponseMessage
} from '../../../shared/models';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'create-or-update-process',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'create-or-update-process.template.html',
  styleUrls: [
    'create-or-update-process.style.scss'
  ],
  providers: [ProcessesService]
})
export class CreateOrUpdateProcessComponent implements OnInit,
                                                   OnDestroy {
  public title: string;
  public lookupTableInfo: any;

  public frm: FormGroup;
  public formErrors = {
    name: ''
  };
  public validationMessages = {
    name: {
      required: 'Name is required.'
    },
    processNumber: {
      required: 'Process # is required.',
      invalidValue: 'Process # values from 1 to 50.'
    },
    peopleRequired: {
      required: '# People Required is required.',
      invalidValue: '# People Required values from 1 to 50.'
    },
    staffAvgPcsPerHr: {
      required: 'Staff Avg Pcs/Hr is required.',
      invalidValue: 'Staff Avg Pcs/Hr values from 1 to 1000.'
    }
  };

  public isEdit = false;
  public isPageReadOnly = false;

  constructor(public activeModal: NgbActiveModal,
              private _fb: FormBuilder,
              private _authService: AuthService,
              private _commonService: CommonService,
              private _processesService: ProcessesService,
              private _toastrService: ToastrService) {
    // this.isPageReadOnly = !this._authService.checkCanModify('Settings');
  }

  public ngOnInit(): void {
    this.buildForm();
    if (this.lookupTableInfo) {
      const model = {
        ...this.lookupTableInfo,
        isEnabled: !this.lookupTableInfo.isDisabled
      };
      this.frm.patchValue(model);
      this.isEdit = true;
    }
  }

  public buildForm(): void {
    this.frm = this._fb.group({
      id: new FormControl(''),
      isEnabled: new FormControl(true),
      name: new FormControl('', [Validators.required]),
      processNumber: new FormControl('', [Validators.required, this.numberInRange(1, 50)]),
      peopleRequired: new FormControl('', [Validators.required, this.numberInRange(1, 50)]),
      staffAvgPcsPerHr: new FormControl('', [Validators.required, this.numberInRange(1, 1000)]),
      formRequires: new FormControl({
        name: {
          required: true
        },
        processNumber: {
          required: true
        },
        peopleRequired: {
          required: true
        },
        staffAvgPcsPerHr: {
          required: true
        }
      })
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  public numberInRange(min: number, max: number) {
    return (input: FormControl) => {
      if (!input.value && input.value !== 0) {
        return null;
      }
      if (input.value < min || input.value > max) {
        // hasError invalidValue true
        return {invalidValue: true};
      }
      return null;
    };
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
   * onSubmit
   */
  public onSubmit() {
    if (this.frm.valid) {
      let model = {
        ...this.frm.value,
        isDisabled: !this.frm.get('isEnabled').value
      };
      if (this.isEdit) {
        this._processesService.updateProcess(model)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              this._toastrService.success(resp.message, 'Success');
              this.activeModal.close(true);
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      } else {
        this._processesService.addProcess(model)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              this._toastrService.success(resp.message, 'Success');
              this.activeModal.close(true);
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }

  public ngOnDestroy(): void {
    // empty
  }
}
