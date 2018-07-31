import {
  Routes
} from '@angular/router';

import {
  OrderLogComponent
} from './order-log.component';

import {
  OrderLogAuth
} from './order-log.auth';

export const routes: Routes = [
  {
    path: '',
    component: OrderLogComponent,
    data: {className: 'order-log-v2'},
    children: [
      {
        path: 'all',
        loadChildren: './+order-main/order-main.module#OrderMainModule'
      },
      {
        path: 'imports',
        loadChildren: './+imports-main/imports-main.module#ImportsMainModule'
      },
      {
        path: 'outsource',
        loadChildren: './+outsource-main/outsource-main.module#OutsourceMainModule'
      },
      {
        path: 'sample-development',
        loadChildren: './+sample-main/sample-main.module#SampleMainModule'
      },
      {
        path: ':id',
        loadChildren: './+sales-order/sales-order.module#SalesOrderModule'
      }
    ]
  }
];
