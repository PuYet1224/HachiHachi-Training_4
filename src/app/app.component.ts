// src/app/app.component.ts
import { Component, ViewChild } from '@angular/core';
import { TableListComponent } from './table-list/table-list.component';
import { JobStatus } from './enum/job-status.enum';  // Điều chỉnh đường dẫn nếu cần

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = '3PSolution';
  isDisabled = false;
  searchTerm = '';
  currentTable: 'pre-Offboarding' | 'Offboarding' = 'pre-Offboarding';
  currentSortStatusId: number | null = null;
  rowCount = 0;
  statusCounts: { [key: number]: number } = {};
  
  jobNames: any[] = [];

  @ViewChild(TableListComponent) tableListComponent!: TableListComponent;

  onSearchQuery(term: string) {
    this.searchTerm = term;
  }

 
  switchTable(table: 'pre-Offboarding' | 'Offboarding') {
    if (table === 'Offboarding') {
      const invalidJobs = this.jobNames.filter((job: any) =>
        Number(job.Status) === JobStatus.DANG_THUC_HIEN ||
        Number(job.Status) === JobStatus.CHO_DUYET
      );
      if (invalidJobs.length > 0) {
        alert('Không thể chuyển sang Offboarding do có công việc với trạng thái Đang thực hiện hoặc Chờ duyệt: ' +
          invalidJobs.map(j => j.TaskName).join(', '));
        return;
      }
      this.jobNames = this.jobNames.map(job => {
        if (job.Status === JobStatus.CHUA_THUC_HIEN) {
          return { ...job, Status: JobStatus.DANG_THUC_HIEN };
        }
        return job;
      });
    }
    this.currentTable = table;
    this.currentSortStatusId = null;
  }

  onActionBarOpened(opened: boolean) {
    this.isDisabled = opened;
  }

  onStatusCounts(newCounts: { [key: number]: number }) {
    this.statusCounts = newCounts;
  }

  onStatusClicked(statusId: number) {
    this.currentSortStatusId = this.currentSortStatusId === statusId ? null : statusId;
  }

  openAddNewDrawer(): void {
    if (this.tableListComponent) {
      this.tableListComponent.onAddNewJob();
    }
    this.isDisabled = false;
  }

  onShowStoppedChanged(showStopped: boolean): void {
    console.log('Hiển thị trạng thái ngưng:', showStopped);
  }

  onToggleOffboarding(toggleStatus: 'pre-Offboarding' | 'Offboarding'): void {
    console.log('Toggle Offboarding:', toggleStatus);
    this.switchTable(toggleStatus);
  }

  onJobNamesChange(updatedJobs: any[]) {
    this.jobNames = updatedJobs;
  }
}
