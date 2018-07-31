import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  TechDesignComponent
} from './tech-design.component';

import {
  TechDesignService
} from './tech-design.service';

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
    TechDesignComponent
  ],
  entryComponents: [
    TechDesignComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule,
    LeadEtaModule
  ],
  exports: [
    TechDesignComponent
  ],
  providers: [
    TechDesignService
  ]
})
export class TechDesignModule {}
