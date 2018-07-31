import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  CommonService
} from '../../../../shared/services/common/common.service';
import {
  SampleService
} from '../../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+samples/sample.service';

// Components
import {
  NgSelectComponent
} from '@ng-select/ng-select';

// Models
import {
  ResponseMessage,
  BasicGeneralInfo
} from '../../../../shared/models';

@Component({
  selector: 'change-binid',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'change-binid.template.html',
  styleUrls: [
    'change-binid.styles.scss'
  ]
})
export class ChangeBinidComponent implements OnInit {
  @Input()
  public styleId: number;
  @Input()
  public sampleBinId: number = null;
  @Input()
  public sampleBinName = '';
  public sampleBinList = [];

  constructor(public activeModal: NgbActiveModal,
              private _toastrService: ToastrService,
              private _commonService: CommonService,
              private _sampleService: SampleService) {
  }

  public ngOnInit(): void {
    this.getCommonData();
  }

  public getCommonData() {
    if (this.styleId) {
      this._sampleService.getSampleBinList(this.styleId)
        .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
          if (resp.status) {
            this.sampleBinList = resp.data;
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public onSelectOpen(select: NgSelectComponent): void {
    if (!select.multiple && select.selectedItems && select.selectedItems.length) {
      let filterVal = select.selectedItems[0].label;
      select.filterValue = filterVal ? filterVal : '';
      this.sampleBinName = filterVal ? filterVal : '';
    }
  }

  public onChangeSelect($event) {
    if ($event && $event.name) {
      this.sampleBinName = $event.name;
    } else {
      this.sampleBinName = '';
    }
  }

  public onSubmitForm(): void {
    this.activeModal.close({
      sampleBinId: this.sampleBinId,
      sampleBinName: this.sampleBinName
    });
  }
}
