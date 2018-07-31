import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  LeadTimeComponent
} from './lead-time.component';

import {
  LeadTimeService
} from './lead-time.service';

// 3rd modules

// Modules
import {
  LeadEtaModule
} from '../+shared';

@NgModule({
  declarations: [
    LeadTimeComponent
  ],
  entryComponents: [
    LeadTimeComponent
  ],
  imports: [
    SharedCommonModule,
    LeadEtaModule
  ],
  exports: [
    LeadTimeComponent
  ],
  providers: [
    LeadTimeService
  ]
})
export class LeadTimeModule {}
