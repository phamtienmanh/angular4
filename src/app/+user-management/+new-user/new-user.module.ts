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
} from './new-user.routes';

import {
  NewUserComponent
} from './new-user.component';

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
  NewUserService
} from './new-user.service';
import {
  NewUserDeactive
} from './new-user.deactive';

@NgModule({
  declarations: [
    NewUserComponent
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
    NewUserService,
    NewUserDeactive
  ]
})
export class NewUserModule {
}
