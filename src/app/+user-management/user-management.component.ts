import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy
} from '@angular/core';

import { BreadcrumbService } from 'ng2-breadcrumb/ng2-breadcrumb';
import { AuthService } from '../shared/services/auth/auth.service';
import { UserContext } from '../shared/services/user-context/user-context';
import { Subscription } from 'rxjs/Subscription';
import {
  NavigationEnd,
  Router
} from '@angular/router';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'user-management',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's   compiler
  template: `
    <div [ngClass]="{'disappear': isCurrentUser}">
      <breadcrumb></breadcrumb>
    </div>
    <div class="py-2">
      <router-outlet></router-outlet>
    </div>
  `
})
export class UserManagementComponent implements OnInit, OnDestroy {
  public isCurrentUser = false;
  public activatedSub: Subscription;

  constructor(private _authService: AuthService,
              private _userContext: UserContext,
              private _router: Router,
              private _breadcrumbService: BreadcrumbService) {
    this.activatedSub = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (!val.urlAfterRedirects || !val.urlAfterRedirects.includes('user-management/')) {
          return;
        }
        const pathArr = val.urlAfterRedirects.split('/');
        this.isCurrentUser = this._userContext.currentUser.id === +pathArr[pathArr.length - 1];
      }
    });
  }

  /**
   * Config text on breadcrumb
   */
  public ngOnInit(): void {
    this._breadcrumbService
      .addFriendlyNameForRoute('/user-management', 'User Management');
    this._breadcrumbService
      .addFriendlyNameForRoute('/user-management/new-user', 'New User');
    this._breadcrumbService
      .hideRouteRegex('^/user-management/main$');
  }

  public ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
