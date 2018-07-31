import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  AccountManagerComponent
} from './account-manager.component';

// 3rd modules
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules

// Services
import {
  AccountManagerService
} from './account-manager.service';

@NgModule({
  declarations: [
    AccountManagerComponent
  ],
  entryComponents: [
    AccountManagerComponent
  ],
  imports: [
    SharedCommonModule,
    NgSelectModule
  ],
  exports: [
    AccountManagerComponent
  ],
  providers: [
    AccountManagerService
  ]
})
export class AccountManagerModule {}
