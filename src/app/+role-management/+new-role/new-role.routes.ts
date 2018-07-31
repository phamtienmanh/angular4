import {
  Routes
} from '@angular/router';

import {
  NewRoleComponent
} from './new-role.component';

import {
  NewRoleDeactive
} from './new-role.deactive';

export const routes: Routes = [
  {
    path: '',
    component: NewRoleComponent,
    data: {className: 'new-role'},
    canDeactivate: [NewRoleDeactive]
  }
];
