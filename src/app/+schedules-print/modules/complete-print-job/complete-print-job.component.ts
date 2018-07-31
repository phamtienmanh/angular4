import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Input,
  ElementRef
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

import {
  HttpParams
} from '@angular/common/http';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';
import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

// Services
import {
  UserContext
} from '../../../shared/services/user-context';
import {
  CommonService
} from '../../../shared/services/common';
import {
  CompletePrintJobService
} from './complete-print-job.servive';
import {
  ValidationService
} from '../../../shared/services/validation/validation.service';

// Component
import {
  ScanBarcodeComponent,
  ConfirmJobComponent
} from '../../modules';

// Interfaces
import {
  ResponseMessage,
  BasicGeneralInfo,
  BasicResponse
} from '../../../shared/models/index';
import {
  ConfirmDialogComponent
} from '../../../shared/modules/confirm-dialog/confirm-dialog.component';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'complete-print-job',  // <sign-in></sign-in>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'complete-print-job.template.html',
  styleUrls: [
    'complete-print-job.style.scss'
  ]
})
export class CompletePrintJobComponent implements OnInit {
  @Input()
  public schedulerId: number;
  @Input()
  public isTsc = true;
  @Input()
  public isLateOriginal = false;
  @Input()
  public isLateRescheduled = false;

  public tabs = [
    {
      name: 'Job Detail',
      isActive: true
    },
    {
      name: 'Issues',
      isActive: false
    }
  ];
  public frm: FormGroup;
  public formErrors = {
    issueName: '',
    comments: '',
    timeSpent: ''
  };
  public validationMessages = {
    issueName: {
      required: 'Issue Name is required.'
    },
    comments: {
      required: 'Comments is required.'
    },
    timeSpent: {
      required: 'Time Spent is required.'
    }
  };
  public issueList = [];
  public issueSelection = [];
  public tableData = {};
  public tableDataOrigin;
  public jobData: any = {};
  public machineData;
  public blankSizes = [
    {
      id: 0,
      name: 'Scheduled Qtys',
      prop: 'scheduledQty'
    },
    {
      id: 1,
      name: 'Damage Qtys',
      prop: 'damageQty'
    },
    {
      id: 2,
      name: '1st Quality Print Qtys',
      prop: '1stQty'
    }
  ];

  public editing = {};
  public isPageReadOnly = false;
  public curDate;

  public isFromPrint = false;
  public isShowConfirmBtn = false;
  public isScanBadge = false;
  public processTypeName: string;
  public isFromNL = false;

  public inCompleteList;

  public isMovedToTomorrow = false;
  public isAdmin = false;

  public newStartedSetupTime;
  public newPrintETATime;

  public ignoreSetup = false;

  constructor(private _el: ElementRef,
              private _router: Router,
              private _toastrService: ToastrService,
              public activeModal: NgbActiveModal,
              private _modalService: NgbModal,
              private _validationService: ValidationService,
              private _userContext: UserContext,
              private _commonService: CommonService,
              private _completeJobSv: CompletePrintJobService,
              private _changeDetectorRef: ChangeDetectorRef) {
    // empty
  }

