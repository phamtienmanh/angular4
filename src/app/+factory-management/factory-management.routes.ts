import {
  Routes
} from '@angular/router';

import {
  FactoryManagementComponent
} from './factory-management.component';

import {
  FactoryManagementAuth
} from './factory-management.auth';

export const routes: Routes = [
  {
    path: '',
    component: FactoryManagementComponent,
    canActivate: [FactoryManagementAuth],
    data: {
      className: 'factory-management'
    },
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        loadChildren: './+factory-main/factory-main.module#FactoryMainModule'
      },
      {
        path: 'new-factory',
        loadChildren: './+factory-detail/factory-detail.module#FactoryDetailModule'
      },
      {
        path: ':id',
        loadChildren: './+factory-detail/factory-detail.module#FactoryDetailModule'
      }
    ]
  }
];
