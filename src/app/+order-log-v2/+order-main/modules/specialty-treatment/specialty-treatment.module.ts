import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  SpecialtyTreatmentComponent
} from './specialty-treatment.component';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules

@NgModule({
  declarations: [
    SpecialtyTreatmentComponent
  ],
  entryComponents: [
    SpecialtyTreatmentComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule
  ],
  exports: [
    SpecialtyTreatmentComponent
  ]
})
export class SpecialtyTreatmentModule {}
