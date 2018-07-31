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
  ProjectManageService
} from './project-manage.service';
import {
  ToastrService
} from 'ngx-toastr';
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../shared/services/auth';
import { UserContext } from '../../shared/services/user-context';

// Components

// Interfaces
import {
  BasicResponse,
  ResponseMessage
} from '../../shared/models';
import {
  Subscription
} from 'rxjs/Subscription';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'project-manage',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'project-manage.template.html',
  styleUrls: [
    'project-manage.style.scss'
  ]
})
export class ProjectManageComponent implements OnInit, OnDestroy {
  public tabs = [
    {
      id: 0,
      name: 'Project Info',
      redirectUrl: 'project-info',
      isActive: false,
      isDisabled: false
    },
    {
      id: 1,
      name: 'Priority T&A',
      redirectUrl: 'project-priority',
      isActive: false,
      isDisabled: true
    },
    {
      id: 2,
      name: 'Secondary T&A',
      redirectUrl: 'project-secondary',
      isActive: false,
      isDisabled: true
    },
    {
      id: 4,
      name: 'History',
      redirectUrl: 'project-history',
      isActive: false,
      isDisabled: true
    },
    {
      id: 5,
      name: 'Users',
      redirectUrl: 'project-users',
      isActive: false,
      isDisabled: true
    }
  ];
  public projectId: number;
  public routerSub: Subscription;
  public activatedRouterSub: Subscription;
  public updatedSub: Subscription;

  public isPageReadOnly = false;

  constructor(private _projectManageService: ProjectManageService,
              private _activatedRoute: ActivatedRoute,
              private _router: Router,
              private _breadcrumbService: BreadcrumbService,
              private _authService: AuthService,
              private _userContext: UserContext,
              private _toastrService: ToastrService,
              private _modalService: NgbModal) {
    // this.isPageReadOnly = !this._authService.checkCanModify('Orders');
    // Config active nav tab when router changes
    this.routerSub = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.configNavTabs(val.urlAfterRedirects);
      }
    });
    // Get Order Id and Init data
    this.activatedRouterSub = this._activatedRoute.params.subscribe((params: { id: number }) => {
      let id = Number(params.id);
      if (!isNaN(id)) {
        this.projectId = params.id;
        this._projectManageService.updateProjectIndex({projectId: this.projectId});
        this.getProjectInfo();
      }
    });
    this.updatedSub = this._projectManageService.getBreadcrumb().subscribe((data) => {
      this._breadcrumbService
        .addFriendlyNameForRouteRegex('^/projects/[0-9]+$',
          `${this._projectManageService.projectIndex.projectName}`);
    });
  }

  public ngOnInit(): void {
    this.configFriendlyRoutes();
  }

  public get currentActivatedTab(): any {
    return this.tabs.find((i) => i.isActive);
  }

  /**
   * Config text on breadcrumb
   */
  public configFriendlyRoutes(): void {
    this._breadcrumbService
      .addCallbackForRouteRegex('^/projects/[0-9A-Za-z]*/project-info$',
        () => 'Project Info');
    this._breadcrumbService
      .addCallbackForRouteRegex('^/projects/[0-9A-Za-z]*/project-priority',
        () => 'Priority T&A');
    this._breadcrumbService
      .addCallbackForRouteRegex('^/projects/[0-9A-Za-z]*/project-secondary$',
        () => 'Secondary T&A');
    this._breadcrumbService
      .addCallbackForRouteRegex('^/projects/[0-9A-Za-z]*/project-history$',
        () => 'History');
    this._breadcrumbService
      .addCallbackForRouteRegex('^/projects/[0-9A-Za-z]*/project-users$',
        () => 'Users');
  }

  /**
   * Active nav tab is selected
   * @param url
   */
  public configNavTabs(url: string): void {
    if (url) {
      this.tabs.forEach((tab) => {
        tab.isActive = url.indexOf('/' + tab.redirectUrl) !== -1;
      });
    }
  }

  /**
   * Get Order Info
   */
  public getProjectInfo(): void {
    if (this.projectId) {
      this._projectManageService.getProjectById(this.projectId)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            const curUserId = this._userContext.currentUser.id;
            const checkExistFunc = (arr: number[]): boolean => {
              return arr ? arr.some((i) => i === curUserId) : false;
            };
            this._projectManageService.updateProjectIndex({
              projectName: resp.data.name,
              customerName: resp.data.customerName,
              inDcStoreDateOnUtc: resp.data.inDcStoreDateOnUtc,
              isProjectManager: checkExistFunc(resp.data.projectManagerUserIds),
              isProjectEditor: checkExistFunc(resp.data.projectEditorUserIds),
              isProjectViewer: checkExistFunc(resp.data.projectViewerUserIds)
            });
            this.configNavTabs(this._router.url);
            this._breadcrumbService
              .addFriendlyNameForRouteRegex('^/projects/[0-9]+$',
                `${this._projectManageService.projectIndex.projectName}`);
            this.tabs.forEach((tab) => {
              tab.isDisabled = false;
            });
          } else {
            if (resp.errorMessages[0].includes('not exist')) {
              this._router.navigate(['not-found']);
            }
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
  }

  /**
   * Event switch tab
   * @param index
   */
  public switchTab(event: Event, index: number): void {
    // Avoid click to tab when click delete on this tab
    if (!event.target['innerText'] || this.tabs[index].isDisabled) {
      return;
    }
    this._router.navigate([this.tabs[index].redirectUrl], {relativeTo: this._activatedRoute});
  }

  public ngOnDestroy(): void {
    this.routerSub.unsubscribe();
    this.updatedSub.unsubscribe();
    this.activatedRouterSub.unsubscribe();
  }
}
