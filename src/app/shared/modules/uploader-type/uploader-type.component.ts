import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';

import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import {
  UserContext,
  ValidationService
} from '../../../shared/services';
import {
  ToastrService
} from 'ngx-toastr';
import * as _ from 'lodash';

// Interfaces
import {
  FileItem,
  FileUploader
} from 'ng2-file-upload';
import {
  UploadedType
} from '../../../+order-log-v2/+sales-order';
import {
  UserInfo
} from '../../models';
import {
  StyleUploadedType
} from '../../../+order-log-v2/+sales-order/+order-styles/+styles-info/+style';
import { AppConstant } from '../../../app.constant';
import * as OrderItemTypes from '../../../+order-log-v2/+sales-order/+order-styles';

@Component({
  selector: 'uploader-type',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'uploader-type.template.html',
  styleUrls: [
    'uploader-type.styles.scss'
  ]
})
export class UploaderTypeComponent implements OnInit {
  @Input()
  public title = '';
  @Input()
  public selectTypeData = [];
  @Input()
  public styleId: number;
  @Input()
  public styleList = [];
  @Input()
  public uploadOptions = {
    id: '',
    uploadType: '',
    fileType: 1,
    fileList: [],
    isReadOnly: false,
    isTrimPopup: false
  };

  public uploader: FileUploader;
  public uploadedType = UploadedType;
  public styleUploadedType = StyleUploadedType;
  public uploadedTypeList = [
    {
      id: this.styleUploadedType.ShippingLabels,
      name: 'Shipping Labels'
    },
    {
      id: this.styleUploadedType.TscPackingList,
      name: 'TSC Packing List'
    },
    {
      id: this.styleUploadedType.FactoryPackingList,
      name: 'Factory Packing List'
    },
    {
      id: this.styleUploadedType.CommercialInvoice,
      name: 'Commercial Invoice'
    }
  ];
  public newList = [];
  public duplicatedList = [];
  public deletedList = [];
  public updateList = [];
  public userInfo: UserInfo;
  public frm: FormGroup;

  constructor(public activeModal: NgbActiveModal,
              private _detector: ChangeDetectorRef,
              private _toastrService: ToastrService,
              private _fb: FormBuilder,
              private _validationService: ValidationService,
              private _userContext: UserContext) {
    this.userInfo = this._userContext.currentUser;
  }

  public ngOnInit(): void {
    this.uploadOptions.fileList = _.orderBy(this.uploadOptions.fileList,
      ['uploadedOnUtc', 'fileName'], ['desc', 'asc']);
    if (+this.uploadOptions.uploadType >= 0) {
      this.uploader = new FileUploader({
        url: `${AppConstant.domain}/api/v1/common/upload?type=${this.uploadOptions.uploadType}`,
        authToken: 'Bearer ' + this._userContext.userToken.accessToken
      });
    } else {
      this.uploader = new FileUploader({
        authToken: 'Bearer ' + this._userContext.userToken.accessToken
      });
    }
    this.uploader.onAfterAddingFile = (f: any) => {
      let image = new Image();
      let file: File = f._file;
      let duplicateItem = this.uploader.queue.findIndex((o) => o._file.name === file.name
        && o._file.type === file.type);
      if ((f._file.size / 1048576) >= 50) {
        this.uploader.queue.splice(this.uploader.queue.length - 1, 1);
        this._toastrService.error('You cannot upload files more than 50MB.', 'Error');
        return;
      }
      if (duplicateItem !== this.uploader.queue.length - 1) {
        this.uploader.queue.splice(this.uploader.queue.length - 1, 1);
        return;
      }
      let fileReader: FileReader = new FileReader();
      fileReader.onloadend = (loadEvent: any) => {
        image.src = loadEvent.target.result;
        if (image.src.includes('data:image')) {
          f.imageSrc = image;
        }
      };
      fileReader.readAsDataURL(file);
      // Init url upload to file before upload
      f.onBeforeUpload = () => {
        // If allow select type to upload
        if (this.selectTypeData && this.selectTypeData.length) {
          f.uploadType = this.selectTypeData[0].name;
        }
        let type;
        switch (f.uploadType) {
          case 'CustomerPO':
            type = this.uploadedType.PoFiles;
            break;
          case 'OrderWorkSheets':
            type = this.uploadedType.OrderWorkSheets;
            break;
          case 'TechPacks':
            type = this.uploadedType.TechPacks;
            break;
          case 'BOL':
          case 'PackingList':
          case 'Other':
            type = this.uploadedType.Shipment;
            break;
          case 'Freight':
            type = this.uploadedType.Freight;
            break;
          case 'Shipping Labels':
            type = this.uploadedType.ShippingLabels;
            break;
          case 'TSC Packing List':
            type = this.uploadedType.TscPackingList;
            break;
          case 'Factory Packing List':
            type = this.uploadedType.FactoryPackingList;
            break;
          case 'Commercial Invoice':
            type = this.uploadedType.CommercialInvoice;
            break;
          default:
            break;
        }
        // ----------------------------------------------
        if (!isNaN(Number.parseInt(this.uploadOptions.uploadType))) {
          this.uploader.setOptions({
            // If upload type is available
            url: `${AppConstant.domain}/api/v1/common/upload?type=${
              !isNaN(Number.parseInt(this.uploadOptions.uploadType)) ? this.uploadOptions.uploadType
                : type}`,
            authToken: 'Bearer ' + this._userContext.userToken.accessToken
          });
        } else {
          // If upload type need select, assign first type without select other type
          this.uploader.setOptions({
            url: `${AppConstant.domain}/api/v1/common/upload?type=${type}`,
            authToken: 'Bearer ' + this._userContext.userToken.accessToken
          });
        }
      };
    };
    this.buildForm();
  }

