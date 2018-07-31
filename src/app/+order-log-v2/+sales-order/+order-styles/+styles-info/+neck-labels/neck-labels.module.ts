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
  NeckLabelsComponent
} from './neck-labels.component';

import {
  routes
} from './neck-labels.routes';

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
    NeckLabelsComponent
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
export class NeckLabelsModule {
}
