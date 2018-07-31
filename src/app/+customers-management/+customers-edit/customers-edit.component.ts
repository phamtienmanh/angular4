import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  AfterViewInit,
  HostListener
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  FormArray
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

// 3rd modules
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  ToastrService
} from 'ngx-toastr';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import {
  CustomersEditService
} from './customers-edit.service';
import { Util } from '../../shared/services/util';
import {
  CommonService
} from '../../shared/services/common/common.service';
import { AuthService } from '../../shared/services/auth/auth.service';

// Interfaces
import {
  BasicCustomer,
  ContactInfo,
  CustomerInfo
} from './customers-edit.model';
import {
  ResponseMessage,
  UploadedType,
  TypeEnum
} from '../../shared/models';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';
import { AppConstant } from '../../app.constant';
import { FileUploader } from 'ng2-file-upload';
import { UserContext } from '../../shared/services/user-context';
import { ProgressService } from '../../shared/services/progress';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'customers-edit',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'customers-edit.template.html',
  styleUrls: [
    'customers-edit.style.scss'
  ]
})
export class CustomersEditComponent implements OnInit, OnDestroy, AfterViewInit {
  public frm: FormGroup;
  public formErrors = {
    company: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    fax: ''
  };
  public validationMessages = {
    company: {
      required: 'Company is required.'
    },
    firstName: {
      required: 'First Name is required.'
    },
    lastName: {
      required: 'Last Name is required.'
    },
    email: {
      required: 'Email is required.',
      pattern: 'Email address is not valid'
    },
    phone: {
      required: 'Phone is required.'
    }
  };

  public customerInfo: CustomerInfo;
  public activatedSub: Subscription;
  public isPageReadOnly = false;
  public preCustomerEditData;
  public uploader: FileUploader;
  public type = UploadedType.CustomerAvatar;

  public isShowStickyBtn = false;

