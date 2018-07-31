import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  DoCheck,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
  EventEmitter,
  ElementRef
} from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  NavigationEnd,
  Router
} from '@angular/router';

// Components
import {
  ConfirmDialogComponent
} from '../../../../../shared/modules/confirm-dialog';
import {
  DatatableComponent
} from '@swimlane/ngx-datatable/release';
import {
  UploaderTypeComponent
} from '../../../../../shared/modules/uploader-type';
import {
  AddSizesComponent
} from './add-sizes-modal/add-sizes.component';

// Services
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  CommonService,
  Util,
  ExtraValidators,
  ValidationService,
  AuthService,
  MyDatePickerService,
  UserContext
} from '../../../../../shared/services';
import {
  ToastrService
} from 'ngx-toastr';
import {
  SalesOrderService
} from '../../../sales-order.service';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import * as NProgress from 'nprogress';
import {
  StyleService
} from './style.service';
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import { StylesInfoService } from '../styles-info.service';
import * as _ from 'lodash';
import { ProgressService } from '../../../../../shared/services/progress';

// Validators
import {
  MinDate,
  MaxDate,
  MaxDateToday
} from '../../../../../shared/validators';

// Interfaces
import {
  StyleDetail,
  StyleType,
  StyleUploadedType,
  Blank,
  ItemTypes,
  FactoryTypes,
  ProductionMethods,
  ShipMethods,
  OveragesMethod,
  EmbellishmentProcess,
  BlankSizes
} from './style.model';
import * as OrderItemTypes from '../../order-styles.model';
import {
  StyleSize
} from '../styles-info.model';
import {
  TagInputComponent,
  TagInputDropdown
} from 'ngx-chips';
import {
  UploadedFileModel,
  UploadedType
} from '../../../sales-order.model';
import {
  BasicResponse,
  ResponseMessage,
  BasicCustomerInfo,
  BasicGeneralInfo,
  UploadedImage,
  BasicVendorInfo
} from '../../../../../shared/models';
import {
  IMyDate,
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  Subscription
} from 'rxjs/Subscription';
import {
  MyDatePicker
} from 'mydatepicker';
import {
  FileItem,
  FileUploader
} from 'ng2-file-upload';
import { Subject } from 'rxjs/Subject';
import {
  distinctUntilChanged,
  debounceTime,
  switchMap
} from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { AppConstant } from '../../../../../app.constant';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'blank',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'style.template.html',
  styleUrls: [
    'style.style.scss'
  ]
})
export class StyleComponent implements OnInit,
                                       AfterViewChecked,
                                       AfterViewInit,
                                       OnDestroy,
                                       DoCheck {
  @ViewChildren(MyDatePicker)
  public myDatePickers: QueryList<MyDatePicker>;
  @ViewChildren('sizeCells')
  public sizeCells: QueryList<ElementRef>;
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild('a2000Select')
  public a2000Select;
  @ViewChild('tagInputDropdown')
  public tagInputDropdown: TagInputDropdown;
  @ViewChild('tagInput')
  public tagInput: TagInputComponent;
  @ViewChild(DatatableComponent)
  public table: DatatableComponent;
  public frm: FormGroup;
  public formErrors = {
    styleName: '',
    partnerStyleName: '',
    categoryId: '',
    a2000StyleName: '',
    colorName: '',
    cutTicketNumber: '',
    cutTicketCreatedOnUtc: '',
    cutTicketApprovedOnUtc: '',
    vendorName: '',
    tscStyleId: '',
    tscBodyColor: '',
    vendorStyleName: '',
    sizeClassName: '',
    blankColorName: '',
    sizeSelected: '',
    contentName: '',
    cooName: '',
    embellishmentProcess: '',
    requiresTesting: '',
    overages: '',
    estDeliveryDateFromOnUtc: '',
    estDeliveryDateToOnUtc: '',
    receivedDateFromOnUtc: '',
    readyToShipStartDateOnUtc: '',
    readyToShipEndDateOnUtc: '',
    receivedDateToOnUtc: '',
    brand: ''
  };
  public validationMessages = {
    itemType: {
      required: 'Item Type is required.'
    },
    categoryId: {
      required: 'Category is required.'
    },
    styleType: {
      required: 'Style Type is required.'
    },
    isReorderConfirmed: {
      required: 'Reorder Confirmed is required.'
    },
    reorderComment: {
      required: 'Reorder Comments is required.'
    },
    styleName: {
      required: 'Style Name is required.'
    },
    partnerStyleName: {
      required: 'Partner Style # is required.'
    },
    vendorName: {
      required: 'Vendor is required.'
    },
    a2000StyleName: {
      required: 'A2000 Style # is required.'
    },
    colorName: {
      required: 'A2000 Color is required.'
    },
    cutTicketNumber: {
      required: 'Cut Ticket # is required.'
    },
    cutTicketCreatedOnUtc: {
      required: 'Cut Ticket Created is required.'
    },
    cutTicketApprovedOnUtc: {
      required: 'Cut Ticket Approved is required.'
    },
    blankColorName: {
      required: 'Color is required.'
    },
    sizeSelected: {
      required: 'At least 1 size must be specified.'
    },
    contentName: {
      required: 'Content is required.'
    },
    cooName: {
      required: 'COO is required.'
    },
    overagesMethod: {
      required: 'Overages Method is required.'
    },
    overages: {
      required: 'Overages % is required.',
      overagesRange: 'Specify a value between 0 and 100.'
    },
    tscStyleId: {
      required: 'TSC Style # is required.'
    },
    tscBodyColor: {
      required: 'TSC Body Color is required.'
    },
    vendorStyleName: {
      required: 'Vendor Style is required.'
    },
    sizeClassName: {
      required: 'Size Class is required.'
    },
    estDeliveryDateFromOnUtc: {
      required: 'EST Delivery Date Start is required.',
      maxLength: 'Must be earlier than EST Delivery Date End.'
    },
    estDeliveryDateToOnUtc: {
      required: 'EST Delivery Date End is required.',
      maxLength: 'Must be later than EST Delivery Date Start.'
    },
    receivedDateFromOnUtc: {
      required: 'Received Date Start is required.',
      maxLength: 'Must be earlier than Received Date End.'
    },
    receivedDateToOnUtc: {
      required: 'Received Date End is required.',
      maxLength: 'Must be later than Received Date Start.'
    },
    brand: {
      required: 'Brand is required.'
    },
    factoryId: {
      required: 'Factory is required.'
    },
    embellishmentProcess: {
      required: 'Embellishment Process is required.'
    },
    requiresTesting: {
      required: 'Requires Testing is required.'
    },
    exFactoryDateOnUtc: {
      required: 'Ex-Factory Date is required.'
    },
    arrival3PlDateOnUtc: {
      required: 'Arrival @ 3PL Date is required.'
    },
    // readyToShipDateOnUtc: {
    //   required: 'Ready To Ship @ 3PL Date is required.'
    // },
    etaTscDateOnUtc: {
      required: 'ETA TSC is required.'
    },
    readyToShipStartDateOnUtc: {
      required: 'Ready to Ship Start Date is required.'
    },
    readyToShipEndDateOnUtc: {
      required: 'Ready to Ship End Date is required.'
    },
    // techPackReadyDateOnUtc: {
    //   required: 'Tech Pack Ready is required.'
    // },
    productionMethod: {
      required: 'Production Method is required.'
    },
    shipMethod: {
      required: 'Ship Method is required.'
    },
    default: {
      required: 'This is required.',
      maxToday: 'Date must be today’s date or earlier'
    }
  };

  public currentComponentWidth;
  public orderIndex: any = {
    orderId: 0,
    styleId: 0,
    customer2Type: 0,
    styleName: ''
  };
  public blanksInfo: any;
  public styleList = [];
  public styleData: BasicCustomerInfo[];
  public partnerStyleNameData: BasicCustomerInfo[];
  public vendorData: BasicCustomerInfo[];
  public vendorStyleData: BasicGeneralInfo[];
  public sizeData: BasicCustomerInfo[];
  public serverSideColorData: BasicGeneralInfo[] = [];
  public contentData: BasicCustomerInfo[];
  public cooData: BasicCustomerInfo[];
  public requiresTestingData = [
    {
      id: 1,
      name: 'Yes',
      value: true
    },
    {
      id: 2,
      name: 'No',
      value: false
    }
  ];

  public myDatePickerOptions: IMyDpOptions = {
    selectorWidth: '220px',
    dateFormat: 'mm/dd/yyyy',
    showTodayBtn: false,
    showClearDateBtn: true,
    alignSelectorRight: true,
    openSelectorOnInputClick: true,
    openSelectorTopOfInput: true,
    editableDateField: true,
    selectionTxtFontSize: '12px',
    height: '28px',
    firstDayOfWeek: 'su',
    sunHighlight: false,
    componentDisabled: false
  };
  public cutTicketPickerOptions = {...this.myDatePickerOptions};
  public techPackPickerOptions = {...this.myDatePickerOptions};
  public approvedPickerOptions = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public estDeliveryDateFromOptions = {...this.myDatePickerOptions};
  public estDeliveryDateToOptions = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public receivedDateFromOptions = {...this.myDatePickerOptions};
  public receivedDateToOptions = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public readyToShipStartDateOptions = {...this.myDatePickerOptions};
  public readyToShipEndDateOptions = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public schedReadyToShipStartDateOptions = {...this.myDatePickerOptions};
  public schedReadyToShipEndDateOptions = {
    ...this.myDatePickerOptions,
    componentDisabled: true
  };
  public onTopDateOptions = {
    ...this.myDatePickerOptions
  };

  public editing = {};
  public subRouter: Subscription;
  public blankSizes;

  public styleUploadedType = StyleUploadedType;
  public uploadedType = UploadedType;
  public itemTypes = ItemTypes;
  public factoryTypes = FactoryTypes;
  public productionMethods = ProductionMethods;
  public shipMethods = ShipMethods;
  public typeMsg = [
    'CutTickets',
    'Blank Style #',
    'Po',
    'Order Work Sheet(s)',
    'Tech Pack(s)'
  ];
  // mark to blurUpdate only 1 time
  public doBlurUpdate: boolean = true;
  public isShowChildSize = false;
  public isShowChildSizeIds: any;
  public uploader: FileUploader;

  public factoryOutsourceList = [];
  public factoryImportsList = [];
  public preStyleInfoData;
  public overagesMethod = OveragesMethod;
  public overagesMethodData = [
    {
      id: this.overagesMethod.Percentage,
      name: 'Percentage'
    },
    {
      id: this.overagesMethod.Quantity,
      name: 'Quantity'
    }
  ];
  public styleType = [
    {
      id: 1,
      name: 'New Order'
    },
    {
      id: 2,
      name: 'Reorder'
    },
    {
      id: 3,
      name: 'Rollout'
    },
    {
      id: 4,
      name: 'Sample'
    },
    {
      id: 5,
      name: 'Test'
    }
  ];
  public listEmbellishment = [
    {
      id: EmbellishmentProcess.Treatment,
      name: 'Treatment'
    },
    {
      id: EmbellishmentProcess.Print,
      name: 'Print'
    },
    {
      id: EmbellishmentProcess.Embroidery,
      name: 'Embroidery'
    },
    {
      id: EmbellishmentProcess.Patch,
      name: 'Patch'
    }
  ];

  public isShowStickyBtn = false;
  public lastScrollHeight;
  public canConfirmReorder = false;

  public isPageReadOnly = false;
  public isSMPL = false;
  public isOrderCancelled = false;
  public isOrderArchived = false;
  public isStyleReadOnly = false;
  public isStyleCancelled = false;

  public roleCanConfirmReorder = [
    'Administrator',
    'Art Manager',
    'Account Supervisor'
  ];
  public serverSideA2000StyleData = [];
  public categoryList = [];
  // public customersData = [];
  public a2000StyleTypeahead = new EventEmitter<string>();
  public colorTypeahead = new EventEmitter<string>();

  private _subOrderStatus: Subscription;
  private _subOrderData: Subscription;
  private _appScrollEv = new Subject();
  private _preScrollTopPos = 0;
  private _isPageReadOnlyStore = false;

  constructor(private _fb: FormBuilder,
              private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _toastrService: ToastrService,
              private _localStorageService: LocalStorageService,
              private _salesOrderService: SalesOrderService,
              private _stylesInfoService: StylesInfoService,
              private _styleService: StyleService,
              private _commonService: CommonService,
              private _validationService: ValidationService,
              private _utilService: Util,
              private _modalService: NgbModal,
              public myDatePickerService: MyDatePickerService,
              private _authService: AuthService,
              private _progressService: ProgressService,
              private _userContext: UserContext,
              private _changeDetectorRef: ChangeDetectorRef,
              private _breadcrumbService: BreadcrumbService) {
    this.canConfirmReorder = _.intersection(this.roleCanConfirmReorder,
      this._userContext.currentUser.listRole.map((r) => r.roleName)).length > 0;
    this.sizeData = [];
    this.orderIndex = this._salesOrderService.orderIndex;
    // Reget all data when change design
    this.subRouter = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd &&
        val.urlAfterRedirects &&
        val.urlAfterRedirects.includes('/styles/')) {
        this.onRouterChange();
      }
    });
    this._breadcrumbService
      .hideRouteRegex('^[0-9A-Za-z/-]+/style/true$');

    let ids = this._localStorageService.get('isShowChildSizeIds');
    this.isShowChildSizeIds = JSON.parse(ids ? ids.toString() : '[]');
    this.isShowChildSize = Array.isArray(this.isShowChildSizeIds) &&
      this.isShowChildSizeIds.some((id) => id === this.orderIndex.styleId);

    window.onbeforeprint = () => {
      this._isPageReadOnlyStore = _.cloneDeep(this.isPageReadOnly);
      this.isPageReadOnly = true;
      this._changeDetectorRef.markForCheck();
    };

    window.onafterprint = () => {
      this.isPageReadOnly = _.cloneDeep(this._isPageReadOnlyStore);
      this._changeDetectorRef.markForCheck();
    };
  }

  public ngOnInit(): void {
    this._subOrderStatus = this._salesOrderService.getUpdateStatusOrder().subscribe((status) => {
      this.isPageReadOnly = status;
      this._changeDetectorRef.markForCheck();
    });
    this._subOrderData = this._salesOrderService.getUpdateOrder().subscribe((orderData) => {
      this.isSMPL = orderData.customerPoId ?
        orderData.customerPoId.toLowerCase().startsWith('smpl') : false;
      this.blankSizes = [...BlankSizes];
      this.isOrderArchived = orderData.isArchived;
      this.isOrderCancelled = orderData.isCancelled;
      this._changeDetectorRef.markForCheck();
    });
    this._stylesInfoService.getUpdateStyle().subscribe((styleData) => {
      this.isStyleCancelled = styleData.isCancelled;
      this._changeDetectorRef.markForCheck();
    });
    this.uploader = new FileUploader({
      url: `${AppConstant.domain}/api/v1/common/images/styles`,
      authToken: 'Bearer ' + this._userContext.userToken.accessToken
    });
    this.buildForm();
    this.serverSideSearch();

    Observable.fromEvent(window, 'scroll')
      .debounceTime(200)
      .distinctUntilKeyChanged('target', (x: any, y: any) => {
        return x.scrollingElement.scrollTop === this._preScrollTopPos;
      })
      .subscribe((event: any) => {
        this.onScrollFunc(event);
        this._preScrollTopPos = event.target.scrollingElement.scrollTop;
      });
  }

  public onScrollFunc(event): void {
    if (event.type === 'resize') {
      if (this._utilService.scrollElm &&
        this._utilService.scrollElm.scrollHeight - (this._utilService.scrollElm.scrollTop
          + window.innerHeight) < 75) {
        this.isShowStickyBtn = false;
      } else if (this._utilService.scrollElm) {
        this.isShowStickyBtn = true;
      }
    } else if (event.target.scrollingElement.scrollHeight - (event.target.scrollingElement
      .scrollTop + window.innerHeight) < 75) {
      this.isShowStickyBtn = false;
    } else {
      this.isShowStickyBtn = true;
    }
    this._changeDetectorRef.markForCheck();
  }

  public onRouterChange() {
    this.buildForm();
    this.getCommonData().then(() => {
      this._changeDetectorRef.markForCheck();
    });
  }

  public ngAfterViewChecked() {
    _.debounce((e) => {
      // Check if the table size has changed
      if (this.tableWrapper &&
        this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
        this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
        this.sizeTableScrollBar();
      }
      if (this._utilService.scrollElm &&
        this._utilService.scrollElm.scrollHeight !== this.lastScrollHeight) {
        setTimeout(() => {
          this.lastScrollHeight = this._utilService.scrollElm.scrollHeight;
          this.onScrollFunc({target: {scrollingElement: this._utilService.scrollElm}});
        }, 250);
      }
    }, 500);
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      if (this._utilService.scrollElm) {
        if (this._utilService.scrollElm.scrollHeight - (this._utilService.scrollElm.scrollTop
          + window.innerHeight) > 75) {
          this.isShowStickyBtn = true;
          this._changeDetectorRef.markForCheck();
        }
      }
    }, 2000);
  }

  public ngDoCheck(): void {
    if (this.myDatePickers) {
      this.myDatePickers.forEach((p) => {
        if (p.elem.nativeElement.firstElementChild
          && p.elem.nativeElement.firstElementChild.childElementCount > 1) {
          p.elem.nativeElement.firstElementChild.classList.add('border-blue');
        } else {
          p.elem.nativeElement.firstElementChild.classList.remove('border-blue');
        }
      });
    }
  }

  public serverSideSearch() {
    this.a2000StyleTypeahead.pipe(
      distinctUntilChanged(),
      debounceTime(500),
      switchMap((value: string) =>
        this._commonService.getA2000StyleList(value === null ? '' : value))
    ).subscribe((resp: ResponseMessage<any>) => {
      if (resp.status) {
        this.serverSideA2000StyleData = resp.data;
      } else {
        this._toastrService.error(resp.errorMessages, 'Error');
      }
      this._changeDetectorRef.markForCheck();
    }, (err) => {
      this.serverSideA2000StyleData = [];
    });
    this.colorTypeahead.pipe(
      distinctUntilChanged(),
      debounceTime(500),
      switchMap((value: string) =>
        this._commonService.getColorList(value === null ? '' : value))
    ).subscribe((resp: ResponseMessage<any>) => {
      if (resp.status) {
        this.serverSideColorData = resp.data;
      } else {
        this._toastrService.error(resp.errorMessages, 'Error');
      }
      this._changeDetectorRef.markForCheck();
    }, (err) => {
      this.serverSideColorData = [];
    });
  }

  public loadA2000StyleForClientSide(val = ''): Promise<any> {
    return new Promise((resolve, reject) => {
      this._commonService.getA2000StyleList(val).subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          if (resp.data.findIndex((o) => o.id === this.frm.get('a2000StyleId').value) === -1) {
            if (this.frm.get('a2000StyleId').value && this.frm.get('a2000StyleName').value) {
              resp.data.unshift({
                id: this.frm.get('a2000StyleId').value,
                a2000Style: this.frm.get('a2000StyleName').value,
                partnerStyleName: this.frm.get('partnerStyleName').value,
                partnerStyleNumber: this.frm.get('styleName').value,
                sizeClassName: this.frm.get('sizeClassName').value
              });
            }
          }
          this.serverSideA2000StyleData = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
        resolve(true);
      }, (err) => {
        this.serverSideA2000StyleData = [];
        resolve(true);
      });
    });
  }

  public onSelectItem(val, frm, valProp: string, formControlName: string): void {
    if (formControlName === 'itemType') {
      frm.get('factoryId').setValue(null);
    }
    if (val && val[valProp]) {
      frm.get(formControlName).patchValue(val[valProp]);
      if (formControlName === 'a2000StyleName') {
        this.loadA2000StyleForClientSide();
        frm.get('styleName').patchValue(val['partnerStyleNumber'] || '');
        frm.get('partnerStyleName').patchValue(val['partnerStyleName'] || '');
        frm.get('sizeClassName').patchValue(val['sizeClassName'] || '');
      }
    } else {
      if (formControlName === 'itemType' || formControlName === 'overagesMethod') {
        frm.get(formControlName).setValue(0);
      } else {
        // add new
        frm.get(formControlName).patchValue(val);
      }
    }
    if (formControlName === 'sizeClassId') {
      frm.get('isBlankNotApplicable').patchValue(val.isBlanksNa);
    }
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public sizeTableScrollBar() {
    // recalculate size table scrollbar
    let pfScroll = document.getElementById('perfect-scrollbar');
    let scrollBar;
    if (pfScroll) {
      scrollBar = pfScroll.getElementsByClassName('ps__rail-x');
    }
    if (scrollBar && scrollBar[0]) {
      (scrollBar[0] as HTMLElement).click();
    }
    setTimeout(() => {
      if (this.table) {
        this.table.recalculate();
      }
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  public updateForm(data, isMainFrm = false, isUpdateUi = true): void {
    if (data) {
      this.frm.patchValue(data);
      if (!this.frm.get('shipMethod').value) {
        this.frm.get('shipMethod').patchValue(null);
      }
      this.patchSizesValue(data);
      this.setDateValue(this.frm, isMainFrm, isUpdateUi);
      if (data.blanks && data.blanks.length) {
        this.setBlanks(data.blanks);
        for (let blank of this.blanks.controls) {
          this.setDateValue(blank, !isMainFrm, isUpdateUi);
        }
      }
      this.backupData();
      setTimeout(() => {
        this.preStyleInfoData = _.cloneDeep(this.frm.getRawValue());
      });
      this._stylesInfoService.setUpdateStyle(data);
    }
    if (isUpdateUi) {
      this._changeDetectorRef.markForCheck();
    }
  }

  public getBlankInfoData(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.orderIndex.styleId) {
        this._styleService.getStyleInfo(this.orderIndex.styleId)
          .subscribe((resp: ResponseMessage<StyleDetail>) => {
            if (resp.status) {
              this.blankSizes[7].canEdit = resp.data
                .overagesMethod === this.overagesMethod.Quantity;
              if (resp.data.isReorderConfirmed !== null
                && resp.data.isReorderConfirmed !== undefined) {
                resp.data.isReorderConfirmed = resp.data.isReorderConfirmed.toString();
              }
              this.blanksInfo = resp.data;
              this.buildForm();
              this.updateForm(this.blanksInfo, true);
              if (this.serverSideA2000StyleData.length &&
                this.serverSideA2000StyleData.findIndex((o) =>
                  o.id === this.frm.get('a2000StyleId').value) === -1) {
                this.serverSideA2000StyleData.unshift({
                  id: this.frm.get('a2000StyleId').value,
                  a2000Style: this.frm.get('a2000StyleName').value,
                  partnerStyleName: this.frm.get('partnerStyleName').value,
                  partnerStyleNumber: this.frm.get('styleName').value,
                  sizeClassName: this.frm.get('sizeClassName').value
                });
                this.serverSideA2000StyleData = [...this.serverSideA2000StyleData];
              }
              if (this.serverSideColorData.length) {
                if (this.serverSideColorData.findIndex
                ((o) => o.id === this.frm.get('colorId').value) === -1) {
                  if (this.frm.get('colorId').value && this.frm.get('colorName').value) {
                    this.serverSideColorData.unshift({
                      id: this.frm.get('colorId').value,
                      name: this.frm.get('colorName').value,
                      description: this.frm.get('colorName').value
                    });
                  }
                }
                if (this.serverSideColorData.findIndex
                ((o) => o.id === this.frm.get('blankColorId').value) === -1) {
                  if (this.frm.get('blankColorId').value && this.frm.get('blankColorName').value) {
                    this.serverSideColorData.unshift({
                      id: this.frm.get('blankColorId').value,
                      name: this.frm.get('blankColorName').value,
                      description: this.frm.get('blankColorName').value
                    });
                  }
                }
                this.serverSideColorData = [...this.serverSideColorData];
              }
              resolve(true);
            } else {
              this._router.navigate([
                'order-log-v2',
                this.orderIndex.orderId
              ]);
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      } else if (this._activatedRoute.snapshot.params['isInheritData']) {
        let tFrm = this._localStorageService.get('backupInheritData') as StyleDetail;
        if (tFrm) {
          this.blanksInfo = tFrm;
          this.buildForm();
          this.frm
            .patchValue(this.blanksInfo);
          this.patchSizesValue(this.blanksInfo);
        }
        resolve(true);
      }
      setTimeout(() => {
        this.preStyleInfoData = _.cloneDeep(this.frm.getRawValue());
      });
    });
  }

  public showHideChildSize() {
    this.isShowChildSize = !this.isShowChildSize;
    if (this.isShowChildSize) {
      this.isShowChildSizeIds.push(this.orderIndex.styleId);
    } else {
      this.isShowChildSizeIds =
        this.isShowChildSizeIds.filter((id) => id !== this.orderIndex.styleId);
    }
    this._localStorageService.set('isShowChildSizeIds',
      JSON.stringify(this.isShowChildSizeIds));
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): Promise<any> {
    return new Promise((resolve, reject) => {
      let apiNumsLeft = 15;
      this._stylesInfoService.getStyleList(this.orderIndex.orderId)
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
            if (this.blanksInfo) {
              this.updateForm(this.blanksInfo, true);
            } else {
              this.buildForm();
            }
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          apiNumsLeft--;
          if (apiNumsLeft === 0) {
            resolve(true);
          }
        });
      this._commonService.getCategory()
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status && resp.data && resp.data.data) {
            this.categoryList = resp.data.data.filter((i) => !i.isDisabled);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          apiNumsLeft--;
          if (apiNumsLeft === 0) {
            resolve(true);
          }
        });
      this._commonService.getCStyleList(StyleType.Style)
        .subscribe((resp: ResponseMessage<BasicCustomerInfo[]>) => {
          if (resp.status) {
            this.styleData = resp.data;
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          apiNumsLeft--;
          if (apiNumsLeft === 0) {
            resolve(true);
          }
        });
      this._commonService.getCStyleList(StyleType.Vendor)
        .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
          if (resp.status) {
            this.vendorStyleData = resp.data;
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          apiNumsLeft--;
          if (apiNumsLeft === 0) {
            resolve(true);
          }
        });
      this._commonService.getCStyleList(StyleType.PartnerStyle)
        .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
          if (resp.status) {
            this.partnerStyleNameData = resp.data;
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          apiNumsLeft--;
          if (apiNumsLeft === 0) {
            resolve(true);
          }
        });
      this._commonService.getMachineNVendor('Blanks')
        .subscribe((resp: ResponseMessage<BasicVendorInfo[]>) => {
          if (resp.status) {
            this.vendorData = resp.data;
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          apiNumsLeft--;
          if (apiNumsLeft === 0) {
            resolve(true);
          }
        });
      this._commonService.getColorList('')
        .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
          if (resp.status) {
            if (resp.data.findIndex((o) => o.id === this.frm.get('colorId').value) === -1) {
              if (this.frm.get('colorId').value && this.frm.get('colorName').value) {
                resp.data.unshift({
                  id: this.frm.get('colorId').value,
                  name: this.frm.get('colorName').value,
                  description: this.frm.get('colorName').value
                });
              }
            }
            if (resp.data.findIndex((o) => o.id === this.frm.get('blankColorId').value) === -1) {
              if (this.frm.get('blankColorId').value && this.frm.get('blankColorName').value) {
                resp.data.unshift({
                  id: this.frm.get('blankColorId').value,
                  name: this.frm.get('blankColorName').value,
                  description: this.frm.get('blankColorName').value
                });
              }
            }
            this.serverSideColorData = resp.data;
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          this._changeDetectorRef.markForCheck();
          apiNumsLeft--;
          if (apiNumsLeft === 0) {
            resolve(true);
          }
        });
      this._commonService.getContentList()
        .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
          if (resp.status) {
            this.contentData = resp.data;
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          apiNumsLeft--;
          if (apiNumsLeft === 0) {
            resolve(true);
          }
        });
      this._commonService.getCooList()
        .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
          if (resp.status) {
            this.cooData = resp.data;
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          apiNumsLeft--;
          if (apiNumsLeft === 0) {
            resolve(true);
          }
        });
      this._commonService.getAllSizes()
        .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
          if (resp.status) {
            this.sizeData = resp.data;
            this.patchSizesValue(this.blanksInfo);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          apiNumsLeft--;
          if (apiNumsLeft === 0) {
            resolve(true);
          }
        });
      // factory for type imports
      this._commonService.getFactoryList(this.factoryTypes.Outsource)
        .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
          if (resp.status) {
            this.factoryOutsourceList = resp.data;
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          apiNumsLeft--;
          if (apiNumsLeft === 0) {
            resolve(true);
          }
        });
      // factory for type imports
      this._commonService.getFactoryList(this.factoryTypes.Imports)
        .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
          if (resp.status) {
            this.factoryImportsList = resp.data;
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          apiNumsLeft--;
          if (apiNumsLeft === 0) {
            resolve(true);
          }
        });
      this.loadA2000StyleForClientSide().then(() => {
        apiNumsLeft--;
        if (apiNumsLeft === 0) {
          resolve(true);
        }
      });
      this.getBlankInfoData().then(() => {
        apiNumsLeft--;
        if (apiNumsLeft === 0) {
          resolve(true);
        }
      });
    });
  }

  public get isA2000Order(): boolean {
    return this.frm ? !!this.frm.get('isA2000Order').value : false;
  }

  public buildForm(): void {
    let styleFGs = [];
    // if (this.styleList && this.styleList.length && this.blanksInfo) {
    //   // build select form
    //   styleFGs = this.styleList
    //     .map((style) => this._validationService.buildForm({
    //       styleId: new FormControl(style.id),
    //       styleFullName: new FormControl(this.getLabelString(style)),
    //       isSelected: new FormControl(style.id === this.blanksInfo.id
    //         || this.blanksInfo.techPackApplyToStyles.some((id) => id === style.id))
    //     }, {}, {}));
    // }
    let controlConfig = {
      id: new FormControl(''),
      licensorName: new FormControl(''),
      itemType: new FormControl({
        value: null,
        disabled: this.isPageReadOnly || this.isStyleReadOnly
      }, this.validValue([
        1,
        2,
        3
      ])),
      styleType: new FormControl(null, this.validValue([
        1,
        2,
        3,
        4,
        5
      ])),
      isReorderConfirmed: new FormControl(null),
      reorderComment: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'reorderComment'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      orderId: new FormControl(this.orderIndex.orderId),
      styleId: new FormControl(null),
      categoryId: new FormControl(null, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'fourthCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      styleName: new FormControl(''),
      requiresTesting: new FormControl(null, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'fourthCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      partnerStyleId: new FormControl(null),
      partnerStyleName: new FormControl('', Validators.required),
      a2000StyleId: new FormControl(null),
      a2000StyleName: new FormControl('', Validators.required),
      colorId: new FormControl(null),
      colorName: new FormControl('', Validators.required),
      cutTicketNumber: new FormControl({
        value: '',
        disabled: this.isPageReadOnly || this.isStyleReadOnly
      }, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'secondCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      files: new FormControl([]),
      cutTicketCreated: new FormControl(null),
      cutTicketCreatedOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'secondCase'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      cutTicketApproved: new FormControl(null),
      cutTicketApprovedOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
          MaxDateToday
        ])
      ]),
      vendorId: new FormControl(null),
      vendorStyleId: new FormControl(null),
      tscStyleId: new FormControl({
        value: null,
        disabled: this.isPageReadOnly || this.isStyleReadOnly
      }),
      tscBodyColor: new FormControl({
        value: '',
        disabled: this.isPageReadOnly || this.isStyleReadOnly
      }),
      vendorStyleName: new FormControl('', Validators.required),
      sizeClassId: new FormControl(null),
      sizeClassName: new FormControl('', Validators.required),
      blankColorId: new FormControl(null),
      blankColorName: new FormControl('', Validators.required),
      sizeSelected: new FormControl([], Validators.required),
      imageUrl: new FormControl(''),
      absoluteUrl: new FormControl(''),
      contentId: new FormControl(null),
      contentName: new FormControl(''),
      cooId: new FormControl(null),
      cooName: new FormControl(''),
      overagesMethod: new FormControl({
        value: null,
        disabled: this.isPageReadOnly || this.isStyleReadOnly
      }, this.validValue([
        1,
        2
      ])),
      overages: new FormControl({
        value: 0,
        disabled: this.isPageReadOnly || this.isStyleReadOnly
      }, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'thirdCase'),
            Validators.compose([
              Validators.required
            ])
          ),
          this.overagesRange
        ])
      ]),
      saleOrderSizes: new FormControl([]),
      sampleSizes: new FormControl([]),
      topSizes: new FormControl([]),
      licensorSizes: new FormControl([]),
      licenseeSizes: new FormControl([]),
      retailerSizes: new FormControl([]),
      salesSizes: new FormControl([]),
      totalOrderSizes: new FormControl([]),
      overageSizes: new FormControl([]),
      whsBlankSizes: new FormControl([]),
      whsPrintedSizes: new FormControl([]),
      purchaseSizes: new FormControl([]),
      totalProductionSizes: new FormControl([]),
      totalFinishedSizes: new FormControl([]),
      sizeColumns: this._fb.array([]),
      blanks: this._fb.array([]),
      status: new FormControl(''),
      isBlankNotApplicable: new FormControl({
        value: false,
        disabled: this.isPageReadOnly || this.isStyleReadOnly
      }),
      isAllPoSpecified: new FormControl({
        value: false,
        disabled: this.isPageReadOnly || this.isStyleReadOnly
      }),
      brand: new FormControl({
        value: '',
        disabled: this.isPageReadOnly || this.isStyleReadOnly
      }),
      isA2000Order: new FormControl(''),
      productionMethod: new FormControl({
        value: null,
        disabled: this.isPageReadOnly || this.isStyleReadOnly
      }, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'productionMethod'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      shipMethod: new FormControl({
        value: null,
        disabled: this.isPageReadOnly || this.isStyleReadOnly
      }),
      comments: new FormControl({
        value: '',
        disabled: this.isPageReadOnly || this.isStyleReadOnly
      }),
      isCustomCutAndSew: new FormControl({
        value: false,
        disabled: this.isPageReadOnly || this.isStyleReadOnly
      }, [Validators.required]),
      factoryId: new FormControl({
        value: null,
        disabled: this.isPageReadOnly || this.isStyleReadOnly
      }, [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'fourthCase'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      embellishmentProcess: new FormControl([], [
        ExtraValidators.conditional(
          (group) => this.getSpecialRequireCase(group, 'fourthCase'),
          Validators.compose([
            Validators.required
          ])
        )
      ]),
      exFactoryDate: new FormControl(null),
      exFactoryDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      arrival3PlDate: new FormControl(null),
      arrival3PlDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      // readyToShipDate: new FormControl(null),
      // readyToShipDateOnUtc: new FormControl('', [
      //   Validators.compose([
      //     Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
      //       '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
      //   ])
      // ]),
      etaTscDate: new FormControl(null),
      etaTscDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      readyToShipStartDate: new FormControl(null),
      readyToShipStartDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      readyToShipEndDate: new FormControl(null),
      readyToShipEndDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      styleList: this._fb.array(styleFGs),
      // techPackReadyDate: new FormControl(null),
      // techPackReadyDateOnUtc: new FormControl('', [
      //   Validators.compose([
      //     Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
      //       '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
      //     MaxDateToday
      //   ])
      // ]),
      // techPackApplyToStyles: new FormControl(''),
      formRequires: new FormControl({
        itemType: {
          required: true
        },
        styleType: {
          required: true
        },
        isReorderConfirmed: {
          required: false
        },
        categoryId: {
          required: false
        },
        reorderComment: {
          required: false
        },
        styleName: {
          required: false
        },
        partnerStyleName: {
          required: true
        },
        a2000StyleName: {
          required: true
        },
        requiresTesting: {
          required: false
        },
        colorName: {
          required: true
        },
        cutTicketNumber: {
          required: false
        },
        cutTicketCreatedOnUtc: {
          required: false
        },
        cutTicketApprovedOnUtc: {
          required: false
        },
        blankColorName: {
          required: true
        },
        sizeSelected: {
          required: true
        },
        contentName: {
          required: false
        },
        cooName: {
          required: false
        },
        overagesMethod: {
          required: true
        },
        overages: {
          required: false
        },
        tscStyleId: {
          required: false
        },
        tscBodyColor: {
          required: false
        },
        vendorStyleName: {
          required: true
        },
        sizeClassName: {
          required: true
        },
        brand: {
          required: false
        },
        factoryId: {
          required: false
        },
        embellishmentProcess: {
          required: false
        },
        exFactoryDateOnUtc: {
          required: false
        },
        arrival3PlDateOnUtc: {
          required: false
        },
        // readyToShipDateOnUtc: {
        //   required: false
        // },
        readyToShipStartDateOnUtc: {
          required: false
        },
        readyToShipEndDateOnUtc: {
          required: false
        },
        etaTscDateOnUtc: {
          required: false
        },
        // techPackReadyDateOnUtc: {
        //   required: false
        // },
        productionMethod: {
          required: false
        },
        shipMethod: {
          required: false
        }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);
    // this.addBlank();
    this.onValueChanged(); // (re)set validation messages now
    this.backupData();
  }

  public setBlanks(blanks: Blank[]) {
    const blankFGs = blanks.map((blank: Blank, i) =>
      this._validationService.buildForm({
        id: new FormControl(blank.id),
        vendorId: new FormControl(blank.vendorId),
        vendorName: new FormControl(blank.vendorName, [Validators.required]),
        comments: new FormControl({
          value: blank.comments,
          disabled: this.isPageReadOnly || this.isStyleReadOnly
        }),
        poNumber: new FormControl({
          value: blank.poNumber,
          disabled: this.isPageReadOnly || this.isStyleReadOnly
        }),
        estDeliveryDateFrom: new FormControl(''),
        estDeliveryDateFromOnUtc: new FormControl(blank.estDeliveryDateFromOnUtc,
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MaxDate('estDeliveryDateToOnUtc')
          ])
        ),
        estDeliveryDateFromOptions: new FormControl(this.estDeliveryDateFromOptions),
        estDeliveryDateTo: new FormControl(''),
        estDeliveryDateToOnUtc: new FormControl(blank.estDeliveryDateToOnUtc,
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MinDate('estDeliveryDateFromOnUtc')
          ])
        ),
        estDeliveryDateToOptions: new FormControl(this.estDeliveryDateToOptions),
        receivedDateFrom: new FormControl(''),
        receivedDateFromOnUtc: new FormControl(blank.receivedDateFromOnUtc,
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MaxDate('receivedDateToOnUtc')
          ])
        ),
        receivedDateFromOptions: new FormControl(this.receivedDateFromOptions),
        receivedDateTo: new FormControl(''),
        receivedDateToOnUtc: new FormControl(blank.receivedDateToOnUtc,
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MinDate('receivedDateFromOnUtc')
          ])
        ),
        files: new FormControl(blank.files),
        receivedDateToOptions: new FormControl(this.receivedDateToOptions),
        styleList: this._fb.array([]),
        applyToStyles: new FormControl(''),
        formRequires: new FormControl({
          comments: {
            required: false
          },
          vendorName: {
            required: true
          },
          poNumber: {
            required: false
          },
          estDeliveryDateFromOnUtc: {
            required: false
          },
          estDeliveryDateToOnUtc: {
            required: false
          },
          receivedDateFromOnUtc: {
            required: false
          },
          receivedDateToOnUtc: {
            required: false
          }
        })
      }, this.formErrors, this.validationMessages));
    blankFGs.forEach((blank, i) => {
      if (this.styleList && this.styleList.length) {
        let applyToStylesIdArr = [];
        if (blanks[i] && blanks[i].applyToStyles) {
          applyToStylesIdArr = blanks[i].applyToStyles.split(',');
        }
        applyToStylesIdArr.push(this.blanksInfo.id.toString());
        // build select form
        const styleFGs = this.styleList
          .map((style) => this._validationService.buildForm({
            styleId: new FormControl(style.id),
            styleFullName: new FormControl(this.getLabelString(style)),
            isSelected: new FormControl(style.id === this.blanksInfo.id
              || applyToStylesIdArr.some((id) => id === style.id.toString()))
          }, {}, {}));
        const styleFormArray = this._fb.array(styleFGs);
        blank.setControl('styleList', styleFormArray);
      }
    });

    const blankFormArray = this._fb.array(blankFGs);
    this.frm.setControl('blanks', blankFormArray);
    // this.updateVendorRequired();
  }

  public get blanks(): FormArray {
    return this.frm.get('blanks') as FormArray;
  };

  public addBlank() {
    if (this.checkPreFormIsValid()) {
      let styleFGs = [];
      if (this.styleList && this.styleList.length) {
        // build select form
        styleFGs =
          this.styleList.map((style) => this._validationService.buildForm({
            styleId: new FormControl(style.id),
            styleFullName: new FormControl(this.getLabelString(style)),
            isSelected: new FormControl(this.blanksInfo &&
              this.blanksInfo.id && this.blanksInfo.id.toString() === style.id.toString())
          }, {}, {}));
      }

      this.blanks.push(this._validationService.buildForm({
        vendorId: new FormControl(null),
        vendorName: new FormControl('', [Validators.required]),
        comments: new FormControl({
          value: '',
          disabled: this.isPageReadOnly || this.isStyleReadOnly
        }),
        poNumber: new FormControl({
          value: '',
          disabled: this.isPageReadOnly || this.isStyleReadOnly
        }),
        estDeliveryDateFrom: new FormControl(''),
        estDeliveryDateFromOnUtc: new FormControl('',
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MaxDate('estDeliveryDateToOnUtc')
          ])
        ),
        estDeliveryDateFromOptions: new FormControl(this.estDeliveryDateFromOptions),
        estDeliveryDateTo: new FormControl(''),
        estDeliveryDateToOnUtc: new FormControl('',
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MinDate('estDeliveryDateFromOnUtc')
          ])
        ),
        estDeliveryDateToOptions: new FormControl(this.estDeliveryDateToOptions),
        receivedDateFrom: new FormControl(''),
        receivedDateFromOnUtc: new FormControl('',
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MaxDate('receivedDateToOnUtc')
          ])
        ),
        receivedDateFromOptions: new FormControl(this.receivedDateFromOptions),
        receivedDateTo: new FormControl(''),
        receivedDateToOnUtc: new FormControl('',
          Validators.compose([
            Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
              '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)'),
            MinDate('receivedDateFromOnUtc')
          ])
        ),
        receivedDateToOptions: new FormControl(this.receivedDateToOptions),
        files: new FormControl([]),
        isUploadedBlankSubmissionForm: new FormControl(''),
        styleList: this._fb.array(styleFGs),
        applyToStyles: new FormControl(''),
        formRequires: new FormControl({
          comments: {
            required: false
          },
          vendorName: {
            required: true
          },
          poNumber: {
            required: false
          },
          estDeliveryDateFromOnUtc: {
            required: false
          },
          estDeliveryDateToOnUtc: {
            required: false
          },
          receivedDateFromOnUtc: {
            required: false
          },
          receivedDateToOnUtc: {
            required: false
          }
        })
      }, this.formErrors, this.validationMessages));

      // this.updateVendorRequired();
    }
  }

  public onSelectOpen(select: NgSelectComponent): void {
    if (!select.multiple && select.selectedItems && select.selectedItems.length) {
      let filterVal = select.selectedItems[0].label;
      select.filterValue = filterVal ? filterVal : '';
    }
  }

  public onValueChanged(data?): void {
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
   * Set date value to bind to mydatepicker
   * @param form
   * @param index
   */
  public setDateValue(frm: any, isMainFrm = false, isUpdateUi = true): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (frm.get(importName) && frm.get(importName).value) {
        let dateRegex = /^\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})$/;
        if (dateRegex.test(frm.get(importName).value)) {
          const newDateTime = new Date(frm.get(importName).value);
          frm.get(importName).patchValue(newDateTime);
          // ------
          const currentDate = new Date(frm.get(importName).value);
          this.configDateOptions(frm, importName, currentDate);
          frm.get(exportName).setValue({
            date: {
              year: currentDate.getFullYear(),
              month: currentDate.getMonth() + 1,
              day: currentDate.getDate()
            }
          });
        } else {
          const listNotUpdateTime = [
            'cutTicketCreatedOnUtc'
          ];
          const utcDate = new Date(frm.get(importName).value);
          let currentDate;
          if (listNotUpdateTime.indexOf(importName) > -1) {
            currentDate = new Date(frm.get(importName).value);
          } else {
            currentDate = new Date(Date.UTC(utcDate.getFullYear(),
              utcDate.getMonth(), utcDate.getDate(), utcDate.getHours(), utcDate.getMinutes()));
          }
          this.configDateOptions(frm, importName, currentDate);

          frm.get(exportName).setValue({
            date: {
              year: currentDate.getFullYear(),
              month: currentDate.getMonth() + 1,
              day: currentDate.getDate()
            }
          });
        }
      } else {
        frm.get(importName).patchValue(null);
        frm.get(exportName).patchValue(null);
        this.configDateOptions(frm, importName, null);
      }
    };
    if (isMainFrm) {
      patchDateFunc('cutTicketCreatedOnUtc', 'cutTicketCreated');
      patchDateFunc('cutTicketApprovedOnUtc', 'cutTicketApproved');
      patchDateFunc('exFactoryDateOnUtc', 'exFactoryDate');
      patchDateFunc('arrival3PlDateOnUtc', 'arrival3PlDate');
      // patchDateFunc('readyToShipDateOnUtc', 'readyToShipDate');
      patchDateFunc('readyToShipStartDateOnUtc', 'readyToShipStartDate');
      patchDateFunc('readyToShipEndDateOnUtc', 'readyToShipEndDate');
      patchDateFunc('etaTscDateOnUtc', 'etaTscDate');
      // patchDateFunc('techPackReadyDateOnUtc', 'techPackReadyDate');
    } else {
      patchDateFunc('estDeliveryDateFromOnUtc', 'estDeliveryDateFrom');
      patchDateFunc('estDeliveryDateToOnUtc', 'estDeliveryDateTo');
      patchDateFunc('receivedDateFromOnUtc', 'receivedDateFrom');
      patchDateFunc('receivedDateToOnUtc', 'receivedDateTo');
    }
    if (isUpdateUi) {
      this._changeDetectorRef.markForCheck();
    }
  }

  public overagesRange(input: FormControl) {
    if (input.value < 0 || input.value > 100) {
      // hasError overagesRange true
      return {overagesRange: true};
    }
    return null;
  }

  public validValue(nums: number[]) {
    return (input: FormControl) => {
      if (nums.indexOf(input.value) === -1) {
        // hasError invalidValue true
        return {invalidValue: true};
      }
      return null;
    };
  }

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    let firstCaseList = [
      // 'styleName',
      // 'partnerStyleName',
      // 'a2000StyleName'
    ];
    let secondCaseList = [
      'cutTicketNumber',
      'cutTicketCreatedOnUtc'
    ];
    let thirdCaseList = [
      'overagesMethod'
    ];
    let fourthCaseList = [
      'factoryId',
      'embellishmentProcess',
      'requiresTesting',
      'categoryId'
    ];
    if (key === 'firstCase') {
      let status = false;
      firstCaseList.forEach((cas) => status = status || !!frm.get(cas).value);
      firstCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else if (key === 'secondCase') {
      let status = false;
      secondCaseList.forEach((cas) => status =
        (frm.get('itemType').value !== 3 || frm.get('productionMethod').value !== 1) &&
        (status || this.checkLengthUploaderByType(this.frm, this.styleUploadedType.ProductionPO)
          || !!frm.get(cas).value));
      secondCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else if (key === 'thirdCase') {
      let status = frm.get('overagesMethod').value === this.overagesMethod.Percentage;
      frm.get('formRequires').value['overages'].required = status;
      return status;
    } else if (key === 'fourthCase') {
      // item type = (outsource | imports)
      let status = frm.get('itemType').value === 2 || frm.get('itemType').value === 3;
      fourthCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else if (key === 'productionMethod') {
      // item type = imports
      let status = frm.get('itemType').value === 3;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'reorderComment') {
      // Style Type Reorder and not confirmed
      let status = frm.get('styleType').value === 2
        && frm.get('isReorderConfirmed').value === 'false';
      frm.get('formRequires').value[key].required = status;
      return status;
    } else {
      return false;
    }
  }

  public removeSize(item) {
    this.frm.get('sizeColumns').value.forEach((sizeArray) => {
      // set removed item qty to 0
      sizeArray[item.name] = 0;
      // recalculate total Qty
      sizeArray.totalQty = 0;
      this.sizeData.forEach((s) => {
        sizeArray.totalQty += sizeArray[s.name];
      });
    });
  }

  /**
   * Bind UTC date to form
   * @param event
   * @param index
   * @param prop
   */
  public onDateChangedBy(event: IMyDateModel, frm: any, prop: string): void {
    let utcDate = Object.assign({}, event);
    frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');
    this.configDateOptions(frm, prop, utcDate.jsdate);
    // Update status for form control whose value changed
    frm.get(prop).markAsDirty();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Convert Date to IMyDate & Reconfig date options
   * @param prop
   * @param utcDate
   * @param i
   */
  public configDateOptions(frm: any, prop: string, utcDate: Date): void {
    const currentDate = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() + 1
    };

    if (!utcDate) {
      switch (prop) {
        case 'estDeliveryDateFromOnUtc':
          // Config for cancel date options
          const estDeliveryDateToOptions = {
            ...this.estDeliveryDateToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            componentDisabled: true
          };
          const estDeliveryDateFromOptions = {
            ...this.estDeliveryDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          frm.get('estDeliveryDateToOptions').setValue(estDeliveryDateToOptions);
          frm.get('estDeliveryDateFromOptions').setValue(estDeliveryDateFromOptions);
          if (frm) {
            frm.get('estDeliveryDateToOnUtc').setValue(null);
            frm.get('estDeliveryDateTo').setValue(null);
          }
          break;
        case 'estDeliveryDateToOnUtc':
          // Config for start date options
          const estDeliveryDateFromOptions2 = {
            ...this.estDeliveryDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          frm.get('estDeliveryDateFromOptions').setValue(estDeliveryDateFromOptions2);
          break;
        case 'receivedDateFromOnUtc':
          // Config for cancel date options
          const receivedDateToOptions = {
            ...this.receivedDateToOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            componentDisabled: true
          };
          const receivedDateFromOptions = {
            ...this.receivedDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          frm.get('receivedDateToOptions').setValue(receivedDateToOptions);
          frm.get('receivedDateFromOptions').setValue(receivedDateFromOptions);
          if (frm) {
            frm.get('receivedDateToOnUtc').setValue(null);
            frm.get('receivedDateTo').setValue(null);
          }
          break;
        case 'receivedDateToOnUtc':
          // Config for start date options
          const receivedDateFromOptions2 = {
            ...this.receivedDateFromOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          frm.get('receivedDateFromOptions').setValue(receivedDateFromOptions2);
          break;
        case 'cutTicketCreatedOnUtc':
          // Config for cancel date options
          this.approvedPickerOptions = {
            ...this.approvedPickerOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            enableDays: [],
            disableSince: currentDate,
            componentDisabled: true
          };
          this.cutTicketPickerOptions = {
            ...this.cutTicketPickerOptions,
            enableDays: [],
            disableSince: currentDate
          };
          if (this.frm) {
            this.frm.get('cutTicketApprovedOnUtc').setValue(null);
            this.frm.get('cutTicketApproved').setValue(null);
          }
          break;
        case 'cutTicketApprovedOnUtc':
          // Config for start date options
          this.cutTicketPickerOptions = {
            ...this.cutTicketPickerOptions,
            disableSince: currentDate
          };
          break;
        // case 'techPackReadyDateOnUtc':
        //   // Config for cancel date options
        //   this.techPackPickerOptions = {
        //     ...this.techPackPickerOptions,
        //     disableSince: currentDate
        //   };
        //   break;
        case 'readyToShipStartDateOnUtc':
          // Config for cancel date options
          this.readyToShipEndDateOptions = {
            ...this.readyToShipEndDateOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            },
            componentDisabled: true
          };
          this.readyToShipStartDateOptions = {
            ...this.readyToShipStartDateOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          if (frm) {
            frm.get('readyToShipEndDateOnUtc').setValue(null);
            frm.get('readyToShipEndDate').setValue(null);
          }
          break;
        case 'readyToShipEndDateOnUtc':
          // Config for start date options
          this.readyToShipStartDateOptions = {
            ...this.readyToShipStartDateOptions,
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
      this._changeDetectorRef.markForCheck();
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
      case 'estDeliveryDateFromOnUtc':
        // Config for end date options
        const estDeliveryDateToOptions = {
          ...this.estDeliveryDateToOptions,
          disableUntil: dateCurrentUntil,
          disableSince: {
            year: 0,
            month: 0,
            day: 0
          },
          enableDays: [],
          componentDisabled: false
        };
        frm.get('estDeliveryDateToOptions').setValue(estDeliveryDateToOptions);
        break;
      case 'estDeliveryDateToOnUtc':
        // Config for start date options
        const estDeliveryDateFromOptions = {
          ...this.estDeliveryDateFromOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        frm.get('estDeliveryDateFromOptions').setValue(estDeliveryDateFromOptions);
        break;
      case 'receivedDateFromOnUtc':
        // Config for end date options
        const receivedDateToOptions = {
          ...this.receivedDateToOptions,
          disableUntil: dateCurrentUntil,
          disableSince: {
            year: 0,
            month: 0,
            day: 0
          },
          enableDays: [],
          componentDisabled: false
        };
        frm.get('receivedDateToOptions').setValue(receivedDateToOptions);
        break;
      case 'receivedDateToOnUtc':
        // Config for start date options
        const receivedDateFromOptions = {
          ...this.receivedDateFromOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        frm.get('receivedDateFromOptions').setValue(receivedDateFromOptions);
        break;
      case 'cutTicketCreatedOnUtc':
        // Config for end date options
        this.approvedPickerOptions = {
          ...this.approvedPickerOptions,
          disableUntil: this.getMaxDate(currentDate, dateCurrentUntil),
          disableSince: currentDate,
          enableDays: [
            dateCurrentUntil
          ],
          componentDisabled: false
        };
        break;
      case 'cutTicketApprovedOnUtc':
        // Config for start date options
        this.cutTicketPickerOptions = {
          ...this.cutTicketPickerOptions,
          disableSince: this.getMaxDate(currentDate, dateCurrentSince),
          enableDays: [
            dateCurrentSince
          ]
        };
        break;
      // case 'techPackReadyDateOnUtc':
      //   // Config for cancel date options
      //   this.techPackPickerOptions = {
      //     ...this.techPackPickerOptions,
      //     disableSince: currentDate
      //   };
      //   break;
      case 'readyToShipStartDateOnUtc':
        // Config for end date options
        this.readyToShipEndDateOptions = {
          ...this.readyToShipEndDateOptions,
          disableUntil: this.getMaxDate(currentDate, dateCurrentUntil),
          disableSince: currentDate,
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentUntil), currentDate)
            //   ? '' : dateCurrentUntil
          ],
          componentDisabled: false
        };
        break;
      case 'readyToShipEndDateOnUtc':
        // Config for start date options
        this.readyToShipStartDateOptions = {
          ...this.readyToShipStartDateOptions,
          disableSince: this.getMaxDate(currentDate, dateCurrentSince),
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentSince), currentDate)
            //   ? '' : dateCurrentSince
          ]
        };
        break;
      default:
        break;
    }
    this._changeDetectorRef.markForCheck();
  }

  public getMaxDate(currentDate: IMyDate, dateCompare: IMyDate): IMyDate {
    const timeCurrent = new Date(`${currentDate.month}/${currentDate.day}/${currentDate.year}`)
      .getTime();
    const timeDate = new Date(`${dateCompare.month}/${dateCompare.day}/${dateCompare.year}`)
      .getTime();
    return timeDate >= timeCurrent ? currentDate : dateCompare;
  }

  /**
   * Double click column to edit input
   * @param event
   * @param cell
   * @param row
   * @param blankIndex
   * @param value
   */
  public onDoubleClicked(event, cell, row, rowName): void {
    if (this.isPageReadOnly || this.isStyleReadOnly
      || (rowName === 'Sales Order Qtys' && this.isA2000Order)) {
      return;
    }
    this.editing[`${row}-${cell}`] = true;
  }

  /**
   * Update value which is edit inline in datatable
   * @param value
   * @param cell
   * @param row
   */
  public onUpdateValue(event, cell, row) {
    this.editing[`${row}-${cell}`] = false;
    if (!this.doBlurUpdate) {
      this.doBlurUpdate = true;
      return;
    }
    let sizeRow = this.frm
      .get('sizeColumns').get(row.toString());
    sizeRow.get(cell).patchValue(+event.target.value);
    sizeRow.value['totalQty'] = 0;
    this.sizeData.forEach((size) => sizeRow.value['totalQty'] += sizeRow.value[size.name]);
    this.frm.get('sizeSelected').value.forEach((size) => {
      this.validateChildSize(size.name, row);
    });
  }

  public validateChildSize(cell, row) {
    if (this.isSMPL && this.blankSizes[row] && this.blankSizes[row]['isChildSize'] &&
      this.frm.get('sizeColumns').get('0') && this.frm.get('sizeColumns').get('0').get(cell)) {
      let salesOrderQty = this.frm.get('sizeColumns').get('0').get(cell).value;
      let totalChildSize = 0;
      this.blankSizes.forEach((s, index) => {
        if (s['isChildSize'] && this.frm.get('sizeColumns').get(index.toString()) &&
          this.frm.get('sizeColumns').get(index.toString()).get(cell)) {
          totalChildSize +=
            this.frm.get('sizeColumns').get(index.toString()).get(cell).value;
        }
      });
      setTimeout(() => {
        if (this.sizeCells && this.sizeCells.length) {
          this.sizeCells.forEach((s) => {
            if (s.nativeElement && s.nativeElement.id.includes('-' + cell + '-true')) {
              if (salesOrderQty < totalChildSize) {
                s.nativeElement.className = 'red';
              } else {
                s.nativeElement.className = '';
              }
            }
          });
        }
      });
      return salesOrderQty >= totalChildSize;
    }
    return true;
  }

  public get getSizeString(): string {
    if (this.frm.get('sizeSelected').value && this.frm.get('sizeSelected').value.length) {
      return this.frm.get('sizeSelected').value.map((i) => i.name).join(', ');
    } else {
      return '';
    }
  }

  public get embellishmentProcessString(): string {
    const embellismentArr = this.listEmbellishment
      .filter((i) => this.frm.get('embellishmentProcess').value.indexOf(i.id) > -1);
    if (embellismentArr && embellismentArr.length) {
      return embellismentArr.map((i) => i.name).join(', ');
    } else {
      return '';
    }
  }

  public onSavedWithNewVal(frm: FormGroup, willAddNew?: boolean) {
    // wait for size qty validate
    setTimeout(() => this.onSaved(frm, willAddNew));
  }

  public onDeleted(index: number): void {
    let modalRef = this._modalService.open(ConfirmDialogComponent, {
      keyboard: true
    });
    modalRef.componentInstance
      .message = 'Are you sure you want to delete the style?';
    modalRef.componentInstance.title = 'Confirm Style Deletion';

    modalRef.result.then((res: any) => {
      if (res) {
        if (!this.frm.get('id').value) {
          this.buildForm();
        } else {
          this._styleService
            .deleteStyleDetail(this.frm.get('id').value)
            .subscribe((resp: BasicResponse) => {
              if (resp.status) {
                this._toastrService.success(resp.message, 'Success');
                this.buildForm();
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
      }
    });
  }

  public backupData(): void {
    let data = Object.assign({}, this.frm.value);
    this._localStorageService.set('backupData', data);
  }

  public revertData(): void {
    let tFrm = this._localStorageService.get('backupData');
    if (tFrm) {
      this.frm
        .patchValue(tFrm);
    }
    this.backupData();
  }

  public backupInheritData(styleDetail: StyleDetail) {
    let data = {
      vendorStyleId: styleDetail.vendorStyleId,
      vendorStyleName: styleDetail.vendorStyleName,
      sizeClassId: styleDetail.sizeClassId,
      sizeClassName: styleDetail.sizeClassName,
      colorId: styleDetail.colorId,
      colorName: styleDetail.colorName,
      sizeSelected: this.frm.get('sizeSelected').value,
      contentId: styleDetail.contentId,
      contentName: styleDetail.contentName,
      cooId: styleDetail.cooId,
      cooName: styleDetail.colorName,
      overagesMethod: styleDetail.overagesMethod,
      overages: styleDetail.overages,
      saleOrderSizes: styleDetail.saleOrderSizes,
      sampleSizes: styleDetail.sampleSizes,
      productionSizes: styleDetail.productionSizes,
      topSizes: styleDetail.topSizes,
      sizeColumns: this.frm.get('sizeColumns').value
    };
    this._localStorageService.set('backupInheritData', data);
  }

  public onCancel(): void {
    let previousRoute: string = this._utilService.previousRouteUrl;
    if (previousRoute) {
      this._router.navigate([previousRoute]);
    } else {
      this._router.navigate([
        'order-log-v2',
        this.orderIndex.orderId
      ]);
    }
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

  public scrollTo(element: Element, to: number, duration: number) {
    if (duration <= 0) {
      return;
    }
    let difference = to - element.scrollTop;
    let perTick = difference / duration * 10;

    setTimeout(() => {
      element.scrollTop = element.scrollTop + perTick;
      if (element.scrollTop === to) {
        return;
      }
      this.scrollTo(element, to, duration - 10);
    }, 10);
  }

  public onKeydown(event, sizeIndex: number, sizeName, row): void {
    this.doBlurUpdate = true;
    let e = <KeyboardEvent> event;
    let blank = this.frm.value;
    let pos = [
      0,
      0
    ];
    // on esc
    if (e.keyCode === 27) {
      let formData = this._localStorageService.get('backupData') as StyleDetail;
      let oldVal = formData.sizeColumns[row][sizeName] || 0;
      event.target.value = oldVal;
      this.editing[`${row}-${sizeName}`] = false;
      return;
    } else if ((!event.shiftKey && e.keyCode === 9 && e.code === 'Tab')
      || (e.keyCode === 39 && e.code === 'ArrowRight') || e.keyCode === 13) {
      pos = this.findNextCell(row, sizeIndex, 'forward');
    } else if ((event.shiftKey && e.keyCode === 9 && e.code === 'Tab')
      || (e.keyCode === 37 && e.code === 'ArrowLeft')) {
      pos = this.findNextCell(row, sizeIndex, 'backward');
    } else if (e.keyCode === 38 && e.code === 'ArrowUp') {
      pos = this.findNextCell(row, sizeIndex, 'up');
    } else if (e.keyCode === 40 && e.code === 'ArrowDown') {
      pos = this.findNextCell(row, sizeIndex, 'down');
    } else {
      return;
    }
    this.editing[`${pos[0]}-${blank.sizeSelected[pos[1]].name}`] = true;
    this.onUpdateValue(event, sizeName, row);
    this.doBlurUpdate = false;
  }

  public findNextCell(row, col, direction) {
    const rowNums = this.blankSizes.length - 1;
    const colNums = this.frm.get('sizeSelected').value.length - 1;
    switch (direction) {
      case 'down':
        while (row < rowNums) {
          row++;
          if (this.blankSizes[row].canEdit
            && (this.blankSizes[row].isChildSize && this.isShowChildSize
              || !this.blankSizes[row].isChildSize)) {
            return [
              row,
              col
            ];
          }
        }
        break;
      case 'up':
        while (row > 0) {
          row--;
          if (this.blankSizes[row].canEdit
            && (this.blankSizes[row].isChildSize && this.isShowChildSize
              || !this.blankSizes[row].isChildSize)) {
            return [
              row,
              col
            ];
          }
        }
        break;
      case 'forward':
        while (row <= rowNums) {
          while (col < colNums) {
            col++;
            if (this.blankSizes[row].canEdit
              && (this.blankSizes[row].isChildSize && this.isShowChildSize
                || !this.blankSizes[row].isChildSize)) {
              return [
                row,
                col
              ];
            } else {
              break;
            }
          }
          row++;
          col = -1;
        }
        break;
      case 'backward':
        while (row >= 0) {
          while (col > 0) {
            col--;
            if (this.blankSizes[row].canEdit
              && (this.blankSizes[row].isChildSize && this.isShowChildSize
                || !this.blankSizes[row].isChildSize)) {
              return [
                row,
                col
              ];
            } else {
              break;
            }
          }
          row--;
          col = colNums + 1;
        }
        break;
      default:
        break;
    }
    return [
      0,
      0
    ];
  }

  public patchSizesValue(blankDetail: StyleDetail) {
    let sizesArray = [];
    this.blankSizes.forEach((item) => {
      let sizesRow = {totalQty: 0};
      this.sizeData.forEach((size) => sizesRow[size.name] = 0);
      sizesArray.push(sizesRow);
    });
    // Combine size
    let sizeColumns = []; // array of sizes obj
    if (blankDetail) {
      this.blankSizes.forEach((item) => {
        if (blankDetail[item.sizeName]) {
          sizeColumns = _.union(
            sizeColumns,
            blankDetail[item.sizeName].map((i) => {
              return _.find(this.sizeData, {name: i.name});
            })
          );
        }
      });
    }
    sizeColumns = _.compact(sizeColumns);
    // Create sizes data table
    let mapSizes = (sizeType: StyleSize[], index: number) => {
      let sizesRowVal = {totalQty: 0};
      sizeColumns.forEach((size) => sizesRowVal[size] = 0);
      sizeType.forEach((size) => {
        sizesRowVal[size.name] = +size.qty;
        sizesRowVal['totalQty'] += +size.qty;
      });
      sizesArray[index] = Object.assign(sizesArray[index], sizesRowVal);
    };
    if (blankDetail) {
      this.blankSizes.forEach((item, index) => {
        if (blankDetail[item.sizeName]) {
          mapSizes(blankDetail[item.sizeName], index);
        }
      });
    }
    this.frm.get('sizeSelected').patchValue(sizeColumns);
    this.frm.setControl('sizeColumns',
      this._fb.array(sizesArray.map((size) => this._fb.group(size))));
  }

  public openUploader(frm: FormGroup, type: number, isCallApi?: boolean): void {
    if (!this.orderIndex.styleId) {
      this._toastrService.error('Please update detail first!',
        'Error');
      return;
    }
    const funcUpload = (fileList: any[]) => {
      let modalRef = this._modalService.open(UploaderTypeComponent, {
        size: 'lg',
        keyboard: false,
        backdrop: 'static',
        windowClass: 'super-lg'
      });
      modalRef.componentInstance.title = this.typeMsg[type];
      Object.assign(modalRef.componentInstance.uploadOptions, {
        id: this.orderIndex.styleId,
        uploadType: type === this.styleUploadedType.ProductionPO ? this.uploadedType.CutTickets
          : type === this.styleUploadedType.BlankSubmission ? this.uploadedType.BlankStyle
            : type === this.styleUploadedType.QA ? this.uploadedType.PoStyle : '',
        fileList: fileList.filter((i) => i),
        fileType: type,
        isReadOnly: this.isPageReadOnly || this.isStyleReadOnly
        || this.isStyleCancelled || this.isOrderArchived || this.isOrderCancelled
      });

      modalRef.result.then((res) => {
        if (res.status) {
          let isShownMsg = false;
          if (isCallApi) {
            let currentFiles = frm.get('files').value;
            if (res.newList && res.newList.length) {
              this._styleService.uploadFileToStyle(this.orderIndex.styleId, res.newList)
                .subscribe((resp: ResponseMessage<UploadedFileModel[]>) => {
                  if (resp.status) {
                    if (resp.data.length) {
                      if (!isShownMsg) {
                        this._toastrService
                          .success(`${this.typeMsg[type]} updated successfully.`, 'Success');
                        isShownMsg = true;
                      }
                      currentFiles = [
                        ...currentFiles,
                        ...resp.data
                      ];
                      frm.get('files').setValue(currentFiles);
                      this._changeDetectorRef.markForCheck();
                    }
                  } else {
                    this._toastrService.error(resp.errorMessages, 'Error');
                  }
                });
            }
            if (res.deletedList && res.deletedList.length) {
              this._styleService.deleteUploadedStyleFile(this.orderIndex.styleId,
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
              this._styleService.updateStyleFiles(this.orderIndex.styleId, res.updateList)
                .subscribe((resp: BasicResponse) => {
                  if (resp.status) {
                    if (!isShownMsg) {
                      this._toastrService
                        .success(`${this.typeMsg[type]} updated successfully.`, 'Success');
                      isShownMsg = true;
                    }
                    this._changeDetectorRef.markForCheck();
                  } else {
                    this._toastrService.error(resp.errorMessages, 'Error');
                  }
                });
            }
            return;
          }
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
                .success(`${this.typeMsg[type]} removed successfully.`, 'Success');
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
                .success(`${this.typeMsg[type]} uploaded successfully.`, 'Success');
            }

            if (res.duplicatedList && res.duplicatedList.length) {
              res.duplicatedList.forEach((i) => {
                if (currentTypeList.indexOf(i) > -1) {
                  currentTypeList.splice(currentTypeList.indexOf(i), 1);
                }
              });
            }
            frm.get('files').setValue([
              ...currentTypeList,
              ...res.newList
            ]);
            this._changeDetectorRef.markForCheck();
          }

          if (!isShownMsg) {
            this._toastrService
              .success(`${this.typeMsg[type]} updated successfully.`, 'Success');
          }
        }
      }, (err) => {
        // empty
      });
    };
    let fileList = [];
    if (frm.get('files') && frm.get('files').value && frm.get('files').value.length >= 0) {
      if (isCallApi) {
        fileList = frm.get('files').value.filter((f) => f.type === type);
      } else {
        fileList = frm.get('files').value;
      }
    }
    funcUpload(fileList);
  }

  public openOwsTechPackUploader(frm: FormGroup, type: number): void {
    if (!this.orderIndex.styleId) {
      this._toastrService.error('Please update detail first!',
        'Error');
      return;
    }
    const funcUpload = (fileList: any[]) => {
      let modalRef = this._modalService.open(UploaderTypeComponent, {
        size: 'lg',
        keyboard: false,
        backdrop: 'static',
        windowClass: 'super-lg'
      });
      modalRef.componentInstance.title = this.typeMsg[type];
      Object.assign(modalRef.componentInstance.uploadOptions, {
        id: this.orderIndex.styleId,
        uploadType: this.uploadedType.OrderWorkSheets,
        fileList: fileList.filter((i) => i),
        fileType: type,
        isReadOnly: this.isPageReadOnly || this.isStyleReadOnly
        || this.isStyleCancelled || this.isOrderArchived || this.isOrderCancelled
      });

      modalRef.result.then((res) => {
        if (res.status) {
          let isShownMsg = false;
          let currentFiles = frm.get('files').value;
          if (res.newList && res.newList.length) {
            this._styleService.uploadFileToStyle(this.orderIndex.styleId, res.newList)
              .subscribe((resp: ResponseMessage<UploadedFileModel[]>) => {
                if (resp.status) {
                  if (resp.data.length) {
                    if (!isShownMsg) {
                      this._toastrService
                        .success(`${this.typeMsg[type]} updated successfully.`, 'Success');
                      isShownMsg = true;
                    }
                    currentFiles = [
                      ...currentFiles,
                      ...resp.data
                    ];
                    frm.get('files').setValue(currentFiles);
                    this._changeDetectorRef.markForCheck();
                  }
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
          }
          if (res.deletedList && res.deletedList.length) {
            this._styleService.deleteUploadedStyleFile(this.orderIndex.styleId,
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
            this._styleService.updateStyleFiles(this.orderIndex.styleId, res.updateList)
              .subscribe((resp: BasicResponse) => {
                if (resp.status) {
                  if (!isShownMsg) {
                    this._toastrService
                      .success(`${this.typeMsg[type]} updated successfully.`, 'Success');
                    isShownMsg = true;
                  }
                  this._changeDetectorRef.markForCheck();
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
          }
        }
      }, (err) => {
        // empty
      });
    };
    let fileList = [];
    if (frm.get('files') && frm.get('files').value && frm.get('files').value.length >= 0) {
      fileList = frm.get('files').value.filter((f) => f.type === type);
    }
    funcUpload(fileList);
  }

  public openShippingTscUploader(frm): void {
    const fileList = frm.get('files').value
      .filter((i) => [
        this.styleUploadedType.ShippingLabels,
        this.styleUploadedType.TscPackingList
      ].indexOf(i.type) > -1);
    let currentTypeList = Object.assign([], fileList);
    let modalRef = this._modalService.open(UploaderTypeComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static',
      windowClass: 'super-lg'
    });
    modalRef.componentInstance.title = 'Shipping Labels / TSC Packing List';
    modalRef.componentInstance.styleId = Number(this.orderIndex.styleId);
    modalRef.componentInstance.styleList = this.styleList.filter((s) =>
      s.id === Number(this.orderIndex.styleId)
      || s.type === OrderItemTypes.ItemTypes.OUTSOURCE
      || s.type === OrderItemTypes.ItemTypes.IMPORTS);
    modalRef.componentInstance.selectTypeData = [
      {
        id: this.styleUploadedType.ShippingLabels,
        name: 'Shipping Labels'
      },
      {
        id: this.styleUploadedType.TscPackingList,
        name: 'TSC Packing List'
      }
    ];
    Object.assign(modalRef.componentInstance.uploadOptions, {
      id: '',
      fileList: fileList.filter((i) => i),
      isReadOnly: this.isPageReadOnly || this.isStyleReadOnly
      || this.isStyleCancelled || this.isOrderArchived || this.isOrderCancelled
    });
    modalRef.result.then((res) => {
      if (res.status) {
        let isShowMsg = false;
        let currentFiles = frm.get('files').value
          .filter((i) => [
            this.styleUploadedType.ShippingLabels,
            this.styleUploadedType.TscPackingList
          ].indexOf(i.type) === -1) || [];
        if (res.newList && res.newList.length) {
          this._styleService.uploadFileToStyle(this.orderIndex.styleId,
            res.newList, res.applyToStyleIds)
            .subscribe((resp: ResponseMessage<UploadedFileModel[]>) => {
              if (resp.status) {
                if (currentTypeList.length) {
                  if (!isShowMsg) {
                    this._toastrService.success(`
                    Shipping Labels / TSC Packing List updated successfully.`, 'Success');
                    isShowMsg = true;
                  }
                } else {
                  this._toastrService.success(`
                  Shipping Labels / TSC Packing List uploaded successfully.`, 'Success');
                }

                if (res.duplicatedList && res.duplicatedList.length) {
                  res.duplicatedList.forEach((i) => {
                    if (currentTypeList.indexOf(i) > -1) {
                      currentTypeList.splice(currentTypeList.indexOf(i), 1);
                    }
                  });
                }
                resp.data.forEach((item) => {
                  currentTypeList.push(item);
                  frm.get('files').setValue([
                    ...currentFiles,
                    ...currentTypeList
                  ]);
                });
                this._changeDetectorRef.markForCheck();
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
        if (res.deletedList && res.deletedList.length) {
          this._styleService
            .deleteUploadedStyleFile(this.orderIndex.styleId, res.deletedList.map((i) => i.id))
            .subscribe((resp: BasicResponse) => {
              if (resp.status) {
                res.deletedList.forEach((item) => {
                  let indexItem = currentTypeList.findIndex((i) => i.id === item.id);
                  if (indexItem > -1) {
                    currentTypeList.splice(indexItem, 1);
                  }
                });
                frm.get('files').setValue([
                  ...currentFiles,
                  ...currentTypeList
                ]);

                if (currentTypeList.length === 0 && res.newList.length === 0) {
                  this._toastrService.success(`
                  Shipping Labels / TSC Packing List removed successfully.`, 'Success');
                } else {
                  if (!isShowMsg) {
                    this._toastrService.success(`
                    Shipping Labels / TSC Packing List updated successfully.`, 'Success');
                    isShowMsg = true;
                  }
                }
                this._changeDetectorRef.markForCheck();
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
        if (res.updateList && res.updateList.length) {
          this._styleService.updateStyleFiles(this.orderIndex.styleId, res.updateList)
            .subscribe((resp: BasicResponse) => {
              if (resp.status) {
                if (!isShowMsg) {
                  this._toastrService.success(`
                  Shipping Labels / TSC Packing List updated successfully.`, 'Success');
                  isShowMsg = true;
                }
                this._changeDetectorRef.markForCheck();
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
      }
    }, (err) => {
      // empty
    });
  }

  public openFactoryCIUploader(frm): void {
    const fileList = frm.get('files').value
      .filter((i) => [
        this.styleUploadedType.FactoryPackingList,
        this.styleUploadedType.CommercialInvoice
      ].indexOf(i.type) > -1);
    let currentTypeList = Object.assign([], fileList);
    let modalRef = this._modalService.open(UploaderTypeComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static',
      windowClass: 'super-lg'
    });
    modalRef.componentInstance.title = 'Factory Packing List / CI';
    modalRef.componentInstance.styleId = Number(this.orderIndex.styleId);
    modalRef.componentInstance.styleList = this.styleList.filter((s) =>
      s.id === Number(this.orderIndex.styleId)
      || s.type === OrderItemTypes.ItemTypes.OUTSOURCE
      || s.type === OrderItemTypes.ItemTypes.IMPORTS);
    modalRef.componentInstance.selectTypeData = [
      {
        id: this.styleUploadedType.FactoryPackingList,
        name: 'Factory Packing List'
      },
      {
        id: this.styleUploadedType.CommercialInvoice,
        name: 'Commercial Invoice'
      }
    ];
    Object.assign(modalRef.componentInstance.uploadOptions, {
      id: '',
      fileList: fileList.filter((i) => i),
      isReadOnly: this.isPageReadOnly || this.isStyleReadOnly
      || this.isStyleCancelled || this.isOrderArchived || this.isOrderCancelled
    });
    modalRef.result.then((res) => {
      if (res.status) {
        let isShowMsg = false;
        let currentFiles = frm.get('files').value
          .filter((i) => [
            this.styleUploadedType.FactoryPackingList,
            this.styleUploadedType.CommercialInvoice
          ].indexOf(i.type) === -1) || [];
        if (res.newList && res.newList.length) {
          this._styleService.uploadFileToStyle(this.orderIndex.styleId,
            res.newList, res.applyToStyleIds)
            .subscribe((resp: ResponseMessage<UploadedFileModel[]>) => {
              if (resp.status) {
                if (currentTypeList.length) {
                  if (!isShowMsg) {
                    this._toastrService.success(`
                    Factory Packing List / CI updated successfully.`, 'Success');
                    isShowMsg = true;
                  }
                } else {
                  this._toastrService.success(`
                  Factory Packing List / CI uploaded successfully.`, 'Success');
                }

                if (res.duplicatedList && res.duplicatedList.length) {
                  res.duplicatedList.forEach((i) => {
                    if (currentTypeList.indexOf(i) > -1) {
                      currentTypeList.splice(currentTypeList.indexOf(i), 1);
                    }
                  });
                }
                resp.data.forEach((item) => {
                  currentTypeList.push(item);
                  frm.get('files').setValue([
                    ...currentFiles,
                    ...currentTypeList
                  ]);
                });
                this._changeDetectorRef.markForCheck();
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
        if (res.deletedList && res.deletedList.length) {
          this._styleService
            .deleteUploadedStyleFile(this.orderIndex.styleId, res.deletedList.map((i) => i.id))
            .subscribe((resp: BasicResponse) => {
              if (resp.status) {
                res.deletedList.forEach((item) => {
                  let indexItem = currentTypeList.findIndex((i) => i.id === item.id);
                  if (indexItem > -1) {
                    currentTypeList.splice(indexItem, 1);
                  }
                });
                frm.get('files').setValue([
                  ...currentFiles,
                  ...currentTypeList
                ]);

                if (currentTypeList.length === 0 && res.newList.length === 0) {
                  this._toastrService.success(`
                  Factory Packing List / CI removed successfully.`, 'Success');
                } else {
                  if (!isShowMsg) {
                    this._toastrService.success(`
                    Factory Packing List / CI updated successfully.`, 'Success');
                    isShowMsg = true;
                  }
                }
                this._changeDetectorRef.markForCheck();
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
        if (res.updateList && res.updateList.length) {
          this._styleService.updateStyleFiles(this.orderIndex.styleId, res.updateList)
            .subscribe((resp: BasicResponse) => {
              if (resp.status) {
                if (!isShowMsg) {
                  this._toastrService.success(`
                  Factory Packing List / CI updated successfully.`, 'Success');
                  isShowMsg = true;
                }
                this._changeDetectorRef.markForCheck();
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
      }
    }, (err) => {
      // empty
    });
  }

  public checkLengthUploaderByType(frm: FormGroup, type?: number): boolean {
    if (!isNaN(type)) {
      return !!frm.get('files') &&
        !!frm.get('files').value &&
        frm.get('files').value.some((i) => i.type === type);
    }
    return !!frm.get('files') && !!frm.get('files').value && !!frm.get('files').value.length;
  }

  public checkLengthUploaderByTypeArr(frm: FormGroup, typeArr: number[]): boolean {
    return !!frm.get('files') &&
      !!frm.get('files').value &&
      frm.get('files').value.some((i) => typeArr.indexOf(i.type) > -1);
  }

  public calProductionQtys(cellName: string): number {
    let sizeRows = this.frm
      .get('sizeColumns').value;
    let productionQtys = Math.ceil(
      (sizeRows[0][cellName] + sizeRows[1][cellName] + sizeRows[2][cellName])
      * (1 + this.frm.get('overages').value / 100)) || 0;
    let productionRow = sizeRows[3];
    productionRow[cellName] = productionQtys;
    productionRow['totalQty'] = 0;
    this.sizeData.forEach((size) =>
      productionRow['totalQty'] += productionRow[size.name]);
    return productionQtys;
  }

  public calQty(row, cellName: string): number {
    const getQty = (index: number): number => {
      const sizes = this.frm.get('sizeColumns').value;
      if (sizes && sizes.length > index) {
        return sizes[index][cellName] || 0;
      } else {
        return 0;
      }
    };
    const setQty = (value, index: number) => {
      const sizesArr = this.frm.get('sizeColumns');
      let sizeRow = sizesArr.get(index.toString());
      if (sizesArr && sizesArr.value && sizesArr.value.length > index &&
        sizeRow && sizeRow.get(cellName)) {
        sizeRow.get(cellName).patchValue(value);
        sizeRow.value['totalQty'] = 0;
        this.sizeData.forEach((size) => sizeRow.value['totalQty'] += sizeRow.value[size.name]);
      }
    };
    let cal = 0;

    // if not isSMPL, topSizes = sum 4 childSize else hide topSizes
    if (this.blankSizes[row].sizeName === 'topSizes' && !this.isSMPL) {
      cal = getQty(2) + getQty(3) + getQty(4) + getQty(5);
    }
    // TSA-1067 4: if isSMPL, hide TOP Sample Qty(topSizes)
    // totalOrderSizes = saleOrderSizes + topSizes
    if (this.blankSizes[row].sizeName === 'totalOrderSizes') {
      cal = getQty(0) + (this.isSMPL ? 0 : getQty(1));
    }
    // overageSizes = (saleOrderSizes + topSizes) * overagesPercent
    if (this.blankSizes[row].sizeName === 'overageSizes') {
      cal = Math.ceil((getQty(0) + (this.isSMPL ? 0 : getQty(1)))
        * this.frm.get('overages').value / 100);
    }
    // purchaseSizes = totalOrderSizes + overageSizes - whsBlankSizes - whsPrintedSizes
    if (this.blankSizes[row].sizeName === 'purchaseSizes') {
      cal = getQty(6) + getQty(7) - getQty(8) - getQty(9);
    }
    // totalProductionSizes = totalOrderSizes + overageSizes - whsPrintedSizes
    if (this.blankSizes[row].sizeName === 'totalProductionSizes') {
      cal = getQty(6) + getQty(7) - getQty(9);
    }
    // totalFinishedSizes = totalOrderSizes + overageSizes
    if (this.blankSizes[row].sizeName === 'totalFinishedSizes') {
      cal = getQty(6) + getQty(7);
    }
    setQty(cal, row);
    return cal;
  }

  public deleteBlank(i: number) {
    this.blanks.removeAt(i);
    // this.updateVendorRequired();
  }

  public updateVendorRequired() {
    this.blanks.controls.forEach((blank, index) => {
      blank.get('formRequires').value['vendorName'].required = true;
      blank.get('vendorName').setValidators([Validators.required]);
      if (this.blanks.length - 1 === index) {
        blank.get('formRequires').value['vendorName'].required = false;
        blank.get('vendorName').setValidators(null);
      }
      blank.get('vendorName').updateValueAndValidity();
    });
  }

  public resetQtys() {
    // Create sizes data table
    let sizesArray = [];
    this.blankSizes.forEach((item, i) => {
      let sizesRow = {totalQty: 0};
      this.sizeData.forEach((size) => sizesRow[size.name] = 0);
      // if isA2000Order, not reset Sales Order Qty
      if (this.isA2000Order && i === 0 && this.frm.get('sizeColumns').value[0]) {
        sizesRow = this.frm.get('sizeColumns').value[0];
      }
      sizesArray.push(sizesRow);
    });
    this.frm.setControl('sizeColumns',
      this._fb.array(sizesArray.map((size) => this._fb.group(size))));
  }

  // public changeDetect(value) {
  //   this.tagInputDropdown.items = this.tagInputDropdown.autocompleteItems.filter((item) => {
  //     let hasValue = this.tagInputDropdown.tagInput.tags.some((tag) => {
  //       let identifyBy = this.tagInputDropdown.tagInput.identifyBy;
  //       let model = typeof tag.model === 'string' ? tag.model : tag.model[identifyBy];
  //       return model === item[this.tagInputDropdown.identifyBy];
  //     });
  //     return this.tagInputDropdown.matchingFn(value, item) && hasValue === false;
  //   });
  // }

  /**
   * Upload image
   */
  public uploadImage() {
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
        this.frm.patchValue({
          imageUrl: res.data.relativeUrl,
          absoluteUrl: res.data.absoluteUrl
        });
        this.frm.get('imageUrl')
          .markAsDirty();
        this.frm.get('imageUrl')
          .markAsTouched();
        // Clear uploaded item in uploader
        this.uploader.clearQueue();
        this._changeDetectorRef.markForCheck();
      } else {
        this.uploader.clearQueue();
        let inputFile = document.getElementById('styleInputFile') as HTMLInputElement;
        if (inputFile) {
          inputFile.value = '';
        }
        this._toastrService.error(res.errorMessages, 'Error');
      }
    };
  }

  public selectSizes() {
    let modalRef = this._modalService.open(AddSizesComponent, {
      size: 'lg',
      keyboard: true
    });
    modalRef.componentInstance.selectedSizes = this.frm.get('sizeSelected').value;
    modalRef.componentInstance.sizeSelections = this.sizeData;
    modalRef.result.then((res) => {
      if (res.status) {
        this.frm.get('sizeSelected').setValue(res.selectingSizes);
        if (res.removedSizes && res.removedSizes.length) {
          res.removedSizes.forEach((s) => {
            this.removeSize(s);
          });
        }
        this.sizeTableScrollBar();
        this.frm.get('sizeSelected').markAsDirty();
        this.frm.get('sizeSelected').markAsTouched();
        this.frm.get('sizeSelected').updateValueAndValidity();
        this._changeDetectorRef.markForCheck();
      }
    }, (err) => {
      // empty
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
      case OrderItemTypes.ItemTypes.DOMESTIC:
        itemType = 'Domestic';
        break;
      case OrderItemTypes.ItemTypes.OUTSOURCE:
        itemType = 'Outsource';
        break;
      case OrderItemTypes.ItemTypes.IMPORTS:
        itemType = 'Imports';
        break;
      default:
        itemType = 'None';
        break;
    }
    return `${leftLabel}${leftLabel && rightLabel ? ' / ' : ''}${rightLabel} (${itemType})`;
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
  }

  /*-----------Drag & Drop Image Event-----------*/
  @HostListener('document:drop', ['$event'])
  public drop(ev) {
    // do something meaningful with it
    let items = ev.dataTransfer.items;

    if (this.isPageReadOnly || this.isStyleReadOnly) {
      return;
    }
    /*
     *  Loop through items.
     */
    for (let item of items) {
      // Get the dropped item as a 'webkit entry'.
      let entry = item.webkitGetAsEntry();

      if (entry && entry.isDirectory) {
        /*
         *  getAsFile() returns a File object that contains
         *  some useful informations on the file/folder that has
         *  been dropped.
         *
         *  You get the following properties :
         *    - lastModified (timestamp)
         *    - lastModifiedDate
         *    - name (...of the file)
         *    - path (fullpath)
         *    - size
         *    - type
         *    - etc. (...some other properties and methods)
         *
         *  So you can do the following to retrieve the path of the
         *  dropped folder.
         */
      }
    }
    this.uploader.addToQueue(ev.dataTransfer.files);
    ev.path.map((item) => {
      if (item.className && item.className.includes('upload-box style-upload-box')) {
        let index: number = Number(item.classList[item.classList.length - 1]);
        this.uploadImage();
      }
    });
    ev.preventDefault();
    return false;
  }

  @HostListener('document:dragenter', ['$event'])
  public dragenter(ev: KeyboardEvent) {
    ev.preventDefault();
    return false;
  }

  @HostListener('document:dragover', ['$event'])
  public dragover(ev: KeyboardEvent) {
    ev.preventDefault();
    return false;
  }

  public checkPreFormIsValid(): boolean {
    if (this.frm.get('isBlankNotApplicable').value) {
      return true;
    }
    this.blanks.controls.forEach((blank: FormGroup, index) => {
      this._commonService.markAsDirtyForm(blank);
    });
    return this.blanks.valid;
  }

  public onSaved(frm: FormGroup, willAddNew?: boolean): void {
    let isValid = true;
    Object.keys(frm.controls).forEach((key) => {
      if (key !== 'blanks' && frm.get(key).enabled) {
        isValid = isValid && frm.get(key).valid;
      }
    });
    if (!isValid || !this.checkPreFormIsValid()) {
      this._commonService.markAsDirtyForm(frm);
      this._changeDetectorRef.markForCheck();
      return;
    }
    if (this.sizeCells && this.sizeCells.length &&
      this.sizeCells.some((sCell) =>
        sCell.nativeElement && sCell.nativeElement.className === 'red')) {
      if (this.tableWrapper) {
        this.tableWrapper.nativeElement.scrollIntoView();
      }
      return;
    }
    frm.get('sizeColumns').value.forEach((size, index) => {
      let sizes = [];
      frm.get('sizeSelected').value.forEach((s) => {
        sizes.push({
          name: s.name,
          qty: 0
        });
      });
      sizes.forEach((s) => s.qty = size[s.name]);
      if (frm.get(this.blankSizes[index].sizeName)) {
        frm.get(this.blankSizes[index].sizeName).setValue(Object.assign([], sizes));
      }
    });
    let mainFormDate = [
      'cutTicketApprovedOnUtc',
      'exFactoryDateOnUtc',
      'arrival3PlDateOnUtc',
      // 'readyToShipDateOnUtc',
      'readyToShipStartDateOnUtc',
      'readyToShipEndDateOnUtc',
      'etaTscDateOnUtc'
      // 'techPackReadyDateOnUtc'
    ];
    this.myDatePickerService.addTimeToDateArray(this.frm, mainFormDate);
    this.blanks.controls.forEach((blank: FormGroup) => {
      let listDate = [
        'estDeliveryDateFromOnUtc',
        'estDeliveryDateToOnUtc',
        'receivedDateFromOnUtc',
        'receivedDateToOnUtc'
      ];
      this.myDatePickerService.addTimeToDateArray(blank, listDate);
    });
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
    this.blanks.controls.forEach((blank) => {
      if (blank.get('styleList').value && blank.get('styleList').value.length) {
        let idsArr = [];
        blank.get('styleList').value.forEach((style) => {
          if (style.isSelected) {
            idsArr.push(style.styleId);
          }
        });
        blank.get('applyToStyles').patchValue(idsArr.join());
      }
    });
    if (!this.frm.get('shipMethod').value) {
      this.frm.get('shipMethod').patchValue(0);
    }
    if (!frm.get('id').value) {
      this._styleService
        .addStyleDetail(frm.value)
        .subscribe((resp: ResponseMessage<StyleDetail>) => {
          if (resp.status) {
            this._toastrService.success(resp.message, 'Success');
            // revalidate before publish
            if (this._salesOrderService.hasErBeforePublish) {
              this._salesOrderService.reValidate(this.orderIndex.orderId);
            }
            if (willAddNew) {
              this.backupInheritData(resp.data);
              this.buildForm();
              this.getBlankInfoData();
              this._router.navigate([
                'order-log-v2',
                this.orderIndex.orderId,
                'styles',
                'add-a-style',
                'style',
                true
              ]);
            } else {
              // ------------------------------------------------------------
              this._salesOrderService.orderIndex.styleId = resp.data.id;
              this._router.navigate([
                'order-log-v2',
                this.orderIndex.orderId,
                'styles',
                resp.data.id
              ]);
            }

            this._salesOrderService.setUpdateStyleNum(true);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    } else {
      this._styleService
        .updateStyleDetail(frm.get('id').value, frm.value)
        .subscribe((resp: ResponseMessage<StyleDetail>) => {
          if (resp.status) {
            this._toastrService.success(resp.message, 'Success');
            // revalidate before publish
            if (this._salesOrderService.hasErBeforePublish) {
              this._salesOrderService.reValidate(this.orderIndex.orderId);
            }
            if (willAddNew) {
              this.backupInheritData(resp.data);
              this._router.navigate([
                'order-log-v2',
                this.orderIndex.orderId,
                'styles',
                'add-a-style',
                'style',
                true
              ]);
            } else {
              // ------------------------------------------------------------
              this._salesOrderService.orderIndex.styleId = resp.data.id;
              this._salesOrderService.orderIndex.partnerStyleName = resp.data.partnerStyleName;
              this.getCommonData();
              this.blanksInfo.files = frm.get('files').value;
            }
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          this._changeDetectorRef.markForCheck();
        });
    }
  }

  @HostListener('window:resize', ['$event'])
  public onAppScroll(event: any) {
    this.onScrollFunc(event);
  }

  public ngOnDestroy(): void {
    this.subRouter.unsubscribe();
    this._subOrderStatus.unsubscribe();
    this._subOrderData.unsubscribe();
    this._appScrollEv.unsubscribe();
  }
}
