import {
  Routes
} from '@angular/router';

import {
  CategoryManagementComponent
} from './category-management.component';

import {
  CategoryManagementAuth
} from './category-management.auth';

export const routes: Routes = [
  {
    path: '',
    component: CategoryManagementComponent,
    canActivate: [CategoryManagementAuth],
    data: {
      className: 'category-management'
    },
    children: [
      {
        path: '',
        redirectTo: 'category-main',
        pathMatch: 'full'
      },
      {
        path: 'category-main',
        loadChildren: './+category-main/category-main.module#CategoryMainModule'
      }
    ]
  }
];
