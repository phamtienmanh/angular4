import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  ReadyToShip3plComponent
} from './ready-to-ship-3pl.component';

import {
  ReadyToShip3plService
} from './ready-to-ship-3pl.service';

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

// Service
import {
  OutsourceMainService
} from '../../outsource-main.service';

@NgModule({
  declarations: [
    ReadyToShip3plComponent
  ],
  entryComponents: [
    ReadyToShip3plComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    ReadyToShip3plComponent
  ],
  providers: [
    ReadyToShip3plService,
    OutsourceMainService
  ]
})
export class ReadyToShip3plModule {}
