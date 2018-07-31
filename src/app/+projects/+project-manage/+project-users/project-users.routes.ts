import {
  Routes
} from '@angular/router';

import {
  ProjectUsersComponent
} from './project-users.component';

export const routes: Routes = [
  {
    path: '',
    component: ProjectUsersComponent,
    data: {className: 'project-users'}
  }
];
