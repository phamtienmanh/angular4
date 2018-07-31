import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../shared/common';

import {
  routes
} from './settings.routes';

// Components
import {
  SettingsComponent
} from './settings.component';
import {
  LookupTableComponent
} from './lookup-table';
import {
  CreateOrUpdateLookupTableComponent
} from './lookup-table/create-or-update-lookup-table';
import {
  ConfirmDialogModule
} from '../shared/modules/confirm-dialog';
import {
  CustomerServiceComponent
} from './customer-service';
import {
  CreateOrUpdateCstComponent
} from './customer-service/create-or-update-cst';
import {
  ScheduledTaskComponent
} from './scheduled-task';
import {
  CreateOrUpdateScdtComponent
} from './scheduled-task/create-or-update-scdt';
import {
  ProcessesComponent
} from './processes/processes.component';
import {
  CreateOrUpdateProcessComponent
} from './processes/create-or-update-process/create-or-update-process.component';

// 3rd modules
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  InlineEditorModule
} from '@qontu/ngx-inline-editor';
import {
  TagInputModule
} from 'ngx-chips';
import {
  MomentModule
} from 'angular2-moment';
import {
  ClickOutsideModule
} from 'ng-click-outside';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  InputDebounceModule
} from '../shared/modules/input-debounce';
import {
  PaginationControlModule
} from '../shared/modules/pagination-control';
import {
  FocusOnInitModule
} from '../shared/modules/focus-on-init';

// Services
import {
  SettingsService
} from './settings.service';
import {
  ExtendedHttpService
} from '../shared/services/http';
import {
  CommonService
} from '../shared/services/common';
import {
  ValidationService
} from '../shared/services/validation';
import {
  SettingsAuth
} from './settings.auth';

@NgModule({
  declarations: [
    SettingsComponent,
    LookupTableComponent,
    CustomerServiceComponent,
    CreateOrUpdateLookupTableComponent,
    CreateOrUpdateCstComponent,
    ScheduledTaskComponent,
    CreateOrUpdateScdtComponent,
    ProcessesComponent,
    CreateOrUpdateProcessComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    PaginationControlModule,
    InputDebounceModule,
    MyDatePickerModule,
    NgxDatatableModule,
    NgSelectModule,
    ConfirmDialogModule,
    InlineEditorModule,
    TagInputModule,
    InlineEditorModule,
    FocusOnInitModule,
    MomentModule,
    ClickOutsideModule
  ],
  exports: [],
  entryComponents: [
    CreateOrUpdateLookupTableComponent,
    CreateOrUpdateCstComponent,
    CreateOrUpdateScdtComponent,
    CreateOrUpdateProcessComponent
  ],
  providers: [
    BreadcrumbService,
    ExtendedHttpService,
    SettingsService,
    CommonService,
    ValidationService,
    SettingsAuth
  ]
})
export class SettingsModule {
}
