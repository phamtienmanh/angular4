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
} from '../../../../../../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../../../../../../shared/models';

@Injectable()
export class UploadService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public createArtFiles(locId: number, model: any, isNeckLabel?: boolean):
  Observable<ResponseMessage<any>> {
    let params: HttpParams = new HttpParams()
      .set('printLocationId', locId.toString());

    if (isNeckLabel) {
      return this.http.post(`/api/v1/neck-labels/${locId}/files`,
        JSON.stringify(model), {params});
    }
    return this.http.post(`/api/v1/artfiles`,
      JSON.stringify(model), {params});
  }

  public updateArtFiles(locId: number, model, isNeckLabel?: boolean):
  Observable<ResponseMessage<any>> {
    let params: HttpParams = new HttpParams()
      .set('printLocationId', locId.toString());

    if (isNeckLabel) {
      return this.http.put(`/api/v1/neck-labels/${locId}/files`,
        JSON.stringify(model));
    }
    return this.http.put(`/api/v1/artfiles`,
      JSON.stringify(model), {params});
  }

  public deleteArtFile(id: number[],
                       isNeckLabel?: boolean,
                       neckLabelId?: number): Observable<ResponseMessage<any>> {
    if (isNeckLabel) {
      return this.http
        .deleteWithBody(`/api/v1/neck-labels/${neckLabelId}/files`, id);
    }
    return this.http
      .deleteWithBody(`/api/v1/artfiles/DeleteMultipleById?printLocationId=${neckLabelId}`, id);
  }
}
