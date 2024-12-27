import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JobStatusService {
  getStatus(status: number): string {
    switch (status) {
      case 1: return 'Đang thực hiện';
      case 2: return 'Không thực hiện';
      case 3: return 'Chờ duyệt';
      case 4: return 'Hoàn tất';
      case 5: return 'Ngưng thực hiện';
      default: return 'Không xác định';
    }
  }
}
