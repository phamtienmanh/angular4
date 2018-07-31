import {
  Routes
} from '@angular/router';

import {
  HistoryInfoComponent
} from './history-info.component';

export const routes: Routes = [
  {
    path: '',
    component: HistoryInfoComponent,
    data: {className: 'history-info'}
  }
];
