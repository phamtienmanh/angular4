import {
  Component,
  ViewEncapsulation,
  Input,
  ChangeDetectorRef,
  ViewChild,
  AfterContentChecked
} from '@angular/core';

// Interfaces
import {
  TaskStatus,
  TaskStatusLabel
} from '../../outsource-main.model';

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
export class LabelStatusComponent implements AfterContentChecked {
  @Input()
  public columnStatus: number;
  @Input()
  public isMarkedMode: boolean = false;
  @Input()
  public isMarked: boolean = false;
  @Input()
  public isReorder: boolean = false;
  @ViewChild('statusElm')
  public statusElm;

  public taskStatus = TaskStatus;
  public taskStatusObj = TaskStatusLabel;
  private _preStatus = -1;

  constructor(private _cd: ChangeDetectorRef) {
    this._cd.detach();
  }

  public ngAfterContentChecked(): void {
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
    if (this.isReorder || !status) {
      return nullStatusObj;
    }
    const rs = this.taskStatusObj.find((i) => i.id === status);
    return rs ? rs : nullStatusObj;
  }
}
