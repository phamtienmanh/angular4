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
} from '../../../../../../shared/services/http';

// Interfaces
import {
  BasicResponse,
  ResponseMessage
} from '../../../../../../shared/models';
import {
  TrimDetail
} from './trims-detail.model';
import {
  UploadedFileModel
} from '../../../../sales-order.model';

@Injectable()
export class TrimsInfoDetailService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getTrimFileById(trimId: number): Observable<ResponseMessage<UploadedFileModel[]>> {
    return this.http.get(`/api/v2/trims/${trimId}/files`);
  }

  public getStyleTrimById(styleId: number, trimId: number):
  Observable<ResponseMessage<TrimDetail>> {
    let params: HttpParams = new HttpParams()
      .set('styleId', styleId.toString());
    return this.http.get(`/api/v2/trims/${trimId}/styles`, {
      params
    });
  }

  public addTrimFileToTrimDetail(trimId: number, styleId: number,
                                 model: UploadedFileModel[]):
  Observable<ResponseMessage<UploadedFileModel[]>> {
    let params: HttpParams = new HttpParams()
      .set('styleId', styleId ? styleId.toString() : '');
    if (!!styleId) {
      return this.http.post(`/api/v2/trims/${trimId}`,
        JSON.stringify(model), {
          params
        });
    } else {
      return this.http.post(`/api/v2/trims/${trimId}`,
        JSON.stringify(model));
    }
  }

  public deleteTrimFileDetail(trimId: number, styleId: number,
                              trimFileIds: number[]): Observable<BasicResponse> {
    let params: HttpParams = new HttpParams()
      .set('styleId', styleId ? styleId.toString() : '');
    if (!!styleId) {
      return this.http.deleteWithBody(`/api/v2/trims/${trimId}`,
        trimFileIds, {
          params
        });
    } else {
      return this.http.deleteWithBody(`/api/v2/trims/${trimId}`,
        trimFileIds);
    }
  }

  public updateTrimFiles(trimId: number, model):
  Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v2/trims/${trimId}/trim-files`,
      JSON.stringify(model));
  }

  public updateStyleTrim(trimId: number,
                         styleId: number,
                         model: TrimDetail): Observable<BasicResponse> {
    return this.http.put(`/api/v2/trims/${trimId}/styles/${styleId}`,
      JSON.stringify(model));
  }
}