  public buildForm(): void {
    this.frm = this._validationService.buildForm({
      applyToStyleList: this._fb.array(
        this.styleList.map((style) =>
          this._validationService.buildForm({
            styleId: new FormControl(style.id),
            styleFullName: new FormControl(this.getLabelString(style)),
            isSelected: new FormControl(this.styleId && style.id === this.styleId)
          }, {}, {}))
      )}, {}, {});
  }

  public getUploadTypeName(e): any {
    return _.get(this.uploadedTypeList
      .find((i) => i.id === e.type), 'name', '');
  }

  /**
   * onUploadChange
   * @param $event
   */
  public onUploadChange($event): void {
    let error = 0;
    let listBlankFile = [];
    for (let i = this.uploader.queue.length - 1; i >= 0; i--) {
      if (this.uploader.queue[i].file.size === 0) {
        listBlankFile.push(this.uploader.queue[i].file.name);
        this.uploader.queue.splice(i, 1);
        error++;
      }
    }
    if (error > 0) {
      const errMsg = `'${listBlankFile.join(`', '`)}'`;
      this._toastrService
        .error(`Empty files: ${errMsg} cannot upload.`, 'Error');
    }
    this.configureUpload();
  }

  /**
   * configureUpload
   */
  public configureUpload(): void {
    this.uploader.onProgressAll = () => this._detector.detectChanges();
    this.uploader.onCompleteItem = (item: any, resp) => {
      let response = JSON.parse(resp);
      if (response.status) {
        response.data.forEach((i) => {
          i.type = !!item.selectTypeValue ? item.selectTypeValue
            : this.selectTypeData && this.selectTypeData.length
              ? this.selectTypeData[0].id : this.uploadOptions.fileType;
          i.uploadType = item.uploadType;
          i.description = item['description'];
          i.uploadedType = new Date();
          this.uploader.removeFromQueue(item);
          let uploadedFileIndex = this.uploadOptions.fileList.findIndex((o) => {
            return o.contentHash === i.contentHash && o.type === i.type;
          });
          if (uploadedFileIndex > -1) {
            this.duplicatedList.push(this.uploadOptions.fileList[uploadedFileIndex]);
            this.uploadOptions.fileList.splice(uploadedFileIndex, 1);
          }
          // if same file is removed then add again
          // remove it from deleteList
          let deletedAddAgain = _.remove(this.deletedList, (f) => {
            return f.contentHash === i.contentHash;
          });
          // not add to newList again if file is upload again
          if (!deletedAddAgain.length && uploadedFileIndex < 0) {
            this.newList.push(i);
          }
          this.uploadOptions.fileList.push(i);
          this.uploadOptions.fileList = _.orderBy(this.uploadOptions.fileList,
            ['uploadedOnUtc', 'fileName'], ['desc', 'asc']);
        });
      } else {
        this._toastrService.error(response.errorMessages, 'Error');
      }
    };
  }

  /**
   * onRemoveFile
   * @param {number} index
   * @param item
   */
  public onRemoveFile(index: number, item): void {
    if (this.uploader.queue.indexOf(item) > -1) {
      this.uploader.queue.splice(index, 1);
      return;
    }
    if (this.uploadOptions.fileList[index].id) {
      _.remove(this.updateList, (f) => {
        return f.id === this.uploadOptions.fileList[index].id;
      });
      this.deletedList.push(this.uploadOptions.fileList[index]);
      this.uploadOptions.fileList.splice(index, 1);
    } else {
      this.uploadOptions.fileList.splice(index, 1);
      _.remove(this.newList, (f) => {
        return f.fileName === item.fileName;
      });
    }
  }

