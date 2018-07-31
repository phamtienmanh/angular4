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
} from './edit-user.routes';

import {
  EditUserComponent
} from './edit-user.component';

// 3rd modules

// Modules
import {
  CreateOrUpdateUserModule
} from '../create-or-update-user';
import {
  ConfirmDialogModule
} from '../../shared/modules/confirm-dialog';

// Components

// Services
import {
  EditUserService
} from './edit-user.service';
import {
  EditUserAuth
} from './edit-user.auth';
import {
  EditUserDeactive
} from './edit-user.deactive';

@NgModule({
  declarations: [
    EditUserComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    CreateOrUpdateUserModule,
    ConfirmDialogModule
  ],
  exports: [],
  entryComponents: [],
  providers: [
    EditUserService,
    EditUserAuth,
    EditUserDeactive
  ]
})
export class EditUserModule {
}
