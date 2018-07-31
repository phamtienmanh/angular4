import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';

// Services
import {
  UserContext
} from '../../shared/services/user-context';
import {
  RoleManagementService
} from '../role-management.service';
import {
  CommonService
} from '../../shared/services/common/common.service';
import {
  Util
} from '../../shared/services/util/util.service';
import * as _ from 'lodash';

// Services
import {
  AuthService
} from '../../shared/services/auth/auth.service';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

// Interfaces
import {
  BasicUserInfo,
  Roles,
  UserInfo,
  ResponseMessage
} from '../../shared/models';
import {
  RoleInfo,
  AccessControlType
} from '../role-management.model';
import {
  RoleDetailComponent
} from './modules/role-detail/role-detail.component';
import { Subscription } from 'rxjs/Subscription';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'create-or-update-role',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'create-or-update-role.template.html',
  styleUrls: [
    'create-or-update-role.style.scss'
  ]
})
export class CreateOrUpdateRoleComponent implements OnInit,
                                                    OnDestroy {
  @Output()
  public onSwitchTab = new EventEmitter<any>();

  @ViewChildren('roleListElement')
  public roleListElement: QueryList<any>;
  public roleListData: Roles[] = [];
  public isShowRoles = true;

  public frm: FormGroup;
  public formErrors = {
    roleName: '',
    description: '',
    automaticallyLogOff: ''
  };
  public validationMessages = {
    roleName: {
      required: 'Role name is required.'
    },
    description: {
      required: 'Description is required.'
    },
    automaticallyLogOff: {
      required: 'Automatically Log Off (mins) is required.'
    },
    default: {
      required: 'This is required.'
    }
  };
  public accessControlType = AccessControlType;
  public tabs = [
    {
      id: 0,
      name: 'Pages',
      prop: AccessControlType.Pages,
      isActive: true,
      isDisabled: false
    },
    {
      id: 1,
      name: 'OrderLog.All',
      prop: AccessControlType.OrderLog,
      isActive: false,
      isDisabled: false
    },
    {
      id: 14,
      name: 'OrderLog.Imports',
      prop: AccessControlType.Imports,
      isActive: false,
      isDisabled: false
    },
    {
      id: 11,
      name: 'OrderLog.Outsource',
      prop: AccessControlType.Outsource,
      isActive: false,
      isDisabled: false
    },
    {
      id: 12,
      name: 'OrderLog.SampleDevelopment',
      prop: AccessControlType.SampleDevelopment,
      isActive: false,
      isDisabled: false
    },
    {
      id: 2,
      name: 'Schedules TSC Print',
      prop: AccessControlType.SchedulesPrint,
      isActive: false,
      isDisabled: false
    },
    {
      id: 7,
      name: 'Schedules Outsource Print',
      prop: AccessControlType.SchedulesOutsourcePrint,
      isActive: false,
      isDisabled: false
    },
    {
      id: 3,
      name: 'Schedules Neck Label',
      prop: AccessControlType.SchedulesNeckLabel,
      isActive: false,
      isDisabled: false
    },
    {
      id: 4,
      name: 'Schedules TSC Finishing',
      prop: AccessControlType.SchedulesFinishing,
      isActive: false,
      isDisabled: false
    },
    {
      id: 8,
      name: 'Schedules Outsource Finishing',
      prop: AccessControlType.SchedulesOutsourceFinishing,
      isActive: false,
      isDisabled: false
    },
    {
      id: 5,
      name: 'Schedules Pending Samples',
      prop: AccessControlType.SchedulesPendingSamples,
      isActive: false,
      isDisabled: false
    },
    {
      id: 6,
      name: 'Schedules Samples',
      prop: AccessControlType.SchedulesSamples,
      isActive: false,
      isDisabled: false
    },
    {
      id: 16,
      name: 'Schedules TOP/PP Samples',
      prop: AccessControlType.SchedulesTopPpSamples,
      isActive: false,
      isDisabled: false
    },
    {
      id: 13,
      name: 'Projects',
      prop: AccessControlType.Projects,
      isActive: false,
      isDisabled: false
    }
  ];
  public isSubmitted = false;
  public userListData = [];
  public isCheckedViewAll = false;
  public isCheckedModifyAll = false;
  public isDisabedCheckAllModify = false;

  public isPageReadOnly = false;
  public preRoleInfoData;
  public preRoleCbList;

  private updatedEvSub: Subscription;

  constructor(private _fb: FormBuilder,
              private _toastrService: ToastrService,
              private _roleManagementService: RoleManagementService,
              private _authService: AuthService,
              private _commonService: CommonService,
              private _utilService: Util,
              private _modalService: NgbModal) {
    this.isPageReadOnly = !this._authService.checkCanModify('Roles');
    // Subscribe event input user info from edit user page
    this.updatedEvSub = this._roleManagementService.updateRoleEvent
      .subscribe((roleInfo: RoleInfo) => {
        this.frm.reset();
        this.frm.patchValue(roleInfo);
        this.frm.get('roleName').disable();
        this.frm.get('userIds').patchValue(roleInfo.users.map((i) => i.id));
        this.preRoleInfoData = _.cloneDeep(this.frm.getRawValue());
        this.preRoleCbList = _.cloneDeep(this.preRoleInfoData.permissions);
        this.initCheckAllValue();
      });
  }

  public ngOnInit(): void {
    this.buildForm();
    this.preRoleInfoData = _.cloneDeep(this.frm.getRawValue());
    this.preRoleCbList = _.cloneDeep(this.preRoleInfoData.permissions);
    this._authService.getAllUsers()
      .subscribe((resp: ResponseMessage<BasicUserInfo[]>) => {
        if (resp.status) {
          this.userListData = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
    this.initCheckAllValue();
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public initCheckAllValue(): void {
    this.isCheckedViewAll = this.getAccessControlPermissions(this.activatedTab.prop)
      .every((i) => !!i.isView);
    const listView = this.getAccessControlPermissions(this.activatedTab.prop)
      .filter((i) => !!i.isView);
    this.isCheckedModifyAll = !!listView.length && listView.every((i) => !!i.isModify);
    this.isDisabedCheckAllModify = !this.getAccessControlPermissions(this.activatedTab.prop)
      .some((i) => !!i.isView);
  }

  /**
   * buildForm
   */
  public buildForm(): void {
    this.frm = this._fb.group({
      id: new FormControl(''),
      isActive: new FormControl({
        value: true,
        disabled: this.isPageReadOnly
      }),
      roleName: new FormControl({
        value: '',
        disabled: this.isPageReadOnly
      }, [Validators.required]),
      description: new FormControl({
        value: '',
        disabled: this.isPageReadOnly
      }),
      userIds: new FormControl([]),
      users: new FormControl([]),
      automaticallyLogOff: new FormControl({
        value: 0,
        disabled: this.isPageReadOnly
      }, Validators.required),
      permissions: new FormControl([])
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  /**
   * onValueChanged
   * @param data
   */
  public onValueChanged(data?: UserInfo): void {
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
   * Get activatedTab
   * @returns {number}
   */
  public get activatedTab(): any {
    return this.tabs.find((tab) => tab.isActive);
  }

  /**
   * getListUserString
   * @returns {string}
   */
  public getListUserString(): string {
    if (this.frm.get('users').value && this.frm.get('users').value.length) {
      return this.frm.get('users').value.map((i) => i.fullName).join(', ');
    } else {
      return '';
    }
  }

  /**
   * onChangeViewPage
   * @param event
   * @param page
   */
  public onChangeViewPage(event, page): void {
    if (!event.target.checked) {
      page.isModify = false;
    }
    this.initCheckAllValue();
  }

  public onCheckedViewAll(e, type): void {
    let arr = this.getAccessControlPermissions(type);
    arr.forEach((i) => {
      i.isView = e.target.checked;
      if (!i.isView) {
        i.isModify = false;
      }
    });
    this.initCheckAllValue();
  }

  public onCheckedModifyAll(e, type): void {
    let arr = this.getAccessControlPermissions(type);
    arr.forEach((i) => {
      if (!!i.isView) {
        i.isModify = e.target.checked;
      }
    });
    this.initCheckAllValue();
  }

  /**
   * Event switch tab
   * @param index
   */
  public switchTab(activatedTab): void {
    if (!activatedTab.isDisabled && !activatedTab.isActive) {
      this.tabs.forEach((tab) => tab.isActive = false);
      activatedTab.isActive = !activatedTab.isActive;
      this.initCheckAllValue();
      setTimeout(() => {
        this.onSwitchTab.emit({target: {scrollingElement: this._utilService.scrollElm}});
      }, 250);
    }
  }

  public get formValue(): any {
    const userIds = this.frm.get('users').value.map((i) => i.id);
    this.frm.get('userIds').patchValue(userIds);
    return this.frm.getRawValue();
  }

  /**
   * getAccessControlPermissions
   * @param {number} type
   * @returns {any[]}
   */
  public getAccessControlPermissions(type: number): any[] {
    return this.frm.get('permissions').value.filter((i) => i.type === type);
  }

  /**
   * openChangeFunction
   * @param row
   */
  public openChangeFunction(row): void {
    let modalRef = this._modalService.open(RoleDetailComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static'
    });
    let relativeRow = this.getAccessControlPermissions(this.accessControlType.Functions)
      .filter((i) => i.name.includes(row.name));
    let model = [];
    relativeRow.forEach((i) => model.push(Object.assign({}, i)));
    modalRef.componentInstance.tableData = model;
    modalRef.componentInstance.title = row.name;
    modalRef.result.then((res) => {
      if (res.status) {
        let currentPermissions = this.frm.get('permissions').value;
        currentPermissions.forEach((i) => {
          res.data.forEach((o) => {
            if (i.name === o.name) {
              Object.assign(i, o);
            }
          });
        });
        this.frm.get('permissions').patchValue(currentPermissions);
      }
    }, (err) => {
      // empty
    });
  }

  /**
   * isHaveChildrenFunctions
   * @param row
   * @returns {boolean}
   */
  public isHaveChildrenFunctions(row): boolean {
    return !!this.getAccessControlPermissions(this.accessControlType.Functions)
      .filter((i) => i.name.includes(row.name)).length;
  }

  /**
   * isFormValid
   * @returns {boolean}
   */
  public isFormValid(): boolean {
    this.isSubmitted = true;
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
      return false;
    }
    return true;
  }

  public ngOnDestroy(): void {
    this.updatedEvSub.unsubscribe();
  }
}
