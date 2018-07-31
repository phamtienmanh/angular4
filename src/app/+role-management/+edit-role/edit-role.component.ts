import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  AfterViewInit,
  HostListener
} from '@angular/core';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

// 3rd modules
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  ToastrService
} from 'ngx-toastr';

// Components
import {
  CreateOrUpdateRoleComponent
} from '../create-or-update-role';

// Services
import {
  EditRoleService
} from './edit-role.service';
import {
  AuthService
} from '../../shared/services/auth/auth.service';
import {
  UserContext
} from '../../shared/services/user-context/user-context';
import { Util } from '../../shared/services/util';
import { RoleManagementService } from '../role-management.service';
import * as _ from 'lodash';

// Interfaces
import {
  Roles,
  UserInfo
} from '../../shared/models/user.model';
import { ResponseMessage } from '../../shared/models/respone.model';
import { Subscription } from 'rxjs/Subscription';
import { RoleInfo } from '../role-management.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'edit-role',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'edit-role.template.html',
  styleUrls: [
    'edit-role.style.scss'
  ]
})
export class EditRoleComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(CreateOrUpdateRoleComponent)
  public childComponent: CreateOrUpdateRoleComponent;

  public showChangePassBtn = false;
  public activatedSub: Subscription;

  public isPageReadOnly = false;

  public isShowStickyBtn = false;

  constructor(private _authService: AuthService,
              private _editRoleService: EditRoleService,
              private _roleManagementService: RoleManagementService,
              private _activatedRoute: ActivatedRoute,
              private _toastrService: ToastrService,
              private _breadcrumbService: BreadcrumbService,
              private _router: Router,
              private _utilService: Util,
              private _userContext: UserContext) {
    this.isPageReadOnly = !this._authService.checkCanModify('Roles');
  }

  public ngOnInit(): void {
    // Get id from url
    this.activatedSub = this._activatedRoute.params.subscribe((params: { id: number }) => {
      // Subscribe roles after subscribe user info to avoid async data
      this._editRoleService.getRoleInfo(params.id)
        .subscribe((roleInfoResp: ResponseMessage<RoleInfo>) => {
          if (roleInfoResp.status) {
            this.configFriendlyRoutes(roleInfoResp.data.roleName);
            this._roleManagementService.updateRoleEvent.emit(roleInfoResp.data);
          } else {
            if (roleInfoResp.errorMessages[0].includes('not exist')) {
              this._router.navigate(['not-found']);
            }
            this._toastrService.error(roleInfoResp.errorMessages, 'Error');
          }
        });
    });
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      // handle sticky btn when scroll
      if (this._utilService.scrollElm) {
        if (this._utilService.scrollElm
            .scrollHeight - window.innerHeight > 110) {
          this.isShowStickyBtn = true;
        }
      }
    }, 1000);
  }

  /**
   * Config text on breadcrumb
   * @param roleName
   */
  public configFriendlyRoutes(roleName: string) {
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('/role-management/.*', `${roleName}`);
  }

  /**
   * Method call server to update user
   * @param value
   */
  public onSubmit() {
    let flag = this.childComponent.isFormValid();
    if (!flag) {
      return;
    }
    this._editRoleService.updateRole(this.childComponent.formValue)
      .subscribe((resp: ResponseMessage<RoleInfo>) => {
        if (resp.status) {
          // Object.assign(this.roleData, resp.data);
          this.childComponent.preRoleInfoData = _.cloneDeep(this.childComponent.formValue);
          this.childComponent.preRoleCbList = _.cloneDeep(this.childComponent
            .formValue.permissions);
          // Update roleName on breadcrumb
          this.configFriendlyRoutes(this.childComponent.formValue.roleName);
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * cancel
   */
  public cancel() {
    let previousRoute: string = this._utilService.previousRouteUrl;
    if (previousRoute) {
      this._router.navigate([previousRoute]);
    } else {
      this._router.navigate(['role-management']);
    }
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  public onAppScroll(event: any) {
    if (event.type === 'resize') {
      if (this._utilService.scrollElm &&
        this._utilService.scrollElm.scrollHeight  - (this._utilService.scrollElm.scrollTop
          + window.innerHeight) < 110) {
      this.isShowStickyBtn = false;
      } else if (this._utilService.scrollElm) {
        this.isShowStickyBtn = true;
      }
      return;
    }
    if (event.target.scrollingElement.scrollHeight  - (event.target.scrollingElement
        .scrollTop + window.innerHeight) < 110) {
      this.isShowStickyBtn = false;
    } else {
      this.isShowStickyBtn = true;
    }
  }

  public ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
