import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  TeckPackSheetComponent
} from './teck-pack-sheet.component';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  UploadModule
} from '../../../+sales-order/+order-styles/+styles-info/+print-location/modules';

@NgModule({
  declarations: [
    TeckPackSheetComponent
  ],
  entryComponents: [
    TeckPackSheetComponent
  ],
  imports: [
    SharedCommonModule,
    NgSelectModule,
    UploadModule,
    MyDatePickerModule
  ],
  exports: [
    TeckPackSheetComponent
  ]
})
export class TeckPackSheetModule {}
