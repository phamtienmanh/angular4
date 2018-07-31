import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
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
  FileUploader
} from 'ng2-file-upload';
import {
  ToastrService
} from 'ngx-toastr';

// Services
import {
  UserContext
} from '../../shared/services/user-context';
import {
  UserManagementService
} from '../user-management.service';
import {
  ProgressService
} from '../../shared/services/progress';
import {
  CommonService
} from '../../shared/services/common/common.service';
import {
  AuthService
} from '../../shared/services/auth';

// Validators
import {
  Matcher
} from '../../shared/validators';

// Interfaces
import {
  Roles,
  UserInfo,
  BasicResponse,
  ResponseMessage
} from '../../shared/models';
import {
  Subscription
} from 'rxjs/Subscription';
import {
  ExtraValidators
} from '../../shared/services/validation';
import * as _ from 'lodash';
import { AppConstant } from '../../app.constant';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'create-or-update-user',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'create-or-update-user.template.html',
  styleUrls: [
    'create-or-update-user.style.scss'
  ]
})
export class CreateOrUpdateUserComponent implements OnInit,
                                                    OnDestroy,
                                                    AfterViewInit {
  @Output()
  public onValueChange = new EventEmitter<any>();
  @ViewChildren('roleListElement')
  public roleListElement: QueryList<any>;
  public roleListData: Roles[] = [];
  public isShowRoles = true;

  public frm: FormGroup;
  public formErrors = {
    isActive: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    firstName: '',
    lastName: ''
  };
  public validationMessages = {
    username: {
      required: 'Username is required.'
    },
    password: {
      required: 'Password is required.',
      pattern: 'Password must have at least 8 characters,' +
      ' 1 uppercase letter, 1 lowercase letter, and 1 number.'
    },
    confirmPassword: {
      required: 'ConfirmPassword is required.',
      nomatch: 'Password does not match'
    },
    email: {
      required: 'Email is required.',
      pattern: 'Email address is not valid'
    },
    firstName: {
      required: 'First Name is required.'
    },
    lastName: {
      required: 'Last Name is required.'
    },
    listRole: {
      required: 'At least 1 role must be selected.'
    }
  };
  public listRoleIds = [];
  public prelistRoleIds = [];
  public changePasswordStatus = true;

  public currentUserInfo: UserInfo;

  public uploader: FileUploader;
  public isSubmitted = false;
  public listRoleChanged = false;

  public isPageReadOnly = false;
  public isCurrentUser = false;
  public isView = true;
  public customerServiceRepsData;
  public preUserInfoData;
  public allowedCustomerData = [];
  public allowedCustomerIdsStr = '';

  private _accountManagerRoleIds: number[] = [];
  private _isInit = false;
  private updatedEvSub: Subscription;

  constructor(private _fb: FormBuilder,
              private _toastrService: ToastrService,
              private _userManagementService: UserManagementService,
              private _commonService: CommonService,
              private _authService: AuthService,
              private _progressService: ProgressService,
              private _userContext: UserContext) {
    // Subscribe event input user info from edit user page
    this.updatedEvSub = this._userManagementService.updateUserEvent
      .subscribe((userInfo: UserInfo) => {
        this._commonService.getCsrRoleList().subscribe((res: ResponseMessage<any>) => {
          if (res.status) {
            this.customerServiceRepsData = res.data.filter((i) => !i.isAssigned
              || (userInfo.customerServiceReps && userInfo.customerServiceReps
                .some((o) => o.id === i.id)));

            this.isView = false;
            this.currentUserInfo = userInfo;
            this.listRoleIds = [...userInfo.listRoleIds];
            this.prelistRoleIds = [...userInfo.listRoleIds];
            this.isPageReadOnly = !this._authService.checkCanModify('Users');
            this.isCurrentUser = this.currentUserInfo.id === this._userContext.currentUser.id;
            // Reset role element
            const amRole = this.roleListData.filter((i) => i.name === 'Account Manager'
              || i.name === 'Customer Service');
            if (amRole) {
              this._accountManagerRoleIds = amRole.map((i) => i.id);
            }
            const roleListDataTemp = this.roleListData;
            this.roleListData = [];
            setTimeout(() => {
              this.isView = true;
              setTimeout(() => {
                this.roleListData = roleListDataTemp;
              }, 200);
            }, 200);
            // -------------------
            this.currentUserInfo.password = 'Abc123123';
            this.currentUserInfo.confirmPassword = 'Abc123123';
            if (this.currentUserInfo.customerServiceReps) {
              this.currentUserInfo.customerServiceReps = this.currentUserInfo
                .customerServiceReps.map((i) => i.id);
            }
            this.changePasswordStatus = false;
            this.buildForm();
            this.frm.patchValue(this.currentUserInfo);
            this._isInit = true;
            this.isShowRoles = this.currentUserInfo.id !== this._userContext.currentUser.id
              || this._authService.isAdmin();
            if (this._userContext.currentUser.listRole
              .findIndex((i) => i.roleName === 'Administrator') === -1) {
              const adminIndex = this.roleListData
                .findIndex((i) => i.name === 'Administrator');
              if (adminIndex > -1) {
                this.roleListData.splice(adminIndex, 1);
              }
              const staffAdminIndex = this.roleListData
                .findIndex((i) => i.name === 'Staff Administrator');
              if (staffAdminIndex > -1) {
                this.roleListData.splice(staffAdminIndex, 1);
              }
            }
            this.checkSubmitForm();
            this.preUserInfoData = _.cloneDeep(this.frm.getRawValue());
            this.getAllowedCustomerIdsStr();
          } else {
            this._toastrService.error(res.errorMessages, 'Error');
          }
        });
      });
    this._userManagementService.updatePrimaryEv.subscribe((status) => {
      this.frm.get('isPrimaryAccountManager').patchValue(status);
      this.preUserInfoData = _.cloneDeep(this.frm.getRawValue());
    });
  }

  public ngOnInit(): void {
    this.buildForm();
    this.getCommonData();
    this.preUserInfoData = _.cloneDeep(this.frm.getRawValue());
    // Config url & token for upload avatar
    this.uploader = new FileUploader({
      url: `${AppConstant.domain}/api/v1/account/avatar/upload`,
      authToken: `Bearer ${this._userContext.userToken.accessToken}`
    });
  }

  /**
   * Check roles for each user's role
   */
  public ngAfterViewInit(): void {
    this.roleListElement.changes.subscribe((listRoles: ElementRef[]) => {
      listRoles.forEach((role) => {
        if (this.listRoleIds.length && role.nativeElement) {
          let checked = this.listRoleIds.filter((r) => r === +role.nativeElement.id);
          if (checked.length) {
            role.nativeElement.checked = true;
          }
        }
      });
    });
  }

  /**
   * buildForm
   */
  public buildForm(): void {
    this.frm = this._fb.group({
      id: new FormControl(''),
      isActive: new FormControl({
        value: true,
        disabled: this.isPageReadOnly && !this.isCurrentUser
      }),
      isPrimaryAccountManager: new FormControl({
        value: false,
        disabled: this.isPageReadOnly && !this.isCurrentUser
      }),
      username: new FormControl({
        value: '',
        disabled: this.isPageReadOnly && !this.isCurrentUser
      }, [Validators.required]),
      password: new FormControl({
        value: '',
        disabled: this.isPageReadOnly && !this.isCurrentUser
      }, Validators.compose([
        ExtraValidators.conditional(
          (group) => this.passwordRequired(),
          Validators.compose([
            Validators.required
          ])
        ),
        Validators.minLength(8),
        Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?!.*[ ]).*$')
      ])),
      confirmPassword: new FormControl({
        value: '',
        disabled: this.isPageReadOnly && !this.isCurrentUser
      }, Validators.compose([
        ExtraValidators.conditional(
          (group) => this.passwordRequired(),
          Validators.compose([
            Validators.required
          ])
        ),
        Matcher('password')
      ])),
      email: new FormControl({
        value: '',
        disabled: this.isPageReadOnly && !this.isCurrentUser
      }, Validators.compose([
        // Validators.required,
        Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@'
          + '[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$')
      ])),
      firstName: new FormControl({
        value: '',
        disabled: this.isPageReadOnly && !this.isCurrentUser
      }, [Validators.required]),
      lastName: new FormControl({
        value: '',
        disabled: this.isPageReadOnly && !this.isCurrentUser
      }, [Validators.required]),
      phoneNumber: new FormControl({
        value: '',
        disabled: this.isPageReadOnly && !this.isCurrentUser
      }),
      department: new FormControl({
        value: '',
        disabled: this.isPageReadOnly && !this.isCurrentUser
      }),
      badgeId: new FormControl({
        value: '',
        disabled: this.isPageReadOnly && !this.isCurrentUser
      }),
      allowedCustomerIds: new FormControl({
        value: null,
        disabled: this.isPageReadOnly && !this.isCurrentUser
      }),
      allowedCustomerName: new FormControl({
        value: '',
        disabled: this.isPageReadOnly && !this.isCurrentUser
      }),
      customerServiceTeams: new FormControl({
        value: [],
        disabled: this.isPageReadOnly && !this.isCurrentUser
      }),
      avatarUrl: new FormControl({
        value: '',
        disabled: this.isPageReadOnly && !this.isCurrentUser
      })
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  public passwordRequired(): boolean {
    return !!this.currentUserInfo && !!this.currentUserInfo.id;
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
    this.checkSubmitForm();
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

  public getCommonData(): void {
    this._commonService.getCustomersList(true)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.allowedCustomerData = resp.data;
          this.getAllowedCustomerIdsStr();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public getAllowedCustomerIdsStr(): void {
    this.allowedCustomerIdsStr = this.allowedCustomerData.filter((i) => {
      if (this.currentUserInfo && this.currentUserInfo.allowedCustomerIds
        && this.currentUserInfo.allowedCustomerIds.indexOf(i.id) > -1) {
        return i;
      }
    }).map((i) => i.name).join(', ');
  }

  /**
   * Fire change role event
   * @param event
   * @param role
   */
  public changeRoleStatus(event: Event, role: Roles): void {
    this.listRoleChanged = true;
    let itemIndex = this.listRoleIds.indexOf(role.id);
    if (itemIndex > -1) {
      // Avoid duplicate role
      this.listRoleIds.splice(itemIndex, 1);
    } else {
      // If role checked, push id to list role
      if (event.target['checked']) {
        this.listRoleIds.push(role.id);
      }
    }
    this.checkSubmitForm();
  }

  public changeAmPrimaryStatus(event): void {
    if (event && event.target) {
      this.frm.get('isPrimaryAccountManager').patchValue(event.target['checked']);
    }
  }

  public isAssignRoleByName(roleName: string): boolean {
    const role = this.roleListData.find((i) => i.name === roleName);
    if (role) {
      const roleId = role.id;
      return this.listRoleIds.findIndex((i) => i === roleId) > -1;
    }
    return false;
  }

  /**
   * Fire upload avatar event
   */
  public uploadAvatar(): void {
    if (!this.uploader.queue[0]) {
      return;
    }
    // Start upload avatar
    this.uploader.queue[0].upload();
    // Start loading bar while uploading
    this.uploader.onCompleteAll = () => this._progressService.done();
    this.uploader.onProgressItem = () => this._progressService.start();
    this.uploader.onSuccessItem = (item, resp) => {
      let res = JSON.parse(resp);
      if (res.status) {
        this.frm.patchValue({
          avatarUrl: res.data.avatarUrl
        });
      } else {
        this._toastrService.error(res.errorMessages, 'Error');
      }

      // Clear uploaded item in uploader
      this.uploader.clearQueue();
    };
  }

  public getCstString(): string {
    const cst = this.frm.get('customerServiceTeams').value;
    return cst ? cst.join(', ') : '';
  }

  /*-----------Drag & Drop Image Event-----------*/
  /**
   * drop
   * @param ev
   * @returns {boolean}
   */
  @HostListener('document:drop', ['$event'])
  public drop(ev) {
    // do something meaningful with it
    let items = ev.dataTransfer.items;
    if (this.isPageReadOnly && !this.isCurrentUser) {
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
    ev.path.map((i) => {
      if (i.className && i.className.includes('my-avatar')) {
        this.uploadAvatar();
      }
    });
    ev.preventDefault();
    return false;
  }

  /**
   * dragenter
   * @param {KeyboardEvent} ev
   * @returns {boolean}
   */
  @HostListener('document:dragenter', ['$event'])
  public dragenter(ev: KeyboardEvent) {
    ev.preventDefault();
    return false;
  }

  /**
   * dragover
   * @param {KeyboardEvent} ev
   * @returns {boolean}
   */
  @HostListener('document:dragover', ['$event'])
  public dragover(ev: KeyboardEvent) {
    ev.preventDefault();
    return false;
  }

  /**
   * Fire remove avatar event
   */
  public removeAvatar(): void {
    this.frm.patchValue({
      avatarUrl: ''
    });
  }

  /**
   * Fire change password event
   */
  public changePassword(): void {
    this.changePasswordStatus = !this.changePasswordStatus;
    this.frm.patchValue({
      password: '',
      confirmPassword: ''
    });
  }

  /**
   * Reset value form
   */
  public resetData(): void {
    this.buildForm();
    // Revert role
    this.listRoleIds = [];
    this.roleListElement.forEach((roleEle: ElementRef) => {
      roleEle.nativeElement.checked = false;
    });
    this.changePasswordStatus = true;
  }

  public isAccountManager(): boolean {
    if (this._isInit) {
      if (this.customerServiceRepsData && this.customerServiceRepsData.length) {
        let activatedValue = [];
        let value = this.currentUserInfo.customerServiceReps;
        if (value) {
          value.forEach((item) => {
            let activeItem = this.customerServiceRepsData.find((s) => s.id === item);
            if (activeItem) {
              activatedValue.push(activeItem);
            }
          });
        }
      }
      this._isInit = false;
    }
    return this._accountManagerRoleIds.some((i) => this.listRoleIds.indexOf(i) > -1);
  }

  /**
   * Check value form is valid and emit value
   */
  public checkSubmitForm(): void {
    if (this.frm.valid && this.listRoleIds.length) {
      let model = {
        ...this.frm.value,
        isChangePassword: this.changePasswordStatus,
        listRoleIds: this.listRoleIds
      };
      this.onValueChange.emit(model);
    } else {
      this.onValueChange.emit();
    }
  }

  /**
   * isFormValid
   * @returns {boolean}
   */
  public isFormValid(): boolean {
    this.isSubmitted = true;
    if (this.frm.invalid || !this.listRoleIds.length) {
      this._commonService.markAsDirtyForm(this.frm);
      return false;
    }
    return true;
  }

  public sendInvitation() {
    if (this.currentUserInfo.id) {
      this._userManagementService.sendInvitaion(this.currentUserInfo.id)
        .subscribe((resp: ResponseMessage<BasicResponse>) => {
          if (resp.status) {
            this.currentUserInfo.isSentInvitation = true;
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
  }

  public ngOnDestroy(): void {
    this.updatedEvSub.unsubscribe();
  }
}
