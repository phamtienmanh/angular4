import {
  Routes
} from '@angular/router';

import {
  RegionMainComponent
} from './region-main.component';

export const routes: Routes = [
  {
    path: '',
    component: RegionMainComponent,
    data: {className: 'region-main'}
  }
];
