import {
  Injectable
} from '@angular/core';

import {
  Response
} from '@angular/http';

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
import {
  Subject
} from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class ProjectManageService {
  public projectIndex: any = {
    projectId: 0,
    projectName: '',
    customerName: '',
    inDcStoreDateOnUtc: '',
    isProjectManager: false,
    isProjectEditor: false,
    isProjectViewer: false
  };
  private onUpdateBreadcrumb = new Subject();
  private onUpdateProjectIndex = new BehaviorSubject({
    isProjectManager: false,
    isProjectEditor: false,
    isProjectViewer: false
  });

  constructor(private http: ExtendedHttpService) {
    // empty
  }

  public setBreadcrumb(data): void {
    this.onUpdateBreadcrumb.next(data);
  }

  public getBreadcrumb(): Observable<any> {
    return this.onUpdateBreadcrumb.asObservable();
  }

  public setProjectIndex(data): void {
    this.onUpdateProjectIndex.next(data);
  }

  public getProjectIndex(): Observable<any> {
    return this.onUpdateProjectIndex.asObservable();
  }

  public getProjectUsersById(projectId: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/projects/${projectId}/projectuser`);
  }

  public updateProjectIndex(model: any): void {
    Object.assign(this.projectIndex, model);
    this.setProjectIndex(this.projectIndex);
  }

  public getProjectById(projectId: number): Observable<ResponseMessage<any>> {
    return this.http.get(`/api/v1/projects/${projectId}`);
  }
}
