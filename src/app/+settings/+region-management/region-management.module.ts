import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../shared/common';

import {
  routes
} from './region-management.routes';

// 3rd modules

// Modules

// Components
import {
  RegionManagementComponent
} from './region-management.component';

// Services
import {
  RegionManagementService
} from './region-management.service';
import {
  RegionManagementAuth
} from './region-management.auth';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule
  ],
  declarations: [
    RegionManagementComponent
  ],
  exports: [],
  providers: [
    RegionManagementService,
    RegionManagementAuth
  ]
})
export class RegionManagementModule {
}
