import {
  Component,
  OnInit,
  ViewEncapsulation,
  AfterViewInit,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';

// Services
import {
  FactoryManagementService
} from '../factory-management.service';
import {
  AuthService
} from '../../shared/services/auth/auth.service';
import {
  Util
} from '../../shared/services/util/util.service';
import {
  ValidationService
} from '../../shared/services/validation/validation.service';
import { CommonService } from '../../shared/services/common/common.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProgressService } from '../../shared/services/progress';

// Interfaces
import {
  BasicGeneralInfo,
  ResponseMessage
} from '../../shared/models';
import {
  Factory,
  ItemTypeList,
  ItemTypes
} from '../factory-management.model';
import {
  SelectCategoriesComponent
} from './modules';

// Components

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'factory-detail',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'factory-detail.template.html',
  styleUrls: [
    'factory-detail.style.scss'
  ]
})
export class FactoryDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  public isShowStickyBtn = false;
  public isPageReadOnly = false;
  public activatedSub: Subscription;
  public factoryDetail: any;
  public preFactoryData: any;
  public listFactoryType: BasicGeneralInfo[] = [];
  public frm: FormGroup;
  public formErrors = {};
  public validationMessages = {
    name: {required: 'Factory Name is required.'},
    countryId: {required: 'Country is required.'},
    embellishmentTypes: {required: 'Types is required.'},
    type: {required: 'Mode is required.'},
    minTime: {required: 'Min Lead Time must be smaller than Max Lead Time.'},
    maxTime: {required: 'Max Lead Time must be bigger than Min Lead Time.'}
  };
  public itemTypeList = ItemTypeList;
  public itemTypes = ItemTypes;
  public countryList = [];
  public tabs = [];
  public isChangeCategory = false;

  constructor(private _router: Router,
              private _fb: FormBuilder,
              private _activatedRoute: ActivatedRoute,
              private _progressService: ProgressService,
              private _breadcrumbService: BreadcrumbService,
              private _utilService: Util,
              private _toastrService: ToastrService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _validationService: ValidationService,
              private _factoryManagementService: FactoryManagementService,
              private _commonService: CommonService,
              private _modalService: NgbModal,
              private _authService: AuthService) {}

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Factories');
    this.getCommonData();
    this.activatedSub = this._activatedRoute.params
      .subscribe((params: { id: number }) => {
        let id = Number(params.id);
        this.initConfig(id);
      });
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      if (this._utilService.scrollElm) {
        this.isShowStickyBtn = this._utilService.scrollElm
          .scrollHeight - window.innerHeight > 10;
        this._changeDetectorRef.markForCheck();
      }
    }, 1000);
  }

  public initConfig(id) {
    this.buildForm();
    if (isNaN(id)) {
      // add new
      this._breadcrumbService
        .addFriendlyNameForRoute('/factory-management/new-factory', 'New Factory');
    } else {
      // edit
      this._factoryManagementService.getFactory(id)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            if (resp.data.type === 0) {
              resp.data.type = null;
            }
            this.factoryDetail = resp.data;
            this.frm.patchValue(this.factoryDetail);
            if (!this.factoryDetail.categories || !this.factoryDetail.categories.length) {
              this.addCategories();
            } else {
              this.setCategories(this.factoryDetail.categories);
            }
            if (!this.currentActivatedCategory
              && this.frm.get('type').value === this.itemTypes.IMPORTS) {
              this.categories.controls[this.firstCategoryIndex].get('isActive').patchValue(true);
            }
            setTimeout(() => {
              this.preFactoryData = _.cloneDeep(this.frm.getRawValue());
            });
            this._breadcrumbService
              .addCallbackForRouteRegex('/factory-management/' + id,
                () => this.factoryDetail.name);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          this._changeDetectorRef.markForCheck();
        });
    }
  }

  public getCommonData() {
    this._factoryManagementService.getListFactoryType()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
        if (resp.status) {
          this.listFactoryType = resp.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
    this._commonService.getCountryList()
      .subscribe((resp: ResponseMessage<BasicGeneralInfo[]>): void => {
        if (resp.status) {
          this.countryList = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
  }

  public buildForm(): void {
    let controlConfig = {
      id: new FormControl(0),
      isActive: new FormControl(true),
      name: new FormControl('', Validators.required),
      countryId: new FormControl(null),
      countryName: new FormControl(''),
      embellishmentTypes: new FormControl([]),
      type: new FormControl(null),
      categories: this._fb.array([]),
      formRequires: new FormControl({
        name: {required: true},
        countryId: {required: false},
        embellishmentTypes: {required: false},
        type: {required: false}
      })
    };

    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);

    this.frm.get('type').valueChanges.subscribe((i) => {
      this.refreshLeadTimePanel(false);
      this.ngAfterViewInit();
    });
  }

  public refreshLeadTimePanel(isScroll = true): void {
    this.isChangeCategory = true;
    this._progressService.start();
    setTimeout(() => {
      this.isChangeCategory = false;
      this._progressService.done();
      if (isScroll) {
        this.scrollTo(this._utilService.scrollElm, 350, 100);
      }
      this._changeDetectorRef.markForCheck();
    }, 100);
    this._changeDetectorRef.markForCheck();
  }

  public get categories(): FormArray {
    return this.frm.get('categories') as FormArray;
  };

  public setCategories(categories: any[]) {
    const fGs = categories.map((category: any) => this._validationService.buildForm({
      id: new FormControl(category.id),
      categoryId: new FormControl(category.categoryId),
      categoryName: new FormControl(category.categoryName),
      isActive: new FormControl(category.isActive),
      poIssueDueOwsTechPackReady: new FormControl(category.poIssueDueOwsTechPackReady),
      artRequested: new FormControl(category.artRequested),
      artReceived: new FormControl(category.artReceived),
      artReleased: new FormControl(category.artReleased),
      // import
      fabricQualityDue: new FormControl(category.fabricQualityDue),
      labDipDue: new FormControl(category.labDipDue),
      fitSampleDue: new FormControl(category.fitSampleDue),
      bulkFabric: new FormControl(category.bulkFabric),
      strikeOffKnitDownDue: new FormControl(category.strikeOffKnitDownDue),
      ppSampleDue: new FormControl(category.ppSampleDue),
      etaTsc: new FormControl(category.etaTsc),
      // 5 Sample Lead Times
      sampleLeadTimePrintOnly: new FormControl(category.sampleLeadTimePrintOnly),
      sampleLeadTimeWashTreatment: new FormControl(category.sampleLeadTimeWashTreatment),
      sampleLeadTimeWashTreatmentPrint: new FormControl(category.sampleLeadTimeWashTreatmentPrint),
      sampleLeadTimeEmbroidery: new FormControl(category.sampleLeadTimeEmbroidery),
      sampleLeadTimePatches: new FormControl(category.sampleLeadTimePatches),
      // end
      trimSubmitsDue: new FormControl(category.trimSubmitsDue),
      physSampleExFactoryDatePp: new FormControl(category.physSampleExFactoryDatePp),
      physSampleDeliveredPp: new FormControl(category.physSampleDeliveredPp),
      qcSampleShipDatePp: new FormControl(category.qcSampleShipDatePp),
      physSampleApprovedPp: new FormControl(category.physSampleApprovedPp),
      // 5 Production Lead times
      productionLeadTimePrintOnly: new FormControl(category.productionLeadTimePrintOnly),
      productionLeadTimeWashTreatment: new FormControl(category.productionLeadTimeWashTreatment),
      productionLeadTimeWashTreatmentPrint:
        new FormControl(category.productionLeadTimeWashTreatmentPrint),
      productionLeadTimeEmbroidery: new FormControl(category.productionLeadTimeEmbroidery),
      productionLeadTimePatches: new FormControl(category.productionLeadTimePatches),
      // end
      factoryPackingListCiXFactoryDate: new FormControl(category.factoryPackingListCiXFactoryDate),
      readyToShip3Pl: new FormControl(category.readyToShip3Pl),
      tscPresentationDate: new FormControl(category.tscPresentationDate),
      tscConceptBoardsForSelection: new FormControl(category.tscConceptBoardsForSelection),
      licensorSelectionWoConceptApproval:
        new FormControl(category.licensorSelectionWoConceptApproval),
      licensingApproval: new FormControl(category.licensingApproval),
      techDesignReviewDatePp: new FormControl(category.techDesignReviewDatePp)
    }, {}, {}));
    const formArray = this._fb.array(fGs);
    this.frm.setControl('categories', formArray);
  }

  public addCategories() {
    this.categories.push(this._validationService.buildForm({
      id: new FormControl(''),
      categoryId: new FormControl(''),
      categoryName: new FormControl(''),
      isActive: new FormControl(''),
      poIssueDueOwsTechPackReady: new FormControl(''),
      artRequested: new FormControl(''),
      artReceived: new FormControl(''),
      artReleased: new FormControl(''),
      // import
      fabricQualityDue: new FormControl(''),
      labDipDue: new FormControl(''),
      fitSampleDue: new FormControl(''),
      bulkFabric: new FormControl(''),
      strikeOffKnitDownDue: new FormControl(''),
      ppSampleDue: new FormControl(''),
      etaTsc: new FormControl(''),
      // 5 Sample Lead Times
      sampleLeadTimePrintOnly: new FormControl(''),
      sampleLeadTimeWashTreatment: new FormControl(''),
      sampleLeadTimeWashTreatmentPrint: new FormControl(''),
      sampleLeadTimeEmbroidery: new FormControl(''),
      sampleLeadTimePatches: new FormControl(''),
      // end
      trimSubmitsDue: new FormControl(''),
      physSampleExFactoryDatePp: new FormControl(''),
      physSampleDeliveredPp: new FormControl(''),
      qcSampleShipDatePp: new FormControl(''),
      physSampleApprovedPp: new FormControl(''),
      // 5 Production Lead times
      productionLeadTimePrintOnly: new FormControl(''),
      productionLeadTimeWashTreatment: new FormControl(''),
      productionLeadTimeWashTreatmentPrint: new FormControl(''),
      productionLeadTimeEmbroidery: new FormControl(''),
      productionLeadTimePatches: new FormControl(''),
      // end
      factoryPackingListCiXFactoryDate: new FormControl(''),
      readyToShip3Pl: new FormControl(''),
      tscPresentationDate: new FormControl(''),
      tscConceptBoardsForSelection: new FormControl(''),
      licensorSelectionWoConceptApproval: new FormControl(''),
      licensingApproval: new FormControl(''),
      techDesignReviewDatePp: new FormControl(''),
      productionDue: new FormControl('')
    }, {}, {}));
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public onSelectItem(val, valProp: string, formControlName: string): void {
    if (val[valProp]) {
      this.frm.get(formControlName).patchValue(val[valProp]);
    } else {
      // add new
      this.frm.get(formControlName).patchValue(val);
    }
  }

  public switchTab(event: Event, index: number): void {
    let i = 0;
    while (i < this.categories.length) {
      this.categories.controls[i].get('isActive').patchValue(false);
      i++;
    }
    this.categories.controls[index].get('isActive').patchValue(true);
    this.refreshLeadTimePanel();
  }

  public trackByFn(index, item) {
    return index; // or item.id
  }

  public get typesString(): string {
    const typeArr = this.listFactoryType
      .filter((i) => this.frm.get('embellishmentTypes').value.indexOf(i.id) > -1);
    if (typeArr && typeArr.length) {
      return typeArr.map((i) => i.name).join(', ');
    } else {
      return '';
    }
  }

  public get currentActivatedCategory(): any {
    return this.categories.value.find((i) => i.categoryId && i.isActive);
  }

  public get currentActivatedCategoryIndex(): number {
    const index = this.categories.value.findIndex((i) => i.categoryId && i.isActive);
    const nullId = this.categories.value.findIndex((i) => !i.categoryId);
    return index > -1 && this.frm.get('type').value === this.itemTypes.IMPORTS
      ? index : nullId > -1 ? nullId : 0;
  }

  public get firstCategoryIndex(): number {
    const index = this.categories.value.findIndex((i) => i.categoryId);
    return index > -1 ? index : 0;
  }

  public get firstNotCategoryIndex(): number {
    const index = this.categories.value.findIndex((i) => !i.categoryId);
    return index > -1 ? index : 0;
  }

  /**
   * selectTrims
   */
  public selectCategories(): void {
    let modalRef = this._modalService.open(SelectCategoriesComponent, {
      size: 'lg',
      keyboard: true,
      backdrop: 'static',
      windowClass: 'eta-sm'
    });
    modalRef.componentInstance.categoriesList =
      _.cloneDeep(this.categories.value).filter((o) => o.categoryId);
    modalRef.result.then((res) => {
      if (res.status) {
        const categoriesList = _.orderBy(res.categoriesList, ['name'], ['asc']);
        this.setCategories([
          this.categories.value[this.firstNotCategoryIndex],
          ...categoriesList
        ]);
        if (!this.currentActivatedCategory
          && this.frm.get('type').value === this.itemTypes.IMPORTS) {
          this.categories.controls[this.firstCategoryIndex].get('isActive').patchValue(true);
        }
        this.refreshLeadTimePanel();
      }
    });
  }

  public scrollTo(element: any, to: number, duration: number) {
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

  /**
   * onSubmit
   */
  public onSaved() {
    if (this.frm.invalid) {
      return;
    }
    if (!this.frm.get('type').value) {
      this.frm.get('type').setValue(0);
    }
    if (!this.frm.get('id').value) {
      this._factoryManagementService.createFactory(this.frm.value)
        .subscribe((resp: ResponseMessage<Factory>) => {
          if (resp.status) {
            this._toastrService.success(resp.message, 'Success');
            this._router.navigate([
              'factory-management',
              resp.data.id
            ]);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    } else {
      this._factoryManagementService.updateFactory(this.frm.value)
        .subscribe((resp: ResponseMessage<Factory>) => {
          if (resp.status) {
            this._toastrService.success(resp.message, 'Success');
            if (resp.data.type === 0) {
              resp.data.type = null;
            }
            this.factoryDetail = resp.data;
            this.frm.patchValue(this.factoryDetail);
            setTimeout(() => {
              this.preFactoryData = _.cloneDeep(this.frm.getRawValue());
            });
            this._breadcrumbService
              .addCallbackForRouteRegex('/factory-management/' + resp.data.id,
                () => this.factoryDetail.name);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  public onAppScroll(event: any) {
    if (event.type === 'resize') {
      if (this._utilService.scrollElm &&
        this._utilService.scrollElm.scrollHeight - (this._utilService.scrollElm.scrollTop
          + window.innerHeight) < 10) {
        this.isShowStickyBtn = false;
      } else if (this._utilService.scrollElm) {
        this.isShowStickyBtn = true;
      }
      return;
    }
    if (event.target.scrollingElement.scrollHeight - (event.target.scrollingElement
      .scrollTop + window.innerHeight) < 10) {
      this.isShowStickyBtn = false;
    } else {
      this.isShowStickyBtn = true;
    }
  }

  /**
   * cancel
   */
  public cancel() {
    this._router.navigate(['factory-management']);
  }

  public ngOnDestroy() {
    this.activatedSub.unsubscribe();
  }
}
