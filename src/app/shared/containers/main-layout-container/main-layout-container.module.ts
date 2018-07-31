import {
  NgModule
} from '@angular/core';

import {
  SharedCommonModule
} from '../../common';

import {
  MainLayoutComponent
} from './main-layout-container.component';

import {
  PageHeaderComponent
} from './components/page-header';

import {
  QuickViewComponent
} from './components/quickview';

import {
  SidebarComponent
} from './components/sidebar';

import {
  QuickViewModule
} from '../../modules/quick-view';

import {
  PermissionModule
} from '../../modules/permission';

import {
  CommonService
} from '../../services/common';

import {
  ExtendedHttpService
} from '../../services/http';

import {
  MomentModule
} from 'angular2-moment';

import {
  InputDebounceModule
} from '../../modules/input-debounce';

import {
  OrderByPipe
} from '../../pipes/orderBy';

import {
  FeedbackModule
} from './components/page-header/feedback';

import {
  NgSelectModule
} from '@ng-select/ng-select';

import {
  PrintMainService
} from '../../../+schedules-print/+tsc-print/+print-main/print-main.service';

@NgModule({
  imports: [
    SharedCommonModule,
    QuickViewModule,
    PermissionModule,
    MomentModule,
    InputDebounceModule,
    FeedbackModule,
    NgSelectModule
  ],
  exports: [
    PageHeaderComponent,
    QuickViewComponent,
    SidebarComponent,
    MainLayoutComponent
  ],
  declarations: [
    PageHeaderComponent,
    QuickViewComponent,
    SidebarComponent,
    MainLayoutComponent,
    OrderByPipe
  ],
  providers: [
    CommonService,
    ExtendedHttpService,
    PrintMainService
  ],
  entryComponents: [],
})
export class MainLayoutModule {
}
