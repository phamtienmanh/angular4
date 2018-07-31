import {
  Routes
} from '@angular/router';

import {
  FactoryDetailComponent
} from './factory-detail.component';

import {
  FactoryDetailDeactive
} from './factory-detail.deactive';

export const routes: Routes = [
  {
    path: '',
    component: FactoryDetailComponent,
    data: {className: 'factory-detail'},
    canDeactivate: [FactoryDetailDeactive]
  }
];
