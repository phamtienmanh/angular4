import {
  Injectable
} from '@angular/core';

// Services
import {
  ExtendedHttpService
} from '../../../shared/services/http';

@Injectable()
export class RegionMainService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }
}
