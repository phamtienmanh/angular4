import {
  Component,
  HostListener,
  OnDestroy
} from '@angular/core';

import {
  ImgZoomClickService
} from './img-zoom-click.service';
import { Subscription } from 'rxjs/Subscription';
@Component({
  selector: 'img-zoom-click',
  templateUrl: 'img-zoom-click.template.html',
  styleUrls: [
    'img-zoom-click.style.scss'
  ]
})
export class ImgZoomClickComponent implements OnDestroy {
  public subscription: Subscription;
  public imageUrl: string;
  public imgHeight: number;
  constructor(private _imgZoomClickService: ImgZoomClickService) {
    this.subscription = _imgZoomClickService.onImgClick$.subscribe(
      (url) => {
        this.imageUrl = url;
      });
    this.imgHeight = window.screen.height * 0.8;
  }

  public unZoomPhoto() {
    this.imageUrl = '';
  }

  public minusPhotoSize() {
    this.imgHeight = this.imgHeight * 0.9;
  }

  public plusPhotoSize() {
    this.imgHeight = this.imgHeight * 1.1;
  }

  public fullPhotoSize() {
    this.imgHeight = window.screen.height * 0.8;
  }

  @HostListener('document:keyup', ['$event'])
  public handleKeyboardEvent(event: KeyboardEvent) {
    if (event.keyCode === 27) {
      this.unZoomPhoto();
    }
  }

  public ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscription.unsubscribe();
  }
}
