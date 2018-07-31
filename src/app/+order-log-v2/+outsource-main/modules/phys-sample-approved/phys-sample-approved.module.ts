import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  PhysSampleApprovedComponent
} from './phys-sample-approved.component';

import {
  PhysSampleApprovedService
} from './phys-sample-approved.service';

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
    PhysSampleApprovedComponent
  ],
  entryComponents: [
    PhysSampleApprovedComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    PhysSampleApprovedComponent
  ],
  providers: [
    PhysSampleApprovedService
  ]
})
export class PhysSampleApprovedModule {}
