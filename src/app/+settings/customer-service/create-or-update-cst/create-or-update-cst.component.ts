import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
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
import { AuthService } from '../../../shared/services/auth';
import { CommonService } from '../../../shared/services/common';
import { CustomerServiceService } from '../customer-service.service';

// Interfaces
import {
  ResponseMessage
} from '../../../shared/models';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'create-or-update-cst',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'create-or-update-cst.template.html',
  styleUrls: [
    'create-or-update-cst.style.scss'
  ],
  providers: [CustomerServiceService]
})
export class CreateOrUpdateCstComponent implements OnInit,
                                                   OnDestroy {
  public title: string;
  public lookupTableInfo: any;
  public customerServiceTeamsData = [];

  public frm: FormGroup;
  public formErrors = {
    name: ''
  };
  public validationMessages = {
    name: {
      required: 'Name is required.'
    }
  };

  public isEdit = false;
  public isPageReadOnly = false;

  constructor(public activeModal: NgbActiveModal,
              private _fb: FormBuilder,
              private _authService: AuthService,
              private _customerServiceService: CustomerServiceService,
              private _commonService: CommonService,
              private _toastrService: ToastrService) {
    // this.isPageReadOnly = !this._authService.checkCanModify('Settings');
  }

  public ngOnInit(): void {
    this.buildForm();
    if (this.lookupTableInfo) {
      const model = this.lookupTableInfo;
      this.frm.reset();
      this.frm.patchValue(model);
      this.isEdit = true;
    }
    this._commonService.getCsrRoleList().subscribe((res: ResponseMessage<any>) => {
      if (res.status) {
        this.customerServiceTeamsData = res.data;
      } else {
        this._toastrService.error(res.errorMessages, 'Error');
      }
    });
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public buildForm(): void {
    this.frm = this._fb.group({
      id: new FormControl(''),
      customerServiceTeams: new FormControl({
        value: [],
        disabled: this.isPageReadOnly
      }),
      name: new FormControl({
        value: '',
        disabled: this.isPageReadOnly
      }, [Validators.required]),
      description: new FormControl({
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

  /**
   * onSubmit
   */
  public onSubmit() {
    setTimeout(() => {
      if (this.frm.get('name').value.trim()) {
        let model = this.frm.value;
        if (this.isEdit) {
          this._customerServiceService.updateTeam(model)
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
          this._customerServiceService.addTeam(model)
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
