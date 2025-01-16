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
import { EmployeeDTO } from '../models/employee.dto';

interface JobWithActionMenu extends JobNameDTO {
  actionMenuVisible?: boolean;
  originalIndex: number;
  TypeOfStaff?: string;
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
  @Input() employees: EmployeeDTO[] = [];
  @Input() jobNames: JobNameDTO[] = [];
  @Input() showStopped: boolean = true;
  @ViewChild('popupAction') popupAction!: PopupActionComponent;
  @Output() jobNamesChange: EventEmitter<any[]> = new EventEmitter<any[]>();

  internalJobNames: JobWithActionMenu[] = [];
  filteredJobs: JobWithActionMenu[] = [];
  selectedJobs: JobWithActionMenu[] = [];
  allSelected = false;
  isDeleteModalVisible = false;
  sortField: keyof JobNameDTO = 'TaskName';
  sortDirection: 'asc' | 'desc' = 'asc';
  fuse!: Fuse<JobWithActionMenu>;
  subscription: Subscription = new Subscription();
  activeActionMenuId: string | null = null;
  isNewJob: boolean = false;
  showPopupConfirm = false;
  confirmActionType: 'approve' | 'submit' | 'delete' | 'stop' | null = null;
  selectedJobNames: string[] = [];
  selectedJobUsers: string[] = [];

  drawerVisible = false;
  drawerMode: 'edit' | 'view' = 'view';
  selectedJobForDrawer: JobNameDTO | null = null;

  private originalOrder: JobWithActionMenu[] = [];
  private updatedStatusCounts: { [key: number]: number } = {};
  positions: PositionDTO[] = POSITIONS;
  private updateJobNames(): void {
    const updatedJobNames = this.internalJobNames.map(job => job);
    this.jobNamesChange.emit(updatedJobNames);
  }
  public JobStatus = JobStatus;

  constructor(
    public jobStatusService: JobStatusService,
    public jobIconService: JobIconService
  ) {}

