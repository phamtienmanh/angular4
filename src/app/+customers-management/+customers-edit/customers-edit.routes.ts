import {
  Routes
} from '@angular/router';

import {
  CustomersEditComponent
} from './customers-edit.component';

import {
  CustomersEditDeactive
} from './customers-edit.deactive';

export const routes: Routes = [
  {
    path: '',
    component: CustomersEditComponent,
    data: {className: 'customers-edit'},
    canDeactivate: [CustomersEditDeactive]
  }
];
