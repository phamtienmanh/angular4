import {
  Component,
  ViewEncapsulation,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import {
  Validators,
  FormGroup,
  FormControl,
  FormBuilder,
  FormArray
} from '@angular/forms';

// 3rd modules
import {
  NgSelectComponent
} from '@ng-select/ng-select';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  ValidationService
} from '../../../../shared/services/validation';
import {
  Util
} from '../../../../shared/services/util';
import {
  MyDatePickerService
} from '../../../../shared/services/my-date-picker';
import {
  CommonService
} from '../../../../shared/services/common';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import * as _ from 'lodash';
import {
  ProductInfoService
} from '../../+product-info/product-info.service';
import {
  ExtraValidators
} from '../../../../shared/services/validation';

// Validators

// Interfaces
import {
  ResponseMessage
} from '../../../../shared/models';
import { FilterType } from '../../../projects.model';
import { Subject } from 'rxjs/Subject';
import { ColumnsTypeProject } from '../../products-main.model';
import { ItemTypes } from '../../../+sales-order/+order-styles/order-styles.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'products-main-filter',  // <forgot-password></forgot-password>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'products-main-filter.template.html',
  styleUrls: [
    'products-main-filter.style.scss'
  ]
})
export class ProductsMainFilterComponent implements OnInit, OnChanges, OnDestroy {
  @Output()
  public onFilter = new EventEmitter<any>();
  @Output()
  public onUpdateFilter = new EventEmitter<any>();

  public frm: FormGroup;
  public formErrors = {
    projectName: '',
    productName: '',
    factoryId: '',
    retailerName: '',
    licensorId: '',
    licenseeId: '',
    colsName: ''
  };
  public validationMessages = {
    default: {
      pattern: 'Date is not valid',
      required: 'This is required.'
    }
  };

  public factoryData: any = [];
  public licensorData: any = [];
  public licenseeData: any = [];

  public listColumnName = _.sortBy(ColumnsTypeProject, 'name');
  public listColumnStatus = [];

  public colNameData = [];
  public searchedObj = {};

  constructor(private _toastrService: ToastrService,
              private _commonService: CommonService,
              private _utilService: Util,
              private _fb: FormBuilder,
              private _validationService: ValidationService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _productInfoService: ProductInfoService,
              private _localStorageService: LocalStorageService,
              public myDatePickerService: MyDatePickerService) {
    window.onbeforeunload = () => {
      this.ngOnDestroy();
    };
  }

  public ngOnInit(): void {
    this.buildForm();
    this.getCommonData();
    // Config filter
    let filterStore = this._localStorageService.get('Products_FilterModel') as any;
    if (filterStore) {
      if (this.frm) {
        delete filterStore['formRequires'];
        this.frm.patchValue(filterStore);
        if (filterStore.colsName && filterStore.colsName.length) {
          this.setColsName(filterStore.colsName);
        } else {
          this.addColName();
        }
        this.listColumnNameFilter();
        this.searchedObj = {...this.frm.value};
        this.onUpdateFilter.emit({
          filter: this.getFilterParam(),
          status: this.getStatusFilter()
        });
        this._changeDetectorRef.markForCheck();
      }
    } else {
      this.addColName();
      this.listColumnNameFilter();
      this.searchedObj = {...this.frm.value};
      this.onUpdateFilter.emit({
        filter: this.getFilterParam(),
        status: this.getStatusFilter()
      });
    }
    // --------------
  }

  public ngOnChanges(changes: SimpleChanges): void {
    // empty
  }

