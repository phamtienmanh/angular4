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
} from './outsource-print-main.routes';

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
  CompletePrintJobModule,
  AddCommentModule
} from '../modules';
import {
  UploaderTypeModule
} from '../../shared/modules/uploader-type';
import {
  JobsHistoryModule
} from '../modules/jobs-history';
import {
  RuntimeModule
} from '../modules/runtime';
// Components
import {
  OutsourcePrintMainComponent
} from './outsource-print-main.component';

// Services
import {
  OutsourcePrintMainService
} from './outsource-print-main.service';
import {
  PrintMainService
} from '../+tsc-print/+print-main/print-main.service';
import {
  EditUserService
} from '../../+user-management/+edit-user/edit-user.service';
import {
  SchedulerService
} from '../+scheduler/scheduler.service';

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
    NgSelectModule,
    MyDatePickerModule,
    MomentModule,
    DragulaModule,
    CompletePrintJobModule,
    UploaderTypeModule,
    ClickOutsideModule,
    JobsHistoryModule,
    AddCommentModule,
    RuntimeModule
  ],
  declarations: [
    OutsourcePrintMainComponent
  ],
  exports: [],
  entryComponents: [],
  providers: [
    OutsourcePrintMainService,
    PrintMainService,
    EditUserService,
    SchedulerService
  ]
})
export class OutsourcePrintMainModule {
}
