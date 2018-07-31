import {
  Injectable
} from '@angular/core';

import {
  Response,
} from '@angular/http';
import {
  Observable
} from 'rxjs/Observable';

import {
  Router
} from '@angular/router';

import {
  Idle,
  DEFAULT_INTERRUPTSOURCES
} from '@ng-idle/core';

import {
  HttpParams
} from '@angular/common/http';

import { ExtendedHttpService } from '../http';

// Services
import { UserContext } from '../user-context';
import { ProgressService } from '../progress';
import { SignalRService } from '../signalr';
import { LocalStorageService } from 'angular-2-local-storage';
import { Util } from '../util';
import { CommonService } from '../common';

// 3rd modules
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';

// Global const
import { AppConstant } from '../../../app.constant';

// Interfaces
import {
  UserInfo,
  Roles,
  FullAuthentication,
  ResetUserInfo
} from '../../models';
import {
  BasicResponse,
  BasicUserInfo,
  BasicCustomerInfo,
  ResponseMessage
} from '../../models';
import {
  PageConfiguration
} from '../../containers/main-layout-container/components/sidebar/sidebar.model';

@Injectable()
export class AuthService {
  private _rolesList = [];
  private redirectToUrlAfterLogin: string[];
  private _pageConfig = _.cloneDeep(PageConfiguration);

  constructor(private _http: ExtendedHttpService,
              private _userContext: UserContext,
              private _utilService: Util,
              private _commonService: CommonService,
              private _router: Router,
              private _progressService: ProgressService,
              private _localStorageService: LocalStorageService,
              private _toastrService: ToastrService,
              private _signalRService: SignalRService,
              private _idle: Idle) {
    // empty
  }

  public get RolesList(): BasicCustomerInfo[] {
    return this._rolesList;
  }

