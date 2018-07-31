import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../../../shared/common';

import {
  SelectTrimsComponent
} from './select-trims.component';

// 3rd modules

// Modules

@NgModule({
  declarations: [
    SelectTrimsComponent
  ],
  entryComponents: [
    SelectTrimsComponent
  ],
  imports: [
    SharedCommonModule
  ],
  exports: [
    SelectTrimsComponent
  ]
})
export class SelectTrimsModule {}
