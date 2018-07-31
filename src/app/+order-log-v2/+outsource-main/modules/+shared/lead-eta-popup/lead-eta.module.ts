import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  LeadEtaComponent
} from './lead-eta.component';

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

@NgModule({
  declarations: [
    LeadEtaComponent
  ],
  entryComponents: [
    LeadEtaComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule
  ],
  exports: [
    LeadEtaComponent
  ]
})
export class LeadEtaModule {}
