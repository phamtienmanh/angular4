import {
  Directive,
  Input,
  AfterViewInit,
  HostListener,
  ElementRef
} from '@angular/core';

import {
  RouterService
} from './router.service';

interface RouterLinkOptionsInterface {
  enableBackView: boolean;
}

@Directive({
  selector: '[routerLink][routerLinkOptions]'
})
export class RouterLinkOptionsDirective implements AfterViewInit {
  @Input('routerLinkOptions')
  public routerLinkOptions: RouterLinkOptionsInterface;

  constructor(private _routerService: RouterService,
              private _el: ElementRef) {
    // empty
  }

  @HostListener('click')
  public onClick() {
    // Make sure user has to click to the link with different with current page
    this._routerService.set({
      enableBackView: this._el.nativeElement.attributes['routerLink']
        .value !== window.location.hash.substr(1),
      pageYOffset: window.pageYOffset
    });
  }

  public ngAfterViewInit() {
    // console.log(this.options);
  }
}
