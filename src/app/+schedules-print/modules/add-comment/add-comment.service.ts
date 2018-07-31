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
  ResponseMessage
} from '../../../shared/models';

@Injectable()
export class AddCommentService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getComment(schedulerId): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/schedulers/${schedulerId}/comments`);
  }

  public addComment(schedulerId, model): Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v1/schedulers/${schedulerId}/comments`,
      JSON.stringify(model));
  }
}
