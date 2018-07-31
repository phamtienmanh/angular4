import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  FactoryPackingListComponent
} from './factory-packing-list.component';

import {
  FactoryPackingListService
} from './factory-packing-list.service';

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
    FactoryPackingListComponent
  ],
  entryComponents: [
    FactoryPackingListComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    FactoryPackingListComponent
  ],
  providers: [
    FactoryPackingListService
  ]
})
export class FactoryPackingListModule {}
