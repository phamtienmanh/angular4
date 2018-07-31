import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  SelectFactoryComponent
} from './select-factory.component';

// 3rd modules
import {
  NgSelectModule
} from '@ng-select/ng-select';

@NgModule({
  declarations: [
    SelectFactoryComponent
  ],
  entryComponents: [
    SelectFactoryComponent
  ],
  imports: [
    SharedCommonModule,
    NgSelectModule
  ],
  exports: [
    SelectFactoryComponent
  ]
})
export class SelectFactoryModule {}
