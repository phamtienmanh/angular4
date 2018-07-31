import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../shared/common';

// 3rd modules
import {
  TagInputModule
} from 'ngx-chips';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  RoleDetailModule
} from './modules';
import {
  FitContentModule
} from '../../shared/directives/fit-content';

// Components
import {
  CreateOrUpdateRoleComponent
} from './create-or-update-role.component';

// Services

@NgModule({
  declarations: [
    CreateOrUpdateRoleComponent
  ],
  imports: [
    SharedCommonModule,
    RoleDetailModule,
    NgSelectModule,
    TagInputModule,
    FitContentModule
  ],
  exports: [
    CreateOrUpdateRoleComponent
  ]
})
export class CreateOrUpdateRoleModule {
}
