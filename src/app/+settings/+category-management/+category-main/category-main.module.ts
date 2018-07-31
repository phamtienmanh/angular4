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
} from './category-main.routes';

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
  CategoryMainComponent
} from './category-main.component';
import {
  AddEditCustomModule
} from '../../components/add-edit-custom/add-edit-custom.module';

// Services
import {
  CategoryMainService
} from './category-main.service';

@NgModule({
  declarations: [
    CategoryMainComponent
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
    CategoryMainService
  ]
})
export class CategoryMainModule {
}
