import {
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener
} from '@angular/core';

import {
  ActivatedRoute,
  NavigationEnd,
  Router
} from '@angular/router';

// Services
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  CommonService
} from '../../../shared/services/common';
import {
  AuthService
} from '../../../shared/services/auth';
import {
  ToastrService
} from 'ngx-toastr';
import {
  NgbDropdownConfig,
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  ProjectPrimaryService
} from './project-primary.service';
import {
  Util
} from '../../../shared/services/util';
import { ProgressService } from '../../../shared/services/progress';
import { EditUserService } from '../../../+user-management/+edit-user/edit-user.service';
import { UserContext } from '../../../shared/services/user-context';
import { ProjectManageService } from '../project-manage.service';

// Modules
import {
  CostingComponent,
  TscPresentationDateComponent,
  TscConceptBoardsComponent,
  LicensorSelectionComponent,
  ConceptApprovedComponent,
  PackagingApprovedComponent,
  TechDesignComponent,
  SamplesDeliveredComponent,
  BulkUploadComponent,
  CustomerPoReceiveComponent,
  Arrival3plComponent,
  PhysSampleExfactoryComponent,
  PpTestingFacilityComponent,
  PhysSampleActualComponent,
  PhysSampleApprovedComponent,
  PhysSampleDeliveredComponent,
  FinalApprovalComponent,
  XFactoryDateComponent,
  ReadyToShip3plComponent,
  QcSampleShipComponent
} from './modules';
import {
  ProductInfoComponent
} from '../../+products-main/+product-info';

// Interfaces
import {
  ResponseMessage,
  SortEvent
} from '../../../shared/models';
import {
  Subscription
} from 'rxjs/Subscription';
import {
  TaskStatus,
  StyleColumns,
  ColumnType,
  ProductType
} from './project-primary.model';
import { UploaderTypeComponent } from '../../../shared/modules/uploader-type';
import { LeadTimeComponent } from '../../../+order-log-v2/+outsource-main/modules';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'project-priority',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'project-primary.template.html',
  styleUrls: [
    'project-primary.style.scss'
  ]
})
export class ProjectPrimaryComponent implements OnInit, OnDestroy {
  public projectId: number;
  public projectPriorityData = {
    data: [],
    totalRecord: 0,
    totalPrintLocationsVertical: 0,
    totalPrintLocationsHorizontal: 0
  };
  public tableConfig;
  public taskStatus = TaskStatus;

  public isVerticalLayout = true;
  public isPageReadOnly = false;
  public isShowAllColumns = false;

  public header;
  public cloneHeader;
  public header2;
  public cloneHeader2;
  public fontSizeData = [
    '8px',
    '9px',
    '10px',
    '11px',
    '12px'
  ];
  public myConfigStyle = {
    'font-size': '11px'
  };
  public myConfigStyleHeader = {
    'font-size': '11px'
  };
  public myStyleColumns = StyleColumns;
  public showHideColumns = [];
  public columns = {};
  public isCheckedAll = true;
  public isOpenChangePopup = false;
  public isChangePopup = false;
  public columnType = ColumnType;
  public isAllCollapse = true;
  public productType;
  public cProductType = ProductType;
  public inDcStoreDateOnUtc;

  private _activatedSub: Subscription;

