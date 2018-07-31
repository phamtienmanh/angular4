import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  routes
} from './reports.routes';

// 3rd modules
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  MomentModule
} from 'angular2-moment';
import {
  TagInputModule
} from 'ngx-chips';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  PaginationControlModule
} from '../shared/modules/pagination-control';
import {
  SharedCommonModule
} from '../shared/common';

// Services
import {
  ReportsService
} from './reports.service';
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
  ReportsAuth
} from './reports.auth';

// Components
import {
  ReportsComponent
} from './reports.component';
import {
  EditReportComponent
} from './components';
import { EditScheduleComponent } from './components/edit-schedule/edit-schedule.component';

@NgModule({
  declarations: [
    ReportsComponent,
    EditReportComponent,
    EditScheduleComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    PaginationControlModule,
    MyDatePickerModule,
    NgxDatatableModule,
    MomentModule,
    TagInputModule,
    NgSelectModule
  ],
  providers: [
    ExtendedHttpService,
    ReportsService,
    CommonService,
    ValidationService,
    ReportsAuth
  ],
  entryComponents: [
    EditReportComponent,
    EditScheduleComponent
  ]
})
export class ReportsModule {
}
