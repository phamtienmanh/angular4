import {
  Routes
} from '@angular/router';

import {
  CategoryMainComponent
} from './category-main.component';

export const routes: Routes = [
  {
    path: '',
    component: CategoryMainComponent,
    data: {className: 'category-main'}
  }
];
