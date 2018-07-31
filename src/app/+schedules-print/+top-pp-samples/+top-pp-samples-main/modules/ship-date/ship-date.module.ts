import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  ShipDateComponent
} from './ship-date.component';

// 3rd modules
import {
  MomentModule
} from 'angular2-moment';
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  UploaderTypeModule
} from '../../../../../shared/modules/uploader-type';

// Services

@NgModule({
  declarations: [
    ShipDateComponent
  ],
  entryComponents: [
    ShipDateComponent
  ],
  imports: [
    SharedCommonModule,
    MomentModule,
    NgSelectModule,
    MyDatePickerModule,
    UploaderTypeModule
  ],
  exports: [
    ShipDateComponent
  ],
  providers: [
  ]
})
export class ShipDateModule {}
