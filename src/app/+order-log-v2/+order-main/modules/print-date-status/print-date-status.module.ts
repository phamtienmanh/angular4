import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  PrintDateStatusComponent
} from './print-date-status.component';

// Modules
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    PrintDateStatusComponent
  ],
  entryComponents: [
    PrintDateStatusComponent
  ],
  imports: [
    SharedCommonModule,
    NgSelectModule
  ],
  exports: [
    PrintDateStatusComponent
  ]
})
export class PrintDateStatusModule {}
