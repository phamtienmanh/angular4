import {
  NgModule
} from '@angular/core';

import {
  ImagePreviewDirective
} from './img-preview.directive';

@NgModule({
  imports: [

  ],
  declarations: [
    ImagePreviewDirective
  ],
  exports: [
    ImagePreviewDirective
  ]
})
export class ImgPreviewModule {
}
