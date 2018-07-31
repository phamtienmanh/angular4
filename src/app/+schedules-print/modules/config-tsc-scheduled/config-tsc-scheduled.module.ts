import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../shared/common';

import {
  ConfigTscScheduledComponent
} from './config-tsc-scheduled.component';

// 3rd modules
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';
import {
  MyDatePickerModule
} from 'mydatepicker';

// Modules
import {
  InputDebounceModule
} from '../../../shared/modules/input-debounce';
import {
  PaginationControlModule
} from '../../../shared/modules/pagination-control';
import {
  PermissionModule
} from '../../../shared/modules/permission';
import {
  ConfirmDialogModule
} from '../../../shared/modules/confirm-dialog';
import {
  MomentModule
} from 'angular2-moment';
import {
  FocusOnInitModule
} from '../../../shared/modules/focus-on-init';

// Services
import {
  ConfigTscScheduledService
} from './config-tsc-scheduled.servive';

@NgModule({
  declarations: [
    ConfigTscScheduledComponent
  ],
  entryComponents: [
    ConfigTscScheduledComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgxDatatableModule,
    InputDebounceModule,
    PaginationControlModule,
    PermissionModule,
    ConfirmDialogModule,
    MomentModule,
    FocusOnInitModule
  ],
  exports: [
    ConfigTscScheduledComponent
  ],
  providers: [
    ConfigTscScheduledService
  ]
})
export class ConfigTscScheduledModule {}
