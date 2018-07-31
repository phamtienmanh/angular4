import {
  Injectable
} from '@angular/core';

import {
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../shared/services/http';
import { AuthService } from '../../shared/services/auth';

// Interfaces
import {
  BasicResponse,
  ResponseMessage
} from '../../shared/models';
import {
  Subject
} from 'rxjs/Subject';
import { SalesOrder } from './sales-order.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class SalesOrderService {
  public orderIndex: any = {
    orderId: 0,
    styleId: 0,
    styleName: '',
    partnerStyleName: '',
    customerName: '',
    customerPoId: '',
    customer2Type: '',
    retailerName: '',
    retailerPoId: '',
    trimsList: [],
    isA2000Order: false,
    // isCustomCutAndSew: null,
    noTrimRequired: false,
    isReadOnly: null,
    isCancelled: false,
  };

  public onReValidate = new Subject<Object>();
  public onRevalidate$ = this.onReValidate.asObservable();
  public hasErBeforePublish;

  private onUpdateStyleNum = new Subject();
  private onUpdateBreadcrumb = new Subject();
  private onUpdateImports = new Subject();
  private onUpdateAM = new Subject();
  private onUpdateA2000 = new Subject();
  private onUpdateOrder = new BehaviorSubject('');
  private onUpdateStatusOrder = new BehaviorSubject(!this._authService.checkCanModify('Orders'));

  constructor(private http: ExtendedHttpService,
              private _authService: AuthService) {
    // empty
  }

  public setBreadcrumb(data): void {
    this.onUpdateBreadcrumb.next(data);
  }

  public getBreadcrumb(): Observable<any> {
    return this.onUpdateBreadcrumb.asObservable();
  }

  public setImports(data): void {
    this.onUpdateImports.next(data);
  }

  public getImports(): Observable<any> {
    return this.onUpdateImports.asObservable();
  }

  public setAM(data): void {
    this.onUpdateAM.next(data);
  }

  public getAM(): Observable<any> {
    return this.onUpdateAM.asObservable();
  }

  public setA2000(data): void {
    this.onUpdateA2000.next(data);
  }

  public getA2000(): Observable<any> {
    return this.onUpdateA2000.asObservable();
  }

  public setUpdateOrder(data): void {
    this.onUpdateOrder.next(data);
  }

  public getUpdateOrder(): Observable<any> {
    return this.onUpdateOrder.asObservable();
  }

  public setUpdateStyleNum(data): void {
    this.onUpdateStyleNum.next(data);
  }

  public getUpdateStyleNum(): Observable<any> {
    return this.onUpdateStyleNum.asObservable();
  }

  public setUpdateStatusOrder(data): void {
    this.onUpdateStatusOrder.next(data);
  }

  public reValidate(orderId) {
    this.getPublishValidData(orderId)
      .subscribe((resp) => {
        if (resp.status) {
          this.onReValidate.next(resp.data[0]);
        }
      });
  }

  /**
   * Reset first status of order
   * Avoid emit previous status of other order in the first time load style
   */
  public resetStatusOrder(): void {
    this.setUpdateStatusOrder(!this._authService.checkCanModify('Orders'));
  }

  public resetOrderIndex(): void {
    this.orderIndex = {
      orderId: 0,
      styleId: 0,
      styleName: '',
      customerName: '',
      customerPoId: '',
      retailerName: '',
      retailerPoId: '',
      trimsList: [],
      isA2000Order: false,
      // isCustomCutAndSew: null,
      noTrimRequired: false,
      isReadOnly: null,
      isCancelled: false,
    };
  }

  public getUpdateStatusOrder(): Observable<any> {
    return this.onUpdateStatusOrder.asObservable();
  }

  public updateOrderIndex(model: any): void {
    Object.assign(this.orderIndex, model);
  }

  public getOrderInfo(id: number): Observable<ResponseMessage<SalesOrder>> {
    return this.http.get(`/api/v1/orders/${id}`);
  }

  public publishOrder(id: number): Observable<BasicResponse> {
    return this.http.put(`/api/v2/orders/${id}/publish`, '');
  }

  public syncTractorSupply(id: number): Observable<BasicResponse> {
    return this.http.get(`/api/v1/common/synctractorsupply`);
  }

  public exportBulkPo(orderId: number): Observable<any> {
    return this.http.get(`/api/v1/export/bulk-po/${orderId}`, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  public updateNoTrimRequired(orderId: number,
                              orderDetailId: number,
                              noTrimRequired: boolean): Observable<BasicResponse> {
    let params: HttpParams;
    if (orderId) {
      params = new HttpParams()
        .set('orderId', orderId.toString());
    }
    if (orderDetailId) {
      params = new HttpParams()
        .set('orderDetailId', orderDetailId.toString());
    }
    return this.http.put(`/api/v2/trims/no-trim-required/${noTrimRequired}`,
      '', {params});
  }

  public confirmRevision(id: number, isRevised: boolean): Observable<BasicResponse> {
    return this.http.put(`/api/v2/orders/${id}/isRevised/${isRevised}`, '');
  }

  public archiveOrder(id: number, isArchived: boolean): Observable<BasicResponse> {
    return this.http.put(`/api/v2/orders/${id}/isArchived/${isArchived}`, '');
  }

  public deleteOrder(id: number): Observable<BasicResponse> {
    return this.http.delete(`/api/v1/orders/${id}`);
  }

  public cancelOrder(id: number): Observable<BasicResponse> {
    return this.http.put(`/api/v2/orders/${id}/cancel`,
      JSON.stringify({})
    );
  }

  public getPublishValidData(orderId: number): Observable<any> {
    return this.http.get(`/api/v2/orders/${orderId}/publish-prepare-data`);
  }
}
