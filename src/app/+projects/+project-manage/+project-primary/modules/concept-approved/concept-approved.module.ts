import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  ConceptApprovedComponent
} from './concept-approved.component';

import {
  ConceptApprovedService
} from './concept-approved.service';

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
    ConceptApprovedComponent
  ],
  entryComponents: [
    ConceptApprovedComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    ConceptApprovedComponent
  ],
  providers: [
    ConceptApprovedService
  ]
})
export class ConceptApprovedModule {}
