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
  PrintLocationInfo
} from '../+location-detail';

@Injectable()
export class LabelDetailService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getNeckLabelInfo(styleId: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/neck-labels/${styleId}`);
  }

  public getDesignInfo(designId: string): Observable<ResponseMessage<any>> {
    return this.http
      .getNoLoading(`/api/v1/neck-labels/design-info?designId=${designId}`);
  }

  public updateNeckLabelInfo(model: any): Observable<ResponseMessage<PrintLocationInfo>> {
    return this.http.put(`/api/v1/neck-labels/${model.id}`,
      JSON.stringify(model));
  }

  public createNeckLabelInfo(styleId: number, model):
  Observable<ResponseMessage<PrintLocationInfo>> {
    return this.http.post(`/api/v1/neck-labels/${styleId}`,
      JSON.stringify(model));
  }

  public getSamplesPrinter(): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/neck-labels/sample-printers`);
  }
}
