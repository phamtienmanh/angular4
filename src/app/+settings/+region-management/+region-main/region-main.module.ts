import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../../shared/common';

import {
  routes
} from './region-main.routes';

// 3rd modules
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';

// Modules
import {
  InputDebounceModule
} from '../../../shared/modules/input-debounce';
import {
  PaginationControlModule
} from '../../../shared/modules/pagination-control';
import {
  ConfirmDialogModule
} from '../../../shared/modules/confirm-dialog';

// Components
import {
  RegionMainComponent
} from './region-main.component';
import {
  AddEditCustomModule
} from '../../components/add-edit-custom/add-edit-custom.module';

// Services
import {
  RegionMainService
} from './region-main.service';

@NgModule({
  declarations: [
    RegionMainComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    PaginationControlModule,
    InputDebounceModule,
    NgxDatatableModule,
    ConfirmDialogModule,
    AddEditCustomModule
  ],
  exports: [],
  entryComponents: [],
  providers: [
    RegionMainService
  ]
})
export class RegionMainModule {
}
