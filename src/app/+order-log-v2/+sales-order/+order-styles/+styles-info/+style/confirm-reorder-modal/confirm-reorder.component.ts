import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

// 3rd modules
import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';

// Services
import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';
import {
  ConfirmReorderService
} from './confirm-reorder.service';

// Interfaces
import {
  ResponseMessage
} from '../../../../../../shared/models/respone.model';

// Components
import {
  DatatableComponent
} from '@swimlane/ngx-datatable';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'confirm-reorder',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'confirm-reorder.template.html',
  styleUrls: [
    'confirm-reorder.style.scss'
  ]
})
export class ConfirmReorderComponent implements OnInit, AfterViewInit,
                                          OnDestroy {
  @ViewChild('tableWrapper')
  public tableWrapper;
  @ViewChild('stylesTable')
  public stylesTable: DatatableComponent;
  public currentComponentWidth;
  @Input()
  public styleId: number = 0;
  public styleList: any = [];
  public selectedStyleId = 0;

  constructor(public activeModal: NgbActiveModal,
              private _modalService: NgbModal,
              private _reorderService: ConfirmReorderService) {
    // e
  }

  public ngOnInit(): void {
    this.getReorderList();
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      for (let i = 0; i < 10; i++) {
        this.stylesTable.recalculate();
      }
    }, 1000);
  }

  public getReorderList() {
    this._reorderService.getReorderList(this.styleId)
      .subscribe((resp: ResponseMessage<any>): void => {
        if (resp.status) {
          this.styleList = resp.data;
          // reduce modal width when no data
          if (!this.styleList || !this.styleList.length) {
            let modalE = document.getElementsByClassName('modal-dialog modal-lg');
            if (modalE.length) {
              modalE[0]['style'].width = '800px';
            }
          }
        } else {
          // e
        }
    });
  }

  public selectStyle(event, id) {
    if (event.target) {
      if (event.target.checked) {
        this.selectedStyleId = id;
      } else {
        this.selectedStyleId = 0;
      }
    }
  }

  public onSubmit() {
    if (!this.selectedStyleId) {
      return;
    }
    let model = this.styleList.filter((s) => s.id === this.selectedStyleId);
    this._reorderService.confirmReorder(this.styleId, model[0])
      .subscribe((resp: ResponseMessage<any>): void => {
        if (resp.status) {
          this.activeModal.close(true);
        } else {
          // e
        }
    });
  }

  public ngOnDestroy(): void {
    // empty
  }
}
