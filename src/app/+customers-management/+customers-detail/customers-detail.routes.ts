import {
  Routes
} from '@angular/router';

import {
  CustomersDetailComponent
} from './customers-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: CustomersDetailComponent,
    data: {className: 'customers-detail'}
  }
];
