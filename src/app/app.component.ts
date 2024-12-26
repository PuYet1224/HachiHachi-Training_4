// src/app/app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  searchTerm = '';
  currentTable: 'pre-offboard' | 'offboarding' = 'pre-offboard';

  onSearchQuery(term: string) {
    this.searchTerm = term;
  }

  switchTable(table: 'pre-offboard' | 'offboarding') {
    this.currentTable = table;
  }
}
