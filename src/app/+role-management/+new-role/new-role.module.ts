import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../shared/common';

import {
  routes
} from './new-role.routes';

import {
  NewRoleComponent
} from './new-role.component';

// 3rd modules

// Modules
import {
  CreateOrUpdateRoleModule
} from '../create-or-update-role';
import {
  ConfirmDialogModule
} from '../../shared/modules/confirm-dialog';

// Components

// Services
import {
  NewRoleService
} from './new-role.service';
import {
  NewRoleDeactive
} from './new-role.deactive';

@NgModule({
  declarations: [
    NewRoleComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    CreateOrUpdateRoleModule,
    ConfirmDialogModule
  ],
  exports: [],
  entryComponents: [],
  providers: [
    NewRoleService,
    NewRoleDeactive
  ]
})
export class NewRoleModule {
}