  constructor(private _changeDetectorRef: ChangeDetectorRef,
              private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _localStorageService: LocalStorageService,
              private _projectPrimaryService: ProjectPrimaryService,
              private _ngbDropdownConfig: NgbDropdownConfig,
              private _progressService: ProgressService,
              private _editUserService: EditUserService,
              private _userContext: UserContext,
              private _commonService: CommonService,
              private _toastrService: ToastrService,
              private _projectManageService: ProjectManageService,
              private _utilService: Util,
              private _modalService: NgbModal,
              private _authService: AuthService) {
    this._ngbDropdownConfig.autoClose = false;
    // --------------
    this.isPageReadOnly = !this._authService.checkCanModify('Projects.Projects');
    this._activatedSub = this._activatedRoute.parent.parent.params
      .subscribe((params: { id: number }) => {
        let id = Number(params.id);
        this.projectId = isNaN(id) ? undefined : params.id;
        if (/^\/projects\/[0-9]*\/project-priority$/.test(this._router.url)) {
          this.productType = ProductType.Priority;
        } else if (/^\/projects\/[0-9]*\/project-secondary$/.test(this._router.url)) {
          this.productType = ProductType.Secondary;
        }
      });
    let fontSize = this._localStorageService.get(this.productType === ProductType.Priority ?
      'fontSize_ProjectPriority' : 'fontSize_ProjectSecondary') as string;
    if (fontSize) {
      const modal = {'font-size': fontSize};
      Object.assign(this.myConfigStyle, modal);
      Object.assign(this.myConfigStyleHeader, modal);
    } else {
      this._localStorageService.set(this.productType === ProductType.Priority ?
        'fontSize_ProjectPrimary' : 'fontSize_ProjectSecondary', this.myConfigStyle['font-size']);
    }

    let colProjectConfigs = this.productType === ProductType.Priority ?
      this._userContext.currentUser.projectProductPrimaryConfigs :
      this._userContext.currentUser.projectProductSecondaryConfigs;
    const projectProductConfig = this._userContext.currentUser
      .permissions.filter((i) => i.type === 13);
    // Config columns
    if (colProjectConfigs && colProjectConfigs.length) {
      const colConfigs = colProjectConfigs.filter((i) => i.type === 13);
      if (colConfigs.length !== projectProductConfig.length) {
        this.showHideColumns = projectProductConfig;
      } else {
        colConfigs.forEach((i) => {
          let col = projectProductConfig.find((o) => o.id === i.id);
          if (col) {
            Object.assign(i, col);
          }
        });
        this.showHideColumns = colConfigs;
      }
      const storedColumnConfig = this._userContext.currentUser
        .permissions.filter((i) => i.type === 13);
      if (this.showHideColumns.length < storedColumnConfig.length) {
        let newColIndex;
        const newColConfig = storedColumnConfig
          .find((i, index) => {
            if (!this.showHideColumns.some((o) => o.name === i.name)) {
              newColIndex = index;
              return true;
            } else {
              return false;
            }
          });
        this.showHideColumns.push(newColConfig);
      }
      this.showHideColumns.forEach((item) => {
        const sameObj = this._userContext.currentUser.permissions.find((i) => i.name === item.name);
        if (sameObj) {
          item.isModify = sameObj.isModify;
        }
      });
    } else {
      this.showHideColumns = this._userContext.currentUser
        .permissions.filter((i) => i.type === 13);
    }
    this.showHideColumns.forEach((item) => {
      this.columns[item.name] = item.isView;
    });
    this.isCheckedAll = this.showHideColumns.every((i) => i.isView === true);
    this.isShowAllColumns = !!this._localStorageService.get('isShowAll_Outsource');

    // Config table
    this.tableConfig = {
      keySort: 'csr',
      orderDescending: false,
      loading: false
    };
  }

  public ngOnInit(): void {
    this._projectManageService.getProjectIndex()
      .subscribe((projectIndex) => {
        if (this.projectId) {
          this.isPageReadOnly = !this._authService.isAdmin()
            && !projectIndex.isProjectManager && !projectIndex.isProjectEditor;
          this.inDcStoreDateOnUtc = projectIndex.inDcStoreDateOnUtc;
          this._changeDetectorRef.markForCheck();
        }
      });
    // Prevent user navigate to another page when data not loaded yet
    const backdropElm = document.getElementById('backdrop');
    if (backdropElm && backdropElm.className.includes('none')) {
      backdropElm.className = '';
      this._changeDetectorRef.markForCheck();
    }
    this.getProjectPrimaryData().then((value: boolean) => {
      setTimeout(() => {
        if (this._utilService.scrollElm) {
          this._utilService.scrollElm
            .scrollTop = this._utilService.scrollPosition;
        }
      }, 200);
    });
  }

