import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  PackingValidationDueComponent
} from './packing-validation-due.component';

import {
  PackingValidationDueService
} from './packing-validation-due.service';

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
    PackingValidationDueComponent
  ],
  entryComponents: [
    PackingValidationDueComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    PackingValidationDueComponent
  ],
  providers: [
    PackingValidationDueService
  ]
})
export class PackingValidationDueModule {}
