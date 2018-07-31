import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  TscPresentationDateComponent
} from './tsc-presentation-date.component';

import {
  TscPresentationDateService
} from './tsc-presentation-date.service';

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
    TscPresentationDateComponent
  ],
  entryComponents: [
    TscPresentationDateComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    TscPresentationDateComponent
  ],
  providers: [
    TscPresentationDateService
  ]
})
export class TscPresentationDateModule {}
