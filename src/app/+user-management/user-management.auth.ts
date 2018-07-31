import {
  Injectable
} from '@angular/core';
import { UserContext } from '../shared/services/user-context/user-context';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

@Injectable()
export class UserManagementAuth implements CanActivate {
  constructor(private _router: Router,
              private _userContext: UserContext) {
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const pathArr = state.url.split('/');
    const isId = Number.isInteger(+pathArr[pathArr.length - 1]);
    const isCurrentUser = this._userContext.currentUser.id === +pathArr[pathArr.length - 1];
    if (!isId || !isCurrentUser) {
      const currentUser = this._userContext.currentUser;
      if (currentUser && currentUser.id) {
        const pagePermission = currentUser.permissions.filter((i) => i.type === 1)
          .find((i) => i.name === 'Users');
        if (pagePermission && pagePermission.isView) {
          return true;
        } else {
          this._router.navigate(['not-found']);
          return false;
        }
      }
    } else {
      return true;
    }
  }
}
