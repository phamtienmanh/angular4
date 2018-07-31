import {
  Injectable
} from '@angular/core';

import {
  Response,
  ResponseContentType
} from '@angular/http';

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

// Interfaces
import {
  ResponseMessage,
  BasicResponse
} from '../../shared/models';

@Injectable()
export class OrderMainService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListOrderV2(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v2/orders`, {
      params
    });
  }

  public getListA2000OrderV2(): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v2/orders/a2000-import-errors`);
  }

  public changeStatusColumn(orderId: number,
                            columnType: number,
                            orderFilterType: string,
                            itemType: string,
                            model: any,
                            responseType?: number): Observable<ResponseMessage<any>> {
    let params: HttpParams = new HttpParams()
      .set('columnType', columnType.toString())
      .set('type', orderFilterType)
      .set('itemType', itemType);
    if (responseType !== null && responseType !== undefined) {
      params = params.set('responseType', responseType.toString());
    }
    return this.http
      .put(`/api/v2/orders/${orderId}/change`, model, {params});
  }

  public markAsRead(orderId: number,
                    isReaded: boolean): Observable<ResponseMessage<any>> {
    return this.http
      .put(`/api/v2/orders/${orderId}/isReaded/${isReaded}`,
        '');
  }

  public exportOrder(params: HttpParams): Observable<any> {
    return this.http.get(`/api/v1/export/orders`, {
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }

  public exportLayout(params: HttpParams): Observable<any> {
    return this.http.get(`/api/v1/export/orders-po`, {
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }

  public exportBulkPo(params: HttpParams): Observable<any> {
    return this.http.get(`/api/v1/export/bulk-po`, {
      params,
      observe: 'response',
      responseType: 'blob'
    });
  }

  public exportA2000(): Observable<any> {
    return this.http.get(`/api/v1/export/a2000-import-errors`, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  public getOrderFileById(orderId: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/orderfile/${orderId}`);
  }

  public getPoDocumentById(orderId: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/orderfile/${orderId}/po-documents`);
  }

  public getAllTrimFiles(styleId: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v2/trims/${styleId}/purchasing-files`);
  }

  public getA2000SyncTask(): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/scheduletask/a2000synctask`);
  }

  public getAllBlankFiles(orderDetailId: number): Observable<ResponseMessage<any>> {
    let params: HttpParams = new HttpParams()
      .set('orderDetailId', orderDetailId.toString());
    return this.http.get(`/api/v1/blanks/files`, {params});
  }

  public getOrderFileByType(orderId: number, type: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/orderfile/${orderId}/${type}`);
  }

  public getShipmentFileByOrderId(orderId: number,
                                  styleId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v2/orders/${orderId}/${styleId}/actual-ship-date/files`);
  }

  public getStyleFilesById(styleId: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/styles/${styleId}/style-files`);
  }

  public markedForScheduling(orderId: number,
                             styleId: number,
                             printLocationId: number,
                             isEnqueue: boolean): Observable<BasicResponse> {
    return this.http.put(
      `/api/v2/orders/${orderId}/styles/
      ${styleId}/print-locations/${printLocationId}/enqueue/${isEnqueue}`, '');
  }

  public getScheduleColumnsInfo(orderId: number,
                                type: number,
                                printLocationId?: number,
                                neckLabelId?: number,
                                orderDetailId?: number): Observable<ResponseMessage<any>> {
    let params: HttpParams = new HttpParams()
      .set('type', type.toString());
    if (printLocationId) {
      params = params.set('printLocationId', printLocationId.toString());
    }
    if (neckLabelId) {
      params = params.set('neckLabelId', neckLabelId.toString());
    }
    if (orderDetailId) {
      params = params.set('orderDetailId', orderDetailId.toString());
    }

    return this.http.get(`/api/v2/orders/${orderId}/schedule-column`, {params});
  }

  public updateScheduleColumnsInfo(orderId: number,
                                   type: number,
                                   model: any): Observable<ResponseMessage<any>> {
    return this.http
      .put(`/api/v2/orders/${orderId}/schedule-column?type=${type}`,
        model);
  }

  public updateSchedulerStatus(printLocationId: number,
                               neckLabelId: number,
                               orderDetailId: number): Observable<ResponseMessage<any>> {
    let params: HttpParams = new HttpParams();
    if (printLocationId) {
      params = params.set('printLocationId', printLocationId.toString());
    }
    if (neckLabelId) {
      params = params.set('neckLabelId', neckLabelId.toString());
    }
    if (orderDetailId) {
      params = params.set('orderDetailId', orderDetailId.toString());
    }
    return this.http
      .put(`/api/v2/orders/not-applicable`, {}, {params});
  }

  public updateActualShipDateInfo(orderId: number,
                                  model: any): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v2/orders/${orderId}/actual-ship-date`,
      model);
  }

  // check value of column change
  public checkValueChange(src, des, isOriginDataChange, firstCall?) {
    if (firstCall) {
      isOriginDataChange.value = false;
    }
    Object.keys(src).forEach((k) => {
      if (!src[k] && des[k]) {
        isOriginDataChange.value = true;
        // console.log(k, src[k], des[k]);
      }
      if (!src[k] || !des[k]) {
        return;
      }
      if (typeof src[k] !== 'object' && !k.includes('OnUtc')) {
        if (src[k] !== des[k]) {
          isOriginDataChange.value = true;
          // console.log(k, src[k], des[k]);
        }
      }
      if (typeof src[k] === 'string' && k.includes('OnUtc')) {
        if (src[k].slice(0, 10) !== des[k].slice(0, 10)) {
          isOriginDataChange.value = true;
          // console.log(k, src[k], des[k]);
        }
      }
      if (Array.isArray(src[k])) {
        if (src[k].length !== des[k].length) {
          isOriginDataChange.value = true;
          // console.log(k, src[k], des[k]);
        } else {
          if (typeof src[k][0] !== 'object') {
            src[k].forEach((item, index) => {
              if (src[k][index] !== des[k][index]) {
                isOriginDataChange.value = true;
                // console.log(k, src[k][index], des[k][index]);
              }
            });
          }
          if (typeof src[k][0] === 'object' && !Array.isArray(src[k][0])) {
            src[k].forEach((item, index) => {
              this.checkValueChange(src[k][index], des[k][index], isOriginDataChange);
            });
          }
        }
      }
    });
  }
}
