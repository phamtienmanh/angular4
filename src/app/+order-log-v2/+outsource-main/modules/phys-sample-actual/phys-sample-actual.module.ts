import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  PhysSampleActualComponent
} from './phys-sample-actual.component';

import {
  PhysSampleActualService
} from './phys-sample-actual.service';

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
    PhysSampleActualComponent
  ],
  entryComponents: [
    PhysSampleActualComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    PhysSampleActualComponent
  ],
  providers: [
    PhysSampleActualService
  ]
})
export class PhysSampleActualModule {}
