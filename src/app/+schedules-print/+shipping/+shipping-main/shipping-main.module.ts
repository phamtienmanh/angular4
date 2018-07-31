import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../../shared/common';

import {
  routes
} from './shipping-main.routes';

// 3rd modules
import {
  ClickOutsideModule
} from 'ng-click-outside';
import {
  NgSelectModule
} from '@ng-select/ng-select';
import {
  MyDatePickerModule
} from 'mydatepicker';

// Modules
import {
  PaginationControlModule
} from '../../../shared/modules/pagination-control';
import {
  MomentModule
} from 'angular2-moment';
import {
  LabelStatusModule
} from '../../../+order-log-v2/+outsource-main/components/label-status';
import {
  UploaderTypeModule
} from '../../../shared/modules/uploader-type';
import {
  ActualToShipModule
} from '../../../+order-log-v2/+order-main/modules';

// Components
import {
  ShippingMainComponent
} from './shipping-main.component';
import {
  ShippingFilterComponent
} from './components';

// Services
import {
  ShippingMainService
} from './shipping-main.service';
import {
  StyleService
} from '../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+style/style.service';
import {
  EditUserService
} from '../../../+user-management/+edit-user/edit-user.service';
import {
  OrderMainService
} from '../../../+order-log-v2/+order-main/order-main.service';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    PaginationControlModule,
    ClickOutsideModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    UploaderTypeModule,
    ActualToShipModule,
    LabelStatusModule
  ],
  declarations: [
    ShippingMainComponent,
    ShippingFilterComponent
  ],
  exports: [],
  providers: [
    ShippingMainService,
    StyleService,
    EditUserService,
    OrderMainService
  ]
})
export class ShippingMainModule {
}
