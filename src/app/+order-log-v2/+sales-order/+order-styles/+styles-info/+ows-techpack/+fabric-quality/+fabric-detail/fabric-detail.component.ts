import {
  Component,
  ViewEncapsulation,
  OnInit,
  AfterViewInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
  AfterViewChecked
} from '@angular/core';
import {
  ActivatedRoute
} from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  Subscription
} from 'rxjs/Subscription';
import * as _ from 'lodash';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  MyDatePickerService,
  CommonService,
  ValidationService,
  Util,
  AuthService
} from '../../../../../../../shared/services';
import {
  SalesOrderService
} from '../../../../../sales-order.service';
import {
  OwsTechpackService
} from '../../ows-techpack.service';
import {
  FabricDetailService
} from './fabric-detail.service';
import {
  FabricQualityService
} from '../fabric-quality.service';

// Interfaces
import {
  ResponseMessage,
  RowSelectEvent,
  UploadedType
} from '../../../../../../../shared/models';
import {
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  ApprovalStatusList,
  TechPackFileTypes
} from '../../ows-techpack.model';
import {
  TaskStatus
} from '../../../../../../../shared/models/column-status.model';

// Components
import {
  UploaderTypeComponent
} from '../../../../../../../shared/modules/uploader-type';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { NgSelectComponent } from '@ng-select/ng-select';
import { MaxDateToday } from '../../../../../../../shared/validators';
import { ExtraValidators } from '../../../../../../../shared/services/validation';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'fabric-detail',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'fabric-detail.template.html',
  styleUrls: [
    'fabric-detail.style.scss'
  ]
})
export class FabricDetailComponent implements OnInit,
                                              AfterViewInit,
                                              AfterViewChecked,
                                              OnDestroy {
  public orderId: number;
  public styleId: number;
  public fabricId: number;
  public preGeneralInfoData;
  public frm: FormGroup;
  public formErrors = {
    tscDueDateOnUtc: '',
    fabric: '',
    fabricConstruction: '',
    fabricWeight: '',
    submitsRequired: '',
    dateReceivedOnUtc: '',
    rejectedDateOnUtc: '',
    droppedDateOnUtc: '',
    approvalStatus: '',
    files: '',
    approvalDateOnUtc: '',
    approvalByUserId: '',
    comment: ''
  };
  public validationMessages = {
    tscDueDateOnUtc: {
      required: 'TSC Due Date is required.'
    },
    fabric: {
      required: 'Fabric is required.'
    },
    fabricConstruction: {
      required: 'Fabric Content is required.'
    },
    fabricWeight: {
      required: 'Fabric Weight is required.'
    },
    submitsRequired: {
      required: 'Submits Required is required.'
    },
    dateReceivedOnUtc: {
      required: 'Date Received is required.'
    },
    approvalStatus: {
      required: 'Approval Status is required.'
    },
    files: {
      required: 'Fabric files is required.'
    },
    approvalDateOnUtc: {
      required: 'Approval Date is required.'
    },
    approvalByUserId: {
      required: 'Approval By is required.'
    },
    comment: {
      required: 'Comment is required.'
    },
    default: {
      required: 'This is required.',
      maxLength: 'Date must be today’s date or earlier'
    }
  };
  public myDatePickerOptions: IMyDpOptions = {
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
  public myTodayPickerOptions = {
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
    sunHighlight: false,
    disableSince: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 1
    }
  };
  public yesNoOption = [{id: true, name: 'Yes'}, {id: false, name: 'No'}];
  public approvalStatusList: any = _.cloneDeep(ApprovalStatusList);
  public taskStatus = TaskStatus;
  public approvalByList = [];
  public uploadedType = UploadedType;
  public activatedSub: Subscription;
  public fabricInfoData: any;
  public canModifyOws = true;
  public isShowStickyBtn = false;
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild(DatatableComponent)
  public table: DatatableComponent;
  public tableLoading = false;
  public currentComponentWidth;
  public fabricsHistory = [];

  private _activatedRouteSub: Subscription;
  private _subOwsStatus: Subscription;

  constructor(private _activatedRoute: ActivatedRoute,
              private _fb: FormBuilder,
              private _validationService: ValidationService,
              private _utilService: Util,
              private _toastrService: ToastrService,
              private _modalService: NgbModal,
              public myDatePickerService: MyDatePickerService,
              private _authService: AuthService,
              private _commonService: CommonService,
              private _salesOrderService: SalesOrderService,
              private _owsTechpackService: OwsTechpackService,
              private _fabricQualityService: FabricQualityService,
              private _fabricDetailService: FabricDetailService,
              private _changeDetectorRef: ChangeDetectorRef) {
    this.orderId = +this._salesOrderService.orderIndex.orderId;
    this.styleId = +this._salesOrderService.orderIndex.styleId;
  }

  public ngOnInit(): void {
    this._subOwsStatus = this._owsTechpackService.getUpdateOws().subscribe((status) => {
      this.canModifyOws = status;
      this._changeDetectorRef.markForCheck();
    });
    this._activatedRouteSub = this._activatedRoute.params
      .subscribe((params: { id: number }) => {
        this.fabricId = params.id;
        this.buildForm();
        this.getFabric();
        this.getCommonData();
      });
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      if (this._utilService.scrollElm) {
        if (this._utilService.scrollElm
            .scrollHeight - window.innerHeight > 70) {
          this.isShowStickyBtn = true;
          this._changeDetectorRef.markForCheck();
        }
      }
    }, 1000);
  }

  public ngAfterViewChecked() {
    if (this.tableWrapper &&
      this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
      this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
      setTimeout(() => {
        this.table.recalculate();
      }, 200);
    }
  }

  /**
   * Row detail click event
   * @param event
   */
  public onActivate(event: RowSelectEvent): void {
    if (event) {
      event.cellElement.blur();
    }
  }

  public buildForm(): void {
    let controlConfig = {
      tscDueDate: new FormControl(null),
      tscDueDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      fabric: new FormControl(null, [Validators.required]),
      fabricConstruction: new FormControl(null, [Validators.required]),
      fabricWeight: new FormControl(null, [Validators.required]),
      submitsRequired: new FormControl(null, [Validators.required]),
      dateReceived: new FormControl(null),
      dateReceivedOnUtc: new FormControl(null, [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      rejectedDate: new FormControl(null),
      rejectedDateOnUtc: new FormControl(null, [
        Validators.compose([
          ExtraValidators.conditional((group) =>
              this.getSpecialRequireCase(group, 'rejectedDateOnUtc'),
            Validators.required
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      droppedDate: new FormControl(null),
      droppedDateOnUtc: new FormControl(null, [
        Validators.compose([
          ExtraValidators.conditional((group) =>
              this.getSpecialRequireCase(group, 'droppedDateOnUtc'),
            Validators.required
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      approvalStatus: new FormControl(null),
      files: new FormControl(null),
      approvalDate: new FormControl(null),
      approvalDateOnUtc: new FormControl(null, [
        Validators.compose([
          ExtraValidators.conditional((group) =>
              this.getSpecialRequireCase(group, 'approvalDateOnUtc'),
            Validators.required
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      approvalByUserId: new FormControl(null),
      approvalByUserName: new FormControl(null),
      comment: new FormControl(null),
      formRequires: new FormControl({
        tscDueDateOnUtc: {
          required: false
        },
        fabric: {
          required: true
        },
        fabricConstruction: {
          required: true
        },
        fabricWeight: {
          required: true
        },
        submitsRequired: {
          required: true
        },
        dateReceivedOnUtc: {
          required: false
        },
        rejectedDateOnUtc: {
          required: false
        },
        droppedDateOnUtc: {
          required: false
        },
        approvalStatus: {
          required: false
        },
        files: {
          required: false
        },
        approvalDateOnUtc: {
          required: false
        },
        approvalByUserId: {
          required: false
        },
        comment: {
          required: false
        }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);
    this.onValueChanged(); // (re)set validation messages now
  }

  public onValueChanged(): void {
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

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    if (key === 'approvalDateOnUtc') {
      let isRequired = [
        this.taskStatus.APPROVED,
        this.taskStatus.APPROVEDWCHANGES
      ].indexOf(+frm.get('approvalStatus').value) > -1;
      frm.get('formRequires').value[key].required = isRequired;
      return isRequired;
    } else if (key === 'rejectedDateOnUtc') {
      let isRequired = [
        this.taskStatus.REJECTED
      ].indexOf(+frm.get('approvalStatus').value) > -1;
      frm.get('formRequires').value[key].required = isRequired;
      return isRequired;
    } else if (key === 'droppedDateOnUtc') {
      let isRequired = [
        this.taskStatus.DROPPED
      ].indexOf(+frm.get('approvalStatus').value) > -1;
      frm.get('formRequires').value[key].required = isRequired;
      return isRequired;
    } else {
      return false;
    }
  }

  public getFabric(): void {
    this.tableLoading = true;
    this._fabricDetailService.getFabricInfo(this.styleId, this.fabricId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.fabricInfoData = resp.data;
          this.fabricsHistory = resp.data.histories;
          this.updateForm(this.fabricInfoData);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this.tableLoading = false;
        this._changeDetectorRef.markForCheck();
      });
  }

  public getCommonData(): void {
    this._commonService.getImportsDeptList()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.approvalByList = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
  }

  /**
   * Update form value
   * @param data
   */
  public updateForm(data): void {
    this.frm.patchValue(data);
    this.setDateValue(this.frm);
    this._changeDetectorRef.markForCheck();
    setTimeout(() => {
      this.preGeneralInfoData = _.cloneDeep(this.frm.getRawValue());
    });
  }

  public setDateValue(frm: FormGroup): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (frm.get(importName).value) {
        const listNotUpdateTime = [
          ''
        ];
        const utcDate = new Date(frm.get(importName).value);
        let currentDate;
        if (listNotUpdateTime.indexOf(importName) > -1) {
          currentDate = new Date(frm.get(importName).value);
        } else {
          currentDate = new Date(Date.UTC(utcDate.getFullYear(),
            utcDate.getMonth(), utcDate.getDate(), utcDate.getHours(), utcDate.getMinutes()));
        }
        frm.get(exportName).setValue({
          date: {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            day: currentDate.getDate()
          }
        });
      } else {
        frm.get(importName).patchValue(null);
        frm.get(exportName).patchValue(null);
      }
    };
    // patchDateFunc('tscDueDateOnUtc', 'tscDueDate');
    patchDateFunc('approvalDateOnUtc', 'approvalDate');
    patchDateFunc('rejectedDateOnUtc', 'rejectedDate');
    patchDateFunc('droppedDateOnUtc', 'droppedDate');
    patchDateFunc('dateReceivedOnUtc', 'dateReceived');
    this._changeDetectorRef.markForCheck();
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public onSelectOpen(select: NgSelectComponent): void {
    if (!select.multiple && select.selectedItems && select.selectedItems.length) {
      let filterVal = select.selectedItems[0].label;
      select.filterValue = filterVal ? filterVal : '';
    }
  }

  public onDateChangedBy(event: IMyDateModel, frm: FormGroup, prop: string): void {
    let utcDate = Object.assign({}, event);
    frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');
    // Update status for form control whose value changed
    frm.get(prop).markAsDirty();
    this._changeDetectorRef.markForCheck();
  }

  public openUploader(frm: FormGroup, type: number): void {
    const funcUpload = (fileList: any[]) => {
      let modalRef = this._modalService.open(UploaderTypeComponent, {
        size: 'lg',
        keyboard: false,
        backdrop: 'static',
        windowClass: 'super-lg'
      });
      modalRef.componentInstance.title = 'Fabric';
      Object.assign(modalRef.componentInstance.uploadOptions, {
        id: this.styleId,
        fileList,
        uploadType: type,
        fileType: type,
        isReadOnly: !this.canModifyOws
      });

      modalRef.result.then((res) => {
        if (res.status) {
          let isShownMsg = false;
          if (res.deletedList && res.deletedList.length) {
            let currentTypeList = frm.get('files').value;
            res.deletedList.forEach((item) => {
              let indexItem = currentTypeList.findIndex((i) => i.id === item.id);
              if (indexItem > -1) {
                currentTypeList.splice(indexItem, 1);
              }
            });
            if (currentTypeList.length === 0 && res.newList.length === 0) {
              isShownMsg = true;
              this._toastrService
                .success(`Fabric files removed successfully.`, 'Success');
            }

            frm.get('files').setValue([...currentTypeList]);
            this._changeDetectorRef.markForCheck();
          }
          if (res.updateList && res.updateList.length) {
            let currentTypeList = frm.get('files').value;
            res.updateList.forEach((item) => {
              let indexItem = currentTypeList.findIndex((i) => i.fileName === item.fileName);
              if (indexItem > -1) {
                currentTypeList[indexItem] = item;
              }
            });

            frm.get('files').setValue([...currentTypeList]);
            this._changeDetectorRef.markForCheck();
          }
          if (res.newList && res.newList.length) {
            let currentTypeList = frm.get('files').value;
            if (!currentTypeList.length) {
              isShownMsg = true;
              this._toastrService
                .success(`Fabric files uploaded successfully.`, 'Success');
            }

            if (res.duplicatedList && res.duplicatedList.length) {
              res.duplicatedList.forEach((i) => {
                if (currentTypeList.indexOf(i) > -1) {
                  currentTypeList.splice(currentTypeList.indexOf(i), 1);
                }
              });
            }
            frm.get('files').setValue([...currentTypeList, ...res.newList]);
            this._changeDetectorRef.markForCheck();
          }

          if (!isShownMsg) {
            this._toastrService
              .success(`Updated successfully.`, 'Success');
          }
        }
      }, (err) => {
        // empty
      });
    };
    // const fileList = frm.get('files').value.filter((i) => i.type === type);
    setTimeout(() => {
      const fileList = frm.get('files').value;
      funcUpload(fileList);
    }, 100);
  }

  public checkLengthUploaderByType(frm: any, type: number): boolean {
    return frm.get('files').value && frm.get('files').value.length;
  }

  public onSelectItem(val, frm, valProp: string, formControlName: string): void {
    if (val[valProp]) {
      frm.get(formControlName).patchValue(val[valProp]);
    } else {
      // add new
      frm.get(formControlName).patchValue(val);
    }
  }

  public openViewFiles(historyId): void {
    let fileList = [];
    this._owsTechpackService.getHistoryFiles(this.styleId,
      historyId, TechPackFileTypes.FabricQualityDetail)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          fileList = Object.assign([], resp.data);
          let modalRef = this._modalService.open(UploaderTypeComponent, {
            size: 'lg',
            keyboard: false,
            backdrop: 'static',
            windowClass: 'super-lg'
          });
          modalRef.componentInstance.title = 'Fabric History';
          Object.assign(modalRef.componentInstance.uploadOptions, {
            id: '',
            isReadOnly: true,
            fileList
          });
          modalRef.result.then((res) => {
            // e
          }, (err) => {
            // e
          });
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public toApprovalStatusName(id) {
    let status = this.approvalStatusList.find((s) => s.id === id);
    return status ? status.name : '';
  }

  public onSubmitForm(type: number): void {
    // type: Save = 1, ReSubmit = 2
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
      this._changeDetectorRef.markForCheck();
      return;
    }
    this.myDatePickerService.addTimeToDateArray(this.frm, [
      'approvalDateOnUtc',
      'rejectedDateOnUtc',
      'droppedDateOnUtc',
      'dateReceivedOnUtc'
    ]);
    this.tableLoading = true;
    this._fabricDetailService.updateFabricInfo(this.styleId, this.fabricId, type, this.frm.value)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this._fabricQualityService.setUpdateFabric(resp.data);
          this.fabricInfoData = resp.data;
          this.fabricsHistory = resp.data.histories;
          this.updateForm(this.fabricInfoData);
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this.tableLoading = false;
        this._changeDetectorRef.markForCheck();
      });
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

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  public onAppScroll(event: any) {
    if (event.type === 'resize') {
      if (this._utilService.scrollElm &&
        this._utilService.scrollElm.scrollHeight - (this._utilService.scrollElm.scrollTop
          + window.innerHeight) < 70) {
        this.isShowStickyBtn = false;
      } else if (this._utilService.scrollElm) {
        this.isShowStickyBtn = true;
      }
      return;
    }
    if (event.target.scrollingElement.scrollHeight - (event.target.scrollingElement
        .scrollTop + window.innerHeight) < 70) {
      this.isShowStickyBtn = false;
    } else {
      this.isShowStickyBtn = true;
    }
    this._changeDetectorRef.markForCheck();
  }

  public ngOnDestroy(): void {
    this._activatedRouteSub.unsubscribe();
    this._subOwsStatus.unsubscribe();
  }
}
