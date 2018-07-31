import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../shared/common';

import {
  routes
} from './shipping.routes';

// 3rd modules

// Modules

// Components
import {
  ShippingComponent
} from './shipping.component';

// Services
import {
  ShippingService
} from './shipping.service';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule
  ],
  declarations: [
    ShippingComponent
  ],
  exports: [],
  providers: [ShippingService]
})
export class ShippingModule {
}
