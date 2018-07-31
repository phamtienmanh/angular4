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
} from './samples-main.routes';

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
  CompletePrintJobModule
} from '../../modules';
import {
  UploaderTypeModule
} from '../../../shared/modules/uploader-type';
import {
  SampleJobModule
} from '../../modules';

// Components
import {
  SamplesMainComponent
} from './samples-main.component';
import {
  ChangeBinidComponent
} from '../components/change-binid/change-binid.component';

// Services
import {
  SamplesMainService
} from './samples-main.service';
import {
  OrderMainService
} from '../../../+order-log-v2/+order-main/order-main.service';
import {
  SampleJobService
} from '../../modules/sample-job/sample-job.servive';
import {
  EditUserService
} from '../../../+user-management/+edit-user/edit-user.service';
import {
  SampleService
} from '../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+samples/sample.service';

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
    ClickOutsideModule,
    CompletePrintJobModule,
    UploaderTypeModule,
    SampleJobModule,
    NgSelectModule
  ],
  declarations: [
    SamplesMainComponent,
    ChangeBinidComponent
  ],
  entryComponents: [
    ChangeBinidComponent
  ],
  exports: [],
  providers: [
    SamplesMainService,
    OrderMainService,
    SampleJobService,
    EditUserService,
    SampleService
  ]
})
export class SamplesMainModule {
}
