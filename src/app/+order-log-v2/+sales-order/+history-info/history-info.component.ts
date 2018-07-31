import {
  Component,
  ViewEncapsulation,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewChecked
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Subscription
} from 'rxjs/Subscription';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  HistoryInfoService
} from './history-info.service';
import { Util } from '../../../shared/services/util';

// Interface
import {
  DatatableComponent
} from '@swimlane/ngx-datatable';
import {
  ResponseMessage,
  SortEvent
} from '../../../shared/models';
import {
  HistoryResponse
} from './history-info.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'history-info',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'history-info.template.html',
  styleUrls: [
    'history-info.style.scss'
  ]
})
export class HistoryInfoComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild(DatatableComponent)
  public table: DatatableComponent;

  public orderId: number;
  public searchText: string;
  public currentComponentWidth;
  public historyInfoData = {
    totalRecord: 0,
    data: [],
    selected: {
      isCheckedAll: false,
      itemsChecked: [],
      itemsRemoved: []
    }
  };
  public tableConfig = {
    keysort: '',
    keyword: '',
    orderDescending: false,
    currentPage: 1,
    pageSize: 10,
    loading: false
  };

  public activatedSub: Subscription;

  constructor(private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _historyInfoService: HistoryInfoService,
              private _utilService: Util,
              private _toastrService: ToastrService) {
    this.activatedSub = this._activatedRoute.parent.parent.params
      .subscribe((params: { id: number }) => {
        let id = Number(params.id);
        this.orderId = isNaN(id) ? undefined : params.id;
      });
  }

  public ngOnInit(): void {
    this.refreshDatatable().then((value: boolean) => {
      // if (this._utilService.currentPage > 1) {
      //   this.onPageChange(this._utilService.currentPage - 1);
      // }
    });
  }

  public ngAfterViewChecked() {
    // Check if the table size has changed
    if (this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
      this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
      setTimeout(() => {
        this.table.recalculate();
      }, 200);
    }
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
  public onSort(event: SortEvent): void {
    this.tableConfig.keysort = event.sorts[0].prop;
    this.tableConfig.orderDescending = event.sorts[0].dir === 'desc';
    this.tableConfig.loading = true;
    this.refreshDatatable(this.tableConfig.currentPage - 1);
  }

  /**
   * refreshDatatable
   * @param {number} draw
   * @returns {Promise<boolean>}
   */
  public refreshDatatable(draw?: number): Promise<boolean> {
    this.tableConfig.currentPage = draw ? draw + 1 : 1;
    let countSkip = draw ? draw * this.tableConfig.pageSize : 0;
    let pageSize = this.tableConfig.pageSize.toString();
    let orderDescending = this.tableConfig.orderDescending.toString();
    let keysort = this.tableConfig.keysort;
    let keyword = this.searchText;

    let params: HttpParams = new HttpParams()
      .set('countSkip', countSkip.toString())
      .set('pageSize', pageSize)
      .set('orderId', this.orderId.toString())
      .set('orderDescending', orderDescending)
      .set('keysort', keysort)
      .set('keyword', keyword);

    return new Promise((resolve, reject) => {
      this._historyInfoService.getHistoryInfo(params)
        .subscribe((resp: ResponseMessage<HistoryResponse>): void => {
          if (resp.status) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;
            let responseData = resp.data;
            this.historyInfoData.totalRecord = responseData.totalRecord;
            this.historyInfoData.data = responseData.data;
            resolve(true);
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
            reject(false);
          }
        });
    });
  }

  public ngOnDestroy(): void {
    this.activatedSub.unsubscribe();
  }
}
