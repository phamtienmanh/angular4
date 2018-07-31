import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  MomentModule
} from 'angular2-moment';

import {
  SharedCommonModule
} from '../shared/common';

import 'd3';

import 'nvd3';
import {
  NvD3Module
} from 'ng2-nvd3';

import {
  UiSwitchModule
} from 'angular2-ui-switch';

import {
  DashboardComponent
} from './dashboard.component';

import {
  routes
} from './dashboard.routes';

import {
  DashboardAuth
} from './dashboard.auth';
import {
  ClickOutsideModule
} from 'ng-click-outside';
import {
  NgDraggableWidgetModule
} from 'ngx-draggable-widget';
import {
  MyDatePickerModule
} from 'mydatepicker';
import { GridsterModule } from 'angular-gridster2';

// Services
import {
  DashboardService
} from './dashboard.service';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    NvD3Module,
    UiSwitchModule,
    SharedCommonModule,
    ClickOutsideModule,
    NgDraggableWidgetModule,
    MyDatePickerModule,
    MomentModule,
    GridsterModule
  ],
  exports: [
  ],
  providers: [
    DashboardAuth,
    DashboardService
  ]
})
export class DashboardModule {}
