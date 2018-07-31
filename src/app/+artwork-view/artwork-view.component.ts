import {
  Component,
  ViewEncapsulation,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  ElementRef,
  AfterViewChecked,
  AfterViewInit,
  HostListener
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  Router
} from '@angular/router';

// Interface
import {
  SearchObj,
  ArtworkResponse,
  ArtworkViewColumns
} from './artwork-view.model';
import {
  SortEvent,
  ResponseMessage,
  RowSelectEvent
} from '../shared/models';
import {
  BasicCsrInfo,
  BasicCustomerInfo
} from '../shared/models';

// Services
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  ToastrService
} from 'ngx-toastr';
import {
  DatatableComponent
} from '@swimlane/ngx-datatable';
import {
  CommonService
} from '../shared/services/common';
import {
  ArtworkViewService
} from './artwork-view.service';
import {
  Util
} from '../shared/services/util';
import {
  IMyDateModel,
  IMyDpOptions
} from 'mydatepicker';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  MyDatePickerService
} from '../shared';
import {
  AuthService
} from '../shared/services/auth';
import { ProgressService } from '../shared/services/progress';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'artwork-view',  // <artwork-view></artwork-view>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'artwork-view.template.html',
  styleUrls: [
    'artwork-view.style.scss'
  ]
})
export class ArtworkViewComponent implements OnInit, AfterViewChecked {

  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild('artworkTable')
  public artworkTable: DatatableComponent;
  @ViewChildren('rowCheckbox')
  public rowCheckbox: QueryList<ElementRef>;
  public currentComponentWidth;
  public myConfigStyle = {
    'font-size': '11px'
  };
  public myConfigStyleHeader = {
    'font-size': '11px'
  };
  public myStyleColumns = ArtworkViewColumns;
  public header;
  public cloneHeader;
  public searchObj = new SearchObj();
  public myDateRangePickerOptions = {
    selectorWidth: '220px',
    dateFormat: 'mm/dd/yyyy',
    showTodayBtn: false,
    showClearDateBtn: true,
    alignSelectorRight: true,
    openSelectorOnInputClick: true,
    editableDateField: true,
    selectionTxtFontSize: '12px',
    height: '28px',
    firstDayOfWeek: 'su',
    sunHighlight: false
  };
  public printDateBeginOptions: any = {
    ...this.myDateRangePickerOptions
  };
  public printDateEndOptions: any = {
    ...this.myDateRangePickerOptions
  };
  public dueDateBeginOptions: any = {
    ...this.myDateRangePickerOptions
  };
  public dueDateEndOptions: any = {
    ...this.myDateRangePickerOptions
  };

  public artworkData = {
    totalRecord: 0,
    data: [],
    selected: {
      isCheckedAll: false,
      itemsChecked: [],
      itemsRemoved: []
    }
  };
  public tableConfig;

  public csrsData: BasicCsrInfo[] = [];
  public customersData: BasicCustomerInfo[] = [];

  public isPageReadOnly = false;

  private _filter: any;

  constructor(private _router: Router,
              private _artworkService: ArtworkViewService,
              private _commonService: CommonService,
              private _utilService: Util,
              private _authService: AuthService,
              private _breadcrumbService: BreadcrumbService,
              private _toastrService: ToastrService,
              private _progressService: ProgressService,
              private _localStorageService: LocalStorageService,
              public myDatePickerService: MyDatePickerService) {
    // Config font size
    let fontSize = this._localStorageService.get('fontSize_ArtworkView') as string;
    if (fontSize) {
      const modal = {'font-size': fontSize};
      Object.assign(this.myConfigStyle, modal);
      Object.assign(this.myConfigStyleHeader, modal);
    } else {
      this._localStorageService.set('fontSize_ArtworkView', this.myConfigStyle['font-size']);
    }
    // -------------------

    const artMainPageSize = this._localStorageService.get('artMainPageSize');
    this.tableConfig = {
      keySort: 'designId',
      keyword: '',
      orderDescending: false,
      currentPage: this._utilService.currentPage ? this._utilService.currentPage : 1,
      pageSize: artMainPageSize ? artMainPageSize : 10,
      loading: false
    };
  }

