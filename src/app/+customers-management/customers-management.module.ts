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
} from './customers-management.routes';

// 3rd modules
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';

// Components
import {
  CustomersManagementComponent
} from './customers-management.component';

// Services
import {
  CustomersManagementService
} from './customers-management.service';
import {
  CustomersManagementAuth
} from './customers-management.auth';

@NgModule({
  declarations: [
    CustomersManagementComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule
  ],
  entryComponents: [],
  exports: [],
  providers: [
    BreadcrumbService,
    CustomersManagementService,
    CustomersManagementAuth
  ]
})
export class CustomersManagementModule {}
