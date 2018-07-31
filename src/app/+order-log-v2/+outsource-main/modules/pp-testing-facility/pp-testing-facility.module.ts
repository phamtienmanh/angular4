import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  PpTestingFacilityComponent
} from './pp-testing-facility.component';

import {
  PpTestingFacilityService
} from './pp-testing-facility.service';

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
    PpTestingFacilityComponent
  ],
  entryComponents: [
    PpTestingFacilityComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    PpTestingFacilityComponent
  ],
  providers: [
    PpTestingFacilityService
  ]
})
export class PpTestingFacilityModule {}
