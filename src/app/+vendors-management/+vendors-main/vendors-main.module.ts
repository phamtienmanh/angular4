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
} from './vendors-main.routes';

import {
  VendorsMainComponent
} from './vendors-main.component';

// 3rd modules
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';

// Modules
import {
  InputDebounceModule
} from '../../shared/modules/input-debounce';
import {
  PaginationControlModule
} from '../../shared/modules/pagination-control';

// Components
import {
  EditReminderComponent
} from './edit-reminder';
import {
  VendorPurchaseOrderComponent
} from './vendor-purchase-order';

// Services
import {
  VendorsMainService
} from './vendors-main.service';

@NgModule({
  declarations: [
    VendorsMainComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    PaginationControlModule,
    InputDebounceModule,
    NgxDatatableModule,
  ],
  exports: [],
  entryComponents: [],
  providers: [
    BreadcrumbService,
    VendorsMainService
  ]
})
export class VendorsMainModule {
}
