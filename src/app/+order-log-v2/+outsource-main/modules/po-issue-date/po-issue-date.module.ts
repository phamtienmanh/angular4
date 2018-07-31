import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  PoIssueDateComponent
} from './po-issue-date.component';

import {
  PoIssueDateService
} from './po-issue-date.service';

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
    PoIssueDateComponent
  ],
  entryComponents: [
    PoIssueDateComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    PoIssueDateComponent
  ],
  providers: [
    PoIssueDateService
  ]
})
export class PoIssueDateModule {}
