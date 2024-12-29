import { Injectable } from '@angular/core';
import { JobStatus } from '../enum/job-status.enum';

@Injectable({
  providedIn: 'root'
})
export class JobIconService {
  private basePath = '../../assets/';

  getIcons(tableType: 'pre-onboarding' | 'onboarding', status: number): string[] {
    if (tableType === 'pre-onboarding') {
      if (status === JobStatus.CHUA_THUC_HIEN) return [`${this.basePath}circle_arrow.png`];
      if (status === JobStatus.KHONG_THUC_HIEN) return [`${this.basePath}ban.png`];
      return [];
    } else {
      if (status === JobStatus.KHONG_THUC_HIEN) return [`${this.basePath}ban.png`];
      if (status === JobStatus.DANG_THUC_HIEN) return [`${this.basePath}circle_arrow.png`];
      if (status === JobStatus.HOAN_TAT) return [`${this.basePath}done.png`];
      if (status === JobStatus.NGUNG_THUC_HIEN) return [`${this.basePath}ban.png`];
      if (status === JobStatus.CHO_DUYET) return [`${this.basePath}send.png`];
      return [];
    }
  }

  getIconsByAction(action: string): string {
    const map: { [key: string]: string } = {
      'Chưa thực hiện': `${this.basePath}circle_arrow.png`,
      'Không thực hiện': `${this.basePath}ban.png`,
      'Đang thực hiện': `${this.basePath}circle_arrow.png`,
      'Hoàn tất': `${this.basePath}done.png`,
      'Ngưng thực hiện': `${this.basePath}ban.png`,
      'Chờ duyệt': `${this.basePath}send.png`,
      'Xóa công việc': `${this.basePath}trash.png`
    };
    return map[action] || '';
  }
}
