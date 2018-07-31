import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  NeckLabelApprovalComponent
} from './neck-label-approval.component';

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
    NeckLabelApprovalComponent
  ],
  entryComponents: [
    NeckLabelApprovalComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule
  ],
  exports: [
    NeckLabelApprovalComponent
  ]
})
export class NeckLabelApprovalModule {}
