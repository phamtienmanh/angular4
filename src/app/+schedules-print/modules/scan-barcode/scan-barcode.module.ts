import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../shared/common';

import {
  ScanBarcodeComponent
} from './scan-barcode.component';

// 3rd modules

// Modules
import {
  FocusOnInitModule
} from '../../../shared/modules/focus-on-init';

// Services
import {
  ScanBarcodeServive
} from './scan-barcode.servive';

@NgModule({
  declarations: [
    ScanBarcodeComponent
  ],
  entryComponents: [
    ScanBarcodeComponent
  ],
  imports: [
    SharedCommonModule,
    FocusOnInitModule
  ],
  exports: [
    ScanBarcodeComponent
  ],
  providers: [
    ScanBarcodeServive
  ]
})
export class ScanBarcodeModule {}
