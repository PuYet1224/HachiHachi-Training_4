import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'overdueDaysColor'
})
export class OverdueDaysColorPipe implements PipeTransform {
  transform(days: number): string {
    if (days === 3) {
      return '#E47C56';
    } else if (days === 2) {
      return '#FF5722';
    } else if (days === 1) {
      return '#ED1717';
    }
    return '';
  }
}
