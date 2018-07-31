import {
  Component,
  ViewEncapsulation,
  Input,
  Output,
  ChangeDetectorRef,
  ViewChild,
  AfterContentChecked,
  EventEmitter,
  SimpleChanges,
  OnChanges
} from '@angular/core';

// Interfaces
import {
  TaskStatus,
  TaskStatusLabel
} from '../../order-main.model';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'label-status',  // <forgot-password></forgot-password>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'label-status.template.html',
  styleUrls: [
    'label-status.style.scss'
  ]
})
export class LabelStatusComponent implements AfterContentChecked, OnChanges {
  @Input()
  public columnStatus: number;
  @Input()
  public isMarkedMode: boolean = false;
  @Input()
  public isMarked: boolean = false;
  @Input()
  public isReorder: boolean = false;
  @Input()
  public isConfirmReorder: boolean = null;
  @Input()
  public isShowUpdateSchedulerStatus: boolean = false;
  @Input()
  public shortName: string = '';
  @Input()
  public preFixName: string = '';
  @Output()
  public onConfirmReorder = new EventEmitter<boolean>();
  @Output()
  public onUpdateSchedulerStatus = new EventEmitter<boolean>();
  @ViewChild('statusElm')
  public statusElm;

  public taskStatus = TaskStatus;
  public taskStatusObj = TaskStatusLabel;
  private _preStatus = -1;

  constructor(private _cd: ChangeDetectorRef) {
    this._cd.detach();
  }

  public ngOnChanges(changes: SimpleChanges) {
    this._cd.detectChanges();
  }

  public ngAfterContentChecked(): void {
    if (this.isReorder) {
      this.columnStatus = this.isConfirmReorder ? TaskStatus.REORDERCONFIRM : TaskStatus.REORDER;
    }
    const rs = this.getStatusObj(this.columnStatus);
    if (rs && rs.id !== this._preStatus) {
      this._preStatus = rs.id;
      this._cd.detectChanges();
    }
  }

  public getStatusObj(status): any {
    const nullStatusObj = {
      id: null,
      name: '?',
      className: 'stt-black'
    };
    if (!status) {
      return nullStatusObj;
    }
    const rs = this.taskStatusObj.find((i) => i.id === status);
    if (status === TaskStatus.TBD && rs  && (this.preFixName || this.shortName)) {
      // sched, ship tbd
      rs.className = 'stt-yellow';
    }
    return rs ? rs : nullStatusObj;
  }

  public confirmReorder($event) {
    $event.stopPropagation();
    this.onConfirmReorder.emit(true);
  }

  public updateSchedulerStatus($event) {
    $event.stopPropagation();
    this.onUpdateSchedulerStatus.emit(true);
  }
}
