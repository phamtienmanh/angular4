import {
  Directive,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  Renderer
} from '@angular/core';

import {
  CommonElementDirective
} from './../common-element';

@Directive({
  selector: 'a,button,input[button],input[submit],div[clickable],span[clickable],p[clickable]',
  exportAs: 'clickable-element'
})
export class ClickableElementDirective extends CommonElementDirective {
  @Output()
  public onClick = new EventEmitter<string>();
  /**
   * Mouse down
   */
  @Output()
  public onMouseDown = new EventEmitter<string>();
  /**
   * Mouse up
   */
  @Output()
  public onMouseUp = new EventEmitter<string>();

  constructor(public el: ElementRef,
              private _renderer: Renderer) {
    super(el);
  }

  @HostListener('click', ['$event.target'])
  public _onClick($target) {
    this.onClick.emit('clicked');
  }

  @HostListener('mousedown', ['$event.target'])
  public _onMouseDown($target) {
    this.onMouseDown.emit('mousedowned');
    this._renderer.setElementClass(this.el.nativeElement, 'activated', true);
  }

  @HostListener('mouseup', ['$event.target'])
  public _onMouseUp($target) {
    this.onMouseUp.emit('mouseuped');
    this._renderer.setElementClass(this.el.nativeElement, 'activated', false);
  }
}
