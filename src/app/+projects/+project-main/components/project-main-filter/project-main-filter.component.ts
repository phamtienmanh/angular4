import {
  Component,
  ViewEncapsulation,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';

import {
  Validators,
  FormGroup,
  FormControl
} from '@angular/forms';

import {
  Subscription
} from 'rxjs/Subscription';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  Util,
  MyDatePickerService,
  CommonService,
  ValidationService
} from '../../../../shared/services';
import {
  ProjectMainService
} from '../../project-main.service';

// Validators
import {
  MinDate,
  MaxDate
} from '../../../../shared/validators';

// Interfaces
import {
  IMyDate,
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  ResponseMessage,
  BasicCustomerInfo
} from '../../../../shared/models';
import {
  FilterType
} from '../../../projects.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'project-main-filter',  // <forgot-password></forgot-password>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'project-main-filter.template.html',
  styleUrls: [
    'project-main-filter.style.scss'
  ]
})
export class ProjectMainFilterComponent implements OnInit, OnDestroy {
  @Output()
  public onFilter = new EventEmitter<any>();
  @Output()
  public onUpdateFilter = new EventEmitter<any>();
  @ViewChild('customerScroll')
  public customerScroll: any;
  public currentTabScrollX: number;
  public keyword = this._utilService.globalSearch;
  public subscription: Subscription;
  public tabs = [];
  public searchedObj = {};

