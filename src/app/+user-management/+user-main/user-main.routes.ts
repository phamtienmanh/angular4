import {
  Routes
} from '@angular/router';

import {
  UserMainComponent
} from './user-main.component';

export const routes: Routes = [
  {
    path: '',
    component: UserMainComponent,
    data: {className: 'user-main'}
  }
];
