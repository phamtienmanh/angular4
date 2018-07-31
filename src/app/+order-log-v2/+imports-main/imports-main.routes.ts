import {
  Routes
} from '@angular/router';

import {
  ImportsMainComponent
} from './imports-main.component';

import { ImportsMainAuth } from './imports-main.auth';

export const routes: Routes = [
  {
    path: '',
    component: ImportsMainComponent,
    canActivate: [ImportsMainAuth]
  }
];
