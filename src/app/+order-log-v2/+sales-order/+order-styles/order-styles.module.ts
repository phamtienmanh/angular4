import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../../shared/common';

import {
  OrderStylesComponent
} from './order-styles.component';

import {
  routes
} from './order-styles.routes';

// 3rd modules

// Modules

// Services

@NgModule({
  declarations: [
    OrderStylesComponent
  ],
  imports: [
    SharedCommonModule,
    RouterModule.forChild(routes)
  ],
  providers: []
})
export class OrderStylesModule {
}
