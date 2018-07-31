import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';

import {
  TaskStatus
} from '../../outsource-main.model';

@Component({
  selector: 'column-info',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'column-info.template.html',
  styleUrls: [
    'column-info.style.scss'
  ]
})
export class ColumnInfoComponent implements OnInit, OnChanges {
  @Input()
  public statusLength: number;
  @Input()
  public columnInfoObj: any;
  @Input()
  public isShowStatus = true;
  @Input()
  public isShowLeadTime = true;
  @Input()
  public isShowStatusDate = true;

  public taskStatus = TaskStatus;
  public dateStr = '';
  public etaDateEqualTodayDate = false;
  public etaDateLessTodayDate = false;
  public completedDateLargeEtaDate = false;

  constructor() {
    // empty
  }

  public ngOnInit(): void {
    this.getDateStr();
    this.initValue();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.ngOnInit();
  }

  public getDateStr(): void {
    switch (this.columnInfoObj.status) {
      case this.taskStatus.PENDINGAPPROVAL:
      case this.taskStatus.WAITINGCUSTOMER:
      case this.taskStatus.WAITINGINTERNAL:
        this.dateStr = 'Pend: ';
        break;
      case this.taskStatus.REJECTED:
      case this.taskStatus.REJECTEDRESUBMIT:
        this.dateStr = 'Rejc: ';
        break;
      case this.taskStatus.APPROVEDWCHANGES:
      case this.taskStatus.APPROVED:
        this.dateStr = 'Appr: ';
        break;
      case this.taskStatus.DONE:
        this.dateStr = 'Done: ';
        break;
      case this.taskStatus.PARTIALLYRECEIVED:
      case this.taskStatus.RECEIVED:
        this.dateStr = 'Rcvd: ';
        break;
      case this.taskStatus.DROPPED:
        this.dateStr = 'Drop: ';
        break;
      case this.taskStatus.SUBMITTED:
        this.dateStr = 'Subm: ';
        break;
      case this.taskStatus.SCHEDULED:
        this.dateStr = 'Sched: ';
        break;
      default:
        this.dateStr = '';
        break;
    }
  }

  public initValue(): void {
    const todayDateNum = new Date().setHours(0, 0, 0, 0);
    const etaDateNum = new Date(this.columnInfoObj.etaDateReviseOnUtc
      || this.columnInfoObj.etaDateOnUtc).setHours(0, 0, 0, 0);
    const completedDateNum = (!!this.columnInfoObj.statusDateOnUtc ?
      new Date(this.columnInfoObj.statusDateOnUtc) : new Date())
      .setHours(0, 0, 0, 0);
    this.etaDateEqualTodayDate = etaDateNum === todayDateNum;
    this.etaDateLessTodayDate = etaDateNum < todayDateNum;
    this.completedDateLargeEtaDate = completedDateNum > etaDateNum;
  }
}
