import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../../../../shared/common';

import {
  SelectLocationComponent
} from './select-location.component';

// Service
import {
  LocationDetailService
} from '../../+location-detail/location-detail.service';

@NgModule({
  declarations: [
    SelectLocationComponent
  ],
  entryComponents: [
    SelectLocationComponent
  ],
  imports: [
    SharedCommonModule
  ],
  exports: [
    SelectLocationComponent
  ],
  providers: [
    LocationDetailService
  ]
})
export class SelectLocationModule {}
