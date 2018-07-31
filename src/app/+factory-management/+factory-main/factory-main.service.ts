import {
  Injectable
} from '@angular/core';

// Services
import {
  ExtendedHttpService
} from '../../shared/services/http';

@Injectable()
export class FactoryMainService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }
}
