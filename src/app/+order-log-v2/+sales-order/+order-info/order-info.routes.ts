import {
  Routes
} from '@angular/router';

import {
  OrderInfoComponent
} from './order-info.component';

import {
  OrderInfoDeactive
} from './order-info.deactive';

export const routes: Routes = [
  {
    path: '',
    component: OrderInfoComponent,
    data: {className: 'order-info'},
    canDeactivate: [OrderInfoDeactive]
  }
];
