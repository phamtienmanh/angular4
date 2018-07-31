import {
  Routes
} from '@angular/router';

import {
  OrderMainComponent
} from './order-main.component';

import { OrderMainAuth } from './order-main.auth';

export const routes: Routes = [
  {
    path: '',
    component: OrderMainComponent,
    canActivate: [OrderMainAuth]
  }
];
