import {
  Routes
} from '@angular/router';
import {
  DashboardComponent
} from './dashboard.component';

import {
  DashboardAuth
} from './dashboard.auth';

export const routes: Routes = [
  {
    path: '', component: DashboardComponent,
    canActivate: [DashboardAuth],
    data: {className: 'dashboard'}
  }
];
