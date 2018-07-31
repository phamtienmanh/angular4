import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  FolderReadyComponent
} from './folder-ready.component';

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
import { OrderInfoService } from '../../../+sales-order/+order-info/order-info.service';
import { OrderMainService } from '../../order-main.service';

@NgModule({
  declarations: [
    FolderReadyComponent
  ],
  entryComponents: [
    FolderReadyComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    UploaderTypeModule
  ],
  exports: [
    FolderReadyComponent
  ],
  providers: [
    OrderInfoService,
    OrderMainService
  ]
})
export class FolderReadyModule {}
