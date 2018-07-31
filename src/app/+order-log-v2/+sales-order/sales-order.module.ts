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
} from './sales-order.routes';

// 3rd modules

// Components
import {
  SalesOrderComponent
} from './sales-order.component';
import {
  ConfirmDialogModule
} from '../../shared/modules/confirm-dialog';

// Services
import {
  ExtendedHttpService
} from '../../shared/services/http';
import {
  OrderInfoService
} from './+order-info';
import {
  SalesOrderService
} from './sales-order.service';
import {
  SalesOrderAuth
} from './sales-order.auth';
import {
  OrderMainService
} from '../+order-main/order-main.service';

@NgModule({
  declarations: [
    SalesOrderComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    ConfirmDialogModule
  ],
  exports: [],
  providers: [
    ExtendedHttpService,
    OrderInfoService,
    SalesOrderService,
    OrderMainService,
    SalesOrderAuth
  ]
})
export class SalesOrderModule {}
