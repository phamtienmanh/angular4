import {
  Injectable
} from '@angular/core';
import { UserContext } from '../../shared/services/user-context';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate
} from '@angular/router';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

@Injectable()
export class ProjectMainAuth implements CanActivate {
  constructor(private _router: Router,
              private _userContext: UserContext) {
  }

  // Check current page have access or not? If not the browser will redirect to 'Not Found' page
  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this._userContext.currentUser;
    if (currentUser && currentUser.id) {
      const pagePermission = currentUser.permissions.filter((i) => i.type === 1)
        .find((i) => i.name === 'Projects.Projects');
      if (pagePermission && pagePermission.isView) {
        return true;
      } else {
        this._router.navigate(['not-found']);
        return false;
      }
    }
  }
}
