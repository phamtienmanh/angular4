import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';

// Services
import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../../../../../../shared/services/common';

// Interfaces
import {
  BasicGeneralInfo,
  ResponseMessage
} from '../../../../../../../shared/models';
import { TrimDetail } from '../../+trims-detail';

@Component({
  selector: 'select-trims',
  templateUrl: 'select-trims.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .multi-trim {
        position: absolute;
        right: 15px;
        text-align: center;
        width: 32px;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }
    `
  ]
})
export class SelectTrimsComponent implements OnInit, AfterViewInit {
  @ViewChildren('multiCb')
  public multiCb: QueryList<any>;
  @Input()
  public noTrimRequired = false;

  public trimsList = [];
  public deletedTrims = [];
  public trimsListData = [];

  public selectTrimQtys = [1, 2, 3, 4];

  constructor(public activeModal: NgbActiveModal,
              private _toastrService: ToastrService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _commonService: CommonService) {
  }

  public ngOnInit(): void {
    this.trimsList.forEach((trim) => {
      const index = trim.name.search(/\s\([0-9]\)/);
      if (index > -1) {
        trim.name = trim.name.slice(0, index);
      }
    });
    this._commonService.getTrimsList().subscribe((resp: ResponseMessage<BasicGeneralInfo[]>) => {
      if (resp.status) {
        this.trimsListData = resp.data;
        this.trimsListData.forEach((i) => {
          const id = i.id;
          i.cTrimId = id;
          i.id = undefined;
          i.qty = 1;
        });
        this.trimsList.forEach((i) => {
          let sameTrims = this.trimsListData.find((o) => o.name === i.name);
          if (sameTrims) {
            Object.assign(sameTrims, i);
          }
          i.isChangeQty = true;
        });
        this._changeDetectorRef.markForCheck();
      } else {
        this._toastrService.error(resp.errorMessages, 'Error');
      }
    });
  }

  public ngAfterViewInit(): void {
    this.multiCb.changes.subscribe((cb) => {
      cb.forEach((item) => {
        item.nativeElement.checked = this.trimsList
          .findIndex((i) => i.name === item.nativeElement.id) > -1;
      });
      this._changeDetectorRef.markForCheck();
    });
  }

  public isMultiTrims(trim): boolean {
    return this.trimsList
      .findIndex((i) => i.name === trim.name) > -1;
  }

  /**
   * onChange
   * @param $event
   * @param {TrimDetail} trim
   */
  public onChange($event, trim: TrimDetail): void {
    if ($event.target.checked) {
      this.trimsList.push(trim);
      let index = this.deletedTrims.findIndex((i) => i.name === $event.target.id);
      if (index > -1) {
        this.deletedTrims.splice(this.deletedTrims[index], 1);
      }
    } else {
      let index = this.trimsList.findIndex((i) => i.name === $event.target.id);
      if (index > -1) {
        if (this.trimsList[index].id) {
          this.deletedTrims.push(this.trimsList[index]);
        }
        this.trimsList.splice(index, 1);
      }
    }
  }

  /**
   * onChangeType
   * @param event
   * @param item
   */
  public onChangeType(event, trim): void {
    let curTrim = this.trimsList.find((i) => i.name === trim.name);
    if (curTrim && curTrim.isChangeQty) {
      curTrim.newQty = +event.target.value;
    } else {
      curTrim.qty = +event.target.value;
    }
  }

  /**
   * onNoTrimsChange
   * @param $event
   */
  public onNoTrimsChange($event): void {
    if ($event.target) {
      this.noTrimRequired = $event.target.checked;
    }
  }

  /**
   * onSubmit
   */
  public onSubmit(): void {
    this.activeModal.close({
      status: true,
      trimsList: this.trimsList,
      deletedTrimsList: this.deletedTrims,
      noTrimRequired: this.noTrimRequired
    });
  }

  public onClose(): void {
    this.activeModal.close({
      status: false
    });
  }
}
