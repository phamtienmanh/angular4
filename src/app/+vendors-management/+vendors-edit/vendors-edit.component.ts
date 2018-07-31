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
  VendorsEditService
} from './vendors-edit.service';
import {
  CommonService
} from '../../shared/services/common';
import { AuthService } from '../../shared/services/auth';
import { Util } from '../../shared/services/util';

// Interfaces
import {
  BasicVendor,
  ContactInfo,
  VendorInfo,
  VendorType
} from './vendors-edit.model';
import {
  ResponseMessage,
  TypeEnum
} from '../../shared/models';
import {
  Subscription
} from 'rxjs/Subscription';
import * as _ from 'lodash';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'vendors-edit',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'vendors-edit.template.html',
  styleUrls: [
    'vendors-edit.style.scss'
  ]
})
export class VendorsEditComponent implements OnInit, OnDestroy, AfterViewInit {
  public frm: FormGroup;
  public validationMessages = {
    company: {
      required: 'Company is required.'
    },
    typeIds: {
      required: 'Type Names is required.'
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
    phone: {
      required: 'Phone is required.'
    },
    cell: {
      required: 'Cell is required.'
    },
    address1: {
      required: 'Address is required.'
    },
    city: {
      required: 'City is required.'
    },
    state: {
      required: 'State is required.'
    },
    country: {
      required: 'Country is required.'
    },
    role: {
      required: 'Role name is required.'
    }
  };
  public typeData: VendorType[] = [];
  public roleData = [
    {
      id: 1,
      name: 'Sheduling'
    },
    {
      id: 2,
      name: 'Purchasing'
    },
    {
      id: 3,
      name: 'Other'
    }
  ];
  public vendorInfo: VendorInfo;
  public activatedSub: Subscription;

  public isPageReadOnly = false;
  public preVendorEditData;

  public isShowStickyBtn = false;

  constructor(private _fb: FormBuilder,
              private _localStorageService: LocalStorageService,
              private _activatedRoute: ActivatedRoute,
              private _router: Router,
              private _vendorsEditService: VendorsEditService,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _utilService: Util,
              private _modalService: NgbModal,
              private _authService: AuthService,
              private _breadcrumbService: BreadcrumbService) {
  }

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Vendors');
    this.buildForm();
    this.activatedSub = this._activatedRoute.parent.params.subscribe((params: { id: number }) => {
      if (params.id) {
        this._vendorsEditService.getVendorInfo(params.id)
          .subscribe((vendorResp: ResponseMessage<VendorInfo>) => {
            if (vendorResp.status) {
              this.vendorInfo = vendorResp.data;
              this.vendorInfo.id = params.id;
              this.frm.patchValue(this.vendorInfo);
              if (this.vendorInfo.contacts.length) {
                this.setContacts(this.vendorInfo.contacts);
              }
              this.patchTypes();
              this.configFriendlyRoutes();
            } else {
              this._toastrService.error(vendorResp.errorMessages, 'Error');
            }
          });
      } else {
        this.preVendorEditData = _.cloneDeep(this.frm.getRawValue());
      }
      this._vendorsEditService.getVendorTypes().subscribe((resp: ResponseMessage<VendorType[]>) => {
        if (resp.status) {
          this.typeData = resp.data;
          this.patchTypes();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
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
      .addCallbackForRouteRegex('^/vendors-management/[0-9]*$', () => this.vendorInfo.company);
  }

  /**
   * buildForm
   */
  public buildForm(): void {
    this.frm = this._fb.group({
      id: new FormControl(''),
      company: new FormControl('', [Validators.required]),
      typeIds: new FormControl(null, [Validators.required]),
      email: new FormControl('', Validators.compose([
        Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@'
          + '[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$')
      ])),
      phone: new FormControl(''),
      cell: new FormControl(''),
      address1: new FormControl('', [Validators.required]),
      address2: new FormControl(''),
      city: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      region: new FormControl(''),
      postalCode: new FormControl(''),
      contacts: this._fb.array([
        this._fb.group({
          firstName: new FormControl(''),
          lastName: new FormControl(''),
          email: new FormControl('', Validators.compose([
            Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@'
              + '[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$')
          ])),
          phone: new FormControl(''),
          cell: new FormControl(''),
          role: new FormControl(null)
        })
      ])
    });
    this.backupData();
  }

  /**
   * Binding multi value to select
   */
  public patchTypes() {
    let activatedValue = [];
    if (!this.vendorInfo || !this.vendorInfo.typeIds) {
      return;
    }
    this.vendorInfo.typeIds.forEach((id) => {
      this.typeData.forEach((s) => {
        if (s.id === id) {
          activatedValue.push(s);
        }
      });
    });
    this.preVendorEditData = _.cloneDeep(this.frm.getRawValue());
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
      cell: new FormControl(contact.cell),
      role: new FormControl(contact.role)
    }));
    const contactFormArray = this._fb.array(contactFGs);
    this.frm.setControl('contacts', contactFormArray);
  }

