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
} from './pending-samples.routes';

// 3rd modules

// Modules
import {
  PermissionModule
} from '../../shared/modules/permission';

// Components
import {
  PendingSamplesComponent
} from './pending-samples.component';

// Services

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    PermissionModule
  ],
  declarations: [
    PendingSamplesComponent
  ],
  exports: [],
  providers: []
})
export class PendingSamplesModule {
}
