import {
  Component
} from '@angular/core';

// Services
import {
  NgbActiveModal
} from '@ng-bootstrap/ng-bootstrap';

// Interfaces
import {
  PackagingType
} from '../../packaging-approved.model';

@Component({
  selector: 'select-packagings',
  templateUrl: 'select-packaging.template.html',
  styles: [
      `
      .multi-packaging {
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
export class SelectPackagingComponent {
  public packagingsList = [];
  public deletedPackagings = [];
  public packagingsListData = PackagingType;

  constructor(public activeModal: NgbActiveModal) {
  }

  public isActive(type): boolean {
    return this.packagingsList.findIndex((i) => i.id === type) > -1;
  }

  /**
   * onChange
   * @param $event
   * @param {TrimDetail} packaging
   */
  public onChange($event, packaging: any): void {
    if ($event.target.checked) {
      this.packagingsList.push(packaging);
      let index = this.deletedPackagings.findIndex((i) => i.name === $event.target.id);
      if (index > -1) {
        this.deletedPackagings.splice(this.deletedPackagings[index], 1);
      }
    } else {
      let index = this.packagingsList.findIndex((i) => i.name === $event.target.id);
      if (index > -1) {
        if (this.packagingsList[index].id) {
          this.deletedPackagings.push(this.packagingsList[index]);
        }
        this.packagingsList.splice(index, 1);
      }
    }
  }

  /**
   * onChangeType
   * @param event
   * @param item
   */
  public onChangeType(event, packaging): void {
    let curTrim = this.packagingsList.find((i) => i.name === packaging.name);
    if (curTrim && curTrim.isChangeQty) {
      curTrim.newQty = +event.target.value;
    } else {
      curTrim.qty = +event.target.value;
    }
  }

  /**
   * onSubmit
   */
  public onSubmit(): void {
    this.activeModal.close({
      status: true,
      packagingsList: this.packagingsList,
      deletedPackagingsList: this.deletedPackagings
    });
  }

  public onClose(): void {
    this.activeModal.close({
      status: false
    });
  }
}
