import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../shared/common';

import {
  AddEditCustomComponent
} from './add-edit-custom.component';

@NgModule({
  declarations: [
    AddEditCustomComponent
  ],
  entryComponents: [
    AddEditCustomComponent
  ],
  imports: [
    SharedCommonModule
  ],
  exports: [
    AddEditCustomComponent
  ]
})
export class AddEditCustomModule { }
