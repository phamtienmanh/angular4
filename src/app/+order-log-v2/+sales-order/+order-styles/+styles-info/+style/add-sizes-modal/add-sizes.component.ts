import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
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

// interfaces
import {
  ConfirmDialogComponent
} from '../../../../../../shared/modules/confirm-dialog/confirm-dialog.component';
import {
  SizeInfo
} from './add-sizes.model';

// components

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'add-sizes',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'add-sizes.template.html',
  styleUrls: []
})
export class AddSizesComponent implements OnInit, AfterViewInit,
                                          OnDestroy {
  @Input()
  public selectedSizes: any[];
  @Input()
  public sizeSelections: any[];
  public sizeSelectionsOrdered: any[];
  public sizeInfo = SizeInfo;

  constructor(public activeModal: NgbActiveModal,
              private _modalService: NgbModal) {
    this.selectedSizes = [];
    this.sizeSelections = [];
    this.sizeSelectionsOrdered = [];
  }

  public ngOnInit(): void {
    this.groupSizes();
  }

  public groupSizes() {
    // order sizes by defined sizeInfo
    _.forEach(this.sizeInfo, (val, key) => {
      let size = this.sizeSelections.find((s) => s.name.toUpperCase() === key);
      if (size) {
        this.sizeSelectionsOrdered.push({...size, type: val});
      }
    });
    // size did not define
    let sizesNoType = _.differenceBy(this.sizeSelections, this.sizeSelectionsOrdered, 'id');
    sizesNoType.forEach((s) => {
      this.sizeSelectionsOrdered.push({...s, type: 99});
    });
    // config selected
    this.sizeSelectionsOrdered = _.orderBy(this.sizeSelectionsOrdered, ['type'], ['asc']);
    this.sizeSelectionsOrdered.forEach((size: any) => {
      let isSelected = this.selectedSizes.some((s) => s.id === size.id);
      if (isSelected) {
        size.isSelected = true;
      }
    });
  }

  public onSubmit() {
    let selectingSizes = this.sizeSelectionsOrdered.filter((size) => size.isSelected);
    let removedSizes = _.differenceBy(this.selectedSizes, selectingSizes, 'id');
    this.activeModal.close({
      status: true,
      selectingSizes,
      removedSizes
    });
  }

  public ngAfterViewInit(): void {
    // e
  }

  public ngOnDestroy(): void {
    // empty
  }
}
