import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import * as _ from 'lodash';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  CommonService,
  AuthService,
  ValidationService,
  MyDatePickerService
} from '../../../shared/services';
import {
  RegionManagementService
} from '../../../+settings/+region-management';
import {
  ProjectInfoService
} from './project-info.service';
import {
  ProjectManageService
} from '../project-manage.service';
import * as moment from 'moment';

// Components
import {
  NgSelectComponent
} from '@ng-select/ng-select';

// Interfaces
import {
  ProjectInfoModel
} from './project-info.model';
import {
  ResponseMessage,
  BasicCustomerInfo
} from '../../../shared/models';
import {
  IMyDate,
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  Subscription
} from 'rxjs/Subscription';
import { MaxDate } from '../../../shared/validators';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'project-info',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'project-info.template.html',
  styleUrls: [
    'project-info.style.scss'
  ]
})
export class ProjectInfoComponent implements OnInit, OnDestroy {
  public projectId: number;
  public preProjectInfoData;
  public frm: FormGroup;
  public formErrors;
  public validationMessages = {
    name: {
      required: 'Project Name is required.'
    },
    dateMethod: {
      required: 'T&A Date Method is required.'
    },
    retailerId: {
      required: 'Retailer Name is required.'
    },
    startDateOnUtc: {
      required: 'In DC/Store Date is required.'
    },
    inDcStoreDateOnUtc: {
      required: 'In DC/Store Date is required.'
    },
    comments: {
      required: 'Comments is required.'
    },
    default: {
      required: 'This is required.'
    }
  };
  public myDatePickerOptions: IMyDpOptions;
  public startDateOptions;
  public inDcStoreDateOptions;

  public projectInfoData: any;
  public retailersData: BasicCustomerInfo[] = [];
  public regionsData = [];
  public dateMethodData = [
    {
      id: 1,
      name: 'Start Date'
    },
    {
      id: 2,
      name: 'In DC/Store Date'
    }
  ];

  public isPageReadOnly = false;

  public activatedSub: Subscription;

  constructor(private _validationService: ValidationService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _projectInfoService: ProjectInfoService,
              private _projectManageService: ProjectManageService,
              private _regionManagementService: RegionManagementService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _authService: AuthService,
              public myDatePickerService: MyDatePickerService) {
    this.isPageReadOnly = !this._authService.checkCanModify('Projects.Projects');
    this.activatedSub = this._activatedRoute.parent.parent.params
      .subscribe((params: { id: number }) => {
        let id = Number(params.id);
        this.projectId = isNaN(id) ? undefined : params.id;
      });
  }

  public ngOnInit(): void {
    this._projectManageService.getProjectIndex()
      .subscribe((projectIndex) => {
        if (this.projectId) {
          this.isPageReadOnly = !this._authService.isAdmin()
            && !projectIndex.isProjectManager && !projectIndex.isProjectEditor;
          this._changeDetectorRef.markForCheck();
        }
      });
    this.configureDate();
    this.buildForm();
    this.getCommonData();
    this.getProjectInfoData();
  }

  /**
   * configureDate
   */
  public configureDate(): void {
    const options = {
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
      disableUntil: {
        year: 0,
        month: 0,
        day: 0
      },
      disableSince: {
        year: 0,
        month: 0,
        day: 0
      }
    };
    this.myDatePickerOptions = options;
    this.startDateOptions = {
      ...options
    };
    this.inDcStoreDateOptions = {
      ...options
    };
  }

