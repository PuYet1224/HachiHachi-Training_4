import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import Fuse, { FuseResult } from 'fuse.js'; 
import { JobNameDTO } from '../models/job-name.dto';
import { MOCK_JOB_NAMES } from '../data/mock-data';
import { PaginationService } from '../services/pagination.service';

@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.scss']
})
export class TableListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() searchTerm: string = '';
  jobNames: JobNameDTO[] = [];
  filteredJobs: JobNameDTO[] = [];
  currentPage: number = 1;
  rowsPerPage: number = 25;
  sortField: keyof JobNameDTO = 'TaskName';
  sortDirection: 'asc' | 'desc' = 'asc';
  fuse!: Fuse<JobNameDTO>; 
  subscription: Subscription = new Subscription();

  constructor(private paginationService: PaginationService) {}

  ngOnInit(): void {
    this.jobNames = MOCK_JOB_NAMES;
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
    if (changes['searchTerm']) { 
      this.filterJobs();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  filterJobs(): void {
    if (!this.searchTerm.trim()) {
      this.filteredJobs = this.jobNames;
    } else {
      const results = this.fuse.search(this.searchTerm);
      this.filteredJobs = results.map((res: FuseResult<JobNameDTO>) => res.item); // Sử dụng FuseResult
    }
    this.currentPage = 1;
  }

  get displayedJobs(): JobNameDTO[] {
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
      case 2: return 'Đang thực hiện';
      case 3: return 'Đã hoàn thành';
      case 4: return 'Đã hủy';
      default: return 'Không xác định';
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
}