  /**
   * transformRequestHandler
   * @param obj
   * @returns {string}
   */
  public transformRequestHandler(obj): string {
    let str: string[] = [];
    for (let p in obj) {
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
      }
    }
    return str.join('&');
  }

  /**
   * login
   * @param email
   * @param pass
   * @returns {Observable<FullAuthentication>}
   */
  public login(email, pass): Observable<FullAuthentication> {
    if (!email || !pass) {
      return;
    }
    let data = {
      username: email,
      password: pass,
      grant_type: 'password',
      client_id: AppConstant.clientId,
      client_secret: AppConstant.clientSecret
    };
    let requestPayload: string = this.transformRequestHandler(data);
    this._progressService.start();
    this._commonService.getVersionApp().subscribe((resp: any) => {
      if (this._localStorageService.get('VersionApp') !== resp.data.name) {
        this._localStorageService.clearAll();
        this._localStorageService.add('VersionApp', resp.data.name);
      }
      this._http.post(`/token`, requestPayload)
        .subscribe((response: Response) => {
          this._progressService.done();
          this.saveUserInfo(response);
        }, (err) => {
          this._progressService.done();
          this._toastrService.error(err.error_description, 'Error');

        }
      );
    });
  }

  /**
   * logout
   * @returns {Observable<Response>}
   */
  public logout(): Observable<Response> {
    this.redirectToUrlAfterLogin = [];
    // disconnect signalR
    this._signalRService.stop();
    return this._http.post(`/api/v1/account/logout`, {});
  }

  /**
   * getUserInfo
   * @param {number} id
   * @returns {Observable<ResponseMessage<UserInfo>>}
   */
  public getUserInfo(id: number): Observable<ResponseMessage<UserInfo>> {
    return this._http.get(`/api/v1/account/users/${id}`);
    // .catch(this.handleError);
  }

  /**
   * getRoles
   * @returns {Observable<ResponseMessage<Roles[]>>}
   */
  public getRoles(): Observable<ResponseMessage<Roles[]>> {
    return this._http.get(`/api/v1/account/roles`);
    // .catch(this.handleError);
  }

  /**
   * getAllUsers
   * @returns {Observable<R>}
   */
  public getAllUsers(): Observable<ResponseMessage<BasicUserInfo[]>> {
    return this._http.get(`/api/v1/account/users/all`);
    // .catch(this.handleError);
  }

  /**
   * forgotPassword
   * @param email
   * @returns {any}
   */
  public forgotPassword(email: string): Observable<BasicResponse> {
    this._progressService.start();
    return this._http.post(`/api/v1/account/forgotpassword`, {email})
      .finally(() => {
        this._progressService.done();
      });
    // .catch(this.handleError);
  }

  /**
   * resetPassword
   * @param {ResetUserInfo} obj
   * @returns {Observable<BasicResponse>}
   */
  public resetPassword(obj: ResetUserInfo): Observable<BasicResponse> {
    this._progressService.start();
    return this._http.post(`/api/v1/account/resetpassword`, obj)
      .finally(() => {
        this._progressService.done();
      });
    // .catch(this.handleError);
  }

  /**
   * validateResetPassword
   * @param {number} userId
   * @param {string} code
   * @returns {Observable<BasicResponse>}
   */
  public validateResetPassword(userId: number,
                               code: string): Observable<BasicResponse> {
    let params: HttpParams = new HttpParams()
      .set('userId', userId.toString())
      .set('code', code);
    return this._http.get(`/api/v1/account/validateresetpasswordtoken`, {
      params
    });
    // .catch(this.handleError);
  }

  /**
   * get user info and save it
   * @param resp
   */
  public saveUserInfo(resp: any) {
    let body: FullAuthentication = resp;
    this._userContext.setToken(body.access_token, body.refresh_token);
    this._progressService.start();
    this.getUserInfo(body.userId).subscribe((respInfo: ResponseMessage<UserInfo>) => {
        this._progressService.done();
        if (respInfo.status) {
          let res: UserInfo = respInfo.data;
          this._userContext.update(res);
          if (!res.isChangedDefaultPassword) {
            this._router.navigate(['auth', 'change-password']);
            return;
          }
          const preUserId = +this._localStorageService.get('preUserId');
          if (preUserId !== this._userContext.currentUser.id) {
            this._localStorageService.remove('newOrderLogCols');
          }
          this._localStorageService.remove('preUserId');

          const redirectUrlPage = this._localStorageService.get('urlResolveGuard') as string;
          if (redirectUrlPage) {
            this._router.navigateByUrl(redirectUrlPage);
          } else {
            const funcRedirectToFirstPage = () => {
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
            };
            if (!this.redirectToUrlAfterLogin || !this.redirectToUrlAfterLogin.length
              || !this.redirectToUrlAfterLogin[0]) {
              funcRedirectToFirstPage();
            } else {
              const prePageConfig = this._pageConfig.find((i) => {
                return this.redirectToUrlAfterLogin.some((o) => i.routerLink.includes(o));
              });
              if (prePageConfig) {
                const prePage = this._userContext.currentUser.permissions
                  .filter((i) => i.type === 1)
                  .find((i) => i.name === prePageConfig.title);
                if (prePage && prePage.isView) {
                  this._router.navigate(this.redirectToUrlAfterLogin);
                } else {
                  funcRedirectToFirstPage();
                }
              } else {
                funcRedirectToFirstPage();
              }
            }
          }
        }
      }, (err) => {
        this._progressService.done();
        this._toastrService.error(err.error_description, 'Error');

      }
    );
  }

  /**
   * checkLogged
   * @returns {boolean}
   */
  public checkLogged(): boolean {
    const funcCheckObject = (obj): boolean => {
      let status = true;
      for (let p in obj) {
        if (obj.hasOwnProperty(p)) {
          status = status && !!obj[p];
        }
      }
      return status;
    };
    if (funcCheckObject(this._userContext.userToken)
      && funcCheckObject(this._userContext.currentUser)) {
      return true;
    }
    return false;
  }

  /**
   * updateUserInfo
   * @param {number} userId
   */
  public updateUserInfo(userId: number) {
    this.getUserInfo(userId).subscribe((respInfo: ResponseMessage<UserInfo>) => {
        this._progressService.done();
        if (respInfo.status) {
          let res: UserInfo = respInfo.data;
          this.automaticallyLogOff(res.automaticallyLogOff);
          this._userContext.update(res);
        }
      }, (err) => {
        this._progressService.done();
        this._toastrService.error(err.error_description, 'Error');

      }
    );
  }

  public automaticallyLogOff(automaticallyLogOff: number) {
    if (automaticallyLogOff !== 0) {
      this._idle.setIdle(automaticallyLogOff * 60);
      this._idle.setTimeout(1);
      this._idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
      this._idle.onTimeout.subscribe(() => {
        this.logout().subscribe(() => {
          this._userContext.clear();
          this._localStorageService.add('preUserId', this._userContext.currentUser.id);
          this._router.navigate(['auth', 'sign-in']);
        });
        this._idle.ngOnDestroy();
        this._idle.onTimeout.observers.length = 0;
        this._idle.onIdleStart.observers.length = 0;
        this._idle.onIdleEnd.observers.length = 0;
      });
      this._idle.watch();
    }
  }

  /**
   * Check is admin or not
   * @returns {boolean}
   */
  public isAdmin(): boolean {
    if (this._userContext.currentUser.listRole) {
      return this._userContext.currentUser.listRole
        .findIndex((i) => i.roleName === 'Administrator') > -1;
    } else {
      return false;
    }
  }

  /**
   * checkAssignedRolesAnd
   * @param {string[]} roleList
   * @returns {boolean}
   */
  public checkAssignedRolesAnd(roleList: string[]): boolean {
    let isAssigned = true;
    const listRole = this._userContext.currentUser.listRole;
    if (!listRole || !listRole.length) {
      return false;
    } else {
      roleList.forEach((roleName) => {
        isAssigned = isAssigned && listRole
          .findIndex((i) => i.roleName === roleName) > -1;
      });
    }
    return isAssigned;
  }

  /**
   * checkAssignedRolesOr
   * @param {string[]} roleList
   * @returns {boolean}
   */
  public checkAssignedRolesOr(roleList: string[]): boolean {
    let isAssigned = false;
    const listRole = this._userContext.currentUser.listRole;
    if (!listRole || !listRole.length) {
      return false;
    } else {
      let i = 0;
      do {
        isAssigned = isAssigned
          || listRole.findIndex((role) => role.roleName === roleList[i]) > -1;
        i++;
      } while (!isAssigned && i < roleList.length);
    }
    return isAssigned;
  }

  /**
   * saveAttemptUrl
   */
  public saveAttemptUrl() {
    if (window.location.pathname.indexOf('/auth/sign-in') === -1) {
      this.redirectToUrlAfterLogin = window.location.pathname.substr(1).split('/');
    } else {
      this.redirectToUrlAfterLogin = [];
    }
  }

  /**
   * Check current page have access or not? If not the browser will redirect to 'Not Found' page
   * @param {string} pageName
   */
  public checkPermission(pageName: string): void {
    const currentUser = this._userContext.currentUser;
    if (currentUser) {
      const pagePermission = currentUser.permissions.filter((i) => i.type === 1)
        .find((i) => i.name === pageName);
      if (pagePermission && pagePermission.isView) {
        return;
      } else {
        this._router.navigate(['not-found']);
      }
    } else {
      this._localStorageService.remove('urlResolveGuard');
      this._localStorageService.add('urlResolveGuard', this._utilService.currentRouteUrl);
      this._router.navigateByUrl('/auth/sign-in');
    }
  }

  /**
   * Check current page have modify info or not?
   * @param {string} pageName
   * @returns {boolean}
   */
  public checkCanModify(pageName: string): boolean {
    const currentUser = this._userContext.currentUser;
    if (currentUser) {
      const pagePermission = currentUser.permissions.filter((i) => i.type === 1)
        .find((i) => i.name === pageName);
      if (pagePermission) {
        return pagePermission.isModify;
      }
    }
    return false;
  }

  /**
   * Check current page have view info or not?
   * @param {string} pageName
   * @returns {boolean}
   */
  public checkCanView(pageName: string): boolean {
    const currentUser = this._userContext.currentUser;
    if (currentUser) {
      const pagePermission = currentUser.permissions.filter((i) => i.type === 1)
        .find((i) => i.name === pageName);
      if (pagePermission) {
        return pagePermission.isView;
      }
    }
    return false;
  }

  /**
   * Check current function have modify info or not?
   * @param {string} funcName
   * @returns {boolean}
   */
  public checkPermissionFunc(funcName: string): boolean {
    const currentUser = this._userContext.currentUser;
    if (currentUser) {
      const pagePermission = currentUser.permissions.filter((i) => i.type === 3)
        .find((i) => i.name === funcName);
      if (pagePermission) {
        return pagePermission.isModify;
      }
    }
    return false;
  }
}
