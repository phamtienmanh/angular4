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
export class ConfigTscScheduledService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getConfigData(schedulerId): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/schedulers/${schedulerId}/config-sched-units`);
  }

  public updateConfigData(schedulerId, model, params): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/schedulers/${schedulerId}/config-sched-units`,
      JSON.stringify(model), {params});
  }
}
