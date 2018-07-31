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
} from './role-management.routes';

import {
  RoleManagementComponent
} from './role-management.component';

// 3rd modules
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';

// Services
import {
  RoleManagementService
} from './role-management.service';
import {
  RoleManagementAuth
} from './role-management.auth';

@NgModule({
  declarations: [
    RoleManagementComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule
  ],
  exports: [],
  entryComponents: [],
  providers: [
    BreadcrumbService,
    RoleManagementService,
    RoleManagementAuth
  ]
})
export class RoleManagementModule {
}
