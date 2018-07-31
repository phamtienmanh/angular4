import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  PhysSampleActualTopComponent
} from './phys-sample-actual-top.component';

import {
  PhysSampleActualTopService
} from './phys-sample-actual-top.service';

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
    PhysSampleActualTopComponent
  ],
  entryComponents: [
    PhysSampleActualTopComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    PhysSampleActualTopComponent
  ],
  providers: [
    PhysSampleActualTopService
  ]
})
export class PhysSampleActualTopModule {}
