import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  routes
} from './fit-sample.routes';

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
  FitSampleComponent
} from './fit-sample.component';

// Services
import {
  ExtendedHttpService,
  ValidationService
} from '../../../../../../shared/services';
import {
  FitSampleDeactive
} from './fit-sample.deactive';
import {
  FitSampleService
} from './fit-sample.service';

@NgModule({
  declarations: [
    FitSampleComponent
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
    FitSampleService,
    ValidationService,
    FitSampleDeactive
  ]
})
export class FitSampleModule {}
