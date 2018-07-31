import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  NavigationEnd
} from '@angular/router';

import {
  Subscription
} from 'rxjs/Subscription';

import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  BreadcrumbService
} from 'ng2-breadcrumb/ng2-breadcrumb';
import {
  AuthService
} from '../../../../../../shared/services/auth/auth.service';
import {
  SalesOrderService
} from '../../../../sales-order.service';
import {
  OwsTechpackService
} from '../ows-techpack.service';
import {
  FabricQualityService
} from './fabric-quality.service';

// Interfaces
import {
  ResponseMessage
} from '../../../../../../shared/models/respone.model';

// Components
import {
  AddFabricComponent
} from './components/add-fabric';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'fabric-quality',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'fabric-quality.template.html',
  styleUrls: [
    'fabric-quality.style.scss'
  ]
})
export class FabricQualityComponent implements OnInit, OnDestroy {
  public orderIndex: any = {
    orderId: 0,
    styleId: 0,
    customer2Type: 0,
    styleName: ''
  };
  public tabs: any[] = [];
  public canModifyOws = true;
  public isPageReadOnly = false;

  private _subRouter: Subscription;
  private _subOwsStatus: Subscription;
  private _subFabric: Subscription;

  constructor(private _modalService: NgbModal,
              private _activatedRoute: ActivatedRoute,
              private _router: Router,
              private _breadcrumbService: BreadcrumbService,
              private _toastrService: ToastrService,
              private _authService: AuthService,
              private _salesOrderService: SalesOrderService,
              private _owsTechpackService: OwsTechpackService,
              private _fabricQualityService: FabricQualityService) {
    this.orderIndex = this._salesOrderService.orderIndex;
  }

  public ngOnInit(): void {
    // Config active nav tab when router changes
    this._subRouter = this._router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.configNavTabs();
      }
    });
    this._subOwsStatus = this._owsTechpackService.getUpdateOws().subscribe((status) => {
      this.canModifyOws = status;
    });
    this._subFabric = this._fabricQualityService.getUpdateFabric().subscribe((data) => {
      this.getFabricList();
    });
  }

  public getFabricList(): void {
    this.tabs = [];
    this._fabricQualityService.getFabricList(this.orderIndex.styleId)
      .subscribe((resp: ResponseMessage<any[]>) => {
        if (resp.status) {
          resp.data.forEach((fabr) => {
            this.tabs.push({
              ...fabr,
              isActive: false,
              name: fabr.fabric,
              redirectUrl: fabr.id
            });
          });
          this.configNavTabs();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  /**
   * Active nav tab is selected
   * @param url
   */
  public configNavTabs(): void {
    this.tabs.forEach((item) => {
      this._breadcrumbService.addFriendlyNameForRouteRegex(
        '^/order-log-v2/[0-9A-Za-z]+/styles/[0-9A-Za-z]+/ows-techpack/fabric-quality/'
        + item.redirectUrl + '$', item.name);
      item.isActive = false;
      if (this._router.url.endsWith('/' + item.redirectUrl)) {
        item.isActive = true;
      }
    });
    let haveTabActive = this.tabs.some((tab) => {
      return tab.isActive;
    });
    if (!haveTabActive && this.tabs[0]) {
      this._router.navigate([this.tabs[0].redirectUrl], {
        relativeTo: this._activatedRoute,
        replaceUrl: true
      });
    }
  }

  public switchTab(event: Event, tabIndex: number): void {
    if (this.tabs[tabIndex].isDisable) {
      return;
    }
    this._router.navigate([this.tabs[tabIndex].redirectUrl], {relativeTo: this._activatedRoute});
  }

  public addFabric() {
    let modalRef = this._modalService.open(AddFabricComponent, {
      keyboard: false,
      backdrop: 'static'
    });

    modalRef.result.then((res) => {
      if (res && res.data) {
        this._fabricQualityService.createFabric(this.orderIndex.styleId, res.data)
          .subscribe((resp: ResponseMessage<any>) => {
            if (resp.status) {
              const fabr = resp.data;
              this._toastrService.success(resp.message, 'Success');
              this.tabs.push({
                ...fabr,
                isActive: false,
                name: fabr.fabric,
                redirectUrl: fabr.id
              });
              this._breadcrumbService.addFriendlyNameForRouteRegex(
                '^/order-log-v2/[0-9A-Za-z]+/styles/[0-9A-Za-z]+/ows-techpack/fabric-quality/'
                + fabr.id + '$', fabr.fabric);
              this._router.navigate([fabr.id], {relativeTo: this._activatedRoute});
            } else {
              this._toastrService.error(resp.errorMessages, 'Error');
            }
          });
      }
    }, (err) => {
      // empty
    });
  }

  public ngOnDestroy(): void {
    this._subRouter.unsubscribe();
    this._subOwsStatus.unsubscribe();
    this._subFabric.unsubscribe();
  }
}
