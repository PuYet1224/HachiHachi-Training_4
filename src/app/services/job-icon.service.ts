// job-icon.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JobIconService {
  private basePath = '../../assets/';

  getIcons(status: number, tableType: 'pre-onboarding' | 'onboarding'): string[] {
    if (tableType === 'pre-onboarding') {
      if (status === 1) { // Chưa thực hiện
        return [`${this.basePath}ban.png`];
      } else if (status === 2) { // Không thực hiện
        return [`${this.basePath}circle_arrow.png`];
      }
    } else { // onboarding
      switch (status) {
        case 1: // Đang thực hiện
          return [`${this.basePath}ban.png`, `${this.basePath}send.png`];
        case 2: // Không thực hiện
        case 5: // Ngưng thực hiện
          return [`${this.basePath}circle_arrow.png`];
        case 3: // Chờ duyệt
          return [`${this.basePath}done.png`];
        case 4: // Hoàn tất
          return [];
        default:
          return [];
      }
    }
    return [];
  }

  getIconsByAction(action: string): string {
    const actionIcons: { [key: string]: string } = {
      'Không thực hiện': `${this.basePath}ban.png`,
      'Xóa công việc': `${this.basePath}trash.png`,
      'Mở lại': `${this.basePath}circle_arrow.png`,
      'Ngưng thực hiện': `${this.basePath}ban.png`,
      'Gửi duyệt': `${this.basePath}send.png`,
      'Hoàn tất': `${this.basePath}done.png`
    };
    return actionIcons[action] || '';
  }
}
