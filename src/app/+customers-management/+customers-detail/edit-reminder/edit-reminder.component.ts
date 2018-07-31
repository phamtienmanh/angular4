import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

// 3rd modules
import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  ToastrService
} from 'ngx-toastr';
import {
  IMyDateModel
} from 'mydatepicker';

// Services
import {
  EditReminderService
} from './edit-reminder.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import {
  MyDatePickerService
} from '../../../shared/services/my-date-picker/my-date-picker.service';
import { CommonService } from '../../../shared/services/common';

// Interfaces
import {
  ReminderInfo
} from './edit-reminder.model';
import {
  BasicResponse,
  TypeEnum,
  BasicUserInfo
} from '../../../shared/models';

@Component({
  selector: 'edit-reminder',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'edit-reminder.template.html',
  styleUrls: [
    'edit-reminder.style.scss'
  ]
})
export class EditReminderComponent implements OnInit {
  public newReminder: ReminderInfo;
  public userId: number;
  public customerId: number;
  public listUser: BasicUserInfo[];

  public myDateRangePickerOptions = {
    selectorWidth: '220px',
    dateFormat: 'mm/dd/yyyy',
    showTodayBtn: false,
    showClearDateBtn: false,
    alignSelectorRight: true,
    openSelectorOnInputClick: true,
    editableDateField: true,
    selectionTxtFontSize: '12px',
    height: '28px',
    firstDayOfWeek: 'su',
    sunHighlight: false
  };
  public isPageReadOnly = false;

  constructor(public activeModal: NgbActiveModal,
              private _toastrService: ToastrService,
              private _authService: AuthService,
              private _editReminderService: EditReminderService,
              private _commonService: CommonService,
              public myDatePickerService: MyDatePickerService) {}

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Customers');
    let date = new Date(this.newReminder.remindDateOnUtc);
    this.newReminder['remindDate'] = {
      date: {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      }
    };
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  /**
   * Fire date change event
   * @param event
   */
  public onDateChanged(event: IMyDateModel) {
    let utcDate = Object.assign({}, event);
    this.newReminder.remindDateOnUtc = utcDate.jsdate ? utcDate.formatted : '';
  }

  /**
   * updateReminder
   */
  public updateReminder(): void {
    this.newReminder.remindDateOnUtc = this.myDatePickerService
      .addUtcTimeToDateModel(this.newReminder.remindDateOnUtc);
    this._editReminderService.updateReminder(this.customerId,
      {...this.newReminder, type: TypeEnum.Customer})
      .subscribe((resp: BasicResponse) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
          this.activeModal.close(true);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }
}
