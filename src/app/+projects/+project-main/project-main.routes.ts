import {
  Routes
} from '@angular/router';

import {
  ProjectMainComponent
} from './project-main.component';

import {
  ProjectMainAuth
} from './project-main.auth';

export const routes: Routes = [
  {
    path: '', component: ProjectMainComponent,
    canActivate: [ProjectMainAuth]
  }
];
