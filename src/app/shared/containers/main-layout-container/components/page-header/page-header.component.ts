import {
  Component,
  ViewEncapsulation,
  Input,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import {
  Router
} from '@angular/router';

// 3rd modules
import {
  Sidebar
} from 'ng-sidebar';

// Services
import {
  AuthService
} from '../../../../services/auth/auth.service';
import {
  CommonService
} from '../../../../services/common';
import {
  UserContext
} from '../../../../services/user-context/user-context';
import {
  Util
} from '../../../../services/util';
import {
  ToastrService
} from 'ngx-toastr';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  PrintMainService
} from '../../../../../+schedules-print/+tsc-print/+print-main/print-main.service';

// Modules
import {
  ThemeSetting
} from '../../../../services/theme-setting';

// Interfaces
import {
  UserInfo
} from '../../../../models/user.model';
import {
  InputDebounceComponent
} from '../../../../modules/input-debounce/input-debounce.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FeedbackComponent } from './feedback/feedback.component';
import { FeedbackRequest } from './feedback/feedback.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'page-header',  // <page-header></page-header>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './page-header.template.html',
  styleUrls: [
    './page-header.style.scss'
  ]
})
export class PageHeaderComponent implements OnInit {
  // @Input()
  // public sidenav: Sidebar;

  public offsetTime: number;
  public userInfo: UserInfo;

  public isModifyCustomer = true;
  public isModifyOrderLog = true;
  public machineList = [];
  public machineSelected;

  constructor(private _router: Router,
              private _userContext: UserContext,
              private _localStorageService: LocalStorageService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _authService: AuthService,
              private _commonService: CommonService,
              private _themeSetting: ThemeSetting,
              private _utilService: Util,
              private _toastrService: ToastrService,
              private _modalService: NgbModal,
              private _printMainSv: PrintMainService) {
    // empty
  }

  public ngOnInit(): void {
    this.isModifyCustomer = this._authService.checkCanModify('Customers');
    this.isModifyOrderLog = this._authService.checkCanModify('Orders');

    this.offsetTime = this._commonService.offsetTime;

    this.userInfo = this._userContext.currentUser;
    // Subscribe change user info to update info
    this._userContext.onUserInfoChange.subscribe((item) => {
      if (item) {
        this.userInfo = item;
      }
      this.isModifyCustomer = this._authService.checkCanModify('Customers');
      this.isModifyOrderLog = this._authService.checkCanModify('Orders');
      this._changeDetectorRef.markForCheck();
    });
    this.getMachineList();
  }

  public openLeftSideNav() {
    this._themeSetting.sidebarOpen = !this._themeSetting.sidebarOpen;
  }

  public viewProfile(): void {
    this._router.navigate(['user-management', this.userInfo.id]);
  }

  public goToHome(): void {
    this._router.navigateByUrl('/');
  }

  public newCustomer(): void {
    this._router.navigate(['customers-management', 'new']);
  }

  public newSalesOrder(): void {
    this._router.navigate(['order-log-v2', 'new-order']);
  }

  public logout(): void {
    const preUserId = this._userContext.currentUser.id;
    this._authService.logout().subscribe(() => {
      this._userContext.clear();
      this._localStorageService.add('preUserId', preUserId);
      this._router.navigate(['auth', 'sign-in']);
    });
  }

  /**
   * goToCustomerPage
   * @param customerId
   */
  public goToReminderDetail(item) {
    if (item.customerId) {
      this.userInfo.reminders.splice(
        this.userInfo.reminders.findIndex((i) => i.id === item.customerId), 1);
      this._router.navigate(['customers-management', item.customerId]);
    } else if (item.vendorId) {
      this.userInfo.reminders.splice(
        this.userInfo.reminders.findIndex((i) => i.id === item.vendorId), 1);
      this._router.navigate(['vendors-management', item.vendorId]);
    }
  }

  /**
   * Search text change event
   * @param value
   */
  public onSearchChanged(value: string, searchInput: InputDebounceComponent): void {
    this._utilService.globalSearch = value.trim();
    this._changeDetectorRef.markForCheck();
    this._router.navigate(['order-log-v2', 'all']);
  }

  public requestFeedback(): void {
    let modalRef = this._modalService.open(FeedbackComponent, {
      keyboard: false,
      backdrop: 'static'
    });
    const model: FeedbackRequest = {
      fullName: this.userInfo.fullName,
      email: this.userInfo.email,
      message: '',
      url: window.location.href
    };
    modalRef.componentInstance.title = 'Feedback Request';
    modalRef.componentInstance.userData = Object.assign({}, model);
    modalRef.result.then((res) => {
      // empty
    }, (err) => {
      // empty
    });
  }

  public getMachineList() {
    this._commonService.getMachineNVendor('Print')
      .subscribe((resp) => {
        if (resp.status) {
          // let sortedData = _.orderBy(resp.data, ['isMachine', 'name'], ['desc', 'asc']);
          this.machineList = resp.data.filter((data) => data['isMachine']);
          this.machineList.unshift({id: 'no-select', name: 'Select Machine'});
          this.machineSelected = this.machineList[0].id;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public onSelectMachine(event) {
    this._utilService.machineHeaderSelect = event.id;
    this._utilService.machineNameHeaderSelect = event.name;
    this._utilService.machineHeaderSelected();
  }
}
