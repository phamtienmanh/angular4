import {
  NgModule
} from '@angular/core';

import {
  RouterModule
} from '@angular/router';

import {
  routes
} from './fabric-detail.routes';

// 3rd modules
import {
  MomentModule
} from 'angular2-moment';
import {
  MyDatePickerModule
} from 'mydatepicker';
import {
  NgSelectModule
} from '@ng-select/ng-select';
import {
  NgxDatatableModule
} from '@swimlane/ngx-datatable';

// Modules
import {
  SharedCommonModule
} from '../../../../../../../shared/common';
import {
  UploaderTypeModule
} from '../../../../../../../shared/modules/uploader-type';

// Components
import {
  FabricDetailComponent
} from './fabric-detail.component';

// Services
import {
  ExtendedHttpService,
  ValidationService
} from '../../../../../../../shared/services';
import {
  FabricDetailDeactive
} from './fabric-detail.deactive';
import {
  FabricDetailService
} from './fabric-detail.service';

@NgModule({
  declarations: [
    FabricDetailComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedCommonModule,
    MomentModule,
    MyDatePickerModule,
    NgSelectModule,
    NgxDatatableModule,
    UploaderTypeModule
  ],
  exports: [],
  providers: [
    ExtendedHttpService,
    FabricDetailService,
    ValidationService,
    FabricDetailDeactive
  ]
})
export class FabricDetailModule {}
