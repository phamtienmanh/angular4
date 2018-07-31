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
} from './customers-main.routes';

// 3rd modules
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
  CustomersMainComponent
} from './customers-main.component';

// Services
import {
  CustomersMainService
} from './customers-main.service';

@NgModule({
  declarations: [
    CustomersMainComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    PaginationControlModule,
    InputDebounceModule,
    NgxDatatableModule
  ],
  exports: [],
  entryComponents: [],
  providers: [
    CustomersMainService
  ]
})
export class CustomersMainModule {
}
