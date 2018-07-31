import {
  Routes
} from '@angular/router';

import {
  VendorsEditComponent
} from './vendors-edit.component';

import {
  VendorsEditDeactive
} from './vendors-edit.deactive';

export const routes: Routes = [
  {
    path: '',
    component: VendorsEditComponent,
    data: {className: 'vendors-edit'},
    canDeactivate: [VendorsEditDeactive]
  }
];
