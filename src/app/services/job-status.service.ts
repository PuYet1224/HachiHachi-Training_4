import { Injectable } from '@angular/core';
import { JobStatus } from '../enum/job-status.enum';

@Injectable({
  providedIn: 'root'
})
export class JobStatusService {
  getStatus(tableType: 'pre-Offboarding' | 'Offboarding', status: JobStatus): string {
    if (tableType === 'pre-Offboarding') {
      if (status === JobStatus.CHUA_THUC_HIEN) return 'Chưa thực hiện';
      if (status === JobStatus.KHONG_THUC_HIEN) return 'Không thực hiện';
      return '';
    } else {
      if (status === JobStatus.KHONG_THUC_HIEN) return 'Không thực hiện';
      if (status === JobStatus.DANG_THUC_HIEN) return 'Đang thực hiện';
      if (status === JobStatus.HOAN_TAT) return 'Hoàn tất';
      if (status === JobStatus.NGUNG_THUC_HIEN) return 'Ngưng thực hiện';
      if (status === JobStatus.CHO_DUYET) return 'Chờ duyệt';
      return '';
    }
  }
}
