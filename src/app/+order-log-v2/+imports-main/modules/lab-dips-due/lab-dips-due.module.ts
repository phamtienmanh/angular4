import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  LabDipsDueComponent
} from './lab-dips-due.component';

import {
  LabDipsDueService
} from './lab-dips-due.service';

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
} from '../index';

@NgModule({
  declarations: [
    LabDipsDueComponent
  ],
  entryComponents: [
    LabDipsDueComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    LabDipsDueComponent
  ],
  providers: [
    LabDipsDueService
  ]
})
export class LabDipsDueModule {}
