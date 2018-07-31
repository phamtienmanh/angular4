import {
  Routes
} from '@angular/router';

import {
  ShippingComponent
} from './tops-detail.component';

import {
  ShippingDeactive
} from './tops-detail.deactive';

export const routes: Routes = [
  {
    path: '',
    component: ShippingComponent,
    data: {className: 'shipping'},
    canDeactivate: [ShippingDeactive]
  }
];
