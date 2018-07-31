import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnInit,
  ViewEncapsulation,
  EventEmitter
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

import {
  ProductInfoService
} from './product-info.service';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  CommonService
} from '../../../shared/services/common';
import {
  ValidationService
} from '../../../shared/services/validation';
import {
  UserContext
} from '../../../shared/services/user-context';
import * as NProgress from 'nprogress';
import * as _ from 'lodash';
import { RegionManagementService } from '../../../+settings/+region-management';

// Interfaces
import {
  BasicCustomerInfo,
  ResponseMessage
} from '../../../shared/models';
import {
  FileItem,
  FileUploader
} from 'ng2-file-upload';
import { UploadedImage } from '../../../shared/models';
import { Subject } from 'rxjs/Subject';
import { AppConstant } from '../../../app.constant';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'product-info',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'product-info.template.html',
  styleUrls: [
    'product-info.style.scss'
  ]
})
export class ProductInfoComponent implements OnInit {
  @Input()
  public productId;
  @Input()
  public projectId;
  @Input()
  public isPageReadOnly = false;

  public frm: FormGroup;
  public formErrors = {
    description: '',
    categoryId: '',
    type: '',
    projectId: '',
    customerId: '',
    factoryId: '',
    licensorId: '',
    licenseeId: '',
    regionIds: ''
    // factoryIds: ''
  };
  public validationMessages = {
    description: {},
    categoryId: {},
    type: {},
    projectId: {},
    customerId: {},
    factoryId: {},
    licensorId: {},
    licenseeId: {},
    regionIds: {
      required: 'At least 1 region must be specified.'
    },
    // factoryIds: {},
    default: {
      required: 'This is required.'
    }
  };
  public uploader: FileUploader;
  public customersData: BasicCustomerInfo[] = [];
  public licensorData = [];
  public licenseeData = [];
  public categoryData = [];
  public projectList = [];
  public factoryData = [];
  public serverSideA2000PoData = [];
  public a2000StyleData = [];
  public a2000ColorData = [];
  public regionsData = [];
  public typeData = [
    {
      id: 1,
      name: 'Primary'
    },
    {
      id: 2,
      name: 'Secondary'
    }
  ];
  public a2000PoIdChanged: Subject<string> = new Subject<string>();
  public a2000StyleTypeahead = new EventEmitter<string>();

  constructor(public activeModal: NgbActiveModal,
              private _validationService: ValidationService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _regionManagementService: RegionManagementService,
              private _userContext: UserContext,
              private _productInfoService: ProductInfoService) {
  }

