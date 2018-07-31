import {
  Injectable
} from '@angular/core';

import {
  Response
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
} from '../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../shared/models';
import {
  ArtworkResponse
} from './artwork-view.model';

@Injectable()
export class ArtworkViewService {
  public orderIndex = {
    orderId: 0,
    designId: 0,
    designName: ''
  };

  public searchObj;

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListArtwork(params: HttpParams): Observable<ResponseMessage<ArtworkResponse>> {
    return this.http.get(`/api/v1/artworks`, {
      params
    });
  }
}
