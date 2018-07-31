import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../../shared/common';

import {
  routes
} from './order-info.routes';

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
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  UploaderTypeModule
} from '../../../shared/modules/uploader-type';

// Components
import {
  OrderInfoComponent
} from './order-info.component';
import {
  ConfirmDialogModule
} from '../../../shared/modules/confirm-dialog';

// Services
import {
  OrderInfoService
} from './order-info.service';
import {
  ExtendedHttpService
} from '../../../shared/services/http';
import {
  ValidationService
} from '../../../shared/services/validation';
import {
  OrderInfoDeactive
} from './order-info.deactive';

@NgModule({
  declarations: [
    OrderInfoComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    ConfirmDialogModule,
    MyDatePickerModule,
    TagInputModule,
    FileUploadModule,
    NgSelectModule,
    UploaderTypeModule
  ],
  exports: [],
  providers: [
    ExtendedHttpService,
    OrderInfoService,
    ValidationService,
    OrderInfoDeactive
  ]
})
export class OrderInfoModule {}
