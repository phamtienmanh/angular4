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
import {
  AuthService
} from '../shared/services/auth/auth.service';

@Injectable()
export class SchedulesPrintAuth implements CanActivate {
  public tabs = [];

  constructor(private _router: Router,
              private _authService: AuthService,
              private _userContext: UserContext) {
  }

  // Check current page have access or not? If not the browser will redirect to 'Not Found' page
  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.tabs = [
      {
        name: 'Scheduler',
        isView: this._authService.checkCanView('Schedules.Scheduler'),
      },
      {
        name: 'Print',
        isView: this._authService.checkCanView('Schedules.Print'),
      },
      {
        name: 'Neck Label',
        isView: this._authService.checkCanView('Schedules.NeckLabel'),
      },
      {
        name: 'Finishing',
        isView: this._authService.checkCanView('Schedules.Finishing'),
      },
      {
        name: 'Pending Samples',
        isView: this._authService.checkCanView('Schedules.PendingSamples'),
      },
      {
        name: 'Samples',
        isView: this._authService.checkCanView('Schedules.Samples'),
      },
      {
        name: 'Shipping',
        isView: this._authService.checkCanView('Schedules.Shipping'),
      }
    ];
    const firstTab = this.tabs.find((i) => !!i.isView);
    if (firstTab) {
      return true;
    } else {
      this._router.navigate(['not-found']);
      return false;
    }
  }
}
