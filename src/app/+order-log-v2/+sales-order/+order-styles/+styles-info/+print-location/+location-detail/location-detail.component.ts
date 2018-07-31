import {
  Component,
  OnInit,
  ViewEncapsulation,
  OnDestroy,
  HostListener,
  ViewChild,
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  Router,
  ActivatedRoute
} from '@angular/router';

import {
  HttpParams
} from '@angular/common/http';

import {
  Location,
  PopStateEvent
} from '@angular/common';
import * as _ from 'lodash';

// Services
import {
  SalesOrderService
} from '../../../../sales-order.service';
import {
  PrintLocationService
} from '../print-location.service';
import {
  LocationDetailService
} from './location-detail.service';
import {
  ToastrService
} from 'ngx-toastr';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  ValidationService,
  ExtraValidators
} from '../../../../../../shared/services/validation';
import {
  CommonService
} from '../../../../../../shared/services/common';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import * as NProgress from 'nprogress';
import {
  Util
} from '../../../../../../shared/services/util';
import * as FileSaver from 'file-saver';
import {
  MyDatePickerService
} from '../../../../../../shared/services/my-date-picker';
import { AuthService } from '../../../../../../shared/services/auth';
import { StylesInfoService } from '../../styles-info.service';
import {
  DragulaService
} from 'ng2-dragula/ng2-dragula';

// Components
import {
  UploadComponent
} from '../modules';

