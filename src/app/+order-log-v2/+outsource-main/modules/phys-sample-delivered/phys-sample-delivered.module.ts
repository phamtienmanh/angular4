import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  PhysSampleDeliveredComponent
} from './phys-sample-delivered.component';

import {
  PhysSampleDeliveredService
} from './phys-sample-delivered.service';

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
    PhysSampleDeliveredComponent
  ],
  entryComponents: [
    PhysSampleDeliveredComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    PhysSampleDeliveredComponent
  ],
  providers: [
    PhysSampleDeliveredService
  ]
})
export class PhysSampleDeliveredModule {}
