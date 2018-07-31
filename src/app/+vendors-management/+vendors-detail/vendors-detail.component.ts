import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

import {
  Router,
  ActivatedRoute
} from '@angular/router';

import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  IMyDateModel
} from 'mydatepicker';

// Services
import {
  VendorsDetailService
} from './vendors-detail.service';
import {
  AuthService
} from '../../shared/services/auth';
import {
  VendorsEditService
} from '../+vendors-edit/vendors-edit.service';
import { CommonService } from '../../shared/services/common';

// Components
import {
  EditReminderComponent
} from './edit-reminder';
import {
  ConfirmDialogComponent
} from '../../shared/modules/confirm-dialog';

// Interfaces
import {
  VendorInfo
} from '../+vendors-edit';
import {
  ReminderInfo
} from './edit-reminder';
import {
  ResponseMessage,
  BasicUserInfo,
  TypeEnum,
  BasicResponse
} from '../../shared/models';
import {
  Subscription
} from 'rxjs/Subscription';
import {
  MyDatePickerService
} from '../../shared/services/my-date-picker';
import * as _ from 'lodash';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'vendors-detail',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'vendors-detail.template.html',
  styleUrls: [
    'vendors-detail.style.scss'
  ]
})
export class VendorsDetailComponent implements OnInit, OnDestroy {
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

  public vendorInfo: VendorInfo;
  public listUser: BasicUserInfo[];
  public newReminder: ReminderInfo;
  public activatedSub: Subscription;

  public isPageReadOnly = false;

  constructor(private _vendorsDetailService: VendorsDetailService,
              private _vendorsEditService: VendorsEditService,
              private _authService: AuthService,
              private _activatedRoute: ActivatedRoute,
              private _router: Router,
              private _breadcrumbService: BreadcrumbService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _modalService: NgbModal,
              public myDatePickerService: MyDatePickerService) {}

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Vendors');
    this.clearForm();
    this.activatedSub = this._activatedRoute.parent.params.subscribe((params: { id: number }) => {
      this._authService.getAllUsers()
        .subscribe((userResp: ResponseMessage<BasicUserInfo[]>) => {
          if (userResp.status) {
            this.listUser = userResp.data;
            this._vendorsEditService.getVendorInfo(params.id)
              .subscribe((vendorResp: ResponseMessage<VendorInfo>) => {
                if (vendorResp.status) {
                  this.vendorInfo = vendorResp.data;
                  this.vendorInfo.id = params.id;
                  this.configReminder(this.vendorInfo.reminders);
                  this.configFriendlyRoutes();
                } else {
                  if (vendorResp.errorMessages[0].includes('not exist')) {
                    this._router.navigate(['not-found']);
                  }
                  this._toastrService.error(vendorResp.errorMessages, 'Error');
                }
              });
          } else {
            this._toastrService.error(userResp.errorMessages, 'Error');
          }
        });
    });
  }

  /**
   * configFriendlyRoutes
   */
  public configFriendlyRoutes(): void {
    this._breadcrumbService
      .addCallbackForRouteRegex('^/vendors-management/[0-9]*$', () => this.vendorInfo.company);
  }

  /**
   * Fire value select change event
   * @param value
   */
  public onValueChange(value: BasicUserInfo): void {
    this.newReminder.userId = value.id;
  }

  /**
   * configReminder
   * @param {[]} reminderList
   */
  public configReminder(reminderList: ReminderInfo[] = []): void {
    reminderList.forEach((reminderInfo) => {
      // reminderInfo['isEdit'] = false;
      // Set today date using the setValue function
      let date = new Date(reminderInfo.remindDateOnUtc);
      reminderInfo['myDate'] = {
        date: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate()
        }
      };
    });
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
   * createReminder
   */
  public createReminder(): void {
    this.newReminder.remindDateOnUtc = this.myDatePickerService
      .addUtcTimeToDateModel(this.newReminder.remindDateOnUtc);
    this._vendorsDetailService.createReminder(this.vendorInfo.id,
      {
        ...this.newReminder,
        type: TypeEnum.Vendor
      })
      .subscribe((resp: BasicResponse) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
          this.ngOnInit();
          this.clearForm();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * clearForm
   */
  public clearForm(): void {
    const currentDate = new Date();
    this.newReminder = {
      content: undefined,
      userId: undefined,
      userName: undefined,
      remindDateOnUtc: new Date(currentDate.getFullYear(),
        currentDate.getMonth(), currentDate.getDate(), 0, 0, 0)
    };
    this.newReminder['remindDate'] = {
      date: {
        year: this.newReminder.remindDateOnUtc.getFullYear(),
        month: this.newReminder.remindDateOnUtc.getMonth() + 1,
        day: this.newReminder.remindDateOnUtc.getDate()
      }
    };
    this.newReminder['remindDateOnUtc'] =
      `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
  }

  /**
   * editReminder
   * @param {} reminder
   */
  public editReminder(reminder: ReminderInfo): void {
    if (this.isPageReadOnly) {
      return;
    }
    let modalRef = this._modalService.open(EditReminderComponent, {
      size: 'lg',
      keyboard: true
    });
    // copy new obj and send new obj to modal
    let reminderCopy = Object.assign({}, reminder);
    if (!reminderCopy.userName) {
      reminderCopy.userName = _.get(this.listUser
        .find((i) => i.id === reminderCopy.userId), 'fullName', '');
    }
    modalRef.componentInstance.newReminder = reminderCopy;
    modalRef.componentInstance.vendorId = this.vendorInfo.id;
    modalRef.componentInstance.listUser = this.listUser;
    modalRef.result.then((status: boolean) => {
      if (status) {
        this.ngOnInit();
      }
    }, (err) => {
      // if not, error
    });
  }

  /**
   * deleteReminder
   * @param {number} reminderId
   */
  public deleteReminder(reminderId: number): void {
    let modalRef = this._modalService.open(ConfirmDialogComponent, {
      keyboard: true
    });
    modalRef.componentInstance
      .message = 'Are you sure you want to delete the selected reminder?';
    modalRef.componentInstance.title = 'Confirm Reminder Deletion';

    modalRef.result.then((res: boolean) => {
      if (res) {
        this._vendorsDetailService.deleteReminder(this.vendorInfo.id, reminderId)
          .subscribe((resp: BasicResponse) => {
            if (resp.status) {
              this._toastrService.success(resp.message, 'Success');
              this.ngOnInit();
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
    });
  }

  /**
   * goToEditVendor
   */
  public goToEditVendor(): void {
    this._router.navigate(['vendors-management', this.vendorInfo.id, 'edit']);
  }

  /**
   * goToNewSalesOrder
   */
  public goToNewSalesOrder(): void {
    this._router.navigate(['order-log-v2', 'new']);
  }

  public ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
