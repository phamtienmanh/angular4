﻿import {
  Routes
} from '@angular/router';

import {
  SchedulesPrintComponent
} from './schedules-print.component';
import {
  SchedulesPrintAuth
} from './schedules-print.auth';

export const routes: Routes = [
  {
    path: '',
    component: SchedulesPrintComponent,
    canActivate: [SchedulesPrintAuth],
    data: {
      className: 'schedules-print'
    },
    children: [
      {
        path: 'scheduler',
        loadChildren: './+scheduler/scheduler.module#SchedulerModule'
      },
      {
        path: 'tsc-print',
        loadChildren: './+tsc-print/tsc-print.module#TscPrintModule'
      },
      {
        path: 'neck-label',
        loadChildren: './+neck-label/neck-label.module#NeckLabelModule'
      },
      {
        path: 'finishing',
        loadChildren: './+finishing/finishing.module#FinishingModule'
      },
      {
        path: 'pending-samples',
        loadChildren: './+pending-samples/pending-samples.module#PendingSamplesModule'
      },
      {
        path: 'samples',
        loadChildren: './+samples/samples.module#SamplesModule'
      },
      {
        path: 'top-pp-samples',
        loadChildren: './+top-pp-samples/top-pp-samples.module#TopPpSamplesModule'
      },
      {
        path: 'shipping',
        loadChildren: './+shipping/shipping.module#ShippingModule'
      }
    ]
  }
];
