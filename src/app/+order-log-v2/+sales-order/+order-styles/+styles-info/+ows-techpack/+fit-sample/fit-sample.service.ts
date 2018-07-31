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
  FitSample
} from './fit-sample.model';

@Injectable()
export class FitSampleService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getFitSampleInfo(styleId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/owstechpack/${styleId}/fit-sample`);
  }

  public updateFitSampleInfo(styleId: number,
                             submitType: number,
                             model: FitSample): Observable<ResponseMessage<any[]>> {
    return this.http.put(`/api/v1/owstechpack/${styleId}/fit-sample?submitType=${submitType}`,
      JSON.stringify(model));
  }
}
