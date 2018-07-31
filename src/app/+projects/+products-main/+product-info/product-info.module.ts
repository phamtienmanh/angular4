import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../shared/common';

import {
  ProductInfoComponent
} from './product-info.component';

import {
  ProductInfoService
} from './product-info.service';

import { RegionManagementService } from '../../../+settings/+region-management';

// 3rd modules
import {
  FileUploadModule
} from 'ng2-file-upload';

// Modules
import {
  NgSelectModule
} from '@ng-select/ng-select';

@NgModule({
  declarations: [
    ProductInfoComponent
  ],
  entryComponents: [
    ProductInfoComponent
  ],
  imports: [
    SharedCommonModule,
    NgSelectModule,
    FileUploadModule
  ],
  exports: [
    ProductInfoComponent
  ],
  providers: [
    ProductInfoService,
    RegionManagementService
  ]
})
export class ProductInfoModule {}
