import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-onboard',
  templateUrl: './onboard.component.html',
  styleUrls: ['./onboard.component.scss']
})
export class OnboardComponent {
  @Output() toggleOnboarding = new EventEmitter<'pre-onboarding' | 'onboarding'>();
  @Input() disabled: boolean = false;
  isOnboarding: boolean = false;

  onToggleClick() {
    this.isOnboarding = !this.isOnboarding;
    this.toggleOnboarding.emit(this.isOnboarding ? 'onboarding' : 'pre-onboarding');
  }
}
