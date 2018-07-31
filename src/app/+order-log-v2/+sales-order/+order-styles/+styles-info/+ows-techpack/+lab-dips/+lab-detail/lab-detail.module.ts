import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  routes
} from './lab-detail.routes';

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
} from '../../../../../../../shared/common';
import {
  UploaderTypeModule
} from '../../../../../../../shared/modules/uploader-type';

// Components
import {
  LabDetailComponent
} from './lab-detail.component';

// Services
import {
  ExtendedHttpService,
  ValidationService
} from '../../../../../../../shared/services';
import {
  LabDetailDeactive
} from './lab-detail.deactive';
import {
  LabDetailService
} from './lab-detail.service';

@NgModule({
  declarations: [
    LabDetailComponent
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
    LabDetailService,
    ValidationService,
    LabDetailDeactive
  ]
})
export class LabDetailModule {}
