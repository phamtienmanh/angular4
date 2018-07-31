﻿import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  NavigationEnd,
  Router
} from '@angular/router';

import {
  Subscription
} from 'rxjs';

import { BreadcrumbService } from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  SchedulesType
} from './schedules-print.model';

import {
  SchedulesPrintService
} from './schedules-print.service';
import { AuthService } from '../shared/services/auth/auth.service';
import { UserContext } from '../shared/services/user-context/user-context';
import { AccessControlType } from '../+role-management/role-management.model';
import {
  LocalStorageService
} from 'angular-2-local-storage';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'schedules-print',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's   compiler
  templateUrl: 'schedules-print.template.html',
  styleUrls: [
    'schedules-print.style.scss'
  ]
})
export class SchedulesPrintComponent implements OnInit, OnDestroy {

  public tabs = [
    {
      name: 'Scheduler',
      type: SchedulesType.Scheduler,
      isActive: false,
      isView: this._authService.checkCanView('Schedules.Scheduler'),
      redirectUrl: 'scheduler'
    },
    {
      name: 'Print',
      type: SchedulesType.Print,
      isActive: false,
      isView: this._authService.checkCanView('Schedules.Print'),
      redirectUrl: 'tsc-print'
    },
    {
      name: 'Neck Label',
      type: SchedulesType.NeckLabel,
      isActive: false,
      isView: this._authService.checkCanView('Schedules.NeckLabel'),
      redirectUrl: 'neck-label'
    },
    {
      name: 'Finishing',
      type: SchedulesType.Finishing,
      isActive: false,
      isView: this._authService.checkCanView('Schedules.Finishing'),
      redirectUrl: 'finishing'
    },
    {
      name: 'Pending Samples',
      type: SchedulesType.PendingSamples,
      isActive: false,
      isView: this._authService.checkCanView('Schedules.PendingSamples'),
      redirectUrl: 'pending-samples'
    },
    {
      name: 'Samples',
      type: SchedulesType.Samples,
      isActive: false,
      isView: this._authService.checkCanView('Schedules.Samples'),
      redirectUrl: 'samples'
    },
    {
      name: 'TOP/PP Samples',
      type: SchedulesType.TopPpSamples,
      isActive: false,
      isView: this._authService.checkCanView('Schedules.TopPpSamples'),
      redirectUrl: 'top-pp-samples'
    },
    {
      name: 'Shipping',
      type: SchedulesType.Shipping,
      isActive: false,
      isView: this._authService.checkCanView('Schedules.Shipping'),
      redirectUrl: 'shipping'
    }
  ];

  public subscription: Subscription;
  public preTab: string;

  constructor(private _breadcrumbService: BreadcrumbService,
              private _authService: AuthService,
              private _userContext: UserContext,
              private _schedulePrintSv: SchedulesPrintService,
              private _localStorageService: LocalStorageService,
              private _router: Router) {
    this.tabs.forEach((item, index) => {
      if (this._router.url.includes(item.redirectUrl)) {
        item.isActive = true;
        this._schedulePrintSv.curTab = index;
      }
    });
    this.subscription = this._router.events.subscribe((val: any) => {
      if (val instanceof NavigationEnd) {
        if (val.urlAfterRedirects && val.urlAfterRedirects.endsWith('schedules-print')) {
          const firstTab = this.tabs.find((i) => !!i.isView);
          if (firstTab) {
            this._router.navigate(['schedules-print', firstTab.redirectUrl], {replaceUrl: true});
          }
        }
        if (!val.urlAfterRedirects || !val.urlAfterRedirects.includes('schedules-print/')) {
          return;
        }
        if (this.preTab && this.preTab === val.urlAfterRedirects) {
          return;
        }
        this.preTab = val.urlAfterRedirects;
        this.configNavTabs(val.urlAfterRedirects);
      }
    });
    let lastSearch = this._localStorageService.get('Schedules_Filter');
    if (lastSearch) {
      this._schedulePrintSv.searchObj = lastSearch['searchObj'];
      this._schedulePrintSv.searchFrom = lastSearch['searchFrom'];
    }
  }

  /**
   * Config text on breadcrumb
   */
  public ngOnInit(): void {
    this._breadcrumbService
      .addFriendlyNameForRoute('/schedules-print', 'Schedules');
    this._breadcrumbService
      .addFriendlyNameForRoute('/schedules-print/tsc-print', 'Print');
    this._breadcrumbService
      .addFriendlyNameForRoute('/schedules-print/neck-label', 'Neck Label');
    this._breadcrumbService
      .addFriendlyNameForRoute('/schedules-print/finishing', 'Finishing');
    this._breadcrumbService
      .addFriendlyNameForRoute('/schedules-print/pending-samples', 'Pending Samples');
    this._breadcrumbService
      .addFriendlyNameForRoute('/schedules-print/top-pp-samples', 'TOP/PP Samples');
    this._breadcrumbService
      .addFriendlyNameForRoute('/schedules-print/shipping', 'Shipping');
  }

  public configNavTabs(url: string): void {
    if (url) {
      this.tabs.forEach((tab) => {
        tab.isActive = url.indexOf('/' + tab.redirectUrl) !== -1;
      });
    }
  }

  /**
   * Event switch tab
   * @param index
   */
  public switchTab(index: number): void {
    let prevTabIndex = this.tabs.findIndex((t) => t.isActive);
    if (prevTabIndex > -1) {
      this.tabs[prevTabIndex].isActive = false;
    }
    this.tabs[index].isActive = true;
    this._schedulePrintSv.curTab = index;
    this._router.navigate(['schedules-print', this.tabs[index].redirectUrl]);
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
    this._localStorageService.set(
      'Schedules_Filter',
      {
        searchObj: this._schedulePrintSv.searchObj,
        searchFrom: this._schedulePrintSv.searchFrom
      }
    );
    this._schedulePrintSv.searchObj = '';
    this._schedulePrintSv.searchFrom = '';
  }
}
