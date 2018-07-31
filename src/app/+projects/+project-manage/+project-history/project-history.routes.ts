import {
  Routes
} from '@angular/router';

import {
  ProjectHistoryComponent
} from './project-history.component';

export const routes: Routes = [
  {
    path: '',
    component: ProjectHistoryComponent,
    data: {className: 'project-history'}
  }
];
