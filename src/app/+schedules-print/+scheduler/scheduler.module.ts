import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../shared/common';

import {
  routes
} from './scheduler.routes';

// 3rd modules
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';
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
  ClickOutsideModule
} from 'ng-click-outside';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  InputDebounceModule
} from '../../shared/modules/input-debounce';
import {
  PaginationControlModule
} from '../../shared/modules/pagination-control';
import {
  PermissionModule
} from '../../shared/modules/permission';
import {
  ConfirmDialogModule
} from '../../shared/modules/confirm-dialog';
import {
  MomentModule
} from 'angular2-moment';
import {
  ConfigTscScheduledModule,
  ConfigFinishingProcessesModule
} from '../modules';
import {
  RuntimeModule
} from '../modules/runtime';
import {
  ConfigureProcessesModule
} from '../modules/configure-processes';

// Components
import {
  SchedulerComponent
} from './scheduler.component';

// Services
import {
  SchedulerService
} from './scheduler.service';
import {
  OrderMainService
} from '../../+order-log-v2/+order-main/order-main.service';

// Pipe
import {
  SharedPipeModule
} from '../../shared/pipes';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    NgxDatatableModule,
    InputDebounceModule,
    PaginationControlModule,
    FileUploadModule,
    PermissionModule,
    ConfirmDialogModule,
    MyDatePickerModule,
    MomentModule,
    DragulaModule,
    NgSelectModule,
    ClickOutsideModule,
    ConfigTscScheduledModule,
    RuntimeModule,
    ConfigureProcessesModule,
    SharedPipeModule,
    ConfigFinishingProcessesModule
  ],
  declarations: [
    SchedulerComponent
  ],
  exports: [],
  providers: [SchedulerService, OrderMainService]
})
export class SchedulerModule {
}
