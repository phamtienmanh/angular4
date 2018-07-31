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

@Injectable()
export class ScanBarcodeServive {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public scanBadgeBy(badgeId: string, scanType: number): Observable<BasicResponse> {
    return this.http.post(`/api/v1/jobs/scan/type/${scanType}`,
      JSON.stringify(badgeId));
  }
}
