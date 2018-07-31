import {
  Routes
} from '@angular/router';

import {
  ProjectsComponent
} from './projects.component';

export const routes: Routes = [
  {
    path: '',
    component: ProjectsComponent,
    data: {
      className: 'projects'
    },
    children: [
      {
        path: 'project-main',
        loadChildren: './+project-main/project-main.module#ProjectMainModule'
      },
      {
        path: 'products',
        loadChildren: './+products-main/products-main.module#ProductsMainModule'
      },
      {
        path: ':id',
        loadChildren: './+project-manage/project-manage.module#ProjectManageModule'
      }
    ]
  }
];
