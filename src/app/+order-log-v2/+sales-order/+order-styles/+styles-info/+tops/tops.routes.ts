import {
  Routes
} from '@angular/router';

import {
  TopsComponent
} from './tops.component';

export const routes: Routes = [
  {
    path: '',
    component: TopsComponent,
    data: {className: 'tops'},
    children: [
      {
        path: 'factory',
        loadChildren: './+factory/factory.module#FactoryModule'
      },
      {
        path: 'shipping',
        loadChildren: './+shipping/shipping.module#ShippingModule'
      },
      {
        path: 'billing',
        loadChildren: './+billing/billing.module#BillingModule'
      }
    ]
  }
];
