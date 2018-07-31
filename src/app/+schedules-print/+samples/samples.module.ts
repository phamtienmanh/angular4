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
} from './samples.routes';

// 3rd modules

// Modules

// Components
import {
  SamplesComponent
} from './samples.component';

// Services
import {
  SamplesMainService
} from './+samples-main/samples-main.service';
import {
  SamplesService
} from './samples.service';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule
  ],
  declarations: [
    SamplesComponent
  ],
  exports: [],
  providers: [SamplesMainService, SamplesService]
})
export class SamplesModule {
}
