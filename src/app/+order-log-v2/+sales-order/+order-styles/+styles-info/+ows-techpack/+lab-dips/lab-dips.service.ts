import {
  Injectable
} from '@angular/core';

import {
  Observable,
  BehaviorSubject
} from 'rxjs';

// Services
import {
  ExtendedHttpService
} from '../../../../../../shared/services/http';
import {
  ResponseMessage
} from '../../../../../../shared/models/respone.model';

@Injectable()
export class LabDipsService {
  private onUpdateLab = new BehaviorSubject('');

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public setUpdateLab(data): void {
    this.onUpdateLab.next(data);
  }

  public getUpdateLab(): Observable<any> {
    return this.onUpdateLab.asObservable();
  }

  public getLabList(styleId): Observable<ResponseMessage<any[]>> {
    return this.http.get(`/api/v1/owstechpack/${styleId}/lab-dip`);
  }

  public createLab(styleId: number, labInfo):
  Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v1/owstechpack/${styleId}/lab-dip`,
      JSON.stringify(labInfo));
  }
}
