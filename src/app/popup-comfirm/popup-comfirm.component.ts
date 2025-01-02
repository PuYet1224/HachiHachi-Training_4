import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-popup-comfirm',
  templateUrl: './popup-comfirm.component.html',
  styleUrls: ['./popup-comfirm.component.scss']
})
export class PopupComfirmComponent {
  @Output() confirmAction = new EventEmitter<void>();
  @Output() cancelAction = new EventEmitter<void>();

  @Input() jobNames: string[] = [];
  @Input() actionType: 'approve' | 'submit' | 'delete' | null = null;

  get displayJobNames(): string {
    return this.jobNames.length === 1
      ? this.jobNames[0]
      : `${this.jobNames.length} công việc`;
  }

  get displayUsers(): string {
    // Tuỳ bạn, ví dụ fix cứng 'Nguyễn Văn A - H0001'
    // hoặc hiển thị bao nhiêu user cũng được
    return this.jobNames.length === 1
      ? 'Nguyễn Văn A - H0001'
      : `${this.jobNames.length} người`;
  }

  // Hàm đổi nội dung title dựa trên actionType
  getTitle(): string {
    switch (this.actionType) {
      case 'delete':  return 'XÓA CÔNG VIỆC';
      case 'submit':  return 'GỬI DUYỆT CÔNG VIỆC';
      case 'approve': return 'DUYỆT CÔNG VIỆC';
      default:        return 'XÁC NHẬN';
    }
  }

  // Hàm đổi text hành động ở câu "Bạn chắc chắn muốn ... công việc ..."
  getActionText(): string {
    switch (this.actionType) {
      case 'delete':  return 'xóa';
      case 'submit':  return 'gửi duyệt';
      case 'approve': return 'duyệt';
      default:        return '';
    }
  }

  // Đổi class cho header (nếu muốn tuỳ biến màu sắc)
  getHeaderClass(): string {
    switch (this.actionType) {
      case 'delete':  return 'delete';
      case 'submit':  return 'submit';
      case 'approve': return 'approve';
      default:        return '';
    }
  }

  onConfirm(): void {
    this.confirmAction.emit();
  }

  onCancel(): void {
    this.cancelAction.emit();
  }
}
