import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  AfterViewInit,
  ElementRef,
  ChangeDetectorRef,
  ViewChildren,
  QueryList,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  HttpParams
} from '@angular/common/http';

import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

// 3rd modules
import {
  ToastrService
} from 'ngx-toastr';
import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import * as moment from 'moment';

// Services
import {
  SampleJobService
} from './sample-job.servive';
import {
  SamplesService
} from '../../+samples/samples.service';
import {
  CommonService
} from '../../../shared/services/common/common.service';
import {
  UserContext
} from '../../../shared/services/user-context/user-context';
import {
  DragulaService
} from 'ng2-dragula/ng2-dragula';

// Component
import {
  PerfectScrollbarComponent
} from 'ngx-perfect-scrollbar';

// Interfaces
import {
  ResponseMessage
} from '../../../shared/models/index';
import {
  AccessControlType
} from '../../../+role-management/role-management.model';
import {
  StatusType,
  StatusTypeList
} from '../../+samples/+samples-main/samples-main.model';
import { Subscription } from 'rxjs/Subscription';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'sample-job',  // <sign-in></sign-in>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'sample-job.template.html',
  styleUrls: [
    'sample-job.style.scss'
  ]
})
export class SampleJobComponent implements OnInit,
                                           AfterViewInit,
                                           OnDestroy {
  @ViewChildren(PerfectScrollbarComponent)
  public scrollListQuery: QueryList<PerfectScrollbarComponent>;

  public styleData;
  public jobList = [];
  public isNotExcludePrint;
  public isReadOnly = false;
  public jobChange = [];
  public isFullPermission = false;
  public permissions = {
    artRipped: false,
    approvedToSample: false,
    screenMade: false,
    inkReady: false,
    neckLabelReady: false,
    approved: false,
    pellonMade: false,
    addJobChange: false,
    deleteJobChange: false,
    rush: false,
    pmsColor: false
  };

  public isStatusDone = false;

  public tabs = [
    {
      name: 'Job Detail',
      isActive: true
    },
    {
      name: 'PMS Colors',
      isActive: false
    }
  ];
  public pmsColors;
  public colorsDataOrigin;
  public jobTxt: string = null;

  public accessControlType = AccessControlType;
  public sampleFuncPermissions = [];
  public statusType = StatusType;
  public statusTypeList = StatusTypeList;

  public subDragService: Subscription;
  public subDragendService: Subscription;
  public dragOptions: any;
  public oldIndex: any;
  public newIndex: any;

  constructor(private _router: Router,
              private _toastrService: ToastrService,
              private _detector: ChangeDetectorRef,
              public activeModal: NgbActiveModal,
              private _modalService: NgbModal,
              private _sampleJobSv: SampleJobService,
              private _samplesSv: SamplesService,
              private _commonService: CommonService,
              private _userContext: UserContext,
              private _changeDetectorRef: ChangeDetectorRef,
              private _dragulaService: DragulaService) {
    this.dragulaConfig();
  }

  public ngOnInit(): void {
    this.isFullPermission = this._samplesSv.isFullPermission;
    this.initialPermission();
    this.isStatusDone = this.isRowComplete(this.styleData, this.isNotExcludePrint);
    this.getJobList();
    this.getJobChange();
    this._commonService.getPmsColor()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.colorsDataOrigin = resp.data.filter((c) => !c.isAddedNew);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
  }

  public onSelectFocused(e): void {
    this._commonService.onNoSearchableFocused(e);
  }

  public dragulaConfig() {
    this.subDragService = this._dragulaService.drag.subscribe((value) => {
      let dragEl = value[1];
      let list = Array.prototype.filter.call(value[2].childNodes, (node) => {
        return node.tagName === 'TR';
      });
      this.oldIndex = list.findIndex((node) => {
        return node === dragEl;
      });
      this._changeDetectorRef.markForCheck();
    });

    this.subDragendService = this._dragulaService.dragend.subscribe((value) => {
      let dragEl = value[1];
      let list = Array.prototype.filter.call(value[1].parentNode.childNodes, (node) => {
        return node.tagName === 'TR';
      });
      this.newIndex = list.findIndex((node) => {
        return node === dragEl;
      });
      if (this.newIndex >= 0 && this.oldIndex >= 0 && this.newIndex !== this.oldIndex &&
        this.pmsColors.length) {
        this.pmsColors.splice(this.newIndex, 0, this.pmsColors.splice(this.oldIndex, 1)[0]);
      }
      this.oldIndex = undefined;
      this.newIndex = undefined;
      this._changeDetectorRef.markForCheck();
    });
    this.dragOptions = {
      moves: (el, container, handle) => {
        return handle.className === 'seq-handle';
      }
    };
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      let modalElef = document.getElementsByTagName('sample-job');
      if (modalElef[0].clientHeight > 675) {
        let jobListElef = document.getElementsByClassName('job-list');
        jobListElef[0]['style'].height = 380 + (modalElef[0].clientHeight - 675) + 'px';
      }
    });
  }

  public initialPermission(): void {
    // Get Print Function Permission from user info
    const funcPermission = this._userContext.currentUser.permissions
      .filter((i) => i.type === this.accessControlType.Functions);
    this.sampleFuncPermissions = funcPermission
      .filter((i) => i.name.includes('Schedules.Samples'));
    // -------
    let propFunc = [
      'ArtRipped.Update',
      'ApprovedToSample.Update',
      'ScreenMade.Update',
      'InkReady.Update',
      'NeckLabelReady.Update',
      'Approved.Update',
      'PellonMade.Update',
      'JobChange.Add',
      'JobChange.Delete',
      'Rush.Update',
      'PmsColor.Update'
    ];
    Object.keys(this.permissions).forEach((p, index) => {
      this.permissions[p] = this.getIsModifyFunc('SampleJob.' + propFunc[index]);
    });
  }

  public getJobList() {
    this._sampleJobSv.getJobList(this.styleData.printLocationId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.mapDataToJobList(resp.data.jobs);
          this.pmsColors = resp.data.pmsColors;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public getJobChange() {
    this._sampleJobSv.getJobChange()
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.jobChange = resp.data.length ? resp.data.filter((j) => j.type === 1) : [];
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public createJob(jobTxt, manual?) {
    if (jobTxt) {
      let model = {
        jobContent: jobTxt
      };
      let curDate = new Date();
      let params: HttpParams = new HttpParams()
        .set('utcOffset', (-1 * curDate.getTimezoneOffset() / 60).toString())
        .set('currentDate', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));

      this._sampleJobSv.createJob(this.styleData.printLocationId, params, model)
        .subscribe((resp: ResponseMessage<any>) => {
          if (resp.status) {
            this._toastrService.success(resp.message, 'Success');
            // this.mapDataToJobList([resp.data]);
            this.getJobList();
            if (jobTxt === 'Approved' && !manual && this.permissions.approved) {
              this.styleData.isApproved = true;
            }
            if (this.jobTxt) {
              this.jobTxt = null;
            }
            this._changeDetectorRef.markForCheck();
          } else {
            this._toastrService.error(resp.errorMessages, 'Error');
          }
        });
    }
  }

  public deleteJob(jobId) {
    this._sampleJobSv.deleteJob(this.styleData.printLocationId, jobId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
          // this.mapDataToJobList([resp.data]);
          this.getJobList();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public mapDataToJobList(data) {
    this.jobList = [];
    data.forEach((d) => {
      d.createdOnUtc = new Date(d.createdOnUtc + 'Z');
      let index = this.jobList.findIndex(
        (item) => item.jobDate.toDateString() === d.createdOnUtc.toDateString());
      if (index > -1) {
        this.jobList[index].jobData.push(
          {
            jobTime: d.createdOnUtc,
            jobDetail: d.jobContent,
            id: d.id
          }
        );
      } else {
        this.jobList.push(
          {
            jobDate: d.createdOnUtc,
            jobData: [
              {
                jobTime: d.createdOnUtc,
                jobDetail: d.jobContent,
                id: d.id
              }
            ]
          }
        );
      }
    });
    this.jobList = _.orderBy(this.jobList, ['jobDate'], ['desc']);
    this.jobList.forEach((j) => {
      j.jobData = _.orderBy(j.jobData, ['jobTime'], ['desc']);
    });
    setTimeout(() => {
      this.scrollListQuery.first.update();
    });
    this._changeDetectorRef.markForCheck();
  }

  public changeStatus(type, styleData?) {
    if (this.isStatusDone && !this.isFullPermission) {
      this._toastrService.success('', 'Status already done!');
      return;
    }
    const prop = this.statusTypeList[type].prop;
    const status = this.statusTypeList[type].status;
    if (!this.permissions[prop]) {
      this._toastrService.error('You are not authorized to change '
        + this.statusTypeList[type].name + ' status.', 'Error');
      return;
    }
    let curDate = new Date();
    let params: HttpParams = new HttpParams()
      .set('utcOffset', (-1 * curDate.getTimezoneOffset() / 60).toString())
      .set('currentDate', moment(curDate).format('YYYY-MM-DDTHH:mm:ss'));
    this._sampleJobSv
      .changeStatus(this.styleData.printLocationId, type, !this.styleData[status], params)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
          this.styleData[status] = !this.styleData[status];
          if (this.styleData[status]) {
            this.createJob(this.statusTypeList[type].name, true);
            // if approved and not approved to sample then approved to sample too
            if (prop === 'approved' && styleData && !styleData.isApprovedToSample) {
              styleData.isApprovedToSample = true;
            }
          }
          this.isStatusDone = this.isRowComplete(this.styleData, this.isNotExcludePrint);
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public updateRushStatus(isRush) {
    this._sampleJobSv.updateRushStatus(this.styleData.printLocationId, isRush)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
          this.styleData.isRush = isRush;
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public onSubmitPmsColor() {
    this.pmsColors = this.pmsColors.filter((c) => c.colorId ||
      c.pmsName || c.mesh || c.type !== ''
    );
    this._sampleJobSv.updatePmsColors(this.styleData.printLocationId, this.pmsColors)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this._changeDetectorRef.markForCheck();
          this._toastrService.success(resp.message, 'Success');
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public isRowComplete(row, isNotExcludePrint) {
    let statusList = [
      'isArtRipped',
      'isApprovedToSample',
      'isScreenMade',
      'inkReady',
      'neckLabelReady',
      'isApproved',
      'isPellonMade'
    ];
    let excludePrinterStatus =
            [
              'isArtRipped',
              'isApprovedToSample',
              'neckLabelReady',
              'isApproved'
            ];
    if (!row.hasNeckLabel) {
      statusList.splice(4, 1);
      excludePrinterStatus.splice(2, 1);
    }
    let isComplete = true;
    if (isNotExcludePrint) {
      statusList.forEach((item) => {
        if (!row[item]) {
          isComplete = false;
        }
      });
    } else {
      excludePrinterStatus.forEach((item) => {
        if (!row[item]) {
          isComplete = false;
        }
      });
    }
    return isComplete;
  }

  /**
   * Event switch tab
   * @param index
   */
  public switchTab(index: number): void {
    let prevTabIndex = this.tabs.findIndex((t) => t.isActive);
    this.tabs[prevTabIndex].isActive = false;
    this.tabs[index].isActive = true;
  }

  public addFilm(): void {
    if (this.pmsColors.length > 15) {
      return;
    }
    this.pmsColors.push({
      colorId: '',
      pmsId: '',
      pmsName: null,
      mesh: '',
      type: '',
      printType: 1
    });
    this._changeDetectorRef.markForCheck();
  }

  public removeFilm(index: number): void {
    this.pmsColors.splice(index, 1);
    this._changeDetectorRef.markForCheck();
  }

  public selectRadio(index: number, value: number) {
    if (!this.permissions.pmsColor) {
      return;
    }
    this.pmsColors[index].type = value;
    this._changeDetectorRef.markForCheck();
  }

  public applyAllByProp(value: string, prop: string) {
    this.pmsColors.forEach((p) => {
      p[prop] = value;
    });
  }

  public getIsModifyFunc(name: string): boolean {
    const status = this.sampleFuncPermissions.find((i) => i.name.includes(name));
    return status ? status.isModify : true;
  }

  public ngOnDestroy(): void {
    this.subDragService.unsubscribe();
    this.subDragendService.unsubscribe();
    if (this._dragulaService.find('bag-one')) {
      this._dragulaService.destroy('bag-one');
    }
  }
}
