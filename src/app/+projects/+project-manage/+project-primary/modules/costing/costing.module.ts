import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  CostingComponent
} from './costing.component';

import {
  CostingService
} from './costing.service';

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
import {
  UploaderTypeModule
} from '../../../../../shared/modules/uploader-type';

@NgModule({
  declarations: [
    CostingComponent
  ],
  entryComponents: [
    CostingComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule,
    UploaderTypeModule
  ],
  exports: [
    CostingComponent
  ],
  providers: [
    CostingService
  ]
})
export class CostingModule {}
