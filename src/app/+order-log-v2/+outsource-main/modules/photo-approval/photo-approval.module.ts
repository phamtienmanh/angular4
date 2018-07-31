import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  PhotoApprovalComponent
} from './photo-approval.component';

import {
  PhotoApprovalService
} from './photo-approval.service';

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
    PhotoApprovalComponent
  ],
  entryComponents: [
    PhotoApprovalComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    PhotoApprovalComponent
  ],
  providers: [
    PhotoApprovalService
  ]
})
export class PhotoApprovalModule {}
