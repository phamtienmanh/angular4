import {
  Routes
} from '@angular/router';

import {
  EditRoleComponent
} from './edit-role.component';

import {
  EditRoleDeactive
} from './edit-role.deactive';

export const routes: Routes = [
  {
    path: '',
    component: EditRoleComponent,
    data: {className: 'edit-role'},
    canDeactivate: [EditRoleDeactive]
  }
];
