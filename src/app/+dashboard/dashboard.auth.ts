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
export class DashboardAuth implements CanActivate {
  constructor(private _router: Router,
              private _userContext: UserContext) {
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this._userContext.currentUser;
    if (currentUser && currentUser.id) {
      const pagePermission = currentUser.permissions.filter((i) => i.type === 1)
        .find((i) => i.name === 'Dashboard');
      if (pagePermission && pagePermission.isView) {
        return true;
      } else {
        this._router.navigate(['not-found']);
        return false;
      }
    }
  }
}
