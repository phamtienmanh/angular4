import {
  Routes
} from '@angular/router';

import {
  StyleComponent
} from './style.component';

import {
  StyleDeactive
} from './style.deactive';

export const routes: Routes = [
  {
    path: '',
    component: StyleComponent,
    data: {className: 'style'},
    canDeactivate: [StyleDeactive]
  },
  {
    path: ':isInheritData',
    component: StyleComponent,
    data: {className: 'style'},
    canDeactivate: [StyleDeactive]
  }
];
