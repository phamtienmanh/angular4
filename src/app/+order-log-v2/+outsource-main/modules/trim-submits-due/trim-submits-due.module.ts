import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  TrimSubmitsDueComponent
} from './trim-submits-due.component';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  FileUploadModule
} from 'ng2-file-upload';
import {
  MomentModule
} from 'angular2-moment';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  UploaderTypeModule
} from '../../../../shared/modules/uploader-type';
import {
  LeadEtaModule
} from '../+shared';

// Services
import {
  TrimSubmitsDueService
} from './trim-submits-due.service';
import {
  TrimsInfoDetailService
} from '../../../+sales-order/+order-styles/+styles-info/+trims/+trims-detail';

@NgModule({
  declarations: [
    TrimSubmitsDueComponent
  ],
  entryComponents: [
    TrimSubmitsDueComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    FileUploadModule,
    UploaderTypeModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    TrimSubmitsDueComponent
  ],
  providers: [
    TrimSubmitsDueService,
    TrimsInfoDetailService
  ]
})
export class TrimSubmitsDueModule {}
