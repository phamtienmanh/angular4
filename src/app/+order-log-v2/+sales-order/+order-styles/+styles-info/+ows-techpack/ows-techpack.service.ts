import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';
import {
  BehaviorSubject
} from 'rxjs/BehaviorSubject';

// Services
import {
  ExtendedHttpService
} from '../../../../../shared/services/http';

// Models
import {
  ResponseMessage
} from '../../../../../shared/models';

@Injectable()
export class OwsTechpackService {
  private canModifyOws = new BehaviorSubject('');
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public setUpdateOws(data): void {
    this.canModifyOws.next(data);
  }

  public getUpdateOws(): Observable<any> {
    return this.canModifyOws.asObservable();
  }

  public getHistoryFiles(styleId: number, objectId: number, type: number):
  Observable<ResponseMessage<any>> {
    return this.http.get
    (`/api/v1/owstechpack/${styleId}/files?objectId=${objectId}&type=${type}`);
  }
}
