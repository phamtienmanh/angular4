import {
  Component,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  AppConstant
} from '../../../../../../app.constant';
import _ from 'lodash';
import * as moment from 'moment';

// Services
import {
  ToastrService
} from 'ngx-toastr';
import {
  JobsHistoryService
} from './jobs-history.service';

// Interfaces
import {
  ResponseMessage
} from '../../../shared/models/respone.model';

@Component({
  selector: 'jobs-history',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'jobs-history.template.html',
  styleUrls: [
    'jobs-history.styles.scss'
  ]
})
export class JobsHistoryComponent implements OnInit {

  @Input()
  public id: number;
  @Input()
  public isFinishing: boolean = false;
  public jobsHistory;
  public tabs = [
    {
      name: 'Job Detail',
      isActive: true
    },
    {
      name: 'Issues',
      isActive: false
    }
  ];
  public issueList = [];

  constructor(public activeModal: NgbActiveModal,
              private _jobsHistoryService: JobsHistoryService,
              private _toastrService: ToastrService) {
    // empty
  }

  public ngOnInit(): void {
    if (this.id) {
      this.getJobsHistory(this.id);
      this.getJobIssues(this.id);
    }
  }

  public switchTab(index: number): void {
    let prevTabIndex = this.tabs.findIndex((t) => t.isActive);
    this.tabs[prevTabIndex].isActive = false;
    this.tabs[index].isActive = true;
  }

