import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  ActualToShipComponent
} from './actual-to-ship.component';

import {
  ActualToShipService
} from './actual-to-ship.service';

import {
  ShippingInfoService
} from '../../../+sales-order/+order-styles/+styles-info/+shipping-info/shipping-info.service';

import {
  OrderMainService
} from '../../order-main.service';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  UploaderTypeModule
} from '../../../../shared/modules/uploader-type';

@NgModule({
  declarations: [
    ActualToShipComponent
  ],
  entryComponents: [
    ActualToShipComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    UploaderTypeModule
  ],
  exports: [
    ActualToShipComponent
  ],
  providers: [
    ActualToShipService,
    ShippingInfoService,
    OrderMainService
  ]
})
export class ActualToShipModule {}
