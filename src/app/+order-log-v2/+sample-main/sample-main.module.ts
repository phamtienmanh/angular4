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
  SampleMainComponent
} from './sample-main.component';

import {
  routes
} from './sample-main.routes';

// Components
import {
  SampleMainFilterComponent
} from './components';

// 3rd modules
import {
  MomentModule
} from 'angular2-moment';
import {
  ClickOutsideModule
} from 'ng-click-outside';
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import { ContextMenuModule } from 'ngx-contextmenu';
import {
  PaginationControlModule
} from '../../shared/modules/pagination-control';
import {
  ImgZoomClickModule
} from '../../shared/modules/img-zoom-click';
import {
  PermissionModule
} from '../../shared/modules/permission';
import {
  NoEmptyModule
} from '../../shared/modules/no-empty';
import {
  FitContentModule
} from '../../shared/directives/fit-content';
import { ConfirmDialogModule } from '../../shared/modules/confirm-dialog/confirm-dialog.module';

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
  SampleMainService
} from './sample-main.service';
import {
  EditUserService
} from '../../+user-management/+edit-user/edit-user.service';
import {
  LocationDetailService
} from '../+sales-order/+order-styles/+styles-info/+print-location/+location-detail';
import {
  StyleService
} from '../+sales-order/+order-styles/+styles-info/+style/style.service';
import { SampleMainAuth } from './sample-main.auth';

@NgModule({
  declarations: [
    SampleMainComponent,
    SampleMainFilterComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    PaginationControlModule,
    ClickOutsideModule,
    ImgZoomClickModule,
    NgSelectModule,
    MyDatePickerModule,
    MomentModule,
    PermissionModule,
    NoEmptyModule,
    FitContentModule,
    ConfirmDialogModule,
    ContextMenuModule.forRoot({
      autoFocus: true,
      useBootstrap4: true
    })
  ],
  providers: [
    ExtendedHttpService,
    CommonService,
    ValidationService,
    SampleMainService,
    EditUserService,
    StyleService,
    LocationDetailService,
    SampleMainAuth
  ],
  entryComponents: []
})
export class SampleMainModule {
}
