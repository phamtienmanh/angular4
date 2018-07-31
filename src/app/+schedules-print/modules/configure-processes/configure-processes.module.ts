import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../shared/common';

import {
  ConfigureProcessesComponent
} from './configure-processes.component';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';

// Modules
import {
  MomentModule
} from 'angular2-moment';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Services
import {
  ConfigureProcessesService
} from './configure-processes.service';

@NgModule({
  declarations: [
    ConfigureProcessesComponent
  ],
  entryComponents: [
    ConfigureProcessesComponent
  ],
  imports: [
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    MomentModule
  ],
  exports: [
    ConfigureProcessesComponent
  ],
  providers: [ConfigureProcessesService]
})
export class ConfigureProcessesModule {}
