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
export class OrderMainAuth implements CanActivate {
  constructor(private _router: Router,
              private _userContext: UserContext) {
  }

  // Check current page have access or not? If not the browser will redirect to 'Not Found' page
  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this._userContext.currentUser;
    if (currentUser && currentUser.id) {
      const orderLogTabs = currentUser.permissions
        .filter((i) => i.type === 1 && i.name.includes('OrderLog.All.'));
      if (!orderLogTabs || !orderLogTabs.some((i) => i.isView)) {
        this._router.navigate(['not-found']);
        return false;
      } else {
        return true;
      }
    }
  }
}
