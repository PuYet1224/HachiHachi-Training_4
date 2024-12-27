import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = '3PSolutions';
  searchTerm = '';
  currentTable: 'pre-onboarding' | 'onboarding' = 'pre-onboarding';

  onSearchQuery(term: string) {
    this.searchTerm = term;
  }

  switchTable(table: 'pre-onboarding' | 'onboarding') {
    this.currentTable = table;
  }
}
