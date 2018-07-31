import {
  Routes
} from '@angular/router';

import {
  ProjectManageComponent
} from './project-manage.component';
import { ProjectManageAuth } from './project-manage.auth';

export const routes: Routes = [
  {
    path: '',
    component: ProjectManageComponent,
    canActivateChild: [ProjectManageAuth],
    data: {className: 'project-manage'},
    children: [
      {
        path: '',
        redirectTo: 'project-info',
        pathMatch: 'full'
      },
      {
        path: 'project-info',
        loadChildren: './+project-info/project-info.module#ProjectInfoModule'
      },
      {
        path: 'project-priority',
        loadChildren: './+project-primary/project-primary.module#ProjectPrimaryModule'
      },
      {
        path: 'project-secondary',
        loadChildren: './+project-primary/project-primary.module#ProjectPrimaryModule'
      },
      {
        path: 'project-history',
        loadChildren: './+project-history/project-history.module#ProjectHistoryModule'
      },
      {
        path: 'project-users',
        loadChildren: './+project-users/project-users.module#ProjectUsersModule'
      }
    ]
  }
];
