import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusColor'
})
export class StatusColorPipe implements PipeTransform {
  transform(status: number, tableType: 'pre-Offboarding' | 'Offboarding'): string {
    if (tableType === 'pre-Offboarding') {
      switch (status) {
        case 1:
        case 2:
          return '#26282E';
        default:
          return '#26282E';
      }
    } else { 
      switch (status) {
        case 3:
          return '#26282E';
        case 6:
          return '#0D99FF';
        case 4:
          return '#1A6634';
        case 5:
          return '#EB273A';
        case 2:
          return '#85797A';
        default:
          return '#26282E';
      }
    }
  }
}