  /**
   * addUpdate
   * @param item
   */
  public addUpdate(item) {
    // item that is updated description
    let flag = this.updateList.some((file) => {
      return file.fileName === item.fileName && file.type === item.type;
    });
    if (!flag && item.id) {
      this.updateList.push(item);
    }
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
    if (!this.uploadOptions.isReadOnly) {
      this.uploader.addToQueue(ev.dataTransfer.files);
      this.onUploadChange(ev);
    }
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

  /*---------------------------------------------*/
  /**
   * onChangeType
   * @param event
   * @param item
   */
  public onChangeType(event, item): void {
    const value = +event.target.value;
    let type = null;
    const index = this.selectTypeData.findIndex((i) => i.id === value);
    if (index === -1) {
      return;
    }
    switch (event.target[index].text) {
      case 'CustomerPO':
      case 'RetailerPO':
        type = this.uploadedType.PoFiles;
        break;
      case 'OrderWorkSheets':
        type = this.uploadedType.OrderWorkSheets;
        break;
      case 'TechPacks':
        type = this.uploadedType.TechPacks;
        break;
      case 'BOL':
      case 'PackingList':
      case 'Other':
        type = this.uploadedType.Shipment;
        break;
      case 'Freight':
        type = this.uploadedType.Freight;
        break;
      case 'Shipping Labels':
        type = this.uploadedType.ShippingLabels;
        break;
      case 'TSC Packing List':
        type = this.uploadedType.TscPackingList;
        break;
      case 'Factory Packing List':
        type = this.uploadedType.FactoryPackingList;
        break;
      case 'Commercial Invoice':
        type = this.uploadedType.CommercialInvoice;
        break;
      default:
        break;
    }
    if (type) {
      item.selectTypeValue = value;
      item.uploadType = this.selectTypeData.find((i) => i.id === value).name;
      // If type selected, overwrite add url to file function
      item.onBeforeUpload = () => {
        this.uploader.setOptions({
          url: `${AppConstant.domain}/api/v1/common/upload?type=${type}`,
          authToken: 'Bearer ' + this._userContext.userToken.accessToken
        });
      };
    }
  }

  /**
   * isImageFile
   * @param {FileItem} item
   * @returns {boolean}
   */
  public isImageFile(item: FileItem): boolean {
    return item.file.type.includes('image');
  }

  /**
   * MathRound
   * @param size
   * @returns {number}
   * @constructor
   */
  public MathRound(size): number {
    return Math.round(size);
  }

  public getLabelString(style): string {
    let leftLabel = '';
    if (style.partnerStyle) {
      leftLabel += `(${style.partnerStyle}) `;
    }
    leftLabel += `${style.partnerStyleName ? style.partnerStyleName : ''}${style.partnerStyleName
    && style.blankStyle ? ' - ' : ''}${style.blankStyle ? style.blankStyle : ''}`;
    // ------------------------------------------
    let rightLabel = style.blankColor ? style.blankColor : '';
    // ------------------------------------------
    let itemType = '';
    switch (style.type) {
      case OrderItemTypes.ItemTypes.DOMESTIC:
        itemType = 'Domestic';
        break;
      case OrderItemTypes.ItemTypes.OUTSOURCE:
        itemType = 'Outsource';
        break;
      case OrderItemTypes.ItemTypes.IMPORTS:
        itemType = 'Imports';
        break;
      default:
        itemType = 'None';
        break;
    }
    return `${leftLabel}${leftLabel && rightLabel ? ' / ' : ''}${rightLabel} (${itemType})`;
  }

  /**
   * onSubmit
   */
  public onSubmit(): void {
    let applyToStyleIds = [];
    if (this.styleList.length) {
      this.frm.get('applyToStyleList').value.forEach((style) => {
        if (style.isSelected) {
          applyToStyleIds.push(style.styleId);
        }
      });
    }
    this.activeModal.close({
      status: true,
      applyToStyleIds,
      newList: this.newList,
      duplicatedList: this.duplicatedList,
      deletedList: this.deletedList,
      updateList: this.updateList
    });
  }

  /**
   * getExtension
   * @param {string} url
   * @returns {string}
   */
  public getExtension(url: string): string {
    if (url) {
      let extension = url.split('.').pop();
      if (extension) {
        extension = extension.toLowerCase();
      } else {
        return 'file';
      }
      if (extension === 'jpg' || extension === 'png') {
        return 'image';
      }
      if (extension === 'pdf') {
        return 'pdf';
      }
    }
    return 'file';
  }
}
