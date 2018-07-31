import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  EmbellishmentProductionComponent
} from './embellishment-production.component';

import {
  EmbellishmentProductionService
} from './embellishment-production.service';

import {
  OrderMainService
} from '../../../+order-main/order-main.service';

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
    EmbellishmentProductionComponent
  ],
  entryComponents: [
    EmbellishmentProductionComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    EmbellishmentProductionComponent
  ],
  providers: [
    EmbellishmentProductionService,
    OrderMainService
  ]
})
export class EmbellishmentProductionModule {}
