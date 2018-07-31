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
} from './role-main.routes';

import {
  RoleMainComponent
} from './role-main.component';

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

// Services
import {
  RoleMainService
} from './role-main.service';

@NgModule({
  declarations: [
    RoleMainComponent
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
    RoleMainService
  ]
})
export class RoleMainModule {
}
