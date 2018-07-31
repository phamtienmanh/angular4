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

import {
  Subscription
} from 'rxjs';

import { BreadcrumbService } from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  ProjectsService
} from './projects.service';
import { AuthService } from '../shared/services/auth';
import { UserContext } from '../shared/services/user-context';
import { AccessControlType } from '../+role-management/role-management.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'projects',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's   compiler
  templateUrl: 'projects.template.html',
  styleUrls: [
    'projects.style.scss'
  ]
})
export class ProjectsComponent implements OnInit, OnDestroy {

  public tabs = [
    {
      name: 'Projects',
      isActive: false,
      isView: this._authService.checkCanView('Projects.Projects'),
      redirectUrl: 'project-main'
    },
    {
      name: 'Products',
      isActive: false,
      isView: this._authService.checkCanView('Projects.Products'),
      redirectUrl: 'products'
    }
    // {
    //   name: 'Categories',
    //   isActive: false,
    //   isView: this._authService.checkCanView('Projects.Categories'),
    //   redirectUrl: 'categories'
    // },
    // {
    //   name: 'Regions',
    //   isActive: false,
    //   isView: this._authService.checkCanView('Projects.Regions'),
    //   redirectUrl: 'regions'
    // }
  ];

  public subscription: Subscription;
  public preTab: string;
  public isShowNav = true;
  public accessControlType = AccessControlType;

  constructor(private _breadcrumbService: BreadcrumbService,
              private _authService: AuthService,
              private _userContext: UserContext,
              private _projectsService: ProjectsService,
              private _activatedRoute: ActivatedRoute,
              private _router: Router) {
    this.subscription = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (this.preTab && this.preTab === val.urlAfterRedirects) {
          return;
        }
        this.preTab = val.urlAfterRedirects;
        this.configNavTabs(val.urlAfterRedirects);
        if (/^\/projects$/.test(val.urlAfterRedirects)) {
          const firstActivatedPage = this.tabs.find((i) => i.isActive);
          if (firstActivatedPage) {
            this._router.navigate([firstActivatedPage.redirectUrl],
              {relativeTo: this._activatedRoute});
          } else {
            this._router.navigate(['not-found']);
          }
        }
      }
    });
  }

  /**
   * Config text on breadcrumb
   */
  public ngOnInit(): void {
    this._breadcrumbService
      .hideRouteRegex('^/projects/project-main$');
    this._breadcrumbService
      .hideRouteRegex('^/projects/new-project/project-info$');
    this._breadcrumbService
      .addFriendlyNameForRoute('/projects/new-project', 'New Project');
    this._breadcrumbService
      .addFriendlyNameForRoute('/projects/product', 'Products');
    this._breadcrumbService
      .addFriendlyNameForRoute('/projects/categories', 'Categories');
    this._breadcrumbService
      .hideRouteRegex('^/projects/categories/category-main$');
    this._breadcrumbService
      .addFriendlyNameForRoute('/projects/regions', 'Regions');
    this._breadcrumbService
      .hideRouteRegex('^/projects/regions/region-main$');
  }

  public configNavTabs(url: string): void {
    if (url) {
      let newUrl = url + '/';
      // Reset status nav tab
      this.tabs.forEach((tab) => tab.isActive = false);
      // Active current nav tab is selected
      this.tabs.forEach((tab) => {
        tab.isActive = newUrl.indexOf('/' + tab.redirectUrl + '/') !== -1;
      });
    }
    let haveTabActive = this.tabs.some((tab) => {
      return tab.isActive;
    });
    if (!haveTabActive) {
      this.tabs[0].isActive = true;
    }
  }

  /**
   * Event switch tab
   * @param index
   */
  public switchTab(index: number): void {
    this._router.navigate([
      'projects',
      this.tabs[index].redirectUrl
    ]);
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
