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
} from './trims-detail.routes';

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
  ConfirmDialogModule
} from '../../../../../../shared/modules/confirm-dialog';
import {
  UploaderTypeModule
} from '../../../../../../shared/modules/uploader-type';

// Components
import {
  TrimsDetailComponent
} from './trims-detail.component';

// Services
import {
  TrimsInfoDetailService
} from './trims-detail.service';
import {
  ExtendedHttpService
} from '../../../../../../shared/services/http';
import {
  ValidationService
} from '../../../../../../shared/services/validation';
import {
  TrimsDetailDeactive
} from './trims-detail.deactive';

@NgModule({
  declarations: [
    TrimsDetailComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    FileUploadModule,
    UploaderTypeModule,
    ConfirmDialogModule
  ],
  exports: [],
  providers: [
    ExtendedHttpService,
    TrimsInfoDetailService,
    ValidationService,
    TrimsDetailDeactive
  ]
})
export class TrimsDetailModule {}
