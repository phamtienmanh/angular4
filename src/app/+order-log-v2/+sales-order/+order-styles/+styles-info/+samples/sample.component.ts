import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  AfterViewInit
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  Router,
  NavigationEnd
} from '@angular/router';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  UserContext
} from '../../../../../shared/services/user-context';
import * as NProgress from 'nprogress';
import * as moment from 'moment';
import _ from 'lodash';

// Components
import {
  JobChangeComponent
} from './job-change';
import {
  ConfirmDialogComponent
} from '../../../../../shared/modules/confirm-dialog';

// Services
import {
  Util
} from '../../../../../shared/services/util';
import {
  ToastrService
} from 'ngx-toastr';
import {
  SalesOrderService
} from '../../../sales-order.service';
import {
  SampleService
} from './sample.service';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  CommonService
} from '../../../../../shared/services/common';
import {
  AuthService
} from '../../../../../shared/services/auth';
import {
  MyDatePickerService
} from '../../../../../shared/services/my-date-picker';
import {
  ExtraValidators,
  ValidationService
} from '../../../../../shared/services/validation';
import { StylesInfoService } from '../styles-info.service';
import {
  DragulaService
} from 'ng2-dragula/ng2-dragula';

// Validators

// Interfaces
import {
  Color,
  JobChange,
  PrintLocation,
  SampleDetail,
  SampleSize
} from './sample.model';
import {
  BasicResponse,
  ResponseMessage,
  BasicGeneralInfo,
  UploadedImage
} from '../../../../../shared/models';
import {
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  FileItem,
  FileUploader
} from 'ng2-file-upload';
import {
  Subscription
} from 'rxjs/Subscription';
import { AppConstant } from '../../../../../app.constant';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'sample',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'sample.template.html',
  styleUrls: [
    'sample.style.scss'
  ]
})

export class SampleComponent implements OnInit, OnDestroy, AfterViewInit {
  public sampleDetail: SampleDetail;
  public frm: FormGroup;
  public formErrors = {};
  public validationMessages = {
    approvalTypeNames: {
      required: 'At least 1 process must be specified.'
    },
    treatmentName: {required: 'Treatment is required.'},
    releaseArtByUserId: {
      required: 'Release Art is required.'
    },
    approveArtByUserId: {
      required: 'Approve Art is required.'
    },
    customerSampleSizes: {
      required: 'PP Customer Qty value must be specified.',
      invalidValue: 'PP Customer Qty must be less than ' +
      'or equal to PP Sample Ordered for every Size.'
    },
    factoryName: {
      required: 'Factory Name is required.'
    },
    sampleDueDateOnUtc: {
      required: 'Sample Due Date is required.'
    },
    trackingNumber: {
      required: 'Tracking Number is required.'
    },
    blanksReturnedQty: {
      required: 'Blanks Returned Qty is required.',
      invalidValue: 'Blanks Returned Qty values from 1 to 999.'
    }
  };

