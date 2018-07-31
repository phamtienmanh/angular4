import {
  Component,
  OnInit,
  ViewEncapsulation,
  OnDestroy
} from '@angular/core';

import {
  PlatformLocation
} from '@angular/common';

import {
  ActivatedRoute,
  NavigationEnd,
  Router
} from '@angular/router';
import * as _ from 'lodash';

// Services
import {
  SalesOrderService
} from '../../../sales-order.service';
import {
  PrintLocationService
} from './print-location.service';
import {
  ToastrService
} from 'ngx-toastr';
import {
  LocalStorageService
} from 'angular-2-local-storage';
import {
  CommonService
} from '../../../../../shared/services/common/common.service';
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  Util
} from '../../../../../shared/services/util';
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  Subscription
} from 'rxjs/Subscription';
import { AuthService } from '../../../../../shared/services/auth/auth.service';
import { StylesInfoService } from '../styles-info.service';

// Components
import {
  SelectLocationComponent
} from './modules';

// Interfaces
import {
  ResponseMessage
} from '../../../../../shared/models/respone.model';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'print-location',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'print-location.template.html',
  styleUrls: [
    'print-location.style.scss'
  ]
})
export class PrintLocationComponent implements OnInit,
                                               OnDestroy {

  public orderIndex = {
    orderId: 0,
    styleId: 0,
    styleName: ''
  };

  public curPrintLocation = -1;
  public locationList = [];

  public subTabs = [
    {
      text: 'Detail',
      isActive: true,
      redirectUrl: 'detail'
    },
    // {
    //   text: 'Process',
    //   isActive: false,
    //   redirectUrl: 'process'
    // },
    {
      text: 'Art Files',
      isActive: false,
      redirectUrl: 'art-files'
    }
  ];
  public subscription: Subscription[] = [];
  public forwardId;
  public routeSub: Subscription;

  public preSelectionUrl;
  public previousUrl: string = '';

  public isPageReadOnly = false;
  public isStyleReadOnly = false;
  public isOrderArchived = false;
  public isOrderCancelled = false;
  public isStyleCancelled = false;

  private _printLocationRouteIndex: number;
  private _locationDetailRouteIndex: number;
  private _subOrderStatus: Subscription;
  private _subOrderData: Subscription;
  private _subStyleStatus: Subscription;

  constructor(private _toastrService: ToastrService,
              private _breadcrumbService: BreadcrumbService,
              private _localStorageService: LocalStorageService,
              private _printLocationService: PrintLocationService,
              private _salesOrderService: SalesOrderService,
              private _stylesInfoService: StylesInfoService,
              private _commonService: CommonService,
              private _location: PlatformLocation,
              private _router: Router,
              private _utilService: Util,
              private _activatedRoute: ActivatedRoute,
              private _authService: AuthService,
              private _modalService: NgbModal) {
    this.routeSub = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        if (this._printLocationRouteIndex !== null && !isNaN(this._printLocationRouteIndex)) {
          let idActive = this.locationList.findIndex((l) => l.isActive === true);
          if (idActive !== -1) {
            this.locationList[idActive].isActive = false;
          }
          this.locationList[this._printLocationRouteIndex].isActive = true;
          this.curPrintLocation = this._printLocationRouteIndex;
          this.subTabs.forEach((t) => {
            t.isActive = false;
          });
          this.subTabs[0].isActive = true;
          this.configFriendlyRoutes();

          this._printLocationService.printLocation
            .curLocation = this.locationList[this._printLocationRouteIndex].text;
          this._printLocationRouteIndex = null;
        }

        if (this._locationDetailRouteIndex) {
          let idActive = this.subTabs.findIndex((l) => l.isActive === true);
          if (idActive !== -1) {
            this.subTabs[idActive].isActive = false;
          }
          this.subTabs[this._locationDetailRouteIndex].isActive = true;

          if (idActive > -1 && this.locationList.length) {
            let activePrintLocation = this.locationList.find((i) => i.isActive);
            if (activePrintLocation) {
              this._printLocationService.printLocation.curLocation = activePrintLocation.text;
            }
          }

          this._locationDetailRouteIndex = null;
        }

        if (!val.urlAfterRedirects.includes('art-files')) {
          this._printLocationService.refreshLocation('print-location');
        }
        this.previousUrl = val.urlAfterRedirects;

        this.configNavTabs(val.urlAfterRedirects);
      }
    });
    this.subscription.push(_utilService.onRouteChange$.subscribe(
      (url: string) => {
        if (url.endsWith('print-location')) {
          this.reset();
          setTimeout(() => {
            this.ngOnInit();
          });
        }
      }));
    this.subscription.push(_printLocationService.getRefreshLocation().subscribe(
      (from: string) => {
        if (from === 'location-detail') {
          this.reset();
          this.ngOnInit();
        }
      }));
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
    this._printLocationService.printLocation.curLocation = '';
    this._printLocationService.printLocation.dataLocationList = [];

    this.orderIndex = this._salesOrderService.orderIndex;
    if (!this._router.url.endsWith('print-location')) {
      let urlObjList = this._router.url.split('/');
      if (Number.isNaN(Number.parseInt(urlObjList[urlObjList.length - 1]))) {
        this.forwardId = urlObjList[urlObjList.length - 2];
      } else {
        this.forwardId = urlObjList[urlObjList.length - 1];
      }
    }
    let getLocationListObser = this._commonService.getLocationList();
    let getPrintLocationObser = this._printLocationService
      .getPrintLocationInfo(this.orderIndex.styleId);
    Observable.forkJoin([getLocationListObser, getPrintLocationObser]).subscribe((results) => {
      this.getLocationList(results[0]);
      this.getPrintLocationInfo(results[1]);
    });
  }

  public getLocationList(resp) {
    if (resp.status) {
      // order locations by listed then alphabetical by name
      const order = { 'Front': 1, 'Back': 2, 'Left Sleeve': 3, 'Right Sleeve': 4 };
      resp.data = _.sortBy(resp.data, [(p) => { return order[p.name]; }, 'name']);
      resp.data.forEach((loc) => {
        this.locationList.push({
          text: loc.name,
          id: loc.id,
          checked: false,
          isActive: false,
          redirectUrl: this.beautyUrl(loc.name),
          index: order[loc.name] ? order[loc.name] : 99
        });
      });
    } else {
      this._toastrService.error(resp.errorMessages, 'Error');
    }
  }

  public getPrintLocationInfo(resp) {
    if (resp.data.remainPrintLocations.length > 0) {
      resp.data.remainPrintLocations.forEach((item) => {
        this._printLocationService.printLocation.dataLocationList[item.locationName] = item.id;
      });
    }
    if (resp.data.activePrintLocation) {
      this._printLocationService.printLocation
        .dataLocationList[resp.data.activePrintLocation.locationName]
        = resp.data.activePrintLocation.id;
    }

    this.locationList.forEach((loc, index) => {
      if (this.forwardId === loc.redirectUrl) {
        this.forwardId = loc.text;
      }
      if (this._printLocationService.printLocation
          .dataLocationList[loc.text]) {
        loc.checked = true;
      }
    });
    if (this.forwardId && this.curPrintLocation === -1) {
      const isNotNumber = isNaN(Number.parseInt(this.forwardId));
      if (this.forwardId === 'LABEL_DT') {
        let index = this.locationList.findIndex((loc) => loc.text.toLowerCase().includes('label'));
        this.curPrintLocation = index;
        this.locationList[index].isActive = true;
        this._printLocationService.printLocation.curLocation = this.locationList[index].text;
        this._printLocationService.refreshLocation('print-location');
      } else if (isNotNumber && this._printLocationService.printLocation
          .dataLocationList[this.forwardId]) {
        let index = this.locationList.findIndex((loc) => loc.text === this.forwardId);
        this.curPrintLocation = index;
        this.locationList[index].isActive = true;
        this._printLocationService.printLocation.curLocation = this.locationList[index].text;
        this._printLocationService.refreshLocation('print-location');
      } else if (!isNotNumber) {
        this.forwardId = Number.parseInt(this.forwardId);
        this.locationList.forEach((loc, index) => {
          if (this._printLocationService.printLocation
              .dataLocationList[loc.text] === this.forwardId) {
            this.curPrintLocation = index;
            loc.isActive = true;
            this._printLocationService.printLocation.curLocation = loc.text;
            if (loc.text.toLowerCase().includes('label')) {
              this._router.navigate(['LABEL_DT'],
                {
                  relativeTo: this._activatedRoute,
                  replaceUrl: true
                });
              this._printLocationService.refreshLocation('print-location');
            } else {
              this._router.navigate([loc.redirectUrl],
                {
                  relativeTo: this._activatedRoute,
                  replaceUrl: true
                });
              this._printLocationService.refreshLocation('print-location');
            }
          }
        });
      } else {
        this.locationList.forEach((loc, index) => {
          if (this._printLocationService.printLocation
              .dataLocationList[loc.text] && this.curPrintLocation === -1) {
            this.curPrintLocation = index;
            loc.isActive = true;
            this._printLocationService.printLocation.curLocation = loc.text;
            if (loc.text.toLowerCase().includes('label')) {
              this._router.navigate(['LABEL_DT'], {relativeTo: this._activatedRoute});
            } else {
              this._router.navigate([loc.redirectUrl],
                {relativeTo: this._activatedRoute});
            }
          }
        });
      }
    } else if (this.curPrintLocation === -1) {
      this.locationList.forEach((loc, index) => {
        if (this._printLocationService.printLocation
            .dataLocationList[loc.text] && this.curPrintLocation === -1) {
          this.curPrintLocation = index;
          loc.isActive = true;
          if (loc.text.toLowerCase().includes('label')) {
            this._router.navigate(['LABEL_DT'],
              {
                relativeTo: this._activatedRoute,
                replaceUrl: true
              });
          } else {
            this._router.navigate([loc.redirectUrl],
              {
                relativeTo: this._activatedRoute,
                replaceUrl: true
              });
          }
          this._printLocationService.printLocation.curLocation = loc.text;
        }
      });
    }
    this.configFriendlyRoutes();
  }

  public selectLocations() {
    let modalRef = this._modalService.open(SelectLocationComponent, {
      keyboard: true
    });
    modalRef.componentInstance.styleId = this.orderIndex.styleId;
    modalRef.componentInstance.locations = this.locationList;
    modalRef.result.then((res: any) => {
      if (res) {
        this.locationList = res;
        let idActive = this.locationList.findIndex((l) => l.isActive === true);
        if (idActive !== -1) {
          this.curPrintLocation = idActive;
          if (this.locationList[idActive].text.toLowerCase().includes('label')) {
            this._router.navigate(['LABEL_DT'],
              {relativeTo: this._activatedRoute});
          } else {
            this._router.navigate([this.locationList[idActive].redirectUrl],
              {relativeTo: this._activatedRoute});
          }
          this._printLocationService.printLocation.curLocation = this.locationList[idActive].text;
          this.subTabs.forEach((t) => {
            t.isActive = false;
          });
          this.subTabs[0].isActive = true;
        } else {
          this.curPrintLocation = -1;
        }
        this.deletePrintLocation();
        this.configFriendlyRoutes();
      } else {
        if (this._printLocationService.deleteCancelled) {
          this._printLocationService.deleteCancelled = false;
          this.selectLocations();
        }
      }
    }, (err) => {
      // if not, error
    });
  }

  public deletePrintLocation() {
    let model = {
      listPrintLocationIds: []
    };
    let deleteLocation = [];
    let isNoPrintLocation = true;
    this.locationList.forEach((loc) => {
      let plId = this._printLocationService.printLocation.dataLocationList[loc.text];
      if (plId && !loc.checked) {
        model.listPrintLocationIds.push(plId);
        deleteLocation.push(loc.text);
      }
      if (loc.checked) {
        isNoPrintLocation = false;
      }
    });
    if (model.listPrintLocationIds.length > 0) {
      this._printLocationService.deletePrintLocationDetail(this.orderIndex.styleId, model)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            deleteLocation.forEach((item) => {
              this._printLocationService.printLocation
                .dataLocationList[item] = undefined;
            });
            // navigate to print location if no print location
            if (isNoPrintLocation) {
              this._router.navigate([
                'order-log-v2',
                this.orderIndex.orderId,
                'styles',
                this.orderIndex.styleId,
                'print-location'
              ]);
            } else {
              this._printLocationService.refreshLocation('print-location');
            }
            this._toastrService.success(resp.message, 'Success');
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
  }

  public configFriendlyRoutes(): void {
    this._breadcrumbService
      .addFriendlyNameForRouteRegex(
        '^/order-log-v2/[0-9A-Za-z]+/styles/[0-9A-Za-z]+/print-location/[A-Za-z-]+$',
        this._printLocationService.printLocation.curLocation.replace(/- /, ''));
    this._breadcrumbService
      .addFriendlyNameForRouteRegex(
        '^/order-log-v2/[0-9A-Za-z]+/styles/[0-9A-Za-z]+/print-location/[A-Za-z-]+/art-files*$',
        'art files');
  }

  public switchTab(event: Event, index: number) {
    this._printLocationRouteIndex = index;
    if (this.locationList[index].text.toLowerCase().includes('label')) {
      this._router.navigate(['LABEL_DT'], {relativeTo: this._activatedRoute});
    } else {
      this._router.navigate([this.locationList[index].redirectUrl],
        {relativeTo: this._activatedRoute});
    }
  }

  public switchSubTab(event: Event, index: number) {
    this._locationDetailRouteIndex = index;
    let idActive = this.locationList.findIndex((l) => l.isActive === true);
    switch (index) {
      case 0:
        if (this.locationList[idActive].text.toLowerCase().includes('label')) {
          this._router.navigate(['LABEL_DT'], {relativeTo: this._activatedRoute});
        } else {
          this._router.navigate([this.locationList[idActive].redirectUrl],
            {relativeTo: this._activatedRoute});
        }
        break;
      // case 1:
      //   this._router.navigate(
      // [this.locationList[idActive].redirectUrl, 'process'], {relativeTo: this._activatedRoute}
      //   );
      //   break;
      case 1:
        this._router.navigate(
          [this.locationList[idActive].redirectUrl, 'art-files'], {relativeTo: this._activatedRoute}
        );
        break;
      default:
        break;
    }
  }

  public reset() {
    this.locationList = [];
    this.curPrintLocation = -1;
    this.subTabs = [
      {
        text: 'Detail',
        isActive: true,
        redirectUrl: 'detail'
      },
      // {
      //   text: 'Process',
      //   isActive: false,
      //   redirectUrl: 'process'
      // },
      {
        text: 'Art Files',
        isActive: false,
        redirectUrl: 'art-files'
      }
    ];
    this.forwardId = undefined;
  }

  public beautyUrl(urgly: string): string {
    let url = urgly.toLowerCase();
    url = url.replace(/- /g, '');
    url = url.replace(/ /g, '-');
    return url;
  }

  public configNavTabs(url: string): void {
    if (url) {
      // Reset status nav tab
      this.subTabs.forEach((tab) => tab.isActive = false);
      // Active current nav tab is selected
      this.subTabs.forEach((tab) => {
        tab.isActive = url.endsWith('/' + tab.redirectUrl);
      });
    }
    let haveTabActive = this.subTabs.some((tab) => {
      return tab.isActive;
    });
    if (!haveTabActive) {
      this.subTabs[0].isActive = true;
    }
  }

  public ngOnDestroy(): void {
    this._localStorageService.remove('backupData');
    this.subscription.forEach((s) => {
      s.unsubscribe();
    });
    this.previousUrl = '';
    this.routeSub.unsubscribe();
    this._subOrderStatus.unsubscribe();
    this._subOrderData.unsubscribe();
    this._subStyleStatus.unsubscribe();
  }
}
