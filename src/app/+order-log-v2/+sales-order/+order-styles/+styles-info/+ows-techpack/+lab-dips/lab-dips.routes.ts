import {
  Routes
} from '@angular/router';

import {
  LabDipsComponent
} from './lab-dips.component';

export const routes: Routes = [
  {
    path: '',
    component: LabDipsComponent,
    data: {className: 'lab-dips'},
    children: [
      {
        path: ':id',
        loadChildren: './+lab-detail/lab-detail.module#LabDetailModule'
      }
    ]
  }
];
