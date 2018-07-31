import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  PackagingApprovedComponent
} from './packaging-approved.component';

import {
  PackagingApprovedService
} from './packaging-approved.service';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  MomentModule
} from 'angular2-moment';
import {
  FileUploadModule
} from 'ng2-file-upload';

// Modules
import {
  NgSelectModule
} from '@ng-select/ng-select';
import {
  LeadEtaModule
} from '../index';
import {
  ImgZoomClickModule
} from '../../../../../shared/modules/img-zoom-click';
import {
  SelectPackagingModule
} from './modules';
import {
  ConfirmDialogModule
} from '../../../../../shared/modules/confirm-dialog';

// Pipes
import {
  FormSortByPipe
} from '../../../../../shared/pipes/formSortBy';

@NgModule({
  declarations: [
    PackagingApprovedComponent,
    FormSortByPipe
  ],
  entryComponents: [
    PackagingApprovedComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    FileUploadModule,
    ImgZoomClickModule,
    LeadEtaModule,
    SelectPackagingModule,
    ConfirmDialogModule
  ],
  exports: [
    PackagingApprovedComponent
  ],
  providers: [
    PackagingApprovedService
  ]
})
export class PackagingApprovedModule {}
