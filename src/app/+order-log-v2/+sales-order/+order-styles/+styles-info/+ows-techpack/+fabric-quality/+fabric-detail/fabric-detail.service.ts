import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../../../../../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../../../../../../../shared/models';
import {
  FabricDetail
} from './fabric-detail.model';

@Injectable()
export class FabricDetailService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getFabricInfo(styleId: number, fabricId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/owstechpack/${styleId}/fabric-quality/${fabricId}`);
  }

  public updateFabricInfo(styleId: number, fabricId: number, type: number,
                          model: FabricDetail): Observable<ResponseMessage<any[]>> {
    return this.http
      .put(`/api/v1/owstechpack/${styleId}/fabric-quality/${fabricId}?submitType=${type}`,
      JSON.stringify(model));
  }
}