  /**
   * Get current order info if has
   */
  public getProjectInfoData(): void {
    if (this.projectId) {
      this._projectManageService.getProjectById(this.projectId)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this.projectInfoData = resp.data;
            this.updateForm(this.projectInfoData);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    } else {
      this.projectInfoData = undefined;
    }
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._regionManagementService.getListRegion()
      .subscribe((resp: ResponseMessage<any>): void => {
        if (resp.status) {
          this.regionsData = resp.data.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this._commonService.getRetailersList()
      .subscribe((resp: ResponseMessage<BasicCustomerInfo[]>) => {
        if (resp.status) {
          this.retailersData = resp.data;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * buildForm
   */
  public buildForm(): void {
    this.formErrors = {
      name: '',
      dateMethod: '',
      retailerId: '',
      startDateOnUtc: '',
      inDcStoreDateOnUtc: '',
      comments: ''
    };
    let controlConfig = {
      name: new FormControl('', [Validators.required]),
      retailerId: new FormControl(null),
      dateMethod: new FormControl(null, [Validators.required]),
      startDate: new FormControl(null),
      startDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)')
        ])
      ]),
      inDcStoreDate: new FormControl(null),
      inDcStoreDateOnUtc: new FormControl('', [
        Validators.compose([
          Validators.pattern('([0-9]{2})\/([0-9]{2})\/([0-9]{4})$' +
            '|^([0-9]{4})\-([0-9]{2})\-([0-9]{2})[T]([^a-z]*)')
        ])
      ]),
      comments: new FormControl({
        value: '',
        disabled: this.isPageReadOnly
      }),
      formRequires: new FormControl({
        name: {
          required: true
        },
        retailerId: {
          required: false
        },
        dateMethod: {
          required: true
        },
        startDateOnUtc: {
          required: false
        },
        inDcStoreDateOnUtc: {
          required: false
        },
        comments: {
          required: false
        }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);

    this.onValueChanged(); // (re)set validation messages now
  }

  /**
   * onValueChanged
   * @param data
   */
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

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public onSelectOpen(select: NgSelectComponent): void {
    if (!select.multiple && select.selectedItems && select.selectedItems.length) {
      let filterVal = select.selectedItems[0].label;
      select.filterValue = filterVal ? filterVal : '';
    }
  }

  /**
   * setDateValue
   */
  public setDateValue(): void {
    let patchDateFunc = (importName: string, exportName: string) => {
      if (this.frm.get(importName).value) {
        const listNotUpdateTime = [
          'inDcStoreDateOnUtc',
          'startDateOnUtc'
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
        this.frm.get(exportName).setValue({
          date: {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            day: currentDate.getDate()
          }
        });
      } else {
        this.frm.get(importName).patchValue(null);
        this.frm.get(exportName).patchValue(null);
        this.configDateOptions(importName, null);
      }
    };
    patchDateFunc('inDcStoreDateOnUtc', 'inDcStoreDate');
    patchDateFunc('startDateOnUtc', 'startDate');
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
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Convert Date to IMyDate & Reconfig date options
   * @param prop
   * @param utcDate
   * @param i
   */
  public configDateOptions(prop: string, utcDate: Date): void {
    if (!utcDate) {
      switch (prop) {
        case 'startDateOnUtc':
          // Config for cancel date options
          this.inDcStoreDateOptions = {
            ...this.inDcStoreDateOptions,
            disableUntil: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          this.startDateOptions = {
            ...this.startDateOptions,
            disableSince: {
              year: 0,
              month: 0,
              day: 0
            }
          };
          if (this.frm) {
            this.frm.get('inDcStoreDateOnUtc').setValue(null);
            this.frm.get('inDcStoreDate').setValue(null);
          }
          break;
        case 'inDcStoreDateOnUtc':
          // Config for start date options
          this.startDateOptions = {
            ...this.startDateOptions,
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
      case 'startDateOnUtc':
        // Config for end date options
        this.inDcStoreDateOptions = {
          ...this.inDcStoreDateOptions,
          disableUntil: dateCurrentUntil,
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentUntil), currentDate)
            //              ? '' : dateCurrentUntil
          ],
          componentDisabled: false
        };
        break;
      case 'inDcStoreDateOnUtc':
        // Config for start date options
        this.startDateOptions = {
          ...this.startDateOptions,
          disableSince: dateCurrentSince,
          enableDays: [
            // _.isEqual(this.getMaxDate(currentDate, dateCurrentSince), currentDate)
            //              ? '' : dateCurrentSince
          ]
        };
        break;
      default:
        break;
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

  /**
   * Update form value
   * @param data
   */
  public updateForm(data: ProjectInfoModel): void {
    this.frm.patchValue(data);
    if (!data.startDateOnUtc) {
      this.frm.get('startDateOnUtc').patchValue(moment(new Date()).format('MM/DD/YYYY'));
    }
    this.setDateValue();
    this._projectManageService.updateProjectIndex({
      projectId: data.id,
      projectName: data.name,
      customerName: data.customerName,
      inDcStoreDateOnUtc: data.inDcStoreDateOnUtc
    });
    this._projectManageService.setBreadcrumb(data);
    this._changeDetectorRef.markForCheck();
    setTimeout(() => {
      this.preProjectInfoData = _.cloneDeep(this.frm.getRawValue());
    });
  }

  /**
   * onSubmitForm
   */
  public onSubmitForm(): void {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
      return;
    }
    this.myDatePickerService.addTimeToDateArray(this.frm, [
      // 'inDcStoreDateOnUtc',
    ]);
    this.myDatePickerService.addUtcTimeToDateArray(this.frm, [
      'inDcStoreDateOnUtc',
      'startDateOnUtc'
    ]);
    let model = this.frm.value;
    if (this.projectId) {
      this._projectInfoService.updateProjectInfo(this.projectId, model)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this.projectInfoData = resp.data;
            this.updateForm(this.projectInfoData);
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    } else {
      this._projectInfoService.createProject(model)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this._router.navigate([
              'projects',
              resp.data.id
            ]);
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
  }

  public ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
