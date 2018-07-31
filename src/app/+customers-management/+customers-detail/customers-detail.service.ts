import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../shared/services/http';

// Interfaces
import {
  BasicResponse
} from '../../shared/models';
import {
  ReminderInfo
} from './edit-reminder';

@Injectable()
export class CustomersDetailService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }
  public createReminder(id: number, model: ReminderInfo): Observable<BasicResponse> {
    return this.http
      .post(`/api/v1/customers/${id}/reminders?type=${model.type}`,
        JSON.stringify(model));
  }

  public deleteReminder(id: number, reminderId: number): Observable<BasicResponse> {
    return this.http.delete(`/api/v1/customers/${id}/reminders/${reminderId}`);
  }
}
