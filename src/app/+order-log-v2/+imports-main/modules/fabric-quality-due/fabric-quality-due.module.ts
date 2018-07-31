import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  FabricQualityDueComponent
} from './fabric-quality-due.component';

import {
  FabricQualityDueService
} from './fabric-quality-due.service';

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
    FabricQualityDueComponent
  ],
  entryComponents: [
    FabricQualityDueComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    FabricQualityDueComponent
  ],
  providers: [
    FabricQualityDueService
  ]
})
export class FabricQualityDueModule {}
