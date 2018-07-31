import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import { BreadcrumbService } from 'ng2-breadcrumb/ng2-breadcrumb';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'customers-management',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  template: `
    <breadcrumb></breadcrumb>
    <div class="py-2">
      <router-outlet></router-outlet>
    </div>
  `
})
export class CustomersManagementComponent implements OnInit {
  constructor(private _breadcrumbService: BreadcrumbService) {
  }

  /**
   * Config text on breadcrumb
   */
  public ngOnInit(): void {
    this._breadcrumbService
      .addFriendlyNameForRoute('/customers-management', 'Customer Management');
    this._breadcrumbService
      .addFriendlyNameForRoute('/customers-management/new', 'New Customer');
    this._breadcrumbService
      .addFriendlyNameForRouteRegex('^/customers-management/[0-9A-Za-z]*/edit$', 'Edit Customer');
    this._breadcrumbService
      .hideRouteRegex('^/customers-management/[0-9A-Za-z]*/detail$');
    this._breadcrumbService
      .hideRouteRegex('^/customers-management/main$');
  }
}
