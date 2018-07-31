import {
  Routes
} from '@angular/router';

import {
  SamplesMainComponent
} from './samples-main.component';

export const routes: Routes = [
  {
    path: '',
    component: SamplesMainComponent,
    data: {
      className: 'samples-main'
    }
  }
];
