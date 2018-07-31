import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  SampleApprovalComponent
} from './print-approval.component';

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
    SampleApprovalComponent
  ],
  entryComponents: [
    SampleApprovalComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule
  ],
  exports: [
    SampleApprovalComponent
  ]
})
export class SampleApprovalModule {}
