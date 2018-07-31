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
  FormGroup
} from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

// Services
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  CommonService
} from '../../../shared/services/common';
import {
  AuthService
} from '../../../shared/services/auth';
import {
  ToastrService
} from 'ngx-toastr';
import {
  ValidationService
} from '../../../shared/services/validation';
import {
  Util
} from '../../../shared/services/util';
import {
  ProjectUsersService
} from './project-users.service';
import {
  ProjectManageService
} from '../project-manage.service';
import {
  UserContext
} from '../../../shared/services/user-context';

// Interfaces
import {
  ProjectUsersModel
} from './project-users.model';
import {
  ResponseMessage,
  BasicCustomerInfo
} from '../../../shared/models';
import {
  Subscription
} from 'rxjs/Subscription';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'project-users',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'project-users.template.html',
  styleUrls: [
    'project-users.style.scss'
  ]
})
export class ProjectUsersComponent implements OnInit, OnDestroy {
  public projectId: number;
  public frm: FormGroup;
  public formErrors;
  public validationMessages = {
    projectManagerUserIds: {
      pattern: 'At least 1 project manager must be specified.'
    },
    projectEditorUserIds: {
      required: 'At least 1 project editor must be specified.'
    },
    projectViewerUserIds: {
      required: 'At least 1 project viewer must be specified.'
    },
    default: {
      required: 'This is required.'
    }
  };

  public projectUsersData: any;
  public customersData: any = [];
  public customersManagerData: any = [];
  public customersNotManagerData: any = [];

  public isPageReadOnly = false;

  public activatedSub: Subscription;

  constructor(private _validationService: ValidationService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _localStorageService: LocalStorageService,
              private _projectUsersService: ProjectUsersService,
              private _projectManageService: ProjectManageService,
              private _commonService: CommonService,
              private _userContext: UserContext,
              private _toastrService: ToastrService,
              private _utilService: Util,
              private _authService: AuthService) {
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
          this.isPageReadOnly = !this._authService.isAdmin() && !projectIndex.isProjectManager;
          this._changeDetectorRef.markForCheck();
        }
      });
    this.buildForm();
    this.getCommonData();
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getAMandAdminList()
      .subscribe((res: ResponseMessage<any[]>) => {
        if (res.status) {
          this.customersManagerData = res.data.filter((c) => c.isProjectManager);
          this.customersNotManagerData = res.data.filter((c) => !c.isProjectManager);
          if (this.projectId) {
            this._projectUsersService.getProjectUsersById(this.projectId)
              .subscribe((resp: ResponseMessage<any>) => {
                if (resp.status) {
                  this.projectUsersData = resp.data;
                  this.updateForm(this.projectUsersData);

                  // const getUserNameFunc = (formControlIds, formControlNames) => {
                  //   let stringArr = [];
                  //   this.frm.get(formControlIds).value.forEach((userId: number) => {
                  //     const userObj: any = this.customersData.find((i) => i.id === userId);
                  //     if (userObj) {
                  //       stringArr.push(userObj.fullName);
                  //     }
                  //   });
                  //   this.frm.get(formControlNames).patchValue(stringArr);
                  // };
                  // getUserNameFunc('projectManagerUserIds', 'projectManagerUserNames');
                  // getUserNameFunc('projectEditorUserIds', 'projectEditorUserNames');
                  // getUserNameFunc('projectViewerUserIds', 'projectViewerUserNames');
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
              });
          } else {
            this.projectUsersData = undefined;
          }
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(res.errorMessages, 'Error');
        }
      });
  }

  /**
   * buildForm
   */
  public buildForm(): void {
    this.formErrors = {
      projectManagerUserIds: '',
      projectEditorUserIds: '',
      projectViewerUserIds: ''
    };
    let controlConfig = {
      projectManagerUserIds: new FormControl([]),
      projectEditorUserIds: new FormControl([]),
      projectViewerUserIds: new FormControl([]),
      formRequires: new FormControl({
        projectManagerUserIds: {
          required: false
        },
        projectEditorUserIds: {
          required: false
        },
        projectViewerUserIds: {
          required: false
        }
      })
    };
    this.frm = this._validationService.buildForm(controlConfig,
      this.formErrors, this.validationMessages);

    this.onValueChanged(); // (re)set validation messages now
    this.backupData();
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

  /**
   * Get status of special require cases
   * @param frm
   * @param key
   * @returns {boolean}
   */
  public getSpecialRequireCase(frm: FormGroup, key: string): boolean {
    let firstCaseList = [
      // 'retailerPoId'
    ];
    if (key === 'firstCase') {
      let status = false;
      firstCaseList.forEach((cas) => status = status
        || !!frm.get(cas).value);
      firstCaseList.forEach((cas) => frm.get('formRequires').value[cas].required = status);
      return status;
    } else {
      return false;
    }
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public getFactoryNamesString(frm, data, ids): string {
    const factoryIds = frm.get(ids).value;
    return data.filter((i) => factoryIds.indexOf(i.id) > -1)
      .map((i) => i.fullName).join(', ');
  }

  /**
   * Update form value
   * @param data
   */
  public updateForm(data: ProjectUsersModel): void {
    this.frm.patchValue(data);
    this.backupData();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * backupData
   */
  public backupData(): void {
    let data = Object.assign({}, this.frm.value);
    this._localStorageService.set('backupData', data);
  }

  /**
   * revertData
   * @param {boolean} isEdit
   */
  public revertData(isEdit: boolean): void {
    if (!isEdit) {
      // Assign init value because this properties become null after reset
      this.buildForm();
      return;
    }
    this.frm.patchValue(this._localStorageService.get('backupData'));
    this.backupData();
  }

  /**
   * onCancel
   */
  public onCancel(): void {
    let previousRoute: string = this._utilService.previousRouteUrl;
    if (previousRoute) {
      this._router.navigate([previousRoute]);
    } else {
      this._router.navigate(['projects']);
    }
  }

  /**
   * formClick
   * @param {MouseEvent} e
   */
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
   * onSubmitForm
   */
  public onSubmitForm(): void {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm);
      return;
    }
    if (this.projectId) {
      let model = {
        ...this.frm.value
      };
      this._projectUsersService.updateProjectUsers(this.projectId, model)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            const curUserId = this._userContext.currentUser.id;
            const checkExistFunc = (arr: number[]): boolean => {
              return arr ? arr.some((i) => i === curUserId) : false;
            };
            this._projectManageService.updateProjectIndex({
              isProjectManager: checkExistFunc(resp.data.projectManagerUserIds),
              isProjectEditor: checkExistFunc(resp.data.projectEditorUserIds),
              isProjectViewer: checkExistFunc(resp.data.projectViewerUserIds)
            });
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
