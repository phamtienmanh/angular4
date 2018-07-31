import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  Arrival3plComponent
} from './arrival-3pl.component';

import {
  Arrival3plService
} from './arrival-3pl.service';

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
    Arrival3plComponent
  ],
  entryComponents: [
    Arrival3plComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    Arrival3plComponent
  ],
  providers: [
    Arrival3plService
  ]
})
export class Arrival3plModule {}
