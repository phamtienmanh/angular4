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
} from './factory-main.routes';

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
  FactoryMainComponent
} from './factory-main.component';

// Services
import {
  FactoryMainService
} from './factory-main.service';

@NgModule({
  declarations: [
    FactoryMainComponent
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
    FactoryMainService
  ]
})
export class FactoryMainModule {
}
