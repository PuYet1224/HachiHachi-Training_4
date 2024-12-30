import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  @Output() searchQuery = new EventEmitter<string>();
  @Input() disabled: boolean = false;
  searchTerm: string = '';

  onSearchChange() {
    this.searchQuery.emit(this.searchTerm);
  }

  onSearchClick() {
    this.searchQuery.emit(this.searchTerm);
  }
}
