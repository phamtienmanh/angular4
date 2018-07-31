import {
  Routes
} from '@angular/router';

import {
  SalesOrderComponent
} from './sales-order.component';
import {
  SalesOrderAuth
} from './sales-order.auth';

export const routes: Routes = [
  {
    path: '',
    component: SalesOrderComponent,
    canActivate: [SalesOrderAuth],
    data: {className: 'sales-order'},
    children: [
      {
        path: '',
        redirectTo: 'order-info',
        pathMatch: 'full'
      },
      {
        path: 'order-info',
        loadChildren: './+order-info/order-info.module#OrderInfoModule'
      },
      // {
      //   path: 'shipping-info',
      //   loadChildren: './+shipping-info/shipping-info.module#ShippingInfoModule'
      // },
      {
        path: 'history-info',
        loadChildren: './+history-info/history-info.module#HistoryInfoModule'
      },
      {
        path: 'styles',
        loadChildren: './+order-styles/order-styles.module#OrderStylesModule'
      }
    ]
  }
];
