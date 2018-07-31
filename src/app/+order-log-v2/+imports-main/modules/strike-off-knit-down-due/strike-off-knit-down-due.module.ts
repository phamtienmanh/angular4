import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  StrikeOffKnitDownDueComponent
} from './strike-off-knit-down-due.component';

import {
  StrikeOffKnitDownDueService
} from './strike-off-knit-down-due.service';

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
    StrikeOffKnitDownDueComponent
  ],
  entryComponents: [
    StrikeOffKnitDownDueComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    StrikeOffKnitDownDueComponent
  ],
  providers: [
    StrikeOffKnitDownDueService
  ]
})
export class StrikeOffKnitDownDueModule {}
