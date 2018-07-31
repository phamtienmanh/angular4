import {
  Directive,
  Renderer2,
  ElementRef,
  OnInit,
  AfterViewInit,
  Input
} from '@angular/core';

@Directive({
  selector: '[focusOnInit]'
})
export class FocusOnInitDirective implements OnInit,
                                             AfterViewInit {
  public static instances: FocusOnInitDirective[] = [];

  @Input('focusOnInit')
  public focusOnInit: boolean = true;

  @Input('priority')
  public priority: number = 0;

  constructor(private _renderer: Renderer2,
              private _elementRef: ElementRef) {
    // empty
  }

  public ngOnInit(): void {
    FocusOnInitDirective.instances.push(this);
  }

  public ngAfterViewInit(): void {
    if (!this.focusOnInit) {
      return;
    }
    setTimeout(() => {
      FocusOnInitDirective.instances.splice(FocusOnInitDirective.instances.indexOf(this), 1);

      if (FocusOnInitDirective.instances.every((i) => this.priority >= i.priority)) {
        this._renderer.selectRootElement(this._elementRef.nativeElement).focus();
        let commaIndex = this._elementRef.nativeElement.value.indexOf('.');
        if (commaIndex > -1) {
          this._renderer.selectRootElement(this._elementRef.nativeElement)
            .setSelectionRange(0, commaIndex);
        } else {
          this._renderer.selectRootElement(this._elementRef.nativeElement).select();
        }
      }
    });
  }
}
