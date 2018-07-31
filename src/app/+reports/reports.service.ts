import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

import { HttpParams } from '@angular/common/http';

// Services
import {
  ExtendedHttpService
} from '../shared/services/http';

// Interfaces
import {
  ResponseMessage
} from '../shared/models';
import {
  ReportsInfo,
  ReportsResponse,
  ReportScheduler
} from './reports.model';

@Injectable()
export class ReportsService {
  public orderIndex = {
    orderId: 0,
    designId: 0,
    designName: ''
  };

  public searchObj;

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public getListReports(params: HttpParams): Observable<ResponseMessage<ReportsResponse>> {
    return this.http.get(`/api/v1/reports`, {params});
  }

  public updateReport(report: ReportsInfo): Observable<ResponseMessage<ReportsInfo>> {
    return this.http.put(`/api/v1/reports/${report.id}`,
      JSON.stringify(report));
  }

  public generateReport(reportId: number): Observable<ResponseMessage<any>> {
    return this.http.put(`/api/v1/reports/${reportId}/generate`,
      JSON.stringify({}));
  }

  public updateSchedule(id: number,
                        schedule: ReportScheduler): Observable<ResponseMessage<ReportScheduler>> {
    return this.http.put(`/api/v1/reports/${id}/scheduler`,
      JSON.stringify(schedule));
  }
}
