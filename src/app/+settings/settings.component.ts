import {
  Component,
  ViewEncapsulation,
  OnInit
} from '@angular/core';

// Services
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import { Router } from '@angular/router';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'settings',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  template: `
    <breadcrumb></breadcrumb>
    <div class="py-2">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: [
    'settings.style.scss'
  ]
})
export class SettingsComponent implements OnInit {
  constructor(private _breadcrumbService: BreadcrumbService) {
    // empty 123
  }

  /**
   * Config text on breadcrumb
   */
  public ngOnInit(): void {
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings', 'Settings');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/approval-type', 'Approval Type');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/color', 'Color');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/content', 'Content');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/country-of-origin', 'Country of Origin');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/cut', 'Cut');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/design', 'Design');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/print-location', 'Print Location');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/order-type', 'Order Type');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/print-machine', 'Print Machine');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/separation-type', 'Separation Type');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/embellishment-type', 'Embellishment Type');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/ship-from', 'Ship From');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/ship-via', 'Ship Via');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/customer-service', 'Customer Service Team');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/scheduled-tasks', 'Scheduled Tasks');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/finishing-process', 'Finishing Process');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/product-categories', 'Product Categories');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/product-regions', 'Product Regions');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/licensors', 'Licensors');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/licensees', 'Licensees');
    this._breadcrumbService
      .addFriendlyNameForRoute('/settings/retailer', 'Retailer');
    this._breadcrumbService
      .hideRouteRegex('^/settings/product-categories/category-main$');
    this._breadcrumbService
      .hideRouteRegex('^/settings/product-regions/region-main$');
    this._breadcrumbService
      .hideRouteRegex('^/settings/main$');
  }
}
