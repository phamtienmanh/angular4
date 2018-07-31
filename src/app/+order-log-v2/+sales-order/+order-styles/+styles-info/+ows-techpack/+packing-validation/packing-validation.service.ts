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
  PackingValidation
} from './packing-validation.model';

@Injectable()
export class PackingValidationService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getPackingValidationInfo(styleId: number): Observable<ResponseMessage<any>> {
    return this.http
      .get(`/api/v1/owstechpack/${styleId}/packing-validation`);
  }

  public updatePackingValidationInfo(styleId: number,
                                     submitType: number,
                                     model: PackingValidation): Observable<ResponseMessage<any[]>> {
    return this.http
      .put(`/api/v1/owstechpack/${styleId}/packing-validation?submitType=${submitType}`,
      JSON.stringify(model));
  }
}
