import {
  Routes
} from '@angular/router';

import {
  RoleManagementComponent
} from './role-management.component';

import {
  RoleManagementAuth
} from './role-management.auth';

export const routes: Routes = [
  {
    path: '',
    component: RoleManagementComponent,
    canActivate: [RoleManagementAuth],
    data: {
      className: 'role-management'
    },
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        loadChildren: './+role-main/role-main.module#RoleMainModule'
      },
      {
        path: 'new-role',
        loadChildren: './+new-role/new-role.module#NewRoleModule'
      },
      {
        path: ':id',
        loadChildren: './+edit-role/edit-role.module#EditRoleModule'
      }
    ]
  }
];
