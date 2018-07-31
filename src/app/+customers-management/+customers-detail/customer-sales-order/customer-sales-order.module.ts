import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../shared/common';

// 3rd modules
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';
import {
  MomentModule
} from 'angular2-moment';

// Modules
import {
  InputDebounceModule
} from '../../../shared/modules/input-debounce';
import {
  PaginationControlModule
} from '../../../shared/modules/pagination-control';

// Components
import {
  CustomerSalesOrderComponent
} from './customer-sales-order.component';

// Services
import {
  CustomersSalesOrderService
} from './customers-sales-order.service';

@NgModule({
  declarations: [
    CustomerSalesOrderComponent
  ],
  imports: [
    SharedCommonModule,
    PaginationControlModule,
    InputDebounceModule,
    NgxDatatableModule,
    MomentModule
  ],
  exports: [
    CustomerSalesOrderComponent
  ],
  entryComponents: [],
  providers: [
    CustomersSalesOrderService
  ]
})
export class CustomerSalesOrderModule {
}
