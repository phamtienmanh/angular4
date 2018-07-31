import {
  Routes
} from '@angular/router';

import {
  ShippingComponent
} from './shipping.component';

export const routes: Routes = [
  {
    path: '',
    component: ShippingComponent,
    data: {
      className: 'shipping'
    },
    children: [
      {
        path: ':id',
        loadChildren: './+shipping-main/shipping-main.module#ShippingMainModule'
      }
    ]
  }
];
