import {
  Routes
} from '@angular/router';

import {
  SampleMainComponent
} from './sample-main.component';

import { SampleMainAuth } from './sample-main.auth';

export const routes: Routes = [
  {
    path: '',
    component: SampleMainComponent,
    canActivate: [SampleMainAuth]
  }
];
