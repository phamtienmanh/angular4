import {
  Routes
} from '@angular/router';

import {
  OutsourceMainComponent
} from './outsource-main.component';

import { OutsourceMainAuth } from './outsource-main.auth';

export const routes: Routes = [
  {
    path: '',
    component: OutsourceMainComponent,
    canActivate: [OutsourceMainAuth]
  }
];
