import {
  Routes
} from '@angular/router';

import {
  NewUserComponent
} from './new-user.component';

import {
  NewUserDeactive
} from './new-user.deactive';

export const routes: Routes = [
  {
    path: '',
    component: NewUserComponent,
    data: {className: 'new-user'},
    canDeactivate: [NewUserDeactive]
  }
];
