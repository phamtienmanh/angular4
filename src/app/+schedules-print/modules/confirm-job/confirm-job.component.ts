import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';

import {
  Router
} from '@angular/router';

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
  ConfirmJobServive
} from './confirm-job.servive';

// Component

// Interfaces
import {
  ConfirmJobModel,
  SalesOrderDetail
} from './confirm-job.model';
import {
  BasicResponse,
  ResponseMessage
} from '../../../shared/models/respone.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'confirm-job',  // <sign-in></sign-in>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'confirm-job.template.html',
  styleUrls: [
    'confirm-job.style.scss'
  ]
})
export class ConfirmJobComponent implements OnInit {
  @Input()
  public schedulerId: number;

  public salesOrderDetail;
  public jobDetailData = [];

  public salesOrderTable = {
    sizesNameCell: [],
    sizesDataRow: {
      totalProductionQtys: {},
      totalFinishedQtys: {},
      overageQtys: {}
    }
  };
  public jobTable = [];
  public totalJobTable = {
    sizesNameCell: [],
    sizesDataRow: {
      scheduledQtys: {},
      damagedQtys: {},
      firstQualityPrintQtys: {},
      totalPrintQtys: {},
      shrinkageQty: {},
      overUnderQty: {}
    }
  };

  public editing = {};

  public saleOrderSizes = [
    {
      id: 0,
      name: 'Total Production Qtys',
      prop: 'totalProductionQtys'
    },
    {
      id: 1,
      name: 'Total Finished Qtys',
      prop: 'totalFinishedQtys'
    },
    {
      id: 2,
      name: 'Overage Qtys',
      prop: 'overageQtys'
    }
  ];
  public jobSizes = [
    {
      id: 0,
      name: 'Scheduled Qtys',
      prop: 'scheduledQtys'
    },
    {
      id: 1,
      name: 'Damage Qtys',
      prop: 'damagedQtys'
    },
    {
      id: 2,
      name: '1st Quality Print Qtys',
      prop: 'firstQualityPrintQtys'
    }
  ];
  public jobTotal = [
    {
      id: 0,
      name: 'Scheduled Qtys',
      prop: 'scheduledQtys'
    },
    {
      id: 1,
      name: 'Damage Qtys',
      prop: 'damagedQtys'
    },
    {
      id: 2,
      name: '1st Quality Print Qtys',
      prop: 'firstQualityPrintQtys'
    },
    {
      id: 3,
      name: 'Total Print Qty',
      prop: 'totalPrintQtys'
    },
    {
      id: 4,
      name: 'Shrinkage Qty',
      prop: 'shrinkageQty'
    },
    {
      id: 5,
      name: 'Over/Under Qty',
      prop: 'overUnderQty'
    }
  ];
  public confirmTypeName: string;
  public missingSizeThisJob = [];

  constructor(private _router: Router,
              private _toastrService: ToastrService,
              public activeModal: NgbActiveModal,
              private _modalService: NgbModal,
              private _confirmJobServive: ConfirmJobServive,
              private _changeDetectorRef: ChangeDetectorRef) {
    // empty
  }

  public ngOnInit(): void {
    this.getConfirmData();
    if (this._router.url.includes('schedules-print/tsc-print')) {
      this.confirmTypeName = 'Print Job';
    } else if (this._router.url.includes('schedules-print/neck-label')) {
      this.confirmTypeName = 'Neck Label Job';
    } else if (this._router.url.includes('schedules-print/finishing')) {
      this.confirmTypeName = 'Finishing Job';
    }
  }

