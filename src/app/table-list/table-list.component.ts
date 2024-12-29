import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import Fuse, { FuseResult } from 'fuse.js';
import { JobNameDTO } from '../models/job-name.dto';
import { MOCK_JOB_NAMES } from '../data/mock-data';
import { PaginationService } from '../services/pagination.service';
import { JobStatusService } from '../services/job-status.service';
import { JobIconService } from '../services/job-icon.service';

interface JobWithActionMenu extends JobNameDTO {
  actionMenuVisible?: boolean;
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
  @Output() actionBarOpened = new EventEmitter<boolean>();
  @Output() rowCountChange = new EventEmitter<number>();

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

  constructor(
    private paginationService: PaginationService,
    public jobStatusService: JobStatusService,
    public jobIconService: JobIconService
  ) {}

  ngOnInit(): void {
    this.jobNames = MOCK_JOB_NAMES.map(job => ({ ...job, actionMenuVisible: false }));
    this.fuse = new Fuse(this.jobNames, {
      keys: ['TaskName', 'Description', 'AssigneeBy'],
      threshold: 0.4
    });
    this.filterJobs();
    this.subscription.add(
      this.paginationService.itemsPerPage$.subscribe(val => {
        this.rowsPerPage = val;
      })
    );
    this.subscription.add(
      this.paginationService.currentPage$.subscribe(val => {
        this.currentPage = val;
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm'] || changes['tableType']) {
      this.filterJobs();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  filterJobs(): void {
    if (!this.searchTerm.trim()) {
      this.filteredJobs = this.tableType === 'pre-onboarding'
        ? this.jobNames.filter(job => [1, 2].includes(job.Status))
        : this.jobNames;
    } else {
      const results = this.fuse.search(this.searchTerm);
      this.filteredJobs = results.map((res: FuseResult<JobWithActionMenu>) => res.item)
        .filter(job => this.tableType === 'pre-onboarding' ? [1, 2].includes(job.Status) : true);
    }
    this.currentPage = 1;
    this.rowCountChange.emit(this.filteredJobs.length);
  }

  get displayedJobs(): JobWithActionMenu[] {
    let data = this.filteredJobs;
    if (this.sortField) {
      data = [...data].sort((a, b) => {
        const aValue = a[this.sortField];
        const bValue = b[this.sortField];
        if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    return data.slice(startIndex, startIndex + this.rowsPerPage);
  }

  sortTable(field: keyof JobNameDTO): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  getActions(status: number): string[] {
    if (this.tableType === 'pre-onboarding') {
      if (status === 1) {
        return ['Không thực hiện', 'Xóa công việc'];
      }
      if (status === 2) {
        return ['Mở lại'];
      }
      return [];
    } else {
      switch (status) {
        case 1:
          return ['Ngưng thực hiện', 'Gửi duyệt'];
        case 2:
        case 5:
          return ['Mở lại'];
        case 3:
          return ['Hoàn tất'];
        case 4:
          return [];
        default:
          return [];
      }
    }
  }

  toggleActionMenu(job: JobWithActionMenu, index: number): void {
    const id = 'item-' + index + '-' + job.TaskName;
    this.activeActionMenuId = this.activeActionMenuId === id ? null : id;
  }

  performAction(action: string, job: JobWithActionMenu): void {
    this.toggleActionMenu(job, this.displayedJobs.indexOf(job));
    // Implement action handling logic here
  }

  toggleSelectAll(event: any): void {
    this.allSelected = event.target.checked;
    if (this.allSelected) {
      this.selectedJobs = [...this.displayedJobs];
    } else {
      this.selectedJobs = [];
    }
    this.actionBarOpened.emit(this.selectedJobs.length > 0);
  }

  toggleSelectItem(job: JobWithActionMenu): void {
    const index = this.selectedJobs.findIndex(j => j.TaskName === job.TaskName);
    if (index >= 0) {
      this.selectedJobs.splice(index, 1);
    } else {
      this.selectedJobs.push(job);
    }
    this.allSelected = this.selectedJobs.length === this.displayedJobs.length;
    this.actionBarOpened.emit(this.selectedJobs.length > 0);
  }

  isSelected(job: JobWithActionMenu): boolean {
    return this.selectedJobs.some(j => j.TaskName === job.TaskName);
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 1:
        return 'status-not-executed';
      case 2:
        return 'status-pending';
      case 3:
        return 'status-completed';
      case 4:
        return 'status-stopped';
      case 5:
        return 'status-stopped';
      default:
        return '';
    }
  }

  get visibleButtons() {
    if (this.tableType === 'pre-onboarding') {
      return {
        showNoAction: this.selectedJobs.some(job => job.Status === 1),
        showDelete: this.selectedJobs.some(job => job.Status === 1),
        showReopen: this.selectedJobs.some(job => job.Status === 2),
        showStopAction: false,
        showSubmit: false
      };
    } else { // onboarding
      return {
        showNoAction: false,
        showDelete: false,
        showReopen: this.selectedJobs.some(job => job.Status === 2 || job.Status === 5),
        showStopAction: this.selectedJobs.some(job => job.Status === 1),
        showSubmit: this.selectedJobs.some(job => job.Status === 1 || job.Status === 3),
        showComplete: this.selectedJobs.some(job => job.Status === 3)
      };
    }
  }

  checkAndOpenDeleteModal(): void {
    if (this.selectedJobs.length > 0) {
      this.isDeleteModalVisible = true;
    }
  }

  confirmDelete(): void {
    const toDelete = this.selectedJobs.map(item => item.TaskName);
    this.jobNames = this.jobNames.filter(j => !toDelete.includes(j.TaskName));
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
    return this.selectedJobs.map(job => job.TaskName).join(', ');
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

  onItemsPerPageChange(newRowsPerPage: number): void {
    this.paginationService.setItemsPerPage(newRowsPerPage);
    this.paginationService.setCurrentPage(1);
  }
}
