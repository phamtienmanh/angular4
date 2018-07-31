import {
  Routes
} from '@angular/router';

import {
  TscFinishingComponent
} from './tsc-finishing.component';

export const routes: Routes = [
  {
    path: '', component: TscFinishingComponent,
    data: {
      className: 'tsc-finishing'
    }
  }
];
