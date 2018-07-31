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
} from './category-management.routes';

// 3rd modules

// Modules

// Components
import {
  CategoryManagementComponent
} from './category-management.component';

// Services
import {
  CategoryManagementService
} from './category-management.service';
import {
  CategoryManagementAuth
} from './category-management.auth';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule
  ],
  declarations: [
    CategoryManagementComponent
  ],
  exports: [],
  providers: [
    CategoryManagementService,
    CategoryManagementAuth
  ]
})
export class CategoryManagementModule {
}
