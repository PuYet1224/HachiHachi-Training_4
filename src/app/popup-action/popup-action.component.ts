import { Component, EventEmitter, Input, Output } from '@angular/core';
import { POSITIONS } from '../data/positions.data';
import { PositionDTO, PersonDTO } from '../models/position.dto';
import { JobStatus } from '../enum/job-status.enum';

export interface StatusUpdateEvent {
  jobNames: string[];
  newStatus?: JobStatus;
  executor?: { position: string; personId: string };
  approver?: { position: string; personId: string };
  reasonDescription?: string;
  stopDescription?: string;
  reopenDescription?: string;
}

@Component({
  selector: 'app-popup-action',
  templateUrl: './popup-action.component.html',
  styleUrls: ['./popup-action.component.scss']
})
export class PopupActionComponent {
  @Output() statusUpdated = new EventEmitter<StatusUpdateEvent>();
  @Input() tableType: 'pre-Offboarding' | 'Offboarding' = 'pre-Offboarding';

  isPopupReasonVisible = false;
  isPopupStopVisible = false;
  isPopupReopenVisible = false;
  isPopupExecutorVisible = false;
  isPopupApproverVisible = false;

  currentJobNames: string[] = [];
  executorJobNames: string[] = [];
  approverJobNames: string[] = [];

  reasons = ['Không phù hợp vị trí', 'Không đủ thời gian', 'Khác'];
  stopReasons = ['Quá hạn', 'Ưu tiên công việc khác', 'Khác'];
  reopenReasons = ['Cần thực hiện lại', 'Thay đổi yêu cầu', 'Khác'];

  selectedReason = '';
  reasonDescription = '';

  selectedStopReason = '';
  stopDescription = '';

  selectedReopenReason = '';
  reopenDescription = '';

  selectedExecutorPosition = '';
  selectedExecutorPerson = '';
  executorTouched = false;

  selectedApproverPosition = '';
  selectedApproverPerson = '';
  approverTouched = false;

  reasonTouched = false;
  stopTouched = false;
  reopenTouched = false;

  positions: PositionDTO[] = POSITIONS;

  openReasonPopup(jobNames: string[]) {
    this.resetPopups();
    this.currentJobNames = jobNames;
    this.isPopupReasonVisible = true;
  }

  openStopPopup(jobNames: string[]) {
    this.resetPopups();
    this.currentJobNames = jobNames;
    this.isPopupStopVisible = true;
  }

  openReopenPopup(jobNames: string[]) {
    this.resetPopups();
    this.currentJobNames = jobNames;
    this.isPopupReopenVisible = true;
  }

  openExecutorPopup(jobNames: string[]) {
    this.resetPopups();
    this.currentJobNames = jobNames;
    this.executorJobNames = jobNames;
    this.isPopupExecutorVisible = true;
  }

  openApproverPopup(jobNames: string[]) {
    this.resetPopups();
    this.currentJobNames = jobNames;
    this.approverJobNames = jobNames;
    this.isPopupApproverVisible = true;
  }

  closePopup() {
    this.resetPopups();
  }

  resetPopups() {
    this.isPopupReasonVisible = false;
    this.isPopupStopVisible = false;
    this.isPopupReopenVisible = false;
    this.isPopupExecutorVisible = false;
    this.isPopupApproverVisible = false;

    this.currentJobNames = [];
    this.executorJobNames = [];
    this.approverJobNames = [];

    this.selectedReason = '';
    this.reasonDescription = '';
    this.reasonTouched = false;

    this.selectedStopReason = '';
    this.stopDescription = '';
    this.stopTouched = false;

    this.selectedReopenReason = '';
    this.reopenDescription = '';
    this.reopenTouched = false;

    this.selectedExecutorPosition = '';
    this.selectedExecutorPerson = '';
    this.executorTouched = false;

    this.selectedApproverPosition = '';
    this.selectedApproverPerson = '';
    this.approverTouched = false;
  }

  onReasonChange(reasonType: string) {
    if (reasonType === 'reason') {
      this.reasonTouched = true;
    } else if (reasonType === 'stop') {
      this.stopTouched = true;
    } else if (reasonType === 'reopen') {
      this.reopenTouched = true;
    } else if (reasonType === 'executor') {
      this.executorTouched = true;
    } else if (reasonType === 'approver') {
      this.approverTouched = true;
    }
  }

  confirmReason() {
    if (this.selectedReason === 'Khác' && !this.reasonDescription.trim()) {
      alert('Vui lòng nhập mô tả lý do!');
      return;
    }
    this.statusUpdated.emit({
      jobNames: this.currentJobNames,
      newStatus: JobStatus.KHONG_THUC_HIEN,
      reasonDescription:
        this.selectedReason === 'Khác' ? this.reasonDescription : undefined
    });
    this.closePopup();
  }

  confirmStop() {
    if (this.selectedStopReason === 'Khác' && !this.stopDescription.trim()) {
      alert('Vui lòng nhập mô tả lý do!');
      return;
    }
    this.statusUpdated.emit({
      jobNames: this.currentJobNames,
      newStatus: JobStatus.NGUNG_THUC_HIEN,
      stopDescription:
        this.selectedStopReason === 'Khác' ? this.stopDescription : undefined
    });
    this.closePopup();
  }

  confirmReopen() {
    if (this.selectedReopenReason === 'Khác' && !this.reopenDescription.trim()) {
      alert('Vui lòng nhập mô tả lý do!');
      return;
    }
    let newStatus: JobStatus;
    if (this.tableType === 'pre-Offboarding') {
      newStatus = JobStatus.CHUA_THUC_HIEN;
    } else {
      newStatus = JobStatus.DANG_THUC_HIEN;
    }
    this.statusUpdated.emit({
      jobNames: this.currentJobNames,
      newStatus,
      reopenDescription:
        this.selectedReopenReason === 'Khác' ? this.reopenDescription : undefined
    });
    this.closePopup();
  }

  confirmExecutor() {
    if (!this.selectedExecutorPosition || !this.selectedExecutorPerson) {
      alert('Vui lòng chọn chức danh và người thực hiện!');
      return;
    }
    this.statusUpdated.emit({
      jobNames: this.executorJobNames,
      executor: {
        position: this.selectedExecutorPosition,
        personId: this.selectedExecutorPerson
      }
    });
    this.closePopup();
  }

  confirmApprover() {
    if (!this.selectedApproverPosition || !this.selectedApproverPerson) {
      alert('Vui lòng chọn chức danh và người duyệt!');
      return;
    }
    this.statusUpdated.emit({
      jobNames: this.approverJobNames,
      approver: {
        position: this.selectedApproverPosition,
        personId: this.selectedApproverPerson
      }
    });
    this.closePopup();
  }

  confirmSubmit() {
    this.statusUpdated.emit({
      jobNames: this.currentJobNames,
      newStatus: JobStatus.CHO_DUYET
    });
    this.closePopup();
  }

  getPeople(positionName: string): PersonDTO[] {
    const position = this.positions.find(p => p.name === positionName);
    return position ? position.people : [];
  }
}
