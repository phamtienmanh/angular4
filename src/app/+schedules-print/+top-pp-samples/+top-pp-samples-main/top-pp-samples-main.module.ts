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
} from './top-pp-samples-main.routes';

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
  UploaderTypeModule
} from '../../../shared/modules/uploader-type';
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
  QaChangeStatusModule,
  AccountManagerModule,
  ShipDateModule
} from './modules';
import {
  LabelStatusModule
} from '../../../+order-log-v2/+order-main/components';

// Components
import {
  TopPpSamplesMainComponent
} from './top-pp-samples-main.component';
import {
  TopPpSamplesFilterComponent
} from './components';

// Services
import {
  TopPpSamplesMainService
} from './top-pp-samples-main.service';
import {
  EditUserService
} from '../../../+user-management/+edit-user/edit-user.service';
import {
  StyleService
} from '../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+style/style.service';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    NgxDatatableModule,
    UploaderTypeModule,
    PaginationControlModule,
    PermissionModule,
    MyDatePickerModule,
    MomentModule,
    NgSelectModule,
    ClickOutsideModule,
    QaChangeStatusModule,
    AccountManagerModule,
    ShipDateModule,
    LabelStatusModule
  ],
  declarations: [
    TopPpSamplesMainComponent,
    TopPpSamplesFilterComponent
  ],
  exports: [],
  providers: [
    StyleService,
    TopPpSamplesMainService,
    EditUserService
  ]
})
export class TopPpSamplesMainModule {
}
