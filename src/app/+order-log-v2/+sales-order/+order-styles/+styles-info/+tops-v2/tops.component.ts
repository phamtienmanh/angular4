import {
  Component,
  OnInit,
  ViewEncapsulation,
  OnDestroy
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  Subscription
} from 'rxjs/Subscription';

import {
  ActivatedRoute,
  Router
} from '@angular/router';
import {
  ToastrService
} from 'ngx-toastr';

import {
  StylesInfoService
} from '../styles-info.service';
import {
  SalesOrderService
} from '../../../sales-order.service';

import {
  FactoryTypes
} from '../+style/style.model';
import {
  ResponseMessage
} from '../../../../../shared/models';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'tops',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'tops.template.html',
  styleUrls: [
    // 'tops.style.scss'
  ]
})
export class TopsComponent implements OnInit, OnDestroy {

  public orderIndex = {
    orderId: 0,
    styleId: 0,
    styleName: ''
  };
  // public subTabs = [
  //   {
  //     text: 'Shipping',
  //     isActive: true,
  //     url: 'shipping'
  //   },
  //   {
  //     text: 'Billing',
  //     isActive: false,
  //     url: 'billing'
  //   }
  // ];
  public subTabs = [
    {
      text: 'Factory',
      isActive: true,
      url: 'factory'
    }
  ];
  public factoryTypes = FactoryTypes;
  public isSMPLOrder = false;
  private _subOrderData: Subscription;
  constructor(private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _stylesInfoService: StylesInfoService,
              private _salesOrderService: SalesOrderService,
              private _toastrService: ToastrService) {
    // empty
  }

  public ngOnInit(): void {
    this.orderIndex = this._salesOrderService.orderIndex;
    this._subOrderData = this._salesOrderService.getUpdateOrder().subscribe((orderData) => {
      if (orderData && orderData.customerPoId &&
        orderData.customerPoId.toLowerCase().startsWith('smpl')) {
        this.isSMPLOrder = true;
        if (!this.subTabs.length) {
          this.subTabs = [
            {
              text: 'Factory',
              isActive: true,
              url: 'factory'
            }
          ];
          this._router.navigate([this.subTabs[0].url], {relativeTo: this._activatedRoute});
        }
      }
    });
    let params: HttpParams = new HttpParams()
      .set('styleId', this.orderIndex.styleId.toString());
    this._stylesInfoService.getTopPps(params)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          if (resp.data && resp.data.length) {
            resp.data.forEach((item) => {
              this.subTabs.push(
                {
                  text: item.name,
                  isActive: false,
                  url: item.ppTopType.toString()
                }
              );
            });
            for (let i = 1; i < this.subTabs.length; i++) {
              if (this._router.url.endsWith(this.subTabs[i].url)) {
                this.subTabs[0].isActive = false;
                this.subTabs[i].isActive = true;
                this._router.navigate([this.subTabs[i].url], {relativeTo: this._activatedRoute});
              }
            }
            if (this.subTabs[0].isActive) {
              this._router.navigate([this.subTabs[0].url], {relativeTo: this._activatedRoute});
            }
          } else {
            if (!this.isSMPLOrder) {
              this.subTabs = [];
            } else {
              this._router.navigate([this.subTabs[0].url], {relativeTo: this._activatedRoute});
            }
          }
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public switchSubTab(event: Event, index: number) {
    let idActive = this.subTabs.findIndex((l) => l.isActive === true);
    if (idActive !== -1) {
      this.subTabs[idActive].isActive = false;
    }
    this.subTabs[index].isActive = true;
    this._router.navigate([this.subTabs[index].url], {relativeTo: this._activatedRoute});
  }

  public ngOnDestroy() {
    this._subOrderData.unsubscribe();
  }
}
