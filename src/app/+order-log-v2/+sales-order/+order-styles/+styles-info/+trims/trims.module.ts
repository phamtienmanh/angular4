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
} from './trims.routes';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  FileUploadModule
} from 'ng2-file-upload';

// Modules
import {
  ConfirmDialogModule
} from '../../../../../shared/modules/confirm-dialog';
import {
  SelectTrimsModule
} from './modules';

// Components
import {
  TrimsComponent
} from './trims.component';

// Services
import {
  TrimsService
} from './trims.service';
import {
  ExtendedHttpService
} from '../../../../../shared/services/http';
import {
  ValidationService
} from '../../../../../shared/services/validation';

@NgModule({
  declarations: [
    TrimsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    MyDatePickerModule,
    FileUploadModule,
    SelectTrimsModule,
    ConfirmDialogModule
  ],
  exports: [],
  providers: [
    ExtendedHttpService,
    TrimsService,
    ValidationService
  ]
})
export class TrimsModule {}
