import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from '../../../../core/services/modal.service';
import { AuthService } from '../../../../core/services/Supabase/auth.service';
import { ExpenseModalComponent } from '../expense-modal/expense-modal.component';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        <!-- Add Expense - For Managers & Owners -->
        <button
          class="action-btn"
          (click)="onAddExpense()"
          [class.disabled]="!canPerformAction('expense')"
        >
          <span class="icon">💸</span>
          <span class="label">Add Expense</span>
        </button>

        <!-- Add Top-Up - Owners Only -->
        <button
          class="action-btn"
          (click)="onAddTopUp()"
          [class.disabled]="!canPerformAction('topup')"
        >
          <span class="icon">💰</span>
          <span class="label">Top-Up</span>
        </button>

        <!-- Pay Salary - Both Roles -->
        <button
          class="action-btn"
          (click)="onPaySalary()"
          [class.disabled]="!canPerformAction('salary')"
        >
          <span class="icon">💵</span>
          <span class="label">Pay Salary</span>
        </button>

        <!-- Reconcile - Both Roles -->
        <button
          class="action-btn"
          (click)="onReconcile()"
          [class.disabled]="!canPerformAction('reconcile')"
        >
          <span class="icon">📊</span>
          <span class="label">Reconcile</span>
        </button>

        <!-- View Reports - Both Roles -->
        <button class="action-btn" (click)="onViewReports()">
          <span class="icon">📈</span>
          <span class="label">View Reports</span>
        </button>

        <!-- Manage Employees - Owners Only -->
        <button
          class="action-btn"
          (click)="router.navigate(['/employees'])"
          [class.disabled]="!canPerformAction('employees')"
        >
          <span class="icon">👥</span>
          <span class="label">Manage Employees</span>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .quick-actions {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
      }

      h2 {
        margin: 0 0 1.5rem 0;
        color: #2c3e50;
        font-size: 1.5rem;
        font-weight: 600;
      }

      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }

      .action-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1.5rem 1rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        min-height: 100px;

        &:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
        }

        &:active:not(.disabled) {
          transform: translateY(0);
        }

        &.disabled {
          background: #e2e8f0;
          color: #a0aec0;
          cursor: not-allowed;
          opacity: 0.6;
        }
      }

      .icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }

      .label {
        font-weight: 600;
        font-size: 0.9rem;
        text-align: center;
      }

      @media (max-width: 768px) {
        .actions-grid {
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }

        .action-btn {
          min-height: 80px;
          padding: 1rem 0.5rem;
        }

        .icon {
          font-size: 1.5rem;
        }

        .label {
          font-size: 0.8rem;
        }
      }
    `,
  ],
})
export class QuickActionsComponent {
  private authService = inject(AuthService);
  public router = inject(Router);
  private modal = inject(ModalService);
  showExpenseModal = false;
  showTopupModal = false;

  onExpenseAdded(): void {
    console.log('Expense added successfully!');
  }

  onTopupAdded(): void {
    // ← Add this
    console.log('Top-up added successfully!');
    this.showTopupModal = false;
  }

  // Role-based action permissions
  canPerformAction(action: string): boolean {
    const user = this.authService.currentUser;
    if (!user) return false;

    switch (action) {
      case 'expense':
        return true; // Both roles can add expenses
      case 'topup':
        return user.role === 'owner'; // Only owners
      case 'salary':
        return true; // Both roles
      case 'reconcile':
        return true; // Both roles
      case 'employees':
        return user.role === 'owner'; // Only owners
      default:
        return false;
    }
  }

  // Action handlers
  onAddExpense(): void {
    //if (this.canPerformAction('expense')) {
    const { closed$ } = this.modal.open(ExpenseModalComponent);
    //}
  }

  onAddTopUp(): void {
    if (this.canPerformAction('topup')) {
      console.log('Opening Add Top-Up form...');
      this.showTopupModal = true;
    }
  }

  onPaySalary(): void {
    if (this.canPerformAction('salary')) {
      console.log('Opening Pay Salary form...');
    }
  }

  onReconcile(): void {
    if (this.canPerformAction('reconcile')) {
      console.log('Starting Reconciliation...');
    }
  }

  onViewReports(): void {
    console.log('Opening Reports...');
  }

  onManageEmployees(): void {
    if (this.canPerformAction('employees')) {
      console.log('Opening Employee Management...');
    }
  }
}
