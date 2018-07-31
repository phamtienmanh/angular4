import {
  Routes
} from '@angular/router';

import {
  TopPpSamplesMainComponent
} from './top-pp-samples-main.component';

export const routes: Routes = [
  {
    path: '',
    component: TopPpSamplesMainComponent,
    data: {
      className: 'top-pp-samples-main'
    }
  }
];
