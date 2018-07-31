import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  PpSampleDueComponent
} from './pp-sample-due.component';

import {
  PpSampleDueService
} from './pp-sample-due.service';

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
    PpSampleDueComponent
  ],
  entryComponents: [
    PpSampleDueComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    PpSampleDueComponent
  ],
  providers: [
    PpSampleDueService
  ]
})
export class PpSampleDueModule {}
