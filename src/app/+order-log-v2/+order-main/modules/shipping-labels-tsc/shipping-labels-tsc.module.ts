import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  ShippingLabelsTscComponent
} from './shipping-labels-tsc.component';

import {
  ShippingLabelsTscService
} from './shipping-labels-tsc.service';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  MomentModule
} from 'angular2-moment';

// Modules
import {
  NgSelectModule
} from '@ng-select/ng-select';

@NgModule({
  declarations: [
    ShippingLabelsTscComponent
  ],
  entryComponents: [
    ShippingLabelsTscComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule
  ],
  exports: [
    ShippingLabelsTscComponent
  ],
  providers: [
    ShippingLabelsTscService
  ]
})
export class ShippingLabelsTscModule {}
