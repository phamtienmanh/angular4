import {
  Pipe,
  PipeTransform
} from '@angular/core';

@Pipe({name: 'myToKeys'})
export class ToKeysPipe implements PipeTransform {
  public transform(value, args: string[]): any {
    return value.replace(/[a-z]/g, '').slice(0, -1);
  }
}
