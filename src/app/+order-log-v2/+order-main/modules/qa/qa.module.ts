import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  QaComponent
} from './qa.component';

import { OrderMainService } from '../../order-main.service';

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

@NgModule({
  declarations: [
    QaComponent
  ],
  entryComponents: [
    QaComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    UploaderTypeModule
  ],
  exports: [
    QaComponent
  ],
  providers: [
    OrderMainService
  ]
})
export class QaModule {
}
