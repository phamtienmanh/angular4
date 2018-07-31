import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../../shared/services/http';

// Interfaces
import {
  ResponseMessage,
  BasicResponse
} from '../../../../shared/models';
import { UploadedFileModel } from '../../../+sales-order';

@Injectable()
export class BlankGoodsService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListBlankGoods(orderId: number, styleId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v2/orders/${orderId}/styles/${styleId}/blank-goods-eta`);
  }

  public changeStatusColumn(orderId: number,
                            styleId: number,
                            model: any): Observable<ResponseMessage<any>> {
    return this.http
      .put(`/api/v1/outsource/${
        orderId}/blankgoodseta/${styleId}/${model.columnId}`,
        model);
  }

  public getBlankFileById(blankId: number): Observable<ResponseMessage<UploadedFileModel[]>> {
    return this.http.get(`/api/v1/blanks/${blankId}/files`);
  }

  public addBlankFileToBlankDetail(blankId: number,
                                   model: UploadedFileModel[]):
  Observable<ResponseMessage<UploadedFileModel[]>> {
    return this.http.post(`/api/v1/blanks/${blankId}`,
      JSON.stringify(model));
  }

  public deleteBlankFileDetail(blankId: number,
                               blankFileIds: number[]): Observable<BasicResponse> {
    return this.http.deleteWithBody(`/api/v1/blanks/${blankId}`, blankFileIds);
  }

  public updateBlankFiles(blankId: number, model): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/blanks/${blankId}/files`,
      JSON.stringify(model));
  }
}
