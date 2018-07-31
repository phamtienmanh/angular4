import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  AfterViewChecked
} from '@angular/core';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  DatatableComponent
} from '@swimlane/ngx-datatable';

// Services
import {
  RegionManagementService
} from '../region-management.service';
import {
  Util
} from '../../../shared/services/util';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  AuthService
} from '../../../shared/services/auth';

// Interfaces
import {
  BasicResponse,
  SortEvent,
  ResponseMessage
} from '../../../shared/models';

// Components
import {
  ConfirmDialogComponent
} from '../../../shared/modules/confirm-dialog';
import {
  AddEditCustomComponent
} from '../../components/add-edit-custom';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'region-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'region-main.template.html',
  styleUrls: [
    'region-main.style.scss'
  ]
})
export class RegionMainComponent implements OnInit,
                                          AfterViewChecked {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild(DatatableComponent)
  public table: DatatableComponent;

  public currentComponentWidth;
  public selected = [];
  public searchText: string;
  public regionData = {
    totalRecord: 0,
    data: []
  };
  public tableConfig;

  public isPageReadOnly = false;

  constructor(private _modalService: NgbModal,
              private _regionManagementService: RegionManagementService,
              private _utilService: Util,
              private _authService: AuthService,
              private _toastrService: ToastrService,
              private _localStorageService: LocalStorageService) {
    const regionMainPageSize = this._localStorageService.get('regionMainPageSize');
    this.tableConfig = {
      keySort: 'name',
      keyword: '',
      orderDescending: false,
      currentPage: this._utilService.currentPage ? this._utilService.currentPage : 1,
      pageSize: regionMainPageSize ? regionMainPageSize : 10,
      loading: false
    };
  }

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Settings.ProductRegions');
    this.refreshDatatable(this.tableConfig.currentPage - 1);
  }

  /**
   * Check if the table size has changed, recalculate table size
   */
  public ngAfterViewChecked() {
    if (this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
      this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
      setTimeout(() => {
        this.table.recalculate();
      }, 200);
    }
  }

  public deleteRegion(region) {
    let modalRef = this._modalService.open(ConfirmDialogComponent, {
      keyboard: true
    });
    modalRef.componentInstance.message = 'All configuration data will be deleted for ' +
      'the region ‘' + region.name + '’. Continue?';
    modalRef.componentInstance.title = 'Confirm Region Deletion';

    modalRef.result.then((res: boolean) => {
      if (res) {
        if (region.id) {
          this._regionManagementService
            .deleteRegion(region.id)
            .subscribe((resp: BasicResponse) => {
              if (resp.status) {
                this._toastrService.success(resp.message, 'Success');
                this.refreshDatatable();
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
      }
    });
  }

  // ---------------------------------------------------------

  /**
   * Navigate to New region page
   */
  public addEditRegion(info?: any, index?: number): void {
    let modalRef = this._modalService.open(AddEditCustomComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static'
    });
    modalRef.componentInstance.title = 'Region';
    modalRef.componentInstance.customInfo = info;

    modalRef.result.then((res) => {
      if (res && res.frm) {
        if (info) {
          this._regionManagementService.updateRegion(res.frm.id, res.frm)
            .subscribe((resp: ResponseMessage<any>) => {
              if (resp.status) {
                this._toastrService.success(resp.message, 'Success');
                Object.assign(this.regionData.data[index], resp.data);
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        } else {
          this._regionManagementService.createRegion(res.frm)
            .subscribe((resp: ResponseMessage<any>) => {
              if (resp.status) {
                this._toastrService.success(resp.message, 'Success');
                this.refreshDatatable();
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
            });
        }
      }
    }, (err) => {
      // empty
    });
  }

  /**
   * Search text change event
   * @param value
   */
  public onSearchChanged(value: string): void {
    this.searchText = value;
    this.refreshDatatable();
  }

  /**
   * Sort change event
   * @param event
   */
  public onSort(event: SortEvent): void {
    this.tableConfig.keysort = event.sorts[0].prop;
    this.tableConfig.orderDescending = event.sorts[0].dir === 'desc';
    this.tableConfig.loading = true;
    this.refreshDatatable(this.tableConfig.currentPage - 1);
  }

  /**
   * Ajax datatable
   * @param {number} draw
   * @returns {Promise<boolean>}
   */
  public refreshDatatable(draw?: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this._regionManagementService.getListRegion()
        .subscribe((resp: ResponseMessage<any>): void => {
          if (resp.status) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;
            let responseData = resp.data;
            this.regionData.totalRecord = responseData.totalRecord;
            this.regionData.data = responseData.data;
            resolve(true);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
            reject(false);
          }
        });
    });
  }
}
