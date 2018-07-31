import {
  Injectable
} from '@angular/core';

import {
  Response
} from '@angular/http';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../../../services/http';

// Interfaces
import {
  ResponseMessage
} from '../../../../../models';
import {
  FeedbackRequest
} from './feedback.model';

@Injectable()
export class FeedbackService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public requestFeedback(data: FeedbackRequest): Observable<ResponseMessage<any>> {
    return this.http.post(`/api/v1/common/feedback`, JSON.stringify(data));
  }
}
