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
} from './user-main.routes';

import {
  UserMainComponent
} from './user-main.component';

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
import {
  ConfirmDialogModule
} from '../../shared/modules/confirm-dialog';

// Components
import {
  EditReminderComponent
} from './edit-reminder';
import {
  VendorPurchaseOrderComponent
} from './vendor-purchase-order';

// Services
import {
  UserMainService
} from './user-main.service';

@NgModule({
  declarations: [
    UserMainComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    PaginationControlModule,
    InputDebounceModule,
    NgxDatatableModule,
    ConfirmDialogModule
  ],
  exports: [],
  entryComponents: [],
  providers: [
    BreadcrumbService,
    UserMainService
  ]
})
export class UserMainModule {
}
