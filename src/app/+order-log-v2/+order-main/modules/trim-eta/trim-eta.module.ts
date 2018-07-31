import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  TrimEtaComponent
} from './trim-eta.component';

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

// Services
import {
  TrimEtaService
} from './trim-eta.service';
import {
  TrimsInfoDetailService
} from '../../../+sales-order/+order-styles/+styles-info/+trims/+trims-detail/trims-detail.service';

@NgModule({
  declarations: [
    TrimEtaComponent
  ],
  entryComponents: [
    TrimEtaComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    FileUploadModule,
    UploaderTypeModule,
    MomentModule
  ],
  exports: [
    TrimEtaComponent
  ],
  providers: [
    TrimEtaService,
    TrimsInfoDetailService
  ]
})
export class TrimEtaModule {}
