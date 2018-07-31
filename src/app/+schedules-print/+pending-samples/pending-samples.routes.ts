import {
  Routes
} from '@angular/router';

import {
  PendingSamplesComponent
} from './pending-samples.component';

export const routes: Routes = [
  {
    path: '',
    component: PendingSamplesComponent,
    data: {
      className: 'pending-samples'
    },
    children: [
      {
        path: ':id',
        loadChildren: './+pending-samples-main/pending-samples-main.module#PendingSamplesMainModule'
      }
    ]
  }
];
