import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot
} from '@angular/router';
import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';

import {
  FactoryDetailComponent
} from './factory-detail.component';

import {
  ConfirmDialogComponent
} from '../../shared/modules/confirm-dialog';
import { UserContext } from '../../shared/services/user-context';

@Injectable()
export class FactoryDetailDeactive implements CanDeactivate<FactoryDetailComponent> {
  constructor(private _modalService: NgbModal,
              private _userContext: UserContext) {
    // empty
  }

  public canDeactivate(component: FactoryDetailComponent,
                       currentRoute: ActivatedRouteSnapshot,
                       currentState: RouterStateSnapshot,
                       nextState: RouterStateSnapshot) {
    if (currentState.url.includes('factory-management/new-factory')
      && nextState.url.match(/\/factory-management\/\d+/)) {
      return true;
    }
    if (!this._userContext.currentUser.id) {
      return true;
    }
    const preData = component.preFactoryData;
    const curData = component.frm.getRawValue();
    if (!preData || !curData) {
      return true;
    }
    preData.categories.forEach((i) => {
      delete i['isActive'];
    });
    curData.categories.forEach((i) => {
      delete i['isActive'];
    });
    delete preData['formRequires'];
    delete preData['pageIndex'];
    delete curData['formRequires'];
    delete curData['pageIndex'];
    if (_.isEqual(preData, curData)) {
      return true;
    }
    let modalRef = this._modalService.open(ConfirmDialogComponent, {
      keyboard: false,
      backdrop: 'static'
    });
    modalRef.componentInstance
      .message = `You have unsaved changes on this page.
       Do you want to leave this page and discard your changes, or stay on this page?`;
    modalRef.componentInstance.title = `Unsaved Changes`;
    modalRef.componentInstance.submitBtnName = `Leave`;
    modalRef.componentInstance.cancelBtnName = `Stay`;
    // Set css to popup above loading screen
    setTimeout(() => {
      const modalList = document.getElementsByClassName('modal fade');
      if (modalList && modalList.length) {
        modalList[0].className += ' ontop';
      }
    });

    return modalRef.result.then((isOk: boolean) => {
      return isOk;
    });
  }
}
