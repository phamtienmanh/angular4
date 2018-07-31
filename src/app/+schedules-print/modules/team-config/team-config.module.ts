import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../shared/common';

import {
  TeamConfigComponent
} from './team-config.component';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';

// Modules
import {
  NgSelectModule
} from '@ng-select/ng-select';

import {
  TeamConfigService
} from './team-config.service';

@NgModule({
  declarations: [
    TeamConfigComponent
  ],
  entryComponents: [
    TeamConfigComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule
  ],
  exports: [
    TeamConfigComponent
  ],
  providers: [TeamConfigService]
})
export class TeamConfigModule {}
