import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-onboard',
  templateUrl: './onboard.component.html',
  styleUrls: ['./onboard.component.scss']
})
export class OnboardComponent {
  @Output() toggleOffboarding = new EventEmitter<'pre-Offboarding' | 'Offboarding'>();
  @Input() disabled: boolean = false;
  isOffboarding: boolean = false;

  onToggleClick() {
    if (this.disabled) return;
    this.isOffboarding = !this.isOffboarding;
    this.toggleOffboarding.emit(this.isOffboarding ? 'Offboarding' : 'pre-Offboarding');
  }
}
