import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BusinessService } from '../../../../core/services/business.service';
import { TransactionService } from '../../../../core/services/transaction.service';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-cards">
      <!-- Current Balance Card -->
      <div class="kpi-card" [class.low-balance]="isLowBalance">
        <div class="card-icon">💰</div>
        <div class="card-content">
          <h3>Current Balance</h3>
          <p class="amount">PKR {{ currentBalance | number }}</p>
          <span class="subtext">Initial: PKR {{ initialBalance | number }}</span>
        </div>
      </div>

      <!-- Today's Spend Card -->
      <div class="kpi-card">
        <div class="card-icon">📅</div>
        <div class="card-content">
          <h3>Today's Spend</h3>
          <p class="amount">PKR {{ todaysSpend | number }}</p>
          <span class="subtext">{{ today | date : 'mediumDate' }}</span>
        </div>
      </div>

      <!-- MTD Spend Card -->
      <div class="kpi-card">
        <div class="card-icon">📊</div>
        <div class="card-content">
          <h3>MTD Spend</h3>
          <p class="amount">PKR {{ mtdSpend | number }}</p>
          <span class="subtext">Month to Date</span>
        </div>
      </div>

      <!-- Low Balance Warning Card -->
      <div class="kpi-card warning" *ngIf="isLowBalance">
        <div class="card-icon">⚠️</div>
        <div class="card-content">
          <h3>Low Balance Alert</h3>
          <p class="amount">Below PKR {{ lowBalanceThreshold | number }}</p>
          <span class="subtext">Add funds soon</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .kpi-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .kpi-card {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 1rem;
        border-left: 4px solid #1976d2;

        &.low-balance {
          border-left-color: #dc3545;
          background: #fff5f5;
        }

        &.warning {
          border-left-color: #ffc107;
          background: #fffaf0;
        }
      }

      .card-icon {
        font-size: 2rem;
        width: 50px;
        text-align: center;
      }

      .card-content {
        flex: 1;
      }

      h3 {
        margin: 0 0 0.5rem 0;
        color: #495057;
        font-size: 0.9rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .amount {
        margin: 0;
        font-size: 1.5rem;
        font-weight: bold;
        color: #1976d2;
      }

      .kpi-card.low-balance .amount {
        color: #dc3545;
      }

      .subtext {
        font-size: 0.8rem;
        color: #6c757d;
        margin-top: 0.25rem;
        display: block;
      }
    `,
  ],
})
export class KpiCardsComponent implements OnInit {
  private businessService = inject(BusinessService);
  private transactionService = inject(TransactionService);

  currentBalance = 0;
  initialBalance = 0;
  lowBalanceThreshold = 0;
  todaysSpend = 0;
  mtdSpend = 0;
  today = new Date();

  ngOnInit() {
    this.updateKPIs();

    // Subscribe to business changes
    this.businessService.currentBusiness$.subscribe(() => {
      this.updateKPIs();
    });
  }

  get isLowBalance(): boolean {
    return this.currentBalance <= this.lowBalanceThreshold;
  }

  private updateKPIs(): void {
    const currentBusiness = this.businessService.getCurrentBusiness();
    this.currentBalance = currentBusiness.currentBalance;
    this.initialBalance = currentBusiness.initialBalance;
    this.lowBalanceThreshold = currentBusiness.lowBalanceThreshold;
    this.todaysSpend = this.transactionService.getTodaysExpenses();
    this.mtdSpend = this.transactionService.getMTDExpenses();
  }
}
