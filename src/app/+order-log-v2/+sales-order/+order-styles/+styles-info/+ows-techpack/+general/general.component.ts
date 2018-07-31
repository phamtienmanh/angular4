import {
  Component,
  ViewEncapsulation,
  OnInit,
  AfterViewInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
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
} from '../../../../../../shared/services';
import {
  SalesOrderService
} from '../../../../sales-order.service';
import {
  StyleService
} from '../../+style/style.service';
import {
  StylesInfoService
} from '../../styles-info.service';
import {
  GeneralService
} from './general.service';
import {
  OwsTechpackService
} from '../ows-techpack.service';

// Interfaces
import {
  ItemTypes
} from '../../../order-styles.model';
import {
  UploadedFileModel
} from '../../../../sales-order.model';
import {
  ResponseMessage,
  BasicResponse,
  UploadedType
} from '../../../../../../shared/models';
import {
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';

// Components
import {
  UploaderTypeComponent
} from '../../../../../../shared/modules/uploader-type';
import {
  StyleUploadedType
} from '../../+style/style.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'general',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'general.template.html',
  styleUrls: [
    'general.style.scss'
  ]
})
export class GeneralComponent implements OnInit, AfterViewInit, OnDestroy {
  public orderId: number;
  public styleId: number;
  public preGeneralInfoData;
  public frm: FormGroup;
  public formErrors = {
    tscDueDateOnUtc: '',
    techPackReadyDateOnUtc: '',
    orderWorkSheetFiles: '',
    techPackFiles: ''
  };
  public validationMessages = {
    tscDueDateOnUtc: {
      required: 'TSC Due Date is required.'
    },
    techPackReadyDateOnUtc: {
      required: 'OWS / Tech Pack Ready Date is required.'
    },
    orderWorkSheetFiles: {
      required: 'Order Work Sheets is required.'
    },
    techPackFiles: {
      required: 'Tech Pack(s) is required.'
    }
  };
  public typeMsg = [
    'CutTickets',
    'Blank Style #',
    'Po',
    'Order Work Sheet(s)',
    'Tech Pack(s)'
  ];
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
  public styleList: any[] = [];
  public styleUploadedType = StyleUploadedType;
  public uploadedType = UploadedType;
  public activatedSub: Subscription;
  public generalInfoData: any;
  public canModifyOws = true;
  public isShowStickyBtn = false;

  private _subOwsStatus: Subscription;

  constructor(private _fb: FormBuilder,
              private _validationService: ValidationService,
              private _utilService: Util,
              private _toastrService: ToastrService,
              private _modalService: NgbModal,
              public myDatePickerService: MyDatePickerService,
              private _authService: AuthService,
              private _commonService: CommonService,
              private _salesOrderService: SalesOrderService,
              private _styleService: StyleService,
              private _stylesInfoService: StylesInfoService,
              private _owsTechpackService: OwsTechpackService,
              private _generalService: GeneralService,
              private _changeDetectorRef: ChangeDetectorRef) {
    this.orderId = +this._salesOrderService.orderIndex.orderId;
    this.styleId = +this._salesOrderService.orderIndex.styleId;
  }

