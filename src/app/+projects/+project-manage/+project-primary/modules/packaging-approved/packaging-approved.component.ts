import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  NgbActiveModal,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

import {
  IMyDate,
  IMyDateModel
} from 'mydatepicker';

import {
  PackagingApprovedService
} from './packaging-approved.service';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  CommonService
} from '../../../../../shared/services/common';
import {
  ValidationService
} from '../../../../../shared/services/validation';
import {
  MyDatePickerService
} from '../../../../../shared/services/my-date-picker';
import {
  ExtraValidators
} from '../../../../../shared/services/validation';
import * as NProgress from 'nprogress';
import * as _ from 'lodash';
import {
  UserContext
} from '../../../../../shared/services/user-context';

// Validators
import {
  MaxDate,
  MaxDateToday,
  MinDate
} from '../../../../../shared/validators';

// Interfaces
import {
  Status,
  TaskStatus
} from '../../project-primary.model';
import {
  ResponseMessage,
  UploadedImage
} from '../../../../../shared/models';
import {
  LeadEtaComponent
} from '../index';
import {
  FileItem,
  FileUploader
} from 'ng2-file-upload';
import {
  SelectPackagingComponent
} from './modules/select-packaging';
import {
  ConfirmDialogComponent
} from '../../../../../shared/modules/confirm-dialog';
import {
  PackagingType
} from './packaging-approved.model';
import { AppConstant } from '../../../../../app.constant';

@Component({
  selector: 'packaging-approved',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'packaging-approved.template.html',
  styleUrls: [
    'packaging-approved.style.scss'
  ]
})
export class PackagingApprovedComponent implements OnInit, AfterViewChecked {
  @ViewChildren('packagingNameList')
  public packagingNameList: QueryList<ElementRef>;
  @Input()
  public isPageReadOnly = false;
  @Input()
  public isLeadTimeReadOnly = false;
  @Input()
  public rowDetail;
  @Input()
  public projectId;
  @Input()
  public productId;

  @ViewChild(LeadEtaComponent)
  public leadEtaComponent: LeadEtaComponent;

  public statusData = Status.filter((stt) => [
    'Approved',
    'Approved w/ Changes',
    'Rejected',
    'Dropped'
  ].indexOf(stt.name) > -1);

  public frm: FormGroup;
  public formErrors = {
    dateSubmittedOnUtc: '',
    dateRejectedOnUtc: '',
    dateDroppedOnUtc: '',
    dateApprovedOnUtc: ''
  };
  public validationMessages = {
    dateSubmittedOnUtc: {},
    dateRejectedOnUtc: {},
    dateDroppedOnUtc: {},
    dateApprovedOnUtc: {},
    default: {
      required: 'This is required.',
      maxLength: 'Date must be today’s date or earlier'
    }
  };
  public myDatePickerOptions = {
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
    // disableSince: {
    //   year: new Date().getFullYear(),
    //   month: new Date().getMonth() + 1,
    //   day: new Date().getDate() + 1
    // }
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
  public taskStatus = TaskStatus;
  public uploader: FileUploader;

  public packagingMaxHeight = '';
  public isPackagingNameChecked = false;
  public packagingTypeList = PackagingType;

  private _modalList;
  private _windowClass = 'eta-ls';
  private _storedData;

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _userContext: UserContext,
              private _fb: FormBuilder,
              private _packagingApprovedService: PackagingApprovedService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _modalService: NgbModal,
              public myDatePickerService: MyDatePickerService) {
  }

