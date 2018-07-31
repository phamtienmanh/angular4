import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  ProductionDueV2Component
} from './production-due-v2.component';

import {
  ProductionDueV2Service
} from './production-due-v2.service';

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
    ProductionDueV2Component
  ],
  entryComponents: [
    ProductionDueV2Component
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    ProductionDueV2Component
  ],
  providers: [
    ProductionDueV2Service
  ]
})
export class ProductionDueV2Module {}
