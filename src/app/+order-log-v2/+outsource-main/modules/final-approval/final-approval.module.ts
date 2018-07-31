import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  FinalApprovalComponent
} from './final-approval.component';

import {
  FinalApprovalService
} from './final-approval.service';

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
} from '../+shared';

@NgModule({
  declarations: [
    FinalApprovalComponent
  ],
  entryComponents: [
    FinalApprovalComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    FinalApprovalComponent
  ],
  providers: [
    FinalApprovalService
  ]
})
export class FinalApprovalModule {}
