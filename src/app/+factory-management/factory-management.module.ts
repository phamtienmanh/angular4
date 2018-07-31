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
} from './factory-management.routes';

// 3rd modules
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';

// Modules

// Components
import {
  FactoryManagementComponent
} from './factory-management.component';

// Services
import {
  FactoryManagementService
} from './factory-management.service';
import {
  FactoryManagementAuth
} from './factory-management.auth';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule
  ],
  declarations: [
    FactoryManagementComponent
  ],
  exports: [],
  providers: [
    FactoryManagementService,
    BreadcrumbService,
    FactoryManagementAuth
  ]
})
export class FactoryManagementModule {
}
