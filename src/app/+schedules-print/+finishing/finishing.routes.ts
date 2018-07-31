import {
  Routes
} from '@angular/router';

import {
  FinishingComponent
} from './finishing.component';

export const routes: Routes = [
  {
    path: '',
    component: FinishingComponent,
    data: {
      className: 'finishing'
    },
    children: [
      {
        path: ':id',
        loadChildren: './+tsc-finishing/tsc-finishing.module#TscFinishingModule'
      }
    ]
  }
];
