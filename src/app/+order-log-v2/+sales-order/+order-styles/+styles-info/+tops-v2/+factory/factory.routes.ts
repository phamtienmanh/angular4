import {
  Routes
} from '@angular/router';

import {
  FactoryComponent
} from './factory.component';

import {
  FactoryDeactive
} from './factory.deactive';

export const routes: Routes = [
  {
    path: '',
    component: FactoryComponent,
    data: {className: 'factory'},
    canDeactivate: [FactoryDeactive]
  }
];
