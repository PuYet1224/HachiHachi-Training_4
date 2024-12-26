import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import Fuse, { FuseResult } from 'fuse.js';
import { JobNameDTO } from '../models/job-name.dto';
import { MOCK_JOB_NAMES } from '../data/mock-data';
import { PaginationService } from '../services/pagination.service';

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
  @Input() tableType: 'pre-offboard' | 'offboarding' = 'pre-offboard';
  jobNames: JobWithActionMenu[] = [];
  filteredJobs: JobWithActionMenu[] = [];
  currentPage: number = 1;
  rowsPerPage: number = 25;
  sortField: keyof JobNameDTO = 'TaskName';
  sortDirection: 'asc' | 'desc' = 'asc';
  fuse!: Fuse<JobWithActionMenu>;
  subscription: Subscription = new Subscription();

  constructor(private paginationService: PaginationService) {}

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
      this.filteredJobs = this.tableType === 'pre-offboard'
        ? this.jobNames.filter(job => [1, 2, 3, 5].includes(job.Status))
        : this.jobNames;
    } else {
      const results = this.fuse.search(this.searchTerm);
      this.filteredJobs = results.map((res: FuseResult<JobWithActionMenu>) => res.item)
        .filter(job => this.tableType === 'pre-offboard' ? [1, 2, 3, 5].includes(job.Status) : true);
    }
    this.currentPage = 1;
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

  getStatus(status: number): string {
    switch (status) {
      case 1: return 'Chưa thực hiện';
      case 2: return 'Ngưng thực hiện';
      case 3: return 'Đang thực hiện';
      case 4: return 'Hoàn tất';
      case 5: return 'Chờ duyệt';
      default: return 'Không xác định';
    }
  }

  getActions(status: number): string[] {
    if (this.tableType === 'pre-offboard') {
      if (status === 1) {
        return ['Chỉnh sửa', 'Không thực hiện', 'Xóa công việc'];
      }
      return ['Xem chi tiết', 'Mở lại'];
    } else {
      switch (status) {
        case 1:
          return ['Chỉnh sửa', 'Mở lại'];
        case 2:
          return ['Chỉnh sửa', 'Mở lại'];
        case 3:
          return ['Chỉnh sửa', 'Ngưng thực hiện', 'Gửi duyệt'];
        case 4:
          return ['Xem chi tiết'];
        case 5:
          return ['Xem chi tiết', 'Duyệt'];
        default:
          return [];
      }
    }
  }

  onPageChange(page: number) {
    this.paginationService.setCurrentPage(page);
  }

  onItemsPerPageChange(newRowsPerPage: number) {
    this.paginationService.setItemsPerPage(newRowsPerPage);
    this.paginationService.setCurrentPage(1);
  }

  sortTable(field: keyof JobNameDTO) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  toggleActionMenu(job: JobWithActionMenu) {
    job.actionMenuVisible = !job.actionMenuVisible;
  }

  performAction(action: string, job: JobWithActionMenu) {
    this.toggleActionMenu(job);
  }
}
