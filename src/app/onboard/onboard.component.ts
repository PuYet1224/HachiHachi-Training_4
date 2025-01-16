import { Component, Output, EventEmitter, Input } from '@angular/core';
import { JobStatus } from '../enum/job-status.enum';

@Component({
  selector: 'app-onboard',
  templateUrl: './onboard.component.html',
  styleUrls: ['./onboard.component.scss']
})
export class OnboardComponent {
  @Output() toggleOffboarding = new EventEmitter<'pre-Offboarding' | 'Offboarding'>();
  @Input() disabled: boolean = false;
  @Input() jobNames: any[] = [];

  isOffboarding: boolean = false;

  onToggleClick() {
    if (this.disabled) return;

    const invalidJobs = this.getInvalidJobsForOffboarding();
    if (invalidJobs.length > 0) {
      alert(
        'Không thể Offboarded do còn các trạng thái công việc đang thực hiện hoặc chờ duyệt: ' +
        invalidJobs.map(job => job.TaskName).join(', ')
      );
      return;
    }

    this.isOffboarding = !this.isOffboarding;
    this.toggleOffboarding.emit(this.isOffboarding ? 'Offboarding' : 'pre-Offboarding');
  }

  getInvalidJobsForOffboarding() {
    return this.jobNames.filter((job: any) =>
      Number(job.Status) === JobStatus.DANG_THUC_HIEN ||
      Number(job.Status) === JobStatus.CHO_DUYET
    );
  }
}
