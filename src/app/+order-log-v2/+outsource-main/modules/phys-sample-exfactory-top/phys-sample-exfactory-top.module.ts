import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  PhysSampleExfactoryTopComponent
} from './phys-sample-exfactory-top.component';

import {
  PhysSampleExfactoryTopService
} from './phys-sample-exfactory-top.service';

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
    PhysSampleExfactoryTopComponent
  ],
  entryComponents: [
    PhysSampleExfactoryTopComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    PhysSampleExfactoryTopComponent
  ],
  providers: [
    PhysSampleExfactoryTopService
  ]
})
export class PhysSampleExfactoryTopModule {}
