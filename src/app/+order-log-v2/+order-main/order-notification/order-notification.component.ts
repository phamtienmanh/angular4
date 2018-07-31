import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewChecked,
  ViewChild
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  HttpParams
} from '@angular/common/http';

import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

import {
  IMyDate,
  IMyDateModel
} from 'mydatepicker';

// Validators
import {
  MinDate,
  MaxDate
} from '../../../shared/validators';

import {
  ToastrService
} from 'ngx-toastr';

// Services
import {
  MyDatePickerService
} from '../../../shared/services/my-date-picker/my-date-picker.service';
import {
  ValidationService
} from '../../../shared/services/validation/validation.service';
import {
  OrderNotificationService
} from './order-notification.service';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  AuthService
} from '../../../shared/services/auth/auth.service';

// Component
import {
  AddOrderComponent
} from './add-order';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import {
  ConfirmDialogComponent
} from '../../../shared/modules/confirm-dialog/confirm-dialog.component';

// Interface
import {
  ResponseMessage
} from '../../../shared/models';
import { SortEvent } from '../../../shared/models/ngx-datatable.model';
import { BasicResponse } from '../../../shared/models/respone.model';
import * as FileSaver from 'file-saver';
import { UserContext } from '../../../shared/services/user-context';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'order-notification',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'order-notification.template.html',
  styleUrls: ['order-notification.style.scss'],
  providers: [OrderNotificationService]
})
export class OrderNotificationComponent implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild(DatatableComponent)
  public table: DatatableComponent;
  public currentComponentWidth;
  public frm: FormGroup;
  public formErrors = {
    enteredBy: '',
    customer: '',
    poId: '',
    cancelledDateFrom: '',
    cancelledDateFromOnUtc: '',
    cancelledDateTo: '',
    cancelledDateToOnUtc: ''
  };
  public validationMessages = {
    cancelledDateFromOnUtc: {
      maxLength: 'Must be earlier than End Date .'
    },
    cancelledDateToOnUtc: {
      maxLength: 'Must be later than Start Date.'
    },
    default: {
      pattern: 'Date is not valid',
      required: 'This is required.'
    }
  };

  public myDateRangePickerOptions = {
    selectorWidth: '220px',
    dateFormat: 'mm/dd/yyyy',
    showTodayBtn: false,
    showClearDateBtn: true,
    alignSelectorRight: true,
    openSelectorOnInputClick: true,
    editableDateField: true,
    selectionTxtFontSize: '12px',
    height: '28px',
    firstDayOfWeek: 'su',
    sunHighlight: false
  };
  public cancelledDateFromOptions: any = {
    ...this.myDateRangePickerOptions
  };
  public cancelledDateToOptions: any = {
    ...this.myDateRangePickerOptions
  };

  public searchedObj = {};
  public tableData = {
    totalRecord: 0,
    data: []
  };

  public tableConfig = {
    keysort: 'createdOnUtc',
    keyword: '',
    orderDescending: true,
    currentPage: 1,
    pageSize: 10,
    loading: false
  };
  public header;
  public myConfigStyleHeader: any = {
    'font-size': '11px'
  };
  public isPageReadOnly = false;

  constructor(private _router: Router,
              private _fb: FormBuilder,
              private _validationService: ValidationService,
              private _modalService: NgbModal,
              private _orderNotifiSv: OrderNotificationService,
              private _userContext: UserContext,
              private _toastrService: ToastrService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _localStorageService: LocalStorageService,
              private _authService: AuthService,
              public myDatePickerService: MyDatePickerService) {
    // e
  }

  /**
   * Config text on breadcrumb
   */
  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('OrderLog.All.OrderNotification');
    this.buildForm();
    let filterStore = this._localStorageService.get('OrderNotification_FilterModel');
    if (filterStore) {
      this.frm.patchValue(filterStore);
    }
    let keySortStore = this._localStorageService.get('OrderNotification_KeySort');
    if (keySortStore) {
      this.tableConfig.keysort = keySortStore['key'].toString();
      this.tableConfig.orderDescending = !!keySortStore['orderDescending'];
    }
    this.getOrderNotification();
  }

  public getEditFunc(row): boolean {
    if (this.isPageReadOnly) {
      return false;
    }
    if (this._userContext.currentUser.listRole.some((i) => [
      'Account Supervisor',
      'Administrator'
    ].indexOf(i.roleName) > -1)) {
      return true;
    } else if (this._userContext.currentUser.listRole.some((i) => [
      'Account Manager',
      'Customer Service'
    ].indexOf(i.roleName) > -1)) {
      return row.customerServiceTeams.some((i) =>
        this._userContext.currentUser.customerServiceTeams.indexOf(i) > -1);
    } else {
      return false;
    }
  }

  public getAddOrderFunc(): boolean {
    if (this.isPageReadOnly) {
      return false;
    }
    if (this._userContext.currentUser.listRole.some((i) => [
      'Account Manager',
      'Account Supervisor',
      'Administrator',
      'Customer Service'
    ].indexOf(i.roleName) > -1)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Check if the table size has changed, recalculate table size
   */
  public ngAfterViewChecked() {
    if (this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
      this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
      setTimeout(() => {
        if (this.table) {
          this.table.recalculate();
        }
        this._changeDetectorRef.markForCheck();
      }, 200);
    }
  }

  public getOrderNotification(draw?: number) {
    let countSkip = draw ? draw * this.tableConfig.pageSize : 0;
    let pageSize = this.tableConfig.pageSize.toString();
    let orderDescending = this.tableConfig.orderDescending.toString();
    let keysort = this.tableConfig.keysort;

    let params: HttpParams = new HttpParams()
      .set('countSkip', countSkip.toString())
      .set('pageSize', pageSize)
      .set('orderDescending', orderDescending)
      .set('keysort', keysort)
      .set('enteredBy', this.frm.get('enteredBy').value)
      .set('poId', this.frm.get('poId').value)
      .set('customer', this.frm.get('customer').value)
      .set('cancelledDateFromOnUtc', this.frm.get('cancelledDateFromOnUtc').value)
      .set('cancelledDateToOnUtc', this.frm.get('cancelledDateToOnUtc').value);

    this._orderNotifiSv.getOrder(params)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.searchedObj = {...this.frm.value};
          this.tableConfig.loading = false;
          let responseData = resp.data;
          this.tableData.totalRecord = responseData.totalRecord;
          if (responseData.data && responseData.data.length) {
            responseData.data.forEach((o) => {
              if (o.poRange && o.poRange.length > 100) {
                o.poRangeShorten = o.poRange.substr(0, 100) + '...';
              }
            });
          }
          this.tableData.data = responseData.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public onSort(event: SortEvent): void {
    this.tableConfig.keysort = event.sorts[0].prop;
    this.tableConfig.orderDescending = event.sorts[0].dir === 'desc';
    this.tableConfig.loading = true;
    this.getOrderNotification(this.tableConfig.currentPage - 1);
    this._localStorageService.set('OrderNotification_KeySort',
      {key: this.tableConfig.keysort, orderDescending: this.tableConfig.orderDescending}
    );
  }

  public buildForm(): void {
    let controlConfig = {
      enteredBy: new FormControl(''),
      customer: new FormControl(''),
      poId: new FormControl(''),
      cancelledDateFrom: new FormControl(''),
      cancelledDateFromOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDate('cancelledDateToOnUtc')
        ])
      ]),
      cancelledDateTo: new FormControl(''),
      cancelledDateToOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MinDate('cancelledDateFromOnUtc')
        ])
      ]),
      formRequires: new FormControl({
        enteredBy: {
          required: false
        },
        customer: {
          required: false
        },
        poId: {
          required: false
        },
        cancelledDateFromOnUtc: {
          required: false
        },
        cancelledDateToOnUtc: {
          required: false
        }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);
    this.onValueChanged(); // (re)set validation messages now
  }

  /**
   * onValueChanged
   * @param data
   */
  public onValueChanged(data?: any): void {
    const form = this.frm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  public onKeyup(event): void {
    let e = <KeyboardEvent> event;
    if (e.keyCode === 13 && e.key === 'Enter') {
      this.filter();
    }
  }

  /**
   * Fire date change event with prop
   * @param event
   */
  public onDateChanged(event: IMyDateModel, prop: string) {
    let utcDate = Object.assign({}, event);
    this.frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');
    this.configDateOptions(prop, utcDate.jsdate);
    // Update status for form control whose value changed
    this.frm.get(prop).markAsDirty();
  }

  /**
   * Convert Date to IMyDate & Reconfig date options
   * @param prop
   * @param utcDate
   * @param i
   */
  public configDateOptions(prop: string, utcDate: Date): void {
    if (!utcDate) {
      switch (prop) {
        case 'cancelledDateFromOnUtc':
          // Config for cancel date options
          this.cancelledDateToOptions = {
            ...this.cancelledDateToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          this.cancelledDateFromOptions = {
            ...this.cancelledDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          if (this.frm) {
            this.frm.get('cancelledDateTo').setValue(null);
            this.frm.get('cancelledDateToOnUtc').setValue(null);
          }
          break;
        case 'cancelledDateToOnUtc':
          // Config for start date options
          this.cancelledDateFromOptions = {
            ...this.cancelledDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          break;
        default:
          break;
      }
      return;
    }
    let dateCurrentSince: IMyDate = {
      year: utcDate.getFullYear(),
      month: utcDate.getMonth() + 1,
      day: utcDate.getDate()
    };
    let dateCurrentUntil: IMyDate = {
      year: utcDate.getFullYear(),
      month: utcDate.getMonth() + 1,
      day: utcDate.getDate()
    };

    switch (prop) {
      case 'cancelledDateFromOnUtc':
        // Config for end date options
        this.cancelledDateToOptions = {
          ...this.cancelledDateToOptions,
          disableUntil: dateCurrentUntil,
          enableDays: []
        };
        break;
      case 'cancelledDateToOnUtc':
        // Config for start date options
        this.cancelledDateFromOptions = {
          ...this.cancelledDateFromOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        break;
      default:
        break;
    }
  }

  /**
   * Fire filter event
   */
  public filter(): void {
    // if (this.frm.invalid) {
    //   this._commonService.markAsDirtyForm(this.frm);
    //   return;
    // }
    this._localStorageService.set('OrderNotification_FilterModel', this.frm.value);
    this.getOrderNotification();
  }

  public addOrder() {
    let modalRef = this._modalService.open(AddOrderComponent, {
      keyboard: false,
      backdrop: 'static'
    });
    modalRef.result.then((res: any) => {
      if (res) {
        this.getOrderNotification();
      }
    }, (err) => {
      // if not, error
    });
  }

  /**
   * Page change event
   * @param draw
   */
  public onPageChange(draw: number): void {
    this.tableConfig.currentPage = draw + 1;
    this.getOrderNotification(draw);
  }

  /**
   * Page size change event
   * @param pageSize
   */
  public onSelectedPageSize(pageSize: number): void {
    this.tableConfig.pageSize = pageSize;
    this.getOrderNotification();
  }

  public editOrder(data) {
    let modalRef = this._modalService.open(AddOrderComponent, {
      size: 'lg',
      keyboard: true
    });
    modalRef.componentInstance.title = 'Edit';
    modalRef.componentInstance.orderInfo = data;
    modalRef.result.then((res: boolean) => {
      if (res) {
        this.getOrderNotification();
      }
    }, (err) => {
      // if not, error
    });
  }

  public deleteOrder(order) {
    let modalRef = this._modalService.open(ConfirmDialogComponent, {
      keyboard: true
    });
    modalRef.componentInstance.message = 'All configuration data will be deleted for ' +
      'this order notification. Continue?';
    modalRef.componentInstance.title = 'Confirm Order Notification Deletion';

    modalRef.result.then((res: boolean) => {
      if (res) {
        if (order.id) {
          this._orderNotifiSv
            .deleteOrder(order.id)
            .subscribe((resp: BasicResponse) => {
              if (resp.status) {
                this._toastrService.success(resp.message, 'Success');
                this.getOrderNotification();
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
      }
    });
  }

  /**
   * goToOrderInfo
   * @param {number} orderId
   */
  public goToOrderInfo(orderId: number): void {
    if (this._authService.checkCanView('Orders')) {
      this._router.navigate(['order-log-v2', orderId, 'order-info']);
    }
  }

  /**
   * Order notification export
   */
  public exportOrderNotification(type): void {
    let orderDescending = this.tableConfig.orderDescending.toString();
    let keysort = this.tableConfig.keysort;

    let params: HttpParams = new HttpParams()
      .set('orderDescending', orderDescending)
      .set('keysort', keysort)
      .set('enteredBy', this.frm.get('enteredBy').value)
      .set('poId', this.frm.get('poId').value)
      .set('customer', this.frm.get('customer').value)
      .set('cancelledDateFromOnUtc', this.frm.get('cancelledDateFromOnUtc').value)
      .set('cancelledDateToOnUtc', this.frm.get('cancelledDateToOnUtc').value);

    this._orderNotifiSv.exportOrderNotification(params)
      .subscribe((resp: any) => {
        let data = resp;
        let values = data.headers.get('Content-Disposition');
        let filename = values.split(';')[1].trim().split('=')[1];
        // remove " from file name
        filename = filename.replace(/"/g, '');
        let blob;
        if (type === 'pdf') {
          blob = new Blob([(<any> data).body],
            {type: 'application/pdf'}
          );
        } else if (type === 'xlsx') {
          blob = new Blob([(<any> data).body],
            {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
          );
        }
        FileSaver.saveAs(blob, filename);
      });
  }

  /**
   * onScrollX
   * @param event
   */
  public onScrollX(event): void {
    const dataTableList = document.getElementsByTagName('ngx-datatable');
    if (dataTableList && dataTableList.length) {
      const headerList = dataTableList[0].getElementsByClassName('datatable-header');
      if (headerList && headerList.length) {
        this.header = headerList[0];
      }
    }
    this.myConfigStyleHeader = {
      ...this.myConfigStyleHeader,
      left: this.header ? `${this.header.getBoundingClientRect().left}px` : 'auto'
    };
  }

  public ngOnDestroy(): void {
    this._localStorageService.set('OrderNotification_FilterModel', this.frm.value);
    this._localStorageService.set('OrderNotification_KeySort',
      {key: this.tableConfig.keysort, orderDescending: this.tableConfig.orderDescending}
    );
  }
}