// Interfaces
import {
  ResponseMessage,
  BasicCsrInfo,
  BasicGeneralInfo,
  UploadedImage
} from '../../../../../../shared/models';
import {
  PrintLocationInfo,
  PmsType,
  Film
} from './location-detail.model';
import {
  FileItem,
  FileUploader
} from 'ng2-file-upload';
import {
  UserContext
} from '../../../../../../shared/services/user-context';
import { Subscription } from 'rxjs/Subscription';
import {
  DatatableComponent
} from '@swimlane/ngx-datatable';
import {
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  UploadedType
} from '../../../../sales-order.model';
import { AppConstant } from '../../../../../../app.constant';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'location-detail',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'location-detail.template.html',
  styleUrls: [
    'location-detail.style.scss'
  ]
})
export class LocationDetailComponent implements OnInit,
                                                AfterViewChecked,
                                                AfterViewInit,
                                                OnDestroy {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild('colorTable')
  public colorTable: DatatableComponent;
  @ViewChild('colorTablePost')
  public colorTablePost: DatatableComponent;
  public currentComponentWidth;

  public frm: FormGroup;
  public formErrors = {
    designId: '',
    locationName: '',
    printMethodName: '',
    approvalTypeNames: '',
    // treatmentName: '',
    printMachineNames: '',
    placement: '',
    width: '',
    height: '',
    imageUrl: '',
    // isReRun: '',
    artReceivedDateOnUtc: '',
    artApprovedDateOnUtc: '',
    scheduleDateOnUtc: ''
  };
  public validationMessages = {
    designId: {required: 'Design Id is required.'},
    locationName: {required: 'Location is required.'},
    approvalTypeNames: {required: 'Approval Type is required.'},
    // treatmentName: {required: 'Treatment is required.'},
    printMethodName: {required: 'Service is required.'},
    printMachineNames: {required: 'Machine is required.'},
    placement: {required: 'Reference Point is required.'},
    width: {required: 'Width is required.'},
    height: {required: 'Height is required.'},
    imageUrl: {required: 'Image is required.'},
    artReceivedDateOnUtc: {
      required: 'Art Received is required.',
      pattern: 'Art Received is not valid.'
    },
    artApprovedDateOnUtc: {
      required: 'Art Approved is required.',
      pattern: 'Art Approved is not valid.'
    },
    artReleasedDateOnUtc: {
      required: 'Art Released is required.',
      pattern: 'Art Released is not valid.'
    },
    approvedToSampleDateOnUtc: {
      required: 'Art Released is required.',
      pattern: 'Art Released is not valid.'
    },
    scheduleDateOnUtc: {
      required: 'Schedule Date is required.',
      pattern: 'Schedule Date is not valid.'
    },
    samplePrinterId: {
      required: 'Sample Printer is required.'
    },
    separatorId: {
      required: 'Separator is required.'
    },
    separationDateOnUtc: {
      required: 'Separation Date is required.',
      pattern: 'Separation Date is not valid.'
    },
    productionDateOnUtc: {
      required: 'Production Date is required.',
      pattern: 'Production Date is not valid.'
    }
  };

  public orderIndex = {
    orderId: 0,
    styleId: 0
  };

  public printLocationInfo: any;
  public designDataOrigin: BasicGeneralInfo[];
  public locationDataOrigin: BasicGeneralInfo[];
  public serviceDataOrigin: BasicGeneralInfo[];
  public machineDataOrigin: BasicGeneralInfo[];
  // public approvalProcessDataOrigin: BasicGeneralInfo[];
  // public treatmentDataOrigin: BasicGeneralInfo[];
  public colorsDataOrigin: BasicGeneralInfo[];
  public separatorData: BasicCsrInfo[];
  public samplePrinterDataOrigin: any[];

  // ngSelect data for each form
  public designData = [];
  public locationData = [];
  public serviceData = [];
  public machineData = [];
  public approvalProcessData = [];
  // public treatmentData = [];

  // lookup table list
  public lookupTableList = [
    'designData',
    'locationData',
    'serviceData',
    'machineData',
    'approvalProcessData'
    // 'treatmentData'
  ];

  public uploader: FileUploader;

  public locationList = [
    {
      text: '1',
      checked: false,
      isActive: false
    },
    {
      text: '2',
      checked: false,
      isActive: false
    }
  ];
  public editing = [];
  public colorsData = [];
  public colorsData2 = [];

  public subscription: Subscription;
  public locationSub: any;
  public locationId;

  public fileViewReceived = [];
  public fileViewApproved = [];
  public techSheetFiles = [];

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
  public myDatePickerTopOptions: IMyDpOptions = {
    ...this.myDatePickerOptions,
    openSelectorTopOfInput: true
  };

  public uploadFileType = UploadedType;

  public colorsTab = [];
  public preLocationDetailData;

  public isShowStickyBtn = false;
  public subDragService: Subscription;
  public subDragendService: Subscription;
  public dragOptions: any;
  public oldIndex: any;
  public newIndex: any;

  public pmsType = PmsType;
  public isPageReadOnly = false;
  public isStyleReadOnly = false;
  public isNonAdminArtManagerArtist = false;
  public isOrderArchived = false;
  public isOrderCancelled = false;
  public isStyleCancelled = false;
  public isPrintApproved = false;

  private _isEsc = false;
  private _isGetCommonCall = false;
  private _subOrderStatus: Subscription;
  private _subOrderData: Subscription;
  private _subStyleStatus: Subscription;

  constructor(private _fb: FormBuilder,
              private _activatedRoute: ActivatedRoute,
              private _toastrService: ToastrService,
              private _dragulaService: DragulaService,
              private _localStorageService: LocalStorageService,
              private _salesOrderService: SalesOrderService,
              private _stylesInfoService: StylesInfoService,
              private _printLocationService: PrintLocationService,
              private _locationDetailService: LocationDetailService,
              private _commonService: CommonService,
              private _validationService: ValidationService,
              private _userContext: UserContext,
              private _authService: AuthService,
              private _router: Router,
              private _utilService: Util,
              private _modalService: NgbModal,
              private _location: Location,
              private _changeDetectorRef: ChangeDetectorRef,
              public myDatePickerService: MyDatePickerService) {
    // this.activatedRouteSub = this._activatedRoute.params
    //   .subscribe((ev) => {
    //     this.ngOnInit();
    //   });
    this.dragulaConfig();
    this.subscription = _printLocationService.getRefreshLocation().subscribe(
      (from: string) => {
        if (from === 'print-location') {
          this.ngOnInit();
        }
      });
    this.locationSub = this._location.subscribe((url) => this.backEvent(url));
  }

  public ngOnInit(): void {
    this.buildForm();
    this.preLocationDetailData = _.cloneDeep(this.frm.getRawValue());
    this.colorsTab = [
      {
        id: 1,
        name: 'Approved',
        isView: false,
        isActive: false
      },
      {
        id: 2,
        name: 'Pre',
        isView: true,
        isActive: true
      }
    ];
    this._subOrderStatus = this._salesOrderService.getUpdateStatusOrder().subscribe((status) => {
      this.isPageReadOnly = status;
      this._changeDetectorRef.markForCheck();
    });
    this._subOrderData = this._salesOrderService.getUpdateOrder().subscribe((orderData) => {
      this.isOrderArchived = orderData.isArchived;
      this.isOrderCancelled = orderData.isCancelled;
      this._changeDetectorRef.markForCheck();
    });
    this._subStyleStatus = this._stylesInfoService.getUpdateStyle().subscribe((styleData) => {
      this.isStyleCancelled = styleData.isCancelled;
      this._changeDetectorRef.markForCheck();
    });
    if (!this._userContext.currentUser.listRole.some((i) =>
      [
        'Administrator',
        'Art Manager',
        'Artists'
      ].indexOf(i.roleName) > -1)) {
      this.isNonAdminArtManagerArtist = true;
    }
    this.orderIndex = this._salesOrderService.orderIndex;
    this.uploader = new FileUploader({
      url: `${AppConstant.domain}/api/v1/common/images/styles`,
      authToken: 'Bearer ' + this._userContext.userToken.accessToken
    });
    this.locationId = this._printLocationService.printLocation
      .dataLocationList[this._printLocationService.printLocation.curLocation];
    this.getCommonData();
    this.resetTable();
    if (this.locationId) {
      this.getPrintLocationInfoData();
      this.refreshFileView();
    } else {
      this.preLocationDetailData = _.cloneDeep(this.frm.getRawValue());
    }
  }

  public dragulaConfig() {
    this.subDragService = this._dragulaService.drag.subscribe((value) => {
      let dragEl = value[1];
      let list = Array.prototype.filter.call(value[2].childNodes, (node) => {
        return node.tagName === 'TR';
      });
      this.oldIndex = list.findIndex((node) => {
        return node === dragEl;
      });
      this._changeDetectorRef.markForCheck();
    });
    this.subDragendService = this._dragulaService.dragend.subscribe((value) => {
      let dragEl = value[1];
      let list = Array.prototype.filter.call(value[1].parentNode.childNodes, (node) => {
        return node.tagName === 'TR';
      });
      this.newIndex = list.findIndex((node) => {
        return node === dragEl;
      });
      if (this.newIndex >= 0 && this.oldIndex >= 0 && this.newIndex !== this.oldIndex
        && this.frm.get('prePmsColors').value) {
        let newArr = this.frm.get('prePmsColors').value;
        newArr.splice(this.newIndex, 0, newArr.splice(this.oldIndex, 1)[0]);
        this.frm.get('prePmsColors').patchValue(newArr);
      }
      this.oldIndex = undefined;
      this.newIndex = undefined;
      this._changeDetectorRef.markForCheck();
    });
    this.dragOptions = {
      moves: (el, container, handle) => {
        return handle.className === 'seq-handle';
      }
    };
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      // handle sticky btn when scroll
      if (this._utilService.scrollElm) {
        if (this._utilService.scrollElm
            .scrollHeight - window.innerHeight > 150) {
          this.isShowStickyBtn = true;
          this._changeDetectorRef.markForCheck();
        }
      }
    }, 1000);
  }

  public ngAfterViewChecked() {
    // Check if the table size has changed
    // if (this.tableWrappertableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
    //   this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
    //   for (let i = 0; i < 10; i++) {
    //     setTimeout(() => {
    //       this.colorTable.recalculate();
    //       this.colorTablePost.recalculate();
    //     }, 200);
    //   }
    //   let bodyRowElement = document.getElementsByClassName('datatable-body-row');
    //   let centerRowElement = document.getElementsByClassName('datatable-row-center');
    //   let widthCol = Number.parseFloat(
    //     window.getComputedStyle(bodyRowElement[0], null).getPropertyValue('width')
    //   );
    //   let headerCol = Number.parseFloat(
    //     window.getComputedStyle(centerRowElement[0], null).getPropertyValue('width')
    //   );
    //   if (widthCol !== this.tableWrapper.nativeElement.clientWidth ||
    //     headerCol !== this.tableWrapper.nativeElement.clientWidth) {
    //     for (let i = 0; i < bodyRowElement.length; i++) {
    //       bodyRowElement[i]
    // .setAttribute('style', 'width: ' + this.tableWrapper.nativeElement.clientWidth + 'px');
    //       centerRowElement[i + 1]
    // .setAttribute('style', 'width: ' + this.tableWrapper.nativeElement.clientWidth + 'px');
    //     }
    //     centerRowElement[0]
    //       .setAttribute('style', 'width: ' + this.tableWrapper.nativeElement.clientWidth + 'px');
    //   }
    // }
  }

  public getPrintLocationInfoData(): void {
    this._locationDetailService.getPrintLocationById(this.locationId, this.orderIndex.styleId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.printLocationInfo = {
            ...resp.data,
            approvedPmsColors: this.getApprovedTabData(resp.data),
            prePmsColors: this.getPreTabData(resp.data)
          };
          if (this.printLocationInfo.artApprovedDateOnUtc) {
            this.isPrintApproved = true;
          } else {
            this.isPrintApproved = false;
          }
          this.updateForm(this.printLocationInfo);
          if (!this.getPreTabData(this.printLocationInfo).length
            && !this.isPageReadOnly && !this.isStyleReadOnly) {
            this.addFilm(this.pmsType.Pre);
          }
          this.preLocationDetailData = _.cloneDeep(this.frm.getRawValue());
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    if (this._isGetCommonCall) {
      return;
    }
    this._commonService.getDesignList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.designDataOrigin = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
    this._commonService.getLocationList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.locationDataOrigin =
            resp.data.filter((loc) => loc.description ===
              this._printLocationService.printLocation.curLocation);
          if (this.locationDataOrigin[0]) {
            this.frm.patchValue(
              {
                locationId: this.locationDataOrigin[0].id,
                locationName: this.locationDataOrigin[0].name
              });
          }
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
    this._commonService.getEmbellishmentTypes()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.serviceDataOrigin = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
    // this._commonService.getApprovalTypeList()
    //   .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
    //     if (resp.status) {
    //       this.approvalProcessDataOrigin = resp.data;
    //     } else {
    //       this._toastrService.error(resp.errorMessages, 'Error');
    //     }
    //     this._changeDetectorRef.markForCheck();
    //   });
    this._commonService.getPrintMachineList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.machineDataOrigin = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
    this._commonService.getSamplesPrinter()
      .subscribe((resp: ResponseMessage<any[]>) => {
        if (resp.status) {
          resp.data.forEach((i) => {
            i.fakeId = [i.id, i.id = i.fakeId][0];
          });
          this.samplePrinterDataOrigin = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
    this._commonService.getPmsColor()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.colorsDataOrigin = resp.data.filter((c) => !c['isAddedNew']);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
    this._commonService.getSeparator()
      .subscribe((resp: ResponseMessage<BasicCsrInfo[]>) => {
        if (resp.status) {
          this.separatorData = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
    // this.getCommonDataHasNewValue();
    this._isGetCommonCall = true;
  }

  public getCommonDataHasNewValue() {
    // this._commonService.getTreatmentList()
    //   .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
    //     if (resp.status) {
    //       this.treatmentDataOrigin = resp.data;
    //     } else {
    //       this._toastrService.error(resp.errorMessages, 'Error');
    //     }
    //     this._changeDetectorRef.markForCheck();
    //   });
  }

  public buildForm(): void {
    let controlConfig = {
      id: new FormControl(''),
      styleId: new FormControl(''),
      // designId: new FormControl(''),
      locationId: new FormControl(null),
      locationName: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'locationName'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      printMethodId: new FormControl(null),
      printMethodName: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'printMethodName'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      approvalTypeId: new FormControl(null),
      approvalTypeNames: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'approvalTypeNames'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      // treatmentId: new FormControl(''),
      // treatmentName: new FormControl('', [
      //   Validators.compose([
      //     ExtraValidators.conditional(
      //       (group) => this.getSpecialRequireCase(group, 'treatmentName'),
      //       Validators.compose([
      //         Validators.required
      //       ])
      //     )
      //   ])
      // ]),
      printMachineNames: new FormControl([]),
      placement: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'placement'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      width: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'width'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      height: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'height'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      artReceivedDate: new FormControl(null),
      artReceivedDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      artApprovedDate: new FormControl(null),
      artApprovedDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      artReleasedDate: new FormControl(null),
      artReleasedDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      scheduleDate: new FormControl(null),
      scheduleDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'scheduleDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      sampleDate: new FormControl(null),
      sampleDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'sampleDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      approvedToSampleDate: new FormControl(null),
      approvedToSampleDateOnUtc: new FormControl('', [
        Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
          '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
      ]),
      samplePrinterId: new FormControl(null),
      separatorId: new FormControl(null),
      separationDate: new FormControl(null),
      separationDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      productionDate: new FormControl(null),
      productionDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      samplePrinterType: new FormControl(null),
      comments: new FormControl(''),
      imageUrl: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'imageUrl'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      absoluteUrl: new FormControl(''),
      pmsColors: new FormControl([]),
      approvedPmsColors: new FormControl([]),
      prePmsColors: new FormControl([]),
      isTscFactory: new FormControl(false),
      // isReRun: new FormControl(false),
      formRequires: new FormControl({
        // designId: {required: false},
        locationName: {required: false},
        approvalTypeNames: {required: false},
        // treatmentName: {required: false},
        printMethodName: {required: false},
        printMachineNames: {required: false},
        placement: {required: false},
        width: {required: false},
        height: {required: false},
        imageUrl: {required: false},
        // isReRun: {required: false},
        artReceivedDateOnUtc: {required: false},
        artApprovedDateOnUtc: {required: false},
        artReleasedDateOnUtc: {required: false},
        scheduleDateOnUtc: {required: false},
        sampleDateOnUtc: {required: false},
        approvedToSampleDateOnUtc: {required: false},
        samplePrinterId: {required: false},
        separatorId: {required: false},
        separationDateOnUtc: {required: false},
        productionDateOnUtc: {required: false}
      })
    };

    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);

    this.onValueChanged(); // (re)set validation messages now
    this.backupData();
  }

  public onValueChanged(data?: PrintLocationInfo): void {
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

  public setDateValue(): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (this.frm.get(importName).value) {
        let dateRegex = /^\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})$/;
        if (dateRegex.test(this.frm.get(importName).value)) {
          const newDateTime = new Date(this.frm.get(importName).value);
          this.frm.get(importName).patchValue(newDateTime);
          // ------
          const currentDate = new Date(this.frm.get(importName).value);
          this.frm.get(exportName).setValue({
            date: {
              year: currentDate.getFullYear(),
              month: currentDate.getMonth() + 1,
              day: currentDate.getDate()
            }
          });
        } else {
          const listNotUpdateTime = [
            ''
          ];
          const utcDate = new Date(this.frm.get(importName).value);
          let currentDate;
          if (listNotUpdateTime.indexOf(importName) > -1) {
            currentDate = new Date(this.frm.get(importName).value);
          } else {
            currentDate = new Date(Date.UTC(utcDate.getFullYear(),
              utcDate.getMonth(), utcDate.getDate(), utcDate.getHours(), utcDate.getMinutes()));
          }
          this.frm.get(exportName).setValue({
            date: {
              year: currentDate.getFullYear(),
              month: currentDate.getMonth() + 1,
              day: currentDate.getDate()
            }
          });
        }
      } else {
        this.frm.get(importName).patchValue(null);
        this.frm.get(exportName).patchValue(null);
      }
    };
    patchDateFunc('artReceivedDateOnUtc', 'artReceivedDate');
    patchDateFunc('artApprovedDateOnUtc', 'artApprovedDate');
    patchDateFunc('artReleasedDateOnUtc', 'artReleasedDate');
    patchDateFunc('scheduleDateOnUtc', 'scheduleDate');
    patchDateFunc('sampleDateOnUtc', 'sampleDate');
    patchDateFunc('separationDateOnUtc', 'separationDate');
    patchDateFunc('productionDateOnUtc', 'productionDate');
    patchDateFunc('approvedToSampleDateOnUtc', 'approvedToSampleDate');
  }

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    // let firstCaseList = [
    //   'designId',
    //   'locationName',
    //   'printMethodName',
    //   'approvalTypeNames',
    //   'treatmentName'
    // ];
    // let secondCaseList = [
    //   'printMachineNames',
    //   'placement',
    //   'width',
    //   'height',
    //   'imageUrl'
    // ];

    // let getStatus = (caseList: string[]): boolean => {
    //   let status = false;
    //   caseList.forEach((cas) => status = status || !!frm.get(cas).value);
    //   caseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
    //   return status;
    // };

    // if (firstCaseList.findIndex((cas) => cas === key) > -1) {
    //   return getStatus(firstCaseList);
    // }
    // if (secondCaseList.findIndex((cas) => cas === key) > -1) {
    //   return getStatus(secondCaseList);
    // }
    return false;
  }

  public getFileRequireCase(frm: FormGroup, key: string): boolean {
    if (key === 'artReceivedDateOnUtc') {
      frm.get('formRequires').value['artReceivedDateOnUtc'].required =
        !!this.fileViewReceived.length;
      return !!this.fileViewReceived.length;
    } else if (key === 'artApprovedDateOnUtc') {
      frm.get('formRequires').value['artApprovedDateOnUtc'].required =
        !!this.fileViewApproved.length;
      return !!this.fileViewApproved.length;
    } else {
      return false;
    }
  }

  public onSelectItem(val, frm, valProp: string, formControlName: string): void {
    if (val[valProp] || val[valProp] === 0) {
      frm.get(formControlName).patchValue(val[valProp]);
    } else {
      // add new
      frm.get(formControlName).patchValue(val);
    }
  }

  /**
   * Bind UTC date to form
   * @param event
   * @param prop
   */
  public onDateChangedBy(event: IMyDateModel, prop: string): void {
    let utcDate = Object.assign({}, event);
    this.frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');

    // Update status for form control whose value changed
    this.frm.get(prop).markAsDirty();
  }

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
        let inputFile;
        if (document.getElementById('locationInputFile1')) {
          inputFile = document.getElementById('locationInputFile1') as HTMLInputElement;
        } else {
          inputFile = document.getElementById('locationInputFile2') as HTMLInputElement;
        }
        if (inputFile) {
          inputFile.value = '';
        }
        this._changeDetectorRef.markForCheck();
        this._toastrService.error(res.errorMessages, 'Error');
      }
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
  }

  /*-----------Drag & Drop Image Event-----------*/
  @HostListener('document:drop', ['$event'])
  public drop(ev) {
    // do something meaningful with it
    let items = ev.dataTransfer.items;

    if (this.isPageReadOnly || this.isStyleReadOnly
      || this.isStyleCancelled || this.isOrderArchived
      || this.isOrderCancelled || this.isNonAdminArtManagerArtist) {
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
      if (item.className && item.className.includes('upload-box')) {
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

  /**
   * Update form value
   * @param data
   */
  public updateForm(data: PrintLocationInfo): void {
    this.frm.patchValue(data);
    const approvedPmsData = this.frm.get('pmsColors').value ? this.frm.get('pmsColors').value
      .filter((i) => i.printType === this.pmsType.Approved) : [];
    const approvedTab = this.colorsTab.find((i) => i.name === 'Approved');
    if (approvedTab) {
      approvedTab.isView = approvedPmsData && approvedPmsData.length;
    }
    this.setDateValue();
    this.getCommonData();
    this._changeDetectorRef.markForCheck();
  }

  public backupData(): void {
    let data = Object.assign({}, this.frm.value);
    this._localStorageService.set('backupData', data);
  }

  public revertData(i: number): void {
    // let tFrm = this._localStorageService.get('backupData')['printLocationDetails'];
    // this.printLocationDetails.get((i).toString())
    //   .patchValue(tFrm[i]);
    this.backupData();
  }

  public onCancel(): void {
    let previousRoute: string = this._utilService.previousRouteUrl;
    if (previousRoute) {
      let matches = previousRoute.match(/\d+$/);
      if (matches) {
        this._router.navigate(['order-log-v2', this.orderIndex.orderId, 'styles']);
      } else {
        this._router.navigate([previousRoute]);
      }
    } else {
      this._router.navigate(['order-log-v2', this.orderIndex.orderId]);
    }
  }

  public setNgSelectData(ngSelectData: string,
                         formIndex: number,
                         formData: PrintLocationInfo) {
    let origin = ngSelectData + 'Origin';
    let ngSelectId = ngSelectData.replace('Data', 'Id');
    let ngSelectName = ngSelectData.replace('Data', 'Name');
    this[ngSelectData][formIndex] = [...this[origin]];
    if (this[origin].findIndex((item) => item.id === formData[ngSelectId]) === -1) {
      this[ngSelectData][formIndex].push(
        {
          id: formData[ngSelectId],
          description: '',
          name: formData[ngSelectName]
        }
      );
    }
  }

  /**
   * @param event
   * @param cell
   * @param row
   */
  public onDoubleClicked(event: Event, cell, row) {
    if (this.isPageReadOnly || this.isStyleReadOnly
      || this.isStyleCancelled || this.isOrderArchived
      || this.isOrderCancelled || this.isNonAdminArtManagerArtist) {
      return;
    }
    this.editing[`${row.$$index}-${cell}`] = true;
  }

  public showInput(event): void {
    if (!this.isPageReadOnly || this.isStyleReadOnly
      || this.isStyleCancelled || this.isOrderArchived
      || this.isOrderCancelled || this.isNonAdminArtManagerArtist) {
      let inputE = event.getElementsByTagName('input');
      let valueE = event.getElementsByTagName('span');

      if (inputE.length) {
        if (inputE[0].hidden) {
          valueE[0].hidden = true;
          inputE[0].hidden = false;
          inputE[0].focus();
          inputE[0].select();
        }
      }
    }
  }

  public hiddenInput(event): void {
    let inputE = event.getElementsByTagName('input');
    let valueE = event.getElementsByTagName('span');

    if (inputE.length) {
      this._isEsc = true;
      inputE[0].hidden = true;
      valueE[0].hidden = false;
    }
  }

  public updateMesh(event, inputElement, plateScreenEl, color): void {
    if (this._isEsc) {
      this._isEsc = false;
      return;
    }
    let valueE = plateScreenEl.getElementsByTagName('span');
    color.mesh = inputElement.value;
    inputElement.hidden = true;
    valueE[0].hidden = false;
  }

  /**
   * @param event
   * @param cell
   * @param row
   */
  public onUpdateValue(value, cell, row, tablePost?) {
    if (tablePost) {
      this.colorsData2[row.$$index][cell] = value;
      this.colorsData2[row.$$index].printType = 1;
      cell = cell + '2';
      this.editing[`${row.$$index}-${cell}`] = false;
    } else {
      this.editing[`${row.$$index}-${cell}`] = false;
      this.colorsData[row.$$index][cell] = value;
      this.colorsData[row.$$index].printType = 0;
    }
  }

  public onKeydown(event, colIndex: number, row, tablePost?): void {
    let e = <KeyboardEvent> event;
    let colList1 = ['sequence', 'mesh'];
    let colList2 = ['sequence2', 'mesh2'];
    // on esc
    if (e.keyCode === 27) {
      if (!tablePost) {
        event.target.value = this.colorsData[row][colList1[colIndex]];
        this.editing[`${row}-${colList1[colIndex]}`] = false;
        this._changeDetectorRef.detectChanges();
      }
      if (tablePost) {
        event.target.value = this.colorsData2[row][colList1[colIndex]];
        this.editing[`${row}-${colList2[colIndex]}`] = false;
        this._changeDetectorRef.detectChanges();
      }
    } else if ((!event.shiftKey && e.keyCode === 9 && e.code === 'Tab')
      || (e.keyCode === 39 && e.code === 'ArrowRight')) {
      if (colIndex === 0 && !tablePost) {
        this.editing[`${row}-${colList1[colIndex]}`] = false;
        this._changeDetectorRef.detectChanges();
        this.editing[`${row}-${colList1[colIndex + 1]}`] = true;
      }
      if (colIndex === 0 && tablePost) {
        this.editing[`${row}-${colList2[colIndex]}`] = false;
        this._changeDetectorRef.detectChanges();
        this.editing[`${row}-${colList2[colIndex + 1]}`] = true;
      }
    } else if ((event.shiftKey && e.keyCode === 9 && e.code === 'Tab')
      || (e.keyCode === 37 && e.code === 'ArrowLeft')) {
      if (colIndex === 1 && !tablePost) {
        this.editing[`${row}-${colList1[colIndex]}`] = false;
        this._changeDetectorRef.detectChanges();
        this.editing[`${row}-${colList1[colIndex - 1]}`] = true;
      }
      if (colIndex === 1 && tablePost) {
        this.editing[`${row}-${colList2[colIndex]}`] = false;
        this._changeDetectorRef.detectChanges();
        this.editing[`${row}-${colList2[colIndex - 1]}`] = true;
      }
    } else if (e.keyCode === 38 && e.code === 'ArrowUp') {
      if (!tablePost) {
        this.editing[`${row}-${colList1[colIndex]}`] = false;
        this._changeDetectorRef.detectChanges();
        this.editing[`${row - 1}-${colList1[colIndex]}`] = true;
      }
      if (tablePost) {
        this.editing[`${row}-${colList2[colIndex]}`] = false;
        this._changeDetectorRef.detectChanges();
        this.editing[`${row - 1}-${colList2[colIndex]}`] = true;
      }
    } else if (e.keyCode === 40 && e.code === 'ArrowDown') {
      if (!tablePost) {
        this.editing[`${row}-${colList1[colIndex]}`] = false;
        this._changeDetectorRef.detectChanges();
        this.editing[`${row + 1}-${colList1[colIndex]}`] = true;
      }
      if (tablePost) {
        this.editing[`${row}-${colList2[colIndex]}`] = false;
        this._changeDetectorRef.detectChanges();
        this.editing[`${row + 1}-${colList2[colIndex]}`] = true;
      }
    } else {
      // e.preventDefault();
    }
  }

  public onActivate(event) {
    this._changeDetectorRef.detectChanges();
  }

  public selectRadio(index: number, value: number) {
    if (this.isPageReadOnly || this.isStyleReadOnly
      || this.isStyleCancelled || this.isOrderArchived
      || this.isOrderCancelled || this.isNonAdminArtManagerArtist) {
      return;
    }
    let prePmsColors = this.frm.get('prePmsColors').value;
    prePmsColors[index].type = value;
    this.frm.get('prePmsColors').patchValue(prePmsColors);
  }

  public onArtApprove(event, type, uploadType, typeName?) {
    // if (!this.frm.get('artReceivedDate').value && type === 0) {
    //   this.frm.get('artReceivedDateOnUtc').setErrors({required: true});
    //   this.frm.get('artReceivedDateOnUtc').markAsDirty();
    //   if (!this.fileViewReceived.length) {
    //     return;
    //   }
    // }
    // if (!this.frm.get('artApprovedDate').value && type === 1) {
    //   this.frm.get('artApprovedDateOnUtc').setErrors({required: true});
    //   this.frm.get('artApprovedDateOnUtc').markAsDirty();
    //   if (!this.fileViewApproved.length) {
    //     return;
    //   }
    // }

    if (this.locationId) {
      let modalRef = this._modalService.open(UploadComponent, {
        size: 'lg',
        keyboard: false,
        backdrop: 'static',
        windowClass: 'super-lg'
      });
      let meg = 'Art file(s) uploaded successfully';
      if (this.fileViewApproved.length && type === 1) {
        let files = this.fileViewApproved.slice(0);
        modalRef.componentInstance.fileExist = files;
        meg = 'Save was successful.';
      }
      if (this.fileViewReceived.length && type === 0) {
        let files = this.fileViewReceived.slice(0);
        modalRef.componentInstance.fileExist = files;
        meg = 'Save was successful.';
      }
      if (this.techSheetFiles.length && type === 2) {
        let files = this.techSheetFiles.slice(0);
        modalRef.componentInstance.fileExist = files;
        meg = 'Save was successful.';
      }
      modalRef.componentInstance.uploadType = uploadType;
      modalRef.componentInstance.locationType = type;
      modalRef.componentInstance.locationId = this.locationId;
      modalRef.componentInstance.isReadOnly = this.isPageReadOnly || this.isStyleReadOnly
        || this.isStyleCancelled || this.isOrderArchived
        || this.isOrderCancelled || this.isNonAdminArtManagerArtist;
      if (typeName) {
        modalRef.componentInstance.title = typeName;
      }
      modalRef.result.then((res: any) => {
        if (res) {
          this.refreshFileView();
          if (res !== 'delete') {
            this._toastrService.success(meg, 'Success');
          } else {
            this._toastrService.success('Art file(s) removed successfully', 'Success');
          }
        } else {
          // if ((!this.fileViewReceived.length && type === 0) ||
          //     (!this.fileViewApproved.length && type === 1)) {
          //       this._toastrService
          //       .error('You must upload at least 1 art file for Art to be approved.', 'Error');
          // }
        }
      }, (err) => {
        // if not, error
      });
    } else {
      this._toastrService.error('Please update detail first!',
        'Error');
    }
  }

  public refreshFileView() {
    let params: HttpParams = new HttpParams()
      .set('printLocationId', this.locationId);
    this._locationDetailService.getArtFiles(params)
      .subscribe((resp: ResponseMessage<any>): void => {
        if (resp.status) {
          this.fileViewApproved = resp.data.filter((item) => item.type === 1);
          this.fileViewReceived = resp.data.filter((item) => item.type === 0);
          this.techSheetFiles = resp.data.filter((item) => item.type === 2);
          this.fileViewApproved = this.insertSpace(this.fileViewApproved);
          this.fileViewReceived = this.insertSpace(this.fileViewReceived);
          this.techSheetFiles = this.insertSpace(this.techSheetFiles);
          // this.frm.get('artReceivedDateOnUtc').updateValueAndValidity();
          // this.frm.get('artApprovedDateOnUtc').updateValueAndValidity();
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public resetTable() {
    let resetColors = [
      {
        no: 1,
        sequence: null,
        mesh: null,
        type: 0,
        id: null
      },
      {
        no: 2,
        sequence: null,
        mesh: null,
        type: 0,
        id: null
      },
      {
        no: 3,
        sequence: null,
        mesh: null,
        type: 0,
        id: null
      },
      {
        no: 4,
        sequence: null,
        mesh: null,
        type: 0,
        id: null
      },
      {
        no: 5,
        sequence: null,
        mesh: null,
        type: 0,
        id: null
      },
      {
        no: 6,
        sequence: null,
        mesh: null,
        type: 0,
        id: null
      },
      {
        no: 7,
        sequence: null,
        mesh: null,
        type: 0,
        id: null
      },
      {
        no: 8,
        sequence: null,
        mesh: null,
        type: 0,
        id: null
      },
      {
        no: 9,
        sequence: null,
        mesh: null,
        type: 0,
        id: null
      },
      {
        no: 10,
        sequence: null,
        mesh: null,
        type: 0,
        id: null
      },
      {
        no: 11,
        sequence: null,
        mesh: null,
        type: 0,
        id: null
      },
      {
        no: 12,
        sequence: null,
        mesh: null,
        type: 0,
        id: null
      },
      {
        no: 13,
        sequence: null,
        mesh: null,
        type: 0,
        id: null
      },
      {
        no: 14,
        sequence: null,
        mesh: null,
        type: 0,
        id: null
      },
      {
        no: 15,
        sequence: null,
        mesh: null,
        type: 0,
        id: null
      },
      {
        no: 16,
        sequence: null,
        mesh: null,
        type: 0,
        id: null
      }
    ];
    this.colorsData = JSON.parse(JSON.stringify(resetColors));
    this.colorsData2 = JSON.parse(JSON.stringify(resetColors));
    this.fileViewReceived = [];
    this.fileViewApproved = [];
    this.techSheetFiles = [];
  }

  public dateToString(date: string) {
    // remove time from utcdatetime
    return date ? date.slice(0, 10) : '';
  }

  public backEvent(url: PopStateEvent) {
    if (url.url.endsWith('detail') ||
      url.url.endsWith('art-files')) {
      setTimeout(() => {
        this._printLocationService.refreshLocation('location-detail');
      });
    }
  }

  public insertSpace(data) {
    let result = data;
    result.forEach((item) => {
      // let l =  item.artFileTypeName.length;
      for (let i = 1; i < item.artFileTypeName.length; i++) {
        if (item.artFileTypeName[i] >= 'A' && item.artFileTypeName[i] <= 'Z') {
          item.artFileTypeName =
            item.artFileTypeName.slice(0, i) + ' ' + item.artFileTypeName.slice(i);
          i++;
        }
      }
    });
    return result;
  }

  public formClick(e: MouseEvent) {
    if (e.toElement &&
      e.toElement.tagName !== 'BUTTON' &&
      !e.toElement.classList.contains('form-control') &&
      !e.toElement.classList.contains('icon-mydpcalendar') &&
      !e.toElement.classList.contains('selection')) {

      // let eventClick = new Event('click');
      // document.dispatchEvent(eventClick);
      this._changeDetectorRef.markForCheck();
    }
  }

  public exportPrintLocation(exportType: string) {
    if (exportType === 'pdf' && this.locationId) {
      let params: HttpParams = new HttpParams()
        .set('styleId', this.orderIndex.styleId.toString());
      this._locationDetailService.exportPrintLocationData(this.locationId, params)
        .subscribe((resp: any): void => {
          if (resp.status) {
            let data = resp;
            let values = data.headers.get('Content-Disposition');
            let filename = values.split(';')[1].trim().split('=')[1];
            // remove " from file name
            filename = filename.replace(/"/g, '');
            let blob;
            if (exportType === 'pdf') {
              blob = new Blob([(<any> data).body],
                {type: 'application/pdf'}
              );
            }
            // else if (exportType === 'xlsx') {
            //   blob = new Blob([(<any> data).body],
            //     {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
            //   );
            // }
            FileSaver.saveAs(blob, filename);
          }
        });
    }
  }

  public switchColorTab(id: number): void {
    this.colorsTab.forEach((i) => i.isActive = false);
    let activatedTab = this.colorsTab.find((i) => i.id === id);
    if (activatedTab) {
      activatedTab.isActive = true;
    }
  }

  public getCurrentActivatedTabColor(): string {
    const currentTab = this.colorsTab.find((i) => i.isActive === true);
    return currentTab ? currentTab.name : '';
  }

  public getPreTabData(data): any[] {
    return data.pmsColors.filter((i) => {
      i.pmsNameSelect = i.pmsName;
      return i.printType === this.pmsType.Pre;
    });
  }

  public getApprovedTabData(data): any[] {
    return data.pmsColors.filter((i) => {
      i.pmsNameSelect = i.pmsName;
      return i.printType === this.pmsType.Approved;
    });
  }

  public addFilm(printType: number): void {
    if (this.frm.get('prePmsColors').value.length > 15) {
      return;
    }
    let prePmsColors = this.frm.get('prePmsColors').value;
    prePmsColors.push({
      colorId: null,
      pmsId: null,
      pmsName: null,
      pmsNameSelect: '',
      mesh: '',
      type: '',
      printType
    });
    this.frm.get('prePmsColors').patchValue(prePmsColors);
  }

  public applyAllByProp(value: string, prop: string) {
    this.frm.get('prePmsColors').value.forEach((p) => {
      p[prop] = value;
    });
  }

  public removeFilm(index: number): void {
    let prePmsColors = this.frm.get('prePmsColors').value;
    prePmsColors.splice(index, 1);
    this.frm.get('prePmsColors').patchValue(prePmsColors);
  }

  public onSaved(frm: FormGroup): void {
    if (frm.invalid) {
      this._commonService.markAsDirtyForm(frm);
      return;
    }
    this.myDatePickerService.addTimeToDateArray(frm, [
      'artReceivedDateOnUtc',
      'artApprovedDateOnUtc',
      'artReleasedDateOnUtc',
      'scheduleDateOnUtc',
      'sampleDateOnUtc',
      'separationDateOnUtc',
      'productionDateOnUtc',
      'approvedToSampleDateOnUtc'
    ]);
    // remove blank row
    let prePmsColors = this.frm.get('prePmsColors').value;
    _.remove(prePmsColors, (color: Film) =>
      !color.pmsName &&
      !color.mesh &&
      (!color.type && color.type !== 0));
    this.frm.get('prePmsColors').setValue(prePmsColors);
    if (!this.frm.get('prePmsColors').value.length) {
      this.addFilm(this.pmsType.Pre);
    }
    let combineColors = this.colorsData.concat(this.colorsData2);
    frm.value.pmsColors = combineColors.filter((c) => c.sequence);
    this.colorsData.forEach((item, index) => {
      if (!item.sequence && !item.mesh) {
        item.type = 0;
      }
      if (!this.colorsData2[index].sequence && !this.colorsData2[index].mesh) {
        this.colorsData2[index].type = 0;
      }
    });
    frm.value.styleId = this.orderIndex.styleId;
    if (!frm.get('id').value) {
      // NProgress.start();
      // this._locationDetailService
      //   .addPrintLocationDetail(frm.value)
      //   .subscribe((resp: ResponseMessage<PrintLocationInfo>) => {
      //     if (resp.status) {
      //       frm.patchValue({id: resp.data.id});
      //       this._printLocationService.printLocation
      //         .dataLocationList[this._printLocationService
      //         .printLocation.curLocation] = resp.data.id;
      //       this.locationId = resp.data.id;
      //       this._toastrService.success(resp.message, 'Success');
      //     } else {
      //       this._toastrService.error(resp.errorMessages, 'Error');
      //     }
      // NProgress.done();
      // });
    } else {
      // NProgress.start();
      let model = frm.value;
      model.pmsColors = [
        ...model.pmsColors.filter((i) => i.type === this.pmsType.Sample),
        ...model.prePmsColors,
        ...model.approvedPmsColors
      ];
      this._locationDetailService
        .updatePrintLocationById(model)
        .subscribe((resp: ResponseMessage<PrintLocationInfo>) => {
          if (resp.status) {
            Object.assign(this.printLocationInfo, {
              ...resp.data,
              approvedPmsColors: this.getApprovedTabData(resp.data),
              prePmsColors: this.getPreTabData(resp.data)
            });
            if (this.printLocationInfo.artApprovedDateOnUtc) {
              this.isPrintApproved = true;
            } else {
              this.isPrintApproved = false;
            }
            this.updateForm(this.printLocationInfo);
            // this.getCommonDataHasNewValue();
            this.preLocationDetailData = _.cloneDeep(this.frm.getRawValue());
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          // NProgress.done();
        });
    }
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  public onAppScroll(event: any) {
    if (event.type === 'resize') {
      if (this._utilService.scrollElm &&
        this._utilService.scrollElm.scrollHeight - (this._utilService.scrollElm.scrollTop
          + window.innerHeight) < 150) {
        this.isShowStickyBtn = false;
        this._changeDetectorRef.markForCheck();
      } else if (this._utilService.scrollElm) {
        this.isShowStickyBtn = true;
        this._changeDetectorRef.markForCheck();
      }
      return;
    }
    if (event.target.scrollingElement.scrollHeight - (event.target.scrollingElement
        .scrollTop + window.innerHeight) < 150) {
      this.isShowStickyBtn = false;
      this._changeDetectorRef.markForCheck();
    } else {
      this.isShowStickyBtn = true;
      this._changeDetectorRef.markForCheck();
    }
  }

  public ngOnDestroy(): void {
    // this.activatedRouteSub.unsubscribe();
    this.subscription.unsubscribe();
    if (this.locationSub) {
      this.locationSub.unsubscribe();
    }
    this._localStorageService.remove('backupData');
    this.subDragService.unsubscribe();
    this.subDragendService.unsubscribe();
    if (this._dragulaService.find('bag-one')) {
      this._dragulaService.destroy('bag-one');
    }
    this._subOrderStatus.unsubscribe();
    this._subOrderData.unsubscribe();
    this._subStyleStatus.unsubscribe();
  }
}