  public frm: FormGroup;
  public formErrors = {
    projectName: '',
    styleName: '',
    retailerName: '',
    poId: '',
    cancelDateBegin: '',
    cancelDateBeginOnUtc: '',
    cancelDateEnd: '',
    cancelDateEndOnUtc: ''
  };
  public validationMessages = {
    cancelDateBeginOnUtc: {
      maxLength: 'Must be earlier than End Date.'
    },
    cancelDateEndOnUtc: {
      maxLength: 'Must be later than Start Date.'
    },
    default: {
      pattern: 'Date is not valid',
      required: 'This is required.'
    }
  };
  public myDateRangePickerOptions = {
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
  public cancelDateBeginOptions: any = {
    ...this.myDateRangePickerOptions
  };
  public cancelDateEndOptions: any = {
    ...this.myDateRangePickerOptions
  };
  // public projectList = [];

  constructor(private _toastrService: ToastrService,
              private _commonService: CommonService,
              private _utilService: Util,
              private _projectMainService: ProjectMainService,
              private _validationService: ValidationService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _localStorageService: LocalStorageService,
              public myDatePickerService: MyDatePickerService) {
    window.onbeforeunload = () => {
      this.ngOnDestroy();
    };
  }

  public ngOnInit(): void {
    this.getListCustomer();
    this.subscription = this._utilService.onGlobalSearchChange$.subscribe(
      () => {
        this.keyword = this._utilService.globalSearch;
        this.filter();
      });
    this.buildForm();
    this.configFilter();
  }

  public getListCustomer(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._projectMainService.getListCustomer()
        .subscribe((resp: ResponseMessage<BasicCustomerInfo[]>) => {
          resolve(true);
          if (resp.status) {
            if (resp.data.length) {
              let vendorData = [];
              resp.data.forEach((item, index) => {
                if (index === 0) {
                  vendorData.push({
                    id: -1,
                    name: 'All Customers',
                    isActive: false,
                    isView: true
                  });
                }
                vendorData.push({
                  ...item,
                  isActive: false,
                  isView: true
                });
              });
              this.tabs = vendorData;
              this.configNavTabs();
              this._changeDetectorRef.markForCheck();
            }
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    });
  }

  public buildForm(): void {
    let controlConfig = {
      projectName: new FormControl(null),
      styleName: new FormControl(''),
      retailerName: new FormControl(''),
      poId: new FormControl(''),
      cancelDateBegin: new FormControl(''),
      cancelDateBeginOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
          MaxDate('cancelDateEndOnUtc')
        ])
      ]),
      cancelDateEnd: new FormControl(''),
      cancelDateEndOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)'),
          MinDate('cancelDateBeginOnUtc')
        ])
      ]),
      formRequires: new FormControl({
        cancelDateBeginOnUtc: {
          required: false
        },
        cancelDateEndOnUtc: {
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

  public configFilter() {
    let filterStore = this._localStorageService.get('Project_FilterModel') as any;
    if (filterStore) {
      if (this.frm) {
        delete filterStore['formRequires'];
        this.frm.patchValue(filterStore);
        this.setDateValue();
        this.searchedObj = {...this.frm.value};
        this._changeDetectorRef.markForCheck();
      }
    }
    this.onUpdateFilter.emit({
      keyword: this.keyword,
      filter: this.getFilterParam()
    });
  }

  public setDateValue(): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (this.frm.get(importName).value) {
        const currentDate = new Date(this.frm.get(importName).value);
        this.configDateOptions(importName, currentDate);
      } else {
        this.configDateOptions(importName, null);
        this.frm.get(importName).patchValue(null);
        this.frm.get(exportName).patchValue(null);
      }
    };
    patchDateFunc('cancelDateBeginOnUtc', 'cancelDateBegin');
    patchDateFunc('cancelDateEndOnUtc', 'cancelDateEnd');
  }

  public configDateOptions(prop: string, utcDate: Date): void {
    if (!utcDate) {
      switch (prop) {
        case 'cancelDateBeginOnUtc':
          // Config for cancel date options
          this.cancelDateEndOptions = {
            ...this.cancelDateEndOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          this.cancelDateBeginOptions = {
            ...this.cancelDateBeginOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          if (this.frm) {
            this.frm.get('cancelDateEnd').setValue(null);
            this.frm.get('cancelDateEndOnUtc').setValue(null);
          }
          break;
        case 'cancelDateEndOnUtc':
          // Config for start date options
          this.cancelDateBeginOptions = {
            ...this.cancelDateBeginOptions,
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
      case 'cancelDateBeginOnUtc':
        // Config for end date options
        this.cancelDateEndOptions = {
          ...this.cancelDateEndOptions,
          disableUntil: dateCurrentUntil,
          enableDays: []
        };
        break;
      case 'cancelDateEndOnUtc':
        // Config for start date options
        this.cancelDateBeginOptions = {
          ...this.cancelDateBeginOptions,
          disableSince: dateCurrentSince,
          enableDays: []
        };
        break;
      default:
        break;
    }
  }

  public configNavTabs(): void {
    const activatedTab = this.tabs.find((i) => i.name === this.frm.get('retailerName').value);
    if (activatedTab) {
      activatedTab.isActive = true;
    } else {
      this.tabs[0].isActive = true;
    }
    if (this.tabs && this.tabs.length) {
      const projectCurrentCustomer = this._localStorageService
        .get('Project_CurrentCustomer') as any;
      if (projectCurrentCustomer) {
        setTimeout(() => {
          this.customerScroll.scrollTo(projectCurrentCustomer.scrollX, 0);
        });
      }
    }
  }

  public switchTab(index: number): void {
    let prevTabIndex = this.tabs.findIndex((t) => t.isActive);
    this.tabs[prevTabIndex].isActive = false;
    this.tabs[index].isActive = true;
    if (index !== 0) {
      this.frm.get('retailerName').patchValue(this.tabs[index].name);
    } else {
      this.frm.get('retailerName').patchValue('');
    }
    this._localStorageService.set('Project_CurrentCustomer',
      {
        name: this.getCurrentTab().name,
        scrollX: this.currentTabScrollX
      });
    this.filter();
  }

  public getCurrentTab(): any {
    return this.tabs.find((i) => i.isActive);
  }

  public getFilterModel(): any {
    const model = this.frm.getRawValue();
    delete model['formRequires'];
    return model;
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
        filterType: FilterType.CustomerPoId.toString(),
        value: this.frm.get('poId').value || ''
      },
      {
        filterType: FilterType.RetailerName.toString(),
        value: this.frm.get('retailerName').value || ''
      },
      {
        filterType: FilterType.StyleName.toString(),
        value: this.frm.get('styleName').value || ''
      }
    ];
    let dateFilter = [
      {
        type: FilterType.CancelDateFrom,
        prop: 'cancelDateBeginOnUtc'
      },
      {
        type: FilterType.CancelDateTo,
        prop: 'cancelDateEndOnUtc'
      }
    ];
    dateFilter.forEach((filter) => {
      if (this.frm.get(filter.prop).value) {
        filterParam.push({
          filterType: filter.type.toString(),
          value: this.frm.get(filter.prop).value
        });
      }
    });
    return JSON.stringify(filterParam);
  }

  /**
   * Fire date change event with prop
   * @param event
   */
  public onDateChanged(event: IMyDateModel, prop: string) {
    let utcDate = Object.assign({}, event);
    this.frm.get(prop).setValue(utcDate.jsdate ? utcDate.formatted : '');
    const utcDat = utcDate.formatted.split('/');
    const dateCurrentSince = {
      year: +utcDat[2] || 0,
      month: +utcDat[0] || 0,
      day: +utcDat[1] || 0
    };
    const dateCurrentUntil = {
      year: +utcDat[2] || 0,
      month: +utcDat[0] || 0,
      day: +utcDat[1] || 0
    };

    switch (prop) {
      case 'cancelDateBeginOnUtc':
        let newCancelDateEndOptions: IMyDpOptions
          = Object.assign({}, this.cancelDateEndOptions);
        newCancelDateEndOptions.disableUntil = dateCurrentUntil;
        newCancelDateEndOptions.enableDays = [];
        this.cancelDateEndOptions = newCancelDateEndOptions;
        break;
      case 'cancelDateEndOnUtc':
        let newCancelDateBeginOptions: IMyDpOptions
          = Object.assign({}, this.cancelDateBeginOptions);
        newCancelDateBeginOptions.disableSince = dateCurrentSince;
        newCancelDateBeginOptions.enableDays = [];
        this.cancelDateBeginOptions = newCancelDateBeginOptions;
        break;
      default:
        return;
    }
    this._changeDetectorRef.markForCheck();
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public onScrollTabX(event): void {
    this.currentTabScrollX = event.target.scrollLeft;
  }

  public filter(): void {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
      return;
    }
    this._localStorageService.set('Project_FilterModel',
      this.getFilterModel());
    this.onFilter.emit({
      keyword: this.keyword,
      filter: this.getFilterParam()
    });
    this.searchedObj = {...this.frm.value};
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.frm.valid) {
      this._localStorageService.set('Project_FilterModel',
        this.getFilterModel());
    }
  }
}