  /**
   * addContact
   */
  public addContact() {
    let isPreviousFormValid: boolean = true;
    if (this.contacts.value) {
      this.contacts.value.forEach((contact, index) => {
        if (this.contacts.get(index.toString()).invalid) {
          isPreviousFormValid = false;
        }
      });
    }
    if (isPreviousFormValid) {
      this.contacts.push(this._fb.group({
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        email: new FormControl('', Validators.compose([
          Validators.pattern('^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@'
            + '[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$')
        ])),
        phone: new FormControl(''),
        cell: new FormControl(''),
        role: new FormControl(null)
      }));
      if (this._utilService.scrollElm) {
        setTimeout(() => {
          this.onAppScroll({target: {scrollingElement: this._utilService.scrollElm}});
        }, 250);
      }
    } else {
      this._toastrService.error('Last form invalid!', 'Error');
    }
  }

  /**
   * deleteContact
   * @param {number} i
   */
  public deleteContact(i: number) {
    this.contacts.removeAt(i);
    if (this._utilService.scrollElm) {
      setTimeout(() => {
        this.onAppScroll({target: {scrollingElement: this._utilService.scrollElm}});
      }, 250);
    }
  }

  /**
   * onSubmitForm
   */
  public onSubmitForm(): void {
    if (this.frm.invalid) {
      for (const field of Object.keys(this.frm.controls)) {
        if (field === 'contacts') {
          this.contacts.controls.forEach((blank: any, index) => {
            this._commonService.markAsDirtyForm(blank);
          });
          return;
        }
        this._commonService.markAsDirtyForm(this.frm);
      }
      return;
    }
    let listContacts = [];
    this.contacts.value.forEach((item, index) => {
      if (item.firstName === '' && item.lastName === ''
        && item.email === '' && item.phone === '' && item.cell === ''
        && item.role === null) {
        // empty
      } else {
        listContacts.push(item);
      }
    });
    const frmSubmit = Object.assign({...this.frm.value}, {contacts: listContacts});
    if (this.vendorInfo && this.vendorInfo.id) {
      this._vendorsEditService.updateVendor(this.vendorInfo.id, frmSubmit)
        .subscribe((resp: ResponseMessage<VendorInfo>) => {
          if (resp.status) {
            this.vendorInfo.contacts = resp.data.contacts;
            // update breadcrumb
            this.vendorInfo.company = this.frm.value.company;
            if (this.vendorInfo.contacts.length) {
              this.setContacts(this.vendorInfo.contacts);
            }
            this.preVendorEditData = _.cloneDeep(this.frm.getRawValue());
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    } else {
      let model = {
        ...frmSubmit,
        type: TypeEnum.Vendor
      };
      this._vendorsEditService.createVendor(model)
        .subscribe((resp: ResponseMessage<BasicVendor>) => {
          if (resp.status) {
            this._toastrService.success(resp.message, 'Success');
            // this.revertData(false);
            this._router.navigate(['vendors-management', resp.data.id]);
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
    if (this.vendorInfo && this.vendorInfo.id) {
      this._router.navigate(['vendors-management', this.vendorInfo.id]);
    } else {
      this._router.navigate(['vendors-management']);
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

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  public onAppScroll(event: any) {
    if (event.type === 'resize') {
      if (this._utilService.scrollElm &&
        this._utilService.scrollElm.scrollHeight - (this._utilService.scrollElm.scrollTop
          + window.innerHeight) < 110) {
        this.isShowStickyBtn = false;
      } else if (this._utilService.scrollElm) {
        this.isShowStickyBtn = true;
      }
      return;
    }
    if (event.target.scrollingElement.scrollHeight - (event.target.scrollingElement
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
