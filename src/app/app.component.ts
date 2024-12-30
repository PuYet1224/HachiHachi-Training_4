import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  searchTerm = '';

  onSearchQuery(term: string) {
    this.searchTerm = term;
  }
}
