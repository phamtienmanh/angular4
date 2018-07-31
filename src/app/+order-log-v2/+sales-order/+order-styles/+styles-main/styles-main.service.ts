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
  BasicResponse,
  ResponseMessage
} from '../../../../shared/models';
import {
  StyleResponse
} from './styles-main.model';

@Injectable()
export class StylesMainService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListStyle(orderId): Observable<ResponseMessage<StyleResponse[]>> {
    return this.http.get(`/api/v1/styles?orderId=${orderId}`);
  }

  public deleteStyleDetail(id: number): Observable<BasicResponse> {
    return this.http.delete(`/api/v1/styles/${id}`);
  }
}