  /**
   * Init data & Config text on breadcrumb
   */
  public ngOnInit(): void {
    // Check current page have access or not? If not the browser will redirect to 'Not Found' page
    this.isPageReadOnly = !this._authService.checkCanModify('ArtworkView');
    this._breadcrumbService
      .addFriendlyNameForRoute('/artwork-view', 'Artwork');

    // this.refreshDatatable(this.tableConfig.currentPage - 1).then((value: boolean) => {
    //   setTimeout(() => {
    //     if (this._utilService.scrollElm) {
    //       this._utilService.scrollElm
    //         .scrollTop = this._utilService.scrollPosition;
    //     }
    //   }, 200);
    // });
    this.getCommonData();
  }

  /**
   * Check if the table size has changed, recalculate table
   */
  public ngAfterViewChecked() {
    if (this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
      this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
      setTimeout(() => {
        this.artworkTable.recalculate();
      }, 200);
    }
  }

  /**
   * Row detail click event
   * @param event
   */
  public onActivate(event: RowSelectEvent): void {
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    if (event.cellIndex === 0) {
      return;
    } else {
      this._utilService.currentPage = this.tableConfig.currentPage;
      this._utilService.artId = event.row.id;
      if (event.row.orderId && event.row.styleId && event.row.id) {
        if (event.row.table === 'necklabel') {
          this._router.navigate([
            'order-log-v2',
            event.row.orderId,
            'styles',
            event.row.styleId,
            'neck-labels'
          ]);
        } else {
          this._router.navigate([
            'order-log-v2',
            event.row.orderId,
            'styles',
            event.row.styleId,
            'print-location',
            event.row.id
          ]);
        }
      }
    }
  }

  public goToStyle(orderId: number, styleId: number): void {
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    this._router.navigate(['order-log-v2', orderId, 'styles', styleId]);
  }

  public goToSample(orderId: number, styleId: number): void {
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    this._router.navigate(['order-log-v2', orderId, 'styles', styleId, 'samples']);
  }

  public goToNeckLabelSetup(orderId, styleId): void {
    if (this._authService.checkCanView('Orders')) {
      this._utilService.scrollPosition = this._utilService
        .scrollElm.scrollTop;
      this._router.navigate([
        'order-log-v2', orderId, 'styles',
        styleId, 'neck-labels'
      ]);
    }
  }

  public goToPrintLocation(orderId: number,
                           styleId: number,
                           printLocationId: number,
                           neckLabelId: number): void {
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    if (!neckLabelId) {
      this._router
        .navigate(['order-log-v2', orderId, 'styles', styleId, 'print-location', printLocationId]);
    } else {
      this._router
        .navigate(['order-log-v2', orderId, 'styles', styleId, 'neck-labels']);
    }
  }

  @HostListener('window:scroll', ['$event'])
  public onAppScroll(event?: any) {
    const fixedHeader = document.getElementById('header');
    if (!fixedHeader) {
      return;
    }
    if (event) {
      while (fixedHeader.firstChild) {
        fixedHeader.removeChild(fixedHeader.firstChild);
      }
    }
    if (fixedHeader && !fixedHeader.hasChildNodes()) {
      this.updateHeader();
    }
    if (event.target.scrollingElement.scrollTop >= 300
      && this.header.getBoundingClientRect().top < 0
      && fixedHeader && !fixedHeader.hasChildNodes()) {
      fixedHeader.appendChild(this.cloneHeader);
    } else if ((this.header.getBoundingClientRect().top >= 0)
      || (event.target.scrollingElement.scrollTop < 300
        && fixedHeader && fixedHeader.hasChildNodes())) {
      while (fixedHeader.firstChild) {
        fixedHeader.removeChild(fixedHeader.firstChild);
      }
    }
  }

