import {
  Component,
  Input,
} from '@angular/core';

import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'confirm-dialog',
  templateUrl: './confirm-dialog.template.html',
})
export class ConfirmDialogComponent {
  @Input()
  public message: string;
  @Input()
  public title: string;
  @Input()
  public submitBtnName = 'OK';
  @Input()
  public cancelBtnName = 'Cancel';

  constructor(public activeModal: NgbActiveModal) {}
}
