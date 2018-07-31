import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  StylesInfoComponent
} from './styles-info.component';

import {
  routes
} from './styles-info.routes';

// 3rd modules

// Modules

// Services
import {
  ExtendedHttpService
} from '../../../../shared/services/http';
import {
  StylesInfoService
} from './styles-info.service';

@NgModule({
  declarations: [
    StylesInfoComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
  ],
  providers: [
    ExtendedHttpService,
    StylesInfoService
  ]
})
export class StylesInfoModule {
}
