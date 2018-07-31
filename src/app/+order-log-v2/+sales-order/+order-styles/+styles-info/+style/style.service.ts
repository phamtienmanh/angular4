import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../../../shared/services/http';

// Interfaces
import {
  BasicResponse,
  ResponseMessage
} from '../../../../../shared/models';
import {
  StyleDetail
} from './style.model';
import {
  UploadedFileModel
} from '../../../sales-order.model';

@Injectable()
export class StyleService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getStyleInfo(styleId: number): Observable<ResponseMessage<StyleDetail>> {
    return this.http.get(`/api/v1/styles/${styleId}`);
  }

  public changeA2000Style(styleId: number,
                          a2000StyleName: string): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/styles/${styleId}/${a2000StyleName}`);
  }

  public getStyleFiles(styleId: number): Observable<ResponseMessage<UploadedFileModel[]>> {
    return this.http.get(`/api/v1/styles/${styleId}/style-files`);
  }

  public addStyleDetail(model: StyleDetail): Observable<ResponseMessage<StyleDetail>> {
    return this.http.post(`/api/v1/styles`,
      JSON.stringify(model));
  }

  public updateStyleDetail(id: number,
                           model: StyleDetail): Observable<BasicResponse> {
    return this.http.put(`/api/v1/styles/${id}`,
      JSON.stringify(model));
  }

  public deleteStyleDetail(id: number): Observable<BasicResponse> {
    return this.http.delete(`/api/v1/styles/${id}`);
  }

  public uploadFileToStyle(styleId: number,
                           styleFiles: UploadedFileModel[],
                           applyToStyleIds: number[] = []):
  Observable<ResponseMessage<UploadedFileModel[]>> {
    return this.http.post(`/api/v1/styles/${styleId}/style-files`,
      JSON.stringify({
        styleFiles,
        applyToStyleIds
      }));
  }

  public deleteUploadedStyleFile(id: number,
                                 styleFileIds: number[]): Observable<BasicResponse> {
    return this.http.deleteWithBody(`/api/v1/styles/${id}/style-files`,
      styleFileIds);
  }

  public updateStyleFiles(styleId: number, model): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/styles/${styleId}/style-files`,
      JSON.stringify(model));
  }

  public getOwsStyleFiles(styleId: number): Observable<ResponseMessage<UploadedFileModel[]>> {
    return this.http.get(`/api/v1/stylefile/${styleId}`);
  }

  public uploadOwsStyleFiles(styleId: number,
                             model: UploadedFileModel[]):
  Observable<ResponseMessage<UploadedFileModel[]>> {
    return this.http.post(`/api/v1/stylefile/update/${styleId}`,
      JSON.stringify(model));
  }

  public deleteOwsStyleFiles(orderDetailId: number,
                             styleFileIds: number[]): Observable<BasicResponse> {
    return this.http
      .deleteWithBody(`/api/v1/stylefile?orderDetailId=${orderDetailId}`,
      styleFileIds);
  }

  public updateOwsStyleFiles(styleId: number, model): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/stylefile/${styleId}/style-files`,
      JSON.stringify(model));
  }

  public confirmReorder(id: number,
                        isReorderConfirmed: boolean,
                        reorderComment: string): Observable<BasicResponse> {
    return this.http.put(
      `/api/v1/styles/${id}/confirm-reorder/${isReorderConfirmed}`,
      JSON.stringify({reorderComment}));
  }
}
