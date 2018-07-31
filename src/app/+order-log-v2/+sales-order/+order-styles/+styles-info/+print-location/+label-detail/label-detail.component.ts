import {
  Component,
  OnInit,
  ViewEncapsulation,
  OnDestroy,
  HostListener,
  AfterViewInit
} from '@angular/core';

import {
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  Router,
  NavigationEnd
} from '@angular/router';

import {
  HttpParams
} from '@angular/common/http';

import {
  Subject
} from 'rxjs/Subject';

// Services
import {
  LabelDetailService
} from './label-detail.service';
import {
  LocationDetailService
} from '../+location-detail';
import {
  PrintLocationService
} from '../print-location.service';
import {
  SalesOrderService
} from '../../../../sales-order.service';
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
  UserContext
} from '../../../../../../shared/services/user-context';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import * as NProgress from 'nprogress';

import {
  Util
} from '../../../../../../shared/services/util';
import { AuthService } from '../../../../../../shared/services/auth';
import {
  MyDatePickerService
} from '../../../../../../shared/services/my-date-picker';
import { StylesInfoService } from '../../styles-info.service';

// Interfaces
import {
  ResponseMessage,
  BasicGeneralInfo,
  UploadedImage
} from '../../../../../../shared/models';
import {
  PrintLocationInfo
} from '../+location-detail';
import {
  FileItem,
  FileUploader
} from 'ng2-file-upload';
import {
  UploadComponent
} from '../../+print-location/modules';
import {
  Subscription
} from 'rxjs/Subscription';
import {
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  UploadedType
} from '../../../../sales-order.model';
import * as _ from 'lodash';
import { AppConstant } from '../../../../../../app.constant';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'label-detail',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'label-detail.template.html',
  styleUrls: [
    'label-detail.style.scss'
  ]
})
export class LabelDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  public designIdChanged: Subject<string> = new Subject<string>();

  public frm: FormGroup;
  public formErrors = {
    styleId: '',
    neckLabelRequired: '',
    designId: '',
    contentName: '',
    cooName: '',
    year: '',
    locationName: '',
    printMethodName: '',
    inkColor: '',
    placement: '',
    width: '',
    height: '',
    imageUrl: '',
    // isReRun: '',
    artReceivedDateOnUtc: '',
    artApprovedDateOnUtc: '',
    setupOnUtc: '',
    plateScreensOnUtc: '',
    sampleDateOnUtc: '',
    productionDateOnUtc: ''
  };
  public validationMessages = {
    styleId: {required: 'Style ID is required.'},
    neckLabelRequired: {required: 'Neck Label Required is required.'},
    designId: {required: 'Design Id is required.'},
    contentName: {required: 'Content is required.'},
    cooName: {required: 'COO is required.'},
    year: {required: 'Year is required.'},
    locationName: {required: 'Location is required.'},
    printMethodName: {required: 'Service is required.'},
    inkColor: {required: 'Ink Color is required.'},
    placement: {required: 'Reference Point is required.'},
    width: {required: 'Width is required.'},
    height: {required: 'Height is required.'},
    imageUrl: {required: 'Image is required.'},
    artReceivedDateOnUtc: {required: 'Art Received is required.'},
    artApprovedDateOnUtc: {required: 'Art Approved is required.'},
    setupOnUtc: {required: 'Setup is required.'},
    plateScreensOnUtc: {required: 'Plate/Screens is required.'},
    sampleDateOnUtc: {required: 'Sample Date is required.'},
    samplePrinterId: {required: 'Sample Printer is required.'},
    productionDateOnUtc: {required: 'Production Date is required.'},
  };

  public orderIndex = {
    orderId: 0,
    styleId: 0
  };

  public printLocationInfo: any;
  public designDataOrigin: BasicGeneralInfo[];
  public contentData: BasicGeneralInfo[];
  public cooData: BasicGeneralInfo[];
  public yearData: BasicGeneralInfo[] = [];
  public serviceDataOrigin: BasicGeneralInfo[];
  public locationDataOrigin: BasicGeneralInfo[];
  public approvalProcessDataOrigin: BasicGeneralInfo[];
  public samplePrinterDataOrigin: any[];

  // ngSelect data for each form
  public designData = [];
  public serviceData = [];

  // lookup table list
  public lookupTableList = [
    'designData',
    'serviceData'
  ];

  public uploader: FileUploader;

  public isAfterInitColors = false;

  public isShowPrintLocation = false;

  public editing = {};

  public locationId;
  public subscription: Subscription;
  public isOutside = false;

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

  public myTopPickerOptions = {
    ...this.myDatePickerOptions,
    openSelectorTopOfInput: true
  };

  public fileViewReceived = [];
  public fileViewApproved = [];

  public uploadFileType = UploadedType;

  public isNoLabel = false;

  public isPageReadOnly = false;
  public isStyleReadOnly = false;
  public isNonAdminArtManagerArtist = false;
  public isOrderArchived = false;
  public isOrderCancelled = false;
  public isStyleCancelled = false;
  public preLabelDetailData;

  public subRouter: Subscription;

  public isShowStickyBtn = false;

  private _subOrderStatus: Subscription;
  private _subOrderData: Subscription;
  private _subStyleStatus: Subscription;

  constructor(private _toastrService: ToastrService,
              private _localStorageService: LocalStorageService,
              private _labelDetailService: LabelDetailService,
              private _locationDetailService: LocationDetailService,
              private _printLocationService: PrintLocationService,
              private _salesOrderService: SalesOrderService,
              private _commonService: CommonService,
              private _validationService: ValidationService,
              private _authService: AuthService,
              private _stylesInfoService: StylesInfoService,
              private _userContext: UserContext,
              private _router: Router,
              private _utilService: Util,
              private _modalService: NgbModal,
              public myDatePickerService: MyDatePickerService) {
    // this.subscription = _printLocationService.getRefreshLocation().subscribe(
    //   () => {
    //     this.onRouterChange();
    //   });
    this.designIdChanged
      .debounceTime(500)
      .distinctUntilChanged()
      .subscribe((model) => {
        this._labelDetailService.getDesignInfo(model).subscribe((resp: ResponseMessage<any>) => {
          if (resp.status && this.frm) {
            if (resp.data.id) {
              this.frm.get('description').patchValue(resp.data.description);
              this.frm.get('contentId').patchValue(resp.data.contentId);
              this.frm.get('contentName').patchValue(resp.data.contentName);
              this.frm.get('cooId').patchValue(resp.data.cooId);
              this.frm.get('cooName').patchValue(resp.data.cooName);
              this.frm.get('year').patchValue(resp.data.year);
              this.frm.get('placement').patchValue(resp.data.placement);
              this.frm.get('width').patchValue(resp.data.width);
              this.frm.get('height').patchValue(resp.data.height);
              this.frm.get('imageUrl').patchValue(resp.data.imageUrl);
              this.frm.get('absoluteUrl').patchValue(resp.data.absoluteUrl);
              this.frm.get('approvalTypeNames').patchValue(resp.data.approvalTypeNames);
            }
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          // NProgress.done();
        });
      });
    this.orderIndex = this._salesOrderService.orderIndex;
    // Reset all data when change neck label
    this.subRouter = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd &&
        val.urlAfterRedirects &&
        val.urlAfterRedirects.includes('/neck-labels/')) {
        this.onRouterChange();
      }
    });
  }

  public ngOnInit(): void {
    this._subOrderStatus = this._salesOrderService.getUpdateStatusOrder().subscribe((status) => {
      this.isPageReadOnly = status;
    });
    this._subOrderData = this._salesOrderService.getUpdateOrder().subscribe((orderData) => {
      this.isOrderArchived = orderData.isArchived;
      this.isOrderCancelled = orderData.isCancelled;
    });
    this._subStyleStatus = this._stylesInfoService.getUpdateStyle().subscribe((styleData) => {
      this.isStyleCancelled = styleData.isCancelled;
    });
    if (!this._userContext.currentUser.listRole.some((i) =>
      [
        'Administrator',
        'Art Manager',
        'Artists'
      ].indexOf(i.roleName) > -1)) {
      this.isNonAdminArtManagerArtist = true;
    }
    this.uploader = new FileUploader({
      url: `${AppConstant.domain}/api/v1/common/images/necklabels`,
      authToken: 'Bearer ' + this._userContext.userToken.accessToken
    });
    this.buildForm();
    this.initYearData();
  }

  public onRouterChange() {
    this.getCommonData();
    if (this._router.url.includes('neck-labels')) {
      this.isOutside = true;
    }
    if (!this.isOutside) {
      this.locationId = this._printLocationService.printLocation
        .dataLocationList[this._printLocationService.printLocation.curLocation];
      if (this.locationId) {
        this.getPrintLocationInfoData();
        this.refreshFileView();
      }
    } else {
      this.getNeckLabelOutside();
    }
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      // handle sticky btn when scroll
      if (this._utilService.scrollElm) {
        if (this._utilService.scrollElm
            .scrollHeight - window.innerHeight > 135) {
          this.isShowStickyBtn = true;
        }
      }
    }, 1000);
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public initYearData() {
    this.yearData = [];
    for (let i = 2010; i < 2100; i++) {
      this.yearData.push({
        id: i,
        name: i.toString(),
        description: i.toString()
      });
    }
  }

  public getPrintLocationInfoData(): void {
    this._locationDetailService.getPrintLocationById(this.locationId, this.orderIndex.styleId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.printLocationInfo = resp.data;
          this.updateForm(this.printLocationInfo);
          this.preLabelDetailData = _.cloneDeep(this.frm.getRawValue());
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public getNeckLabelOutside() {
    this._labelDetailService.getNeckLabelInfo(this.orderIndex.styleId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.printLocationInfo = resp.data;
          this.locationId = resp.data.id;
          this.isNoLabel = !resp.data.hasNeckLabel;
          this._printLocationService.hasNeckLabel = resp.data.hasNeckLabel;
          this.refreshFileView();
          this.updateForm(this.printLocationInfo);
          this.preLabelDetailData = _.cloneDeep(this.frm.getRawValue());
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getDesignList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.designDataOrigin = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._commonService.getContentList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.contentData = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._commonService.getCooList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.cooData = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._commonService.getPrintMethods()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.serviceDataOrigin = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._commonService.getLocationList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.locationDataOrigin =
            resp.data.filter((loc) => loc.description ===
              this._printLocationService.printLocation.curLocation);
          if (this.isOutside) {
            this.locationDataOrigin =
              resp.data.filter((loc) => loc.description.toLowerCase().includes('label'));
          }
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._commonService.getApprovalTypeList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.approvalProcessDataOrigin = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._labelDetailService.getSamplesPrinter()
      .subscribe((resp: ResponseMessage<any[]>) => {
        if (resp.status) {
          resp.data.forEach((i) => {
            i.fakeId = [i.id, i.id = i.fakeId][0];
          });
          this.samplePrinterDataOrigin = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public buildForm(): void {
    let controlConfig = {
      id: new FormControl(''),
      styleId: new FormControl(''),
      neckLabelRequired: new FormControl(null, [Validators.required]),
      designId: new FormControl(''),
      hasNeckLabel: new FormControl(''),
      contentId: new FormControl(null),
      contentName: new FormControl(''),
      cooId: new FormControl(null),
      cooName: new FormControl(''),
      year: new FormControl(null),
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
      approvalTypeNames: new FormControl([]),
      inkColor: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'inkColor'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
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
      description: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'description'),
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
      isOnFile: new FormControl(false),
      artReceivedDate: new FormControl(null),
      artReceivedDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getFileRequireCase(group, 'artReceivedDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      artApprovedDate: new FormControl(null),
      artApprovedDateOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getFileRequireCase(group, 'artApprovedDateOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      comments: new FormControl(''),
      status: new FormControl(''),
      blankPo: new FormControl(''),
      retailerPo: new FormControl(''),
      tscPoToInfinity: new FormControl(''),
      sku: new FormControl(''),
      season: new FormControl(''),
      supplier: new FormControl(''),
      monthProduced: new FormControl(''),
      mfg: new FormControl(''),
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
      isAdvanced: new FormControl(false),
      setupDate: new FormControl(null),
      setupOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getFileRequireCase(group, 'setupOnUtc'),
            Validators.compose([
              Validators.required
            ])
          ),
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      plateScreensDate: new FormControl(null),
      plateScreensOnUtc: new FormControl('', [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getFileRequireCase(group, 'plateScreensOnUtc'),
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
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      samplePrinterId: new FormControl(null),
      samplePrinterType: new FormControl(''),
      productionDate: new FormControl(null),
      productionDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      formRequires: new FormControl({
        styleId: {required: false},
        neckLabelRequired: {required: true},
        designId: {required: false},
        contentName: {required: false},
        cooName: {required: false},
        year: {required: false},
        printMethodName: {required: false},
        inkColor: {required: false},
        placement: {required: false},
        description: {required: false},
        width: {required: false},
        height: {required: false},
        imageUrl: {required: false},
        // isReRun: {required: false},
        artReceivedDateOnUtc: {required: false},
        artApprovedDateOnUtc: {required: false},
        blankPo: {required: false},
        retailerPo: {required: false},
        tscPoToInfinity: {required: false},
        season: {required: false},
        supplier: {required: false},
        monthProduced: {required: false},
        mfg: {required: false},
        setupOnUtc: {required: false},
        plateScreensOnUtc: {required: false},
        sampleDateOnUtc: {required: false},
        samplePrinterId: {required: false},
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
    patchDateFunc('setupOnUtc', 'setupDate');
    patchDateFunc('plateScreensOnUtc', 'plateScreensDate');
    patchDateFunc('sampleDateOnUtc', 'sampleDate');
    patchDateFunc('productionDateOnUtc', 'productionDate');
  }

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    let firstCaseList = [
      // 'designId',
      // 'printMethodName'
    ];
    let secondCaseList = [
      // 'inkColor',
      // 'placement',
      // 'width',
      // 'height',
      // 'imageUrl'
    ];

    let getStatus = (caseList: string[]): boolean => {
      let status = false;
      caseList.forEach((cas) => status = status || !!frm.get(cas).value);
      caseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    };

    if (firstCaseList.findIndex((cas) => cas === key) > -1) {
      return getStatus(firstCaseList);
    }
    if (secondCaseList.findIndex((cas) => cas === key) > -1) {
      return getStatus(secondCaseList);
    }
    return false;
  }

  public getFileRequireCase(frm: FormGroup, key: string): boolean {
    if (key === 'artReceivedDateOnUtc') {
      frm.get('formRequires').value['artReceivedDateOnUtc'].required =
        !!this.fileViewReceived.length && !frm.get('isOnFile').value;
      return !!this.fileViewReceived.length && !frm.get('isOnFile').value;
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

    if (formControlName === 'neckLabelRequired') {
      if (!(frm.get(formControlName).value - 1)) {
        this.isNoLabel = true;
        this.isShowStickyBtn = false;
      } else {
        this.isNoLabel = false;
        this.isShowStickyBtn = true;
      }
    }
  }

  /**
   * Bind UTC date to form
   * @param event
   * @param prop
   */
  public onDateChangedBy(event: IMyDateModel, prop: string): void {
    let utcDate = Object.assign({}, event);
    if (utcDate.jsdate) {
      utcDate.jsdate.setHours(utcDate.jsdate.getHours() - utcDate.jsdate.getTimezoneOffset() / 60);
    }
    this.frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');

    // Update status for form control whose value changed
    this.frm.get(prop).markAsDirty();
  }

  /**
   * Upload image
   * @param event
   */
  public uploadImage(index: number) {
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
      } else {
        this.uploader.clearQueue();
        let inputFile = document.getElementById('neckLabelInputFile') as HTMLInputElement;
        if (inputFile) {
          inputFile.value = '';
        }
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
        this.uploadImage(index);
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
    this.locationId = data.id;
    this.frm.patchValue(data);
    if (this.frm.get('hasNeckLabel').value === true) {
      this.frm.get('neckLabelRequired').setValue(2);
    }
    if (this.frm.get('hasNeckLabel').value === false) {
      this.frm.get('neckLabelRequired').setValue(1);
    }
    this.setDateValue();
    // this.getCommonData();
  }

  public onSaved(): void {
    if (!this.isOutside) {
      this.frm.value.locationId = this.locationDataOrigin[0].id;
    }

    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
      return;
    }
    this.myDatePickerService.addTimeToDateArray(this.frm, [
      'artReceivedDateOnUtc',
      'artApprovedDateOnUtc',
      'setupOnUtc',
      'plateScreensOnUtc',
      'sampleDateOnUtc',
      'productionDateOnUtc'
    ]);
    let model = this.frm.value;
    model.hasNeckLabel = !this.isNoLabel;
    this._printLocationService.hasNeckLabel = !this.isNoLabel;
    if (this.frm.get('neckLabelRequired').value === 1) {
      const modal = {
        id: this.frm.get('id').value,
        hasNeckLabel: false,
        neckLabelRequired: this.frm.get('neckLabelRequired').value
      };
      this.buildForm();
      this.frm.patchValue(modal);
      this.printLocationInfo = this.frm.getRawValue();
    }
    if (!this.frm.get('id').value) {
      if (!this.isOutside) {
        // NProgress.start();
        this._locationDetailService
          .addPrintLocationDetail(this.orderIndex.styleId, [model.locationId])
          .subscribe((resp: ResponseMessage<PrintLocationInfo>) => {
            if (resp.status) {
              Object.assign(this.printLocationInfo, resp.data);
              this.updateForm(this.printLocationInfo);
              this._printLocationService.printLocation.dataLocationList
                [this._printLocationService.printLocation.curLocation] = resp.data.id;
              this.preLabelDetailData = _.cloneDeep(this.frm.getRawValue());
              this._toastrService.success(resp.message, 'Success');
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
            // NProgress.done();
          });
      } else {
        // NProgress.start();
        this._labelDetailService
          .createNeckLabelInfo(this.orderIndex.styleId, model)
          .subscribe((resp: ResponseMessage<PrintLocationInfo>) => {
            if (resp.status) {
              Object.assign(this.printLocationInfo, resp.data);
              this.updateForm(this.printLocationInfo);
              this.preLabelDetailData = _.cloneDeep(this.frm.getRawValue());
              this._toastrService.success(resp.message, 'Success');
              // revalidate before publish
              if (this._salesOrderService.hasErBeforePublish) {
                this._salesOrderService.reValidate(this.orderIndex.orderId);
              }
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
            // NProgress.done();
          });
      }
    } else {
      if (!this.isOutside) {
        // NProgress.start();
        this._locationDetailService
          .updatePrintLocationById(this.frm.value)
          .subscribe((resp: ResponseMessage<PrintLocationInfo>) => {
            if (resp.status) {
              Object.assign(this.printLocationInfo, resp.data);
              this.updateForm(this.printLocationInfo);
              this.preLabelDetailData = _.cloneDeep(this.frm.getRawValue());
              this._toastrService.success(resp.message, 'Success');
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
            // NProgress.done();
          });
      } else {
        // NProgress.start();
        this._labelDetailService
          .updateNeckLabelInfo(this.frm.value)
          .subscribe((resp: ResponseMessage<PrintLocationInfo>) => {
            if (resp.status) {
              Object.assign(this.printLocationInfo, resp.data);
              this.updateForm(this.printLocationInfo);
              this.preLabelDetailData = _.cloneDeep(this.frm.getRawValue());
              this._toastrService.success(resp.message, 'Success');
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
            // NProgress.done();
          });
      }
    }
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

  public onArtApprove(event, type, uploadType) {
    if (!this.frm.get('artReceivedDate').value && type === 0) {
      this.frm.get('artReceivedDateOnUtc').setErrors({required: true});
      this.frm.get('artReceivedDateOnUtc').markAsDirty();
      if (!this.fileViewReceived.length) {
        return;
      }
    }
    if (!this.frm.get('artApprovedDate').value && type === 1) {
      this.frm.get('artApprovedDateOnUtc').setErrors({required: true});
      this.frm.get('artApprovedDateOnUtc').markAsDirty();
      if (!this.fileViewApproved.length) {
        return;
      }
    }

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
    modalRef.componentInstance.uploadType = uploadType;
    modalRef.componentInstance.locationType = type;
    modalRef.componentInstance.locationId = this.locationId;
    modalRef.componentInstance.isNeckLabel = this.isOutside;
    modalRef.componentInstance.isReadOnly = this.isPageReadOnly || this.isStyleReadOnly
        || this.isStyleCancelled || this.isOrderArchived
      || this.isOrderCancelled || this.isNonAdminArtManagerArtist;
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

    if (!this.locationId) {
      let model = this.frm.value;
      model.hasNeckLabel = !this.isNoLabel;
      this._printLocationService.hasNeckLabel = !this.isNoLabel;
      if (!this.isOutside) {
        // NProgress.start();
        this._locationDetailService
          .addPrintLocationDetail(this.orderIndex.styleId, [model.locationId])
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              this.printLocationInfo = resp.data;
              this.updateForm(this.printLocationInfo);
              this._printLocationService.printLocation.dataLocationList
                [this._printLocationService.printLocation.curLocation] = resp.data.id;
              modalRef.componentInstance.locationId = this.locationId;
              this.preLabelDetailData = _.cloneDeep(this.frm.getRawValue());
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
            // NProgress.done();
          });
      } else {
        // NProgress.start();
        this._labelDetailService
          .createNeckLabelInfo(this.orderIndex.styleId, model)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              this.printLocationInfo = resp.data;
              this.updateForm(this.printLocationInfo);
              modalRef.componentInstance.locationId = this.locationId;
              this.preLabelDetailData = _.cloneDeep(this.frm.getRawValue());
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
            // NProgress.done();
          });
      }
    }
  }

  public refreshFileView() {
    let params: HttpParams;
    if (!this.isOutside) {
      params = new HttpParams()
        .set('printLocationId', this.locationId);
    } else {
      params = new HttpParams()
        .set('neckLabelId', this.locationId);
    }
    if (this.locationId) {
      this._locationDetailService.getArtFiles(params, this.isOutside)
        .subscribe((resp: ResponseMessage<any>): void => {
          if (resp.status) {
            this.fileViewApproved = resp.data.filter((item) => item.type === 1);
            this.fileViewReceived = resp.data.filter((item) => item.type === 0);
            this.fileViewApproved = this.insertSpace(this.fileViewApproved);
            this.fileViewReceived = this.insertSpace(this.fileViewReceived);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
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

  public onCheckNoLabel(event) {
    this.isNoLabel = event.target.checked;
    this.frm.get('hasNeckLabel').patchValue(!this.isNoLabel);
    this._printLocationService.hasNeckLabel = !this.isNoLabel;
  }

  public getDesignDetail($event) {
    if (!$event.target || !$event.target.value) {
      return;
    }
    this.designIdChanged.next($event.target.value);
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  public onAppScroll(event) {
    if (event.type === 'resize') {
      if (this._utilService.scrollElm &&
        this._utilService.scrollElm.scrollHeight  - (this._utilService.scrollElm.scrollTop
          + window.innerHeight) < 135) {
      this.isShowStickyBtn = false;
      } else if (this._utilService.scrollElm) {
        this.isShowStickyBtn = true;
      }
      return;
    }
    if (event.target.scrollingElement.scrollHeight  - (event.target.scrollingElement
        .scrollTop + window.innerHeight) < 135) {
      this.isShowStickyBtn = false;
    } else {
      this.isShowStickyBtn = true;
    }
  }

  public ngOnDestroy(): void {
    // this.subscription.unsubscribe();
    this._localStorageService.remove('backupData');
    this.subRouter.unsubscribe();
  }
}
