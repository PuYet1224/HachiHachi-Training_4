import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import Fuse, { FuseResult } from 'fuse.js';
import { JobNameDTO } from '../models/job-name.dto';
import { MOCK_JOB_NAMES } from '../data/mock-data';
import { PaginationService } from '../services/pagination.service';
import { JobStatusService } from '../services/job-status.service';
import { JobIconService } from '../services/job-icon.service';
import { JobStatus } from '../enum/job-status.enum';

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
  @Input() searchTerm: string = '';
  @Input() tableType: 'pre-onboarding' | 'onboarding' = 'pre-onboarding';
  @Input() disabled: boolean = false;
  @Input() sortStatusId: JobStatus | null = null;
  @Output() actionBarOpened = new EventEmitter<boolean>();
  @Output() rowCountChange = new EventEmitter<number>();
  @Output() statusCounts = new EventEmitter<{ [key: number]: number }>();

  jobNames: JobWithActionMenu[] = [];
  filteredJobs: JobWithActionMenu[] = [];
  selectedJobs: JobWithActionMenu[] = [];
  allSelected: boolean = false;
  isDeleteModalVisible: boolean = false;
  currentPage: number = 1;
  rowsPerPage: number = 25;
  sortField: keyof JobNameDTO = 'TaskName';
  sortDirection: 'asc' | 'desc' = 'asc';

  fuse!: Fuse<JobWithActionMenu>;
  subscription: Subscription = new Subscription();
  activeActionMenuId: string | null = null;
  private originalOrder: JobWithActionMenu[] = [];

  constructor(
    private paginationService: PaginationService,
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
    this.subscription.add(this.paginationService.itemsPerPage$.subscribe(val => {
      this.rowsPerPage = val;
    }));
    this.subscription.add(this.paginationService.currentPage$.subscribe(val => {
      this.currentPage = val;
    }));
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

    // 1) Tìm kiếm
    if (!this.searchTerm.trim()) {
      temp = [...this.jobNames];
    } else {
      const results = this.fuse.search(this.searchTerm);
      temp = results.map((res: FuseResult<JobWithActionMenu>) => res.item);
    }

    // 2) Lọc theo tableType
    if (this.tableType === 'pre-onboarding') {
      // status = 1,2
      temp = temp.filter(x => x.Status === JobStatus.CHUA_THUC_HIEN || x.Status === JobStatus.KHONG_THUC_HIEN);
    } else {
      // onboarding => 1..6
      temp = temp.filter(x => [1,2,3,4,5,6].includes(x.Status));
    }

    // 3) Sort: nếu sortStatusId != null => sort status đó lên đầu
    if (this.sortStatusId !== null) {
      temp.sort((a, b) => {
        const aPriority = (a.Status === this.sortStatusId) ? 0 : 1;
        const bPriority = (b.Status === this.sortStatusId) ? 0 : 1;
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

    // Reset page
    this.currentPage = 1;
    this.rowCountChange.emit(this.filteredJobs.length);
  }

  compare(a: JobWithActionMenu, b: JobWithActionMenu, field: keyof JobWithActionMenu, dir: 'asc' | 'desc'): number {
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

  get displayedJobs(): JobWithActionMenu[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    return this.filteredJobs.slice(start, start + this.rowsPerPage);
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
    if (this.tableType === 'pre-onboarding') {
      if (s === JobStatus.CHUA_THUC_HIEN) return ['Chưa thực hiện'];
      if (s === JobStatus.KHONG_THUC_HIEN) return ['Không thực hiện', 'Xóa công việc'];
      return [];
    }
    if (s === JobStatus.KHONG_THUC_HIEN) return ['Không thực hiện'];
    if (s === JobStatus.DANG_THUC_HIEN) return ['Đang thực hiện'];
    if (s === JobStatus.HOAN_TAT) return ['Hoàn tất'];
    if (s === JobStatus.NGUNG_THUC_HIEN) return ['Ngưng thực hiện'];
    if (s === JobStatus.CHO_DUYET) return ['Chờ duyệt'];
    return [];
  }

  toggleActionMenu(job: JobWithActionMenu, i: number): void {
    const id = 'item-' + i + '-' + job.TaskName;
    this.activeActionMenuId = (this.activeActionMenuId === id) ? null : id;
  }

  performAction(action: string, job: JobWithActionMenu): void {
    this.toggleActionMenu(job, this.displayedJobs.indexOf(job));
  }

  toggleSelectAll(e: any): void {
    this.allSelected = e.target.checked;
    if (this.allSelected) {
      this.selectedJobs = [...this.displayedJobs];
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
    this.allSelected = (this.selectedJobs.length === this.displayedJobs.length);
    this.actionBarOpened.emit(this.selectedJobs.length > 0);
  }

  isSelected(job: JobWithActionMenu): boolean {
    return this.selectedJobs.some(x => x.TaskName === job.TaskName);
  }

  getStatusClass(s: JobStatus): string {
    if (this.tableType === 'pre-onboarding') {
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
    if (this.tableType === 'pre-onboarding') {
      return {
        showNoAction: this.selectedJobs.some(x => x.Status === JobStatus.CHUA_THUC_HIEN),
        showDelete: this.selectedJobs.some(x => x.Status === JobStatus.KHONG_THUC_HIEN),
        showReopen: false,
        showStopAction: false,
        showSubmit: false,
        showComplete: false
      };
    }
    return {
      showNoAction: this.selectedJobs.some(x => x.Status === JobStatus.KHONG_THUC_HIEN),
      showDelete: false,
      showReopen: false,
      showStopAction: this.selectedJobs.some(x => x.Status === JobStatus.DANG_THUC_HIEN),
      showSubmit: this.selectedJobs.some(x => x.Status === JobStatus.CHO_DUYET),
      showComplete: this.selectedJobs.some(x => x.Status === JobStatus.HOAN_TAT)
    };
  }

  checkAndOpenDeleteModal(): void {
    if (this.selectedJobs.length > 0) {
      this.isDeleteModalVisible = true;
    }
  }

  confirmDelete(): void {
    const arr = this.selectedJobs.map(x => x.TaskName);
    this.jobNames = this.jobNames.filter(j => !arr.includes(j.TaskName));
    this.selectedJobs = [];
    this.allSelected = false;
    this.isDeleteModalVisible = false;
    this.filterJobs();
    this.actionBarOpened.emit(false);
  }

  closeDeleteModal(): void {
    this.isDeleteModalVisible = false;
  }

  get selectedJobsTitle(): string {
    return this.selectedJobs.map(x => x.TaskName).join(', ');
  }

  closeActionBar(): void {
    this.selectedJobs = [];
    this.allSelected = false;
    this.actionBarOpened.emit(false);
  }

  bulkNoAction(): void {
    this.closeActionBar();
  }

  bulkDelete(): void {
    this.checkAndOpenDeleteModal();
  }

  bulkReopen(): void {
    this.closeActionBar();
  }

  bulkStopAction(): void {
    this.closeActionBar();
  }

  bulkSubmit(): void {
    this.closeActionBar();
  }

  bulkComplete(): void {
    this.closeActionBar();
  }

  onPageChange(page: number): void {
    this.paginationService.setCurrentPage(page);
  }

  onItemsPerPageChange(n: number): void {
    this.paginationService.setItemsPerPage(n);
    this.paginationService.setCurrentPage(1);
  }
}
