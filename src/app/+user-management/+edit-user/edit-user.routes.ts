import {
  Routes
} from '@angular/router';

import {
  EditUserComponent
} from './edit-user.component';

import {
  EditUserAuth
} from './edit-user.auth';

import {
  EditUserDeactive
} from './edit-user.deactive';

export const routes: Routes = [
  {
    path: '',
    component: EditUserComponent,
    canActivate: [EditUserAuth],
    data: {className: 'edit-user'},
    canDeactivate: [EditUserDeactive]
  }
];
