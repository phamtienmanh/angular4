import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  routes
} from './pp-sample.routes';

// 3rd modules
import {
  MomentModule
} from 'angular2-moment';
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  NgSelectModule
} from '@ng-select/ng-select';
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';

// Modules
import {
  SharedCommonModule
} from '../../../../../../shared/common';
import {
  UploaderTypeModule
} from '../../../../../../shared/modules/uploader-type';

// Components
import {
  PpSampleComponent
} from './pp-sample.component';

// Services
import {
  ExtendedHttpService,
  ValidationService
} from '../../../../../../shared/services';
import {
  PpSampleDeactive
} from './pp-sample.deactive';
import {
  PpSampleService
} from './pp-sample.service';

@NgModule({
  declarations: [
    PpSampleComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    MomentModule,
    MyDatePickerModule,
    NgSelectModule,
    NgxDatatableModule,
    UploaderTypeModule
  ],
  exports: [],
  providers: [
    ExtendedHttpService,
    PpSampleService,
    ValidationService,
    PpSampleDeactive
  ]
})
export class PpSampleModule {}
