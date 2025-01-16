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
  executorDescription = '';

  selectedApproverPosition = '';
  selectedApproverPerson = '';
  approverTouched = false;
  approverDescription = '';

  reasonTouched = false;
  stopTouched = false;
  reopenTouched = false;

  positions: PositionDTO[] = POSITIONS;
  allowedExecutorPositions: PositionDTO[] = [];
  allowedApproverPositions: PositionDTO[] = [];

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

  openExecutorPopup(jobNames: string[], executorPositions?: string[] | string): void {
    this.resetPopups();
    this.currentJobNames = jobNames;
    this.executorJobNames = jobNames;
    if (executorPositions) {
      if (Array.isArray(executorPositions)) {
        this.allowedExecutorPositions = this.positions.filter(p =>
          executorPositions.includes(p.name)
        );
        if (executorPositions.length === 1) {
          this.selectedExecutorPosition = executorPositions[0];
        }
      } else {
        this.allowedExecutorPositions = this.positions.filter(p => p.name === executorPositions);
        this.selectedExecutorPosition = executorPositions;
      }
    } else {
      this.allowedExecutorPositions = this.positions;
    }
    this.isPopupExecutorVisible = true;
  }

  openApproverPopup(jobNames: string[], approverPositions?: string[] | string): void {
    this.resetPopups();
    this.currentJobNames = jobNames;
    this.approverJobNames = jobNames;
    if (approverPositions) {
      if (Array.isArray(approverPositions)) {
        this.allowedApproverPositions = this.positions.filter(p =>
          approverPositions.includes(p.name)
        );
        if (approverPositions.length === 1) {
          this.selectedApproverPosition = approverPositions[0];
        }
      } else {
        this.allowedApproverPositions = this.positions.filter(p => p.name === approverPositions);
        this.selectedApproverPosition = approverPositions;
      }
    } else {
      this.allowedApproverPositions = this.positions;
    }
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
    this.allowedExecutorPositions = [];
    this.allowedApproverPositions = [];
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
    this.executorDescription = '';
    this.selectedApproverPosition = '';
    this.selectedApproverPerson = '';
    this.approverTouched = false;
    this.approverDescription = '';
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
    if (!this.selectedReason) {
      alert('Vui lòng chọn lý do không thực hiện!');
      return;
    }
    if (this.selectedReason === 'Khác' && !this.reasonDescription.trim()) {
      alert('Vui lòng nhập mô tả lý do!');
      return;
    }
    this.statusUpdated.emit({
      jobNames: this.currentJobNames,
      newStatus: JobStatus.KHONG_THUC_HIEN,
      reasonDescription: this.selectedReason === 'Khác' ? this.reasonDescription : undefined
    });
    this.closePopup();
  }

  confirmStop() {
    if (!this.selectedStopReason) {
      alert('Vui lòng chọn lý do ngưng thực hiện!');
      return;
    }
    if (this.selectedStopReason === 'Khác' && !this.stopDescription.trim()) {
      alert('Vui lòng nhập mô tả lý do!');
      return;
    }
    this.statusUpdated.emit({
      jobNames: this.currentJobNames,
      newStatus: JobStatus.NGUNG_THUC_HIEN,
      stopDescription: this.selectedStopReason === 'Khác' ? this.stopDescription : undefined
    });
    this.closePopup();
  }

  confirmReopen() {
    if (!this.selectedReopenReason) {
      alert('Vui lòng chọn lý do mở lại công việc!');
      return;
    }
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
      reopenDescription: this.selectedReopenReason === 'Khác' ? this.reopenDescription : undefined
    });
    this.closePopup();
  }

  confirmExecutor() {
    if (!this.selectedExecutorPosition || !this.selectedExecutorPerson) {
      alert('Vui lòng chọn chức danh và người thực hiện!');
      return;
    }
    if (this.selectedExecutorPosition === 'Khác' && !this.executorDescription.trim()) {
      alert('Vui lòng nhập mô tả lý do!');
      return;
    }
    this.statusUpdated.emit({
      jobNames: this.executorJobNames,
      executor: {
        position: this.selectedExecutorPosition,
        personId: this.selectedExecutorPerson
      },
      reasonDescription: this.selectedExecutorPosition === 'Khác' ? this.executorDescription : undefined
    });
    this.closePopup();
  }

  confirmApprover() {
    if (!this.selectedApproverPosition || !this.selectedApproverPerson) {
      alert('Vui lòng chọn chức danh và người duyệt!');
      return;
    }
    if (this.selectedApproverPosition === 'Khác' && !this.approverDescription.trim()) {
      alert('Vui lòng nhập mô tả lý do!');
      return;
    }
    this.statusUpdated.emit({
      jobNames: this.approverJobNames,
      approver: {
        position: this.selectedApproverPosition,
        personId: this.selectedApproverPerson
      },
      reasonDescription: this.selectedApproverPosition === 'Khác' ? this.approverDescription : undefined
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
