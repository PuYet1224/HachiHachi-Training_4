import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { OnboardComponent } from './onboard/onboard.component';
import { InfoOnboardComponent } from './info-onboard/info-onboard.component';
import { JobOverviewComponent } from './job-overview/job-overview.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { Header1Component } from './header1/header1.component';
import { TableListComponent } from './table-list/table-list.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    OnboardComponent,
    InfoOnboardComponent,
    JobOverviewComponent,
    SearchBarComponent,
    Header1Component,
    TableListComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
