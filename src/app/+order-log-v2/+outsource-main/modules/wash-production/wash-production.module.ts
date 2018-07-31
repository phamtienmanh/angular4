import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  WashProductionComponent
} from './wash-production.component';

import {
  WashProductionService
} from './wash-production.service';

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
    WashProductionComponent
  ],
  entryComponents: [
    WashProductionComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    WashProductionComponent
  ],
  providers: [
    WashProductionService
  ]
})
export class WashProductionModule {}
