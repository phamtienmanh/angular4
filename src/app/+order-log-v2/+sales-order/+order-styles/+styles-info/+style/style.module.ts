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
} from './style.routes';

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
} from '../../../../../shared/modules/uploader-type';
import {
  FocusOnInitModule
} from '../../../../../shared/modules/focus-on-init';
import {
  AddSizesModule
} from './add-sizes-modal';
import {
  ConfirmReorderModule
} from './confirm-reorder-modal';

// Components
import {
  StyleComponent
} from './style.component';
import {
  ConfirmDialogModule
} from '../../../../../shared/modules/confirm-dialog';

// Services
import {
  StyleService
} from './style.service';
import {
  ExtendedHttpService
} from '../../../../../shared/services/http';
import {
  ValidationService
} from '../../../../../shared/services/validation';
import {
  StyleDeactive
} from './style.deactive';

@NgModule({
  declarations: [
    StyleComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    ConfirmDialogModule,
    MyDatePickerModule,
    UploaderTypeModule,
    TagInputModule,
    FocusOnInitModule,
    FileUploadModule,
    AddSizesModule,
    ConfirmReorderModule,
    NgSelectModule
  ],
  exports: [],
  providers: [
    ExtendedHttpService,
    StyleService,
    ValidationService,
    StyleDeactive
  ]
})
export class StyleModule {}
