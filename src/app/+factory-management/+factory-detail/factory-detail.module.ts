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
} from './factory-detail.routes';

// 3rd modules
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules
import {
  ConfirmDialogModule
} from '../../shared/modules/confirm-dialog';
import {
  SelectCategoriesModule
} from './modules';

// Components
import {
  FactoryDetailComponent
} from './factory-detail.component';

// Services
import {
  FactoryDetailDeactive
} from './factory-detail.deactive';
import {
  SettingsService
} from '../../+settings/settings.service';

@NgModule({
  declarations: [
    FactoryDetailComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    NgSelectModule,
    SelectCategoriesModule,
    ConfirmDialogModule
  ],
  exports: [],
  entryComponents: [],
  providers: [
    FactoryDetailDeactive,
    SettingsService
  ]
})
export class FactoryDetailModule {
}
