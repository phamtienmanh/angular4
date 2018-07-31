import {
  Injectable
} from '@angular/core';
import { UserContext } from '../../shared/services/user-context/user-context';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

@Injectable()
export class OutsourceMainAuth implements CanActivate {
  constructor(private _router: Router,
              private _userContext: UserContext) {
  }

  // Check current page have access or not? If not the browser will redirect to 'Not Found' page
  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const orderLogTabs = this._userContext.currentUser.permissions
      .filter((i) => i.type === 1 && i.name.includes('OrderLog.Outsource.'));
    if (this._userContext.currentUser && this._userContext.currentUser.id) {
      if (!orderLogTabs || !orderLogTabs.some((i) => i.isView)) {
        this._router.navigate(['not-found']);
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
}
