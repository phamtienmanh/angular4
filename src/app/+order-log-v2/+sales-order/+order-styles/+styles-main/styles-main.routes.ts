import {
  Routes
} from '@angular/router';

import {
  StylesMainComponent
} from './styles-main.component';

export const routes: Routes = [
  {
    path: '',
    component: StylesMainComponent,
    data: {className: 'styles-main'}
  }
];
