import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../shared/common';

import {
  RouterModule
} from '@angular/router';

import {
  NotSupportComponent
} from './not-support.component';

import {
  routes
} from './not-support.routes';

@NgModule({
  declarations: [
    NotSupportComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule
  ]
})
export class NotSupportModule {
}
