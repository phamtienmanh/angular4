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
import { CommonService } from '../../../../../shared/services/common';
import { ToastrService } from 'ngx-toastr';

// Interfaces
import {
  ResponseMessage,
  BasicGeneralInfo
} from '../../../../../shared/models';

@Component({
  selector: 'select-content',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'select-content.template.html',
  styleUrls: [
    'select-content.styles.scss'
  ]
})
export class SelectContentComponent implements OnInit {
  @Input()
  public contentId = null;
  @Input()
  public contentName = '';

  public contentData = [];

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
    this._commonService.getContentList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.contentData = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public formClick(e: MouseEvent) {
    if (e.toElement &&
      e.toElement.tagName !== 'BUTTON' &&
      !e.toElement.classList.contains('form-control') &&
      !e.toElement.classList.contains('icon-mydpcalendar') &&
      !e.toElement.classList.contains('selection')) {

      let eventClick = new Event('click');
      document.dispatchEvent(eventClick);
    }
  }

  public onSubmitForm(): void {
    this.activeModal.close({
      contentId: this.contentId,
      contentName: this.contentName
    });
  }
}
