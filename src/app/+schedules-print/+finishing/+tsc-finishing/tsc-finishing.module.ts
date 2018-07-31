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
} from './tsc-finishing.routes';

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
  ConfigFinishingProcessesModule
} from '../../modules';
import {
  UploaderTypeModule
} from '../../../shared/modules/uploader-type';
import {
  JobsHistoryModule
} from '../../modules/jobs-history';

// Components
import {
  TscFinishingComponent
} from './tsc-finishing.component';

// Services
import {
  TscFinishingService
} from './tsc-finishing.service';
import {
  EditUserService
} from '../../../+user-management/+edit-user/edit-user.service';
import {
  SchedulerService
} from '../../+scheduler/scheduler.service';

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
    NgSelectModule,
    AddCommentModule,
    ConfigFinishingProcessesModule,
    SharedPipeModule
  ],
  declarations: [
    TscFinishingComponent
  ],
  exports: [],
  entryComponents: [],
  providers: [
    TscFinishingService,
    EditUserService,
    SchedulerService
  ]
})
export class TscFinishingModule {
}