  public buildForm(): void {
    let controlConfig = {
      projectName: new FormControl(null),
      productName: new FormControl(null),
      factoryId: new FormControl(null),
      retailerName: new FormControl(null),
      customerName: new FormControl(null),
      licensorId: new FormControl(null),
      licenseeId: new FormControl(null),
      colsName: this._fb.array([]),
      formRequires: new FormControl({
        projectName: {
          required: false
        },
        productName: {
          required: false
        },
        factoryId: {
          required: false
        },
        retailerName: {
          required: false
        },
        customerName: {
          required: false
        },
        licensorId: {
          required: false
        },
        licenseeId: {
          required: false
        }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);
    this.addColName();
    this.onValueChanged(); // (re)set validation messages now
  }

  public get colsName(): FormArray {
    return this.frm.get('colsName') as FormArray;
  }

  public setColsName(colsName: any[]) {
    let colsNameFGs = [];
    colsName.forEach((colName, index) => {
      let colsNameFrm = this._validationService.buildForm({
        id: new FormControl(colName.id),
        name: new FormControl(colName.name),
        status: new FormControl(colName.status, [
          Validators.compose([
            ExtraValidators.conditional(
              (group) => this.getSpecialRequireCase(group, 'status'),
              Validators.compose([
                Validators.required
              ])
            )
          ])
        ]),
        formRequires: new FormControl({
          status: {
            required: false
          }
        })
      }, {}, {});
      colsNameFGs.push(colsNameFrm);
    });
    const colsNameFormArray = this._fb.array(colsNameFGs);
    this.frm.setControl('colsName', colsNameFormArray);
    this.frm.get('colsName').updateValueAndValidity();
  }

  public addColName() {
    if (this.colsName.invalid) {
      this.frm.get('colsName').updateValueAndValidity();
      return;
    }
    this.colsName.push(this._validationService.buildForm({
      id: new FormControl(null),
      name: new FormControl(null),
      status: new FormControl([], [
        Validators.compose([
          ExtraValidators.conditional(
            (group) => this.getSpecialRequireCase(group, 'status'),
            Validators.compose([
              Validators.required
            ])
          )
        ])
      ]),
      formRequires: new FormControl({
        status: {
          required: false
        }
      })
    }, {}, {}));
    this.listColumnNameFilter();
  }

  public listColumnNameFilter() {
    let selectedIds = this.colsName.value.map((col) => col.id);
    this.colNameData = this.listColumnName.filter((s) => !selectedIds.includes(s.id));
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

  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    if (key === 'status') {
      let status = !!frm.get('id').value;
      frm.get('formRequires').value[key].required = status;
      return status;
    } else {
      return false;
    }
  }

  public getFilterModel(): any {
    const model = this.frm.getRawValue();
    delete model['formRequires'];
    return model;
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): Promise<boolean> {
    const initStreamNum = 3;
    let streamThread = new Subject<boolean>();
    this._productInfoService.getAllFactories()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.factoryData = resp.data.data;
          streamThread.next(true);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._commonService.getLicensorList()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.licensorData = resp.data;
          streamThread.next(true);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._commonService.getLicenseeList()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.licenseeData = resp.data;
          streamThread.next(true);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    return new Promise((resolve, reject) => {
      let doneStreamNum = 0;
      streamThread.subscribe((isDone: boolean) => {
        if (isDone) {
          doneStreamNum++;
        }
        if (doneStreamNum === initStreamNum) {
          this._changeDetectorRef.markForCheck();
          resolve(true);
        }
      });
    });
  }

  public onChangeColName(e, frm): void {
    frm.get('status').patchValue([]);
    if (e) {
      frm.get('name').patchValue(e.name);
      this.listColumnStatus = e['listStatus'];
    }
  }

  public toStatusString(status: any[]) {
    return status.map((s) => s.name).join(', ');
  }

  public removeStatus(index: number) {
    this.colsName.removeAt(index);
    this.listColumnNameFilter();
  }

  /**
   * Get filter value
   * @returns {string}
   */
  public getFilterParam(): string {
    let filterParam = [
      {
        filterType: FilterType.ProjectName.toString(),
        value: this.frm.get('projectName').value || ''
      },
      {
        filterType: FilterType.ProductDescription.toString(),
        value: this.frm.get('productName').value || ''
      },
      {
        filterType: FilterType.FactoryId.toString(),
        value: this.frm.get('factoryId').value || ''
      },
      {
        filterType: FilterType.RetailerName.toString(),
        value: this.frm.get('retailerName').value || ''
      },
      // {
      //   filterType: FilterType.Customer.toString(),
      //   value: this.frm.get('customerName').value || ''
      // },
      {
        filterType: FilterType.LicensorId.toString(),
        value: this.frm.get('licensorId').value || ''
      },
      {
        filterType: FilterType.LicenseeId.toString(),
        value: this.frm.get('licenseeId').value || ''
      }
    ];
    return JSON.stringify(filterParam);
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public getStatusFilter(): string {
    let status = [];
    this.frm.get('colsName').value.forEach((col) => {
      if (col.id) {
        status.push({
          type: col.id,
          status: col.status.map((s) => s.id).join(',')
        });
      }
    });
    return JSON.stringify(status);
  }

  public onKeyup(event): void {
    let e = <KeyboardEvent> event;
    if (e.keyCode === 13 && e.key === 'Enter') {
      this.filter();
    }
  }

  public onSelectOpen(select: NgSelectComponent): void {
    if (!select.multiple && select.selectedItems && select.selectedItems.length) {
      let filterVal = select.selectedItems[0].label;
      select.filterValue = filterVal ? filterVal : '';
    }
  }

  /**
   * Fire filter event
   */
  public filter(): void {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
      return;
    }
    this._localStorageService.set('Products_FilterModel',
      this.getFilterModel());
    this.onFilter.emit({
      filter: this.getFilterParam(),
      status: this.getStatusFilter()
    });
    this.searchedObj = {...this.frm.value};
  }

  public ngOnDestroy(): void {
    const lastColsName = this.colsName.value[this.colsName.length - 1];
    if (lastColsName.id !== null) {
      if (!lastColsName.status.length) {
        this.removeStatus(this.colsName.length - 1);
      }
      this.addColName();
    }
    if (this.frm.valid) {
      this._localStorageService.set('Products_FilterModel',
        this.getFilterModel());
    }
  }
}
