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
  CreateOrUpdateUserComponent
} from '../create-or-update-user/create-or-update-user.component';

// Services
import {
  UserManagementService
} from '../user-management.service';
import {
  AuthService
} from '../../shared/services/auth/auth.service';
import {
  UserContext
} from '../../shared/services/user-context/user-context';
import { Util } from '../../shared/services/util';
import * as _ from 'lodash';

// Interfaces
import {
  Roles,
  UserInfo
} from '../../shared/models/user.model';
import {
  ResponseMessage
} from '../../shared/models/respone.model';
import {
  Subscription
} from 'rxjs/Subscription';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'edit-user',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'edit-user.template.html',
  styleUrls: [
    'edit-user.style.scss'
  ]
})
export class EditUserComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(CreateOrUpdateUserComponent)
  public childComponent: CreateOrUpdateUserComponent;

  public userData: UserInfo;
  public showChangePassBtn = false;
  public activatedSub: Subscription;
  public roleListData = [];

  public isPageReadOnly = false;
  public isCurrentUser = false;
  public isShowStickyBtn = false;

  constructor(private _authService: AuthService,
              private _userManagementService: UserManagementService,
              private _activatedRoute: ActivatedRoute,
              private _toastrService: ToastrService,
              private _breadcrumbService: BreadcrumbService,
              private _router: Router,
              private _utilService: Util,
              private _userContext: UserContext) {}

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Users');
    // Get current user id from url
    this.activatedSub = this._activatedRoute.params.subscribe((params: { id: string }) => {
      this.isCurrentUser = this._userContext.currentUser.id === Number.parseInt(params.id);
      this._authService.getRoles()
        .subscribe((roleResp: ResponseMessage<Roles[]>) => {
          if (roleResp.status) {
            this.childComponent.roleListData = roleResp.data || [];
            this.roleListData = roleResp.data || [];
            this.childComponent.roleListData.sort((a: Roles, b: Roles) => {
              return ((a.name < b.name) ? -1 : ((a.name > b.name) ? 1 : 0));
            });
            // Subscribe roles after subscribe user info to avoid async data
            this._authService.getUserInfo(Number.parseInt(params.id))
              .subscribe((userInfoResp: ResponseMessage<UserInfo>) => {
                if (userInfoResp.status) {
                  this.configFriendlyRoutes(userInfoResp.data.firstName,
                    userInfoResp.data.lastName);
                  this.userData = userInfoResp.data;
                  this._userManagementService.updateUserEvent.emit(this.userData);
                } else {
                  if (userInfoResp.errorMessages[0].includes('not exist')) {
                    this._router.navigate(['not-found']);
                  }
                  this._toastrService.error(userInfoResp.errorMessages, 'Error');
                }
              });
          } else {
            this._toastrService.error(roleResp.errorMessages, 'Error');
          }
        });
    });
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      if (this._utilService.scrollElm) {
        if (this._utilService.scrollElm
            .scrollHeight - window.innerHeight > 10) {
          this.isShowStickyBtn = true;
        }
      }
    }, 1000);
  }

  /**
   * Config text on breadcrumb
   * @param username
   */
  public configFriendlyRoutes(firstName: string, lastName: string) {
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('/user-management/.*', `${firstName} ${lastName}`);
  }

  /**
   * Fire event childComponent sumbit
   * @param userData
   */
  public submitData(userData: UserInfo) {
    this.userData = userData;
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
    const accountManager = this.roleListData.find((i) => i.name === 'Account Manager');
    if (!accountManager || this.userData.listRoleIds
        .findIndex((i) => i === accountManager.id) === -1) {
      this.userData.isPrimaryAccountManager = false;
    }
    this._userManagementService.updateUser(this.userData)
      .subscribe((resp: ResponseMessage<UserInfo>) => {
        if (resp.status) {
          // Object.assign(this.userData, resp.data);
          this.childComponent.preUserInfoData = _.cloneDeep(this.userData);
          this.childComponent.prelistRoleIds = _.cloneDeep([...this.userData.listRoleIds]);
          if (this.userData.username === this._userContext.currentUser.username) {
            // update current user info in userContext
            this._userContext.update(this.userData);
          }
          this._userManagementService.updatePrimaryEv.next(this.userData.isPrimaryAccountManager);
          // Show change password button ater update completed
          this.showChangePassBtn = false;
          this.childComponent.changePasswordStatus = false;
          // Update username on breadcrumb
          this.configFriendlyRoutes(this.userData.firstName, this.userData.lastName);
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
      this._router.navigate(['user-management']);
    }
  }

  /**
   * revert
   */
  public revert() {
    this.showChangePassBtn = false;
    this.childComponent.resetData();
  }

  /**
   * changePassword
   */
  public changePassword() {
    this.showChangePassBtn = true;
    this.childComponent.changePassword();
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  public onAppScroll(event: any) {
    if (event.type === 'resize') {
      if (this._utilService.scrollElm &&
        this._utilService.scrollElm.scrollHeight  - (this._utilService.scrollElm.scrollTop
          + window.innerHeight) < 10) {
      this.isShowStickyBtn = false;
      } else if (this._utilService.scrollElm) {
        this.isShowStickyBtn = true;
      }
      return;
    }
    if (event.target.scrollingElement.scrollHeight  - (event.target.scrollingElement
        .scrollTop + window.innerHeight) < 10) {
      this.isShowStickyBtn = false;
    } else {
      this.isShowStickyBtn = true;
    }
  }

  public ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
