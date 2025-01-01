import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MOCK_JOB_NAMES } from '../data/mock-data';

@Component({
  selector: 'app-job-overview',
  templateUrl: './job-overview.component.html',
  styleUrls: ['./job-overview.component.scss']
})
export class JobOverviewComponent implements OnInit, OnChanges {
  @Input() disabled: boolean = false;
  @Input() tableType: 'pre-Offboarding' | 'Offboarding' = 'pre-Offboarding';
  @Output() statusClicked = new EventEmitter<number>();
  @Input() statusCounts: { [key: number]: number } = {};

  ngOnInit(): void {
    this.calculateStatusCounts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableType']) {
      this.calculateStatusCounts();
    }
  }

  calculateStatusCounts(): void {
    this.statusCounts = {};
    MOCK_JOB_NAMES.forEach(job => {
      if (this.tableType === 'pre-Offboarding') {
        if (![1, 2].includes(job.Status)) return;
      } else {
        if (![1, 2, 3, 4, 5, 6].includes(job.Status)) return;
      }
      this.statusCounts[job.Status] = (this.statusCounts[job.Status] || 0) + 1;
    });
  }

  onStatusClick(statusId: number): void {
    this.statusClicked.emit(statusId);
  }
}
