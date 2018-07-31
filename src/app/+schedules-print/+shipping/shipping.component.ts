import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  ActivatedRoute,
  NavigationEnd,
  Router
} from '@angular/router';

// Services
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  CommonService
} from '../../shared/services/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../shared/services/auth';
import {
  SchedulesPrintService
} from '../schedules-print.service';
import {
  ShippingService
} from './shipping.service';

// Interfaces
import { Subscription } from 'rxjs/Subscription';
import { ShippingTab } from './shipping.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'shipping',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's   compiler
  templateUrl: 'shipping.template.html',
  styleUrls: [
    'shipping.style.scss'
  ]
})
export class ShippingComponent implements OnInit, OnDestroy {
  public tabs = [
    {
      id: ShippingTab.Scheduled,
      name: 'Scheduled',
      isActive: false
    },
    {
      id: ShippingTab.Complete,
      name: 'Complete',
      isActive: false
    },
    {
      id: ShippingTab.Confirmed,
      name: 'Confirmed',
      isActive: false
    }
  ];
  public routerSub: Subscription;
  public currentPageUrl = '';

  constructor(private _breadcrumbService: BreadcrumbService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _activatedRoute: ActivatedRoute,
              private _authService: AuthService,
              private _schedulesPrintService: SchedulesPrintService,
              private _shippingSv: ShippingService,
              private _router: Router) {
    // this._authService.checkPermission('Schedules.Shipping');
    this.routerSub = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.currentPageUrl = val.urlAfterRedirects;
        this.configNavTabs(val.urlAfterRedirects);
        if (/^\/schedules-print\/shipping$/.test(this._router.url)) {
          this._router.navigate([this.tabs[0].id], {relativeTo: this._activatedRoute});
        }
      }
    });
  }

  public ngOnInit(): void {
    this.configFriendlyRoutes();
  }

  /**
   * Config text on breadcrumb
   */
  public configFriendlyRoutes(): void {
    this.tabs.forEach((item) => {
      this._breadcrumbService.addFriendlyNameForRouteRegex(
        '^/schedules-print/shipping/' + item.id + '$', item.name);
    });
  }

  public configNavTabs(url: string): void {
    if (url) {
      this.tabs.forEach((tab) => {
        tab.isActive = url.endsWith('/' + tab.id);
      });
    }
  }

  /**
   * Event switch tab
   * @param index
   */
  public switchTab(index: number): void {
    let prevTabIndex = this.tabs.findIndex((t) => t.isActive);
    this.tabs[prevTabIndex].isActive = false;
    this.tabs[index].isActive = true;
    this._router.navigate([this.tabs[index].id],
      {relativeTo: this._activatedRoute, replaceUrl: true});
  }

  public ngOnDestroy(): void {
    this.routerSub.unsubscribe();
  }
}
