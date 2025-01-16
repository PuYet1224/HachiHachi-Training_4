import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  @Output() searchQuery = new EventEmitter<string>();
  @Output() addNewClicked = new EventEmitter<void>();
  @Output() showStoppedChanged = new EventEmitter<boolean>();

  @Input() disabled: boolean = false;
  @Input() tableType: 'pre-Offboarding' | 'Offboarding' = 'pre-Offboarding';
  
  searchTerm: string = '';
  showStopped: boolean = true;

  onSearchClick(): void {
    this.searchQuery.emit(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchQuery.emit(this.searchTerm);
  }

  onAddNewClick(): void {
    this.addNewClicked.emit();
  }

  onShowStoppedChange(): void {
    this.showStoppedChanged.emit(this.showStopped);
  }
}
