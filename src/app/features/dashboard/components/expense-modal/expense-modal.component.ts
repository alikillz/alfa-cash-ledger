import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Expense } from '../../../../core/models/transaction.model';
import { BusinessService } from '../../../../core/services/business.service';
import { TransactionService } from '../../../../core/services/transaction.service';

@Component({
  selector: 'app-expense-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Add New Expense</h2>
          <button class="close-btn" (click)="onClose()">×</button>
        </div>

        <form [formGroup]="expenseForm" (ngSubmit)="onSubmit()" class="expense-form">
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
              [class.error]="
                expenseForm.get('amount')?.invalid && expenseForm.get('amount')?.touched
              "
            />
            @if (expenseForm.get('amount')?.invalid && expenseForm.get('amount')?.touched) {
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
              [class.error]="expenseForm.get('date')?.invalid && expenseForm.get('date')?.touched"
            />
            @if (expenseForm.get('date')?.invalid && expenseForm.get('date')?.touched) {
            <div class="error-message">Date is required</div>
            }
          </div>

          <!-- Category -->
          <div class="form-group">
            <label for="category">Category *</label>
            <select
              id="category"
              formControlName="category"
              [class.error]="
                expenseForm.get('category')?.invalid && expenseForm.get('category')?.touched
              "
            >
              <option value="">Select category</option>
              <option value="Fuel">Fuel</option>
              <option value="Utilities">Utilities</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Supplies">Supplies</option>
              <option value="Rent">Rent</option>
              <option value="Other">Other</option>
            </select>
            @if (expenseForm.get('category')?.invalid && expenseForm.get('category')?.touched) {
            <div class="error-message">Category is required</div>
            }
          </div>

          <!-- Vendor -->
          <div class="form-group">
            <label for="vendorName">Vendor *</label>
            <input
              id="vendorName"
              type="text"
              formControlName="vendorName"
              placeholder="Vendor name"
              [class.error]="
                expenseForm.get('vendorName')?.invalid && expenseForm.get('vendorName')?.touched
              "
            />
            @if (expenseForm.get('vendorName')?.invalid && expenseForm.get('vendorName')?.touched) {
            <div class="error-message">Vendor name is required</div>
            }
          </div>

          <!-- Product -->
          <div class="form-group">
            <label for="productName">Product/Description</label>
            <input
              id="productName"
              type="text"
              formControlName="productName"
              placeholder="What was purchased?"
            />
          </div>

          <!-- Quantity -->
          <div class="form-group">
            <label for="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              formControlName="quantity"
              placeholder="Qty"
              step="1"
              min="1"
            />
          </div>

          <!-- Location -->
          <div class="form-group">
            <label for="location">Location</label>
            <input
              id="location"
              type="text"
              formControlName="location"
              placeholder="Where was this expense made?"
            />
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

          <!-- Receipt Upload -->
          <div class="form-group">
            <label for="receipt">Receipt Image (Optional)</label>
            <input
              id="receipt"
              type="file"
              (change)="onFileSelected($event)"
              accept="image/*, .pdf"
              class="file-input"
            />
            @if (selectedFile) {
            <div class="file-info">
              Selected: {{ selectedFile.name }}
              <button type="button" (click)="removeFile()" class="remove-file">Remove</button>
            </div>
            }
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" (click)="onClose()" class="btn btn-secondary">Cancel</button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="expenseForm.invalid || isSubmitting"
            >
              @if (isSubmitting) {
              <span>Adding Expense...</span>
              } @else {
              <span>Add Expense</span>
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
        max-width: 600px;
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

      .expense-form {
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
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }

        &.error {
          border-color: #e53e3e;
        }
      }

      .file-input {
        padding: 0.5rem;
      }

      .file-info {
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: #f7fafc;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .remove-file {
        background: #e53e3e;
        color: white;
        border: none;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8rem;
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
        background: #4299e1;
        color: white;

        &:hover:not(:disabled) {
          background: #3182ce;
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
export class ExpenseModalComponent {
  private fb = inject(FormBuilder);
  private businessService = inject(BusinessService);
  private transactionService = inject(TransactionService);

  @Output() closed = new EventEmitter<void>();
  @Output() expenseAdded = new EventEmitter<void>();

  expenseForm = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [new Date(), Validators.required],
    category: ['', Validators.required],
    vendorName: ['', Validators.required],
    productName: [''],
    quantity: [1],
    taxAmount: [0],
    location: [''],
    notes: [''],
  });

  selectedFile: File | null = null;
  isSubmitting = false;

  onClose(): void {
    this.closed.emit();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Here you would add OCR processing later
      // console.log('File selected for OCR:', file.name);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    // Reset file input
    const fileInput = document.getElementById('receipt') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      this.isSubmitting = true;

      const formData = this.expenseForm.value;
      const currentBusiness = this.businessService.getCurrentBusiness();

      const expense: Expense = {
        businessId: currentBusiness.id,
        amount: formData.amount!,
        date: formData.date!,
        category: formData.category!,
        vendorName: formData.vendorName!,
        productName: formData.productName ?? undefined,
        quantity: formData.quantity ?? undefined,
        taxAmount: formData.taxAmount ?? undefined,
        location: formData.location ?? undefined,
        notes: formData.notes ?? undefined,
        receiptImage: this.selectedFile?.name,
      };

      // Add to transaction service
      this.transactionService.addTransaction({
        ...expense,
        type: 'EXPENSE',
      });

      this.isSubmitting = false;
      this.expenseAdded.emit();
      this.onClose();
    }
  }
}
