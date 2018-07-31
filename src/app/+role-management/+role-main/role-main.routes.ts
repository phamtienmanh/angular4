import {
  Routes
} from '@angular/router';

import {
  RoleMainComponent
} from './role-main.component';

export const routes: Routes = [
  {
    path: '',
    component: RoleMainComponent,
    data: {className: 'role-main'}
  }
];
