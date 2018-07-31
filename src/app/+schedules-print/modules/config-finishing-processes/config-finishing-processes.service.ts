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
  ResponseMessage,
  BasicResponse
} from '../../../shared/models';

@Injectable()
export class ConfigFinishingProcessesService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getConfig(schedulerId): Observable<ResponseMessage<any>> {
    return this.http.get(
      `/api/v1/schedulers/${schedulerId}/config-staff-resource`
    );
  }

  public configStaff(schedulerId, model): Observable<BasicResponse> {
    return this.http.put(
      `/api/v1/schedulers/${schedulerId}/config-staff-resource`,
      JSON.stringify(model));
  }
}
