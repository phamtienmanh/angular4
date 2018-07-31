import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy
} from '@angular/core';

import { BreadcrumbService } from 'ng2-breadcrumb/ng2-breadcrumb';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'factory-management',
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
export class FactoryManagementComponent implements OnInit, OnDestroy {

  constructor(private _breadcrumbService: BreadcrumbService) {
    // e
  }

  /**
   * Config text on breadcrumb
   */
  public ngOnInit(): void {
    this._breadcrumbService
      .addFriendlyNameForRoute('/factory-management', 'Factory Management');
    this._breadcrumbService
      .addFriendlyNameForRoute('/factory-management/new-factory', 'New Factory');
    this._breadcrumbService
      .hideRouteRegex('^/factory-management/main$');
  }

  public ngOnDestroy(): void {
    // e
  }
}
