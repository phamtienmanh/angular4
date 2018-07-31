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
} from './pending-samples-main.routes';

// 3rd modules
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  ClickOutsideModule
} from 'ng-click-outside';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  PaginationControlModule
} from '../../../shared/modules/pagination-control';
import {
  PermissionModule
} from '../../../shared/modules/permission';
import {
  MomentModule
} from 'angular2-moment';
import {
  StatusModule,
  SampleDateModule,
  PrintApprovalModule,
  SelectFactoryModule,
  SelectContentModule
} from './modules';

// Components
import {
  PendingSamplesMainComponent
} from './pending-samples-main.component';
import {
  PendingSamplesFilterComponent
} from './components';

// Services
import {
  PendingSamplesMainService
} from './pending-samples-main.service';
import {
  EditUserService
} from '../../../+user-management/+edit-user/edit-user.service';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    NgxDatatableModule,
    PaginationControlModule,
    PermissionModule,
    MyDatePickerModule,
    MomentModule,
    ClickOutsideModule,
    StatusModule,
    SampleDateModule,
    PrintApprovalModule,
    SelectFactoryModule,
    NgSelectModule,
    SelectContentModule
  ],
  declarations: [
    PendingSamplesMainComponent,
    PendingSamplesFilterComponent
  ],
  exports: [],
  providers: [
    PendingSamplesMainService,
    EditUserService
  ]
})
export class PendingSamplesMainModule {
}
