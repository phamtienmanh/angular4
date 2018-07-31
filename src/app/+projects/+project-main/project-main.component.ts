import {
  Component,
  ViewEncapsulation,
  OnInit,
  ViewChild,
  AfterViewChecked,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import {
  Router
} from '@angular/router';

import * as _ from 'lodash';

import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  DatatableComponent
} from '@swimlane/ngx-datatable';
import {
  AuthService,
  Util,
  UserContext
} from '../../shared/services';
import {
  ProjectMainService
} from './project-main.service';

// Interfaces
import {
  ResponseMessage,
  SortEvent,
  RowSelectEvent
} from '../../shared/models';

// Components
import {
  ConfirmDialogComponent
} from '../../shared/modules/confirm-dialog';
import {
  BasicResponse
} from '../../shared/models';
import { HttpParams } from '@angular/common/http';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'project-main',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'project-main.template.html',
  styleUrls: [
    'project-main.style.scss'
  ]
})
export class ProjectMainComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild('projectTable')
  public projectTable: DatatableComponent;
  public currentComponentWidth;
  public tableConfig;
  public projectsData = {
    totalRecord: 0,
    data: [],
    selected: {
      isCheckedAll: false,
      itemsChecked: [],
      itemsRemoved: []
    }
  };
  public isPageReadOnly = false;
  public isProjectManager = false;
  public isFilter = false;

  private _keyword = '';
  private _filterStr = '';

  constructor(private _router: Router,
              private _modalService: NgbModal,
              private _projectMainService: ProjectMainService,
              private _localStorageService: LocalStorageService,
              private _utilService: Util,
              private _userContext: UserContext,
              private _changeDetectorRef: ChangeDetectorRef,
              private _authService: AuthService,
              private _toastrService: ToastrService) {
    this.isPageReadOnly = !this._authService.checkCanModify('Projects.Projects');
    const projectMainPageSize = this._localStorageService.get('projectMainPageSize');
    this.tableConfig = {
      keySort: 'projectName',
      orderDescending: false,
      currentPage: this._utilService.currentPage ? this._utilService.currentPage : 1,
      pageSize: projectMainPageSize ? projectMainPageSize : 10,
      loading: false
    };
    this.isProjectManager = _.intersection([
        'Administrator',
        'Project Manager'
      ],
      this._userContext.currentUser.listRole.map((r) => r.roleName)).length > 0;
  }

  /**
   * Init data & Config text on breadcrumb
   */
  public ngOnInit(): void {
    // e
  }

  public ngAfterViewChecked(): void {
    // Check if the table size has changed
    if (this.tableWrapper &&
      this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
      this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
      setTimeout(() => {
        if (this.projectTable) {
          this.projectTable.recalculate();
        }
        this._changeDetectorRef.markForCheck();
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
    if (event) {
      event.cellElement.blur();
      this._utilService.currentPage = this.tableConfig.currentPage;
    }
  }

  public isViewProject(row): boolean {
    const curUserId = this._userContext.currentUser.id;
    const checkExistFunc = (arr): boolean => {
      return arr ? arr.some((i) => i.id === curUserId) : false;
    };
    return this._authService.isAdmin() || checkExistFunc(row.projectManagers)
      || checkExistFunc(row.projectEditors) || checkExistFunc(row.projectViewers);
  }

  public goToProjectInfo(projectId?: number): void {
    this._utilService.scrollPosition = this._utilService
      .scrollElm.scrollTop;
    if (projectId) {
      this._router.navigate([
        'projects',
        projectId
      ]);
    } else {
      this._router.navigate([
        'projects',
        'new-project'
      ]);
    }
  }

  public goToProductPrimary(productId: number): void {
    this._router.navigate([
      'projects',
      productId,
      'project-priority'
    ]);
  }

  public goToProductSecondary(productId: number): void {
    this._router.navigate([
      'projects',
      productId,
      'project-secondary'
    ]);
  }

  public deleteProject(row: any): void {
    let modalRef = this._modalService.open(ConfirmDialogComponent, {
      keyboard: true
    });
    modalRef.componentInstance
      .message = `Are you sure you want to delete
       the project '${row.name}'?`;
    modalRef.componentInstance.title = `Confirm Project Deletion`;

    modalRef.result.then((res: boolean) => {
      if (res) {
        this._projectMainService.deleteProject(row.id)
          .subscribe((resp: BasicResponse) => {
            if (resp.status) {
              this.refreshDatatable();
              this._toastrService.success(resp.message, 'Success');
            } else {
              if (resp.errorMessages[0].includes('used')) {
                this.refreshDatatable();
                this._toastrService.success('Disabled successfully', 'Success');
              } else {
                this._toastrService.error(resp.errorMessages, 'Error');
              }
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
    this._localStorageService.set('projectMainPageSize', pageSize);
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
      this._utilService.scrollPosition = this._utilService
        .scrollElm.scrollTop;
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
  }

  /**
   * onUpdateFilter
   * @param filterObj
   */
  public onUpdateFilter(filterObj: any): void {
    this._keyword = filterObj.keyword;
    this._filterStr = filterObj.filter;
    this.refreshDatatable();
  }

  /**
   * Fire filter event
   */
  public onFilter(filterObj: any): void {
    this._keyword = filterObj.keyword;
    this._filterStr = filterObj.filter;
    this.refreshDatatable();
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
    let filter = this._filterStr;

    let params: HttpParams = new HttpParams()
      .set('countSkip', countSkip)
      .set('pageSize', pageSize)
      .set('filter', filter)
      .set('keySort', keySort)
      .set('orderDescending', orderDescending)
      .set('utcOffset', (-1 * new Date().getTimezoneOffset() / 60).toString());

    this.isFilter = JSON.parse(filter).some((i) => !!i.value);

    return new Promise((resolve, reject) => {
      this._projectMainService.getListProject(params)
        .subscribe((resp: ResponseMessage<any>): void => {
          if (resp.status) {
            // Stop loading from linear loading bar of ngx-datatable
            this.tableConfig.loading = false;

            let responseData = resp.data;
            this.projectsData.totalRecord = responseData.totalRecord;
            responseData.data.forEach((p) => {
              const mapFunc = (names, list): void => {
                if (p[list] && p[list].length) {
                  p[names] = p[list].map((o) => o.fullName).join(', ');
                }
              };
              mapFunc('projectManagerNames', 'projectManagers');
              mapFunc('projectEditorNames', 'projectEditors');
              mapFunc('projectViewerNames', 'projectViewers');
            });
            this.projectsData.data = responseData.data;
            this._changeDetectorRef.markForCheck();
            resolve(true);
          } else {
            reject(false);
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    });
  }

  public trackByFn(index, item) {
    return index; // or item.id
  }

  public ngOnDestroy(): void {
    this._utilService.currentPage = this.tableConfig.currentPage;
  }
}
