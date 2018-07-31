import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  EtaTscComponent
} from './eta-tsc.component';

import {
  EtaTscService
} from './eta-tsc.service';

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
    EtaTscComponent
  ],
  entryComponents: [
    EtaTscComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    EtaTscComponent
  ],
  providers: [
    EtaTscService
  ]
})
export class EtaTscModule {}
