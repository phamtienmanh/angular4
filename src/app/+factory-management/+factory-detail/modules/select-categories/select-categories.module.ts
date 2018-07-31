import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../../../shared/common';

import {
  SelectCategoriesComponent
} from './select-categories.component';

// 3rd modules

// Modules

// Services
import {
  CategoryManagementService
} from '../../../../+settings/+category-management/category-management.service';

@NgModule({
  declarations: [
    SelectCategoriesComponent
  ],
  entryComponents: [
    SelectCategoriesComponent
  ],
  imports: [
    SharedCommonModule
  ],
  exports: [
    SelectCategoriesComponent
  ],
  providers: [
    CategoryManagementService
  ]
})
export class SelectCategoriesModule {}
