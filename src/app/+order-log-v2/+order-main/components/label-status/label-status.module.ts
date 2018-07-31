import {
  NgModule
} from '@angular/core';

// Modules
import {
  SharedCommonModule
} from '../../../../shared/common';

// Components
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
  ],
  providers: []
})
export class LabelStatusModule {}
