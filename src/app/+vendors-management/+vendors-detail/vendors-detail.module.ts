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
} from './vendors-detail.routes';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  MomentModule
} from 'angular2-moment';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  VendorPurchaseOrderModule
} from './vendor-purchase-order';
import {
  EditReminderModule
} from './edit-reminder';
import {
  ConfirmDialogModule
} from '../../shared/modules/confirm-dialog';

// Components
import {
  VendorsDetailComponent
} from './vendors-detail.component';

// Services
import {
  VendorsDetailService
} from './vendors-detail.service';
import {
  VendorsEditService
} from '../+vendors-edit/vendors-edit.service';

@NgModule({
  declarations: [
    VendorsDetailComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    NgSelectModule,
    MyDatePickerModule,
    ConfirmDialogModule,
    MomentModule,
    EditReminderModule,
    VendorPurchaseOrderModule
  ],
  exports: [],
  entryComponents: [],
  providers: [
    VendorsDetailService,
    VendorsEditService
  ]
})
export class VendorsDetailModule {
}
