import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../../../../../shared/common';

import {
  routes
} from './label-detail.routes';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  FileUploadModule
} from 'ng2-file-upload';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  ImgZoomClickModule
} from '../../../../../../shared/modules/img-zoom-click';
import {
  UploadModule
} from '../modules';

// Components
import {
  LabelDetailComponent
} from './label-detail.component';

// Services
import {
  LabelDetailService
} from './label-detail.service';
import {
  LocationDetailService
} from '../+location-detail';
import {
  ExtendedHttpService
} from '../../../../../../shared/services/http';
import {
  ValidationService
} from '../../../../../../shared/services/validation';
import {
  LabelDetailDeactive
} from './label-detail.deactive';

@NgModule({
  declarations: [
    LabelDetailComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    MyDatePickerModule,
    ImgZoomClickModule,
    FileUploadModule,
    NgSelectModule,
    UploadModule
  ],
  exports: [],
  providers: [
    ExtendedHttpService,
    LabelDetailService,
    LocationDetailService,
    ValidationService,
    LabelDetailDeactive
  ]
})
export class LabelDetailModule {}
