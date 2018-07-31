import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../shared/common';

import {
  routes
} from './order-log.routes';

import {
  OrderLogComponent
} from './order-log.component';

// Modules
import {
  InputDebounceModule
} from '../shared/modules/input-debounce';
import {
  PaginationControlModule
} from '../shared/modules/pagination-control';

// Services
import {
  OrderLogAuth
} from './order-log.auth';
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';

@NgModule({
  declarations: [
    OrderLogComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    PaginationControlModule,
    InputDebounceModule,
  ],
  exports: [],
  entryComponents: [],
  providers: [
    BreadcrumbService,
    OrderLogAuth
  ]
})
export class OrderLogModule {
}
