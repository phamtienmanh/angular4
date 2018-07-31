import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  TeckPackReadyComponent
} from './teck-pack-ready.component';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  UploaderTypeModule
} from '../../../../shared/modules/uploader-type';

// Services
import { OrderMainService } from '../../order-main.service';

@NgModule({
  declarations: [
    TeckPackReadyComponent
  ],
  entryComponents: [
    TeckPackReadyComponent
  ],
  imports: [
    SharedCommonModule,
    NgSelectModule,
    MyDatePickerModule,
    UploaderTypeModule
  ],
  exports: [
    TeckPackReadyComponent
  ],
  providers: [
    OrderMainService
  ]
})
export class TeckPackReadyModule {}
