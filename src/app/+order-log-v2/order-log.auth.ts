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
export class OrderLogAuth implements CanActivate {
  constructor(private _router: Router,
              private _userContext: UserContext) {
  }

  // Check current page have access or not? If not the browser will redirect to 'Not Found' page
  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // const currentUser = this._userContext.currentUser;
    // if (currentUser) {
    //   const orderLogTabs = currentUser.permissions
    //     .filter((i) => i.type === 1 && i.name.includes('OrderLog.All.'));
    //   if (!orderLogTabs || !orderLogTabs.some((i) => i.isView)) {
    //     const pagePermission = currentUser.permissions.filter((i) => i.type === 1)
    //       .find((i) => i.name === 'Orders');
    //     if (pagePermission && pagePermission.isView) {
    //       return true;
    //     } else {
    //       this._router.navigate(['not-found']);
    //       return false;
    //     }
    //   } else {
    return true;
    // }
    // }
  }
}
