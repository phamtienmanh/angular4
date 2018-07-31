import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  EmbellishmentSampleComponent
} from './embellishment-sample.component';

import {
  EmbellishmentSampleService
} from './embellishment-sample.service';

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
    EmbellishmentSampleComponent
  ],
  entryComponents: [
    EmbellishmentSampleComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    EmbellishmentSampleComponent
  ],
  providers: [
    EmbellishmentSampleService
  ]
})
export class EmbellishmentSampleModule {}
