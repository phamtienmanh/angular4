import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  ArtRequestedComponent
} from './art-requested.component';

import {
  ArtRequestedService
} from './art-requested.service';

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
    ArtRequestedComponent
  ],
  entryComponents: [
    ArtRequestedComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    ArtRequestedComponent
  ],
  providers: [
    ArtRequestedService
  ]
})
export class ArtRequestedModule {}
