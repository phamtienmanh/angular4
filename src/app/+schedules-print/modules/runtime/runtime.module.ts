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
  RuntimeService
} from './runtime.service';

// Components
import {
  RuntimeComponent
} from './runtime.component';

@NgModule({
  declarations: [
    RuntimeComponent
  ],
  entryComponents: [
    RuntimeComponent
  ],
  imports: [
    SharedCommonModule
  ],
  exports: [
    RuntimeComponent
  ],
  providers: [RuntimeService]
})
export class RuntimeModule {}