  public ngOnInit(): void {
    this.buildForm();
    // this.updateForm(this.rowDetail);
    this.getCommonData();
    this.uploader = new FileUploader({
      url: `${AppConstant.domain}/api/v1/common/images/products`,
      authToken: 'Bearer ' + this._userContext.userToken.accessToken
    });
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public ngAfterViewChecked(): void {
    if (!this.isPackagingNameChecked && this.packagingNameList.length) {
      this.packagingMaxHeight = `${Math.max(...this.packagingNameList
        .map((i) => +i.nativeElement.offsetHeight))}px`;
      this.isPackagingNameChecked = true;
      setTimeout(() => {
        this._changeDetectorRef.markForCheck();
      });
    }
  }

  public buildForm(): void {
    this.frm = this._fb.group({
      updatePackaging: this._fb.array([])
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  public get packagings(): FormArray {
    return this.frm.get('updatePackaging') as FormArray;
  };

  public setPackagings(packagings: any[]) {
    const packagingFGs = packagings.map((packaging: any) => this._validationService.buildForm({
      id: new FormControl(packaging.id),
      type: new FormControl(packaging.type),
      typeName: new FormControl(this.getPackagingTypeName(packaging.type)),
      hasBaseDropZoneOver: new FormControl(false),
      packagingName: new FormControl(packaging.packagingName),
      status: new FormControl(packaging.status),
      dateSubmitted: new FormControl(''),
      dateSubmittedOnUtc:
        new FormControl(packaging.dateSubmittedOnUtc, [
          Validators.compose([
            ExtraValidators.conditional(
              (group) => this.getSpecialRequireCase(group, 'dateSubmittedOnUtc'),
              Validators.required
            ),
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MaxDateToday
          ])
        ]),
      dateRejected: new FormControl(''),
      dateRejectedOnUtc:
        new FormControl(packaging.dateRejectedOnUtc, [
          Validators.compose([
            ExtraValidators.conditional(
              (group) => this.getSpecialRequireCase(group, 'dateRejectedOnUtc'),
              Validators.required
            ),
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MaxDateToday
          ])
        ]),
      dateDropped: new FormControl(''),
      dateDroppedOnUtc:
        new FormControl(packaging.dateDroppedOnUtc, [
          Validators.compose([
            ExtraValidators.conditional(
              (group) => this.getSpecialRequireCase(group, 'dateDroppedOnUtc'),
              Validators.required
            ),
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MaxDateToday
          ])
        ]),
      dateApproved: new FormControl(''),
      dateApprovedOnUtc:
        new FormControl(packaging.dateApprovedOnUtc, [
          Validators.compose([
            ExtraValidators.conditional(
              (group) => this.getSpecialRequireCase(group, 'dateApprovedOnUtc'),
              Validators.required
            ),
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MaxDateToday
          ])
        ]),
      comments: new FormControl(packaging.comments),
      imageUrl: new FormControl(packaging.imageUrl),
      absoluteUrl: new FormControl(packaging.absoluteUrl),
      formRequires: new FormControl({
        status: {
          required: false
        },
        dateSubmittedOnUtc: {
          required: false
        },
        dateRejectedOnUtc: {
          required: false
        },
        dateDroppedOnUtc: {
          required: false
        },
        dateApprovedOnUtc: {
          required: false
        }
      })
    }, this.formErrors, this.validationMessages));
    const contactFormArray = this._fb.array(packagingFGs);
    this.frm.setControl('updatePackaging', contactFormArray);
  }

  public addPackagings(packagingType) {
    this.packagings.push(this._validationService.buildForm({
      id: new FormControl(null),
      type: new FormControl(packagingType.id),
      typeName: new FormControl(packagingType.name),
      hasBaseDropZoneOver: new FormControl(false),
      packagingName: new FormControl(''),
      status: new FormControl(null),
      dateSubmitted: new FormControl(''),
      dateSubmittedOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'dateSubmittedOnUtc'),
            Validators.required
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      dateRejected: new FormControl(''),
      dateRejectedOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'dateRejectedOnUtc'),
            Validators.required
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      dateDropped: new FormControl(''),
      dateDroppedOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'dateDroppedOnUtc'),
            Validators.required
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      dateApproved: new FormControl(''),
      dateApprovedOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'dateApprovedOnUtc'),
            Validators.required
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      comments: new FormControl(''),
      imageUrl: new FormControl(''),
      absoluteUrl: new FormControl(''),
      formRequires: new FormControl({
        status: {
          required: false
        },
        dateSubmittedOnUtc: {
          required: false
        },
        dateRejectedOnUtc: {
          required: false
        },
        dateDroppedOnUtc: {
          required: false
        },
        dateApprovedOnUtc: {
          required: false
        }
      })
    }, this.formErrors, this.validationMessages));
  }

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    if (key === 'dateSubmittedOnUtc') {
      let isRequired = [
        this.taskStatus.APPROVED,
        this.taskStatus.APPROVEDWCHANGES,
        this.taskStatus.REJECTED
      ].indexOf(frm.get('status').value) > -1;
      frm.get('formRequires').value[key].required = isRequired;
      return isRequired;
    } else if (key === 'dateRejectedOnUtc') {
      let isRequired = [
        this.taskStatus.REJECTED
      ].indexOf(frm.get('status').value) > -1;
      frm.get('formRequires').value[key].required = isRequired;
      return isRequired;
    } else if (key === 'dateApprovedOnUtc') {
      let isRequired = [
        this.taskStatus.APPROVED,
        this.taskStatus.APPROVEDWCHANGES
      ].indexOf(frm.get('status').value) > -1;
      frm.get('formRequires').value[key].required = isRequired;
      return isRequired;
    } else if (key === 'dateDroppedOnUtc') {
      let isRequired = [
        this.taskStatus.DROPPED
      ].indexOf(frm.get('status').value) > -1;
      frm.get('formRequires').value[key].required = isRequired;
      return isRequired;
    } else {
      return false;
    }
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

