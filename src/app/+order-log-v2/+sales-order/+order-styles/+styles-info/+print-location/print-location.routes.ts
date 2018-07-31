import {
  Routes
} from '@angular/router';

import {
  PrintLocationComponent
} from './print-location.component';

export const routes: Routes = [
  {
    path: '',
    component: PrintLocationComponent,
    data: {className: 'print-location'},
    children: [
      {
        path: ':id',
        loadChildren: './+location-main/location-main.module#LocationMainModule'
      }
    ]
  }
];