  public updateHeader(): void {
    const dataTableList = document.getElementsByTagName('ngx-datatable');
    if (dataTableList && dataTableList.length) {
      const headerList = dataTableList[0].getElementsByClassName('datatable-header');
      if (headerList && headerList.length) {
        this.header = headerList[0];
        this.cloneHeader = this.header.cloneNode(true);
        this.cloneHeader.className += ' fade-header';
      }
    }
  }

  public onScrollX(event): void {
    this.myConfigStyleHeader = {
      ...this.myConfigStyle,
      left: this.header ? `${this.header.getBoundingClientRect().left}px` : 'auto'
    };
  }

  /**
   * onUpdateFilter
   * @param filterObj
   */
  public onUpdateFilter(filterObj: any): void {
    this._filter = filterObj.filter;
    this.refreshDatatable(this.tableConfig.currentPage - 1)
      .then((value: boolean) => {
        setTimeout(() => {
          if (this._utilService.scrollElm) {
            this._utilService.scrollElm
              .scrollTop = this._utilService.scrollPosition;
          }
        }, 200);
      });
  }

  public onChangeFontSize(fontSize: string): void {
    this.myConfigStyle['font-size'] = fontSize;
    this.myConfigStyleHeader['font-size'] = fontSize;
    this._localStorageService.set('fontSize_ArtworkView', fontSize);
    this._progressService.start();
    if (this.artworkTable) {
      this.recalculateWidth(this.artworkTable.columns);
      this.artworkTable.recalculate();
    }
    setTimeout(() => {
      this.updateHeader();
      this._progressService.done();
    }, 200);
  }

  public recalculateWidth(columns: any[]): void {
    columns.forEach((col) => {
      col.width = this.myStyleColumns[this.myConfigStyle['font-size']][col.prop].width;
      col.minWidth = this.myStyleColumns[this.myConfigStyle['font-size']][col.prop].width;
      col.cellClass = this.myStyleColumns[this.myConfigStyle['font-size']][col.prop].cellClass;
    });
  }

  /**
   * Page size change event
   * @param pageSize
   */
  public onSelectedPageSize(pageSize: number): void {
    this._localStorageService.set('artMainPageSize', pageSize);
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
    this.tableConfig.keySort = event.sorts[0].prop;
    this.tableConfig.orderDescending = event.sorts[0].dir === 'desc';
    this.tableConfig.loading = true;
    this.refreshDatatable(this.tableConfig.currentPage - 1);
    this.updateHeader();
  }

  /**
   * Fire filter event
   */
  public onFilter(filterObj: any): void {
    this._filter = filterObj.filter;
    this.refreshDatatable();
  }

  /**
   * Fire date change event with prop
   * @param event
   */
  public onDateChanged(event: IMyDateModel, prop: string) {
    let utcDate = Object.assign({}, event);
    if (utcDate.jsdate) {
      utcDate.jsdate.setHours(utcDate.jsdate.getHours() - utcDate.jsdate.getTimezoneOffset() / 60);
    }
    this.searchObj.filterSearch[prop] = utcDate.jsdate;

    switch (prop) {
      case 'printDateBegin':
        let newPrintDateEndOptions: IMyDpOptions
              = Object.assign({}, this.printDateEndOptions);
        newPrintDateEndOptions.disableUntil = utcDate.date;
        newPrintDateEndOptions.enableDays = [utcDate.date];
        this.printDateEndOptions = newPrintDateEndOptions;
        break;
      case 'printDateEnd':
        let newPrintDateBeginOptions: IMyDpOptions
              = Object.assign({}, this.printDateBeginOptions);
        newPrintDateBeginOptions.disableSince = utcDate.date;
        newPrintDateBeginOptions.enableDays = [utcDate.date];
        this.printDateBeginOptions = newPrintDateBeginOptions;
        break;
      case 'dueDateBegin':
        let newDueDateEndOptions: IMyDpOptions
              = Object.assign({}, this.dueDateEndOptions);
        newDueDateEndOptions.disableUntil = utcDate.date;
        newDueDateEndOptions.enableDays = [utcDate.date];
        this.dueDateEndOptions = newDueDateEndOptions;
        break;
      case 'dueDateEnd':
        let newDueDateBeginOptions: IMyDpOptions
              = Object.assign({}, this.dueDateBeginOptions);
        newDueDateBeginOptions.disableSince = utcDate.date;
        newDueDateBeginOptions.enableDays = [utcDate.date];
        this.dueDateBeginOptions = newDueDateBeginOptions;
        break;
      default:
        return;
    }
  }

