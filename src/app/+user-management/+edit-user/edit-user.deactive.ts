import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot
} from '@angular/router';
import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';

import {
  EditUserComponent
} from './edit-user.component';

import {
  ConfirmDialogComponent
} from '../../shared/modules/confirm-dialog';
import { UserContext } from '../../shared/services/user-context';

@Injectable()
export class EditUserDeactive implements CanDeactivate<EditUserComponent> {
  constructor(private _modalService: NgbModal,
              private _userContext: UserContext) {
    // empty
  }

  public canDeactivate(component: EditUserComponent,
                       currentRoute: ActivatedRouteSnapshot,
                       currentState: RouterStateSnapshot,
                       nextState: RouterStateSnapshot) {
    if (!this._userContext.currentUser.id) {
      return true;
    }
    const preData = component.childComponent.preUserInfoData;
    const curData = component.childComponent.frm.getRawValue();
    if (!preData || !curData) {
      return true;
    }
    const prelistRoleIds = component.childComponent.prelistRoleIds;
    const listRoleIds = component.childComponent.listRoleIds;
    delete preData['formRequires'];
    delete curData['formRequires'];
    if (_.isEqual(preData, curData) && _.isEqual(prelistRoleIds, listRoleIds)) {
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
