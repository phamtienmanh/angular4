import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  ConfirmReorderComponent
} from './confirm-reorder.component';

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
    ConfirmReorderComponent
  ],
  entryComponents: [
    ConfirmReorderComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule
  ],
  exports: [
    ConfirmReorderComponent
  ]
})
export class ConfirmReorderModule {}
