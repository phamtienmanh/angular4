import {
  Routes
} from '@angular/router';

// Components
import {
  VendorsManagementComponent
} from './vendors-management.component';

import {
  VendorsManagementAuth
} from './vendors-management.auth';

export const routes: Routes = [
  {
    path: '',
    component: VendorsManagementComponent,
    canActivate: [VendorsManagementAuth],
    data: {
      className: 'vendors-management'
    },
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        loadChildren: './+vendors-main/vendors-main.module#VendorsMainModule'
      },
      {
        path: 'new',
        loadChildren: './+vendors-edit/vendors-edit.module#VendorsEditModule'
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
            loadChildren: './+vendors-detail/vendors-detail.module#VendorsDetailModule'
          },
          {
            path: 'edit',
            loadChildren: './+vendors-edit/vendors-edit.module#VendorsEditModule'
          }
        ]
      }
    ]
  }
];
