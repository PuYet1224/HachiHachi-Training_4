import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-onboard',
  templateUrl: './info-onboard.component.html',
  styleUrls: ['./info-onboard.component.scss']
})
export class InfoOnboardComponent {
  @Input() isOffboarding: boolean = false;
  @Input() disabled: boolean = false;
}
