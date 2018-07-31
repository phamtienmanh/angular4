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
  routes
} from './print-location.routes';

// 3rd modules

// Modules
import {
  SelectLocationModule
} from './modules';

// Components
import {
  PrintLocationComponent
} from './print-location.component';

// Services
import {
  PrintLocationService
} from './print-location.service';
import {
  ExtendedHttpService
} from '../../../../../shared/services/http';
import {
  ValidationService
} from '../../../../../shared/services/validation';

@NgModule({
  declarations: [
    PrintLocationComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    SelectLocationModule
  ],
  exports: [],
  providers: [
    ExtendedHttpService,
    PrintLocationService,
    ValidationService
  ]
})
export class PrintLocationModule {}
