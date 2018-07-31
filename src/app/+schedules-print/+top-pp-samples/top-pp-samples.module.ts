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
} from './top-pp-samples.routes';

// 3rd modules

// Modules
import {
  PermissionModule
} from '../../shared/modules/permission';

// Components
import {
  TopPpSamplesComponent
} from './top-pp-samples.component';

// Services

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    PermissionModule
  ],
  declarations: [
    TopPpSamplesComponent
  ],
  exports: [],
  providers: []
})
export class TopPpSamplesModule {
}
