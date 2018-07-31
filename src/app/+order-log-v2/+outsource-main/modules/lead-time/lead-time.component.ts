import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

import {
  LeadTimeService
} from './lead-time.service';

// Services
import {
  ToastrService
} from 'ngx-toastr';

// Validators

// Interfaces
import { LeadEtaComponent } from '../+shared';
import { ResponseMessage } from '../../../../shared/models';

@Component({
  selector: 'lead-time',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'lead-time.template.html',
  styleUrls: [
    // 'lead-time.styles.scss'
  ]
})
export class LeadTimeComponent implements OnInit {
  @Input()
  public orderId;
  @Input()
  public orderDetailId;
  @Input()
  public printLocationId;
  @Input()
  public isPageReadOnly = false;
  @Input()
  public rowDetail;
  @Input()
  public type = 'outsource';

  @ViewChild(LeadEtaComponent)
  public leadEtaComponent: LeadEtaComponent;

  constructor(public activeModal: NgbActiveModal,
              private _toastrService: ToastrService,
              private _leadTimeService: LeadTimeService) {
  }

  public ngOnInit(): void {
    // empty
  }

  public onSubmitForm(): void {
    if (this.leadEtaComponent.checkFormValid()) {
      const modal = {
        columnType: this.rowDetail.columnId,
        ...this.leadEtaComponent.getFormValue()
      };
      this._leadTimeService.changeStatusColumn(this.orderId, this.orderDetailId,
        this.rowDetail.columnId, this.type, modal)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this.activeModal.close(resp);
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
  }
}
