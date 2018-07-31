import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../../shared/models';

@Injectable()
export class ConfigureProcessesService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getProcesses(orderDetailId): Observable<ResponseMessage<any>> {
    return this.http.get(
      `/api/v1/schedulers/styles/${orderDetailId}/finishing-process`
    );
  }

  public configureProcesses(orderDetailId, model): Observable<ResponseMessage<any>> {
    return this.http.post(
      `/api/v1/schedulers/styles/${orderDetailId}/finishing-process`,
      JSON.stringify(model));
  }
}
