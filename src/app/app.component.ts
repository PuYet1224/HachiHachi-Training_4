import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = '3PSolution';
  isDisabled: boolean = false;
  searchTerm: string = '';
  currentTable: 'pre-onboarding' | 'onboarding' = 'pre-onboarding';
  rowsPerPage: number = 25;
  rowCount: number = 0;
  currentPage: number = 1;
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
