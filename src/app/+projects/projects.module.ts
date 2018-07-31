import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  SharedCommonModule
} from '../shared/common';

import {
  routes
} from './projects.routes';

// 3rd modules
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';

// Modules
import {
  PermissionModule
} from '../shared/modules/permission';

// Components
import {
  ProjectsComponent
} from './projects.component';
import { AddEditCustomComponent } from './components/add-edit-custom';

// Services
import {
  ProjectsService
} from './projects.service';
import {
  ExtendedHttpService
} from '../shared/services/http';

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    PermissionModule
  ],
  declarations: [
    ProjectsComponent,
    AddEditCustomComponent
  ],
  exports: [],
  providers: [
    ProjectsService,
    ExtendedHttpService,
    BreadcrumbService
  ],
  entryComponents: [AddEditCustomComponent]
})
export class ProjectsModule {
}
