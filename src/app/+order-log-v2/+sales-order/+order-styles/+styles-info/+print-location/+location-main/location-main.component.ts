import {
  Component,
  ViewEncapsulation,
  OnInit
} from '@angular/core';

import {
  Router
} from '@angular/router';

// Services
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  PrintLocationService
} from '../print-location.service';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'order-log-v2',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  template: `
    <!--<div class="py-2">-->
    <router-outlet></router-outlet>
    <!--</div>-->
  `,
  styleUrls: []
})
export class LocationMainComponent implements OnInit {
  constructor(private _breadcrumbService: BreadcrumbService,
              private _router: Router,
              private _printLocationSv: PrintLocationService) {}

  /**
   * Config text on breadcrumb
   */
  public ngOnInit(): void {
    // empty
  }
}
