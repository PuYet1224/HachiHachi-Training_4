import { Injectable } from '@angular/core';
import { JobStatus } from '../enum/job-status.enum';

@Injectable({
  providedIn: 'root'
})
export class JobIconService {
  private basePath = '../../assets/';

  getIcons(tableType: 'pre-Offboarding' | 'Offboarding', status: number): string[] {
    if (tableType === 'pre-Offboarding') {
      if (status === JobStatus.CHUA_THUC_HIEN) return [`${this.basePath}ban.png`];
      if (status === JobStatus.KHONG_THUC_HIEN) return [`${this.basePath}circle_arrow.png`];
      return [];
    } else {
      if (status === JobStatus.DANG_THUC_HIEN) return [`${this.basePath}send.png`, `${this.basePath}ban.png`];
      if (status === JobStatus.KHONG_THUC_HIEN) return [`${this.basePath}circle_arrow.png`];
      if (status === JobStatus.HOAN_TAT) return [`${this.basePath}eye.png`];
      if (status === JobStatus.NGUNG_THUC_HIEN) return [`${this.basePath}circle_arrow.png`];
      if (status === JobStatus.CHO_DUYET) return [`${this.basePath}done.png`];
      return [];
    }
  }

  getIconsByAction(action: string): string {
    const map: { [key: string]: string } = {
      'Chỉnh sửa': `${this.basePath}edit.png`,
      'Không thực hiện': `${this.basePath}ban.png`,
      'Xóa công việc': `${this.basePath}trash.png`,
      'Xem chi tiết': `${this.basePath}eye.png`,
      'Duyệt': `${this.basePath}done.png`,
      'Mở lại': `${this.basePath}circle_arrow.png`,
      'Ngưng thực hiện': `${this.basePath}ban.png`,
      'Gửi duyệt': `${this.basePath}send.png`
    };
    return map[action] || '';
  }
}
