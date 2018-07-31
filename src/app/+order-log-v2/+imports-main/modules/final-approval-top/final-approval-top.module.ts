import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  FinalApprovalTopComponent
} from './final-approval-top.component';

import {
  FinalApprovalTopService
} from './final-approval-top.service';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  MomentModule
} from 'angular2-moment';

// Modules
import {
  NgSelectModule
} from '@ng-select/ng-select';
import {
  LeadEtaModule
} from '../index';

@NgModule({
  declarations: [
    FinalApprovalTopComponent
  ],
  entryComponents: [
    FinalApprovalTopComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    FinalApprovalTopComponent
  ],
  providers: [
    FinalApprovalTopService
  ]
})
export class FinalApprovalTopModule {}
