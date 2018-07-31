import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  NeckLabelPhotoComponent
} from './neck-label-photo.component';

import {
  NeckLabelPhotoService
} from './neck-label-photo.service';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  MomentModule
} from 'angular2-moment';

// Modules
import {
  NgSelectModule
} from '@ng-select/ng-select';
import {
  LeadEtaModule
} from '../+shared';

@NgModule({
  declarations: [
    NeckLabelPhotoComponent
  ],
  entryComponents: [
    NeckLabelPhotoComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    NeckLabelPhotoComponent
  ],
  providers: [
    NeckLabelPhotoService
  ]
})
export class NeckLabelPhotoModule {}