  public ngOnInit(): void {
    this._subOwsStatus = this._owsTechpackService.getUpdateOws().subscribe((status) => {
      this.canModifyOws = status;
      this._changeDetectorRef.markForCheck();
    });
    this.buildForm();
    this.getTechPack();
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

  public buildForm(): void {
    let controlConfig = {
      tscDueDate: new FormControl(null),
      tscDueDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      techPackReadyDate: new FormControl(null),
      techPackReadyDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      files: new FormControl([]),
      styleList: this._fb.array([]),
      techPackApplyToStyles: new FormControl(''),
      formRequires: new FormControl({
        tscDueDateOnUtc: {
          required: false
        },
        techPackReadyDateOnUtc: {
          required: false
        },
        orderWorkSheetFiles: {
          required: false
        },
        techPackFiles: {
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

  public getTechPack(): void {
    this._generalService.getGeneralInfo(this.styleId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.generalInfoData = resp.data;
          this.getStyleList();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public getStyleList(): void {
    this._stylesInfoService.getStyleList(this.orderId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.styleList =
            _.sortBy(resp.data, [
              'type',
              'partnerStyle',
              'partnerStyleName',
              'blankStyle',
              'blankColor'
            ]);
          this.updateForm(this.generalInfoData);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * Update form value
   * @param data
   */
  public updateForm(data): void {
    this.frm.patchValue(data);
    this.setDateValue(this.frm);
    if (this.styleList && this.styleList.length) {
      // build select form
      const styleFGs = this.styleList
        .map((style) => this._validationService.buildForm({
          styleId: new FormControl(style.id),
          styleFullName: new FormControl(this.getLabelString(style)),
          isSelected: new FormControl(style.id === this.styleId
            || this.generalInfoData.techPackApplyToStyles.some((id) => id === style.id))
        }, {}, {}));
      const styleFormArray = this._fb.array(styleFGs);
      this.frm.setControl('styleList', styleFormArray);
    }
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
    patchDateFunc('tscDueDateOnUtc', 'tscDueDate');
    patchDateFunc('techPackReadyDateOnUtc', 'techPackReadyDate');
    this._changeDetectorRef.markForCheck();
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
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
      modalRef.componentInstance.title = this.typeMsg[type];
      Object.assign(modalRef.componentInstance.uploadOptions, {
        id: this.styleId,
        fileList: fileList.filter((i) => i.type === type),
        uploadType: this.uploadedType.OrderWorkSheets,
        fileType: type,
        isReadOnly: !this.canModifyOws
      });

      modalRef.result.then((res) => {
        if (res.status) {
          let isShownMsg = false;
          let currentFiles = frm.get('files').value;
          if (res.newList && res.newList.length) {
            this._styleService.uploadFileToStyle(this.styleId, res.newList)
              .subscribe((resp: ResponseMessage<UploadedFileModel[]>) => {
                if (resp.status) {
                  if (resp.data.length) {
                    if (!isShownMsg) {
                      this._toastrService
                        .success(`${this.typeMsg[type]} updated successfully.`, 'Success');
                      isShownMsg = true;
                    }
                    currentFiles = [...currentFiles, ...resp.data];
                    frm.get('files').setValue(currentFiles);
                    this.preGeneralInfoData = _.cloneDeep(this.frm.getRawValue());
                    this._changeDetectorRef.markForCheck();
                  }
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
          }
          if (res.deletedList && res.deletedList.length) {
            this._styleService.deleteUploadedStyleFile(this.styleId,
              res.deletedList.map((i) => i.id))
              .subscribe((resp: BasicResponse) => {
                if (resp.status) {
                  res.deletedList.forEach((item) => {
                    let indexItem = currentFiles.findIndex((i) => i.id === item.id);
                    if (indexItem > -1) {
                      currentFiles.splice(indexItem, 1);
                    }
                  });
                  frm.get('files').setValue(currentFiles);
                  this.preGeneralInfoData = _.cloneDeep(this.frm.getRawValue());
                  this._changeDetectorRef.markForCheck();
                  if (!isShownMsg) {
                    this._toastrService
                      .success(`${this.typeMsg[type]} updated successfully.`, 'Success');
                    isShownMsg = true;
                  }
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
          }
          if (res.updateList && res.updateList.length) {
            this._styleService.updateStyleFiles(this.styleId, res.updateList)
              .subscribe((resp: BasicResponse) => {
                if (resp.status) {
                  if (!isShownMsg) {
                    this._toastrService
                      .success(`${this.typeMsg[type]} updated successfully.`, 'Success');
                    isShownMsg = true;
                  }
                  this.preGeneralInfoData = _.cloneDeep(this.frm.getRawValue());
                  this._changeDetectorRef.markForCheck();
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
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
    const fileList = frm.get('files').value;
    funcUpload(fileList);
  }

  public checkLengthUploaderByType(frm: any, type: number): boolean {
    if (frm.get('files').value && frm.get('files').value.length) {
      return frm.get('files').value.some((i) => i.type === type);
    } else {
      return false;
    }
  }

  public onSubmitForm(): void {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
      this._changeDetectorRef.markForCheck();
      return;
    }
    this.myDatePickerService.addTimeToDateArray(this.frm, [
      'tscDueDateOnUtc',
      'techPackReadyDateOnUtc'
    ]);
    // convert applyToStyles-form-array to ids-string
    if (this.frm.get('styleList').value && this.frm.get('styleList').value.length) {
      let idsArr = [];
      this.frm.get('styleList').value.forEach((style) => {
        if (style.isSelected) {
          idsArr.push(style.styleId);
        }
      });
      this.frm.get('techPackApplyToStyles').patchValue(idsArr);
    }
    this._generalService.updateGeneralInfo(this.styleId, this.frm.value)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.generalInfoData = resp.data;
          this.getStyleList();
          this._changeDetectorRef.markForCheck();
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * getLabelString
   * @param style
   * @returns {string}
   */
  public getLabelString(style): string {
    let leftLabel = '';
    if (style.partnerStyle) {
      leftLabel += `(${style.partnerStyle}) `;
    }
    leftLabel += `${style.partnerStyleName ? style.partnerStyleName : ''}${style.partnerStyleName
    && style.blankStyle ? ' - ' : ''}${style.blankStyle ? style.blankStyle : ''}`;
    // ------------------------------------------
    let rightLabel = style.blankColor ? style.blankColor : '';
    // ------------------------------------------
    let itemType = '';
    switch (style.type) {
      case ItemTypes.DOMESTIC:
        itemType = 'Domestic';
        break;
      case ItemTypes.OUTSOURCE:
        itemType = 'Outsource';
        break;
      case ItemTypes.IMPORTS:
        itemType = 'Imports';
        break;
      default:
        itemType = 'None';
        break;
    }
    return `${leftLabel}${leftLabel && rightLabel ? ' / ' : ''}${rightLabel} (${itemType})`;
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
    this._subOwsStatus.unsubscribe();
  }
}
