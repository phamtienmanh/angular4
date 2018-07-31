import {
  Routes
} from '@angular/router';

import {
  SamplesComponent
} from './samples.component';

export const routes: Routes = [
  {
    path: '',
    component: SamplesComponent,
    data: {
      className: 'samples'
    },
    children: [
      {
        path: ':id',
        loadChildren: './+samples-main/samples-main.module#SamplesMainModule'
      }
    ]
  }
];
