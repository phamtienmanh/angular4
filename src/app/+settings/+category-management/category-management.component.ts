import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy
} from '@angular/core';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'category-management',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's   compiler
  template: `<router-outlet></router-outlet>`
})
export class CategoryManagementComponent implements OnInit, OnDestroy {

  constructor() {
    // e
  }

  /**
   * Config text on breadcrumb
   */
  public ngOnInit(): void {
    // e
  }

  public ngOnDestroy(): void {
    // e
  }
}
