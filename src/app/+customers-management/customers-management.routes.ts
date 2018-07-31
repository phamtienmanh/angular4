import {
  Routes
} from '@angular/router';

// Components
import {
  CustomersManagementComponent
} from './customers-management.component';

import {
  CustomersManagementAuth
} from './customers-management.auth';

export const routes: Routes = [
  {
    path: '',
    component: CustomersManagementComponent,
    canActivate: [CustomersManagementAuth],
    data: {
      className: 'customers-management'
    },
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        loadChildren: './+customers-main/customers-main.module#CustomersMainModule'
      },
      {
        path: 'new',
        loadChildren: './+customers-edit/customers-edit.module#CustomersEditModule'
      },
      {
        path: ':id',
        children: [
          {
            path: '',
            redirectTo: 'detail',
            pathMatch: 'full'
          },
          {
            path: 'detail',
            loadChildren: './+customers-detail/customers-detail.module#CustomersDetailModule'
          },
          {
            path: 'edit',
            loadChildren: './+customers-edit/customers-edit.module#CustomersEditModule'
          }
        ]
      }
    ]
  }
];
