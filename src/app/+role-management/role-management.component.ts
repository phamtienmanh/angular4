import {
  Component,
  ViewEncapsulation,
  OnInit
} from '@angular/core';

import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'role-management',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's   compiler
  template: `
    <breadcrumb></breadcrumb>
    <div class="py-2">
      <router-outlet></router-outlet>
    </div>
  `
})
export class RoleManagementComponent implements OnInit {
  constructor(private _breadcrumbService: BreadcrumbService) {
    // empty
  }

  /**
   * Config text on breadcrumb
   */
  public ngOnInit(): void {
    this._breadcrumbService
      .addFriendlyNameForRoute('/role-management', 'Role Management');
    this._breadcrumbService
      .addFriendlyNameForRoute('/role-management/new-user', 'New Role');
    this._breadcrumbService
      .hideRouteRegex('^/role-management/main$');
  }
}
