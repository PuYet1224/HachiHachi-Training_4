import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import Fuse, { FuseResult } from 'fuse.js';
import { JobNameDTO } from '../models/job-name.dto';
import { MOCK_JOB_NAMES } from '../data/mock-data';
import { JobStatusService } from '../services/job-status.service';
import { JobIconService } from '../services/job-icon.service';
import { JobStatus } from '../enum/job-status.enum';
import {
  PopupActionComponent,
  StatusUpdateEvent
} from '../popup-action/popup-action.component';
import { PersonDTO } from '../models/position.dto';
import { POSITIONS } from '../data/positions.data';
import { PositionDTO } from '../models/position.dto';

interface JobWithActionMenu extends JobNameDTO {
  actionMenuVisible?: boolean;
  originalIndex: number;
}

@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.scss']
})
export class TableListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() searchTerm = '';
  @Input() tableType: 'pre-Offboarding' | 'Offboarding' = 'pre-Offboarding';
  @Input() disabled = false;
  @Input() sortStatusId: JobStatus | null = null;
  @Output() actionBarOpened = new EventEmitter<boolean>();
  @Output() rowCountChange = new EventEmitter<number>();
  @Output() statusCounts = new EventEmitter<{ [key: number]: number }>();
  @Output() statusCountsChange = new EventEmitter<{ [key: number]: number }>();

  @ViewChild('popupAction') popupAction!: PopupActionComponent;

  jobNames: JobWithActionMenu[] = [];
  filteredJobs: JobWithActionMenu[] = [];
  selectedJobs: JobWithActionMenu[] = [];
  allSelected = false;
  isDeleteModalVisible = false;
  sortField: keyof JobNameDTO = 'TaskName';
  sortDirection: 'asc' | 'desc' = 'asc';
  fuse!: Fuse<JobWithActionMenu>;
  subscription: Subscription = new Subscription();
  activeActionMenuId: string | null = null;

  showPopupConfirm = false;
  confirmActionType: 'approve' | 'submit' | 'delete' | null = null;
  selectedJobNames: string[] = [];
  selectedJobUsers: string[] = [];

  private originalOrder: JobWithActionMenu[] = [];
  private updatedStatusCounts: { [key: number]: number } = {};
  positions: PositionDTO[] = POSITIONS;

  constructor(
    public jobStatusService: JobStatusService,
    public jobIconService: JobIconService
  ) {}

  ngOnInit(): void {
    this.jobNames = MOCK_JOB_NAMES.map((job, i) => ({
      ...job,
      actionMenuVisible: false,
      originalIndex: i
    }));
    this.originalOrder = [...this.jobNames];
    this.fuse = new Fuse(this.jobNames, {
      keys: ['TaskName', 'Description', 'AssigneeBy'],
      threshold: 0.4
    });
    this.filterJobs();
    this.subscription.add(
      this.popupAction.statusUpdated.subscribe(event => {
        this.handleStatusUpdate(event);
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm'] || changes['tableType'] || changes['sortStatusId']) {
      this.filterJobs();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  filterJobs(): void {
    let temp: JobWithActionMenu[];
    if (!this.searchTerm.trim()) {
      temp = [...this.jobNames];
    } else {
      const results = this.fuse.search(this.searchTerm);
      temp = results.map((res: FuseResult<JobWithActionMenu>) => res.item);
    }

    // Lọc theo tableType
    if (this.tableType === 'pre-Offboarding') {
      temp = temp.filter(
        x => x.Status === JobStatus.CHUA_THUC_HIEN || x.Status === JobStatus.KHONG_THUC_HIEN
      );
    } else {
      temp = temp.filter(x =>
        [
          JobStatus.KHONG_THUC_HIEN,
          JobStatus.DANG_THUC_HIEN,
          JobStatus.HOAN_TAT,
          JobStatus.NGUNG_THUC_HIEN,
          JobStatus.CHO_DUYET
        ].includes(x.Status)
      );
    }

    // Sort
    if (this.sortStatusId !== null) {
      temp.sort((a, b) => {
        const aPriority = a.Status === this.sortStatusId ? 0 : 1;
        const bPriority = b.Status === this.sortStatusId ? 0 : 1;
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        return this.compare(a, b, this.sortField, this.sortDirection);
      });
    } else {
      temp.sort((a, b) => this.compare(a, b, this.sortField, this.sortDirection));
    }

    this.filteredJobs = temp;

    // Đếm status
    const cnt: { [key: number]: number } = {};
    this.filteredJobs.forEach(j => {
      cnt[j.Status] = (cnt[j.Status] || 0) + 1;
    });
    this.statusCounts.emit(cnt);
    this.rowCountChange.emit(this.filteredJobs.length);
    this.statusCountsChange.emit(cnt);
  }

  compare(
    a: JobWithActionMenu,
    b: JobWithActionMenu,
    field: keyof JobWithActionMenu,
    dir: 'asc' | 'desc'
  ): number {
    const av = a[field] ?? '';
    const bv = b[field] ?? '';
    if (typeof av === 'number' && typeof bv === 'number') {
      if (av < bv) return dir === 'asc' ? -1 : 1;
      if (av > bv) return dir === 'asc' ? 1 : -1;
      return a.originalIndex - b.originalIndex;
    }
    const asStr = av.toString();
    const bsStr = bv.toString();
    if (asStr < bsStr) return dir === 'asc' ? -1 : 1;
    if (asStr > bsStr) return dir === 'asc' ? 1 : -1;
    return a.originalIndex - b.originalIndex;
  }

  sortTable(field: keyof JobNameDTO): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.filterJobs();
  }

  getActions(s: JobStatus): string[] {
    let actions: string[] = [];
    if (this.tableType === 'pre-Offboarding') {
      if (s === JobStatus.CHUA_THUC_HIEN)
        actions = ['Chỉnh sửa', 'Không thực hiện', 'Xóa công việc'];
      if (s === JobStatus.KHONG_THUC_HIEN) actions = ['Xem chi tiết', 'Mở lại'];
    } else {
      if (s === JobStatus.KHONG_THUC_HIEN) actions = ['Chỉnh sửa', 'Mở lại'];
      if (s === JobStatus.DANG_THUC_HIEN)
        actions = ['Chỉnh sửa', 'Ngưng thực hiện', 'Gửi duyệt'];
      if (s === JobStatus.HOAN_TAT) actions = ['Xem chi tiết'];
      if (s === JobStatus.NGUNG_THUC_HIEN) actions = ['Chỉnh sửa', 'Mở lại'];
      if (s === JobStatus.CHO_DUYET) actions = ['Xem chi tiết', 'Duyệt'];
    }
    return actions;
  }

  toggleActionMenu(job: JobWithActionMenu, i: number): void {
    const id = 'item-' + i + '-' + job.TaskName;
    this.activeActionMenuId = this.activeActionMenuId === id ? null : id;
  }

  // ===> CHỈNH SỬA TẠI ĐÂY <===
  // Thay vì gọi thẳng onConfirmXYZ(), hãy mở popupConfirm để người dùng xác nhận
  performAction(action: string, job: JobWithActionMenu): void {
    this.toggleActionMenu(job, this.filteredJobs.indexOf(job));

    // Các action khác vẫn gọi popupAction bình thường
    const assigneeDisplay = `${job.AssigneeName} | ${job.AssigneeID}`;
    if (action === 'Không thực hiện') {
      this.popupAction.openReasonPopup([assigneeDisplay]);
    }
    if (action === 'Ngưng thực hiện') {
      this.popupAction.openStopPopup([assigneeDisplay]);
    }
    if (action === 'Mở lại') {
      this.popupAction.openReopenPopup([assigneeDisplay]);
    }
    if (action === 'Thực hiện bởi') {
      this.popupAction.openExecutorPopup([assigneeDisplay]);
    }
    if (action === 'Duyệt bởi') {
      this.popupAction.openApproverPopup([assigneeDisplay]);
    }

    // Các action cần confirm:
    if (action === 'Duyệt') {
      this.openPopupConfirm('approve', [job.TaskName]);
    }
    if (action === 'Gửi duyệt') {
      this.openPopupConfirm('submit', [job.TaskName]);
    }
    if (action === 'Xóa công việc') {
      this.openPopupConfirm('delete', [job.TaskName]);
    }
  }

  toggleSelectAll(e: any): void {
    this.allSelected = e.target.checked;
    if (this.allSelected) {
      this.selectedJobs = [...this.filteredJobs];
    } else {
      this.selectedJobs = [];
    }
    this.actionBarOpened.emit(this.selectedJobs.length > 0);
  }

  toggleSelectItem(job: JobWithActionMenu): void {
    const i = this.selectedJobs.findIndex(x => x.TaskName === job.TaskName);
    if (i >= 0) {
      this.selectedJobs.splice(i, 1);
    } else {
      this.selectedJobs.push(job);
    }
    this.allSelected = this.selectedJobs.length === this.filteredJobs.length;
    this.actionBarOpened.emit(this.selectedJobs.length > 0);
  }

  isSelected(job: JobWithActionMenu): boolean {
    return this.selectedJobs.some(x => x.TaskName === job.TaskName);
  }

  getStatusClass(s: JobStatus): string {
    if (this.tableType === 'pre-Offboarding') {
      if (s === JobStatus.CHUA_THUC_HIEN) return 'status-not-executed';
      if (s === JobStatus.KHONG_THUC_HIEN) return 'status-stopped';
      return '';
    }
    if (s === JobStatus.KHONG_THUC_HIEN) return 'status-not-executed';
    if (s === JobStatus.DANG_THUC_HIEN) return 'status-in-progress';
    if (s === JobStatus.HOAN_TAT) return 'status-completed';
    if (s === JobStatus.NGUNG_THUC_HIEN) return 'status-stopped';
    if (s === JobStatus.CHO_DUYET) return 'status-pending-approval';
    return '';
  }

  get visibleButtons() {
    return {
      showNoAction: this.selectedJobs.some(
        x => x.Status === JobStatus.CHUA_THUC_HIEN
      ),
      showDelete: this.selectedJobs.some(
        x =>
          x.Status === JobStatus.CHUA_THUC_HIEN &&
          this.tableType === 'pre-Offboarding'
      ),
      showReopen: this.selectedJobs.some(
        x =>
          x.Status === JobStatus.KHONG_THUC_HIEN ||
          x.Status === JobStatus.NGUNG_THUC_HIEN
      ),
      // Ngưng thực hiện
      showStopAction: this.selectedJobs.some(
        x => x.Status === JobStatus.DANG_THUC_HIEN
      ),
      // Gửi duyệt
      showSubmit: this.selectedJobs.some(
        x => x.Status === JobStatus.DANG_THUC_HIEN
      ),
      // Duyệt
      showApprove: this.selectedJobs.some(
        x => x.Status === JobStatus.CHO_DUYET
      ),
      showExecutor: this.selectedJobs.length > 0,
      showApprover: this.selectedJobs.length > 0
    };
  }

  // ===> CHỈNH SỬA TẠI ĐÂY <===
  // Bulk actions cũng mở popupConfirm thay vì gọi trực tiếp onConfirmXxx()
  bulkNoAction(): void {
    const applicableJobs = this.selectedJobs.filter(
      job => job.Status === JobStatus.CHUA_THUC_HIEN
    );
    if (applicableJobs.length > 0) {
      const displayNames = applicableJobs.map(
        job => `${job.AssigneeName} | ${job.AssigneeID}`
      );
      this.popupAction.openReasonPopup(displayNames);
      this.closeActionBar();
    }
  }

  bulkStopAction(): void {
    const applicableJobs = this.selectedJobs.filter(
      job => job.Status === JobStatus.DANG_THUC_HIEN
    );
    if (applicableJobs.length > 0) {
      const displayNames = applicableJobs.map(
        job => `${job.AssigneeName} | ${job.AssigneeID}`
      );
      this.popupAction.openStopPopup(displayNames);
      this.closeActionBar();
    }
  }

  // Trước đây: this.onConfirmDelete();
  bulkDelete(): void {
    const jobNames = this.selectedJobs.map(job => job.TaskName);
    this.openPopupConfirm('delete', jobNames); // mở popup Xác Nhận Xóa
    this.closeActionBar();
  }

  // Trước đây: this.onConfirmSubmit();
  bulkReopen(): void {
    const applicableJobs = this.selectedJobs.filter(
      job =>
        job.Status === JobStatus.KHONG_THUC_HIEN ||
        job.Status === JobStatus.NGUNG_THUC_HIEN
    );
    if (applicableJobs.length > 0) {
      const displayNames = applicableJobs.map(
        job => `${job.AssigneeName} | ${job.AssigneeID}`
      );
      this.popupAction.openReopenPopup(displayNames);
      this.closeActionBar();
    }
  }

  // Trước đây: this.onConfirmSubmit();
  bulkSubmit(): void {
    if (this.selectedJobs.length > 0) {
      const jobNames = this.selectedJobs.map(job => job.TaskName);
      this.openPopupConfirm('submit', jobNames); // mở popup Xác Nhận Gửi Duyệt
      this.closeActionBar();
    }
  }

  bulkExecutor(): void {
    if (this.selectedJobs.length > 0) {
      const displayNames = this.selectedJobs.map(
        job => `${job.AssigneeName} | ${job.AssigneeID}`
      );
      this.popupAction.openExecutorPopup(displayNames);
      this.closeActionBar();
    }
  }

  bulkApprover(): void {
    if (this.selectedJobs.length > 0) {
      const displayNames = this.selectedJobs.map(
        job => `${job.AssigneeName} | ${job.AssigneeID}`
      );
      this.popupAction.openApproverPopup(displayNames);
      this.closeActionBar();
    }
  }

  closeActionBar(): void {
    this.selectedJobs = [];
    this.allSelected = false;
    this.actionBarOpened.emit(false);
  }

  // ===> CHỈNH SỬA TẠI ĐÂY <===
  // Hàm mở popupConfirm (chỉ set showPopupConfirm = true + confirmActionType)
  openPopupConfirm(
    actionType: 'approve' | 'submit' | 'delete',
    jobNames: string[]
  ): void {
    this.selectedJobNames = jobNames;
    this.selectedJobUsers =
      jobNames.length === 1 ? ['Nguyễn Văn A - H0001'] : [`${jobNames.length} người`];

    this.confirmActionType = actionType;
    this.showPopupConfirm = true;
  }

  // Các hàm Xác nhận / Hủy — thực sự thay đổi dữ liệu khi user nhấn "XÁC NHẬN" trong popup
  onConfirmApproval(): void {
    // logic phê duyệt
    this.jobNames = this.jobNames.map(job => {
      if (
        this.selectedJobNames.includes(job.TaskName) &&
        job.Status === JobStatus.CHO_DUYET
      ) {
        return { ...job, Status: JobStatus.HOAN_TAT };
      }
      return job;
    });
    this.filterJobs();
    this.showPopupConfirm = false;
    this.confirmActionType = null;
    this.selectedJobNames = [];
    this.selectedJobUsers = [];
  }

  onCancelApproval(): void {
    this.showPopupConfirm = false;
    this.confirmActionType = null;
    this.selectedJobNames = [];
    this.selectedJobUsers = [];
  }

  onConfirmSubmit(): void {
    // logic gửi duyệt
    this.jobNames = this.jobNames.map(job => {
      if (
        this.selectedJobNames.includes(job.TaskName) &&
        job.Status === JobStatus.DANG_THUC_HIEN
      ) {
        return { ...job, Status: JobStatus.CHO_DUYET };
      }
      return job;
    });
    this.filterJobs();
    this.showPopupConfirm = false;
    this.confirmActionType = null;
    this.selectedJobNames = [];
    this.selectedJobUsers = [];
  }

  onCancelSubmit(): void {
    this.showPopupConfirm = false;
    this.confirmActionType = null;
    this.selectedJobNames = [];
    this.selectedJobUsers = [];
  }

  onConfirmDelete(): void {
    // logic xóa
    this.jobNames = this.jobNames.filter(
      job => !this.selectedJobNames.includes(job.TaskName)
    );
    this.selectedJobs = this.selectedJobs.filter(
      job => !this.selectedJobNames.includes(job.TaskName)
    );
    this.allSelected = false;
    this.showPopupConfirm = false;
    this.confirmActionType = null;
    this.filterJobs();
    this.actionBarOpened.emit(this.selectedJobs.length > 0);
    this.selectedJobNames = [];
    this.selectedJobUsers = [];
  }

  onCancelDelete(): void {
    this.showPopupConfirm = false;
    this.confirmActionType = null;
    this.selectedJobNames = [];
    this.selectedJobUsers = [];
  }

  // Hàm xử lý event từ popupAction (reason, reopen, ...)
  handleStatusUpdate(event: StatusUpdateEvent) {
    const { jobNames, newStatus, executor, approver } = event;
    this.jobNames.forEach(job => {
      if (jobNames.includes(`${job.AssigneeName} | ${job.AssigneeID}`)) {
        if (executor) {
          job.AssigneeBy = executor.position;
          const person = this.getPeople(executor.position).find(
            p => p.id === executor.personId
          );
          if (person) {
            job.AssigneeName = person.name;
            job.AssigneeID = person.id;
          }
        }
        if (approver) {
          job.PositionApprovedName = approver.position;
          const person = this.getPeople(approver.position).find(
            p => p.id === approver.personId
          );
          if (person) {
            job.ApprovedName = person.name;
            job.ApprovedID = person.id;
          }
        }
        if (newStatus !== undefined) {
          job.Status = newStatus;
          // đồng bộ giữa pre-Offboarding / Offboarding nếu cần
          if (
            this.tableType === 'pre-Offboarding' &&
            newStatus === JobStatus.KHONG_THUC_HIEN
          ) {
            const correspondingOffboardingJob = this.jobNames.find(
              j => j.TaskName === job.TaskName && j.Status === JobStatus.DANG_THUC_HIEN
            );
            if (correspondingOffboardingJob) {
              correspondingOffboardingJob.Status = JobStatus.KHONG_THUC_HIEN;
            }
          }
          if (
            this.tableType === 'Offboarding' &&
            newStatus === JobStatus.KHONG_THUC_HIEN
          ) {
            const correspondingPreOffboardingJob = this.jobNames.find(
              j => j.TaskName === job.TaskName && j.Status === JobStatus.CHUA_THUC_HIEN
            );
            if (correspondingPreOffboardingJob) {
              correspondingPreOffboardingJob.Status = JobStatus.KHONG_THUC_HIEN;
            }
          }
        }
      }
    });
    this.filterJobs();
  }

  getPeople(positionName: string): PersonDTO[] {
    const position = this.positions.find(
      (p: PositionDTO) => p.name === positionName
    );
    return position ? position.people : [];
  }
}
