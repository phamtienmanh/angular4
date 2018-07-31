import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  StylesMainComponent
} from './styles-main.component';

import {
  routes
} from './styles-main.routes';

// 3rd modules
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';
import {
  MomentModule
} from 'angular2-moment';

// Modules
import {
  PaginationControlModule
} from '../../../../shared/modules/pagination-control';

// Services
import {
  ExtendedHttpService
} from '../../../../shared/services/http';
import {
  StylesMainService
} from './styles-main.service';

@NgModule({
  declarations: [
    StylesMainComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    PaginationControlModule,
    NgxDatatableModule,
    MomentModule
  ],
  providers: [
    ExtendedHttpService,
    StylesMainService
  ]
})
export class StylesMainModule {
}
