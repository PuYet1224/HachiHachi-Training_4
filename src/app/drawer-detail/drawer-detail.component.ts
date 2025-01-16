import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { JobNameDTO } from '../models/job-name.dto';
import { PersonDTO, PositionDTO } from '../models/position.dto';
import { EmployeeDTO } from '../models/employee.dto';

@Component({
  selector: 'app-drawer-detail',
  templateUrl: './drawer-detail.component.html',
  styleUrls: ['./drawer-detail.component.scss']
})
export class DrawerDetailComponent implements OnInit, OnChanges {
  @Input() headerText = '';
  @Input() mode: 'edit' | 'view' = 'view';
  @Input() job: JobNameDTO | null = null;
  @Input() isNew: boolean = false;
  @Output() closeDrawer = new EventEmitter<void>();
  @Output() saveDrawer = new EventEmitter<JobNameDTO>();
  @Input() tableType!: 'pre-Offboarding' | 'Offboarding';
  @Input() positions: PositionDTO[] = [];
  @Input() employees: EmployeeDTO[] = [];

  today = '';
  localJob: JobNameDTO | null = null;
  assigneeCandidates: PersonDTO[] = [];
  approvedCandidates: PersonDTO[] = [];

  ngOnInit(): void {
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['job'] && this.job) {
      this.localJob = { ...this.job };
      if (this.localJob.PositionAssignee) {
        const posAssignee = this.positions.find(p => p.id === this.localJob!.PositionAssignee);
        this.assigneeCandidates = posAssignee ? posAssignee.people : [];
      } else {
        this.assigneeCandidates = [];
      }
      if (this.localJob.PositionApproved) {
        const posApproved = this.positions.find(p => p.id === this.localJob!.PositionApproved);
        this.approvedCandidates = posApproved ? posApproved.people : [];
      } else {
        this.approvedCandidates = [];
      }
      if (this.mode === 'view') {
        if (!this.assigneeCandidates.length && this.localJob.AssigneeID) {
          this.assigneeCandidates = [{
            id: '',
            name: this.localJob.AssigneeName,
            staffId: this.localJob.AssigneeID
          }];
        }
        if (!this.approvedCandidates.length && this.localJob.ApprovedID) {
          this.approvedCandidates = [{
            id: '',
            name: this.localJob.ApprovedName,
            staffId: this.localJob.ApprovedID
          }];
        }
      }
    }
  }

  onClose(): void {
    this.closeDrawer.emit();
  }

  onSave(): void {
    if (this.localJob && this.mode === 'edit') {
      if (this.isNew) {
        if (!this.localJob.TaskName || !this.localJob.TaskName.trim()) {
          alert('Vui lòng nhập tên công việc!');
          return;
        }
        if (!this.localJob.Description || !this.localJob.Description.trim()) {
          alert('Vui lòng nhập mô tả công việc!');
          return;
        }
        if (!this.localJob.OrderBy) {
          alert('Vui lòng nhập thứ tự công việc!');
          return;
        }
        if (!this.localJob.EndDate || !this.localJob.EndDate.trim()) {
          alert('Vui lòng chọn ngày hết hạn!');
          return;
        }
        if (!this.localJob.PositionAssignee || this.localJob.PositionAssignee === 0) {
          alert('Vui lòng chọn chức danh thực hiện!');
          return;
        }
        if (!this.localJob.AssigneeID || !this.localJob.AssigneeID.trim()) {
          alert('Vui lòng chọn người thực hiện!');
          return;
        }
        if (this.tableType !== 'Offboarding') {
          if (!this.localJob.PositionApproved || this.localJob.PositionApproved === 0) {
            alert('Vui lòng chọn chức danh phê duyệt!');
            return;
          }
          if (!this.localJob.ApprovedID || !this.localJob.ApprovedID.trim()) {
            alert('Vui lòng chọn người phê duyệt!');
            return;
          }
        }
        if (!this.localJob.Remark || !this.localJob.Remark.trim()) {
          alert('Vui lòng nhập ghi chú!');
          return;
        }
        if (this.localJob.Status !== 1) {
          if (!this.localJob.Reason || this.localJob.Reason === 0) {
            alert("Vui lòng chọn lý do không thực hiện công việc!");
            return;
          }
          if (this.localJob.Reason === 3 && (!this.localJob.ReasonDescription || !this.localJob.ReasonDescription.trim())) {
            alert("Vui lòng nhập mô tả lý do khi chọn 'Lý do khác'!");
            return;
          }
        }
      }
      this.saveDrawer.emit({ ...this.localJob });
    }
  }

  editingDisabled(field: string): boolean {
    if (this.mode === 'view') return true;
    if (!this.localJob) return false;
    if (field === 'assignee') {
      return (this.localJob.PositionAssignee ?? 0) === 0;
    }
    if (field === 'approved') {
      return (this.localJob.PositionApproved ?? 0) === 0;
    }
    return false;
  }

  viewOnly(): boolean {
    return this.mode === 'view';
  }

  statusDisabled(): boolean {
    if (this.tableType === 'Offboarding') {
      return true;
    }
    if (
      this.tableType === 'pre-Offboarding' &&
      this.localJob &&
      this.localJob.Status === 1 &&
      this.mode === 'edit'
    ) {
      return true;
    }
    return this.mode === 'view';
  }

  triggerDatePicker(): void {
    if (this.mode === 'edit') {
      const dateInput = document.getElementsByName('endDate')[0] as HTMLInputElement;
      if (dateInput) {
        if (typeof dateInput.showPicker === 'function') {
          dateInput.showPicker();
        } else {
          dateInput.focus();
          dateInput.click();
        }
      }
    }
  }

  onReasonChange(): void {}

  isReasonDescriptionDisabled(): boolean {
    return this.localJob ? this.localJob.Reason === 0 || this.localJob.Reason !== 3 : true;
  }

  getSelectedAssigneePosition(): number | null {
    return this.localJob && this.localJob.PositionAssignee ? this.localJob.PositionAssignee : null;
  }

  getSelectedApprovedPosition(): number | null {
    return this.localJob && this.localJob.PositionApproved ? this.localJob.PositionApproved : null;
  }

  onAssigneePositionChange(newId: number | string): void {
    if (!this.localJob) return;
    const roleId = typeof newId === 'string' ? +newId : newId;
    if (!roleId) {
      this.localJob.PositionAssignee = 0;
      this.localJob.AssigneeBy = '';
      this.assigneeCandidates = [];
    } else {
      this.localJob.PositionAssignee = roleId;
      const pos = this.positions.find(p => p.id === roleId);
      if (pos) {
        this.localJob.AssigneeBy = pos.name;
        this.assigneeCandidates = pos.people;
      } else {
        this.assigneeCandidates = [];
      }
      this.localJob.Assignee = 0;
      this.localJob.AssigneeName = '';
      this.localJob.AssigneeID = '';
    }
  }

  onAssigneeChange(selectedStaffId: string): void {
    if (!this.localJob) return;
    const person = this.assigneeCandidates.find(p => p.staffId === selectedStaffId);
    if (person) {
      this.localJob.AssigneeName = person.name;
      this.localJob.AssigneeID = person.staffId;
    } else {
      this.localJob.AssigneeName = '';
      this.localJob.AssigneeID = '';
    }
  }

  onApprovedPositionChange(newId: number | string): void {
    if (!this.localJob) return;
    const roleId = typeof newId === 'string' ? +newId : newId;
    if (!roleId) {
      this.localJob.PositionApproved = 0;
      this.localJob.PositionApprovedName = '';
      this.approvedCandidates = [];
    } else {
      this.localJob.PositionApproved = roleId;
      const pos = this.positions.find(p => p.id === roleId);
      if (pos) {
        this.localJob.PositionApprovedName = pos.name;
        this.approvedCandidates = pos.people;
      } else {
        this.approvedCandidates = [];
      }
      this.localJob.Approved = 0;
      this.localJob.ApprovedName = '';
      this.localJob.ApprovedID = '';
    }
  }

  onApprovedChange(selectedStaffId: string): void {
    if (!this.localJob) return;
    const person = this.approvedCandidates.find(p => p.staffId === selectedStaffId);
    if (person) {
      this.localJob.ApprovedName = person.name;
      this.localJob.ApprovedID = person.staffId;
    } else {
      this.localJob.ApprovedName = '';
      this.localJob.ApprovedID = '';
    }
  }

  isOverdue(job: JobNameDTO): boolean {
    const today = new Date().setHours(0, 0, 0, 0);
    const end = new Date(job.EndDate).setHours(0, 0, 0, 0);
    return today > end;
  }

  getOverdueDays(endDate: string): number {
    const today = new Date().setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(0, 0, 0, 0);
    return Math.floor((today - end) / (1000 * 60 * 60 * 24));
  }
}
