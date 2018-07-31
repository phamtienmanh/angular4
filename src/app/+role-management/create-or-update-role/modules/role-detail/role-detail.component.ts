import {
  AfterViewInit,
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
import { AuthService } from '../../../../shared/services/auth/auth.service';

// Interfaces

@Component({
  selector: 'role-detail',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'role-detail.template.html',
  styleUrls: [
    'role-detail.styles.scss'
  ]
})
export class RoleDetailComponent implements OnInit {
  @Input()
  public title;
  @Input()
  public tableData;

  public isPageReadOnly = false;

  constructor(public activeModal: NgbActiveModal,
              private _authService: AuthService) {
  }

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Roles');
  }

  /**
   * onSubmitForm
   */
  public onSubmitForm(): void {
    setTimeout(() => {
      this.activeModal.close({
        status: true,
        data: this.tableData
      });
    });
  }
}
