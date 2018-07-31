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
} from './edit-role.routes';

import {
  EditRoleComponent
} from './edit-role.component';

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
  EditRoleService
} from './edit-role.service';
import {
  EditRoleDeactive
} from './edit-role.deactive';

@NgModule({
  declarations: [
    EditRoleComponent
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
    EditRoleService,
    EditRoleDeactive
  ]
})
export class EditRoleModule {
}
