import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = '3PSolution';
  isDisabled = false;
  searchTerm = '';
  currentTable: 'pre-onboarding' | 'onboarding' = 'pre-onboarding';
  currentSortStatusId: number | null = null;
  rowCount = 0;

  onSearchQuery(term: string) {
    this.searchTerm = term;
  }

  switchTable(table: 'pre-onboarding' | 'onboarding') {
    this.currentTable = table;
    this.currentSortStatusId = null;
  }

  onActionBarOpened(opened: boolean) {
    this.isDisabled = opened;
  }

  onStatusCounts(counts: { [key: number]: number }) {
  }

  onStatusClicked(statusId: number) {
    if (this.currentSortStatusId === statusId) {
      this.currentSortStatusId = null;
    } else {
      this.currentSortStatusId = statusId;
    }
  }
}
