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
} from './vendors-management.routes';

// 3rd modules
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';

// Components
import {
  VendorsManagementComponent
} from './vendors-management.component';

// Services
import {
  VendorsManagementService
} from './vendors-management.service';
import {
  VendorsManagementAuth
} from './vendors-management.auth';

@NgModule({
  declarations: [
    VendorsManagementComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule
  ],
  exports: [],
  entryComponents: [],
  providers: [
    BreadcrumbService,
    VendorsManagementService,
    VendorsManagementAuth
  ]
})
export class VendorsManagementModule {}
