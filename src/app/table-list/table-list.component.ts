import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { JobNameDTO } from '../models/job-name.dto';
import { MOCK_JOB_NAMES } from '../data/mock-data';
import { PaginationService } from '../services/pagination.service'; // đường dẫn import service phù hợp

@Component({
  selector: 'app-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.scss']
})
export class TableListComponent implements OnInit, OnDestroy {
  jobNames: JobNameDTO[] = [];

  currentPage: number = 1;
  rowsPerPage: number = 25;

  private subscription: Subscription = new Subscription();

  constructor(private paginationService: PaginationService) {}

  ngOnInit(): void {
    this.jobNames = MOCK_JOB_NAMES;

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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get displayedJobs(): JobNameDTO[] {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    return this.jobNames.slice(startIndex, endIndex);
  }

  getStatus(status: number): string {
    switch (status) {
      case 1:
        return 'Chưa thực hiện';
      case 2:
        return 'Đang thực hiện';
      case 3:
        return 'Đã hoàn thành';
      case 4:
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  }

  onPageChange(page: number) {
    this.paginationService.setCurrentPage(page);
  }

  onItemsPerPageChange(newRowsPerPage: number) {
    this.paginationService.setItemsPerPage(newRowsPerPage);
    this.paginationService.setCurrentPage(1);
  }
}
