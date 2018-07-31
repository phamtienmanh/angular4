import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../../../../../shared/common';

import {
  routes
} from './art-files.routes';

// 3rd modules
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';
import {
  MomentModule
} from 'angular2-moment';

// Modules
import {
  ImgZoomClickModule
} from '../../../../../../shared/modules/img-zoom-click';
import {
  ConfirmDialogModule
} from '../../../../../../shared/modules/confirm-dialog';
import {
  UploadModule
} from '../modules';

// Components
import {
  ArtFilesComponent
} from './art-files.component';

// Services
import {
  ArtFilesService
} from './art-files.service';
import {
  ExtendedHttpService
} from '../../../../../../shared/services/http';
import {
  ValidationService
} from '../../../../../../shared/services/validation';

@NgModule({
  declarations: [
    ArtFilesComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    ImgZoomClickModule,
    NgxDatatableModule,
    ConfirmDialogModule,
    UploadModule,
    MomentModule
  ],
  exports: [],
  providers: [
    ExtendedHttpService,
    ArtFilesService,
    ValidationService
  ]
})
export class ArtFilesModule {}
