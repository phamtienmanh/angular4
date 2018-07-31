import {
  Injectable
} from '@angular/core';

// Services
import {
  ExtendedHttpService
} from '../../../shared/services/http';

@Injectable()
export class SampleJobService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getJobList(printLocationId) {
    return this.http.get(`/api/v1/schedulers/samples/${printLocationId}`);
  }

  public createJob(printLocationId, params, model) {
    return this.http.post(`/api/v1/schedulers/samples/${printLocationId}`,
    JSON.stringify(model), {params});
  }

  public deleteJob(printLocationId, jobId) {
    return this.http.delete(`/api/v1/schedulers/samples/${printLocationId}/jobs/${jobId}`);
  }

  public changeStatus(printLocationId, type, isDone, params) {
    return this.http
      .put(`/api/v1/schedulers/samples/${printLocationId}/type/${type}/done/${isDone}`,
    JSON.stringify({}), {params});
  }

  public updateRushStatus(printLocationId, isRush) {
    return this.http
      .put(`/api/v1/schedulers/samples/${printLocationId}/rush/${isRush}`,
    JSON.stringify({}));
  }

  public getJobChange() {
    return this.http.get(`/api/v1/common/c_changejob`);
  }

  public updatePmsColors(printLocationId, model) {
    return this.http
      .put(`/api/v1/printlocations/${printLocationId}/sample-pms-color`,
    JSON.stringify(model));
  }
}
