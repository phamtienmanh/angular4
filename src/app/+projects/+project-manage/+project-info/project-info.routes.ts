import {
  Routes
} from '@angular/router';

import {
  ProjectInfoComponent
} from './project-info.component';

import {
  ProjectInfoDeactive
} from './project-info.deactive';

export const routes: Routes = [
  {
    path: '',
    component: ProjectInfoComponent,
    data: {className: 'project-info'},
    canDeactivate: [ProjectInfoDeactive]
  }
];
