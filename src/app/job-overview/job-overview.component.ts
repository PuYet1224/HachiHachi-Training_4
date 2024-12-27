import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-job-overview',
  templateUrl: './job-overview.component.html',
  styleUrls: ['./job-overview.component.scss']
})
export class JobOverviewComponent {
  @Input() disabled: boolean = false;
}
