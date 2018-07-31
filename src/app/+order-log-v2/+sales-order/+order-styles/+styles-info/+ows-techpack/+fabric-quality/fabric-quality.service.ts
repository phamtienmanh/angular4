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
import { ResponseMessage } from '../../../../../../shared/models';

@Injectable()
export class FabricQualityService {
  private onUpdateFabric = new BehaviorSubject('');

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public setUpdateFabric(data): void {
    this.onUpdateFabric.next(data);
  }

  public getUpdateFabric(): Observable<any> {
    return this.onUpdateFabric.asObservable();
  }

  public getFabricList(styleId): Observable<ResponseMessage<any[]>> {
    return this.http.get(`/api/v1/owstechpack/${styleId}/fabric-quality`);
  }

  public createFabric(styleId: number, fabricInfo):
  Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v1/owstechpack/${styleId}/fabric-quality`,
      JSON.stringify(fabricInfo));
  }
}
