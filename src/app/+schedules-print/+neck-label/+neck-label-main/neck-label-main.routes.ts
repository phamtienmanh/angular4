import {
  Routes
} from '@angular/router';

import {
  NeckLabelMainComponent
} from './neck-label-main.component';

export const routes: Routes = [
  {
    path: '',
    component: NeckLabelMainComponent,
    data: {
      className: 'neck-label-main'
    }
  }
];
