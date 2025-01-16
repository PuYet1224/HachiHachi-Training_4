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
  @Input() actionType: 'submit' | 'approve' | 'delete' | 'stop' | null = null;

  get displayJobNames(): string {
    return this.jobNames.length === 1 ? this.jobNames[0] : this.jobNames[0];
  }

  get tooltipJobNames(): string {
    return this.jobNames.join(', ');
  }

  getTitle(): string {
    switch (this.actionType) {
      case 'delete':
        return 'XÓA CÔNG VIỆC';
      case 'submit':
        return 'GỬI DUYỆT CÔNG VIỆC';
      case 'approve':
        return 'DUYỆT CÔNG VIỆC';
      default:
        return 'XÁC NHẬN';
    }
  }

  getActionMessage(): string {
    if (this.actionType === 'submit') {
      if (this.jobNames.length === 1) {
        return 'Bạn chắc chắn muốn duyệt công việc ' + this.jobNames[0] + ' cho';
      } else {
        return 'Bạn chắc chắn muốn duyệt công việc cho';
      }
    }
    if (this.actionType === 'approve') {
      if (this.jobNames.length === 1) {
        return 'Bạn chắc chắn muốn hoàn tất công việc ' + this.jobNames[0] + ' cho';
      } else {
        return 'Bạn chắc chắn muốn hoàn tất công việc cho';
      }
    }
    if (this.actionType === 'delete') {
      return 'Bạn chắc chắn muốn xóa công việc';
    }
    return 'Bạn chắc chắn muốn thực hiện hành động này';
  }

  getCancelButtonText(): string {
    switch (this.actionType) {
      case 'delete':
        return 'KHÔNG XÓA';
      case 'submit':
        return 'KHÔNG GỬI';
      case 'approve':
        return 'KHÔNG DUYỆT';
      default:
        return 'ĐÓNG';
    }
  }

  getConfirmButtonText(): string {
    switch (this.actionType) {
      case 'delete':
        return 'XÓA';
      case 'submit':
        return 'GỬI';
      case 'approve':
        return 'DUYỆT';
      default:
        return 'XÁC NHẬN';
    }
  }

  getHeaderClass(): string {
    switch (this.actionType) {
      case 'delete':
        return 'delete';
      case 'submit':
        return 'submit';
      case 'approve':
        return 'approve';
      default:
        return '';
    }
  }

  getConfirmButtonClass(): string {
    switch (this.actionType) {
      case 'delete':
        return 'delete-btn';
      case 'submit':
        return 'submit-btn';
      case 'approve':
        return 'approve-btn';
      default:
        return 'confirm-btn';
    }
  }

  isDeleteAction(): boolean {
    return this.actionType === 'delete';
  }

  onConfirm(): void {
    this.confirmAction.emit();
  }

  onCancel(): void {
    this.cancelAction.emit();
  }
}
