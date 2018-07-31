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
} from './print-main.routes';

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
  NgSelectModule
} from '@ng-select/ng-select';

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
  CompletePrintJobModule,
  AddCommentModule,
  TeamConfigModule
} from '../../modules';
import {
  UploaderTypeModule
} from '../../../shared/modules/uploader-type';
import {
  ClickOutsideModule
} from 'ng-click-outside';
import {
  JobsHistoryModule
} from '../../modules/jobs-history';
import {
  RuntimeModule
} from '../../modules/runtime';

// Components
import {
  PrintMainComponent
} from './print-main.component';

// Services
import {
  PrintMainService
} from './print-main.service';
import {
  SchedulerService
} from '../../+scheduler/scheduler.service';
import {
  EditUserService
} from '../../../+user-management/+edit-user/edit-user.service';

// Pipe
import {
  SharedPipeModule
} from '../../../shared/pipes';

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
    CompletePrintJobModule,
    UploaderTypeModule,
    ClickOutsideModule,
    JobsHistoryModule,
    AddCommentModule,
    TeamConfigModule,
    NgSelectModule,
    RuntimeModule,
    SharedPipeModule
  ],
  declarations: [
    PrintMainComponent
  ],
  exports: [],
  entryComponents: [],
  providers: [
    PrintMainService,
    SchedulerService,
    EditUserService
  ]
})
export class PrintMainModule {
}
