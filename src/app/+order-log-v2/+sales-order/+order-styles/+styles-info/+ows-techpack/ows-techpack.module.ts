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
  OwsTechpackComponent
} from './ows-techpack.component';

import {
  routes
} from './ows-techpack.routes';

// 3rd modules

// Modules

// Services
import {
  ExtendedHttpService
} from '../../../../../shared/services/http';
import {
  OwsTechpackService
} from './ows-techpack.service';
import {
  StyleService
} from '../+style/style.service';

@NgModule({
  declarations: [
    OwsTechpackComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
  ],
  providers: [
    ExtendedHttpService,
    OwsTechpackService,
    StyleService
  ]
})
export class OwsTechpackModule {
}