  /**
   * onAppScroll
   * @param event
   */
  @HostListener('window:scroll', ['$event'])
  public onAppScroll(event: any) {
    const fixedHeader = document.getElementById('header');
    const abHeader = document.getElementById('abHeader');
    if (!fixedHeader) {
      return;
    }
    if (event) {
      while (fixedHeader.firstChild) {
        fixedHeader.removeChild(fixedHeader.firstChild);
        if (!this.isVerticalLayout) {
          while (abHeader.firstChild) {
            abHeader.removeChild(abHeader.firstChild);
          }
        }
      }
    }
    if (fixedHeader && !fixedHeader.hasChildNodes()) {
      this.updateHeader();
    }
    if (event.target.scrollingElement.scrollTop >= 150
      && (this.header && this.header.getBoundingClientRect().top < 0
        || this.header2 && this.header2.getBoundingClientRect().top < 0)
      && fixedHeader && !fixedHeader.hasChildNodes()) {
      fixedHeader.appendChild(this.cloneHeader);
      if (this.cloneHeader2) {
        fixedHeader.appendChild(this.cloneHeader2);
        if (!this.isVerticalLayout && abHeader) {
          Array.from(fixedHeader.childNodes).forEach((node) => {
            abHeader.appendChild(node.cloneNode(true));
          });
        }
      }
    } else if ((this.header && this.header.getBoundingClientRect().top >= 0
      || this.header2 && this.header2.getBoundingClientRect().top >= 0)
      || (event.target.scrollingElement.scrollTop < 150
        && fixedHeader && fixedHeader.hasChildNodes())) {
      while (fixedHeader.firstChild) {
        fixedHeader.removeChild(fixedHeader.firstChild);
        if (!this.isVerticalLayout) {
          while (abHeader.firstChild) {
            abHeader.removeChild(abHeader.firstChild);
          }
        }
      }
    }
  }

  /**
   * updateHeader
   */
  public updateHeader(): void {
    const setHeader = (headerList) => {
      const _header = headerList;
      const _cloneHeader = _header.cloneNode(true);
      if (_header.children && _header.children.length) {
        Array.from(_header.children).forEach((el: any, index) => {
          let width = el.getBoundingClientRect().width + 'px';
          _cloneHeader.children[index].style.width = width;
          _cloneHeader.children[index].style.maxWidth = width;
          _cloneHeader.children[index].style.minWidth = width;
          if (!this.isVerticalLayout && index > 0) {
            _cloneHeader.children[index]
              .addEventListener('click', this.openEditProductPopup
                .bind(this, {target: {tagName: 'td'}},
                  this.projectPriorityData.data[index - 1], index - 1,
                  _cloneHeader.children[0].textContent));
          }
        });
      }
      return {
        header: _header,
        cloneHeader: _cloneHeader
      };
    };
    if (this.isVerticalLayout) {
      const headerList = document.querySelector('.table-header');
      if (headerList) {
        const headerRs = setHeader(headerList);
        this.header = headerRs.header;
        this.cloneHeader = headerRs.cloneHeader;
      }
      this.header2 = null;
      this.cloneHeader2 = null;
    } else {
      const headerList1 = document.querySelector('.find-header > .product-description');
      if (headerList1) {
        const headerRs = setHeader(headerList1);
        this.header = headerRs.header;
        this.cloneHeader = headerRs.cloneHeader;
        this.cloneHeader.className += ' fade-header';
      }
      const headerList2 = document.querySelector('.find-header > .product-visual');
      if (headerList2) {
        const headerRs = setHeader(headerList2);
        this.header2 = headerRs.header;
        this.cloneHeader2 = headerRs.cloneHeader;
        this.cloneHeader2.className += ' fade-header';
      }
    }
  }

