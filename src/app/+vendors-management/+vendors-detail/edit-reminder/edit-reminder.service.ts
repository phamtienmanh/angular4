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
  BasicResponse
} from '../../../shared/models';
import {
  ReminderInfo
} from './edit-reminder.model';

@Injectable()
export class EditReminderService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public updateReminder(id: number, model: ReminderInfo): Observable<BasicResponse> {
    return this.http.put(`/api/v1/vendors/${id}/reminders/${model.id}`,
      JSON.stringify(model));
  }
}
