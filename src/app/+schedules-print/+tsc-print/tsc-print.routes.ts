import {
  Routes
} from '@angular/router';

import {
  TscPrintComponent
} from './tsc-print.component';

export const routes: Routes = [
  {
    path: '',
    component: TscPrintComponent,
    data: {
      className: 'tsc-print'
    },
    children: [
      {
        path: '',
        redirectTo: 'tsc',
        pathMatch: 'full'
      },
      {
        path: 'tsc',
        loadChildren: './+print-main/print-main.module#PrintMainModule'
      },
      {
        path: ':id',
        loadChildren: '../+outsource-print/outsource-print-main.module#OutsourcePrintMainModule'
      }
    ]
  }
];
