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
} from './project-info.routes';

// 3rd modules
import {
  MyDatePickerModule
} from 'mydatepicker';

// Modules
import {
  NgSelectModule
} from '@ng-select/ng-select';
import {
  ConfirmDialogModule
} from '../../../shared/modules/confirm-dialog/confirm-dialog.module';

// Components
import {
  ProjectInfoComponent
} from './project-info.component';

// Services
import {
  ProjectInfoService
} from './project-info.service';
import {
  ExtendedHttpService
} from '../../../shared/services/http';
import {
  ValidationService
} from '../../../shared/services/validation';
import {
  RegionManagementService
} from '../../../+settings/+region-management/region-management.service';
import {
  ProjectInfoDeactive
} from './project-info.deactive';

@NgModule({
  declarations: [
    ProjectInfoComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    MyDatePickerModule,
    NgSelectModule,
    ConfirmDialogModule
  ],
  exports: [],
  providers: [
    ExtendedHttpService,
    ProjectInfoService,
    ValidationService,
    RegionManagementService,
    ProjectInfoDeactive
  ]
})
export class ProjectInfoModule {}
