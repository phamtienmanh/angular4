import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../../../shared/common';

import {
  UploadComponent
} from './upload.component';
import {
  MomentModule
} from 'angular2-moment';

// 3rd modules
import {
  FileUploadModule
} from 'ng2-file-upload';
import {
  SelectModule
} from 'ng2-select';

// Modules
import {
  ImgZoomClickModule
} from '../../../../../../../shared/modules/img-zoom-click';

// Services
import {
  UploadService
} from './upload.service';

// Directives
import {
  ImgPreviewModule
} from '../../../../../../../shared/directives/img-preview';

@NgModule({
  declarations: [
    UploadComponent
  ],
  entryComponents: [
    UploadComponent
  ],
  imports: [
    SharedCommonModule,
    FileUploadModule,
    ImgZoomClickModule,
    SelectModule,
    MomentModule,
    ImgPreviewModule
  ],
  exports: [
    UploadComponent
  ],
  providers: [
    UploadService
  ]
})
export class UploadModule {}
