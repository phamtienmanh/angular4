import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'pagination-control',
  // Our list of styles in our component. We may add more to compose many styles together
  encapsulation: ViewEncapsulation.None,
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: 'pagination-control.template.html',
  styleUrls: [
    'pagination-control.style.scss'
  ]
})
export class PaginationControlComponent {
  @Input('totalRecord')
  public totalRecord: number;

  @Input('pageSizeList')
  public pageSizeList: number[] = [10, 25, 50, 100];

  @Input('pageSize')
  public pageSize: number = 10;

  @Input('currentPage')
  public currentPage: number;

  @Input('pageName')
  public pageName: string = '';

  @Input('dropdownPosition')
  public dropdownPosition: string = 'bottom-left';

  @Input('disablePageSize')
  public disablePageSize: boolean = false;

  @Input('isShowPageSize')
  public isShowPageSize: boolean = true;

  @Input('isShowPagination')
  public isShowPagination: boolean = true;

  @Input('smallRow')
  public smallRow: boolean = false;

  @Output()
  public onSelectedPageSize = new EventEmitter<any>();

  @Output()
  public onPageChange = new EventEmitter<any>();

  constructor() {
    // empty
  }

  /**
   * addCommas
   * @param x
   * @returns {string}
   */
  public addCommas(x) {
    let parts = x.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  /**
   * getPaginationString
   * @returns {string}
   */
  public getPaginationString(): string {
    if (!this.disablePageSize) {
      if (!this.totalRecord) {
        return `0 items`;
      }

      let firstIndex: number = (this.currentPage - 1)
        * this.pageSize + 1;
      let lastIndex: number = Math.min(
        this.currentPage * this.pageSize,
        this.totalRecord
      );
      return `${firstIndex} - ${lastIndex} of ${this.addCommas(this.totalRecord)} items`;
    } else {
      return `${this.totalRecord} items`;
    }
  }

  /**
   * selectedPageSizeEvent
   * @param $event
   */
  public selectedPageSizeEvent($event) {
    this.currentPage = 1;
    this.pageSize = <number> (+$event);
    this.onSelectedPageSize.emit(this.pageSize);
  }

  /**
   * pageChangeEvent
   * @param {number} $event
   */
  public pageChangeEvent($event: number) {
    this.currentPage = $event;
    let draw = $event - 1;
    this.onPageChange.emit(draw);
  }
}
