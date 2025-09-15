import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TopUp } from '../../../../core/models/transaction.model';
import { BusinessService } from '../../../../core/services/business.service';
import { TransactionService } from '../../../../core/services/transaction.service';

@Component({
  selector: 'app-topup-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Add Cash Top-Up</h2>
          <button class="close-btn" (click)="onClose()">×</button>
        </div>

        <form [formGroup]="topupForm" (ngSubmit)="onSubmit()" class="topup-form">
          <!-- Amount -->
          <div class="form-group">
            <label for="amount">Amount (PKR) *</label>
            <input
              id="amount"
              type="number"
              formControlName="amount"
              placeholder="Enter amount"
              step="0.01"
              min="0"
              [class.error]="topupForm.get('amount')?.invalid && topupForm.get('amount')?.touched"
            />
            @if (topupForm.get('amount')?.invalid && topupForm.get('amount')?.touched) {
            <div class="error-message">Valid amount is required</div>
            }
          </div>

          <!-- Date -->
          <div class="form-group">
            <label for="date">Date *</label>
            <input
              id="date"
              type="date"
              formControlName="date"
              [class.error]="topupForm.get('date')?.invalid && topupForm.get('date')?.touched"
            />
            @if (topupForm.get('date')?.invalid && topupForm.get('date')?.touched) {
            <div class="error-message">Date is required</div>
            }
          </div>

          <!-- Handed To -->
          <div class="form-group">
            <label for="handedTo">Handed To (Manager) *</label>
            <input
              id="handedTo"
              type="text"
              formControlName="handedTo"
              placeholder="Manager's name"
              [class.error]="
                topupForm.get('handedTo')?.invalid && topupForm.get('handedTo')?.touched
              "
            />
            @if (topupForm.get('handedTo')?.invalid && topupForm.get('handedTo')?.touched) {
            <div class="error-message">Manager name is required</div>
            }
          </div>

          <!-- Payment Method -->
          <div class="form-group">
            <label for="method">Payment Method *</label>
            <select
              id="method"
              formControlName="method"
              [class.error]="topupForm.get('method')?.invalid && topupForm.get('method')?.touched"
            >
              <option value="">Select method</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
            @if (topupForm.get('method')?.invalid && topupForm.get('method')?.touched) {
            <div class="error-message">Method is required</div>
            }
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label for="notes">Notes</label>
            <textarea
              id="notes"
              formControlName="notes"
              placeholder="Additional notes..."
              rows="3"
            ></textarea>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" (click)="onClose()" class="btn btn-secondary">Cancel</button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="topupForm.invalid || isSubmitting"
            >
              @if (isSubmitting) {
              <span>Adding Top-Up...</span>
              } @else {
              <span>Add Top-Up</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
      }

      .modal-content {
        background: white;
        border-radius: 12px;
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e2e8f0;
      }

      .modal-header h2 {
        margin: 0;
        color: #2d3748;
        font-size: 1.5rem;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #718096;
        padding: 0;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: #f7fafc;
          color: #4a5568;
        }
      }

      .topup-form {
        padding: 1.5rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #4a5568;
      }

      input,
      select,
      textarea {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #e2e8f0;
        border-radius: 6px;
        font-size: 1rem;
        transition: border-color 0.2s;

        &:focus {
          outline: none;
          border-color: #38a169;
          box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.1);
        }

        &.error {
          border-color: #e53e3e;
        }
      }

      .error-message {
        color: #e53e3e;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e2e8f0;
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .btn-primary {
        background: #38a169;
        color: white;

        &:hover:not(:disabled) {
          background: #2f855a;
        }
      }

      .btn-secondary {
        background: #e2e8f0;
        color: #4a5568;

        &:hover {
          background: #cbd5e0;
        }
      }

      @media (max-width: 640px) {
        .modal-content {
          margin: 0;
          border-radius: 0;
          max-height: 100vh;
        }

        .form-actions {
          flex-direction: column;
        }

        .btn {
          width: 100%;
        }
      }
    `,
  ],
})
export class TopupModalComponent {
  private fb = inject(FormBuilder);
  private businessService = inject(BusinessService);
  private transactionService = inject(TransactionService);

  @Output() closed = new EventEmitter<void>();
  @Output() topupAdded = new EventEmitter<void>();

  topupForm = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [new Date(), Validators.required],
    handedTo: ['', Validators.required],
    method: ['', Validators.required],
    notes: [''],
  });

  isSubmitting = false;

  onClose(): void {
    this.closed.emit();
  }

  onSubmit(): void {
    if (this.topupForm.valid) {
      this.isSubmitting = true;

      const formData = this.topupForm.value;
      const currentBusiness = this.businessService.getCurrentBusiness();

      const topup: TopUp = {
        businessId: currentBusiness.id,
        amount: formData.amount!,
        date: formData.date!,
        handedTo: formData.handedTo!,
        method: formData.method! as 'cash' | 'bank' | 'other',
        notes: formData.notes ?? undefined,
      };

      // Add to transaction service
      this.transactionService.addTransaction({
        ...topup,
        type: 'TOP_UP',
        vendorName: `Cash to ${formData.handedTo}`,
      });

      this.isSubmitting = false;
      this.topupAdded.emit();
      this.onClose();
    }
  }
}
