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
import {
  PpSample
} from './pp-sample.model';

@Injectable()
export class PpSampleService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getPpSampleInfo(styleId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/owstechpack/${styleId}/pp-sample`);
  }

  public updatePpSampleInfo(styleId: number,
                            submitType: number,
                            model: PpSample): Observable<ResponseMessage<any[]>> {
    return this.http.put(`/api/v1/owstechpack/${styleId}/pp-sample?submitType=${submitType}`,
      JSON.stringify(model));
  }
}
