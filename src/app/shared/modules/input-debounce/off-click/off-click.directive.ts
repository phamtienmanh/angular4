import {
  Directive,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
} from '@angular/core';
@Directive({
  selector: '[off-click]',
})
export class OffClickDirective {
  @Output()
  public clickedOutSide = new EventEmitter();

  constructor(private _elementRef: ElementRef) {
    // empty
  }

  // @HostListener('document:click', ['$event.path'])
  // @HostListener('document:touchstart', ['$event.path'])
  // public onGlobalClick(targetElementPath: any[]) {
  //   console.log(targetElementPath);
  //   let elementRefInPath = targetElementPath.find((e) => e === this._elementRef.nativeElement);
  //   if (!elementRefInPath) {
  //     this.clickedOutSide.emit(null);
  //   }
  // }
}
