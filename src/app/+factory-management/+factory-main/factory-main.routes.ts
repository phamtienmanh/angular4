import {
  Routes
} from '@angular/router';

import {
  FactoryMainComponent
} from './factory-main.component';

export const routes: Routes = [
  {
    path: '',
    component: FactoryMainComponent,
    data: {className: 'factory-main'}
  }
];