  constructor(private _fb: FormBuilder,
              private _localStorageService: LocalStorageService,
              private _activatedRoute: ActivatedRoute,
              private _router: Router,
              private _customersEditService: CustomersEditService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _authService: AuthService,
              private _modalService: NgbModal,
              private _utilService: Util,
              private _userContext: UserContext,
              private _progressService: ProgressService,
              private _breadcrumbService: BreadcrumbService) {}

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Customers');
    this.buildForm();
    this.activatedSub = this._activatedRoute.parent.params.subscribe((params: { id: number }) => {
      if (params.id) {
        this._customersEditService.getCustomerInfo(params.id)
          .subscribe((customerResp: ResponseMessage<CustomerInfo>) => {
            if (customerResp.status) {
              this.customerInfo = customerResp.data;
              this.customerInfo.id = params.id;
              this.frm.patchValue(this.customerInfo);
              this.setContacts(this.customerInfo.contacts);
              this.configFriendlyRoutes();
              this.preCustomerEditData = _.cloneDeep(this.frm.getRawValue());
            } else {
              this._toastrService.error(customerResp.errorMessages, 'Error');
            }
          });
      } else {
        this.addContact();
        this.preCustomerEditData = _.cloneDeep(this.frm.getRawValue());
      }
    });
    // Config url & token for upload avatar
    this.uploader = new FileUploader({
      url: `${AppConstant.domain}/api/v1/common/upload?type=${this.type}`,
      authToken: `Bearer ${this._userContext.userToken.accessToken}`
    });
  }

  public ngAfterViewInit() {
    setTimeout(() => {
      // handle sticky btn when scroll
      if (this._utilService.scrollElm) {
        if (this._utilService.scrollElm
            .scrollHeight - window.innerHeight > 110) {
          this.isShowStickyBtn = true;
        }
      }
    }, 1000);
  }

  /**
   * configFriendlyRoutes
   */
  public configFriendlyRoutes(): void {
    this._breadcrumbService
      .addCallbackForRouteRegex('^/customers-management/[0-9]*$', () => this.customerInfo.company);
  }

  /**
   * buildForm
   */
  public buildForm(): void {
    this.frm = this._fb.group({
      company: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', Validators.compose([
        Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@'
          + '[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$')
      ])),
      phone: new FormControl(''),
      fax: new FormControl(''),
      logoUrl: new FormControl(''),
      absoluteLogoUrl: new FormControl(''),
      contacts: this._fb.array([])
    });

    this.frm.valueChanges
      .subscribe((data) => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
    this.backupData();
  }

  /**
   * onValueChanged
   * @param {CustomerInfo} data
   */
  public onValueChanged(data?: CustomerInfo): void {
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
   * get contacts
   * @returns {FormArray}
   */
  public get contacts(): FormArray {
    return this.frm.get('contacts') as FormArray;
  };

  /**
   * setContacts
   * @param {ContactInfo[]} contacts
   */
  public setContacts(contacts: ContactInfo[]) {
    const contactFGs = contacts.map((contact: ContactInfo) => this._fb.group({
      id: new FormControl(contact.id),
      firstName: new FormControl(contact.firstName),
      lastName: new FormControl(contact.lastName),
      email: new FormControl(contact.email, Validators.compose([
        Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@'
          + '[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$')
      ])),
      phone: new FormControl(contact.phone),
      fax: new FormControl(contact.fax)
    }));
    const contactFormArray = this._fb.array(contactFGs);
    this.frm.setControl('contacts', contactFormArray);
  }

  /**
   * addContact
   */
  public addContact() {
    let isPreviousFormValid: boolean = true;
    this.contacts.value.forEach((contact, index) => {
      if (this.contacts.get(index.toString()).invalid) {
        isPreviousFormValid = false;
      }
    });
    if (isPreviousFormValid) {
      this.contacts.push(this._fb.group({
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        email: new FormControl('', Validators.compose([
          Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@'
            + '[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$')
        ])),
        phone: new FormControl(''),
        fax: new FormControl('')
      }));
    } else {
      this._toastrService.error('Last form invalid!', 'Error');
    }
    if (this._utilService.scrollElm) {
      setTimeout(() => {
        this.onAppScroll({target: {scrollingElement: this._utilService.scrollElm}});
      }, 250);
    }
  }

  /**
   * deleteContact
   * @param {number} id
   */
  public deleteContact(id: number) {
    let listContact = this.contacts.value;
    listContact.splice(id, 1);
    this.setContacts(listContact);
    if (this._utilService.scrollElm) {
      setTimeout(() => {
        this.onAppScroll({target: {scrollingElement: this._utilService.scrollElm}});
      }, 250);
    }
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
      if (res.status && res.data && res.data.length) {
        this.frm.patchValue({
          logoUrl: res.data[0].fileUrl,
          absoluteLogoUrl: res.data[0].absoluteUrl
        });
      } else {
        this._toastrService.error(res.errorMessages, 'Error');
      }

      // Clear uploaded item in uploader
      this.uploader.clearQueue();
    };
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
    if (this.isPageReadOnly) {
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
      logoUrl: '',
      absoluteLogoUrl: '',
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
    let listContacts = [];
    this.contacts.value.forEach((item, index) => {
      if (item.firstName === '' && item.lastName === ''
        && item.email === '' && item.phone === '' && item.fax === '') {
        // empty
      } else {
        listContacts.push(item);
      }
    });
    const frmSubmit = Object.assign({...this.frm.value}, {contacts: listContacts});
    if (this.customerInfo && this.customerInfo.id) {
      this._customersEditService.updateCustomer(this.customerInfo.id, frmSubmit)
        .subscribe((resp: ResponseMessage<CustomerInfo>) => {
          if (resp.status) {
            this.customerInfo.contacts = resp.data.contacts;
            // update breadcrumb
            this.customerInfo.company = this.frm.value.company;
            this.setContacts(this.customerInfo.contacts);
            this.preCustomerEditData = _.cloneDeep(this.frm.getRawValue());
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    } else {
      let model = {
        ...frmSubmit,
        type: TypeEnum.Customer
      };
      this._customersEditService.createCustomer(model)
        .subscribe((resp: ResponseMessage<BasicCustomer>) => {
          if (resp.status) {
            this._toastrService.success(resp.message, 'Success');
            this._router.navigate(['customers-management', resp.data.id]);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
  }

  /**
   * cancel
   */
  public cancel(): void {
    if (this.customerInfo !== undefined && this.customerInfo.id) {
      this._router.navigate(['customers-management', this.customerInfo.id]);
    } else {
      let previousRoute: string = this._utilService.previousRouteUrl;
      if (previousRoute) {
        this._router.navigate([previousRoute]);
      } else {
        this._router.navigate(['customers-management']);
      }
    }
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

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  public onAppScroll(event: any) {
    if (event.type === 'resize') {
      if (this._utilService.scrollElm &&
        this._utilService.scrollElm.scrollHeight  - (this._utilService.scrollElm.scrollTop
          + window.innerHeight) < 110) {
      this.isShowStickyBtn = false;
      } else if (this._utilService.scrollElm) {
        this.isShowStickyBtn = true;
      }
      return;
    }
    if (event.target.scrollingElement.scrollHeight  - (event.target.scrollingElement
        .scrollTop + window.innerHeight) < 110) {
      this.isShowStickyBtn = false;
    } else {
      this.isShowStickyBtn = true;
    }
  }

  public ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
