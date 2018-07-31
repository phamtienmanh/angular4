import {
  Component,
  OnInit,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  AfterViewChecked,
  ChangeDetectionStrategy
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

// Services
import {
  ConfigTscScheduledService
} from './config-tsc-scheduled.servive';
import { AuthService } from '../../../shared/services/auth';

// Component
import {
  DatatableComponent
} from '@swimlane/ngx-datatable/release';

// Interfaces
import {
  ResponseMessage
} from '../../../shared/models';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'config-tsc-scheduled',  // <sign-in></sign-in>
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'config-tsc-scheduled.template.html',
  styleUrls: [
    'config-tsc-scheduled.style.scss'
  ]
})
export class ConfigTscScheduledComponent implements OnInit,
                                                    AfterViewChecked {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild(DatatableComponent)
  public table: DatatableComponent;

  public currentComponentWidth;
  public schedulerId;
  public orderId;
  public isPageReadOnly = false;
  public isFinishing = false;
  public finishingProcess;
  public processName;

  public sizesList = [
    {
      id: 0,
      name: 'Total Order Qty',
      prop: 'totalOrderSizes',
      display: true,
      class: ''
    },
    {
      id: 1,
      name: 'Overage Qty',
      prop: 'overageSizes',
      display: true,
      class: ''
    },
    {
      id: 2,
      name: 'Total Production Qty',
      prop: 'totalProductionSizes',
      display: true,
      class: 'last-row'
    },
    {
      id: 3,
      name: 'Total Finished Qty',
      prop: 'totalFinishedSizes',
      display: true,
      class: ''
    },
    {
      id: 4,
      name: 'Scheduled Qtys (other Jobs)',
      prop: 'schedOtherJobsSizes',
      display: false,
      class: ''
    },
    {
      id: 5,
      name: 'Schedule Qtys (this Job)',
      prop: 'schedThisJobSizes',
      display: false,
      class: ''
    }
  ];

  public tableData = {};
  public tableDataOrigin;

  public editing = {};
  public isShortage = false;

  public mainSizeId = 2;

  constructor(private _router: Router,
              private _toastrService: ToastrService,
              private _detector: ChangeDetectorRef,
              public activeModal: NgbActiveModal,
              private _modalService: NgbModal,
              private _authService: AuthService,
              private _configScheSv: ConfigTscScheduledService,
              private _changeDetectorRef: ChangeDetectorRef) {
    // empty
  }

  public ngOnInit(): void {
    this.isPageReadOnly = !this._authService.checkCanModify('Schedules.Scheduler');
    this.getConfigData();
    if (this.isFinishing) {
      this.mainSizeId = 3;
      this.sizesList[2].class = '';
      this.sizesList[3].class = 'last-row';
    }
  }

  public ngAfterViewChecked() {
    // Check if the table size has changed
    if (this.tableWrapper &&
      this.tableWrapper.nativeElement.clientWidth !== this.currentComponentWidth) {
      this.currentComponentWidth = this.tableWrapper.nativeElement.clientWidth;
      this.sizeTableScrollBar();
    }
  }

  public getConfigData() {
    this._configScheSv.getConfigData(this.schedulerId)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this.tableData = resp.data;
          this.checkShortage();
          this.calculateTotalQty();
          this.tableDataOrigin = JSON.parse(JSON.stringify(this.tableData));
          this._changeDetectorRef.markForCheck();
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public onSubmit() {
    let params: HttpParams = new HttpParams()
      .set('orderId', this.orderId);
    this._configScheSv
    .updateConfigData(this.schedulerId, this.tableData[this.sizesList[5].prop], params)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status) {
          this._toastrService.success(resp.message, 'Success');
          this.activeModal.close(true);
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public calculateTotalQty() {
    let tb = this.tableData;
    tb['unscheduledQtys'] = [];
    if (!tb[this.sizesList[4].prop].length ||
      !tb[this.sizesList[5].prop].length) {
      return;
    }
    // calculate total qty
    this.sizesList.forEach((size) => {
      let totals = 0;
      tb[size.prop].forEach((item, index) => {
        totals += item.qty;
      });
      tb[size.prop].totalQty = totals;
    });
    // calculate Unscheduled Qtys
    tb[this.sizesList[0].prop].forEach((item, index) => {
      if (!this.isShortage) {
        tb['unscheduledQtys'].push(
          tb[this.sizesList[this.mainSizeId].prop][index].qty
          - (tb[this.sizesList[4].prop][index]
          ? tb[this.sizesList[4].prop][index].qty : 0)
          - (tb[this.sizesList[5].prop][index]
          ? tb[this.sizesList[5].prop][index].qty : 0)
        );
      } else {
        if (!this.tableDataOrigin || !this.tableDataOrigin['unscheduledQtys']) {
          tb['unscheduledQtys'].push(0);
        } else {
          tb['unscheduledQtys'].push(
            this.tableDataOrigin[this.sizesList[5].prop][index].qty
            - tb[this.sizesList[5].prop][index].qty
          );
        }
      }
    });
    if (!this.isShortage) {
      tb['unscheduledQtys'].push(
        tb[this.sizesList[this.mainSizeId].prop].totalQty
        - tb[this.sizesList[4].prop].totalQty
        - tb[this.sizesList[5].prop].totalQty
      );
    } else {
      if (!this.tableDataOrigin || !this.tableDataOrigin['unscheduledQtys']) {
        tb['unscheduledQtys'].push(0);
      } else {
        let sum = 0;
        tb['unscheduledQtys'].forEach((u) => {
          sum += u;
        });
        tb['unscheduledQtys'].push(sum);
      }
    }
  }

  public onDoubleClicked(event, cell, sizeIndex): void {
    if (!this.isPageReadOnly) {
      this.editing[`${sizeIndex}-${cell}`] = true;
    }
  }

  public onUpdateValue(event, prop, sizeIndex) {
    this.editing[`${sizeIndex}-sched`] = false;
    if (this.invalidQty(sizeIndex)) {
      return;
    }
    this.tableData[prop][sizeIndex].qty = Number.parseInt(event.target.value);
    this.calculateTotalQty();
  }

  public onKeydown(event, prop, sizeName, sizeIndex): void {
    let e = <KeyboardEvent> event;
    // on esc
    if (e.keyCode === 27) {
      event.target.value = this.tableData[prop][sizeIndex].qty;
      this.editing[`${sizeIndex}-${sizeName}`] = false;
    } else if ((!event.shiftKey && e.keyCode === 9 && e.code === 'Tab')
      || (e.keyCode === 39 && e.code === 'ArrowRight')) {
      if (sizeIndex < this.tableData[prop].length - 1) {
        this.editing[`${sizeIndex + 1}-${sizeName}`] = true;
      }
    } else if ((event.shiftKey && e.keyCode === 9 && e.code === 'Tab')
      || (e.keyCode === 37 && e.code === 'ArrowLeft')) {
      if (sizeIndex > 0) {
        this.editing[`${sizeIndex - 1}-${sizeName}`] = true;
      }
    } else if (e.keyCode === 38 && e.code === 'ArrowUp') {
      return;
    } else if (e.keyCode === 40 && e.code === 'ArrowDown') {
      return;
    } else if (e.keyCode === 13 && (e.code === 'Enter' || e.code === 'NumpadEnter')) {
      this.onUpdateValue(event, prop, sizeIndex);
    } else {
      return;
    }
  }

  public invalidQty(index) {
    let inputQty = document.getElementById(`${index}-sched`);
    if (inputQty && inputQty['value']) {
      if (this.isShortage &&
        Number.parseInt(inputQty['value']) >
        this.tableDataOrigin[this.sizesList[5].prop][index].qty) {
        return true;
      }
      if (!this.isShortage && Number.parseInt(inputQty['value'])
        + this.tableDataOrigin[this.sizesList[4].prop][index].qty >
        this.tableDataOrigin[this.sizesList[this.mainSizeId].prop][index].qty) {
        return true;
      }
    }
    if (inputQty && !inputQty['value']) {
      return true;
    }
    return false;
  }

  public sizeTableScrollBar() {
    // recalculate size table scrollbar
    let pfScroll = document.getElementById('perfect-scrollbar');
    let scrollBar;
    if (pfScroll) {
      scrollBar = pfScroll.getElementsByClassName('ps__rail-x');
    }
    if (scrollBar && scrollBar[0]) {
      (scrollBar[0] as HTMLElement).click();
    }
    setTimeout(() => {
      if (this.table) {
        this.table.recalculate();
      }
      this._changeDetectorRef.markForCheck();
    }, 200);
  }

  public checkShortage() {
    for (let i = 0; i < this.tableData[this.sizesList[5].prop].length; i++) {
      if (this.tableData[this.sizesList[5].prop][i].qty +
      this.tableData[this.sizesList[4].prop][i].qty >
      this.tableData[this.sizesList[this.mainSizeId].prop][i].qty) {
        this.isShortage = true;
      }
    }
  }
}
