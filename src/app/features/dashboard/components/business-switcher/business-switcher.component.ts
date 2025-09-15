import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { BusinessService } from '../../../../core/services/business.service';

@Component({
  selector: 'app-business-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="business-switcher">
      <label for="business-select">Business: </label>
      <select
        id="business-select"
        [ngModel]="currentBusiness.id"
        (ngModelChange)="onBusinessChange($event)"
        [disabled]="isManagerWithSingleBusiness"
        class="business-select"
      >
        <option *ngFor="let business of availableBusinesses" [value]="business.id">
          {{ business.name }} (PKR {{ business.currentBalance | number }})
        </option>
      </select>

      <div class="business-info" *ngIf="currentBusiness">
        <span class="balance" [class.low-balance]="isLowBalance">
          PKR {{ currentBusiness.currentBalance | number }}
        </span>
        <span class="timezone">({{ currentBusiness.timezone }})</span>
      </div>
    </div>
  `,
  styles: [
    `
      .business-switcher {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        margin-bottom: 1rem;
      }

      label {
        font-weight: 600;
        color: #495057;
      }

      .business-select {
        padding: 0.5rem;
        border: 1px solid #ced4da;
        border-radius: 4px;
        background: white;
        min-width: 200px;

        &:disabled {
          background: #e9ecef;
          cursor: not-allowed;
        }
      }

      .business-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-left: auto;
      }

      .balance {
        font-weight: 600;
        color: #28a745;
        padding: 0.25rem 0.5rem;
        background: white;
        border-radius: 4px;
        border: 1px solid #dee2e6;

        &.low-balance {
          color: #dc3545;
          background: #fff5f5;
        }
      }

      .timezone {
        font-size: 0.875rem;
        color: #6c757d;
      }
    `,
  ],
})
export class BusinessSwitcherComponent {
  private businessService = inject(BusinessService);
  private authService = inject(AuthService);

  availableBusinesses = this.businessService.getBusinesses();
  currentBusiness = this.businessService.getCurrentBusiness();

  get isManagerWithSingleBusiness(): boolean {
    const user = this.authService.currentUser;
    return user?.role === 'manager' && this.availableBusinesses.length === 1;
  }

  get isLowBalance(): boolean {
    return this.currentBusiness.currentBalance <= this.currentBusiness.lowBalanceThreshold;
  }

  onBusinessChange(businessId: string): void {
    const success = this.businessService.setCurrentBusiness(businessId);
    if (success) {
      this.currentBusiness = this.businessService.getCurrentBusiness();
      // Emit event or refresh dashboard data here
      // console.log('Business changed to:', this.currentBusiness.name);
    }
  }
}
