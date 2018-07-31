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
} from './neck-label-main.routes';

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
  AddCommentModule
} from '../../modules';
import {
  UploaderTypeModule
} from '../../../shared/modules/uploader-type';
import {
  JobsHistoryModule
} from '../../modules/jobs-history';

// Components
import {
  NeckLabelMainComponent
} from './neck-label-main.component';

// Services
import {
  NeckLabelMainService
} from './neck-label-main.service';
import {
  StyleService
} from '../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+style/style.service';
import {
  EditUserService
} from '../../../+user-management/+edit-user/edit-user.service';
import {
  PrintMainService
} from '../../+tsc-print/+print-main/print-main.service';
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
    NgSelectModule,
    MyDatePickerModule,
    MomentModule,
    DragulaModule,
    ClickOutsideModule,
    CompletePrintJobModule,
    UploaderTypeModule,
    JobsHistoryModule,
    AddCommentModule,
    SharedPipeModule
  ],
  declarations: [
    NeckLabelMainComponent
  ],
  exports: [],
  providers: [
    NeckLabelMainService,
    StyleService,
    EditUserService,
    PrintMainService,
    SchedulerService
  ]
})
export class NeckLabelMainModule {
}
