import {
  Routes
} from '@angular/router';

import {
  VendorsDetailComponent
} from './vendors-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: VendorsDetailComponent,
    data: {className: 'vendors-detail'}
  }
];
