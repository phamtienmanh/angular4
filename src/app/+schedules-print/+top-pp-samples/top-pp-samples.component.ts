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
  ToastrService
} from 'ngx-toastr';
import {
  UserContext,
  AuthService,
  CommonService
} from '../../shared/services';

// Interfaces
import {
  Subscription
} from 'rxjs/Subscription';
import {
  Tabs
} from './top-pp-samples.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'top-pp-samples',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's   compiler
  templateUrl: 'top-pp-samples.template.html',
  styleUrls: [
    'top-pp-samples.style.scss'
  ]
})
export class TopPpSamplesComponent implements OnInit, OnDestroy {
  public tabs = Tabs;
  public routerSub: Subscription;

  constructor(private _breadcrumbService: BreadcrumbService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _userContext: UserContext,
              private _authService: AuthService,
              private _activatedRoute: ActivatedRoute,
              private _router: Router) {
    this._authService.checkPermission('Schedules.TopPpSamples');
    this.routerSub = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (val.urlAfterRedirects === '/schedules-print/top-pp-samples') {
          this.switchTab(0);
        }
        this.configNavTabs(val.urlAfterRedirects + '/');
      }
    });
  }

  public ngOnInit(): void {
    this.configFriendlyRoutes();
  }

  public configFriendlyRoutes(): void {
    this.tabs.forEach((tab) => {
      this._breadcrumbService.addFriendlyNameForRouteRegex(
        '^/schedules-print/top-pp-samples/' + tab.redirectUrl + '$', tab.name);
    });
  }

  public configNavTabs(url: string): void {
    if (url) {
      this.tabs.forEach((tab) => {
        tab.isActive = url.endsWith('/' + tab.redirectUrl + '/');
      });
    }
  }

  public switchTab(index: number): void {
    let prevTabIndex = this.tabs.findIndex((t) => t.isActive);
    if (prevTabIndex !== -1) {
      this.tabs[prevTabIndex].isActive = false;
    }
    this.tabs[index].isActive = true;
    this._router.navigate([this.tabs[index].redirectUrl],
      {relativeTo: this._activatedRoute, replaceUrl: prevTabIndex === index});
  }

  public ngOnDestroy(): void {
    this.routerSub.unsubscribe();
  }
}