  public getJobIssues(id: number) {
    this._jobsHistoryService.getJobIssues(id)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.issueList = resp.data;
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public getJobsHistory(id: number) {
    this._jobsHistoryService.getJobsHistory(id)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.jobsHistory = resp.data;
          this.addMissingSize(this.jobsHistory.jobs);
          // calculate job's totalPrintQty
          if (this.jobsHistory.jobs &&
            this.jobsHistory.jobs.length) {
            this.jobsHistory.jobs.forEach((job, i) => {
              if (job.completedTimeOnUtc && job.startedTimeOnUtc) {
                let completeTime = moment(job.completedTimeOnUtc).seconds(0).milliseconds(0);
                let startTime = moment(job.startedTimeOnUtc).seconds(0).milliseconds(0);
                let duration = moment.duration(completeTime.diff(startTime));
                if (duration.asMilliseconds() > 0) {
                  let hours = (Math.floor(duration.asMilliseconds() / 3600000)).toString();
                  let minutes = duration.minutes().toString();
                  job.runTime = hours + ' hr ' + minutes + ' min';
                }
              }
              if (job && job.damagedQtys && job.firstQualityPrintQtys) {
                let totalPrintQty = [];
                job.damagedQtys.forEach((s, index) => {
                  if (job.firstQualityPrintQtys[index]) {
                    totalPrintQty.push({
                      name: s.name,
                      qty: s.qty + job.firstQualityPrintQtys[index].qty
                    });
                  }
                });
                job.totalPrintQty = totalPrintQty;
              }
              // calculate jobsTotal
              if (i === 0) {
                let jobNewObj = Object.assign({}, job);
                Object.keys(job).forEach((k) => {
                  if (Array.isArray(job[k]) || typeof job[k] === 'object') {
                    jobNewObj[k] = _.cloneDeep(job[k]);
                  }
                });
                this.jobsHistory.jobsTotal = jobNewObj;
              } else {
                if (this.isPendingJob()) {
                  // not calculate jobsTotal
                  return;
                }
                if (job.scheduledQtys) {
                  job.scheduledQtys.forEach((s, index) => {
                    this.jobsHistory.jobsTotal.scheduledQtys[index].qty
                      += this.getQtyByName(job.scheduledQtys, s.name);
                  });
                }
                if (job.damagedQtys) {
                  job.scheduledQtys.forEach((s, index) => {
                    this.jobsHistory.jobsTotal.damagedQtys[index].qty
                      += this.getQtyByName(job.damagedQtys, s.name);
                  });
                }
                if (job.firstQualityPrintQtys) {
                  job.scheduledQtys.forEach((s, index) => {
                    this.jobsHistory.jobsTotal.firstQualityPrintQtys[index].qty
                      += this.getQtyByName(job.firstQualityPrintQtys, s.name);
                  });
                }
                if (job.totalPrintQty) {
                  job.scheduledQtys.forEach((s, index) => {
                    this.jobsHistory.jobsTotal.totalPrintQty[index].qty
                      += this.getQtyByName(job.totalPrintQty, s.name);
                  });
                }
              }
            });

            // calculate jobsTotal's totalPrintQty
            if (this.jobsHistory.jobsTotal &&
              this.jobsHistory.jobsTotal.damagedQtys &&
              this.jobsHistory.jobsTotal.firstQualityPrintQtys) {
              let totalPrintQty = [];
              let shrinkageQty = [];
              let overUnderQty = [];
              // if isFinishing, use totalFinishedQtys
              if (this.isFinishing &&
                this.jobsHistory.salesOrderDetail.totalProductionQtys &&
                this.jobsHistory.salesOrderDetail.totalFinishedQtys) {
                this.jobsHistory.salesOrderDetail.totalProductionQtys =
                  this.jobsHistory.salesOrderDetail.totalFinishedQtys;
              }
              this.jobsHistory.jobsTotal.damagedQtys.forEach((s, index) => {
                if (this.jobsHistory.jobsTotal.firstQualityPrintQtys[index] &&
                  this.jobsHistory.jobsTotal.scheduledQtys[index] &&
                  this.jobsHistory.salesOrderDetail.totalProductionQtys[index] &&
                  this.jobsHistory.salesOrderDetail.overageQtys[index]) {
                  totalPrintQty.push({
                    name: s.name,
                    qty: s.qty + this.jobsHistory.jobsTotal.firstQualityPrintQtys[index].qty
                  });

                  let sQty = this.jobsHistory.jobsTotal.scheduledQtys[index].qty -
                    totalPrintQty[index].qty;
                  shrinkageQty.push({
                    name: s.name,
                    qty: sQty > 0 ? sQty : 0
                  });

                  overUnderQty.push({
                    name: s.name,
                    qty: this.jobsHistory.jobsTotal.firstQualityPrintQtys[index].qty -
                    this.jobsHistory.salesOrderDetail.totalProductionQtys[index].qty +
                    this.jobsHistory.salesOrderDetail.overageQtys[index].qty
                  });
                }
              });
              this.jobsHistory.jobsTotal.totalPrintQty = totalPrintQty;
              this.jobsHistory.jobsTotal.shrinkageQty = shrinkageQty;
              this.jobsHistory.jobsTotal.overUnderQty = overUnderQty;
            }
          }
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public calculateTotal(sizeArr): number {
    let total = 0;
    sizeArr.forEach((s) => {
      if (!isNaN(s.qty)) {
        total += s.qty;
      }
    });
    return total;
  }

  public getQtyByName(job, name): number {
    return _.get(job.find((i) => i.name === name), 'qty', 0);
  }

  public isPendingJob(): boolean {
    let isPending = false;
    this.jobsHistory.jobs.forEach((i) => {
      if (!isPending) {
        if ((!i.damagedQtys || !i.damagedQtys.length)
          && (!i.firstQualityPrintQtys || !i.firstQualityPrintQtys.length)) {
          isPending = true;
        }
      }
    });
    return isPending;
  }

  public onCancel() {
    this.activeModal.dismiss();
  }

  public addMissingSize(jobData) {
    jobData.forEach((job) => {
      if (job.scheduledQtys && job.damagedQtys
        && job.scheduledQtys.length > job.damagedQtys.length) {
        job.scheduledQtys.forEach((d, index) => {
          if (job.damagedQtys[index] && d.name !== job.damagedQtys[index].name) {
            job.damagedQtys.splice(index, 0, d);
            job.firstQualityPrintQtys.splice(index, 0, d);
          }
        });
      }
    });
  }
}
