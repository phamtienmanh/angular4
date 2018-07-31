import {
  Routes
} from '@angular/router';

import {
  ShippingMainComponent
} from './shipping-main.component';

export const routes: Routes = [
  {
    path: '',
    component: ShippingMainComponent,
    data: {
      className: 'shipping-main'
    }
  }
];
