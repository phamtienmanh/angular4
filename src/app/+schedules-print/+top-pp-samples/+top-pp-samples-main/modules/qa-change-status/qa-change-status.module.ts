import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  QaChangeStatusComponent
} from './qa-change-status.component';

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
    QaChangeStatusComponent
  ],
  entryComponents: [
    QaChangeStatusComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule
  ],
  exports: [
    QaChangeStatusComponent
  ]
})
export class QaChangeStatusModule {}