  ngOnInit(): void {
    if (this.jobNames && this.jobNames.length > 0) {
      this.internalJobNames = this.jobNames.map((job, i) => ({
        ...job,
        actionMenuVisible: false,
        originalIndex: i
      }));
    } else {
      this.internalJobNames = MOCK_JOB_NAMES.map((job, i) => ({
        ...job,
        actionMenuVisible: false,
        originalIndex: i
      }));
    }
    this.originalOrder = [...this.internalJobNames];
    this.fuse = new Fuse(this.internalJobNames, {
      keys: ['TaskName', 'Description', 'AssigneeName'],
      threshold: 0,
      distance: 100,
      ignoreLocation: true
    });
    this.filterJobs();
    this.updateJobNames(); 

    this.subscription.add(
      this.popupAction.statusUpdated.subscribe(event => {
        this.handleStatusUpdate(event);
      })
    );
  }

  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['jobNames']) {
      if (this.jobNames && this.jobNames.length > 0) {
        this.internalJobNames = this.jobNames.map((job, i) => ({
          ...job,
          actionMenuVisible: false,
          originalIndex: i
        }));
      }
      this.fuse = new Fuse(this.internalJobNames, {
        keys: ['TaskName', 'Description', 'AssigneeBy'],
        threshold: 0.4
      });
    }
  
    if (changes['searchTerm'] || changes['tableType'] || changes['sortStatusId'] || changes['jobNames']) {
      if (changes['tableType'] && changes['tableType'].currentValue === 'Offboarding') {
        this.internalJobNames = this.internalJobNames.map(job => {
          if (job.Status === JobStatus.CHUA_THUC_HIEN) {
            return { ...job, Status: JobStatus.DANG_THUC_HIEN };
          }
          return job;
        });
        this.fuse.setCollection(this.internalJobNames); 
      }
      this.filterJobs();
      this.updateJobNames(); 
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private formatDate(date: Date): string {
    return ('0' + date.getDate()).slice(-2) + '/' +
           ('0' + (date.getMonth() + 1)).slice(-2) + '/' +
           (date.getFullYear() % 100);
  }

  filterJobs(): void {
    let temp: JobWithActionMenu[];
    if (!this.searchTerm.trim()) {
      temp = [...this.internalJobNames];
    } else {
      const results = this.fuse.search(this.searchTerm);
      temp = results.map((res: FuseResult<JobWithActionMenu>) => res.item);
    }
    
    if (this.tableType === 'pre-Offboarding') {
      temp = temp.filter(
        x => x.Status === JobStatus.CHUA_THUC_HIEN || x.Status === JobStatus.KHONG_THUC_HIEN
      );
    } else {
      temp = temp.filter(x => {
        if ([JobStatus.KHONG_THUC_HIEN, JobStatus.NGUNG_THUC_HIEN].includes(x.Status)) {
          return this.showStopped;  
        }
        return true;
      });
    }
    
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
    let av = a[field] ?? '';
    let bv = b[field] ?? '';
    if (field === 'OrderBy') {
      av = Number(av);
      bv = Number(bv);
    } else if (field === 'EndDate') {
      av = new Date(av as string).getTime();
      bv = new Date(bv as string).getTime();
    } else if (typeof av === 'string' && typeof bv === 'string') {
      const result = av.localeCompare(bv, 'vi', { sensitivity: 'base' });
      return dir === 'asc' ? result : -result;
    }
    if (av < bv) return dir === 'asc' ? -1 : 1;
    if (av > bv) return dir === 'asc' ? 1 : -1;
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
  onShowStoppedChange(newValue: boolean): void {
    this.showStopped = newValue;
    this.filterJobs();
  }
  
  onStatusIconClick(event: Event, job: JobWithActionMenu, iconIndex: number): void {
    event.stopPropagation();
    if (
      job.Status === JobStatus.HOAN_TAT &&
      this.jobIconService.getIcons(this.tableType, +job.Status)[iconIndex].indexOf("eye.png") !== -1
    ) {
      this.onViewDetail(job);
      return;
    }
    let action: string | null = null;
    if (this.tableType === 'Offboarding') {
      if (job.Status === JobStatus.CHO_DUYET && iconIndex === 0) {
        action = 'Duyệt';
      } else if (job.Status === JobStatus.DANG_THUC_HIEN) {
        if (iconIndex === 0) action = 'Gửi duyệt';
        else if (iconIndex === 1) action = 'Ngưng thực hiện';
      } else if (job.Status === JobStatus.NGUNG_THUC_HIEN && iconIndex === 0) {
        action = 'Mở lại';
      } else if (job.Status === JobStatus.KHONG_THUC_HIEN && iconIndex === 0) {
        action = 'Mở lại';
      }
    } else if (this.tableType === 'pre-Offboarding') {
      if (job.Status === JobStatus.CHUA_THUC_HIEN && iconIndex === 0) {
        action = 'Không thực hiện';
      } else if (job.Status === JobStatus.KHONG_THUC_HIEN && iconIndex === 0) {
        action = 'Mở lại';
      }
    }
    if (action) {
      this.performAction(action, job, false);
    }
  }  
  
  performAction(action: string, job: JobWithActionMenu, fromActionMenu: boolean = true): void {
    if (fromActionMenu) this.toggleActionMenu(job, this.filteredJobs.indexOf(job));
    if (action === 'Chỉnh sửa') {
      this.drawerMode = 'edit';
      this.selectedJobForDrawer = job;
      this.drawerVisible = true;
      return;
    }
    if (action === 'Xem chi tiết') {
      this.drawerMode = 'view';
      this.selectedJobForDrawer = job;
      this.drawerVisible = true;
      return;
    }
    if (action === 'Không thực hiện') {
      this.popupAction.openReasonPopup([job.TaskName]);
    }
    if (action === 'Ngưng thực hiện') {
      this.popupAction.openStopPopup([job.TaskName]);
    }
    if (action === 'Mở lại') {
      this.popupAction.openReopenPopup([job.TaskName]);
    }
    if (action === 'Thực hiện bởi') {
      this.popupAction.openExecutorPopup([job.TaskName]);
    }
    if (action === 'Duyệt bởi') {
      this.popupAction.openApproverPopup([job.TaskName]);
    }
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
      showNoAction: this.selectedJobs.some(x => x.Status === JobStatus.CHUA_THUC_HIEN),
      showDelete: this.selectedJobs.some(
        x => x.Status === JobStatus.CHUA_THUC_HIEN && this.tableType === 'pre-Offboarding'
      ),
      showReopen: this.selectedJobs.some(
        x => x.Status === JobStatus.KHONG_THUC_HIEN || x.Status === JobStatus.NGUNG_THUC_HIEN
      ),
      showStopAction: this.selectedJobs.some(x => x.Status === JobStatus.DANG_THUC_HIEN),
      showSubmit: this.selectedJobs.some(x => x.Status === JobStatus.DANG_THUC_HIEN),
      showApprove: this.selectedJobs.some(x => x.Status === JobStatus.CHO_DUYET),
      showExecutor: this.selectedJobs.length > 0,
      showApprover: this.selectedJobs.length > 0
    };
  }

  bulkNoAction(): void {
    const applicableJobs = this.selectedJobs.filter(
      job => job.Status === JobStatus.CHUA_THUC_HIEN
    );
    if (applicableJobs.length > 0) {
      const taskNames = applicableJobs.map(job => job.TaskName);
      this.popupAction.openReasonPopup(taskNames);
      this.closeActionBar();
    }
  }

  bulkStopAction(): void {
    const applicableJobs = this.selectedJobs.filter(
      job => job.Status === JobStatus.DANG_THUC_HIEN
    );
    if (applicableJobs.length > 0) {
      const taskNames = applicableJobs.map(job => job.TaskName);
      this.popupAction.openStopPopup(taskNames);
      this.closeActionBar();
    }
  }

  bulkDelete(): void {
    const deletableJobs = this.selectedJobs.filter(
      job => job.Status === JobStatus.CHUA_THUC_HIEN
    );
    const jobNames = deletableJobs.map(job => job.TaskName);
    if (jobNames.length > 0) {
      this.openPopupConfirm('delete', jobNames);
    } else {
      alert('Không có công việc nào có thể xóa.');
    }
    this.closeActionBar();
  }

  bulkReopen(): void {
    const applicableJobs = this.selectedJobs.filter(
      job => job.Status === JobStatus.KHONG_THUC_HIEN || job.Status === JobStatus.NGUNG_THUC_HIEN
    );
    if (applicableJobs.length > 0) {
      const taskNames = applicableJobs.map(job => job.TaskName);
      this.popupAction.openReopenPopup(taskNames);
      this.closeActionBar();
    }
  }

  bulkSubmit(): void {
    if (this.selectedJobs.length > 0) {
      const jobNames = this.selectedJobs.map(job => job.TaskName);
      this.openPopupConfirm('submit', jobNames);
      this.closeActionBar();
    }
  }

  bulkApprove(): void {
    const approvableJobs = this.selectedJobs.filter(
      job => job.Status === JobStatus.CHO_DUYET
    );
    if (approvableJobs.length > 0) {
      const taskNames = approvableJobs.map(job => job.TaskName);
      this.openPopupConfirm('approve', taskNames);
      this.closeActionBar();
    }
  }
  
  bulkExecutor(): void {
    if (this.selectedJobs.length > 0) {
      const executorPositions = this.selectedJobs.map(job => job.AssigneePositionName);
      const uniqueExecutorPositions = Array.from(new Set(executorPositions));
      this.popupAction.openExecutorPopup(
        this.selectedJobs.map(job => job.TaskName),
        uniqueExecutorPositions
      );
      this.closeActionBar();
    }
  }
  
  bulkApprover(): void {
    if (this.selectedJobs.length > 0) {
      const approverPositions = this.selectedJobs.map(job => job.ApprovedPositionName);
      const uniqueApproverPositions = Array.from(new Set(approverPositions));
      this.popupAction.openApproverPopup(
        this.selectedJobs.map(job => job.TaskName),
        uniqueApproverPositions
      );
      this.closeActionBar();
    }
  }
  
  bulkOffboard(): void {
    const allowedStatuses = [
      JobStatus.KHONG_THUC_HIEN,
      JobStatus.NGUNG_THUC_HIEN,
      JobStatus.HOAN_TAT
    ];
    const invalidJobs = this.selectedJobs.filter(job => !allowedStatuses.includes(job.Status));
    if (invalidJobs.length > 0) {
      alert('Không thể chuyển sang pre-Offboarding khi có công việc đang ở trạng thái Đang thực hiện hoặc Chờ duyệt. Chỉ được chuyển khi tất cả các công việc đều có trạng thái: Không thực hiện, Ngưng thực hiện hoặc Hoàn tất.');
      return;
    }
    this.internalJobNames = this.internalJobNames.map(job => {
      if (this.selectedJobs.some(s => s.TaskName === job.TaskName)) {
        job.Status = JobStatus.CHUA_THUC_HIEN;
      }
      return job;
    });
    this.filterJobs();
    this.updateJobNames(); 
    this.closeActionBar();
  }

  closeActionBar(): void {
    this.selectedJobs = [];
    this.allSelected = false;
    this.actionBarOpened.emit(false);
  }

  openPopupConfirm(
    actionType: 'approve' | 'submit' | 'delete',
    jobNames: string[]
  ): void {
    this.selectedJobNames = jobNames;
    this.selectedJobUsers =
      jobNames.length === 1 ? ['Nguyễn Văn A - H0001'] : [`${jobNames.length} công việc`];
    this.confirmActionType = actionType;
    this.showPopupConfirm = true;
  }

  onConfirmApproval(): void {
    this.internalJobNames = this.internalJobNames.map(job => {
      if (
        this.selectedJobNames.includes(job.TaskName) &&
        job.Status === JobStatus.CHO_DUYET
      ) {
        job.Status = JobStatus.HOAN_TAT;
        const today = new Date();
        job.CompletedDate = this.formatDate(today);
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
  
  onViewDetail(job: JobWithActionMenu): void {
    this.drawerMode = 'view';
    this.selectedJobForDrawer = job;
    this.drawerVisible = true;
  }

  onConfirmSubmit(): void {
    this.internalJobNames = this.internalJobNames.map(job => {
      if (
        this.selectedJobNames.includes(job.TaskName) &&
        job.Status === JobStatus.DANG_THUC_HIEN
      ) {
        job.Status = JobStatus.CHO_DUYET;
        const today = new Date();
        job.SentDate = this.formatDate(today);
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

  onConfirmStop(): void {
    this.internalJobNames = this.internalJobNames.map(job => {
      if (
        this.selectedJobNames.includes(job.TaskName) &&
        job.Status === JobStatus.DANG_THUC_HIEN
      ) {
        job.Status = JobStatus.NGUNG_THUC_HIEN;
        const today = new Date();
        job.StoppedDate = this.formatDate(today);
      }
      return job;
    });
    this.filterJobs();
    this.showPopupConfirm = false;
    this.confirmActionType = null;
    this.selectedJobNames = [];
    this.selectedJobUsers = [];
  }
  
  onCancelStop(): void {
    this.showPopupConfirm = false;
    this.confirmActionType = null;
    this.selectedJobNames = [];
    this.selectedJobUsers = [];
  }

  onConfirmDelete(): void {
    this.internalJobNames = this.internalJobNames.filter(
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

  handleStatusUpdate(event: StatusUpdateEvent) {
    const { jobNames, newStatus, executor, approver } = event;
    this.internalJobNames.forEach(job => {
      if (jobNames.includes(job.TaskName)) {
        if (executor) {
          if (job.AssigneeBy === executor.position) {
            const person = this.getPeople(executor.position).find(
              p => p.id === executor.personId
            );
            if (person) {
              job.AssigneeName = person.name;
              job.AssigneeID = person.staffId;
              job.AssigneeBy = executor.position;
            }
          }
        }
        if (approver) {
          if (job.PositionApprovedName === approver.position) {
            const person = this.getPeople(approver.position).find(
              p => p.id === approver.personId
            );
            if (person) {
              job.ApprovedName = person.name;
              job.ApprovedID = person.staffId;
              job.PositionApprovedName = approver.position;
            }
          }
        }
        if (newStatus !== undefined) {
          job.Status = newStatus;
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
  
  onSaveDrawer(updatedJob: JobNameDTO) {
    const existingIndex = this.internalJobNames.findIndex(x => x.Code === updatedJob.Code);
    if (existingIndex >= 0) {
      this.internalJobNames[existingIndex] = { ...this.internalJobNames[existingIndex], ...updatedJob };
    } else {
      const newJob: JobWithActionMenu = {
        ...updatedJob,
        originalIndex: this.internalJobNames.length  
      };
      this.internalJobNames.push(newJob);
    }
    this.fuse.setCollection(this.internalJobNames);
    this.drawerVisible = false;
    this.isNewJob = false;
    this.actionBarOpened.emit(false);
    this.filterJobs();
  }
  
  isDueToday(job: JobWithActionMenu): boolean {
    const todayStr = new Date().toISOString().split('T')[0];
    return job.EndDate === todayStr;
  }
  
  isSentOverdue(sentDate: string): boolean {
    const today = new Date().setHours(0, 0, 0, 0);
    const sent = new Date(sentDate).setHours(0, 0, 0, 0);
    return today > sent;
  }
  
  isOverdue(job: JobWithActionMenu): boolean {
    const today = new Date().setHours(0, 0, 0, 0);
    const end = new Date(job.EndDate).setHours(0, 0, 0, 0);
    return today > end;
  }
  
  getOverdueDays(endDate: string): number {
    const today = new Date().setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(0, 0, 0, 0);
    return Math.floor((today - end) / (1000 * 60 * 60 * 24));
  }
  
  generateNewCode(): number {
    const maxCode = this.internalJobNames.reduce((max, job) => job.Code > max ? job.Code : max, 0);
    return maxCode + 1;
  }
  
  onAddNewJob(): void {
    const maxOrder = this.internalJobNames.reduce((max, job) => job.OrderBy > max ? job.OrderBy : max, 0);
    const defaultStatus = this.tableType === 'Offboarding'
      ? JobStatus.DANG_THUC_HIEN 
      : JobStatus.CHUA_THUC_HIEN;
    
    const newJob: JobNameDTO = {
      Code: this.generateNewCode(), 
      TaskName: '',
      Description: '',
      AssigneeBy: '',
      PositionApprovedName: '',
      OrderBy: maxOrder + 1,
      DateDuration: 0,
      PositionAssignee: 0,
      PositionApproved: 0,
      StartDate: new Date().toISOString().split('T')[0],
      EndDate: '',
      Status: defaultStatus,
      Remark: '',
      Assignee: 0,
      AssigneeName: '',
      AssigneeID: '',
      AssigneePositionName: '',
      ListHRDecisionTaskLog: [],
      Approved: 0,
      ApprovedID: '',
      ApprovedName: '',
      ApprovedPositionName: '',
      TotalWorkingTask: 0,
      TotalNotTask: 0,
      TotalPauseTask: 0,
      TotalDoneTask: 0,
      TotalOverdueTask: 0,
      TotalSentTask: 0,
      ApprovedPositionID: '',
      IsOverdue: false,
      ListOfTypeStaff: [],
      FullName: '',
      StaffID: '',
      RemainingDate: new Date(),
      Reason: 0,
      ReasonDescription: ''
    };
  
    this.isNewJob = true;
    this.drawerMode = 'edit';
    this.selectedJobForDrawer = newJob;
    this.drawerVisible = true;
    this.actionBarOpened.emit(false);
  }
  getRemainingDays(endDate: string): number {
    const today = new Date();
    const end = new Date(endDate);
    if (end > today) {
      return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }
    return 0;
  }
  
}
