import {
  Injectable
} from '@angular/core';

import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

import {
  CommonService
} from '../common';

import {
  LocalStorageService
} from 'angular-2-local-storage';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class BrowserGuard implements CanActivate {
  constructor(private router: Router,
              private _commonService: CommonService,
              private _localStorageService: LocalStorageService) {
  }

  public canActivate(route: ActivatedRouteSnapshot,
                     state: RouterStateSnapshot): Observable<boolean> | boolean {
    // Chrome 1+
    let isChrome = (!!window['chrome'] && !!window['chrome']['webstore'])
      || (!!navigator.userAgent.match('(Chrome\/[.0-9]*|CriOS\/[.0-9]*)')
        && !navigator.userAgent.includes('Edge'));
    if (!isChrome) {
      this.router.navigate(['not-support']);
      return false;
    }

    return true;
    // return this._commonService.getVersionApp().map((resp: any) => {
    //   if (resp.status) {
    //     if (this._localStorageService.get('VersionApp') !== resp.data.name) {
    //       this._localStorageService.clearAll();
    //       this._localStorageService.add('VersionApp', resp.data.name);
    //       this.router.navigateByUrl('/auth/sign-in');
    //       return false;
    //     }
    //     return true;
    //   } else {
    //     this.router.navigate(['not-found']);
    //     return false;
    //   }
    // }).first();
  }
}
