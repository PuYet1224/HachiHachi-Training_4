import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JobIconService {
  getIcons(status: number, tableType: 'pre-onboarding' | 'onboarding'): string[] {
    const basePath = '../../assets/';
    if (tableType === 'pre-onboarding') {
      if (status === 1) {
        return [`${basePath}ban.png`];
      } else if (status === 2) {
        return [`${basePath}circle_arrow.png`];
      }
    } else {
      switch (status) {
        case 1:
          return [`${basePath}send.png`, `${basePath}ban.png`];
        case 2:
          return [`${basePath}circle_arrow.png`];
        case 3:
          return [`${basePath}done.png`];
        case 4:
          return [`${basePath}eye.png`];
        case 5:
          return [`${basePath}circle_arrow.png`];
        default:
          return [];
      }
    }
    return [];
  }
}
