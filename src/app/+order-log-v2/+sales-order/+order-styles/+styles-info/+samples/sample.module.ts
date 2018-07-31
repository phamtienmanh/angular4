import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  routes
} from './sample.routes';
import {
  MomentModule
} from 'angular2-moment';

// 3rd modules
import {
  FileUploadModule
} from 'ng2-file-upload';
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  DragulaModule
} from 'ng2-dragula';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  UploadModule
} from '../+print-location/modules/upload/upload.module';
import {
  JobChangeModule
} from './job-change';
import {
  SampleDeactive
} from './sample.deactive';

// Components
import {
  SampleComponent
} from './sample.component';

// Services
import {
  SampleService
} from './sample.service';
import {
  ExtendedHttpService
} from '../../../../../shared/services/http';
import {
  ValidationService
} from '../../../../../shared/services/validation';

@NgModule({
  declarations: [
    SampleComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    FileUploadModule,
    UploadModule,
    MomentModule,
    JobChangeModule,
    DragulaModule
  ],
  exports: [],
  providers: [
    ExtendedHttpService,
    SampleService,
    ValidationService,
    SampleDeactive
  ]
})
export class SampleModule {}
