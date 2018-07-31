import {
  Directive,
  Input,
  ElementRef,
  OnInit
} from '@angular/core';

import {
  UserContext
} from '../../services/user-context';

@Directive({
  selector: '[permission]'
})
export class PermissionDirective implements OnInit {
  @Input() public permission: string[];

  constructor(private _elementRef: ElementRef,
              private _userContext: UserContext) {
  }

  public ngOnInit() {
    let havePermission = this._checkPermission();
    this._handleElement(havePermission);
  }

  private _checkPermission(): boolean {
    let currentUser = this._userContext.currentUser;
    if (!this.permission || !this.permission.length) {
      return true;
    }
    if (currentUser.listRole.some((i) => i.roleName === 'Administrator'
        || i.roleName === 'Staff Administrator')) {
      return true;
    }
    return currentUser.listRole.some((role) => {
      return this.permission.some((p) => {
        return p === role.roleName;
      });
    });
  }

  private _handleElement(havePermission: boolean) {
    if (!havePermission) {
      let el: HTMLElement = this._elementRef.nativeElement;
      el.parentNode.removeChild(el);
    }
  }
}
