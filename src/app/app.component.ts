import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = '3PSolution'
  isDisabled: boolean = false;
  searchTerm: string = '';
  currentTable: 'pre-onboarding' | 'onboarding' = 'pre-onboarding';
  rowsPerPage: number = 25;
  rowCount: number = 0;
  currentPage: number = 1;

  onSearchQuery(term: string) {
    this.searchTerm = term;
  }

  switchTable(table: 'pre-onboarding' | 'onboarding') {
    this.currentTable = table;
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
}
