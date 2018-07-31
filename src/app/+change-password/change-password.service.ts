import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../shared/services/http';

// Interfaces
import {
  BasicResponse
} from '../shared/models';
import {
  ChangePasswordModel
} from './change-password.model';

@Injectable()
export class ChangePasswordService {

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public changePassword(userId: number, pass: ChangePasswordModel): Observable<BasicResponse> {
    return this.http.put(`/api/v1/account/${userId}/change-password`,
      JSON.stringify(pass));
  }
}
