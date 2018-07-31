import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  SamplesDeliveredComponent
} from './samples-delivered.component';

import {
  SamplesDeliveredService
} from './samples-delivered.service';

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
    SamplesDeliveredComponent
  ],
  entryComponents: [
    SamplesDeliveredComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    SamplesDeliveredComponent
  ],
  providers: [
    SamplesDeliveredService
  ]
})
export class SamplesDeliveredModule {}
