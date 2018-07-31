import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  LicensorSelectionComponent
} from './licensor-selection.component';

import {
  LicensorSelectionService
} from './licensor-selection.service';

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
} from '../index';

@NgModule({
  declarations: [
    LicensorSelectionComponent
  ],
  entryComponents: [
    LicensorSelectionComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    LicensorSelectionComponent
  ],
  providers: [
    LicensorSelectionService
  ]
})
export class LicensorSelectionModule {}