  public ngOnInit(): void {
    this.buildForm();
    this.getCommonData();
    this.uploader = new FileUploader({
      url: `${AppConstant.domain}/api/v1/common/images/products`,
      authToken: 'Bearer ' + this._userContext.userToken.accessToken
    });
    this.a2000StyleTypeahead.pipe()
      .debounceTime(500)
      .subscribe((a2000PoId: string) => {
        this.getA2000Po(a2000PoId);
        // this.getStyleColorService(a2000PoId, true);
        this._changeDetectorRef.markForCheck();
      });
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public buildForm(): void {
    let controlConfig = {
      id: new FormControl(''),
      orderDetailId: new FormControl(null),
      description: new FormControl('', Validators.required),
      categoryId: new FormControl(null, Validators.required),
      type: new FormControl(null, Validators.required),
      regionIds: new FormControl([]),
      // factoryIds: new FormControl([], Validators.required),
      projectId: new FormControl(null),
      customerId: new FormControl(null),
      factoryId: new FormControl(null, Validators.required),
      licensorId: new FormControl(null),
      licenseeId: new FormControl(null),
      factoryName: new FormControl(''),
      a2000PoId: new FormControl(null),
      a2000StyleId: new FormControl(null),
      a2000StyleName: new FormControl(''),
      colorId: new FormControl(null),
      colorName: new FormControl(''),
      comments: new FormControl(''),
      imageUrl: new FormControl(''),
      absoluteUrl: new FormControl(''),
      formRequires: new FormControl({
        description: {
          required: true
        },
        categoryId: {
          required: true
        },
        projectId: {
          required: false
        },
        regionIds: {
          required: false
        },
        type: {
          required: true
        },
        customerId: {
          required: false
        },
        factoryId: {
          required: true
        },
        licensorId: {
          required: false
        },
        licenseeId: {
          required: false
        },
        // factoryIds: {
        //   required: true
        // },
        a2000PoId: {
          required: false
        },
        a2000StyleId: {
          required: false
        },
        colorId: {
          required: false
        },
        comments: {
          required: false
        },
        imageUrl: {
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

  public updateForm(data: any): void {
    if (data) {
      this.frm.patchValue(data);
    }
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    let totalRequestPending = 7;
    const markForCheck = () => {
      if (totalRequestPending === 0) {
        this._changeDetectorRef.markForCheck();
      } else {
        totalRequestPending--;
      }
    };
    this._regionManagementService.getListRegion()
      .subscribe((resp: ResponseMessage<any>): void => {
        if (resp.status) {
          this.regionsData = resp.data.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        markForCheck();
      });
    this._commonService.getCategory()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status && resp.data && resp.data.data) {
          this.categoryData = resp.data.data.filter((i) => !i.isDisabled);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        markForCheck();
      });
    this._commonService.getLicensorList()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.licensorData = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        markForCheck();
      });
    this._commonService.getLicenseeList()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.licenseeData = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        markForCheck();
      });
    this._productInfoService.getAllFactories()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.factoryData = resp.data.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        markForCheck();
      });
    this._commonService.getCustomersList()
      .subscribe((resp: ResponseMessage<BasicCustomerInfo[]>) => {
        if (resp.status) {
          this.customersData = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        markForCheck();
      });
    this._commonService.getProjectManageByUser()
      .subscribe((resp: ResponseMessage<BasicCustomerInfo[]>) => {
        if (resp.status) {
          this.projectList = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        markForCheck();
      });
    if (this.productId) {
      this._productInfoService.getProductById(this.projectId, this.productId)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this.updateForm(resp.data);
            this.getA2000Po(resp.data.a2000PoId);
            this.getStyleColorService(resp.data.a2000PoId);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
  }

  public getA2000Po(a2000PoId, isInput = false): void {
    let params: HttpParams = new HttpParams()
      .set('customerPoId', a2000PoId);
    if (this.frm.get('customerId').value) {
      params = params.set('customerId', this.frm.get('customerId').value);
    }
    this._productInfoService.getA2000Po(this.projectId, params)
      .subscribe((res: ResponseMessage<any>) => {
        if (res.status) {
          this.serverSideA2000PoData = res.data;
        } else {
          this._toastrService.error(res.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
  }

  public getStyleColorService(a2000PoId, isInput = false): void {
    let customerId = this.frm.get('customerId').value;
    this._productInfoService.getStyleColor(this.projectId, customerId, a2000PoId)
      .subscribe((res: ResponseMessage<any>) => {
        if (res.status) {
          this.a2000StyleData = res.data;
          this.a2000ColorData = _.get(res.data.find((i) =>
            i.a2000StyleId === this.frm.get('a2000StyleId').value), 'colors', []);
          if (isInput) {
            [
              'a2000StyleId',
              'a2000StyleName',
              'colorId',
              'colorName'
            ].forEach((control) => {
              this.frm.get(control).patchValue(null);
            });
          }
        } else {
          this._toastrService.error(res.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
  }

  public onSelectOpen(select: NgSelectComponent): void {
    if (!select.multiple && select.selectedItems && select.selectedItems.length) {
      let filterVal = select.selectedItems[0].label;
      select.filterValue = filterVal ? filterVal : '';
    }
  }

  public get regionsString(): string {
    const regionArr = this.regionsData
      .filter((i) => this.frm.get('regionIds').value.indexOf(i.id) > -1);
    if (regionArr && regionArr.length) {
      return regionArr.map((i) => i.name).join(', ');
    } else {
      return '';
    }
  }

  public onSelectItem(val, valProp: string, formControlName: string): void {
    if (val[valProp]) {
      this.frm.get(formControlName).patchValue(val[valProp]);
      if (formControlName === 'a2000StyleName') {
        this.a2000ColorData = val['colors'];
        this.frm.get('colorId').patchValue(null);
        this.frm.get('colorName').patchValue(null);
      }
      if (formControlName === 'colorName' && val['orderDetailId']) {
        this.frm.get('orderDetailId').patchValue(val['orderDetailId']);
      }
      if (formControlName === 'a2000PoId') {
        this.getStyleColorService(val[valProp], true);
      }
    } else {
      // add new
      this.frm.get(formControlName).patchValue(val);
    }
    this._changeDetectorRef.markForCheck();
  }

  public getFactoryNamesString(frm): string {
    const factoryIds = frm.get('factoryIds').value;
    return this.factoryData.filter((i) => factoryIds.indexOf(i.id) > -1)
      .map((i) => i.name).join(', ');
  }

  public onClearItem(select, formControl: string[]): void {
    formControl.forEach((control) => {
      this.frm.get(control).patchValue(null);
    });
    select.close();
    select.open();
  }

  public getStyleColor($event) {
    if (!$event.target || !$event.target.value) {
      return;
    }
    this.a2000PoIdChanged.next($event.target.value);
  }

  /**
   * Upload image
   */
  public uploadImage() {
    // Start upload avatar
    if (!this.uploader.queue.length) {
      return;
    }
    this.uploader.queue[this.uploader.queue.length - 1].upload();
    // Start loading bar while uploading
    this.uploader.onProgressItem = () => NProgress.start();
    this.uploader.onCompleteAll = () => NProgress.done();
    this.uploader.onSuccessItem = (item: FileItem, resp: string) => {
      let res: ResponseMessage<UploadedImage> = JSON.parse(resp);
      if (res.status) {
        this.frm.patchValue({
          imageUrl: res.data.relativeUrl,
          absoluteUrl: res.data.absoluteUrl
        });
        this.frm.get('imageUrl')
          .markAsDirty();
        this.frm.get('imageUrl')
          .markAsTouched();
        // Clear uploaded item in uploader
        this.uploader.clearQueue();
      } else {
        this.uploader.clearQueue();
        let inputFile = document.getElementById('styleInputFile') as HTMLInputElement;
        if (inputFile) {
          inputFile.value = '';
        }
        this._toastrService.error(res.errorMessages, 'Error');
      }
      this._changeDetectorRef.markForCheck();
    };
  }

  /**
   * Remove image
   */
  public removeImage(frm: FormGroup) {
    frm.patchValue({
      imageUrl: '',
      absoluteUrl: ''
    });
    frm.get('imageUrl').markAsDirty();
    frm.get('imageUrl').markAsTouched();
  }

  /*-----------Drag & Drop Image Event-----------*/
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
    ev.path.map((item) => {
      if (item.className && item.className.includes('upload-box')) {
        let index: number = Number(item.classList[item.classList.length - 1]);
        this.uploadImage();
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

  /*-----------Drag & Drop Image Event-----------*/

  public checkFormValid(): boolean {
    if (this.frm.invalid) {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
    return this.frm.valid;
  }

  public onSubmitForm(): void {
    if (this.checkFormValid()) {
      let modal = this.frm.getRawValue();
      if (!modal.a2000PoId) {
        modal.a2000StyleId = null;
        modal.colorId = null;
      }
      delete modal['formRequires'];
      if (!this.productId) {
        this._productInfoService.createProduct(this.projectId, modal)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              this.activeModal.close({
                ...resp,
                type: modal.type
              });
              this._toastrService.success(resp.message, 'Success');
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      } else {
        this._productInfoService.updateProduct(this.projectId, this.productId, modal)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              this.activeModal.close({
                ...resp,
                type: resp.data ? modal.type : null
              });
              this._toastrService.success(resp.message, 'Success');
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
    } else {
      this._commonService.markAsDirtyForm(this.frm, true);
    }
  }
}
