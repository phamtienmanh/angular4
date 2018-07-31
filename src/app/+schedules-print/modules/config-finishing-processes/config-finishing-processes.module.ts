import {
  NgModule
} from '@angular/core';

// 3rd modules

// Modules
import {
  SharedCommonModule
} from '../../../shared/common';

// Services
import {
  ConfigFinishingProcessesService
} from './config-finishing-processes.service';

// Components
import {
  ConfigFinishingProcessesComponent
} from './config-finishing-processes.component';

@NgModule({
  declarations: [
    ConfigFinishingProcessesComponent
  ],
  entryComponents: [
    ConfigFinishingProcessesComponent
  ],
  imports: [
    SharedCommonModule
  ],
  exports: [
    ConfigFinishingProcessesComponent
  ],
  providers: [ConfigFinishingProcessesService]
})
export class ConfigFinishingProcessesModule {}
