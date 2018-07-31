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
} from './project-manage.routes';

import {
  ProjectManageAuth
} from './project-manage.auth';

// 3rd modules

// Components
import {
  ProjectManageComponent
} from './project-manage.component';

// Services
import {
  ExtendedHttpService
} from '../../shared/services/http';
import {
  ProjectManageService
} from './project-manage.service';

@NgModule({
  declarations: [
    ProjectManageComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule
  ],
  exports: [],
  providers: [
    ProjectManageAuth,
    ExtendedHttpService,
    ProjectManageService
  ]
})
export class ProjectManageModule {}