  /**
   * Fire data change event
   * @param value
   * @param valueProp
   * @param formProp
   */
  public onSelectValueChange(value: any, valueProp: string, formProp: string): void {
    this.searchObj.filterSearch[formProp] = value.text;
  }

  /**
   * Get data & Bind to select
   */
  public getCommonData(): void {
    this._commonService.getCustomersList()
      .subscribe((resp: ResponseMessage<BasicCustomerInfo[]>) => {
        if (resp.status) {
          this.customersData = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public getVendorStyleColor(row): string {
    return `${row.blankStyle} ${row.blankStyle && row.colorName
      ? '/' : ''} ${row.colorName}`;
  }

  /**
   * Ajax datatable
   * @param draw
   */
  public refreshDatatable(draw?: number): Promise<boolean> {
    this.tableConfig.currentPage = draw ? draw + 1 : 1;
    let countSkip = (draw ? draw * this.tableConfig.pageSize : 0).toString();
    let pageSize = this.tableConfig.pageSize.toString();
    let orderDescending = this.tableConfig.orderDescending.toString();
    let keySort = this.tableConfig.keySort;
    let keyword = this.searchObj.textSearch.keyword;
    let filter = this._filter;

    let params: HttpParams = new HttpParams()
      .set('countSkip', countSkip)
      .set('pageSize', pageSize)
      .set('keyword', keyword)
      .set('filter', filter)
      .set('keySort', keySort)
      .set('orderDescending', orderDescending);
    return new Promise((resolve, reject) => {
      this._artworkService.getListArtwork(params)
        .subscribe((resp: ResponseMessage<ArtworkResponse>): void => {
          if (resp.status) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;

            let responseData = resp.data;
            this.artworkData.totalRecord = responseData.totalRecord;
            this.artworkData.data = responseData.data;
            if (this.artworkData.data) {
              this.recalculateHeightCell(this.artworkData.data);
            }
            resolve(true);
          } else {
            reject(false);
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    });
  }

  public resetHeightCell(pendingSamplesData: any[]): void {
    pendingSamplesData.forEach((row) => {
      row.printLocations.forEach((style, styleIndex) => {
        style.style = {
          height: `auto`
        };
      });
      row.style = {
        height: `auto`
      };
    });
    if (this.artworkTable) {
      this.artworkTable.recalculate();
    }
  }

  public recalculateHeightCell(pendingSamplesData: any[]): void {
    this.resetHeightCell(pendingSamplesData);
    pendingSamplesData.forEach((row) => {
      setTimeout(() => {
        let maxHeightPrintLocation = 0;
        row.printLocations.forEach((print, printIndex) => {
          const getMaxHeightPrintLocation = (listCols: string[]): number => {
            let defaultHeight = 50;
            if (print.imageUrl) {
              defaultHeight = 90;
            }
            listCols.forEach((col) => {
              const colElm = document
                .getElementById(`${row.id}-${print.printLocationId}-${col}`);
              if (colElm) {
                defaultHeight = colElm.offsetHeight > defaultHeight
                  ? colElm.offsetHeight : defaultHeight;
              }
            });
            return defaultHeight;
          };
          const listCols = [
            'printLocation',
            'printMethod',
            'printMachine',
            'dimensions',
            'printApprovedDateOnUtc'
          ];
          print.style = {
            height: `${getMaxHeightPrintLocation(listCols)}px`
          };
          maxHeightPrintLocation += getMaxHeightPrintLocation(listCols);
        });
      }, 500);
    });
    setTimeout(() => {
      if (this.artworkTable) {
        this.artworkTable.recalculate();
      }
    }, 200);
  }
}