  public ngOnInit(): void {
    this.isShowConfirmBtn = !this.isTsc;
    this.curDate = new Date();
    this.isAdmin = this._userContext.currentUser.listRole
      .findIndex((i) => i.roleName === 'Administrator') > -1;
    this.buildForm();
    this.updateTime();
    this.getCommonData();
    this.getProcessJob();
    this.getProcessJobIssue();
    if (this._router.url.includes('schedules-print/tsc-print')) {
      this.processTypeName = 'Print';
    } else if (this._router.url.includes('schedules-print/neck-label')) {
      this.processTypeName = 'Neck Label';
      this.ignoreSetup = true;
    } else if (this._router.url.includes('schedules-print/finishing')) {
      this.processTypeName = 'Finishing';
      this.ignoreSetup = true;
    }
    if (this.machineData && this.machineData.isMovedToTomorrow) {
      // this.isMovedToTomorrow = true;
      this.ignoreSetup = true;
    }
    this.newStartedSetupTime = this.machineData.setupETA;
    this.newPrintETATime = this.machineData.completedTimeOnUtc;
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public buildForm(): void {
    let controlConfig = {
      issueName: new FormControl(null, [Validators.required]),
      comments: new FormControl(''),
      timeSpent: new FormControl(''),
      formRequires: new FormControl({
        issueName: {
          required: true
        },
        comments: {
          required: false
        },
        timeSpent: {
          required: false
        }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);

    this.onValueChanged(); // (re)set validation messages now
  }

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

  public onAddIssue(): void {
    if (this.frm.valid) {
      if (!this.frm.get('timeSpent').value) {
        this.frm.get('timeSpent').patchValue(0);
      }
      this._completeJobSv.addIssue(this.schedulerId, this.frm.value)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this.getProcessJobIssue();
            this.buildForm();
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }

  public onDeleteIssue(issue, index) {
    let confirmModal = this._modalService.open(ConfirmDialogComponent, {
      keyboard: false,
      backdrop: 'static'
    });
    confirmModal.componentInstance.title = 'Confirm Issue Deletion';
    confirmModal.componentInstance.message = 'Are you sure you want to delete issue ‘'
      + issue.issueName + '’?';
    this._el.nativeElement.className = 'hide';

    confirmModal.result.then((res: any) => {
      this._el.nativeElement.className = '';
      if (res) {
        this._completeJobSv.deleteIssue(this.schedulerId, issue.id)
          .subscribe((resp: BasicResponse) => {
            if (resp.status) {
              this.issueList.splice(index, 1);
              this._toastrService.success(resp.message, 'Success');
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
        });
      }
    }, (err) => {
      this._el.nativeElement.className = '';
    });
  }

  public getProcessJob() {
    this._completeJobSv.getProcessJob(this.machineData.id)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.data) {
          this.jobData = resp.data;
          this.calculateStartedSetupTime();
          if (this.jobData.processStatus >= 3 && this.jobData.processStatus < 7) {
            this.isPageReadOnly = true;
          }
          if (resp.data && resp.data.sizes) {
            this.tableData['sizes'] = resp.data.sizes;
            this.calculateTotalQty();
            this.getInCompleteList();
            this.setZeroData();
            if (this.isFullfillData() || !this.isTsc) {
              this.isShowConfirmBtn = true;
            }
            this.tableDataOrigin = JSON.parse(JSON.stringify(this.tableData));
          }
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public getProcessJobIssue() {
    this._completeJobSv.getProcessJobIssue(this.schedulerId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.issueList = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
  }

  public getCommonData() {
    this._commonService.getIssueList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.issueSelection = resp.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public switchTab(index: number): void {
    let prevTabIndex = this.tabs.findIndex((t) => t.isActive);
    this.tabs[prevTabIndex].isActive = false;
    this.tabs[index].isActive = true;
  }

  public calculateTotalQty(update?) {
    // calculate total qty
    this.blankSizes.forEach((size) => {
      let totals = 0;
      if (!update) {
        this.tableData[size.prop] = this.tableData['sizes'].filter((s) => s.qtyType === size.id);
      }
      this.tableData[size.prop].forEach((item, index) => {
        totals += item.qty;
      });
      this.tableData[size.prop].totalQty = totals;
    });
    // init dmg and 1st if no data
    const actualLength = this.tableData[this.blankSizes[0].prop].length;
    if (this.tableData[this.blankSizes[1].prop].length < actualLength ||
      this.tableData[this.blankSizes[2].prop].length < actualLength) {
      this.tableData[this.blankSizes[1].prop] = [];
      this.tableData[this.blankSizes[2].prop] = [];
      this.tableData[this.blankSizes[0].prop].forEach((item) => {
        for (let i = 1; i < 3; i++) {
          this.tableData[this.blankSizes[i].prop].push(
            {
              sizeId: item.sizeId,
              qty: null,
              qtyType: this.blankSizes[i].id
            }
          );
        }
      });
      for (let i = 1; i < 3; i++) {
        let totals = 0;
        this.tableData['sizes'].forEach((s) => {
          if (s.qtyType === this.tableData[this.blankSizes[i].prop][0].qtyType) {
            let index =
              this.tableData[this.blankSizes[i].prop].findIndex((d) => d.sizeId === s.sizeId);
            if (index > -1) {
              this.tableData[this.blankSizes[i].prop][index].qty = s.qty;
              totals += s.qty;
            }
          }
        });
        this.tableData[this.blankSizes[i].prop].totalQty = totals;
      }
    }
    // calculate Totals
    this.tableData['totals'] = [];
    this.tableData[this.blankSizes[0].prop].forEach((item, index) => {
      if (this.tableData[this.blankSizes[1].prop][index].qty !== null &&
        this.tableData[this.blankSizes[2].prop][index].qty !== null) {
        this.tableData['totals'].push(
          this.tableData[this.blankSizes[1].prop][index].qty
          + this.tableData[this.blankSizes[2].prop][index].qty
        );
      } else {
        this.tableData['totals'].push(0);
      }
    });
    if (this.tableData[this.blankSizes[1].prop].totalQty !== null &&
      this.tableData[this.blankSizes[2].prop].totalQty !== null) {
      this.tableData['totals'].totalQty =
        this.tableData[this.blankSizes[1].prop].totalQty
        + this.tableData[this.blankSizes[2].prop].totalQty;
    } else {
      this.tableData['totals'].totalQty = 0;
    }
  }

  public onDoubleClicked(event, cell, sizeIndex): void {
    if (!this.tableData[this.blankSizes[0].prop][sizeIndex].qty ||
      (this.jobData && (this.jobData.processStatus === 7 || !this.jobData.startedTimeOnUtc) &&
      this.isTsc)) {
      return;
    }
    if (!this.isPageReadOnly) {
      this.editing[`${sizeIndex}-${cell}`] = true;
    }
  }

  public onUpdateValue(event, prop, sizeIndex) {
    this.editing[`${sizeIndex}-${prop}`] = false;
    if (this.invalidQty(sizeIndex, prop)) {
      return;
    }
    this.tableData[prop][sizeIndex].qty = Number.parseInt(event.target.value);
    if (!event.target.value) {
      this.tableData[prop][sizeIndex].qty = null;
    }
    this.calculateTotalQty(true);
    if (this.isFullfillData() || !this.isTsc) {
      this.isShowConfirmBtn = true;
    } else {
      this.isShowConfirmBtn = false;
    }
    if (this.tableData[prop][sizeIndex].qty !== null) {
      this.onSaveJob(false);
    }
    this._changeDetectorRef.markForCheck();
  }

  public onKeydown(event, prop, sizeIndex): void {
    let e = <KeyboardEvent> event;
    let propIndex = this.blankSizes.findIndex((s) => s.prop === prop);
    let preProp;
    let nextProp;
    if (this.blankSizes[propIndex - 1]) {
      preProp = this.blankSizes[propIndex - 1].prop;
    }
    if (this.blankSizes[propIndex + 1]) {
      nextProp = this.blankSizes[propIndex + 1].prop;
    }
    // on esc
    if (e.keyCode === 27) {
      event.target.value = this.tableData[prop][sizeIndex].qty;
      this.editing[`${sizeIndex}-${prop}`] = false;
    } else if ((!event.shiftKey && e.keyCode === 9 && e.code === 'Tab')
      || (e.keyCode === 39 && e.code === 'ArrowRight')
      || (e.keyCode === 13 && (e.code === 'Enter' || e.code === 'NumpadEnter'))) {
      let step = 0;
      if (sizeIndex < this.tableData[prop].length - 1) {
        for (let i = sizeIndex + 1; i < this.tableData[prop].length; i++) {
          if (this.tableData[this.blankSizes[0].prop][i].qty === 0) {
            step++;
          } else {
            break;
          }
        }
        if (sizeIndex + 1 + step < this.tableData[prop].length) {
          this.editing[`${sizeIndex + 1 + step}-${prop}`] = true;
          step = 0;
        }
      }
      if (sizeIndex === this.tableData[prop].length - 1 || step) {
        if (!nextProp) {
          this.onUpdateValue(event, prop, sizeIndex);
        }
        step = 0;
        for (let i = 0; i < this.tableData[prop].length - 1; i++) {
          if (this.tableData[this.blankSizes[0].prop][i].qty === 0) {
            step++;
          } else {
            break;
          }
        }
        this.editing[`${0 + step}-${nextProp}`] = true;
      }
    } else if ((event.shiftKey && e.keyCode === 9 && e.code === 'Tab')
      || (e.keyCode === 37 && e.code === 'ArrowLeft')) {
      let step = 0;
      if (sizeIndex > 0) {
        for (let i = sizeIndex - 1; i >= 0; i--) {
          if (this.tableData[this.blankSizes[0].prop][i].qty === 0) {
            step++;
          } else {
            break;
          }
        }
        if (sizeIndex - 1 - step >= 0) {
          this.editing[`${sizeIndex - 1 - step}-${prop}`] = true;
          step = 0;
        }
      }
      if (sizeIndex === 0 || step) {
        if (!preProp) {
          this.onUpdateValue(event, prop, sizeIndex);
        }
        step = 0;
        for (let i = this.tableData[prop].length - 1; i > 0; i--) {
          if (this.tableData[this.blankSizes[0].prop][i].qty === 0) {
            step++;
          } else {
            break;
          }
        }
        this.editing[`${this.tableData[prop].length - 1 - step}-${preProp}`] = true;
      }
    } else if (e.keyCode === 38 && e.code === 'ArrowUp') {
      if (preProp) {
        this.editing[`${sizeIndex}-${preProp}`] = true;
      }
    } else if (e.keyCode === 40 && e.code === 'ArrowDown') {
      if (nextProp) {
        this.editing[`${sizeIndex}-${nextProp}`] = true;
      }
    } else if (e.keyCode === 46 && e.code === 'Delete') {
      event.target.value = null;
    } else {
      return;
    }
  }

  public invalidQty(index, type) {
    // let inputQty = document.getElementById(`${index}-${type}`);
    // if (inputQty && inputQty['value']) {
    //   if (Number.parseInt(inputQty['value'])
    //     + this.tableData['schedOtherJobsSizes'][index].qty >
    //     this.tableData['productionSizes'][index].qty) {
    //     return true;
    //   }
    // }
    // if (inputQty && !inputQty['value']) {
    //   return true;
    // }
    return false;
  }

  public startSetupJob(action) {
    let params: HttpParams = new HttpParams()
      .set('action', action);
    this._completeJobSv.startSetupJob(this.machineData.id, params)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.data) {
          this.jobData = resp.data;
          this.calculateStartedSetupTime();
          this._changeDetectorRef.markForCheck();
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public startPrintJob(action) {
    let params: HttpParams = new HttpParams()
      .set('action', action);
    this._completeJobSv.startPrintJob(this.machineData.id, params)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.data) {
          this.jobData = resp.data;
          this.calculateStartedSetupTime();
          this._changeDetectorRef.markForCheck();
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public pauseJob() {
    this._completeJobSv.pauseJob(this.machineData.id)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.data) {
          this.jobData = resp.data;
          this._changeDetectorRef.markForCheck();
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public resumeJob() {
    this._completeJobSv.resumeJob(this.machineData.id)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.data) {
          this.jobData = resp.data;
          this.calculateStartedSetupTime();
          this._changeDetectorRef.markForCheck();
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public openScanBadgeId(): void {
    if (this.isTsc) {
      this.isScanBadge = true;
      let modalRef = this._modalService.open(ScanBarcodeComponent, {
        size: 'lg',
        keyboard: false,
        backdrop: 'static'
      });
      modalRef.result.then((res) => {
        if (res.status) {
          this.openProcessJob();
        } else {
          this.isScanBadge = false;
        }
        this._changeDetectorRef.markForCheck();
      }, (err) => {
        // empty
      });
    } else {
      this.openProcessJob();
    }
  }

  public openProcessJob(): void {
    this.isScanBadge = true;
    let modalRef = this._modalService.open(ConfirmJobComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static'
    });
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.result.then((res) => {
      if (res.status) {
        this.activeModal.close(false);
      }
      this.getProcessJob();
      this.isScanBadge = false;
      this._changeDetectorRef.markForCheck();
    }, (err) => {
      // empty
    });
  }

  public onSubmit() {
    if (!this.isTsc && !this.isFullfillData()) {
      return;
    }
    if (this.trackingChange()) {
      this.onSaveJob(false).then((resp) => {
        this.openScanBadgeId();
      });
    } else {
      this.openScanBadgeId();
    }
  }

  public onSaveJob(shouldClose: boolean = true): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.jobData.processStatus && this.isTsc) {
        this.activeModal.close();
        resolve(true);
        return;
      }
      if (!this.trackingChange()) {
        this.activeModal.close();
        resolve(true);
        return;
      }
      let model = this.tableData[this.blankSizes[1].prop]
        .concat(this.tableData[this.blankSizes[2].prop]);
      model = model.filter((d) => d.qty !== null);
      // remove qty with scheduled qty = 0
      let nullQtyId = this.tableData[this.blankSizes[0].prop].filter((t) => t.qty === 0);
      nullQtyId.forEach((d) => {
        model = model.filter((m) => m.sizeId !== d.sizeId);
      });
      this._completeJobSv.saveJob(this.machineData.id, model)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.data) {
            if (shouldClose) {
              this.activeModal.close();
            }
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          resolve(true);
        });
    });
  }

  public isFullfillData() {
    if (!this.tableData[this.blankSizes[1].prop] || !this.tableData[this.blankSizes[2].prop]) {
      return false;
    }
    let dmgIndex =
          this.tableData[this.blankSizes[1].prop].findIndex((s) => s.qty === null);
    let firstQtyIndex =
          this.tableData[this.blankSizes[2].prop].findIndex((s) => s.qty === null);
    if (dmgIndex > -1 || firstQtyIndex > -1) {
      return false;
    }
    return true;
  }

  public trackingChange() {
    let isDataChange = false;
    for (let i = 0; i < this.tableData[this.blankSizes[0].prop].length; i++) {
      Object.keys(this.tableData).forEach((k) => {
        if (this.tableData[k][i].qty !== this.tableDataOrigin[k][i].qty) {
          isDataChange = true;
        }
      });
    }
    return isDataChange;
  }

  public updateTime() {
    setTimeout(() => {
      this.curDate = new Date();
      this._changeDetectorRef.markForCheck();
      this.updateTime();
    }, 500);
  }

  public setIncompleteSize(size: string, index) {
    if (this.jobData.processStatus >= 3 && this.jobData.processStatus < 7) {
      return;
    }
    if (!this.inCompleteList[index]) {
      return;
    }
    if (this.tableData[this.blankSizes[0].prop][index].qty === 0) {
      return;
    }
    let params: HttpParams = new HttpParams()
      .set('isProcessJob', 'true');
    this._completeJobSv.setIncompleteSize(
      this.machineData.id, !this.inCompleteList[index].isIncommpleted, size, params)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.inCompleteList[index].isIncommpleted =
            !this.inCompleteList[index].isIncommpleted;
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public getInCompleteList() {
    this.inCompleteList =
      JSON.parse(JSON.stringify(this.jobData.sizes.filter((j) => j.qtyType === 0)));
  }

  public setZeroData() {
    for (let i = 0; i < this.tableData[this.blankSizes[0].prop].length; i++) {
      if (this.tableData[this.blankSizes[0].prop][i].qty === 0) {
        this.tableData[this.blankSizes[1].prop][i].qty = 0;
        this.tableData[this.blankSizes[2].prop][i].qty = 0;
      }
    }
  }

  public groupByType(item) {
    const issueTypes = [
      {
        type: 1,
        label: 'Setup Issues: '
      },
      {
        type: 2,
        label: 'Runtime Issues: '
      }
    ];
    let type = issueTypes.find((t) => {
      return t.type === item.type;
    });
    return type ? type.label : '';
  }

  public calculateStartedSetupTime() {
    let newSetupTime;
    // start setup
    if (this.jobData.startedSetupTimeOnUtc && !this.jobData.stoppedSetupTimeOnUtc) {
      newSetupTime = moment.utc(this.jobData.startedSetupTimeOnUtc).local().toDate();
      newSetupTime.setHours(
        newSetupTime.getHours(),
        newSetupTime.getMinutes() + this.machineData.setuptime
      );
      this.newStartedSetupTime = new Date(newSetupTime.getTime());
      newSetupTime.setHours(
        newSetupTime.getHours(),
        newSetupTime.getMinutes() + this.machineData.runtime * 60 + this.machineData.pauseTime
      );
      this.newPrintETATime = new Date(newSetupTime.getTime());
    }
    // complete setup
    if (this.jobData.stoppedSetupTimeOnUtc && !this.jobData.startedTimeOnUtc) {
      newSetupTime = moment.utc(this.jobData.stoppedSetupTimeOnUtc).local().toDate();
      newSetupTime.setHours(
        newSetupTime.getHours(),
        newSetupTime.getMinutes() + this.machineData.runtime * 60 + this.machineData.pauseTime
      );
      this.newPrintETATime = new Date(newSetupTime.getTime());
    }
    if (this.ignoreSetup && !this.jobData.startedTimeOnUtc) {
      this.newPrintETATime = this.machineData.setupETA;
    }
    // job started
    if (this.jobData.stoppedSetupTimeOnUtc && this.jobData.startedTimeOnUtc) {
      newSetupTime = moment.utc(this.jobData.startedTimeOnUtc).local().toDate();
      newSetupTime.setHours(
        newSetupTime.getHours(),
        newSetupTime.getMinutes() + this.machineData.runtime * 60 + this.jobData.pauseTime
      );
      this.newPrintETATime = new Date(newSetupTime.getTime());
    }
  }
}
