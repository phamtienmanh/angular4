import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../../../../shared/common';

import {
  TopsComponent
} from './tops.component';

import {
  routes
} from './tops.routes';

// 3rd modules

// Modules

// Services
import {
  ExtendedHttpService
} from '../../../../../shared/services/http';
import {
  PrintLocationService
} from '../+print-location/print-location.service';

@NgModule({
  declarations: [
    TopsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
  ],
  providers: [
    ExtendedHttpService,
    PrintLocationService
  ]
})
export class TopsModule {
}
