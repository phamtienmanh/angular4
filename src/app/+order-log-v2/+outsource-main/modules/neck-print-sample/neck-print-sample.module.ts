import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  NeckPrintSampleComponent
} from './neck-print-sample.component';

import {
  NeckPrintSampleService
} from './neck-print-sample.service';

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
    NeckPrintSampleComponent
  ],
  entryComponents: [
    NeckPrintSampleComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    NeckPrintSampleComponent
  ],
  providers: [
    NeckPrintSampleService
  ]
})
export class NeckPrintSampleModule {}
