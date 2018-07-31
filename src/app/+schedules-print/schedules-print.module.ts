import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../shared/common';

import {
  routes
} from './schedules-print.routes';

// 3rd modules
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';

// Modules
import {
  PermissionModule
} from '../shared/modules/permission';

// Components
import {
  SchedulesPrintComponent
} from './schedules-print.component';

// Services
import {
  SchedulesPrintService
} from './schedules-print.service';
import {
  ExtendedHttpService
} from '../shared/services/http';
import {
  SchedulesPrintAuth
} from './schedules-print.auth';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    PermissionModule
  ],
  declarations: [
    SchedulesPrintComponent
  ],
  exports: [],
  providers: [
    SchedulesPrintService,
    ExtendedHttpService,
    BreadcrumbService,
    SchedulesPrintAuth
  ]
})
export class SchedulesPrintModule {
}
