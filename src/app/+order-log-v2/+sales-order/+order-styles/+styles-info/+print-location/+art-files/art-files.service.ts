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
  ResponseMessage
} from '../../../../../../shared/models';

@Injectable()
export class ArtFilesService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getNeckLabelInfo(styleId: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/neck-labels/${styleId}`);
  }

  public deleteArtFile(id: number[], isNeckLabel?: boolean, neckLabelId?: number):
  Observable<ResponseMessage<any>> {
    if (isNeckLabel) {
      return this.http
        .deleteWithBody(`/api/v1/neck-labels/${neckLabelId}/files`, id);
    }
    return this.http
      .deleteWithBody(`/api/v1/artfiles/DeleteMultipleById?printLocationId=${neckLabelId}`, id);
  }

  public getArtFiles(params: HttpParams, isNeckLabel?: boolean):
  Observable<ResponseMessage<any>> {
    let url = '/api/v1/artfiles';
    if (isNeckLabel) {
      url = '/api/v1/neck-labels';
    }
    return this.http.get(`${url}`, {
      params
    });
  }
}
