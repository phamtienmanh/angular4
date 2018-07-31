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
} from './vendors-edit.routes';

import {
  VendorsEditComponent
} from './vendors-edit.component';

// 3rd modules
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Module
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
  VendorsEditService
} from './vendors-edit.service';
import {
  VendorsEditDeactive
} from './vendors-edit.deactive';

@NgModule({
  declarations: [
    VendorsEditComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    NgSelectModule,
    ConfirmDialogModule
  ],
  exports: [],
  entryComponents: [],
  providers: [
    VendorsEditService,
    VendorsEditDeactive
  ]
})
export class VendorsEditModule {
}