  public getConfirmData(): void {
    this._confirmJobServive.getConfirmDataBy(this.schedulerId)
      .subscribe((resp: ResponseMessage<ConfirmJobModel>) => {
        if (resp.status) {
          this.salesOrderDetail = resp.data.salesOrderDetail;
          this.jobDetailData = resp.data.jobs;
          this.addMissingSize(this.jobDetailData);
          this.jobDetailData.forEach((job) => {
            if (job.completedTimeOnUtc && job.startedTimeOnUtc) {
              let completeTime = moment(job.completedTimeOnUtc).seconds(0).milliseconds(0);
              let startTime = moment(job.startedTimeOnUtc).seconds(0).milliseconds(0);
              let duration = moment.duration(completeTime.diff(startTime));
              if (duration.asMilliseconds() > 0) {
                let hours = (Math.floor(duration.asMilliseconds() / 3600000)).toString();
                let minutes = duration.minutes().toString();
                job.runTime = `${hours} hr ${minutes} min`;
              }
            }
          });
          this.convertSalesOrderSizes(this.salesOrderDetail);
          this.convertJobSizes(this.jobDetailData);
          this.convertTotalJobSizes(this.jobTable);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
        this._changeDetectorRef.markForCheck();
      });
  }

  public convertSalesOrderSizes(sizeData): void {
    const getAllSizes = (propArr: string[]): string[] => {
      let result = [];
      propArr.forEach((prop) => {
        result = _.union(result, sizeData[prop] ?
          sizeData[prop].map((i) => i.name) : []);
      });
      return result;
    };
    this.salesOrderTable.sizesNameCell = getAllSizes(this.saleOrderSizes.map((i) => i.prop));
    // ---
    const convertToSizeObj = (propArr: string[]) => {
      this.salesOrderTable.sizesNameCell.forEach((sizeName) => {
        propArr.forEach((prop) => {
          const currentSize = sizeData[prop] ?
            sizeData[prop].find((i) => i.name === sizeName) : null;
          if (currentSize) {
            this.salesOrderTable.sizesDataRow[prop][sizeName] = currentSize.qty;
          }
        });
      });
    };
    convertToSizeObj(this.saleOrderSizes.map((i) => i.prop));
  }

  public convertJobSizes(jobsData): void {
    jobsData.forEach((jobData) => {
      let jobModel = {
        isThisJob: jobData.isThisJob,
        isNotScheduled: jobData.isNotScheduled,
        sizesNameCell: [],
        sizesDataRow: {
          scheduledQtys: {},
          unScheduledQtys: {},
          damagedQtys: {},
          firstQualityPrintQtys: {},
          incompleted: {},
          totalPrintQtys: {}
        }
      };
      const getAllSizes = (propArr: string[]): string[] => {
        let result = [];
        propArr.forEach((prop) => {
          result = _.union(result, jobData[prop] ?
            jobData[prop].map((i) => i.name) : []);
        });
        return result;
      };
      jobModel.sizesNameCell = getAllSizes(jobModel.isNotScheduled ?
        ['unScheduledQtys'] : this.jobSizes.map((i) => i.prop));
      // ---
      const convertToSizeObj = (propArr: string[]) => {
        jobModel.sizesNameCell.forEach((sizeName) => {
          propArr.forEach((prop) => {
            const currentSize = jobData[prop]
              ? jobData[prop].find((i) => i.name === sizeName) : null;
            if (currentSize) {
              jobModel.sizesDataRow[prop][sizeName] = currentSize.qty;
              if (prop === 'scheduledQtys') {
                jobModel.sizesDataRow['incompleted'][sizeName] = currentSize.isIncommpleted;
              }
            }
          });
        });
      };
      convertToSizeObj(jobModel.isNotScheduled ?
        ['unScheduledQtys'] : this.jobSizes.map((i) => i.prop));
      // ---
      jobModel.sizesNameCell.forEach((sizeName) => {
        this.calculateTotalPrintQtys(jobModel.sizesDataRow, sizeName);
      });
      this.jobTable.push(jobModel);
    });
  }

  public calculateTotalPrintQtys(sizesDataRow, sizeName): void {
    sizesDataRow.totalPrintQtys[sizeName] = sizesDataRow.firstQualityPrintQtys[sizeName]
      + sizesDataRow.damagedQtys[sizeName];
  }

  public convertTotalJobSizes(jobsConvertedData, isRecalculate = false): void {
    if (this.checkPendingJob()) {
      jobsConvertedData.forEach((job) => {
        if (!this.totalJobTable.sizesNameCell.length) {
          this.totalJobTable.sizesNameCell = job.sizesNameCell;
        }
      });
      return;
    }
    jobsConvertedData.forEach((job) => {
      if (!this.totalJobTable.sizesNameCell.length) {
        this.totalJobTable.sizesNameCell = job.sizesNameCell;
      }
      this.totalJobTable.sizesNameCell.forEach((sizeName) => {
        const propList = [
          'scheduledQtys',
          'damagedQtys',
          'firstQualityPrintQtys',
          'totalPrintQtys'
        ];
        if (isRecalculate) {
          this.totalJobTable.sizesNameCell.forEach((size) => {
            propList.forEach((prop) => {
              this.totalJobTable.sizesDataRow[prop][size] = undefined;
            });
          });
          isRecalculate = false;
        }
        const countQtyFunc = (props: string[]): void => {
          props.forEach((prop) => {
            if (!this.totalJobTable.sizesDataRow[prop][sizeName]) {
              this.totalJobTable.sizesDataRow[prop][sizeName] = 0;
            }
            if (!isNaN(job.sizesDataRow[prop][sizeName])) {
              this.totalJobTable.sizesDataRow[prop][sizeName]
                += job.sizesDataRow[prop][sizeName];
            }
          });
        };
        countQtyFunc(propList);
      });
    });
    this.totalJobTable.sizesNameCell.forEach((sizeName) => {
      this.totalJobTable.sizesDataRow.shrinkageQty[sizeName] = this.totalJobTable.sizesDataRow
        .totalPrintQtys[sizeName] < this.totalJobTable.sizesDataRow.scheduledQtys[sizeName]
        ? this.totalJobTable.sizesDataRow.scheduledQtys[sizeName]
        - this.totalJobTable.sizesDataRow.totalPrintQtys[sizeName] : 0;
      if (this.ThisJob.sizesDataRow.incompleted[sizeName]) {
        this.totalJobTable.sizesDataRow.overUnderQty[sizeName] = this.ThisJob.sizesDataRow
          .firstQualityPrintQtys[sizeName] - this.ThisJob.sizesDataRow
          .scheduledQtys[sizeName];
      } else {
        this.totalJobTable.sizesDataRow.overUnderQty[sizeName] = this.totalJobTable.sizesDataRow
          .firstQualityPrintQtys[sizeName] - (
          (this.confirmTypeName === 'Finishing Job' ? this.salesOrderTable.sizesDataRow
            .totalFinishedQtys[sizeName] : this.salesOrderTable.sizesDataRow
            .totalProductionQtys[sizeName])
          - this.salesOrderTable.sizesDataRow.overageQtys[sizeName]);
      }
    });
  }

  public convertJobToModel(job): any {
    let jobModel = {
      scheduledQtys: [],
      damagedQtys: [],
      firstQualityPrintQtys: []
    };
    const addSizeFunc = (props): void => {
      job.sizesNameCell.forEach((size) => {
        props.forEach((prop) => {
          jobModel[prop].push({
            name: size,
            qty: job.sizesDataRow[prop][size] || 0
          });
        });
      });
    };
    addSizeFunc([
      'scheduledQtys',
      'damagedQtys',
      'firstQualityPrintQtys'
    ]);
    if (this.missingSizeThisJob.length) {
      let indexRemoved = [];
      jobModel.scheduledQtys.forEach((d, index) => {
        if (jobModel.damagedQtys[index] &&
          this.missingSizeThisJob.indexOf(jobModel.damagedQtys[index].name) > -1) {
          indexRemoved.push(index);
        }
      });
      indexRemoved.reverse().forEach((i) => {
        jobModel.damagedQtys.splice(i, 1);
        jobModel.firstQualityPrintQtys.splice(i, 1);
      });
    }
    return jobModel;
  }

  public getTotalSizeRow(sizeData, rowName: string): number {
    let total;
    sizeData.sizesNameCell.forEach((sizeName) => {
      if (this.ThisJob.sizesDataRow.incompleted[sizeName]) {
        return;
      }
      if (!isNaN(sizeData.sizesDataRow[rowName][sizeName])) {
        if (isNaN(total)) {
          total = 0;
        }
        total += sizeData.sizesDataRow[rowName][sizeName];
      }
    });
    return total;
  }

  public get ThisJob() {
    return this.jobTable.find((i) => i.isThisJob);
  }

  public onDoubleClicked(event, job, jobIndex, row, cell, rowIndex, cellIndex): void {
    if (rowIndex > 0 && rowIndex < 3 && job.sizesDataRow['scheduledQtys'][cell] > 0) {
      this.editing[`${jobIndex}-${rowIndex}-${cellIndex}`] = true;
    }
  }

  public onUpdateValue(event, tableName, tableData, sizeRow, sizeName, rowIndex, cellIndex) {
    this.editing[`${tableName}-${rowIndex}-${cellIndex}`] = false;
    if (isNaN(Number.parseInt(event.target.value))) {
      return;
    }
    tableData.sizesDataRow[sizeRow.prop][sizeName] = Number.parseInt(event.target.value);
    this.calculateTotalPrintQtys(tableData.sizesDataRow, sizeName);
    this.convertTotalJobSizes(this.jobTable, true);
  }

  public onKeydown(event, tableName, tableData, row, cell, rowIndex, cellIndex): void {
    let e = <KeyboardEvent> event;
    // on esc
    if (e.keyCode === 27) {
      event.target.value = tableData.sizesDataRow[row.prop][cell];
      this.editing[`${tableName}-${rowIndex}-${cellIndex}`] = false;
    } else if ((!event.shiftKey && e.keyCode === 9 && e.code === 'Tab')
      || (e.keyCode === 39 && e.code === 'ArrowRight')
      || (e.keyCode === 13 && (e.code === 'Enter' || e.code === 'NumpadEnter'))) {
      const backFirstCell = () => {
        let availableCellIndex = -1;
        let isFound = false;
        while (!isFound && availableCellIndex <= tableData.sizesNameCell.length - 1) {
          if (tableData.sizesDataRow['scheduledQtys']
            [tableData.sizesNameCell[++availableCellIndex]] > 0) {
            this.editing[`${tableName}-${rowIndex}-${availableCellIndex}`] = true;
            isFound = true;
          }
        }
      };
      if (cellIndex < tableData.sizesNameCell.length - 1) {
        // if next cell is available, show input
        if (tableData.sizesDataRow['scheduledQtys'][tableData.sizesNameCell[cellIndex + 1]] > 0) {
          this.editing[`${tableName}-${rowIndex}-${cellIndex + 1}`] = true;
        } else { // if not, find available cell and active it
          // let availableCellIndex = cellIndex + 1;
          // let isFound = false;
          // while (!isFound && availableCellIndex <= tableData.sizesNameCell.length - 1) {
          //   if (tableData.sizesDataRow['scheduledQtys']
          //       [tableData.sizesNameCell[++availableCellIndex]] > 0) {
          //     this.editing[`${tableName}-${rowIndex}-${availableCellIndex}`] = true;
          //     isFound = true;
          //   }
          // }
          // if (!isFound) {
          //   backFirstCell();
          // }
        }
      } else {
        // backFirstCell();
        if (rowIndex + 1 < 3) {
          this.editing[`${tableName}-${rowIndex + 1}-0`] = true;
        }
      }
      if (e.keyCode === 13 && (e.code === 'Enter' || e.code === 'NumpadEnter')) {
        this.onUpdateValue(event, tableName, tableData, row, cell, rowIndex, cellIndex);
      }
    } else if ((event.shiftKey && e.keyCode === 9 && e.code === 'Tab')
      || (e.keyCode === 37 && e.code === 'ArrowLeft')) {
      const backLastCell = () => {
        let availableCellIndex = tableData.sizesNameCell.length;
        let isFound = false;
        while (!isFound && availableCellIndex >= 0) {
          if (tableData.sizesDataRow['scheduledQtys']
            [tableData.sizesNameCell[--availableCellIndex]] > 0) {
            this.editing[`${tableName}-${rowIndex}-${availableCellIndex}`] = true;
            isFound = true;
          }
        }
      };
      if (cellIndex > 0) {
        // if pre cell is available, show input
        if (tableData.sizesDataRow['scheduledQtys'][tableData.sizesNameCell[cellIndex - 1]] > 0) {
          this.editing[`${tableName}-${rowIndex}-${cellIndex - 1}`] = true;
        } else { // if not, find available cell and active it
          // let availableCellIndex = cellIndex - 1;
          // let isFound = false;
          // while (!isFound && availableCellIndex >= 0) {
          //   if (tableData.sizesDataRow['scheduledQtys']
          //       [tableData.sizesNameCell[--availableCellIndex]] > 0) {
          //     this.editing[`${tableName}-${rowIndex}-${availableCellIndex}`] = true;
          //     isFound = true;
          //   }
          // }
          // if (!isFound) {
          //   backLastCell();
          // }
        }
      } else {
        // backLastCell();
        if (rowIndex - 1 > 0) {
          this.editing[`${tableName}-${rowIndex - 1}-${tableData.sizesNameCell.length - 1}`] = true;
        }
      }
    } else if (e.keyCode === 38 && e.code === 'ArrowUp') {
      if (rowIndex - 1 > 0) {
        this.editing[`${tableName}-${rowIndex - 1}-${cellIndex}`] = true;
      }
      return;
    } else if (e.keyCode === 40 && e.code === 'ArrowDown') {
      if (rowIndex + 1 < 3) {
        this.editing[`${tableName}-${rowIndex + 1}-${cellIndex}`] = true;
      }
      return;
    } else if (e.keyCode === 13 && (e.code === 'Enter' || e.code === 'NumpadEnter')) {
      this.onUpdateValue(event, tableName, tableData, row, cell, rowIndex, cellIndex);
    } else {
      return;
    }
  }

  public getNullRowIndex(row, job): number {
    let index = -1;
    for (const prop of Object.keys(job)) {
      if (this.checkNullObject(job[prop]) && index === -1) {
        index = row.findIndex((i) => i.prop === prop);
      }
    }
    return index;
  }

  public checkNullObject(obj): boolean {
    return _.isEqual({}, obj);
  }

  public checkNaN(num): boolean {
    return isNaN(num);
  }

  public checkPendingJob(): boolean {
    let isPending = false;
    this.jobDetailData.forEach((i) => {
      if (!isPending) {
        if ((!i.damagedQtys || !i.damagedQtys.length)
          && (!i.firstQualityPrintQtys || !i.firstQualityPrintQtys.length)) {
          isPending = true;
        }
      }
    });
    return isPending;
  }

  public checkPendingJobBy(index): boolean {
    const job = this.jobDetailData[index];
    if ((!job.damagedQtys || !job.damagedQtys.length)
      && (!job.firstQualityPrintQtys || !job.firstQualityPrintQtys.length)) {
      return true;
    }
    return false;
  }

  public checkCompleteJob(): boolean {
    return !this.totalJobTable.sizesNameCell.some((size) => {
      return this.totalJobTable.sizesDataRow.overUnderQty[size] < 0;
    });
  }

  public onChangeIncompleted(job, jobIndex, sizeName): void {
    if (!this.jobDetailData[jobIndex].isThisJob
      || job.sizesDataRow['scheduledQtys'][sizeName] === 0) {
      return;
    }
    const status = !job.sizesDataRow['incompleted'][sizeName];
    this._confirmJobServive.changeIncompleted(this.schedulerId, status, sizeName)
      .subscribe((resp: BasicResponse) => {
        if (resp.status) {
          job.sizesDataRow['incompleted'][sizeName] = status;
          if (status) {
            this.totalJobTable.sizesDataRow.overUnderQty[sizeName] = this.ThisJob.sizesDataRow
              .firstQualityPrintQtys[sizeName] - this.ThisJob.sizesDataRow
              .scheduledQtys[sizeName];
          } else {
            this.totalJobTable.sizesDataRow.overUnderQty[sizeName] = this.totalJobTable.sizesDataRow
              .firstQualityPrintQtys[sizeName] - (
              (this.confirmTypeName === 'Finishing Job' ? this.salesOrderTable.sizesDataRow
                .totalFinishedQtys[sizeName] : this.salesOrderTable.sizesDataRow
                .totalProductionQtys[sizeName])
              - this.salesOrderTable.sizesDataRow.overageQtys[sizeName]);
          }
          this._toastrService.success(resp.message, 'Success');
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public isIncompletedCell(): boolean {
    return this.ThisJob.sizesNameCell
      .some((sizeName) => this.ThisJob.sizesDataRow.incompleted[sizeName]);
  }

  public isIncompletedCellBy(sizeName: string): boolean {
    return this.ThisJob.sizesDataRow.incompleted[sizeName];
  }

  public manuallyReschedule() {
    let thisJobModel = this.convertJobToModel(this.ThisJob);
    const model = {
      damagedQtys: thisJobModel.damagedQtys,
      firstQualityPrintQtys: thisJobModel.firstQualityPrintQtys,
      underQtys: []
    };
    const totalJobModel = Object.assign({}, this.totalJobTable);
    totalJobModel.sizesNameCell.forEach((size) => {
      model.underQtys.push({
        name: size,
        qty: totalJobModel.sizesDataRow.overUnderQty[size] >= 0
          ? 0 : -totalJobModel.sizesDataRow.overUnderQty[size]
      });
    });
    this._confirmJobServive.manuallyReschedule(this.schedulerId, model)
      .subscribe((resp: BasicResponse) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
          this.activeModal.close({status: true});
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public moveToTomorrow() {
    let thisJobModel = this.convertJobToModel(this.ThisJob);
    const model = {
      damagedQtys: thisJobModel.damagedQtys,
      firstQualityPrintQtys: thisJobModel.firstQualityPrintQtys,
      underQtys: []
    };
    const totalJobModel = Object.assign({}, this.totalJobTable);
    totalJobModel.sizesNameCell.forEach((size) => {
      model.underQtys.push({
        name: size,
        qty: totalJobModel.sizesDataRow.overUnderQty[size] >= 0 ?
          0 : -totalJobModel.sizesDataRow.overUnderQty[size]
      });
    });

    this._confirmJobServive.moveToTomorrow(this.schedulerId, model)
      .subscribe((resp: BasicResponse) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
          this.activeModal.close({status: true});
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public acceptShortages() {
    this.activeModal.close({status: true});
  }

  public acceptJob(isAcceptShortages = false) {
    let totalShortageQty = 0;
    this.totalJobTable.sizesNameCell.forEach((sizeName) => {
      if (this.totalJobTable.sizesDataRow['overUnderQty'][sizeName] < 0) {
        totalShortageQty -= this.totalJobTable.sizesDataRow['overUnderQty'][sizeName];
      }
    });
    let thisJobModel = this.convertJobToModel(this.ThisJob);
    const model: any = {
      damagedQtys: thisJobModel.damagedQtys,
      firstQualityPrintQtys: thisJobModel.firstQualityPrintQtys
    };
    if (isAcceptShortages) {
      model.totalShortageQty = totalShortageQty;
    }
    this._confirmJobServive.acceptJob(this.schedulerId, model, isAcceptShortages)
      .subscribe((resp: BasicResponse) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
          this.activeModal.close({status: true});
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public addMissingSize(jobData) {
    jobData.forEach((job) => {
      if (job.scheduledQtys && job.scheduledQtys.length > job.damagedQtys.length) {
        job.scheduledQtys.forEach((d, index) => {
          if (!job.damagedQtys[index]) {
            if (job.isThisJob) {
              this.missingSizeThisJob.push(d.name);
            }
          } else if (!job.damagedQtys[index] || d.name !== job.damagedQtys[index].name) {
            job.damagedQtys.splice(index, 0, d);
            job.firstQualityPrintQtys.splice(index, 0, d);
            if (job.isThisJob) {
              this.missingSizeThisJob.push(d.name);
            }
          }
        });
      }
    });
  }
}
