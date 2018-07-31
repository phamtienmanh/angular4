import {
  Injectable
} from '@angular/core';

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
export class ConfirmReorderService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getReorderList(styleId: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/styles/${styleId}/previousstyles`);
  }

  public confirmReorder(styleId: number, model): Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v1/styles/${styleId}/confirmreorder`,
      JSON.stringify(model));
  }
}
