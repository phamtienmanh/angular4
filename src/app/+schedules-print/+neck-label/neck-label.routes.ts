import {
  Routes
} from '@angular/router';

import {
  NeckLabelComponent
} from './neck-label.component';

export const routes: Routes = [
  {
    path: '',
    component: NeckLabelComponent,
    data: {
      className: 'neck-label'
    },
    children: [
      {
        path: ':id',
        loadChildren: './+neck-label-main/neck-label-main.module#NeckLabelMainModule'
      }
    ]
  }
];
