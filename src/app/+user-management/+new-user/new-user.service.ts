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
  ResponseMessage,
  UserInfo
} from '../../shared/models';

@Injectable()
export class NewUserService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public createUser(userInfo: UserInfo): Observable<ResponseMessage<UserInfo>> {
    return this.http.post(`/api/v1/account/users`, JSON.stringify(userInfo));
  }
}
