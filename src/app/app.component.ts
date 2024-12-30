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
  rowsPerPage = 25;
  rowCount = 0;
  currentPage = 1;
  currentSortStatusId: number | null = null;

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

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onItemsPerPageChange(newRowsPerPage: number) {
    this.rowsPerPage = newRowsPerPage;
    this.currentPage = 1;
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
