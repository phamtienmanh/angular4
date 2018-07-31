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
} from './tsc-print.routes';

// 3rd modules

// Modules

// Components
import {
  TscPrintComponent
} from './tsc-print.component';

// Services
import {
  TscPrintService
} from './tsc-print.service';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule
  ],
  declarations: [
    TscPrintComponent
  ],
  exports: [],
  providers: [TscPrintService]
})
export class TscPrintModule {
}
