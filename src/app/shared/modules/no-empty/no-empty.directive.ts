import {
  Directive,
  ElementRef,
  AfterViewChecked,
  Input
} from '@angular/core';

@Directive({
  selector: '[removeIfEmpty]'
})
export class NoEmptyDirective implements AfterViewChecked {
  @Input('removeIfEmpty')
  public removeIfEmpty: boolean = true;
  @Input('isDateField')
  public isDateField: boolean = false;

  constructor(private _elementRef: ElementRef) {
    // empty
  }

  public ngAfterViewChecked(): void {
    const dateRegex = /\d{1,2}\/\d{1,2}(\/(?:\d{2}|\d{4})){0,1}/;
    if (this.removeIfEmpty === false) {
      this._elementRef.nativeElement.remove();
      return;
    }
    if (this.isDateField
      && !dateRegex.test(this._elementRef.nativeElement.textContent.trim())) {
      this._elementRef.nativeElement.remove();
      return;
    }
    if (!this._elementRef.nativeElement.textContent
      || this._elementRef.nativeElement.textContent.trim() === ''
      || this._elementRef.nativeElement.textContent.trim().includes('Invalid date')) {
      this._elementRef.nativeElement.remove();
    }
  }
}
