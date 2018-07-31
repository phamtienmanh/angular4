import {
  Routes
} from '@angular/router';

import {
  VendorsMainComponent
} from './vendors-main.component';

export const routes: Routes = [
  {
    path: '',
    component: VendorsMainComponent,
    data: {className: 'vendors-main'}
  }
];
