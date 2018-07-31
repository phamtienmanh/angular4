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
} from './location-detail.routes';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  TagInputModule
} from 'ngx-chips';
import {
  FileUploadModule
} from 'ng2-file-upload';
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';
import {
  MomentModule
} from 'angular2-moment';
import {
  DragulaModule
} from 'ng2-dragula';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  ImgZoomClickModule
} from '../../../../../../shared/modules/img-zoom-click';
import {
  FocusOnInitModule
} from '../../../../../../shared/modules/focus-on-init';
import {
  UploadModule
} from '../modules';

// Components
import {
  LocationDetailComponent
} from './location-detail.component';

// Services
import {
  LocationDetailService
} from './location-detail.service';
import {
  ExtendedHttpService
} from '../../../../../../shared/services/http';
import {
  ValidationService
} from '../../../../../../shared/services/validation';
import {
  LocationDetailDeactive
} from './location-detail.deactive';

@NgModule({
  declarations: [
    LocationDetailComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    MyDatePickerModule,
    ImgZoomClickModule,
    TagInputModule,
    FileUploadModule,
    NgxDatatableModule,
    FocusOnInitModule,
    UploadModule,
    MomentModule,
    DragulaModule,
    NgSelectModule
  ],
  exports: [],
  providers: [
    ExtendedHttpService,
    LocationDetailService,
    ValidationService,
    LocationDetailDeactive
  ]
})
export class LocationDetailModule {}
