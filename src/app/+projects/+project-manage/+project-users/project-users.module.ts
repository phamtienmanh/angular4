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
} from './project-users.routes';

// 3rd modules
import {
  NgSelectModule
} from '@ng-select/ng-select';

// Modules

// Components
import {
  ProjectUsersComponent
} from './project-users.component';

// Services
import {
  ProjectUsersService
} from './project-users.service';
import {
  ExtendedHttpService
} from '../../../shared/services/http';
import {
  ValidationService
} from '../../../shared/services/validation';

@NgModule({
  declarations: [
    ProjectUsersComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    NgSelectModule
  ],
  exports: [],
  providers: [
    ExtendedHttpService,
    ProjectUsersService,
    ValidationService
  ]
})
export class ProjectUsersModule {}
