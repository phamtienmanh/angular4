import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  SelectContentComponent
} from './select-content.component';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules

@NgModule({
  declarations: [
    SelectContentComponent
  ],
  entryComponents: [
    SelectContentComponent
  ],
  imports: [
    SharedCommonModule,
    NgSelectModule
  ],
  exports: [
    SelectContentComponent
  ]
})
export class SelectContentModule {}
