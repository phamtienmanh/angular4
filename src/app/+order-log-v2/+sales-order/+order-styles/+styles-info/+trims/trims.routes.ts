import {
  Routes
} from '@angular/router';

import {
  TrimsComponent
} from './trims.component';

export const routes: Routes = [
  {
    path: '',
    component: TrimsComponent,
    data: {className: 'trims'},
    children: [
      {
        path: ':id',
        loadChildren: './+trims-detail/trims-detail.module#TrimsDetailModule'
      }
    ]
  }
];
