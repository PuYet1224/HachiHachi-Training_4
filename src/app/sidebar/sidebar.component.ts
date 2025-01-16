import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuService } from '../services/menu.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  isEvaluationOpen = false;       
  isEvaluationSubmenuOpen = false;     
  selectedEvaluation: string | null = null; 
  private subscription: Subscription = new Subscription();

  constructor(private menuService: MenuService) {} 

  ngOnInit() {
    this.subscription.add(
      this.menuService.selectedMainMenu$.subscribe((menu: string | null) => {
        if (menu !== 'nhanSu') {
          this.isEvaluationOpen = false;
          this.isEvaluationSubmenuOpen = false;
          this.selectedEvaluation = null;
          return;
        }

        // Optionally toggle based on some condition or keep it open
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  toggleEvaluation() {
    this.isEvaluationOpen = !this.isEvaluationOpen;
    if (!this.isEvaluationOpen) {
      this.isEvaluationSubmenuOpen = false;
      this.selectedEvaluation = null;
      this.menuService.selectSubMenu(null);
    }
  }

  toggleEvaluationSubmenu() {
    this.isEvaluationSubmenuOpen = !this.isEvaluationSubmenuOpen;
    if (!this.isEvaluationSubmenuOpen) {
      this.selectedEvaluation = null;
      this.menuService.selectSubMenu(null); 
    }
  }

  selectEvaluation(evaluation: string) {
    this.selectedEvaluation = evaluation;
    this.menuService.selectSubMenu(evaluation); 
  }
}
