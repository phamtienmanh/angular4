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
  ResponseMessage
} from '../../../../../shared/models';

@Injectable()
export class QaService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getQaDetail(styleId: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/styles/${styleId}/qa`);
  }

  public updateQaDetail(styleId: number, model): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/styles/${styleId}/qa`,
      JSON.stringify(model));
  }
}