  public setDateValue(frm): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (frm.get(importName).value) {
        const utcDate = new Date(frm.get(importName).value);
        let currentDate = new Date(Date.UTC(utcDate.getFullYear(),
          utcDate.getMonth(), utcDate.getDate(), utcDate.getHours(), utcDate.getMinutes()));
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
    patchDateFunc('dateSubmittedOnUtc', 'dateSubmitted');
    patchDateFunc('dateRejectedOnUtc', 'dateRejected');
    patchDateFunc('dateDroppedOnUtc', 'dateDropped');
    patchDateFunc('dateApprovedOnUtc', 'dateApproved');
    this._changeDetectorRef.markForCheck();
  }

  public updateForm(data: any): void {
    if (data && data.length) {
      this.setPackagings(data);
      for (let packaging of this.packagings.controls) {
        this.setDateValue(packaging);
      }
    }
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._packagingApprovedService.getDataColumn(this.projectId, this.productId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.updateForm(resp.data);
          this._storedData = this.frm.value;
          this._modalList = document.getElementsByClassName('modal fade');
          this._windowClass = !resp.data.length ? 'eta-xs-large' : resp.data.length >= 3 ? 'eta-lg'
            : resp.data.length >= 2 ? 'eta-sm' : 'eta-xs-large';
          this.addClass(this._modalList[0], this._windowClass);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public getPackagingTypeName(id: number): any {
    return _.get(this.packagingTypeList.find((i) => i.id === id), 'name', '');
  }

  public onSelectItem(val, frm, valProp: string, formControlName: string): void {
    if (val[valProp]) {
      frm.get(formControlName).patchValue(val[valProp]);
    } else {
      // add new
      frm.get(formControlName).patchValue(val);
    }
  }

  /**
   * Fire date change event
   * @param event
   */
  public onDateChangedBy(event: IMyDateModel, frm, prop: string): void {
    let utcDate = Object.assign({}, event);
    frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');
    // Update status for form control whose value changed
    frm.get(prop).markAsDirty();
  }

  public getMaxDate(currentDate: IMyDate, dateCompare: IMyDate): IMyDate {
    const timeCurrent = new Date(`${currentDate.month}/${currentDate.day}/${currentDate.year}`)
      .getTime();
    const timeDate = new Date(`${dateCompare.month}/${dateCompare.day}/${dateCompare.year}`)
      .getTime();
    return timeDate >= timeCurrent ? currentDate : dateCompare;
  }

  public classList(elm) {
    return (' ' + (elm.className || '') + ' ').replace(/\s+/gi, ' ');
  }

  public hasClass(elm, n) {
    let list = typeof elm === 'string' ? elm : this.classList(elm);
    return list.indexOf(' ' + n + ' ') >= 0;
  }

  public addClass(element, name) {
    let oldList = this.classList(element);
    let newList = oldList + name;
    if (this.hasClass(oldList, name)) {
      return;
    }
    // Trim the opening space.
    element.className = newList.substring(1);
  }

  public removeClass(element, name) {
    let oldList = this.classList(element);
    let newList;

    if (!this.hasClass(element, name)) {
      return;
    }

    // Replace the class name.
    newList = oldList.replace(' ' + name + ' ', ' ');

    // Trim the opening and closing spaces.
    element.className = newList.substring(1, newList.length - 1);
  }

  public selectPackagings(): void {
    const changePackagingFunc = (res) => {
      res.deletedPackagingsList.forEach((packagingType) => {
        const index = this.packagings.value.findIndex((i) => i.type === packagingType.id);
        if (index > -1) {
          this.packagings.removeAt(index);
        }
      });
      res.packagingsList.forEach((packagingType) => {
        if (this.packagings.value.findIndex((i) => i.type === packagingType.id) > -1) {
          return;
        }
        this.addPackagings(packagingType);
      });

      this.removeClass(this._modalList[0], this._windowClass);
      this._windowClass = !this.packagings.length
        ? 'eta-xs-large' : this.packagings.length >= 3
          ? 'eta-lg' : this.packagings.length >= 2 ? 'eta-sm' : 'eta-xs-large';
      this.addClass(this._modalList[0], this._windowClass);
    };

    this.addClass(this._modalList[0], 'none');
    let modalRef = this._modalService.open(SelectPackagingComponent, {
      size: 'lg',
      keyboard: true,
      backdrop: 'static',
      windowClass: 'eta-sm'
    });
    const curPackagingList = this.packagings.value.map((i) => {
      return {
        id: i.type,
        name: i.typeName
      };
    });
    modalRef.componentInstance.packagingsList = curPackagingList;
    modalRef.result.then((res) => {
      if (res.status) {
        if (res.deletedPackagingsList.length) {
          let modalRef2 = this._modalService.open(ConfirmDialogComponent, {
            keyboard: true
          });
          modalRef2.componentInstance
            .message = `Packaging configuration data for
          '${res.deletedPackagingsList.map((i) => i.name).join(`', '`)}'
          will be deleted. Continue?`;
          modalRef2.componentInstance.title = 'Confirm Packaging Deletion';

          modalRef2.result.then((status) => {
            if (status) {
              changePackagingFunc(res);
            }

            this.removeClass(this._modalList[0], 'none');
            this._changeDetectorRef.markForCheck();
          });
        } else {
          changePackagingFunc(res);
          this.removeClass(this._modalList[0], 'none');
          this._changeDetectorRef.markForCheck();
        }
      } else {
        this.removeClass(this._modalList[0], 'none');
        this._changeDetectorRef.markForCheck();
      }
    });

  }

  /**
   * Upload image
   */
  public uploadImage(frm, index) {
    // Start upload avatar
    if (!this.uploader.queue.length) {
      return;
    }
    this.uploader.queue[this.uploader.queue.length - 1].upload();
    // Start loading bar while uploading
    this.uploader.onProgressItem = () => NProgress.start();
    this.uploader.onCompleteAll = () => NProgress.done();
    this.uploader.onSuccessItem = (item: FileItem, resp: string) => {
      let res: ResponseMessage<UploadedImage> = JSON.parse(resp);
      if (res.status) {
        frm.patchValue({
          imageUrl: res.data.relativeUrl,
          absoluteUrl: res.data.absoluteUrl
        });
        frm.get('imageUrl')
          .markAsDirty();
        frm.get('imageUrl')
          .markAsTouched();
        // Clear uploaded item in uploader
        this.uploader.clearQueue();
      } else {
        this.uploader.clearQueue();
        let inputFile = document.getElementById(`styleInputFile-${index}`) as HTMLInputElement;
        if (inputFile) {
          inputFile.value = '';
        }
        this._toastrService.error(res.errorMessages, 'Error');
      }
      this._changeDetectorRef.markForCheck();
    };
  }

  /**
   * Remove image
   */
  public removeImage(frm: FormGroup) {
    frm.patchValue({
      imageUrl: '',
      absoluteUrl: ''
    });
    frm.get('imageUrl').markAsDirty();
    frm.get('imageUrl').markAsTouched();
    this._changeDetectorRef.markForCheck();
  }

  public fileOverBase(e: any, frm): void {
    frm.get('hasBaseDropZoneOver').patchValue(e);
  }

  /*-----------Drag & Drop Image Event-----------*/
  public onFileDropped(files, frm, index) {
    this.uploader.addToQueue(files);
    this.uploadImage(frm, index);
  }

  /*-----------Drag & Drop Image Event-----------*/

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

  public checkFormValid(): boolean {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
    return this.frm.valid;
  }

  public onSubmitForm(): void {
    if (this.checkFormValid() && this.leadEtaComponent.checkFormValid()) {
      this.packagings.controls.forEach((packaging: FormGroup) => {
        let listDate = [
          'dateSubmittedOnUtc',
          'dateRejectedOnUtc',
          'dateDroppedOnUtc',
          'dateApprovedOnUtc'
        ];
        this.myDatePickerService.addTimeToDateArray(packaging, listDate);
      });
      const modal = Object.assign({
        ...this._storedData,
        ...this.leadEtaComponent.getFormValue()
      }, this.frm.value);
      delete modal['formRequires'];
      this._packagingApprovedService.changeStatusColumn(this.projectId, this.productId, modal)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this.activeModal.close(resp);
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    } else {
      for (let packaging of this.packagings.controls) {
        this._commonService.markAsDirtyForm(packaging as FormGroup, true);
      }
      this._changeDetectorRef.markForCheck();
    }
  }
}
