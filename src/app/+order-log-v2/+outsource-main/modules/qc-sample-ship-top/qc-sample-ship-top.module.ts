import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  QcSampleShipTopComponent
} from './qc-sample-ship-top.component';

import {
  QcSampleShipTopService
} from './qc-sample-ship-top.service';
import {
  ShippingService
} from '../../../+sales-order/+order-styles/+styles-info/+tops-v2/+tops-detail/tops-detail.service';

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
import {
  LeadEtaModule
} from '../+shared';

@NgModule({
  declarations: [
    QcSampleShipTopComponent
  ],
  entryComponents: [
    QcSampleShipTopComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    QcSampleShipTopComponent
  ],
  providers: [
    QcSampleShipTopService,
    ShippingService
  ]
})
export class QcSampleShipTopModule {}
