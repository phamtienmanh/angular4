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
  ProjectMainComponent
} from './project-main.component';

import {
  routes
} from './project-main.routes';

import {
  ProjectMainAuth
} from './project-main.auth';

// Components
import {
  ProjectMainFilterComponent
} from './components/project-main-filter/project-main-filter.component';

// 3rd modules
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';
import {
  ClickOutsideModule
} from 'ng-click-outside';
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  MomentModule
} from 'angular2-moment';
import { NgSelectModule } from '@ng-select/ng-select';

// Modules
import {
  PaginationControlModule
} from '../../shared/modules/pagination-control';
import {
  PermissionModule
} from '../../shared/modules/permission';
import {
  ConfirmDialogModule
} from '../../shared/modules/confirm-dialog';

// Services
import {
  ExtendedHttpService
} from '../../shared/services/http';
import {
  CommonService
} from '../../shared/services/common';
import {
  ValidationService
} from '../../shared/services/validation';
import {
  ProjectMainService
} from './project-main.service';

@NgModule({
  declarations: [
    ProjectMainComponent,
    ProjectMainFilterComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    PaginationControlModule,
    NgxDatatableModule,
    ClickOutsideModule,
    NgSelectModule,
    MyDatePickerModule,
    MomentModule,
    PermissionModule,
    ConfirmDialogModule
  ],
  providers: [
    ProjectMainAuth,
    ExtendedHttpService,
    CommonService,
    ValidationService,
    ProjectMainService
  ]
})
export class ProjectMainModule {
}
