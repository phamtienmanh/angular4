import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  CreditApprovalComponent
} from './credit-approval.component';

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
    CreditApprovalComponent
  ],
  entryComponents: [
    CreditApprovalComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule
  ],
  exports: [
    CreditApprovalComponent
  ]
})
export class CreditApprovalModule {}
