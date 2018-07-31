
import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  AfterViewInit,
  ElementRef,
  ChangeDetectorRef,
  Input,
  HostListener
} from '@angular/core';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';
import {
  FileUploader,
  FileSelectDirective,
  FileItem,
} from 'ng2-file-upload';
import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';
import _ from 'lodash';

// Services
import {
  UserContext
} from '../../../../../../../shared/services/user-context';
import {
  UploadService
} from './upload.service';

// Interfaces
import {
  ResponseMessage,
  UserInfo
} from '../../../../../../../shared/models';
import { AppConstant } from '../../../../../../../app.constant';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'upload',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'upload.template.html',
  styleUrls: [
    'upload.style.scss',
  ],
})
export class UploadComponent implements OnInit,
                                        AfterViewInit {
  @ViewChild(FileSelectDirective)
  public imgDirective: FileSelectDirective;
  @ViewChild('imageUpload')
  public imageUpload: ElementRef;

  @Input()
  public isReadOnly = false;

  @Input()
  public title = '';

  public uploader: FileUploader;
  public imageIdList = [];
  public locationType;
  public locationId;
  public whichUpload = 'checkbox';
  public updateData;
  public isReady = false;
  public enableCancel = true;
  public fileExist = [];
  public cloneFileExist = [];
  public tobeRemove = [];
  public descriptionData = [];

  public typeData = [
    {
      id: 3,
      text: 'Blank Submission Form'
    },
    {
      id: 4,
      text: 'Neck Label Art'
    },
    {
      id: 6,
      text: 'Other'
    },
    {
      id: 5,
      text: 'Production Art'
    },
    {
      id: 2,
      text: 'Tech Sheet'
    }
    // 'Tech Sheet',
    // 'Blank Submission Form',
    // 'Neck Label Art',
    // 'Production Art',
    // 'Other'
  ];
  public typeSelected = [];
  public typeActive = [];

  public isNeckLabel = false;

  public uploadType = 1;
  public userInfo: UserInfo;
  public isImageChangeCall = false;

  constructor(private _toastrService: ToastrService,
              private _userContext: UserContext,
              private _detector: ChangeDetectorRef,
              private _uploadService: UploadService,
              public activeModal: NgbActiveModal) {
    this.userInfo = this._userContext.currentUser;
  }

  public ngOnInit(): void {
    this.uploader = new FileUploader({
      url: `${AppConstant.domain}/api/v1/common/upload?type=${this.uploadType}`,
      method: 'POST',
      authToken: 'Bearer ' + this._userContext.userToken.accessToken
    });
    // Get image's info after uploaded
    this.uploader.onProgressAll = () => this._detector.detectChanges();
    this.uploader.onAfterAddingAll = () => {
      this.isReady = false;
    };
    this.uploader.onCompleteAll = () => {
      this.isReady = true;
      this.enableCancel = true;
    };
    if (this.fileExist.length) {
      this.isReady = true;
      this.cloneFileExist = this.fileExist.slice(0);
    }
    switch (this.locationType) {
      case 0:
        this.typeActive[0] = {
          id: 'Art Received', text: 'Art Received'
        };
        break;
      case 1:
        this.typeActive[0] = {
          id: 'Art Approved', text: 'Art Approved'
        };
        break;
      case 2:
        this.typeActive[0] = {
          id: 'Tech Sheet(s)', text: 'Tech Sheet(s)'
        };
        break;
      default:
        this.typeActive[0] = {
          id: 'Other', text: 'Other'
        };
        this.locationType = 6;
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
    };
  }

  public ngAfterViewInit(): void {
    // Overwrite onChange in ng2 upload directive
    // let self = this.imgDirective;
    // if (this.imgDirective) {
    //   this.imgDirective.onChange = () => {
    //     if (this.isReadOnly) {
    //       return;
    //     }
    //     //noinspection TypeScriptUnresolvedVariable
    //     let files = this.imageUpload.nativeElement.files;
    //     let options = self.getOptions();
    //     let filters = self.getFilters();
    //     self.uploader.addToQueue(files, options, filters);
    //   };
    // }
  }
  public startUpload() {
    if (!this.isImageChangeCall) {
      this.onImageChange();
    }
    this.uploader.uploadAll();
    this.isReady = false;
    this.enableCancel = false;
    if (!this.uploader.queue.length) {
      this.isReady = true;
      this.enableCancel = true;
    }
  }
  public onImageChange(event?) {
    this.isImageChangeCall = true;
    this.validateAndAddUrl(this.uploader.queue);
  }

  // Remove unformat files and add url for each files
  public validateAndAddUrl(images) {
    let error = 0;
    let listBlankFile = [];
    for (let i = images.length - 1; i >= 0; i--) {
      if (images[i].file.size === 0) {
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
    if (this.whichUpload === 'update') {
      if (images.length > 1) {
        if (!this.imageIdList.length) {
          this.clearQueue();
          if (this.fileExist.length) {
            this.isReady = true;
          }
        } else {
          this.uploader.queue.splice(1);
        }
        this._toastrService.error('You can only upload 1 image for update.', 'Error');
        return;
      }
      if (images[0].file.name !== this.cloneFileExist[0].fileName) {
        this.clearQueue();
        if (this.fileExist.length) {
          this.isReady = true;
        }
        this._toastrService
          .error('The update file must have the same name as the original file.', 'Error');
        return;
      }
      this.fileExist.splice(0, 1);
    } else {
      // if (this.fileExist.length) {
      //   for (let i = images.length - 1; i >= 0; i--) {
      //     let index = this.fileExist.findIndex((f) => f.fileName === images[i].file.name);
      //     if (index > -1) {
      //       this.fileExist.splice(index, 1);
      //     }
      //   }
      // }
    }
    this.configureUpload();
  }
  public configureUpload(): void {
    this.uploader.onProgressAll = () => this._detector.detectChanges();
    this.uploader.onCompleteItem = (item: FileItem, response: any, status: any, headers: any) => {
      if (response) {
        response = JSON.parse(response);
        if (!response.status) {
          if (response.errorMessages[0].includes('was previously uploaded')) {
            item.isUploaded = true;
            item['errorMsg'] = [];
            item['errorMsg'].push(`Image '`);
            item['errorMsg'].push(item['_file'].name);
            item['errorMsg'].push(`' was previously uploaded`);
          } else {
            item.isUploaded = false;
            item['errorMsg'] = response.errorMessages;
          }
          item.isSuccess = false;
          item.isError = true;
          item.progress = 0;
        } else {
          this.fileExist = this.fileExist.filter((o) => {
            return o.contentHash !== response.data[0].contentHash
              || o.uploadType !== response.data[0].uploadType;
          });

          item.file.size = response.data[0].size;
          item.file['absoluteUrl'] = response.data[0].absoluteUrl;
          this.imageIdList.push(
            {
              fileName: response.data[0].fileName,
              fileUrl: response.data[0].fileUrl,
              type: this.locationType,
              size: response.data[0].size,
              isApproved: this.locationType === 2,
              contentHash: response.data[0].contentHash
            }
          );
          item._form = response.data;
          if (this.locationType > 2) {
            return;
          }
          // push to file exist to sort
          this.fileExist.push(
            {
              absoluteUrl: response.data[0].absoluteUrl,
              fileName: response.data[0].fileName,
              fileUrl: response.data[0].fileUrl,
              type: this.locationType,
              size: response.data[0].size,
              isApproved: this.locationType === 2,
              contentHash: response.data[0].contentHash,
              isUpload: false,
              artFileTypeName: this.typeActive[0].text
            }
          );
          // slice from upload queue
          this.removeFromUploadQ(response.data[0].absoluteUrl);
          this.fileExist =
            _.orderBy(this.fileExist, ['uploadedOnUtc', 'fileName'], ['desc', 'asc']);
          this.descriptionData.forEach((d) => {
            let index = this.fileExist.findIndex((img) => img.fileName === d.file);
            if (index > -1) {
              this.fileExist[index].description = d.text;
            }
          });
        }
      }
    };
  }
  public onSubmit() {
    // upload file need to upload
    if (this.fileExist.length) {
      this.fileExist = this.fileExist.filter((f) => f.isUpload !== false);
    }
    this.descriptionData.forEach((item) => {
      let index = this.imageIdList.findIndex((img) => img.fileName === item.file);
      if (index > -1) {
        this.imageIdList[index].description = item.text;
      }

      index = this.fileExist.findIndex((img) => img.fileName === item.file);
      if (index > -1) {
        this.fileExist[index].description = item.text;
      }
    });
    this.typeSelected.forEach((item) => {
      let index = this.imageIdList.findIndex((img) => img.fileName === item.file);
      if (index > -1) {
        this.imageIdList[index].type = item.type;
      }

      index = this.fileExist.findIndex((img) => img.fileName === item.file);
      if (index > -1) {
        this.fileExist[index].type = item.type;
      }
    });
    if (this.whichUpload === 'update') {
      if (!this.fileExist.length) { // update with new file
        this.imageIdList[0].type = this.locationType;
        this.imageIdList[0].artFileId = this.updateData;
        this._uploadService.updateArtFiles(
          this.locationId,
          this.imageIdList,
          this.isNeckLabel
        ).subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this.activeModal.close(true);
          } else {
            if (this.uploader.queue.length === 0) {
              this.isReady = false;
            }
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          this.clearQueue();
          this.imageIdList = [];
        });
        // this._uploadService.createArtFiles(this.locationId, this.imageIdList)
        // .subscribe((resp: ResponseMessage<any>) => {
        //   if (resp.status) {
        //     this.activeModal.close(true);
        //   } else {
        //     if (this.uploader.queue.length === 0) {
        //       this.isReady = false;
        //     }
        //     this._toastrService.error(resp.errorMessages, 'Error');
        //   }
        //   this.clearQueue();
        //   this.imageIdList = [];
        // });
      } else {  // update with old file
        this.fileExist[0].artFileId = this.fileExist[0].id;
        this._uploadService.updateArtFiles(
          this.locationId,
          this.fileExist,
          this.isNeckLabel
        ).subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this.activeModal.close(true);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          this.fileExist = [];
          this.isReady = false;
        });
      }
    } else {
      let readyToClose = 0;
      let closeCount = 0;
      if (this.fileExist.length) {
        closeCount++;
        this.fileExist.forEach((item) => {
          item.artFileId = item.id;
        });
        this._uploadService.updateArtFiles(
          this.locationId,
          this.fileExist,
          this.isNeckLabel
        ).subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            readyToClose++;
            if (readyToClose === closeCount) {
              this.activeModal.close(true);
            }
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
          this.fileExist = [];
          this.isReady = false;
        });
      }
      if (this.imageIdList.length) {
        closeCount++;
        this._uploadService.createArtFiles(this.locationId, this.imageIdList, this.isNeckLabel)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              readyToClose++;
              if (readyToClose === closeCount) {
                this.activeModal.close(true);
              }
            } else {
              if (this.uploader.queue.length === 0) {
                this.isReady = false;
              }
              this._toastrService.error(resp.errorMessages, 'Error');
            }
            this.clearQueue();
            this.imageIdList = [];
          });
      }
      if (this.tobeRemove.length) {
        closeCount++;
        this._uploadService.deleteArtFile(this.tobeRemove, this.isNeckLabel, this.locationId)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              readyToClose++;
              if (readyToClose === closeCount) {
                if (closeCount === 1) {
                  this.activeModal.close('delete');
                } else {
                  this.activeModal.close(true);
                }
              }
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
    }
  }

  public updateDescription(event: Event, fileName) {
    let value = event.target['value'];
    let isExist = this.descriptionData.findIndex((dscrip) => dscrip.file === fileName);
    if (isExist > -1) {
      this.descriptionData[isExist].text = value;
    } else {
      this.descriptionData.push({file: fileName, text: value});
    }
  }

  public updateType(value: any, fileName: string) {
    let isExist = this.typeSelected.findIndex((type) => type.file === fileName);
    if (isExist > -1) {
      this.typeSelected[isExist].text = value.text || 'Other';
      this.typeSelected[isExist].type = value.id || 6;
    } else {
      this.typeSelected.push({file: fileName, text: value.text || 'Other', type: value.id || 6});
    }
  }

  public clearQueue() {
    this.uploader.clearQueue();
    this.isReady = false;
    this.descriptionData = [];
    this.typeSelected = [];
  }

  public removeItem(item: FileItem) {
    item.remove();
    let index = this.imageIdList.findIndex((file) => file.fileName === item.file.name);
    if (index > -1) {
      this.imageIdList.splice(index, 1);
      if (this.imageIdList.length === 0) {
        this.imageUpload.nativeElement.value = '';
      }
    }
    if (this.uploader.queue.length + this.fileExist.length === 0) {
      this.isReady = false;
    }
  }

  public removeExistItem(item: any) {
    let index = this.fileExist.findIndex((f) => f.fileUrl === item.fileUrl);
    if (index > -1) {
      // this._uploadService.deleteArtFile(item.id)
      // .subscribe((resp: ResponseMessage<any>) => {
      //   if (resp.status) {
      //     this._toastrService.success(resp.message, 'Success');
      //   } else {
      //     this._toastrService.error(resp.errorMessages, 'Error');
      //   }
      // });
      this.tobeRemove.push(item.id);
      this.fileExist.splice(index, 1);
    }
    // if (this.fileExist.length + this.uploader.queue.length === 0) {
    //   this.isReady = false;
    // }
  }

  public getExtension(url: string): string {
    if (!url) {
      return '';
    }
    let extension = url.split('.').pop();
    if (extension) {
      extension = extension.toLowerCase();
    } else {
      return 'file';
    }
    if (extension.includes('jpg') || extension.includes('png')) {
      return 'image';
    }
    if (extension.includes('pdf')) {
      return 'pdf';
    }
    return 'file';
  }

  public getType(item: FileItem): string {
    if (!item) {
      return '';
    }
    let type = item.file.type;
    if (type.includes('image') || type.includes('png')) {
      return 'image';
    }
    if (type.includes('pdf')) {
      return 'pdf';
    }
    return 'file';
  }

  public MathRound(size): number {
    return Math.round(size);
  }

  public removeFromUploadQ(absoluteUrl) {
    let index = this.uploader.queue.findIndex((u) => u.file['absoluteUrl'] === absoluteUrl);
    if (index > -1) {
      this.uploader.queue.splice(index, 1);
    }
  }

  /*-----------Drag & Drop Image Event-----------*/
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
    if (!this.isReadOnly) {
      this.uploader.addToQueue(ev.dataTransfer.files);
      this.onImageChange(ev);
    }
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

  /*---------------------------------------------*/
}
