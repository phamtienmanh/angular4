import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  ArtReleasedComponent
} from './art-released.component';

import {
  ArtReleasedService
} from './art-released.service';

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
    ArtReleasedComponent
  ],
  entryComponents: [
    ArtReleasedComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    ArtReleasedComponent
  ],
  providers: [
    ArtReleasedService
  ]
})
export class ArtReleasedModule {}
