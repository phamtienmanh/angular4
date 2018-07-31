import {
  Component,
  ViewEncapsulation,
  OnInit,
  HostBinding
} from '@angular/core';

import {
  FormBuilder,
  Validators,
  FormGroup,
  FormControl
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  AuthService
} from '../shared/services/auth';

import {
  LoginForm
} from '../shared/models';

import {
  bottomToTopFadeAnimation
} from '../shared/animations';
import { UserContext } from '../shared/services/user-context/user-context';
import {
  PageConfiguration
} from '../shared/containers/main-layout-container/components/sidebar/sidebar.model';
import { CommonService } from '../shared/services/common';
import * as _ from 'lodash';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'sign-in',  // <sign-in></sign-in>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'sign-in.template.html',
  animations: [bottomToTopFadeAnimation()]
})
export class SignInComponent implements OnInit {
  @HostBinding('@routerTransition')
  public routerTransition = 'true';
  public frm: FormGroup;
  public formErrors = {
    email: '',
    password: ''
  };
  public validationMessages = {
    email: {
      required: 'Email is required.',
    },
    password: {
      required: 'Password is required.',
    }
  };
  public hasError: boolean = false;
  public submitted: boolean = false;
  public errorMessage: string = '';

  private _pageConfig = _.cloneDeep(PageConfiguration);

  constructor(private _fb: FormBuilder,
              private _router: Router,
              private _userContext: UserContext,
              private _commonService: CommonService,
              private _authService: AuthService) {
  }

  public ngOnInit(): void {
    let isLogged: boolean = this._authService.checkLogged();
    if (isLogged) {
      this._pageConfig = this._commonService.updateSidebarConfig(this._pageConfig);
      const firstPage = this._userContext.currentUser.permissions
        .filter((i) => i.type === 1)
        .find((i) => i.isView === true && i.name !== 'Orders');
      if (firstPage) {
        const firstPageConfig: any = this._pageConfig.find((i) =>
          firstPage.name.includes(i.name) && i.isView);
        if (firstPageConfig) {
          if (['Settings', 'OrderLog'].indexOf(firstPageConfig.name) === -1) {
            this._router.navigate([firstPageConfig.routerLink]);
          } else {
            const firstSubMenuConfig = firstPageConfig.subMenu.find((i) => i.isView);
            if (firstSubMenuConfig) {
              this._router.navigate([firstSubMenuConfig.routerLink]);
            } else if (!firstPageConfig.subMenu.length) {
              this._router.navigate([firstPageConfig.routerLink]);
            }
          }
        } else {
          this._router.navigate(['dashboard']);
        }
      } else {
        this._router.navigate(['not-found']);
      }
    }
    this.buildForm();
  }

  public buildForm(): void {
    this.frm = this._fb.group({
      email: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

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

  public onSubmit(value: LoginForm) {
    this._authService.login(value.email, value.password);
  }
}
