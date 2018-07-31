import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  QcSampleShipComponent
} from './qc-sample-ship.component';

import {
  QcSampleShipService
} from './qc-sample-ship.service';

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
    QcSampleShipComponent
  ],
  entryComponents: [
    QcSampleShipComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    QcSampleShipComponent
  ],
  providers: [
    QcSampleShipService
  ]
})
export class QcSampleShipModule {}
