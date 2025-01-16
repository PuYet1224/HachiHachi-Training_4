import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MOCK_JOB_NAMES } from '../data/mock-data'; 
import { JobStatus } from '../enum/job-status.enum';

@Component({
  selector: 'app-job-overview',
  templateUrl: './job-overview.component.html',
  styleUrls: ['./job-overview.component.scss']
})
export class JobOverviewComponent implements OnInit, OnChanges {
  @Input() disabled = false;
  @Input() tableType: 'pre-Offboarding' | 'Offboarding' = 'pre-Offboarding';
  @Input() statusCounts: { [key: number]: number } = {};
  @Output() statusClicked = new EventEmitter<number>();

  ngOnInit(): void {
    this.calculateStatusCounts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableType']) {
      this.calculateStatusCounts();
    }
  }

  refresh(): void {
    this.calculateStatusCounts();
  }

  private calculateStatusCounts(): void {
    const counts: { [key: number]: number } = {};
    MOCK_JOB_NAMES.forEach(job => {
      if (job.Status !== JobStatus.CHUA_THUC_HIEN && job.Status !== JobStatus.KHONG_THUC_HIEN) {
        return;
      }
      counts[job.Status] = (counts[job.Status] || 0) + 1;
    });
    this.statusCounts = counts;
  }

  onStatusClick(statusId: number): void {
    this.statusClicked.emit(statusId);
  }
}
