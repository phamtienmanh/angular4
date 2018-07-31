import {
  Injectable
} from '@angular/core';
import { SignalRService } from '../signalr';
import { AuthService } from '../auth';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

import { UserContext } from '../user-context';
import {
  PushNotificationsService
} from 'angular2-notifications';

// Services
import {
  CommonService
} from '../common';

import {
  LocalStorageService
} from 'angular-2-local-storage';
import { Observable } from 'rxjs/Observable';
import { Util } from '../util';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router,
              private userContext: UserContext,
              private _signalRService: SignalRService,
              private _authService: AuthService,
              private _utilService: Util,
              private _localStorageService: LocalStorageService,
              private _commonService: CommonService,
              private _pushNotificationsService: PushNotificationsService) {
  }

  public canActivate(route: ActivatedRouteSnapshot,
                     state: RouterStateSnapshot): Promise<boolean> | boolean {
    // Chrome 1+
    let isChrome = (!!window['chrome'] && !!window['chrome']['webstore'])
      || (!!navigator.userAgent.match('(Chrome\/[.0-9]*|CriOS\/[.0-9]*)')
        && !navigator.userAgent.includes('Edge'));
    if (!isChrome) {
      this.router.navigate(['not-support']);
      return false;
    }

    return new Promise((resolve) => {
      this._commonService.getVersionApp().subscribe((resp: any) => {
        if (resp.status) {
          if (this._localStorageService.get('VersionApp') !== resp.data.name) {
            this._localStorageService.clearAll();
            this._localStorageService.add('VersionApp', resp.data.name);
            this._localStorageService.add('urlResolveGuard', state.url);
            this.router.navigateByUrl('/auth/sign-in');
            resolve(false);
            return;
          }

          this._localStorageService.remove('urlResolveGuard');
          // Get current user was login
          let user = this.userContext.currentUser;
          if (!user || !user.id) {
            this._localStorageService.add('urlResolveGuard', state.url);
            this.router.navigate(['auth', 'sign-in']);
            resolve(false);
            return;
          }
          if (user && !user.isChangedDefaultPassword) {
            this.router.navigateByUrl('/auth/change-password');
            resolve(false);
            return;
          }
          // update user info
          this._authService.updateUserInfo(user.id);
          // init signalR connect
          this._signalRService.connect();
          this._pushNotificationsService.requestPermission();
          resolve(true);
        } else if (this.userContext.currentUser) {
          this.router.navigate(['not-found']);
          resolve(false);
        } else {
          this._localStorageService.remove('urlResolveGuard');
          this._localStorageService.add('urlResolveGuard', this._utilService.currentRouteUrl);
          this.router.navigateByUrl('/auth/sign-in');
          resolve(false);
        }
      });
    });
  }
}
