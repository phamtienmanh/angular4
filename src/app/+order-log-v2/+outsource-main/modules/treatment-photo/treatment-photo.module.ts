import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  TreatmentPhotoComponent
} from './treatment-photo.component';

import {
  TreatmentPhotoService
} from './treatment-photo.service';

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
    TreatmentPhotoComponent
  ],
  entryComponents: [
    TreatmentPhotoComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    TreatmentPhotoComponent
  ],
  providers: [
    TreatmentPhotoService
  ]
})
export class TreatmentPhotoModule {}
