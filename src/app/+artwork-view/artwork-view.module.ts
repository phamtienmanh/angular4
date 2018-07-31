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
  ArtworkViewComponent
} from './artwork-view.component';

import {
  ArtworkViewFilterComponent
} from './components';

import {
  routes
} from './artwork-view.routes';

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

// Modules
import {
  PaginationControlModule
} from '../shared/modules/pagination-control';

// Services
import {
  ArtworkViewService
} from './artwork-view.service';
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
  ArtworkViewAuth
} from './artwork-view.auth';

@NgModule({
  declarations: [
    ArtworkViewComponent,
    ArtworkViewFilterComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    PaginationControlModule,
    MyDatePickerModule,
    NgxDatatableModule,
    MomentModule
  ],
  providers: [
    ExtendedHttpService,
    ArtworkViewService,
    CommonService,
    ValidationService,
    ArtworkViewAuth
  ]
})
export class ArtworkViewModule {
}
