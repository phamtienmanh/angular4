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
} from './customers-detail.routes';

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
  CustomerSalesOrderModule
} from './customer-sales-order';
import {
  EditReminderModule
} from './edit-reminder';
import {
  ConfirmDialogModule
} from '../../shared/modules/confirm-dialog';

// Components
import {
  CustomersDetailComponent
} from './customers-detail.component';

// Services
import {
  CustomersDetailService
} from './customers-detail.service';
import {
  CustomersEditService
} from '../+customers-edit/customers-edit.service';

@NgModule({
  declarations: [
    CustomersDetailComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    NgSelectModule,
    MyDatePickerModule,
    ConfirmDialogModule,
    MomentModule,
    CustomerSalesOrderModule,
    EditReminderModule
  ],
  exports: [],
  entryComponents: [],
  providers: [
    CustomersDetailService,
    CustomersEditService
  ]
})
export class CustomersDetailModule {
}
