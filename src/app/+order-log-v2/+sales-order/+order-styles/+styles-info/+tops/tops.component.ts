import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

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
export class TopsComponent implements OnInit {

  public orderIndex = {
    orderId: 0,
    styleId: 0,
    styleName: ''
  };
  public subTabs = [
    {
      text: 'Shipping',
      isActive: true,
      url: 'shipping'
    },
    {
      text: 'Billing',
      isActive: false,
      url: 'billing'
    }
  ];
  public factoryTypes = FactoryTypes;
  constructor(private _router: Router,
              private _activatedRoute: ActivatedRoute,
              private _stylesInfoService: StylesInfoService,
              private _salesOrderService: SalesOrderService,
              private _toastrService: ToastrService) {
    // empty
  }

  public ngOnInit(): void {
    this.orderIndex = this._salesOrderService.orderIndex;
    this._stylesInfoService.getStyleList(this.orderIndex.orderId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          const curStyleIndex = resp.data.findIndex((d) => d.id === +this.orderIndex.styleId);
          if (curStyleIndex > -1 && (resp.data[curStyleIndex].type === this.factoryTypes.Outsource
            || resp.data[curStyleIndex].type === this.factoryTypes.Imports)) {
            this.subTabs.unshift({text: 'Factory', isActive: true, url: 'factory'});
            this.subTabs[1].isActive = false;
          }
          for (let i = 1; i < this.subTabs.length; i++) {
            if (this._router.url.includes(this.subTabs[i].url)) {
              this.subTabs[0].isActive = false;
              this.subTabs[i].isActive = true;
              this._router.navigate([this.subTabs[i].url], {relativeTo: this._activatedRoute});
            }
          }
          if (this.subTabs[0].isActive) {
            this._router.navigate([this.subTabs[0].url], {relativeTo: this._activatedRoute});
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
}
