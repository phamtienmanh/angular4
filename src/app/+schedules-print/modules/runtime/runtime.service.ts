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
import { BasicResponse } from '../../../shared/models';

@Injectable()
export class RuntimeService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public configRunTime(schedulerId, model): Observable<BasicResponse> {
    return this.http.put(
      `/api/v1/schedulers/${schedulerId}/config-runtime`,
      JSON.stringify(model));
  }
}
