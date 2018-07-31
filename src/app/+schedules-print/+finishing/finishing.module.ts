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
} from './finishing.routes';

// 3rd modules

// Modules

// Components
import {
  FinishingComponent
} from './finishing.component';

// Services
import {
  FinishingService
} from './finishing.service';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule
  ],
  declarations: [
    FinishingComponent
  ],
  exports: [],
  providers: [FinishingService]
})
export class FinishingModule {
}
