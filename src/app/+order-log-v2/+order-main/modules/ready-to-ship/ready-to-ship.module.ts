import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  ReadyToShipComponent
} from './ready-to-ship.component';

import {
  ReadyToShipService
} from './ready-to-ship.service';

import {
  OrderMainService
} from '../../order-main.service';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules

@NgModule({
  declarations: [
    ReadyToShipComponent
  ],
  entryComponents: [
    ReadyToShipComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule
  ],
  exports: [
    ReadyToShipComponent
  ],
  providers: [
    ReadyToShipService,
    OrderMainService
  ]
})
export class ReadyToShipModule {}
