import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'hrsToHrsMin' })
export class HrsToHrsMinPipe implements PipeTransform {
  public transform(value: number = 0) {
    let hrs = Number.parseInt(value.toString());
    let mins = (value - hrs) * 60;
    return hrs + ' hr ' + Math.round(mins) + ' min';
  }
}
