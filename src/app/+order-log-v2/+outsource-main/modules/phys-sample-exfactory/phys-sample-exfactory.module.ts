import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  PhysSampleExfactoryComponent
} from './phys-sample-exfactory.component';

import {
  PhysSampleExfactoryService
} from './phys-sample-exfactory.service';

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
    PhysSampleExfactoryComponent
  ],
  entryComponents: [
    PhysSampleExfactoryComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    PhysSampleExfactoryComponent
  ],
  providers: [
    PhysSampleExfactoryService
  ]
})
export class PhysSampleExfactoryModule {}
