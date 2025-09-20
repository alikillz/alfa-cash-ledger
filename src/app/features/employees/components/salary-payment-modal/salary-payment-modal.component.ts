import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BusinessService } from '../../../../core/services/business.service';
import { EmployeeService } from '../../../../core/services/employee.service';
import { PayslipService } from '../../../../core/services/payslip.service';
import { TransactionService } from '../../../../core/services/transaction.service';

@Component({
  selector: 'app-salary-payment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Pay Salary</h2>
          <button class="close-btn" (click)="onClose()">×</button>
        </div>

        <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()" class="payment-form">
          <!-- Employee Selection -->
          <div class="form-section">
            <h3>Employee Information</h3>

            <div class="form-group">
              <label for="employee">Employee *</label>
              <select
                id="employee"
                formControlName="employeeId"
                [class.error]="
                  paymentForm.get('employeeId')?.invalid && paymentForm.get('employeeId')?.touched
                "
              >
                <option value="">Select Employee</option>
                @for (employee of employees(); track employee.id) {
                <option [value]="employee.id">
                  {{ employee.name }} - PKR {{ employee.monthlySalaryAmount | number }}
                </option>
                }
              </select>
              @if (paymentForm.get('employeeId')?.invalid && paymentForm.get('employeeId')?.touched)
              {
              <div class="error-message">Employee selection is required</div>
              }
            </div>

            @if (selectedEmployee()) {
            <div class="employee-details">
              <div class="detail-item">
                <span class="label">Monthly Salary:</span>
                <span class="value"
                  >PKR {{ selectedEmployee()?.monthlySalaryAmount | number }}</span
                >
              </div>
              <div class="detail-item">
                <span class="label">Due Day:</span>
                <span class="value">{{ selectedEmployee()?.salaryDueDay }}th of month</span>
              </div>
            </div>
            }
          </div>

          <!-- Payment Details -->
          <div class="form-section">
            <h3>Payment Details</h3>

            <div class="form-row">
              <div class="form-group">
                <label for="amount">Amount (PKR) *</label>
                <input
                  id="amount"
                  type="number"
                  formControlName="amount"
                  [placeholder]="'Max: PKR ' + (selectedEmployee()?.monthlySalaryAmount | number)"
                  step="0.01"
                  min="0"
                  [max]="selectedEmployee()?.monthlySalaryAmount"
                  [class.error]="
                    paymentForm.get('amount')?.invalid && paymentForm.get('amount')?.touched
                  "
                />
                @if (paymentForm.get('amount')?.invalid && paymentForm.get('amount')?.touched) {
                <div class="error-message">
                  @if (paymentForm.get('amount')?.errors?.['min']) { Amount must be greater than 0 }
                  @if (paymentForm.get('amount')?.errors?.['max']) { Amount cannot exceed monthly
                  salary }
                </div>
                }
              </div>

              <div class="form-group">
                <label for="date">Payment Date *</label>
                <input
                  id="date"
                  type="date"
                  formControlName="date"
                  [class.error]="
                    paymentForm.get('date')?.invalid && paymentForm.get('date')?.touched
                  "
                />
                @if (paymentForm.get('date')?.invalid && paymentForm.get('date')?.touched) {
                <div class="error-message">Date is required</div>
                }
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="period">Salary Period (YYYY-MM) *</label>
                <input
                  id="period"
                  type="month"
                  formControlName="period"
                  [class.error]="
                    paymentForm.get('period')?.invalid && paymentForm.get('period')?.touched
                  "
                />
                @if (paymentForm.get('period')?.invalid && paymentForm.get('period')?.touched) {
                <div class="error-message">Period is required</div>
                }
              </div>

              <div class="form-group">
                <label for="partialPayment">Payment Type</label>
                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input id="partialPayment" type="checkbox" formControlName="partialPayment" />
                    Partial Payment / Advance
                  </label>
                  <span class="checkbox-help">Check if this is not the full salary amount</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="form-section">
            <h3>Additional Information</h3>

            <div class="form-group">
              <label for="notes">Payment Notes</label>
              <textarea
                id="notes"
                formControlName="notes"
                placeholder="Additional notes about this payment..."
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Payslip</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="generatePayslip" />
                  Generate Payslip PDF
                </label>
              </div>
            </div>
          </div>

          <!-- Summary -->
          @if (selectedEmployee() && paymentForm.get('amount')?.value) {
          <div class="payment-summary">
            <h4>Payment Summary</h4>
            <div class="summary-grid">
              <div class="summary-item">
                <span>Employee:</span>
                <span>{{ selectedEmployee()?.name }}</span>
              </div>
              <div class="summary-item">
                <span>Amount:</span>
                <span>PKR {{ paymentForm.get('amount')?.value | number }}</span>
              </div>
              <div class="summary-item">
                <span>Type:</span>
                <span>{{
                  paymentForm.get('partialPayment')?.value ? 'Partial Payment' : 'Full Salary'
                }}</span>
              </div>
              @if (paymentForm.get('partialPayment')?.value) {
              <div class="summary-item warning">
                <span>Remaining:</span>
                <span>PKR {{ getRemainingAmount() | number }}</span>
              </div>
              }
            </div>
          </div>
          }

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" (click)="onClose()" class="btn btn-secondary">Cancel</button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="paymentForm.invalid || isSubmitting"
            >
              @if (isSubmitting) {
              <span>Processing Payment...</span>
              } @else {
              <span>Process Payment</span>
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

      .payment-form {
        padding: 1.5rem;
      }

      .form-section {
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #e2e8f0;

        &:last-of-type {
          border-bottom: none;
          margin-bottom: 0;
        }
      }

      .form-section h3 {
        margin: 0 0 1rem 0;
        color: #2d3748;
        font-size: 1.1rem;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
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

      .employee-details {
        background: #f7fafc;
        padding: 1rem;
        border-radius: 6px;
        margin-top: 1rem;
      }

      .detail-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .detail-item .label {
        font-weight: 600;
        color: #4a5568;
      }

      .detail-item .value {
        color: #2d3748;
      }

      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: normal;
        cursor: pointer;
      }

      .checkbox-help {
        font-size: 0.8rem;
        color: #718096;
        margin-left: 1.5rem;
      }

      .payment-summary {
        background: #e6fffa;
        padding: 1rem;
        border-radius: 6px;
        margin: 1.5rem 0;
        border-left: 4px solid #38b2ac;
      }

      .payment-summary h4 {
        margin: 0 0 1rem 0;
        color: #2d3748;
      }

      .summary-grid {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .summary-item {
        display: flex;
        justify-content: space-between;
        padding: 0.25rem 0;

        &.warning {
          color: #d69e2e;
          font-weight: 600;
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

      @media (max-width: 768px) {
        .form-row {
          grid-template-columns: 1fr;
        }

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
export class SalaryPaymentModalComponent {
  private fb = inject(FormBuilder);
  private businessService = inject(BusinessService);
  private employeeService = inject(EmployeeService);
  private transactionService = inject(TransactionService);
  private payslipService = inject(PayslipService);

  @Output() closed = new EventEmitter<void>();
  @Output() paymentProcessed = new EventEmitter<void>();

  employee = input<any>(); // Optional: Pre-select an employee

  //employees = this.employeeService.getEmployees;
  employees = signal<any[]>([]);

  paymentForm = this.fb.group({
    employeeId: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [new Date(), Validators.required],
    period: [this.getCurrentPeriod(), Validators.required],
    partialPayment: [false],
    notes: [''],
    generatePayslip: [true],
  });

  isSubmitting = false;

  selectedEmployee = signal<any>(null);

  constructor() {
    this.employees.set(this.employeeService.getEmployees());
    if (this.employee()) {
      this.paymentForm.patchValue({
        employeeId: this.employee()?.id,
      });
      const employee = this.employees().find((emp) => emp.id === this.employee()?.id);
      this.selectedEmployee.set(employee);
    }
    // Watch for employee selection changes
    this.paymentForm.get('employeeId')?.valueChanges.subscribe((employeeId) => {
      const employee = this.employees().find((emp) => emp.id === employeeId);
      this.selectedEmployee.set(employee);

      // Set max amount to monthly salary
      if (employee) {
        this.paymentForm
          .get('amount')
          ?.setValidators([
            Validators.required,
            Validators.min(0.01),
            Validators.max(employee.monthlySalaryAmount),
          ]);
        this.paymentForm.get('amount')?.updateValueAndValidity();
      }
    });

    // Pre-select employee if provided
    if (this.employee()) {
      this.paymentForm.patchValue({
        employeeId: this.employee()?.id,
      });
    }
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  onClose(): void {
    this.closed.emit();
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      this.isSubmitting = true;

      const formData = this.paymentForm.value;
      const currentBusiness = this.businessService.getCurrentBusiness();
      const employee = this.selectedEmployee();

      const salaryPayment = {
        businessId: currentBusiness.id,
        employeeId: formData.employeeId!,
        amount: formData.amount!,
        date: formData.date!,
        period: formData.period!,
        partialPayment: formData.partialPayment!,
        notes: formData.notes,
      };

      // Add to transaction service
      this.transactionService.addTransaction({
        ...salaryPayment,
        type: 'SALARY_PAYMENT',
        vendorName: `Salary: ${employee?.name}`,
        category: 'Salary Payment',
        transferReason: 'Salary Payment',
      });

      // TODO: Generate payslip if selected
      if (formData.generatePayslip) {
        console.log('Generating payslip for:', employee?.name);
        const payslipData = {
          employee: employee,
          payment: salaryPayment,
          business: currentBusiness,
          period: formData.period!,
          paymentDate: formData.date!,
          amount: formData.amount!,
          isPartial: formData.partialPayment!,
          notes: formData.notes ?? undefined,
        };

        this.payslipService.generatePayslip(payslipData);
      }

      this.isSubmitting = false;
      this.paymentProcessed.emit();
      this.onClose();
    }
  }

  getRemainingAmount(): number {
    const salary = this.selectedEmployee()?.monthlySalaryAmount || 0;
    const amount = this.paymentForm.get('amount')?.value || 0;
    return salary - amount;
  }
}
