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
} from './project-history.routes';

// 3rd modules
import {
  MomentModule
} from 'angular2-moment';
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';

// Modules
import {
  PaginationControlModule
} from '../../../shared/modules/pagination-control';

// Components
import {
  ProjectHistoryComponent
} from './project-history.component';

// Services
import {
  ProjectHistoryService
} from './project-history.service';
import {
  ExtendedHttpService
} from '../../../shared/services/http';
import {
  ValidationService
} from '../../../shared/services/validation';

@NgModule({
  declarations: [
    ProjectHistoryComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    MomentModule,
    NgxDatatableModule,
    PaginationControlModule
  ],
  exports: [],
  providers: [
    ExtendedHttpService,
    ProjectHistoryService,
    ValidationService
  ]
})
export class ProjectHistoryModule {}
