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
export class FactoryService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getFactoryDetail(styleId: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/tops/factory/${styleId}`);
  }

  public updateFactoryDetail(styleId: number, model): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/tops/factory/${styleId}`,
      JSON.stringify(model));
  }
}
