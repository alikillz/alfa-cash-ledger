import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../core/components/header/header.component';
import { Transaction } from '../../core/models/transaction.model';
import { AuthService } from '../../core/services/Supabase/auth.service';
import { TransactionService } from '../../core/services/transaction.service';
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
    HeaderComponent,
  ],
  template: `
    <app-header></app-header>
    <div class="dashboard-container">
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
  todaysExpenses: number = 0;
  mtdExpenses: number = 0;
  salaryPayments: Transaction[] = [];

  // Transactions for selected business
  transactions: Transaction[] = [];

  constructor(private authService: AuthService, private transactionService: TransactionService) {
    this.currentUser = this.authService.currentUser; // ← Set in constructor
  }

  ngOnInit() {
    // console.log('Dashboard loaded for user:', this.currentUser);
    const initialTransactions: Transaction[] = []; // replace with API response
    console.log('start');
    this.transactionService.loadAllTransactions(initialTransactions);

    // 2️⃣ Subscribe to KPI observables
    this.transactionService.todaysExpenses$.subscribe((val) => (this.todaysExpenses = val));
    this.transactionService.mtdExpenses$.subscribe((val) => (this.mtdExpenses = val));
    this.transactionService.salaryPayments$.subscribe((val) => (this.salaryPayments = val));

    // 3️⃣ Subscribe to transactions by business (filtered by current business)
    this.transactionService.transactionsByBusiness$.subscribe((map) => {
      const currentBusinessId = this.transactionService['businessService'].getCurrentBusiness()?.id;
      this.transactions = map.get(currentBusinessId ?? '') ?? [];
    });
  }

  logout() {
    this.authService.signOut();
  }
}
