import {
  NgModule
} from '@angular/core';
import {
  MomentModule
} from 'angular2-moment';
import {
  SharedCommonModule
} from '../../../shared/common';

import {
  UploaderTypeComponent
} from './uploader-type.component';

// 3rd modules
import {
  FileUploadModule
} from 'ng2-file-upload';

// Modules
import {
  ImgZoomClickModule
} from '../../../shared/modules/img-zoom-click';

// Directives
import {
  ImgPreviewModule
} from '../../../shared/directives/img-preview';

@NgModule({
  declarations: [
    UploaderTypeComponent
  ],
  entryComponents: [
    UploaderTypeComponent
  ],
  imports: [
    SharedCommonModule,
    FileUploadModule,
    ImgZoomClickModule,
    MomentModule,
    ImgPreviewModule
  ],
  exports: [
    UploaderTypeComponent
  ]
})
export class UploaderTypeModule {}
