import {
  OnInit,
  Component,
  ViewEncapsulation,
  ViewChild,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewChecked,
  OnDestroy
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  Router
} from '@angular/router';

import { Subscription } from 'rxjs';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  FileUploader
} from 'ng2-file-upload';
import _ from 'lodash';

// Services
import {
  UserContext
} from '../../../../../../shared';
import {
  PrintLocationService
} from '../print-location.service';
import {
  SalesOrderService
} from '../../../../sales-order.service';
import {
  ArtFilesService
} from './art-files.service';
import { AuthService } from '../../../../../../shared/services/auth';
import { StylesInfoService } from '../../styles-info.service';
import { Util } from '../../../../../../shared/services/util';

// Interfaces
import {
  ResponseMessage
} from '../../../../../../shared/models';
import {
  UploadComponent
} from '../modules';
import {
  DatatableComponent
} from '@swimlane/ngx-datatable';
import {
  ConfirmDialogComponent
} from '../../../../../../shared/modules/confirm-dialog';
import {
  AppConstant
} from '../../../../../../app.constant';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'art-files',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'art-files.template.html',
  styleUrls: [
    'art-files.style.scss'
  ]
})
export class ArtFilesComponent implements OnInit,
                                          AfterViewChecked,
                                          OnDestroy {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild(DatatableComponent)
  public table: DatatableComponent;
  @ViewChildren('rowCheckbox')
  public rowCheckbox: QueryList<ElementRef>;

  public orderIndex = {
    orderId: 0,
    styleId: 0
  };

  public currentComponentWidth;
  public selected = [];
  public searchText: string;
  public userData = {
    totalRecord: 0,
    data: [],
    selected: {
      isCheckedAll: false,
      itemsChecked: [],
      itemsRemoved: [],
      indeterminate: false
    }
  };
  public tableConfig = {
    keysort: 'uploaded',
    keyword: '',
    orderDescending: true,
    currentPage: 1,
    pageSize: 10,
    loading: false
  };

  public customerUploader: FileUploader;

  public locationId;

  public isNeckLabel = false;
  public isNoLabelData = false;

  public subscription: Subscription;

  public isPageReadOnly = false;
  public isStyleReadOnly = false;
  public isOrderArchived = false;
  public isOrderCancelled = false;
  public isStyleCancelled = false;

  private _subOrderStatus: Subscription;
  private _subOrderData: Subscription;
  private _subStyleStatus: Subscription;

  constructor(private _modalService: NgbModal,
              private _router: Router,
              private _userContext: UserContext,
              private _salesOrderService: SalesOrderService,
              private _printLocationService: PrintLocationService,
              private _stylesInfoService: StylesInfoService,
              private _utilService: Util,
              private _artFilesService: ArtFilesService,
              private _authService: AuthService,
              private _toastrService: ToastrService) {
    this.subscription = _printLocationService.getRefreshLocation().subscribe(
      (from: string) => {
        if (from === 'print-location') {
          this.locationId = undefined;
          this.ngOnInit();
        }
      });
  }

  public ngOnInit(): void {
    this._subOrderStatus = this._salesOrderService.getUpdateStatusOrder().subscribe((status) => {
      this.isPageReadOnly = status;
    });
    this._subOrderData = this._salesOrderService.getUpdateOrder().subscribe((orderData) => {
      this.isOrderArchived = orderData.isArchived;
      this.isOrderCancelled = orderData.isCancelled;
    });
    this._subStyleStatus = this._stylesInfoService.getUpdateStyle().subscribe((styleData) => {
      this.isStyleCancelled = styleData.isCancelled;
    });
    this.orderIndex = this._salesOrderService.orderIndex;
    this.customerUploader = new FileUploader({
      url: AppConstant.domain + '/api/v1/artfiles/upload',
      authToken: 'Bearer ' + this._userContext.userToken.accessToken
    });
    if (this._router.url.includes('neck-labels/art-files') && !this.isNeckLabel) {
      this.getNeckLabel();
      this.isNeckLabel = true;
    }
    if (!this.locationId && !this.isNeckLabel) {
      this.locationId = this._printLocationService.printLocation
        .dataLocationList[this._printLocationService.printLocation.curLocation];
    }
    if (this.locationId) {
      this.refreshDatatable().then((value: boolean) => {
        // empty
      });
    }
  }

  public ngAfterViewChecked() {
    // Check if the table size has changed
    // if (this.tableWrapper &&
    //   this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
    //   this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
    //   setTimeout(() => {
    //     let headerCellElement = document.getElementsByClassName('datatable-header-cell');
    //     let bodyCellElement = document.getElementsByClassName('datatable-body-cell');
    //     let headerW = Number.parseInt(
    //       window.getComputedStyle(headerCellElement[0], null).getPropertyValue('width')
    //     );
    //     let bodyCW = Number.parseInt(
    //       window.getComputedStyle(bodyCellElement[0], null).getPropertyValue('width')
    //     );
    //     for (let i = 0; i < Math.abs(bodyCW - headerW) + 1; i++) {
    //       this.table.recalculate();
    //     }

    //     if (window.innerWidth < 900) {
    //       let realW = 0;
    //       for (let i = 0; i < headerCellElement.length; i++) {
    //         if (i) {
    //           // this line just ignore fucking tslint rule
    //         }
    //         realW += Number.parseInt(
    //           window.getComputedStyle(headerCellElement[i], null).getPropertyValue('width')
    //         );
    //       }
    //       let tableRowEle = document.getElementsByClassName('datatable-body-row');
    //       let rowW = Number.parseInt(
    //         window.getComputedStyle(tableRowEle[0], null).getPropertyValue('width')
    //       );
    //       if (realW !== rowW) {
    //         for (let i = 0; i < tableRowEle.length; i++) {
    //           if (i) {
    //             // this line just ignore fucking tslint rule
    //           }
    //           tableRowEle[i]
    //             .setAttribute('style', 'width: ' + realW + 'px');
    //         }
    //       }
    //     }
    //   }, 200);
    // }
  }

  public getNeckLabel() {
    this._artFilesService.getNeckLabelInfo(this.orderIndex.styleId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.locationId = resp.data.id;
          this.isNoLabelData = !resp.data.hasNeckLabel;
          if (!this.isNoLabelData) {
            this.ngOnInit();
          }
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public addArtFile() {
    this._toastrService.success('Add successful!', 'Success');
  }

  /**
   * Update Art File
   */
  public updateArtFile(row): void {
    this._toastrService.success('Update successful!', 'Success');
  }

  /**
   * Delete selected row and update datatable
   */
  public deleteArtFile(row): void {
    let modalRef = this._modalService.open(ConfirmDialogComponent, {

      keyboard: true
    });
    modalRef.componentInstance
      .message = 'Are you sure you want to delete art file ' + row.fileName + ' ?';
    modalRef.componentInstance.title = 'Confirm Art File Deletion';

    modalRef.result.then((res: boolean) => {
      if (res) {
        this._artFilesService.deleteArtFile([row.id], this.isNeckLabel, this.locationId)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              this.refreshDatatable();
              this._toastrService.success('Art file(s) removed successfully.', 'Success');
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
    });
  }

  /**
   * Page size change event
   * @param pageSize
   */
  public onSelectedPageSize(pageSize: number): void {
    this.tableConfig.pageSize = pageSize;
    this.refreshDatatable();
  }

  /**
   * Page change event
   * @param draw
   */
  public onPageChange(draw: number): void {
    if (this._utilService.scrollElm) {
      this._utilService.scrollElm.scrollTop = 0;
      this._utilService.scrollPosition = 0;
    }
    this.tableConfig.currentPage = draw + 1;
    this.refreshDatatable(draw);
  }

  /**
   * Sort change event
   * @param event
   */
  public onSort(event): void {

    this.tableConfig.keysort = event.sorts[0].prop;
    this.tableConfig.orderDescending = event.sorts[0].dir === 'desc';

    let newArr = [];
    if (this.tableConfig.keysort === 'size') {
      newArr = [...this.userData.data];
      newArr.forEach((item) => {
        item.sortBySize = Number.parseInt(item.size, 10);
      });
      newArr = _.sortBy(newArr, 'sortBySize');
      newArr.forEach((item) => {
        delete item.sortBySize;
      });
    } else {
      newArr = _.sortBy(this.userData.data, this.tableConfig.keysort);
    }

    if (this.tableConfig.orderDescending) {
      this.userData.data = newArr.reverse();
    } else {
      this.userData.data = newArr;
    }
  }

  /**
   * Ajax datatable
   * @param draw
   */
  public refreshDatatable(draw?: number): Promise<boolean> {
    // Use View caching to get previous current page and assign countSkip
    // .....code here

    let params: HttpParams;
    if (!this.isNeckLabel) {
      params = new HttpParams()
        .set('printLocationId', this.locationId);
    } else {
      params = new HttpParams()
        .set('neckLabelId', this.locationId);
    }

    return new Promise((resolve, reject) => {
      this._artFilesService.getArtFiles(params, this.isNeckLabel)
        .subscribe((resp: ResponseMessage<any>): void => {
          if (resp.status) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;

            this.tableConfig.keysort = 'uploaded';
            this.tableConfig.orderDescending = true;

            this.userData.totalRecord = resp.data.totalRecord;
            this.userData.data = resp.data;
            this.userData.data = this.insertSpace(this.userData.data);
            this.preventBrowserCache();
            resolve(true);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
            reject(false);
          }
        });
    });
  }

  public openModal(data?) {
    if (this.locationId) {
      let modalRef = this._modalService.open(UploadComponent, {
        size: 'lg',
        keyboard: false,
        backdrop: 'static',
        windowClass: 'super-lg'
      });
      modalRef.componentInstance.locationType = 3;
      modalRef.componentInstance.locationId = this.locationId;
      modalRef.componentInstance.isNeckLabel = this.isNeckLabel;
      modalRef.componentInstance.isReadOnly = this.isPageReadOnly || this.isStyleReadOnly
        || this.isStyleCancelled || this.isOrderArchived || this.isOrderCancelled;
      if (data) {
        let obj = Object.assign({}, data);
        modalRef.componentInstance.fileExist = [obj];
        modalRef.componentInstance.locationType = data.type;
        modalRef.componentInstance.whichUpload = 'update';
        modalRef.componentInstance.updateData = data.id;
      }
      modalRef.result.then((res: any) => {
        if (res) {
          this.refreshDatatable();
          if (!data) {
            this.refreshDatatable();
            this._toastrService.success('Art file(s) uploaded successfully.',
              'Success');
          } else {
            this.refreshDatatable();
            this._toastrService.success('Art file(s) updated successfully.',
              'Success');
          }
        }
      }, (err) => {
        // if not, error
      });
    } else {
      this._toastrService.error('Please update detail first!',
        'Error');
    }
  }

  public preventBrowserCache() {
    this.userData.data.forEach((d, index) => {
      this.userData.data[index].absoluteUrl += '?' + new Date().getTime();
    });
  }

  public getExtension(url: string): string {
    let extension = url.split('.').pop();
    if (extension.includes('jpg') || extension.includes('png')) {
      return 'image';
    }
    if (extension.includes('pdf')) {
      return 'pdf';
    }
    return 'file';
  }

  public insertSpace(data) {
    let result = data;
    result.forEach((item) => {
      // let l =  item.artFileTypeName.length;
      for (let i = 1; i < item.artFileTypeName.length; i++) {
        if (item.artFileTypeName[i] >= 'A' && item.artFileTypeName[i] <= 'Z') {
          item.artFileTypeName =
            item.artFileTypeName.slice(0, i) + ' ' + item.artFileTypeName.slice(i);
          i++;
        }
      }
    });
    return result;
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
