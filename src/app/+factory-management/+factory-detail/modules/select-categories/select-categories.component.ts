import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';

// Services
import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import {
  CategoryManagementService
} from '../../../../+settings/+category-management/category-management.service';

// Interfaces
import {
  ResponseMessage
} from '../../../../shared/models';

@Component({
  selector: 'select-categories',
  templateUrl: 'select-categories.template.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
      `
      .multi-categories {
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
export class SelectCategoriesComponent implements OnInit, AfterViewInit {
  @ViewChildren('multiCb')
  public multiCb: QueryList<any>;

  public categoriesList = [];
  public categoriesListData = [];

  constructor(public activeModal: NgbActiveModal,
              private _toastrService: ToastrService,
              private _changeDetectorRef: ChangeDetectorRef,
              private _categoryManagementService: CategoryManagementService) {
  }

  public ngOnInit(): void {
    this._categoryManagementService.getListCategory(null)
      .subscribe((resp: ResponseMessage<any>) => {
        if (resp.status && resp.data) {
          let listCategories = resp.data;
          if (listCategories.data) {
            this.categoriesListData = listCategories.data.filter((i) => !i.isDisabled);
            this._changeDetectorRef.markForCheck();
          }
        } else {
          this._toastrService.error(resp.errorMessages, 'Error');
        }
      });
  }

  public ngAfterViewInit(): void {
    this.multiCb.changes.subscribe((cb) => {
      cb.forEach((item) => {
        item.nativeElement.checked = this.categoriesList
          .findIndex((i) => i.categoryName === item.nativeElement.id) > -1;
      });
      this._changeDetectorRef.markForCheck();
    });
  }

  /**
   * onChange
   * @param $event
   * @param {TrimDetail} category
   */
  public onChange($event, category: any): void {
    if ($event.target.checked) {
      this.categoriesList.push({
        categoryId: category.id,
        categoryName: category.name
      });
    } else {
      let index = this.categoriesList.findIndex((i) => i.categoryName === $event.target.id);
      if (index > -1) {
        this.categoriesList.splice(index, 1);
      }
    }
  }

  /**
   * onSubmit
   */
  public onSubmit(): void {
    this.activeModal.close({
      status: true,
      categoriesList: this.categoriesList
    });
  }

  public onClose(): void {
    this.activeModal.close({
      status: false
    });
  }
}
