import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  NeckLabelProductionComponent
} from './neck-label-production.component';

import {
  NeckLabelProductionService
} from './neck-label-production.service';

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
    NeckLabelProductionComponent
  ],
  entryComponents: [
    NeckLabelProductionComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    NeckLabelProductionComponent
  ],
  providers: [
    NeckLabelProductionService
  ]
})
export class NeckLabelProductionModule {}
