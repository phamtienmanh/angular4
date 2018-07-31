import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../../../shared/common';

import {
  SelectPackagingComponent
} from './select-packaging.component';

// 3rd modules

// Modules

@NgModule({
  declarations: [
    SelectPackagingComponent
  ],
  entryComponents: [
    SelectPackagingComponent
  ],
  imports: [
    SharedCommonModule
  ],
  exports: [
    SelectPackagingComponent
  ]
})
export class SelectPackagingModule {}
