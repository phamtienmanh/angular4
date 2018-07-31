import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../shared/common';

// 3rd modules
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  FileUploadModule
} from 'ng2-file-upload';

// Components
import {
  CreateOrUpdateUserComponent
} from './create-or-update-user.component';

// Services

@NgModule({
  declarations: [
    CreateOrUpdateUserComponent
  ],
  imports: [
    SharedCommonModule,
    FileUploadModule,
    NgSelectModule
  ],
  exports: [
    CreateOrUpdateUserComponent
  ]
})
export class CreateOrUpdateUserModule {
}
