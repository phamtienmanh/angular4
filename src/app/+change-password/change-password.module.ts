import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../shared/common';

import {
  routes
} from './change-password.routes';

import {
  ChangePasswordComponent
} from './change-password.component';
import {
  ChangePasswordService
} from './change-password.service';

@NgModule({
  declarations: [
    ChangePasswordComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule
  ],
  providers: [
    ChangePasswordService
  ]
})
export class ChangePasswordModule {
}
