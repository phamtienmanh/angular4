import {
  NgModule
} from '@angular/core';

import {
  AddSizesComponent
} from './add-sizes.component';
import {
  SharedCommonModule
} from '../../../../../../shared/common';

// Service

@NgModule({
  declarations: [
    AddSizesComponent
  ],
  entryComponents: [
    AddSizesComponent
  ],
  imports: [
    SharedCommonModule
  ],
  exports: [
    AddSizesComponent
  ],
  providers: [
  ]
})
export class AddSizesModule {}
