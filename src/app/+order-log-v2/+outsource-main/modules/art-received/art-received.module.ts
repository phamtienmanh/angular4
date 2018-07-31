import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  ArtReceivedComponent
} from './art-received.component';

import {
  ArtReceivedService
} from './art-received.service';

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
    ArtReceivedComponent
  ],
  entryComponents: [
    ArtReceivedComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    ArtReceivedComponent
  ],
  providers: [
    ArtReceivedService
  ]
})
export class ArtReceivedModule {}
