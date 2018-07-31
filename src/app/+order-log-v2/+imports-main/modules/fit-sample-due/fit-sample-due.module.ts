import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  FitSampleDueComponent
} from './fit-sample-due.component';

import {
  FitSampleDueService
} from './fit-sample-due.service';

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
    FitSampleDueComponent
  ],
  entryComponents: [
    FitSampleDueComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    FitSampleDueComponent
  ],
  providers: [
    FitSampleDueService
  ]
})
export class FitSampleDueModule {}
