import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  Validators,
  FormGroup,
  FormControl
} from '@angular/forms';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';

// Services
import {
  ChangePasswordService
} from './change-password.service';
import {
  UserContext
} from '../shared/services/user-context/user-context';

// Validators
import {
  Matcher
} from '../shared/validators/matcher.validator';

// Interfaces
import {
  ChangePasswordModel
} from './change-password.model';
import {
  AuthService
} from '../shared/services/auth/auth.service';
import {
  LocalStorageService
} from 'angular-2-local-storage';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'change-password',  // <change-password></change-password>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'change-password.template.html'
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  public frm: FormGroup;
  public formErrors = {
    password: '',
    confirmPassword: '',
  };
  public validationMessages = {
    password: {
      required: 'Password is required.',
      pattern: 'Password must have a upperCase, a lowerCase and a number.'
    },
    confirmPassword: {
      required: 'ConfirmPassword is required.',
      nomatch: 'Password is not match'
    },
  };
  public submitted: boolean = false;

  constructor(private _fb: FormBuilder,
              private _router: Router,
              private _toasterService: ToastrService,
              private _userContext: UserContext,
              private _authService: AuthService,
              private _localStorageService: LocalStorageService,
              private _changePasswordService: ChangePasswordService) {

  }

  public ngOnInit(): void {
    this.buildForm();
  }

  /**
   * buildForm
   */
  public buildForm() {
    this.frm = this._fb.group({
      password: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?!.*[ ]).*$')
      ])),
      confirmPassword: new FormControl('', [Validators.required, Matcher('password')])
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  /**
   * onValueChanged
   * @param data
   */
  public onValueChanged(data?: any) {
    if (!this.frm) {
      return;
    }
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

  public onSubmit(value: ChangePasswordModel) {
    this.submitted = true;
    this._changePasswordService.changePassword(this._userContext.currentUser.id, value)
      .subscribe((resp) => {
        if (resp.status) {
          this.submitted = true;
          this._toasterService.success(resp.message, 'Success');
          if (this._userContext.currentUser.username && value.password) {
            this._authService.login(this._userContext.currentUser.username, value.password);
          } else {
            this.logout();
          }
        } else {
          this.submitted = false;
          this._toasterService.error(resp.errorMessages, 'Error');
        }
      }, (err) => {
        // empty
      });
  }

  public logout(): void {
    const preUserId = this._userContext.currentUser.id;
    this._authService.logout().subscribe(() => {
      this._userContext.clear();
      this._localStorageService.add('preUserId', preUserId);
      this._router.navigate(['auth', 'sign-in']);
    });
  }

  public ngOnDestroy() {
    // empty
  }
}
