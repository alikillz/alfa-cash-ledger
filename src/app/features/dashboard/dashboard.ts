import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfigService } from '../../core/services/app-config.service';
import { AuthService } from '../../core/services/auth.service';
import { BusinessSwitcherComponent } from './components/business-switcher/business-switcher.component';
import { KpiCardsComponent } from './components/kpi-cards/kpi-cards.component';
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BusinessSwitcherComponent,
    KpiCardsComponent,
    QuickActionsComponent,
    TransactionListComponent,
  ],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>ALFA Dashboard</h1>
        <div class="user-info">
          <span>Welcome, {{ currentUser?.name }} ({{ currentUser?.role }})</span>
          <button (click)="logout()" class="logout-btn">Logout</button>
        </div>
      </header>

      <app-business-switcher></app-business-switcher>

      <app-kpi-cards></app-kpi-cards>
      <!-- Add KPI Cards -->

      <app-quick-actions></app-quick-actions>
      <!-- Add this -->
      <!-- Transaction List -->
      <app-transaction-list></app-transaction-list>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #eee;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .logout-btn {
        padding: 0.5rem 1rem;
        background: #d32f2f;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .kpi-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .kpi-card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .amount {
        font-size: 1.5rem;
        font-weight: bold;
        color: #1976d2;
        margin: 0.5rem 0 0 0;
      }

      .quick-actions {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .action-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
      }

      .action-btn {
        padding: 1rem;
        background: #1976d2;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
      }
    `,
  ],
})
export class Dashboard implements OnInit {
  currentUser: any;

  constructor(
    private authService: AuthService,
    private configService: AppConfigService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUser; // ← Set in constructor
  }

  ngOnInit() {
    // console.log('Dashboard loaded for user:', this.currentUser);
  }

  logout() {
    this.authService.logout();
  }
}
