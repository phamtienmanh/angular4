import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  XFactoryDateComponent
} from './x-factory-date.component';

import {
  XFactoryDateService
} from './x-factory-date.service';

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
    XFactoryDateComponent
  ],
  entryComponents: [
    XFactoryDateComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    XFactoryDateComponent
  ],
  providers: [
    XFactoryDateService
  ]
})
export class XFactoryDateModule {}
