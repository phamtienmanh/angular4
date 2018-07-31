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

// Modules
import {
  InputDebounceModule
} from '../../../shared/modules/input-debounce';
import {
  PaginationControlModule
} from '../../../shared/modules/pagination-control';

// Components
import {
  VendorPurchaseOrderComponent
} from './vendor-purchase-order.component';

// Services
import {
  VendorsPurchaseOrderService
} from './vendors-purchase-order.service';

@NgModule({
  declarations: [
    VendorPurchaseOrderComponent
  ],
  imports: [
    SharedCommonModule,
    PaginationControlModule,
    InputDebounceModule,
    NgxDatatableModule
  ],
  exports: [
    VendorPurchaseOrderComponent
  ],
  entryComponents: [],
  providers: [
    VendorsPurchaseOrderService
  ]
})
export class VendorPurchaseOrderModule {
}
