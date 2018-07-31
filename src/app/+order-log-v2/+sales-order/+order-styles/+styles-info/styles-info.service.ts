import {
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs/Observable';

import {
  HttpParams
} from '@angular/common/http';

// Services
import {
  ExtendedHttpService
} from '../../../../shared/services/http';
import { AuthService } from '../../../../shared/services/auth';

// Interfaces
import {
  BasicResponse,
  ResponseMessage
} from '../../../../shared/models';
import {
  StyleDetail
} from './+style';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class StylesInfoService {
  public styleIndex = {
    trimsList: [],
    noTrimRequired: false
  };
  private onUpdateStyle = new BehaviorSubject('');
  private onUpdateStatusStyle = new BehaviorSubject(!this._authService.checkCanModify('Orders'));

  constructor(private http: ExtendedHttpService,
              private _authService: AuthService) {
    // empty
  }

  public setUpdateStyle(data): void {
    this.onUpdateStyle.next(data);
  }

  public getUpdateStyle(): Observable<any> {
    return this.onUpdateStyle.asObservable();
  }

  public setUpdateStatusStyle(data): void {
    this.onUpdateStatusStyle.next(data);
  }

  public getUpdateStatusStyle(): Observable<any> {
    return this.onUpdateStatusStyle.asObservable();
  }

  /**
   * Reset first status of style
   * Avoid emit previous status of other style in the first time load style
   */
  public resetStatusStyle(): void {
    this.setUpdateStatusStyle(!this._authService.checkCanModify('Orders'));
  }

  public getStyleInfo(styleId: number): Observable<ResponseMessage<StyleDetail>> {
    return this.http.get(`/api/v1/styles/${styleId}`);
  }

  public getStyleList(orderId: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/styles/${orderId}/allstyles`);
  }

  public cancelStyleDetail(id: number): Observable<BasicResponse> {
    return this.http.put(`/api/v1/styles/${id}/cancel`,
      JSON.stringify({}));
  }

  public getTopPps(params: HttpParams): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/toppps/available`, {params});
  }
}
