import {
  Routes
} from '@angular/router';

import {
  ReportsComponent
} from './reports.component';

import {
  ReportsAuth
} from './reports.auth';

export const routes: Routes = [
  {
    path: '', component: ReportsComponent,
    canActivate: [ReportsAuth]
  }
];
