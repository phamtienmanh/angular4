import {
  Routes
} from '@angular/router';

import {
  ProjectPrimaryComponent
} from './project-primary.component';

export const routes: Routes = [
  {
    path: '',
    component: ProjectPrimaryComponent,
    data: {className: 'project-priority'}
  }
];
