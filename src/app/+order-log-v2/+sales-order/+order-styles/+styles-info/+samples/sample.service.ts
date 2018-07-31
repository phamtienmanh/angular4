import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

// Services
import {
  ExtendedHttpService
} from '../../../../../shared/services/http';

// Interfaces
import {
  BasicResponse,
  BasicGeneralInfo,
  ResponseMessage
} from '../../../../../shared/models';
import {
  JobChange,
  SampleDetail
} from './sample.model';
import {
  Color
} from './sample.model';

@Injectable()
export class SampleService {
  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getSampleDetail(styleId: number): Observable<ResponseMessage<SampleDetail>> {
    return this.http.get(`/api/v1/samples/${styleId}`);
  }

  public addSampleDetail(styleId: number, model): Observable<ResponseMessage<SampleDetail>> {
    return this.http.post(`/api/v1/samples/${styleId}`,
      JSON.stringify(model));
  }

  public updateSampleDetail(styleId: number, model): Observable<ResponseMessage<SampleDetail>> {
    return this.http.put(`/api/v1/samples/${styleId}`,
      JSON.stringify(model));
  }

  public deleteSampleDetail(id: number): Observable<BasicResponse> {
    return this.http.delete(`/api/v1/samples/${id}`);
  }

  public getJobChangeList(styleId: number): Observable<ResponseMessage<JobChange[]>> {
    return this.http.get(`/api/v1/samples/${styleId}/jobchange`);
  }

  public getSampleBinList(styleId: number): Observable<ResponseMessage<BasicGeneralInfo[]>> {
    return this.http.get(`/api/v1/samples/${styleId}/samplebin`);
  }

  public addJobChange(styleId: number, model): Observable<ResponseMessage<JobChange>> {
    return this.http.post(`/api/v1/samples/${styleId}/jobchange`,
      JSON.stringify(model));
  }

  public updateJobChange(styleId: number, jobChangeId: number, model):
    Observable<ResponseMessage<JobChange>> {
    return this.http.put(`/api/v1/samples/${styleId}/jobchange/${jobChangeId}`,
      JSON.stringify(model));
  }

  public updateSampleBin(styleId: number, model):
  Observable<BasicResponse> {
    return this.http.put(`/api/v1/samples/${styleId}/update-bin`,
      JSON.stringify(model));
  }

  public deleteJobChange(styleId: number, jobChangeId: number): Observable<BasicResponse> {
    return this.http
      .delete(`/api/v1/samples/${styleId}/jobchange/${jobChangeId}`);
  }

  public copySeq(styleId: number, pLocationId: number): Observable<ResponseMessage<Color[]>> {
    return this.http
      .put(`/api/v1/samples/${styleId}/copy-seq/${pLocationId}`,
      JSON.stringify({}));
  }
}
