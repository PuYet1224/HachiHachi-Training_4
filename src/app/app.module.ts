import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { StatusColorModule } from './pipes/status-color.module';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { OnboardComponent } from './onboard/onboard.component';
import { InfoOnboardComponent } from './info-onboard/info-onboard.component';
import { JobOverviewComponent } from './job-overview/job-overview.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { Header1Component } from './header1/header1.component';
import { TableListComponent } from './table-list/table-list.component';
import { PopupActionComponent } from './popup-action/popup-action.component';
import { OverdueDaysColorPipe } from './pipes/overdue-days-color.pipe';

import { MenuService } from './services/menu.service';
import { JobStatusService } from './services/job-status.service';
import { JobIconService } from './services/job-icon.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PopupComfirmComponent } from './popup-comfirm/popup-comfirm.component';
import { DrawerDetailComponent } from './drawer-detail/drawer-detail.component';

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
    PopupActionComponent,
    PopupComfirmComponent,
    DrawerDetailComponent,
    OverdueDaysColorPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    StatusColorModule,
    HttpClientModule,
    BrowserAnimationsModule,
  ],
  providers: [
    MenuService,
    JobStatusService,
    JobIconService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }