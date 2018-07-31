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
  FabricQualityComponent
} from './fabric-quality.component';

import {
  routes
} from './fabric-quality.routes';

// 3rd modules

// Modules

// Services
import {
  ExtendedHttpService
} from '../../../../../../shared/services/http';
import {
  FabricQualityService
} from './fabric-quality.service';

// Components
import {
  AddFabricComponent
} from './components/add-fabric';

@NgModule({
  declarations: [
    FabricQualityComponent,
    AddFabricComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
  ],
  entryComponents: [
    AddFabricComponent
  ],
  providers: [
    ExtendedHttpService,
    FabricQualityService
  ]
})
export class FabricQualityModule {
}