  /**
   * Detect resize event of browser
   * @param event
   */
  @HostListener('window:resize', ['$event'])
  public onResize(event) {
    setTimeout(() => {
      this.updateHeader();
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  public trackByFn(index, item) {
    return index; // or item.id
  }

  /**
   * Sort change event
   * @param event
   */
  public onSort(event: SortEvent): void {
    this.tableConfig.keySort = event.sorts[0].prop;
    this.tableConfig.orderDescending = event.sorts[0].dir === 'desc';
    this.tableConfig.loading = true;
    this.updateHeader();
  }

  /**
   * goToOrderInfo
   * @param {number} orderId
   */
  public goToOrderInfo(ev, row, index, cellName): void {
    if (ev && ev.target.tagName === 'P' && this._authService.checkCanView('Orders')) {
      if (ev.view.getSelection().toString().length > 0 || !row.orderLogInfo.orderId) {
        ev.preventDefault();
        return;
      }
      this._utilService.scrollPosition = this._utilService
        .scrollElm.scrollTop;
      this._router.navigate([
        'order-log-v2',
        row.orderLogInfo.orderId,
        'order-info'
      ]);
    } else {
      this.openEditProductPopup(ev, row, index, cellName);
    }
  }

  /**
   * goToStyle
   * @param {number} orderId
   * @param {number} styleId
   */
  public goToStyle(ev, row, index, cellName): void {
    if (ev && ev.target.tagName === 'P' && this._authService.checkCanView('Orders')) {
      if (!row.orderLogInfo.orderId || !row.styleInfo.orderDetailId) {
        return;
      }
      this._utilService.scrollPosition = this._utilService
        .scrollElm.scrollTop;
      this._router.navigate([
        'order-log-v2',
        row.orderLogInfo.orderId,
        'styles',
        row.styleInfo.orderDetailId
      ]);
    } else {
      this.openEditProductPopup(ev, row, index, cellName);
    }
  }

  /**
   * canModifyCols
   * @param {string} colName
   * @returns {boolean}
   */
  public canModifyCols(colName: string): boolean {
    if (!this._authService.checkCanModify('Projects.Projects')) {
      return false;
    }
    const colObj = this.showHideColumns.find((i) => i.description === colName);
    if (colObj) {
      return colObj.isModify;
    }
    return false;
  }

  public canViewPages(page: string): boolean {
    return this._authService.checkCanView(page);
  }

  /**
   * onCheckedColsAll
   * @param event
   */
  public onCheckedColsAll(event: any): void {
    this.isCheckedAll = event.target['checked'];
    this.showHideColumns.forEach((col) => col.isView = event.target['checked']);
  }

  /**
   * changeCheckedCol
   * @param {Event} event
   */
  public changeCheckedCol(event: Event): void {
    this.isCheckedAll = this.showHideColumns.findIndex((col) => col.isView === false) === -1;
  }

  /**
   * onScrollX
   * @param event
   */
  public onScrollX(event): void {
    this.myConfigStyleHeader = {
      ...this.myConfigStyleHeader,
      left: this.header ? `${this.header.getBoundingClientRect().left}px` : 'auto',
      right: this.header ? `${this.header.getBoundingClientRect().right}px` : 'auto'
    };
  }

  /**
   * onChangeShowHideColumn
   * @param {boolean} isOpen
   */
  public onChangeShowHideColumn(isOpen: boolean): void {
    if (!isOpen) {
      let isEqual = false;
      this.showHideColumns.every((item) => {
        isEqual = this.columns[item.name] === item.isView;
        return isEqual;
      });
      if (!isEqual) {
        this._progressService.start();
        setTimeout(() => {
          this.showHideColumns.forEach((item) => {
            this.columns[item.name] = item.isView;
          });

          if (this._userContext.currentUser.permissions) {
            const pagePermissions = this._userContext.currentUser.permissions
              .filter((i) => i.type === 1);
            this._editUserService.updateColumnsConfig(this._userContext.currentUser.id,
              this.showHideColumns, this.productType === ProductType.Priority
                ? 'PROJECT_PRODUCT_PRIMARY_CONFIG' : 'PROJECT_PRODUCT_SECONDARY_CONFIG')
              .subscribe((resp: ResponseMessage<any>) => {
                if (resp.status) {
                  this._localStorageService.set('userInfo',
                    Object.assign({...this._userContext.currentUser},
                      {
                        permissions: [
                          ...pagePermissions,
                          ...this.showHideColumns
                        ]
                      }));
                  this._changeDetectorRef.markForCheck();
                } else {
                  this._toastrService.error(resp.errorMessages, 'Error');
                }
                this._progressService.done();
              });
          }
          this._changeDetectorRef.markForCheck();
          this.updateHeader();
        }, 200);
      }
    }
  }

  /**
   * changeFontSize
   * @param {string} fontSize
   */
  public onChangeFontSize(fontSize: string): void {
    this.myConfigStyle['font-size'] = fontSize;
    this.myConfigStyleHeader['font-size'] = fontSize;
    this._localStorageService.set(this.productType === ProductType.Priority ?
      'fontSize_ProjectPrimary' : 'fontSize_ProjectSecondary', fontSize);
    this._progressService.start();
    setTimeout(() => {
      this.updateHeader();
      this._progressService.done();
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  /**
   * showAllColumns
   * @param {boolean} isShowAll
   */
  public showAllColumns(): void {
    this._progressService.start();
    setTimeout(() => {
      this.isShowAllColumns = !this.isShowAllColumns;
      this._progressService.done();
      this._localStorageService.set(this.productType === ProductType.Priority
        ? 'isShowAll_ProjectPrimary' : 'isShowAll_ProjectSecondary',
        this.isShowAllColumns.toString());
      this.updateHeader();
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  /**
   * onChangeLayout
   */
  public onChangeLayout(isChange: boolean): void {
    if (this.isVerticalLayout !== isChange) {
      this._progressService.start();
      setTimeout(() => {
        this.isVerticalLayout = isChange;
        this._changeDetectorRef.markForCheck();
        this._progressService.done();
        setTimeout(() => {
          this._changeDetectorRef.markForCheck();
        });
      });
    }
  }

  public openNewProductPopup(): void {
    let modalRef = this._modalService.open(ProductInfoComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static'
    });
    modalRef.componentInstance.projectId = this.projectId;
    modalRef.result.then((res) => {
      if (res.status && res.data) {
        if (res.type === this.productType) {
          this.addNullDetails(res.data);
          this.projectPriorityData.data.reverse();
          this.projectPriorityData.data.push(res.data);
          this.projectPriorityData.data.reverse();
          this.projectPriorityData.totalRecord++;
          this._changeDetectorRef.markForCheck();
        }
      }
    }, (err) => {
      // empty
    });
  }

  public openEditProductPopup(ev, row, index, cellName): void {
    if (ev.target.tagName === 'IMG' || !this.canModifyCols(cellName)) {
      return;
    }
    let modalRef = this._modalService.open(ProductInfoComponent, {
      size: 'lg',
      keyboard: false,
      backdrop: 'static'
    });
    modalRef.componentInstance.projectId = this.projectId;
    modalRef.componentInstance.productId = row.productId;
    modalRef.result.then((res) => {
      if (res.status && res.data) {
        if (res.type === this.productType) {
          this.addNullDetails(res.data);
          Object.assign(row, res.data);
          this._changeDetectorRef.markForCheck();
        } else {
          this.projectPriorityData.totalRecord--;
          this.projectPriorityData.totalPrintLocationsVertical = this.projectPriorityData
            .totalPrintLocationsVertical - (row.printLocations.length + 2);
          this.projectPriorityData.totalPrintLocationsHorizontal -= row.printLocations.length;
          this.projectPriorityData.data.splice(index, 1);
          this._changeDetectorRef.markForCheck();
        }
      }
    }, (err) => {
      // empty
    });
  }

  public columnCanModify(arr: string[]): boolean {
    let canModify = false;
    let i = 0;
    do {
      canModify = canModify || this.canModifyCols(arr[i++]);
    } while (!canModify && i < arr.length);
    return canModify;
  }

  public onChangeLeadTime(row, colDetail, title, strArr): void {
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.columnCanModify(strArr)
        && !row.isCancelled
        && !row.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(LeadTimeComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.type = 'project';
        modalRef.componentInstance.title = title;
        modalRef.componentInstance.orderId = row.projectId;
        modalRef.componentInstance.orderDetailId = row.productId;
        modalRef.componentInstance.isPageReadOnly = !this.columnCanModify(strArr);
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onHover(ev, isHover, isElement, elmName, orderId, orderDetailId): void {
    if (!isElement) {
      return;
    }
    let elmList = [
      ...Array.from(document.querySelectorAll(`#${elmName}-${orderId}-${orderDetailId}`))
    ];
    let child = document.querySelector(`#${elmName}-${orderId}-${orderDetailId}-0`);
    if (child) {
      elmList.push(child);
    }
    let className;
    switch (elmName) {
      case 'csrCustPoRetailerPo':
        className = 'cell-hover-p';
        break;
      // case 'designDescriptionTotal':
      //   className = 'cell-hover-p';
      //   break;
      default:
        className = 'cell-hover';
        break;
    }
    elmList.forEach((elm) => {
      if (elm && isHover) {
        this.addClass(elm, className);
      } else {
        this.removeClass(elm, className);
      }
    });
  }

  public classList(elm) {
    return (' ' + (elm.className || '') + ' ').replace(/\s+/gi, ' ');
  }

  public hasClass(elm, n) {
    let list = typeof elm === 'string' ? elm : this.classList(elm);
    return list.indexOf(' ' + n + ' ') >= 0;
  }

  public addClass(element, name) {
    let oldList = this.classList(element);
    let newList = oldList + name;
    if (this.hasClass(oldList, name)) {
      return;
    }
    // Trim the opening space.
    element.className = newList.substring(1);
  }

  public removeClass(element, name) {
    let oldList = this.classList(element);
    let newList;

    if (!this.hasClass(element, name)) {
      return;
    }

    // Replace the class name.
    newList = oldList.replace(' ' + name + ' ', ' ');

    // Trim the opening and closing spaces.
    element.className = newList.substring(1, newList.length - 1);
  }

  /**
   * exportOrder
   * @param {string} exportType
   */
  public exportOrder(exportType: string) {
    // empty
  }

  public onChangeCosting(row, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Costing')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(CostingComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          } else {
            Object.assign(colDetail, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeTscPresentationDate(row, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('TSC Presentation Date')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(TscPresentationDateComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          } else {
            Object.assign(colDetail, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeTscConceptBoards(row, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('TSC Concept Boards for selection')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(TscConceptBoardsComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeLicensorSelection(row, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Retailer Selection (w/o concept approval)')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(LicensorSelectionComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeConceptApproved(row, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Concept Approved by Licensor')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(ConceptApprovedComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.rowDetail = Object.assign({
          ...row.licensingApproval
        }, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;
        modalRef.componentInstance.isLeadTimeReadOnly = this.isVerticalLayout;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangePackagingApproved(row, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Packaging approved by Licensor')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(PackagingApprovedComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static'
        });
        modalRef.componentInstance.rowDetail = Object.assign({
          ...row.licensingApproval
        }, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;
        modalRef.componentInstance.isLeadTimeReadOnly = this.isVerticalLayout;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeTechDesign(row, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Tech Design Review Date (PP)')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(TechDesignComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeSamplesDelivered(row, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Samples delivered to Customer (PP)')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(SamplesDeliveredComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          } else {
            Object.assign(colDetail, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeBulkUpload(row, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Bulk Upload')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(BulkUploadComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          } else {
            Object.assign(colDetail, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeCustomerPoReceive(row, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Customer PO Receive Date')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(CustomerPoReceiveComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          } else {
            Object.assign(colDetail, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeArrival3pl(row, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Arrival @ 3PL')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(Arrival3plComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangePhysSampleExFactoryPp(row, colDetail, ev): void {
    if (colDetail.isSetup || (ev && ev.target.className.includes('eta-date'))) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Phys. Sample Ex-Factory Date (PP)')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(PhysSampleExfactoryComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.rowDetail = Object.assign({
          ...row.physSampleExFactoryDatePpEta
        }, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangePPToTestingFacility(row, colDetail, ev): void {
    if (colDetail.isSetup || (ev && ev.target.className.includes('eta-date'))) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && this.canModifyCols('Phys. Sample Ex-Factory Date (PP To Testing Facility)')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(PpTestingFacilityComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.rowDetail = Object.assign({
          ...row.physSampleExFactoryDatePpEta
        }, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangePhysSampleDelivered(row, colDetail, ev): void {
    if (colDetail.isSetup || (ev && ev.target.className.includes('eta-date'))) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && this.canModifyCols('Phys. Sample Delivered to Testing Facility (PP)')
        && !row.orderLogInfo.isCancelled && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(PhysSampleDeliveredComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.rowDetail = Object.assign({
          ...row.physSampleDeliveredPpEta
        }, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangePhysSampleActual(row, colDetail, ev): void {
    if (colDetail.isSetup || (ev && ev.target.className.includes('eta-date'))) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Phys. Sample Actual Date Delivered (PP)')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(PhysSampleActualComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.rowDetail = Object.assign({
          ...row.physSampleDeliveredPpEta
        }, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangePhysSampleApproved(row, colDetail, ev): void {
    if (colDetail.isSetup || (ev && ev.target.className.includes('eta-date'))) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && this.canModifyCols('Phys. Sample Approved By Testing Facility (PP)')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(PhysSampleApprovedComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.rowDetail = Object.assign({
          ...row.physSampleApprovedPpEta
        }, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeQcSampleShipDate(row, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('QC Sample / Ship Date (PP)')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(QcSampleShipComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeFinalApproval(row, print, colDetail, ev): void {
    if (colDetail.isSetup || (ev && ev.target.className.includes('eta-date'))) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup && this.canModifyCols('Final Approval (PP)')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(FinalApprovalComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        // modalRef.componentInstance.printLocationId = item.printLocationId;
        modalRef.componentInstance.rowDetail = Object.assign({
          ...row.physSampleApprovedPpEta
        }, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.printLocationId = print.printLocationId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;
        modalRef.componentInstance.isLeadTimeReadOnly = true;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeXFactoryDate(row, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && this.canModifyCols('x-Factory Date')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(XFactoryDateComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public onChangeReadyToShip3Pl(row, colDetail): void {
    if (colDetail.isSetup) {
      return;
    }
    this.isOpenChangePopup = true;
    setTimeout(() => {
      if (this.isOpenChangePopup
        && this.canModifyCols('Ready To Ship @ 3PL')
        && !row.orderLogInfo.isCancelled
        && !row.styleInfo.isCancelled) {
        this.isChangePopup = true;
        let modalRef = this._modalService.open(ReadyToShip3plComponent, {
          size: 'lg',
          keyboard: false,
          backdrop: 'static',
          windowClass: 'eta-ls'
        });
        modalRef.componentInstance.rowDetail = Object.assign({}, colDetail);
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.componentInstance.productId = row.productId;
        // modalRef.componentInstance.styleList = row.styles
        //   .filter((order) => !order.isCancelled);
        modalRef.componentInstance.isPageReadOnly = this.isPageReadOnly;
        modalRef.componentInstance.type = 'project';

        modalRef.result.then((resp) => {
          if (resp.status) {
            this.addNullDetails(resp.data);
            Object.assign(row, resp.data);
          }
          this.isOpenChangePopup = false;
          this._changeDetectorRef.markForCheck();
        }, (err) => {
          this.isChangePopup = false;
          this.isOpenChangePopup = false;
        });
      } else {
        this.isOpenChangePopup = false;
      }
    }, 200);
  }

  public openUploader(row: any, columnType: number, title: string): void {
    this.isChangePopup = true;
    setTimeout(() => {
      this.isOpenChangePopup = false;
      this._projectPrimaryService.getFiles(this.projectId, row.productId, columnType)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            let modalRef = this._modalService.open(UploaderTypeComponent, {
              size: 'lg',
              keyboard: false,
              backdrop: 'static',
              windowClass: 'super-lg'
            });
            modalRef.componentInstance.title = title;
            Object.assign(modalRef.componentInstance.uploadOptions, {
              id: '',
              isReadOnly: true,
              fileList: resp.data
            });
            modalRef.result.then((res) => {
              this.isChangePopup = false;
            }, (err) => {
              this.isChangePopup = false;
            });
          } else {
            this.isChangePopup = false;
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }, 100);
  }

  public isLessThanTodayDate(date): boolean {
    if (!date) {
      return false;
    }
    const todayDateNum = new Date().setHours(0, 0, 0, 0);
    const completedDateNum = new Date(date).setHours(0, 0, 0, 0);
    return completedDateNum < todayDateNum;
  }

  public addNullDetails(row) {
    // fake printLocations data for render
    if (!row.printLocations || !row.printLocations.length) {
      row.printLocations = [null];
    }
  }

  public getObjectDetail(main, sub): void {
    return {...sub, ...main};
  }

  /**
   * getProjectPrimaryData
   * @returns {Promise<any>}
   */
  public getProjectPrimaryData(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.projectId) {
        this._projectPrimaryService.getPrimaryData(this.projectId, this.productType)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status && resp.data) {
              const responseData = resp.data;
              let totalPrintLocationsVertical = 0;
              let totalPrintLocationsHorizontal = 0;
              responseData.data.forEach((row) => {
                this.addNullDetails(row);
                totalPrintLocationsVertical = totalPrintLocationsVertical
                  + row.printLocations.length + 2;
                totalPrintLocationsHorizontal = totalPrintLocationsHorizontal
                  + row.printLocations.length;
              });
              this.projectPriorityData.data = responseData.data;
              this.projectPriorityData.totalRecord = responseData.totalRecord;
              this.projectPriorityData
                .totalPrintLocationsVertical = totalPrintLocationsVertical;
              this.projectPriorityData
                .totalPrintLocationsHorizontal = totalPrintLocationsHorizontal;
              this._changeDetectorRef.markForCheck();
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
        resolve(true);
      } else {
        this.projectPriorityData = undefined;
        resolve(false);
      }
      // Prevent user navigate to another page when data not loaded yet
      const backdropElm = document.getElementById('backdrop');
      if (backdropElm) {
        backdropElm.className = 'none';
      }
      this._changeDetectorRef.markForCheck();
    });
  }

  public ngOnDestroy(): void {
    this._activatedSub.unsubscribe();
    this._localStorageService.set(this.productType === ProductType.Priority
      ? 'isShowAll_ProjectPrimary' : 'isShowAll_ProjectSecondary', this.isShowAllColumns);
  }
}
