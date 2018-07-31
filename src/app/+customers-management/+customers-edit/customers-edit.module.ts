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
} from './customers-edit.routes';

// 3rd modules
import {
  FileUploadModule
} from 'ng2-file-upload';

// Components
import {
  CustomersEditComponent
} from './customers-edit.component';
import {
  ConfirmDialogModule
} from '../../shared/modules/confirm-dialog';

// Services
import {
  CustomersEditService
} from './customers-edit.service';
import {
  CustomersEditDeactive
} from './customers-edit.deactive';

@NgModule({
  declarations: [
    CustomersEditComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    FileUploadModule,
    ConfirmDialogModule
  ],
  exports: [],
  entryComponents: [],
  providers: [
    CustomersEditService,
    CustomersEditDeactive
  ]
})
export class CustomersEditModule {
}
