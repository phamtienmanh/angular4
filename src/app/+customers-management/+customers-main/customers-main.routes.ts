import {
  Routes
} from '@angular/router';

import {
  CustomersMainComponent
} from './customers-main.component';

export const routes: Routes = [
  {
    path: '',
    component: CustomersMainComponent,
    data: {className: 'customers-main'}
  }
];
