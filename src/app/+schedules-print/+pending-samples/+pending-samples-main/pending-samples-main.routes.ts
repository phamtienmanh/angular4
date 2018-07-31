import {
  Routes
} from '@angular/router';

import {
  PendingSamplesMainComponent
} from './pending-samples-main.component';

export const routes: Routes = [
  {
    path: '',
    component: PendingSamplesMainComponent,
    data: {
      className: 'pending-samples-main'
    }
  }
];
