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
export class VendorsDetailService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public createReminder(id: number, model: ReminderInfo): Observable<BasicResponse> {
    return this.http.post(`/api/v1/vendors/${id}/reminders`,
        JSON.stringify(model));
  }

  public deleteReminder(id: number, reminderId: number): Observable<BasicResponse> {
    return this.http.delete(`/api/v1/vendors/${id}/reminders/${reminderId}`);
  }
}
