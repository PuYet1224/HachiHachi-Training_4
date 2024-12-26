import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusColor'
})
export class StatusColorPipe implements PipeTransform {
  transform(status: number): string {
    switch (status) {
      case 1:
        return '#959DB3';
      case 2:
        return '#BD0100';
      case 3:
        return '#000000';
      case 4:
        return '#008000';
      case 5:
        return '#0D99FF';
      default:
        return '#000000';
    }
  }
}
