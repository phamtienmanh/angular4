import {
  EventEmitter,
  Injectable
} from '@angular/core';

// Services
import {
  ExtendedHttpService
} from '../shared/services/http';

@Injectable()
export class RoleManagementService {
  public updateRoleEvent = new EventEmitter<any>();

  constructor(private http: ExtendedHttpService) {
    // empty
  }
}
