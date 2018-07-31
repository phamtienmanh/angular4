import {
  Routes
} from '@angular/router';

import {
  ProductsMainComponent
} from './products-main.component';

import {
  ProductsMainAuth
} from './products-main.auth';

export const routes: Routes = [
  {
    path: '',
    component: ProductsMainComponent,
    canActivate: [ProductsMainAuth],
    data: {className: 'products-main'}
  }
];
