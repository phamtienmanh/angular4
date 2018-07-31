import {
  Routes
} from '@angular/router';

import {
  OrderStylesComponent
} from './order-styles.component';

export const routes: Routes = [
  {
    path: '',
    component: OrderStylesComponent,
    data: {className: 'order-styles'},
    children: [
      {
        path: '',
        redirectTo: 'standard',
        pathMatch: 'full'
      },
      {
        path: 'standard',
        loadChildren: './+styles-main/styles-main.module#StylesMainModule'
      },
      {
        path: 'add-a-style',
        loadChildren: './+styles-info/styles-info.module#StylesInfoModule'
      },
      {
        path: ':id',
        loadChildren: './+styles-info/styles-info.module#StylesInfoModule'
      }
    ]
  }
];
