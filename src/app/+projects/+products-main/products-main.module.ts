import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../../shared/common';

import {
  routes
} from './products-main.routes';

import {
  ProductsMainComponent
} from './products-main.component';

import {
  ProductsMainAuth
} from './products-main.auth';

// 3rd modules
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';

// Modules
import {
  InputDebounceModule
} from '../../shared/modules/input-debounce';
import {
  PaginationControlModule
} from '../../shared/modules/pagination-control';
import {
  ProductInfoModule
} from './+product-info';
import {
  ConfirmDialogModule
} from '../../shared/modules/confirm-dialog';
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Components
import {
  ProductsMainFilterComponent
} from './components';

// Services
import {
  ProductsMainService
} from './products-main.service';

@NgModule({
  declarations: [
    ProductsMainComponent,
    ProductsMainFilterComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    PaginationControlModule,
    InputDebounceModule,
    NgxDatatableModule,
    ProductInfoModule,
    ConfirmDialogModule,
    NgSelectModule
  ],
  exports: [],
  entryComponents: [],
  providers: [
    ProductsMainAuth,
    BreadcrumbService,
    ProductsMainService
  ]
})
export class ProductsMainModule {
}
