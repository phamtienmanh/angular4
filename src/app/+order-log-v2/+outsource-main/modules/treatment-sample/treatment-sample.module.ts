import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  TreatmentSampleComponent
} from './treatment-sample.component';

import {
  TreatmentSampleService
} from './treatment-sample.service';

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
    TreatmentSampleComponent
  ],
  entryComponents: [
    TreatmentSampleComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    TreatmentSampleComponent
  ],
  providers: [
    TreatmentSampleService
  ]
})
export class TreatmentSampleModule {}
