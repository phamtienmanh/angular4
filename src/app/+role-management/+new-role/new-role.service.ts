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
  ResponseMessage
} from '../../shared/models';
import { RoleInfo } from '../role-management.model';

@Injectable()
export class NewRoleService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public createRole(roleInfo: RoleInfo): Observable<ResponseMessage<RoleInfo>> {
    return this.http.post(`/api/v1/rolemanagement`, JSON.stringify(roleInfo));
  }
}
