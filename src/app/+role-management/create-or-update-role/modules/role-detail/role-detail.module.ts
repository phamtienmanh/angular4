import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  RoleDetailComponent
} from './role-detail.component';

// 3rd modules

// Modules

@NgModule({
  declarations: [
    RoleDetailComponent
  ],
  entryComponents: [
    RoleDetailComponent
  ],
  imports: [
    SharedCommonModule
  ],
  exports: [
    RoleDetailComponent
  ]
})
export class RoleDetailModule {}
