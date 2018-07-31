import {
  Routes
} from '@angular/router';

import {
  UserManagementComponent
} from './user-management.component';

import {
  UserManagementAuth
} from './user-management.auth';

export const routes: Routes = [
  {
    path: '',
    component: UserManagementComponent,
    canActivate: [UserManagementAuth],
    data: {
      className: 'user-management'
    },
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        loadChildren: './+user-main/user-main.module#UserMainModule'
      },
      {
        path: 'new-user',
        loadChildren: './+new-user/new-user.module#NewUserModule'
      },
      {
        path: ':id',
        loadChildren: './+edit-user/edit-user.module#EditUserModule'
      }
    ]
  }
];
