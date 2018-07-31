import {
  Injectable,
} from '@angular/core';

import {
  CanActivateChild,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  ActivatedRoute
} from '@angular/router';

import {
  Http,
} from '@angular/http';

// 3rd modules
import {
  LocalStorageService
} from 'angular-2-local-storage';

// Services
import {
  UserContext
} from '../user-context';

// Interface
import {
  UserInfo
} from '../../models/user.model';

@Injectable()
export class RoleAuthGuard implements CanActivateChild {
  public authQueue: boolean[] = [];
  public currentUser: UserInfo;

  constructor(private _http: Http,
              private _router: Router,
              private _localStorageService: LocalStorageService,
              private _routeParams: ActivatedRoute,
              private _userContext: UserContext) {
    // empty
  }

  public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.currentUser = this._userContext.currentUser;
    if (this.currentUser && this.currentUser.id) {
      // Allow now if have role Admin
      if (this.currentUser.listRole.findIndex((role) => role.roleName === 'Administrator') > -1) {
        return true;
      }
      if (state.url.includes('user-management/' + this.currentUser.id)) {
        return true;
      }
      this._router.navigate(['not-found']);
    } else {
      this._localStorageService.remove('urlResolveGuard');
      this._localStorageService.add('urlResolveGuard', state.url);
      this._router.navigateByUrl('/auth/sign-in');
      return false;
    }
  }

  public handleAuth(): boolean {
    let isAuth = this.authQueue[0];
    this.authQueue.forEach((auth) => {
      isAuth = isAuth || auth;
    });
    if (!isAuth) {
      this._router.navigate(['not-found']);
    }
    return isAuth;
  }

  public roleArtist(state: RouterStateSnapshot): boolean {
    // List pages artist role allow access
    let listPages = [
      'user-management/' + this.currentUser.id,
      'image-search',
      'image-management',
      'image-collections',
    ];
    let isReturn = false;
    listPages.forEach((page) => {
      if (!isReturn && state.url.includes(page)) {
        isReturn = true;
      }
    });
    return isReturn;
  }

  public roleUser(state: RouterStateSnapshot): boolean {
    // List pages user role allow access
    let listPages = [
      'user-management/' + this.currentUser.id,
      'image-search',
      'image-collections',
    ];
    let isReturn = false;
    listPages.forEach((page) => {
      if (!isReturn && state.url.includes(page)) {
        isReturn = true;
      }
    });
    return isReturn;
  }
}
