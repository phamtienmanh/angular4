import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

import {
  Router
} from '@angular/router';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';

// Services
import {
  NewRoleService
} from './new-role.service';
import {
  ProgressService
} from '../../shared/services/progress';

// Interfaces
import {
  CreateOrUpdateRoleComponent
} from '../create-or-update-role';
import {
  ResponseMessage
} from '../../shared/models/respone.model';
import {
  AuthService
} from '../../shared/services/auth/auth.service';
import {
  RoleInfo
} from '../role-management.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'new-role',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'new-role.template.html',
  styleUrls: [
    'new-role.style.scss'
  ]
})
export class NewRoleComponent implements OnInit {
  @ViewChild(CreateOrUpdateRoleComponent)
  public childComponent: CreateOrUpdateRoleComponent;

  public isPageReadOnly = false;

  constructor(private _newRoleService: NewRoleService,
              private _authService: AuthService,
              private router: Router,
              private _progressService: ProgressService,
              private _breadcrumbService: BreadcrumbService,
              private _toastrService: ToastrService) {
    this.isPageReadOnly = !this._authService.checkCanModify('Roles');
  }

  public ngOnInit(): void {
    this.configFriendlyRoutes();
  }

  /**
   * Config text on breadcrumb
   * @param username
   */
  public configFriendlyRoutes() {
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('/role-management/.*', 'New Role');
  }

  /**
   * onSubmit
   */
  public onSubmit() {
    let flag = this.childComponent.isFormValid();
    if (!flag) {
      return;
    }
    this._newRoleService.createRole(this.childComponent.formValue)
      .subscribe((resp: ResponseMessage<RoleInfo>) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
          this.router.navigate(['role-management', resp.data.id]);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public cancel() {
    this.router.navigate(['role-management']);
  }
}
