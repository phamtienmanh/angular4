import {
  Injectable
} from '@angular/core';

import {
  Response
} from '@angular/http';

import {
  Observable
} from 'rxjs/Observable';

import {
  HttpParams
} from '@angular/common/http';

// Services
import {
  ExtendedHttpService
} from '../../../shared/services/http';

// Interfaces
import {
  BasicResponse,
  ResponseMessage
} from '../../../shared/models';
import { UploadedFileModel } from '../../../+order-log-v2/+sales-order';

@Injectable()
export class ProjectPrimaryService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getPrimaryData(projectId: number,
                        type: number): Observable<ResponseMessage<any>> {
    let params: HttpParams = new HttpParams()
      .set('type', type.toString());
    return this.http.get(`/api/v1/projects/${projectId}/products`, {
      params
    });
  }

  public getFiles(projectId: number,
                  productId: number,
                  columnType: number): Observable<ResponseMessage<UploadedFileModel[]>> {
    let params: HttpParams = new HttpParams()
      .set('columnType', columnType.toString());
    return this.http
      .get(`/api/v1/projects/${projectId}/products/${productId}/files`, {
        params
      });
  }

  public uploadFile(projectId: number,
                    productId: number,
                    columnType: number,
                    model: UploadedFileModel[]): Observable<ResponseMessage<UploadedFileModel[]>> {
    return this.http
      .post(`/api/v1/projects/${
        projectId}/products/${productId}/files?columnType=${columnType}`,
        JSON.stringify(model));
  }

  public deleteFile(projectId: number,
                    productId: number,
                    productFileIds: number[]): Observable<BasicResponse> {
    return this.http
      .deleteWithBody(`/api/v1/projects/${
        projectId}/products/${productId}/files`,
      productFileIds);
  }

  public updateFile(projectId: number,
                    productId: number,
                    columnType: number,
                    model): Observable<ResponseMessage<any>> {
    return this.http
      .put(`/api/v1/projects/${
        projectId}/products/${productId}/files?columnType=${columnType}`,
        JSON.stringify(model));
  }
}
