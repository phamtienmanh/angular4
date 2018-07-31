import {
  Routes
} from '@angular/router';

import {
  RegionManagementComponent
} from './region-management.component';

import {
  RegionManagementAuth
} from './region-management.auth';

export const routes: Routes = [
  {
    path: '',
    component: RegionManagementComponent,
    canActivate: [RegionManagementAuth],
    data: {
      className: 'region-management'
    },
    children: [
      {
        path: '',
        redirectTo: 'region-main',
        pathMatch: 'full'
      },
      {
        path: 'region-main',
        loadChildren: './+region-main/region-main.module#RegionMainModule'
      }
    ]
  }
];
