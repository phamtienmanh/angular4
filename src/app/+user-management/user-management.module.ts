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
} from './user-management.routes';

// 3rd modules
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';

// Modules

// Components
import {
  UserManagementComponent
} from './user-management.component';

// Services
import {
  UserManagementService
} from './user-management.service';
import {
  UserManagementAuth
} from './user-management.auth';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule
  ],
  declarations: [
    UserManagementComponent
  ],
  exports: [],
  providers: [
    UserManagementService,
    BreadcrumbService,
    UserManagementAuth
  ]
})
export class UserManagementModule {
}
