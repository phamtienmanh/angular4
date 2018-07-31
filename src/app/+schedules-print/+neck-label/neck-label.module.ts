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
} from './neck-label.routes';

// 3rd modules

// Modules

// Components
import {
  NeckLabelComponent
} from './neck-label.component';

// Services
import {
  NeckLabelService
} from './neck-label.service';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule
  ],
  declarations: [
    NeckLabelComponent
  ],
  exports: [],
  providers: [NeckLabelService]
})
export class NeckLabelModule {
}
