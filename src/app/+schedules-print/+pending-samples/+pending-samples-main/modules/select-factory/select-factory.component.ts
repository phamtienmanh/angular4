import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  NgbActiveModal,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import { CommonService } from '../../../../../shared/services/common';
import { ToastrService } from 'ngx-toastr';

// Interfaces
import {
  ResponseMessage,
  BasicGeneralInfo
} from '../../../../../shared/models';

@Component({
  selector: 'select-factory',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'select-factory.template.html',
  styleUrls: [
    'select-factory.styles.scss'
  ]
})
export class SelectFactoryComponent implements OnInit {
  @Input()
  public factoryId = null;
  @Input()
  public factoryName = '';
  @Input()
  public itemType;

  public factoryList = [];

  constructor(public activeModal: NgbActiveModal,
              private _commonService: CommonService,
              private _toastrService: ToastrService) {
  }

  public ngOnInit(): void {
    this.getCommonData();
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getFactoryList(this.itemType)
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.factoryList = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public onSubmitForm(): void {
    this.activeModal.close({
      factoryId: this.factoryId,
      factoryName: this.factoryName
    });
  }
}
