import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  BulkFabricComponent
} from './bulk-fabric.component';

import {
  BulkFabricService
} from './bulk-fabric.service';

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
    BulkFabricComponent
  ],
  entryComponents: [
    BulkFabricComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    BulkFabricComponent
  ],
  providers: [
    BulkFabricService
  ]
})
export class BulkFabricModule {}
