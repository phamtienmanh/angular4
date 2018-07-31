import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../../../../../shared/common';

import {
  LabDipsComponent
} from './lab-dips.component';

import {
  routes
} from './lab-dips.routes';

// 3rd modules
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules

// Services
import {
  ExtendedHttpService
} from '../../../../../../shared/services/http';
import {
  LabDipsService
} from './lab-dips.service';

// Components
import {
  AddLabComponent
} from './components/add-lab';

@NgModule({
  declarations: [
    LabDipsComponent,
    AddLabComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    NgSelectModule
  ],
  entryComponents: [
    AddLabComponent
  ],
  providers: [
    ExtendedHttpService,
    LabDipsService
  ]
})
export class LabDipsModule {
}
