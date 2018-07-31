import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  LabelStatusComponent
} from './label-status.component';

@NgModule({
  declarations: [
    LabelStatusComponent
  ],
  entryComponents: [
    LabelStatusComponent
  ],
  imports: [
    SharedCommonModule
  ],
  exports: [
    LabelStatusComponent
  ]
})
export class LabelStatusModule {}
