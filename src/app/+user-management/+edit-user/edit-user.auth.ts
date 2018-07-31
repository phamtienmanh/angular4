import {
  Injectable
} from '@angular/core';

import {
  UserContext
} from '../../shared/services/user-context/user-context';
import {
  AuthService
} from '../../shared/services/auth/auth.service';

import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import {
  UserInfo,
  ResponseMessage
} from '../../shared/models';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class EditUserAuth implements CanActivate {
  constructor(private _router: Router,
              private _authService: AuthService) {
  }

  public canActivate(route: ActivatedRouteSnapshot,
                     state: RouterStateSnapshot): Observable<boolean> | boolean {
    if (Number.parseInt(route.params.id)) {
      if (!this._authService.isAdmin()) {
        return this._authService.getUserInfo(Number.parseInt(route.params.id))
          .map((userInfoResp: ResponseMessage<UserInfo>) => {
            if (userInfoResp.status) {
              if (userInfoResp.data.listRole
                  .findIndex((i) => i.roleName === 'Administrator') === -1) {
                return true;
              }
            }
            this._router.navigate(['not-found']);
            return false;
          }).first();
      } else {
        return true;
      }
    } else {
      this._router.navigate(['not-found']);
      return false;
    }
  }
}
