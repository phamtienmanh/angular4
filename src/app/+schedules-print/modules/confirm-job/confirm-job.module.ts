import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../shared/common';

import {
  ConfirmJobComponent
} from './confirm-job.component';

// 3rd modules
import {
  MomentModule
} from 'angular2-moment';

// Modules
import {
  FocusOnInitModule
} from '../../../shared/modules/focus-on-init';

// Services
import {
  ConfirmJobServive
} from './confirm-job.servive';

@NgModule({
  declarations: [
    ConfirmJobComponent
  ],
  entryComponents: [
    ConfirmJobComponent
  ],
  imports: [
    SharedCommonModule,
    FocusOnInitModule,
    MomentModule
  ],
  exports: [
    ConfirmJobComponent
  ],
  providers: [
    ConfirmJobServive
  ]
})
export class ConfirmJobModule {}
