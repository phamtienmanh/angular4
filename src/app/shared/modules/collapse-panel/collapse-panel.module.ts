import {
  NgModule
} from '@angular/core';
import {
  CommonModule
} from '@angular/common';

// Component
import {
  CollapsePanelComponent
} from './collapse-panel.component';

@NgModule({
  declarations: [
    CollapsePanelComponent
  ],
  imports: [
    CommonModule
  ],
  entryComponents: [
    CollapsePanelComponent
  ],
  exports: [
    CollapsePanelComponent,
  ],
})
export class CollapsePanelModule {

}