  public orderIndex = {
    orderId: 0,
    styleId: 0,
    styleName: ''
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
  public jobChangeList = [];
  public approvalTypeList = [];
  public factoryList = [];
  public sampleBinList = [];
  public artManagerAndArtists = [];
  public locationList = [];
  public uploader: FileUploader;
  public pmsColorData = [];
  public isPageReadOnly = false;
  public isStyleReadOnly = false;
  public isNonAdminArtManagerArtist = false;
  public isAMCustomerService = false;
  public isOrderArchived = false;
  public isOrderCancelled = false;
  public isStyleCancelled = false;
  public isArtManager = false;
  public inputOldValue = 0;
  public styleImageUrl = '';
  public preSampleData;
  public treatmentDataOrigin: BasicGeneralInfo[];

  public subRouter: Subscription;
  public subDragulaService: Subscription;
  public dragOptions: any;

  public isShowStickyBtn = false;
  private _subOrderStatus: Subscription;
  private _subOrderData: Subscription;
  private _subStyleStatus: Subscription;

  constructor(private _fb: FormBuilder,
              private _router: Router,
              private _modalService: NgbModal,
              private _toastrService: ToastrService,
              private _dragulaService: DragulaService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _localStorageService: LocalStorageService,
              private _salesOrderService: SalesOrderService,
              private _authService: AuthService,
              private _userContext: UserContext,
              private _commonService: CommonService,
              private _stylesInfoService: StylesInfoService,
              private _sampleService: SampleService,
              private _utilService: Util,
              private _validationService: ValidationService,
              public myDatePickerService: MyDatePickerService) {
    this.dragulaConfig();
    this.isArtManager = this._userContext.currentUser.listRole
      .some((role) => role.roleName === 'Art Manager'
        || role.roleName === 'Administrator'
        || role.roleName === 'Staff Administrator');
    this.orderIndex = this._salesOrderService.orderIndex;
    // Reset all data when change samples
    this.subRouter = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd &&
        val.urlAfterRedirects &&
        val.urlAfterRedirects.includes('/samples')) {
        this.onRouterChange();
      }
    });
  }

  public ngOnInit(): void {
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
    if (this._userContext.currentUser.listRole.some((i) =>
        [
          'Account Manager',
          'Customer Service'
        ].indexOf(i.roleName) > -1)) {
      this.isAMCustomerService = true;
    }
    this.uploader = new FileUploader({
      url: `${AppConstant.domain}/api/v1/common/images/styles`,
      authToken: 'Bearer ' + this._userContext.userToken.accessToken
    });
    this.buildForm();
  }

  public dragulaConfig() {
    this.subDragulaService = this._dragulaService.dragend.subscribe((value) => {
      this._changeDetectorRef.markForCheck();
    });
    this.dragOptions = {
      moves: (el, container, handle) => {
        return handle.className === 'seq-handle';
      }
    };
  }

  public onRouterChange() {
    this.getCommonData();
    this.getSampleDetailData();
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      if (this._utilService.scrollElm) {
        if (this._utilService.scrollElm
            .scrollHeight - window.innerHeight > 195) {
          this.isShowStickyBtn = true;
          this._changeDetectorRef.markForCheck();
        }
      }
    }, 1000);
  }

  public getCommonData() {
    this._commonService.getPmsColor().subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
      if (resp.status) {
        this.pmsColorData = resp.data.filter((c) => !c['isAddedNew']);
      } else {
        this._toastrService.error(resp.errorMessages, 'Error');
      }
      this._changeDetectorRef.markForCheck();
    });
    this._commonService.getApprovalTypeList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.approvalTypeList = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
    this._sampleService.getJobChangeList(this.orderIndex.styleId)
      .subscribe((resp: ResponseMessage<JobChange[]>) => {
        if (resp.status) {
          this.jobChangeList = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
    this._commonService.getArtManagerAndArtists()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.artManagerAndArtists = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
    this._commonService.getTreatmentList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.treatmentDataOrigin = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
    this._sampleService.getSampleBinList(this.orderIndex.styleId)
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.sampleBinList = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
  }

  public getFactoryList(type: number) {
    this._commonService.getFactoryList(type)
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.factoryList = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
  }

  public updateForm(data): void {
    if (data) {
      this.locationList = [];
      data.printLocations.forEach((p) => {
        this.locationList.push({
          id: p.printLocationId,
          name: p.locationName,
          description: ''
        });
      });
      this.frm.patchValue(data);
      // patch date value
      this.setDateValue(this.frm);
      this.setPrintLocations(data.printLocations);
      this.setSampleSizes(data.customerSampleSizes);
      this.backupData();
    }
  }

  public getSampleDetailData(): void {
    if (this.orderIndex.styleId) {
      this._sampleService.getSampleDetail(this.orderIndex.styleId)
        .subscribe((resp: ResponseMessage<SampleDetail>) => {
          if (resp.status) {
            this.styleImageUrl = resp.data.styleImageUrl;
            this.sampleDetail = resp.data;
            this.updateForm(this.sampleDetail);
            this.preSampleData = _.cloneDeep(this.frm.getRawValue());
            if (resp.data.itemType !== 0) {
              this.getFactoryList(resp.data.itemType);
            }
          } else {
            // this._toastrService.error(resp.errorMessages, 'Error');
          }
          this._changeDetectorRef.markForCheck();
        });
    } else {
      this.preSampleData = _.cloneDeep(this.frm.getRawValue());
    }
  }

  public buildForm(): void {
    this.frm = this._fb.group({
      id: new FormControl(''),
      itemType: new FormControl(''),
      isSampleToMatch: new FormControl(''),
      approvalTypeNames: new FormControl([], [Validators.required]),
      // customerSampleQty: new FormControl('', [
      //   Validators.compose([
      //     ExtraValidators.conditional(
      //       (group) => this.approvalProcessIncludes('Send To Customer'),
      //       Validators.compose([
      //         Validators.required
      //       ])
      //     )
      //   ])
      // ]),
      treatmentId: new FormControl(null),
      treatmentName: new FormControl(''),
      treatmentSampleDate: new FormControl(null),
      treatmentSampleDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      treatmentApproval: new FormControl(null),
      treatmentApprovalOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      treatmentProductionDate: new FormControl(null),
      treatmentProductionDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      physSampleExFactoryDatePp: new FormControl(null),
      physSampleExFactoryDatePpOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      physSampleExFactoryDatePpToTestingFacility: new FormControl(null),
      physSampleExFactoryDatePpToTestingFacilityOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      physSampleDeliveredToTestingFacilityPp: new FormControl(null),
      physSampleDeliveredToTestingFacilityPpOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      physSampleApprovedByTestingFacilityPp: new FormControl(null),
      physSampleApprovedByTestingFacilityPpOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      physSampleActualDateDeliveredPp: new FormControl(null),
      physSampleActualDateDeliveredPpOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      techDesignReviewDatePpDateApproved: new FormControl(null),
      techDesignReviewDatePpDateApprovedOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      ppSampleSizes: this._fb.array([]),
      customerSampleSizes: this._fb.array([]),
      designId: new FormControl(''),
      factoryId: new FormControl(null),
      factoryName: new FormControl(''),
      sampleDueDate: new FormControl(null),
      sampleDueDateOnUtc: new FormControl('', [
        ExtraValidators.conditional(
          (group) => this.getSpecialRequireCase(group, 'sampleDueDateOnUtc'),
          Validators.compose([
            Validators.required
          ])
        ),
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      sampleBinId: new FormControl(null),
      sampleBinName: new FormControl(''),
      blanksReturnedQty: new FormControl('', this.numberInRange(1, 999)),
      // blanksDeliveredToArtDept: new FormControl(''),
      // blanksDeliveredToArtDeptOnUtc: new FormControl('', [
      //   Validators.compose([
      //     Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
      //       '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
      //   ])
      // ]),
      blanksReceivedIntoArtDept: new FormControl(null),
      blanksReceivedIntoArtDeptOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      blanksReturned: new FormControl(null),
      blanksReturnedOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      artRequested: new FormControl(null),
      artRequestedOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      releaseArtByUserId: new FormControl(null),
      approveArtByUserId: new FormControl(null),
      qcSampleQty: new FormControl(''),
      qcSampleDate: new FormControl(null),
      qcSampleDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      dateSentToCustomer: new FormControl(null),
      dateSentToCustomerOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      approvedToSampleFromOnUtc: new FormControl(''),
      approvedToSampleToOnUtc: new FormControl(''),
      trackingNumber: new FormControl(''),
      samplesDeliveredToCustomerPpDateDelivered: new FormControl(null),
      samplesDeliveredToCustomerPpDateDeliveredOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]+)')
        ])
      ]),
      comments: new FormControl(''),
      printLocations: this._fb.array([]),
      formRequires: new FormControl({
        approvalTypeNames: {
          required: true
        },
        treatmentName: {
          required: false
        },
        treatmentSampleDateOnUtc: {
          required: false
        },
        treatmentApprovalOnUtc: {
          required: false
        },
        treatmentProductionDateOnUtc: {
          required: false
        },
        physSampleExFactoryDatePpOnUtc: {
          required: false
        },
        physSampleExFactoryDatePpToTestingFacilityOnUtc: {
          required: false
        },
        physSampleDeliveredToTestingFacilityPpOnUtc: {
          required: false
        },
        physSampleApprovedByTestingFacilityPpOnUtc: {
          required: false
        },
        physSampleActualDateDeliveredPpOnUtc: {
          required: false
        },
        techDesignReviewDatePpDateApprovedOnUtc: {
          required: false
        },
        samplesDeliveredToCustomerPpDateDeliveredOnUtc: {
          required: false
        },
        factoryName: {
          required: false
        },
        sampleDueDateOnUtc: {
          required: false
        },
        // blanksDeliveredToArtDeptOnUtc: {
        //   required: false
        // },
        blanksReceivedIntoArtDeptOnUtc: {
          required: false
        },
        blanksReturnedOnUtc: {
          required: false
        },
        artRequestedOnUtc: {
          required: false
        },
        releaseArtByUserId: {
          required: false
        },
        approveArtByUserId: {
          required: false
        },
        qcSampleDateOnUtc: {
          required: false
        },
        dateSentToCustomer: {
          required: false
        },
        trackingNumber: {
          required: false
        },
        blanksReturnedQty: {
          required: false
        }
      })
    });
    this.backupData();
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public onSelectItem(val, frm, valProp: string, formControlName: string): void {
    if (val[valProp]) {
      frm.get(formControlName).patchValue(val[valProp]);
    } else {
      // add new
      frm.get(formControlName).patchValue(val);
    }
  }

  public sizesValidateInvalid() {
    if (this.customerSampleSizes.value && this.customerSampleSizes.value.length) {
      this.customerSampleSizes['required'] =
        this.ppSampleSizes.value.some((s) => s.qty !== 0)
        && this.customerSampleSizes.value
          .every((s) => {
            return s.qty === 0 || s.qty === '0' || s.qty === '';
          })
        && this.approvalProcessIncludes('Send To Customer');
      this.customerSampleSizes['invalidValue'] = this.customerSampleSizes.value
          .some((s, index) => s.qty > this.ppSampleSizes.value[index].qty)
        && this.approvalProcessIncludes('Send To Customer');
    }
    return this.customerSampleSizes['required'] || this.customerSampleSizes['invalidValue'];
  }

  public get printLocations(): FormArray {
    return this.frm.get('printLocations') as FormArray;
  }

  public get ppSampleSizes(): FormArray {
    return this.frm.get('ppSampleSizes') as FormArray;
  }

  public get customerSampleSizes(): FormArray {
    return this.frm.get('customerSampleSizes') as FormArray;
  }

  public setPrintLocations(printLocations: PrintLocation[]) {
    let printLocationFGs = [];
    printLocations.forEach((printLocation: PrintLocation, index) => {
      let pFrm = this._validationService.buildForm({
        isActive: new FormControl(index === 0 ? true : false),
        printLocationId: new FormControl(printLocation.printLocationId),
        locationId: new FormControl(printLocation.locationId),
        locationName: new FormControl(printLocation.locationName),
        isPrintApproved: new FormControl(printLocation.isPrintApproved),
        absoluteUrl: new FormControl(printLocation.absoluteUrl),
        relativeUrl: new FormControl(printLocation.relativeUrl),
        pmsColors: this._fb.array([]),
        formRequires: new FormControl({
          absoluteUrl: {
            required: false
          }
        })
      }, this.formErrors, this.validationMessages);

      pFrm.setControl('pmsColors', this.toPmsColorsFormArray(printLocation.pmsColors));

      printLocationFGs.push(pFrm);
    });
    const printLocationFormArray = this._fb.array(printLocationFGs);
    this.frm.setControl('printLocations', printLocationFormArray);
    this.frm.get('printLocations').updateValueAndValidity();
  }

  public toPmsColorsFormArray(pmsColors) {
    const colorFGs = pmsColors.map((color: Color, i) =>
      this._validationService.buildForm({
        colorId: new FormControl(color.colorId),
        pmsId: new FormControl(color.pmsId),
        pmsName: new FormControl(color.pmsName),
        pmsNameSelect: new FormControl(color.pmsName),
        sequence: new FormControl(color.sequence),
        mesh: new FormControl(color.mesh),
        type: new FormControl(color.type)
      }, this.formErrors, this.validationMessages));
    let colorFormArray = this._fb.array(colorFGs);
    if (colorFormArray.length === 0) {
      this.addColor(colorFormArray);
    }
    return colorFormArray;
  }

  public setSampleSizes(customerSampleSizes: SampleSize[]) {
    if (!customerSampleSizes || !customerSampleSizes.length) {
      return;
    }
    const qtyBySizeName = (sizeArr: SampleSize[], name: string) => {
      let size = _.findLast(sizeArr, (s) => {
        return s.size === name;
      });
      if (size) {
        return size.qty;
      }
      return 0;
    };
    let SampleQty = _.filter(customerSampleSizes, (s) => {
      return s.type === 'SampleQty';
    });
    let SalesOrderQty =
          _.filter(customerSampleSizes, (s) => {
            return s.type === 'SalesOrderQty';
          });
    let ProductionQty =
          _.filter(customerSampleSizes, (s) => {
            return s.type === 'ProductionQty';
          });
    let CustomerSampleQty =
          _.filter(customerSampleSizes, (s) => {
            return s.type === 'CustomerSampleQty';
          });
    let isSMPL = this.sampleDetail.customerPoId
      && this.sampleDetail.customerPoId.toLowerCase().startsWith('smpl');

    let ppSizeFGs = [];
    let customerSizeFGs = [];
    SampleQty.forEach((sampleSize: SampleSize, index) => {
      let sFrm = this._validationService.buildForm({
        size: new FormControl(sampleSize.size),
        qty: new FormControl(isSMPL ? qtyBySizeName(ProductionQty, sampleSize.size) :
          sampleSize.qty),
        type: new FormControl(sampleSize.type)
      }, {}, {});
      ppSizeFGs.push(sFrm);
      let cusFrm;
      if (isSMPL && this.approvalProcessIncludes('Send To Customer')) {
        cusFrm = this._validationService.buildForm({
          size: new FormControl(sampleSize.size),
          qty: new FormControl(qtyBySizeName(SalesOrderQty, sampleSize.size)),
          type: new FormControl('CustomerSampleQty')
        }, {}, {});
      } else {
        cusFrm = this._validationService.buildForm({
          size: new FormControl(sampleSize.size),
          qty: new FormControl(qtyBySizeName(CustomerSampleQty, sampleSize.size)),
          type: new FormControl('CustomerSampleQty')
        }, {}, {});
      }
      customerSizeFGs.push(cusFrm);
    });
    const ppSizeFormArray = this._fb.array(ppSizeFGs);
    this.frm.setControl('ppSampleSizes', ppSizeFormArray);

    const customerSizeFormArray = this._fb.array(customerSizeFGs);
    this.frm.setControl('customerSampleSizes', customerSizeFormArray);
  }

  public calTotal(sizeArr: FormArray): number {
    let total = 0;
    sizeArr.controls.forEach((s) => {
      total += s.get('qty').value - 0;
    });
    return total;
  }

  public switchTab(index: number) {
    this.printLocations.controls.forEach((p) => {
      p.get('isActive').setValue(false);
    });
    this.printLocations.controls[index].get('isActive').setValue(true);
  }

  public addColor(pColors: FormArray) {
    if (pColors.value.length > 15) {
      return;
    }
    pColors.push(this._validationService.buildForm({
      colorId: new FormControl(null),
      pmsId: new FormControl(null),
      pmsName: new FormControl(null),
      pmsNameSelect: new FormControl(''),
      sequence: new FormControl(''),
      mesh: new FormControl(''),
      type: new FormControl('')
    }, this.formErrors, this.validationMessages));
  }

  public deleteColor(pColors: FormArray, i: number) {
    pColors.removeAt(i);
  }

  public applyAllByProp(pColors: FormArray, color: FormControl, prop: string) {
    let value = color.get(prop).value;
    pColors.controls.forEach((p) => {
      p.get(prop).patchValue(value);
    });
  }

  /**
   * Set date value to bind to mydatepicker
   * @param form
   */
  public setDateValue(form: FormGroup): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (form.get(importName).value) {
        let dateRegex = /^\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{4})$/;
        if (dateRegex.test(form.get(importName).value)) {
          const newDateTime = new Date(form.get(importName).value);
          form.get(importName).patchValue(newDateTime);
          // ------
          const currentDate = new Date(form.get(importName).value);
          this.configDateOptions(importName, currentDate);
          form.get(exportName).setValue({
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
          this.configDateOptions(importName, currentDate);

          form.get(exportName).setValue({
            date: {
              year: currentDate.getFullYear(),
              month: currentDate.getMonth() + 1,
              day: currentDate.getDate()
            }
          });
        }
      } else {
        form.get(importName).patchValue(null);
        form.get(exportName).patchValue(null);
        this.configDateOptions(importName, null);
      }
    };
    patchDateFunc('treatmentSampleDateOnUtc', 'treatmentSampleDate');
    patchDateFunc('treatmentApprovalOnUtc', 'treatmentApproval');
    patchDateFunc('treatmentProductionDateOnUtc', 'treatmentProductionDate');
    patchDateFunc('physSampleExFactoryDatePpOnUtc', 'physSampleExFactoryDatePp');
    patchDateFunc('physSampleExFactoryDatePpToTestingFacilityOnUtc',
      'physSampleExFactoryDatePpToTestingFacility');
    patchDateFunc('physSampleDeliveredToTestingFacilityPpOnUtc',
      'physSampleDeliveredToTestingFacilityPp');
    patchDateFunc('physSampleApprovedByTestingFacilityPpOnUtc',
      'physSampleApprovedByTestingFacilityPp');
    patchDateFunc('physSampleActualDateDeliveredPpOnUtc', 'physSampleActualDateDeliveredPp');
    patchDateFunc('techDesignReviewDatePpDateApprovedOnUtc', 'techDesignReviewDatePpDateApproved');
    patchDateFunc('samplesDeliveredToCustomerPpDateDeliveredOnUtc',
      'samplesDeliveredToCustomerPpDateDelivered');
    patchDateFunc('sampleDueDateOnUtc', 'sampleDueDate');
    // patchDateFunc('blanksDeliveredToArtDeptOnUtc', 'blanksDeliveredToArtDept');
    patchDateFunc('blanksReceivedIntoArtDeptOnUtc', 'blanksReceivedIntoArtDept');
    patchDateFunc('blanksReturnedOnUtc', 'blanksReturned');
    patchDateFunc('artRequestedOnUtc', 'artRequested');
    patchDateFunc('qcSampleDateOnUtc', 'qcSampleDate');
    patchDateFunc('dateSentToCustomerOnUtc', 'dateSentToCustomer');
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    let firstCaseList = [
      // 'blanksDeliveredToArtDeptFromOnUtc',
      // 'blanksDeliveredToArtDeptToOnUtc'
    ];
    let secondCaseList = [
      // 'sampleDueDateFromOnUtc',
      // 'sampleDueDateToOnUtc'
    ];
    let thirdCaseList = [
      // 'sampleShipDateFromOnUtc',
      // 'sampleShipDateToOnUtc'
    ];
    if (key === 'sampleDueDateOnUtc') {
      let status = !this.approvalProcessIncludes('No Sample Needed');
      frm.get('formRequires').value[key].required = status;
      return status;
    } else if (key === 'firstCase') {
      let status = false;
      firstCaseList.forEach((cas) => status = status || !!frm.get(cas).value);
      firstCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else if (key === 'secondCase') {
      let status = false;
      secondCaseList.forEach((cas) => status = status || !!frm.get(cas).value);
      secondCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else if (key === 'thirdCase') {
      let status = false;
      thirdCaseList.forEach((cas) => status = status || !!frm.get(cas).value);
      thirdCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else if (key === 'factoryName') {
      // item type = (outsource | imports)
      let status = frm.get('itemType').value === 2 || frm.get('itemType').value === 3;
      frm.get('formRequires').value['factoryName'].required = status;
      return status;
    } else {
      return false;
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
    this.configDateOptions(prop, utcDate.jsdate);
    // Update status for form control whose value changed
    this.frm.get(prop).markAsDirty();
  }

  /**
   * Convert Date to IMyDate & Reconfig date options
   * @param prop
   * @param utcDate
   */
  public configDateOptions(prop: string, utcDate: Date): void {
    // empty
  }

  public onSaved(frm: FormGroup): void {
    if (frm.invalid || this.sizesValidateInvalid()) {
      this._commonService.markAsDirtyForm(frm);
      this._changeDetectorRef.markForCheck();
      return;
    }
    // if (!this.approvalProcessIncludes('Send To Customer') &&
    //   this.frm.get('customerSampleQty')) {
    //   this.frm.get('customerSampleQty').setValue('');
    // }
    if (!this.approvalProcessIncludes('Send To Customer') &&
      this.frm.get('customerSampleSizes')) {
      this.frm.setControl('customerSampleSizes', this._fb.array([]));
    }
    this.myDatePickerService.addTimeToDateArray(frm, [
      'sampleDueDateOnUtc',
      'treatmentSampleDateOnUtc',
      'treatmentApprovalOnUtc',
      'treatmentProductionDateOnUtc',
      'physSampleExFactoryDatePpOnUtc',
      'physSampleExFactoryDatePpToTestingFacilityOnUtc',
      'physSampleDeliveredToTestingFacilityPpOnUtc',
      'physSampleApprovedByTestingFacilityPpOnUtc',
      'physSampleActualDateDeliveredPpOnUtc',
      'techDesignReviewDatePpDateApprovedOnUtc',
      'samplesDeliveredToCustomerPpDateDeliveredOnUtc',
      // 'blanksDeliveredToArtDeptOnUtc',
      'blanksReceivedIntoArtDeptOnUtc',
      'blanksReturnedOnUtc',
      'artRequestedOnUtc',
      'qcSampleDateOnUtc',
      'dateSentToCustomerOnUtc'
    ]);
    // remove blank row
    this.printLocations.controls.forEach((p) => {
      _.remove((p.get('pmsColors') as FormArray).controls, (color) =>
        !color.get('pmsName').value &&
        !color.get('mesh').value &&
        color.get('type').value === '');
      p.get('pmsColors').updateValueAndValidity();
      this._changeDetectorRef.markForCheck();
    });
    this._sampleService
      .updateSampleDetail(this.orderIndex.styleId, frm.value)
      .subscribe((resp: ResponseMessage<SampleDetail>) => {
        if (resp.status) {
          // itemType not change
          resp.data.itemType = this.sampleDetail.itemType;
          Object.assign(this.sampleDetail, resp.data);
          this.updateForm(this.sampleDetail);
          this.preSampleData = _.cloneDeep(this.frm.getRawValue());
          // ------------------------------------------------------------
          this._toastrService.success(resp.message, 'Success');
          // revalidate before publish
          if (this._salesOrderService.hasErBeforePublish) {
            this._salesOrderService.reValidate(this.orderIndex.orderId);
          }
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
        // NProgress.done();
      });
  }

  public approvalProcessIncludes(value: string): boolean {
    if (!this.frm || !this.frm.get('approvalTypeNames')) {
      return false;
    }
    let apList = this.frm.get('approvalTypeNames').value;
    if (!apList || !apList.length) {
      return false;
    }
    return apList.indexOf(value) > -1;
  }

  public selectRadio(value: number, frm: FormControl) {
    if (this.isPageReadOnly || this.isStyleReadOnly
      || this.isStyleCancelled || this.isOrderArchived
      || this.isOrderCancelled || this.isNonAdminArtManagerArtist) {
      return;
    }
    frm.get('type').setValue(value);
  }

  public uploadImage(i: number) {
    let frm = this.printLocations.controls[i];
    // Start upload avatar
    if (!this.uploader.queue.length || !frm) {
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
          relativeUrl: res.data.relativeUrl,
          absoluteUrl: res.data.absoluteUrl
        });
        frm.get('absoluteUrl')
          .markAsDirty();
        frm.get('absoluteUrl')
          .markAsTouched();
        // Clear uploaded item in uploader
        this.uploader.clearQueue();
      } else {
        this.uploader.clearQueue();
        let inputFile = document.getElementById('locationInputFile' + i) as HTMLInputElement;
        if (inputFile) {
          inputFile.value = '';
        }
        this._toastrService.error(res.errorMessages, 'Error');
      }
      this._changeDetectorRef.markForCheck();
    };
  }

  public removeImage(frm: FormGroup) {
    frm.patchValue({
      relativeUrl: '',
      absoluteUrl: ''
    });
    frm.get('relativeUrl').markAsDirty();
    frm.get('relativeUrl').markAsTouched();
  }

  public backupData(): void {
    let data = Object.assign({}, this.frm.value);
    this._localStorageService.set('backupData', data);
  }

  public revertData(): void {
    let tFrm = this._localStorageService.get('backupData');
    this.frm
      .patchValue(tFrm);
    this.backupData();
  }

  public onCancel(): void {
    let previousRoute: string = this._utilService.previousRouteUrl;
    if (previousRoute) {
      this._router.navigate([previousRoute]);
    } else {
      this._router.navigate(['order-log-v2', this.orderIndex.orderId]);
    }
  }

  public openModal(index?: number): void {
    let modalRef = this._modalService.open(JobChangeComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static'
    });
    modalRef.componentInstance.styleId = this.orderIndex.styleId;
    modalRef.componentInstance.locationList = this.locationList;
    if (!isNaN(index) && this.jobChangeList[index]) {
      modalRef.componentInstance.jobChangeOrigin = this.jobChangeList[index];
    } else {
      modalRef.componentInstance.jobChangeOrigin = {
        createdOnUtc: new Date(),
        changeJobId: null,
        changeJobName: null,
        printLocationId: null,
        locationName: '',
        comment: '',
        processTime: 0
      };
    }

    modalRef.result.then((res) => {
      if (res && res.newChange) {
        this.jobChangeList.unshift(res.newChange);
        if (res.isCleanBin) {
          this.frm.get('sampleBinId').patchValue('');
          this.frm.get('sampleBinName').patchValue('');
        }
      } else if (res && res.updateChange) {
        this.jobChangeList[index] = res.updateChange;
      }
      this._changeDetectorRef.markForCheck();
    }, (err) => {
      // empty
    });
  }

  public deleteJobChange(index: number) {
    let modalRef = this._modalService.open(ConfirmDialogComponent, {
      keyboard: true
    });
    modalRef.componentInstance.message = 'Are you sure you want to delete change ' +
      this.jobChangeList[index].changeJobName + ' ?';
    modalRef.componentInstance.title = 'Confirm Change Deletion';

    modalRef.result.then((res: boolean) => {
      if (res) {
        this._sampleService.deleteJobChange(this.orderIndex.styleId, this.jobChangeList[index].id)
          .subscribe((resp: BasicResponse) => {
            if (resp.status) {
              this._toastrService.success(resp.message, 'Success');
              this.jobChangeList.splice(index, 1);
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
            this._changeDetectorRef.markForCheck();
          });
      }
    });
  }

  public minToTimeString(min: number, isTotal?: boolean) {
    let duration = moment.duration(min, 'minutes');
    if (duration.asMilliseconds() === 0) {
      return '00:00';
    }
    let hours = (Math.floor(duration.asMilliseconds() / 3600000)).toString();
    let minutes = duration.minutes().toString();
    if (Number(hours) < 10) {
      hours = '0' + hours;
    }
    if (Number(minutes) < 10) {
      minutes = '0' + minutes;
    }
    if (isTotal) {
      return hours + ' hr ' + minutes + ' min';
    }
    return hours + ':' + minutes;
  }

  public totalTime() {
    let total = 0;
    this.jobChangeList.forEach((p) => {
      total += p.processTime;
    });
    return this.minToTimeString(total, true);
  }

  public copySeq(printLocation) {
    const copySeq = () => this._sampleService.copySeq(this.orderIndex.styleId,
      printLocation.get('printLocationId').value)
      .subscribe((resp: ResponseMessage<Color[]>) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
          printLocation.setControl('pmsColors', this.toPmsColorsFormArray(resp.data));
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    if (printLocation.get('pmsColors').controls.length >= 2 ||
      (printLocation.get('pmsColors').controls.length === 1 &&
        (printLocation.get('pmsColors').controls[0].get('pmsName').value ||
          printLocation.get('pmsColors').controls[0].get('mesh').value ||
          printLocation.get('pmsColors').controls[0].get('type').value !== ''))) {
      let modalRef = this._modalService.open(ConfirmDialogComponent, {
        keyboard: true
      });
      modalRef.componentInstance.message =
        'Are you sure you want to copy all PRE sequence information for this print location?';
      modalRef.componentInstance.title = 'Confirm Copy';

      modalRef.result.then((res: boolean) => {
        if (res) {
          copySeq();
        }
      });
    } else {
      copySeq();
    }
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
        let index = Number(item.getAttribute('index'));
        if (!isNaN(index)) {
          this.uploadImage(index);
        }
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

  public dateToString(date: string) {
    // remove time from utcdatetime
    return date ? date.slice(0, 10) : '';
  }

  public onFocus(event) {
    this.inputOldValue = event.target.value;
    event.target.select();
  }

  public onKeyUp(event) {
    this.sizesValidateInvalid();
    let e = <KeyboardEvent> event;
    if (e.keyCode === 27) {
      event.preventDefault();
      event.target.value = this.inputOldValue;
      return;
    }
    if (e.keyCode === 39 && e.code === 'ArrowRight'
      || e.keyCode === 40 && e.code === 'ArrowDown'
      || e.keyCode === 13) {
      let nextInput;
      if (event.target.parentNode // td
        && event.target.parentNode.nextSibling // next td
        && event.target.parentNode.nextSibling.firstElementChild) {
        nextInput = event.target.parentNode.nextSibling.firstElementChild;
      }
      if (nextInput && nextInput.tagName === 'INPUT') {
        nextInput.focus();
      }
    } else if (e.keyCode === 37 && e.code === 'ArrowLeft'
      || e.keyCode === 38 && e.code === 'ArrowUp') {
      let preInput;
      if (event.target.parentNode // td
        && event.target.parentNode.previousSibling // previous td
        && event.target.parentNode.previousSibling.firstElementChild) {
        preInput = event.target.parentNode.previousSibling.firstElementChild;
      }
      if (preInput && preInput.tagName === 'INPUT') {
        preInput.focus();
      }
    }
  }

  public onBlur(event, size: FormControl) {
    if (event.target && !/^\d+$/.test(event.target.value)) {
      size.get('qty').patchValue(0);
    }
  }

  public numberInRange(min: number, max: number) {
    return (input: FormControl) => {
      if (!input.value && input.value !== 0) {
        return null;
      }
      if (input.value < min || input.value > max) {
        // hasError invalidValue true
        return {invalidValue: true};
      }
      return null;
    };
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  public onAppScroll(event) {
    if (event.type === 'resize') {
      if (this._utilService.scrollElm &&
        this._utilService.scrollElm.scrollHeight - (this._utilService.scrollElm.scrollTop
          + window.innerHeight) < 195) {
        this.isShowStickyBtn = false;
        this._changeDetectorRef.markForCheck();
      } else if (this._utilService.scrollElm) {
        this.isShowStickyBtn = true;
        this._changeDetectorRef.markForCheck();
      }
      return;
    }
    if (event.target.scrollingElement.scrollHeight - (event.target.scrollingElement
        .scrollTop + window.innerHeight) < 195) {
      this.isShowStickyBtn = false;
      this._changeDetectorRef.markForCheck();
    } else {
      this.isShowStickyBtn = true;
      this._changeDetectorRef.markForCheck();
    }
  }

  public ngOnDestroy(): void {
    this.subRouter.unsubscribe();
    this.subDragulaService.unsubscribe();
    if (this.printLocations && this.printLocations.controls.length) {
      this.printLocations.controls.forEach((ctrl, index) => {
        if (this._dragulaService.find('bag-' + index)) {
          this._dragulaService.destroy('bag-' + index);
        }
      });
    }
    this._subOrderStatus.unsubscribe();
    this._subOrderData.unsubscribe();
    this._subStyleStatus.unsubscribe();
  }
}
