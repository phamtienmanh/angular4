import {
  Injectable
} from '@angular/core';
import { UserContext } from '../shared/services/user-context';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

@Injectable()
export class SettingsAuth implements CanActivate {
  constructor(private _router: Router,
              private _userContext: UserContext) {
  }

  // Check current page have access or not? If not the browser will redirect to 'Not Found' page
  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this._userContext.currentUser;
    if (currentUser && currentUser.id) {
      const settingsPage = currentUser.permissions.filter((i) => i.name.includes('Settings.')
        && i.name.lastIndexOf('.') === i.name.indexOf('.'));
      if (settingsPage && settingsPage.some((i) => i.isView)) {
        return true;
      } else {
        this._router.navigate(['not-found']);
        return false;
      }
    }
  }
}
