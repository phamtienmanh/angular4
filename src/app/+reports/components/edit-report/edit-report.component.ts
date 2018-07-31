import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  Input
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

// 3rd modules
import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import {
  CommonService,
  AuthService
} from '../../../shared/services';
import {
  ToastrService
} from 'ngx-toastr';

// Interfaces
import {
  ResponseMessage
} from '../../../shared/models';
import {
  Roles
} from '../../../shared/models/user.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'edit-report',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'edit-report.template.html',
  styleUrls: [
    'edit-report.style.scss'
  ],
  providers: []
})
export class EditReportComponent implements OnInit, OnDestroy {
  @Input()
  public title: string = 'Edit Report';
  @Input()
  public reportInfo: any;

  public frm: FormGroup;
  public formErrors = {
    name: '',
    title: '',
    emails: '',
    emailSubject: '',
    active: '',
    userIds: '',
    roleIds: ''
  };
  public validationMessages = {
    name: {
      required: 'Name is required.'
    },
    title: {
      required: 'Title is required.'
    },
    emails: {
      required: 'Emails is required.',
      pattern: 'Invalid Email.'
    },
    emailSubject: {
      required: 'Email Subject is required.'
    },
    userIds: {
      required: 'Users is required.'
    },
    roleIds: {
      required: 'Roles is required.'
    }
  };
  public listUser = [];
  public listRole = [];

  constructor(public activeModal: NgbActiveModal,
              private _toastrService: ToastrService,
              private _commonService: CommonService,
              private _authService: AuthService,
              private _fb: FormBuilder) {
    // e
  }

  public ngOnInit(): void {
    this.buildForm();
    if (this.reportInfo) {
      const model = {
        ...this.reportInfo,
        emails: this.reportInfo.emails ? this.reportInfo.emails.split(',') : []
      };
      this.frm.patchValue(model);
    }
    this.getCommonData();
  }

  public getCommonData() {
    this._commonService.getUsersList()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.listUser = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._authService.getRoles()
      .subscribe((resp: ResponseMessage<Roles[]>) => {
        if (resp.status) {
          this.listRole = resp.data || [];
          this.listRole.sort((a: Roles, b: Roles) => {
            return ((a.name < b.name) ? -1 : ((a.name > b.name) ? 1 : 0));
          });
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public buildForm(): void {
    this.frm = this._fb.group({
      id: new FormControl(null),
      active: new FormControl(true),
      name: new FormControl(null, [Validators.required]),
      title: new FormControl(null),
      emails: new FormControl([]),
      emailSubject: new FormControl(''),
      userIds: new FormControl([]),
      roleIds: new FormControl([]),
      formRequires: new FormControl({
        name: {
          required: true
        },
        title: {
          required: false
        },
        emails: {
          required: false
        },
        emailSubject: {
          required: false
        },
        userIds: {
          required: false
        },
        roleIds: {
          required: false
        }
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

  public checkRegExpEmail(control: FormControl) {
    const reg = new RegExp('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@'
      + '[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$');
    if (reg.test(control.value) || control.value === '') {
      return null;
    } else {
      return {pattern: true};
    }
  }

  public onValidationError(event): void {
    const reg = new RegExp('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@'
      + '[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$');
    if (reg.test(event['value'])) {
      const currentValue = this.frm.get('emails').value;
      this.frm.get('emails').patchValue([...currentValue, event['value']]);
    }
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public onSubmit() {
    if (this.frm.valid) {
      let model = {
        ...this.frm.value
      };
      this.activeModal.close({
        frm: model
      });
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }

  public ngOnDestroy(): void {
    // empty
  }
}
