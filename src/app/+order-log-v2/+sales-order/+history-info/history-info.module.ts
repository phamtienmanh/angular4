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
} from './history-info.routes';

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
  HistoryInfoComponent
} from './history-info.component';

// Services
import {
  HistoryInfoService
} from './history-info.service';
import {
  ExtendedHttpService
} from '../../../shared/services/http';
import {
  ValidationService
} from '../../../shared/services/validation';

@NgModule({
  declarations: [
    HistoryInfoComponent
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
    HistoryInfoService,
    ValidationService
  ]
})
export class HistoryInfoModule {}
