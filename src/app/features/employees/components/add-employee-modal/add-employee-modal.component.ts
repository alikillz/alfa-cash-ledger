import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee } from '../../../../core/models/empolyee.model';
import { BusinessService } from '../../../../core/services/business.service';
import { EmployeeService } from '../../../../core/services/employee.service';

@Component({
  selector: 'app-add-employee-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Add New Employee</h2>
          <button class="close-btn" (click)="onClose()">×</button>
        </div>

        <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()" class="employee-form">
          <!-- Basic Information -->
          <div class="form-section">
            <h3>Basic Information</h3>

            <div class="form-row">
              <div class="form-group">
                <label for="name">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  formControlName="name"
                  placeholder="Enter full name"
                  [class.error]="
                    employeeForm.get('name')?.invalid && employeeForm.get('name')?.touched
                  "
                />
                @if (employeeForm.get('name')?.invalid && employeeForm.get('name')?.touched) {
                <div class="error-message">Name is required</div>
                }
              </div>

              <div class="form-group">
                <label for="title">Job Title</label>
                <input
                  id="title"
                  type="text"
                  formControlName="title"
                  placeholder="e.g., Manager, Accountant"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input id="phone" type="tel" formControlName="phone" placeholder="+92XXXXXXXXXX" />
              </div>

              <div class="form-group">
                <label for="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="employee@email.com"
                />
              </div>
            </div>
          </div>

          <!-- Salary Information -->
          <div class="form-section">
            <h3>Salary Information</h3>

            <div class="form-row">
              <div class="form-group">
                <label for="monthlySalaryAmount">Monthly Salary (PKR) *</label>
                <input
                  id="monthlySalaryAmount"
                  type="number"
                  formControlName="monthlySalaryAmount"
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                  [class.error]="
                    employeeForm.get('monthlySalaryAmount')?.invalid &&
                    employeeForm.get('monthlySalaryAmount')?.touched
                  "
                />
                @if (employeeForm.get('monthlySalaryAmount')?.invalid &&
                employeeForm.get('monthlySalaryAmount')?.touched) {
                <div class="error-message">Valid salary amount is required</div>
                }
              </div>

              <div class="form-group">
                <label for="salaryDueDay">Salary Due Day *</label>
                <select
                  id="salaryDueDay"
                  formControlName="salaryDueDay"
                  [class.error]="
                    employeeForm.get('salaryDueDay')?.invalid &&
                    employeeForm.get('salaryDueDay')?.touched
                  "
                >
                  <option value="">Select day</option>
                  @for (day of daysOfMonth; track day) {
                  <option [value]="day">{{ day }}</option>
                  }
                </select>
                @if (employeeForm.get('salaryDueDay')?.invalid &&
                employeeForm.get('salaryDueDay')?.touched) {
                <div class="error-message">Due day is required</div>
                }
              </div>
            </div>
          </div>

          <!-- Additional Information -->
          <div class="form-section">
            <h3>Additional Information (Optional)</h3>

            <div class="form-group">
              <label for="departmentOrSite">Department/Site</label>
              <input
                id="departmentOrSite"
                type="text"
                formControlName="departmentOrSite"
                placeholder="e.g., Finance, Main Site"
              />
            </div>

            <div class="form-group">
              <label for="cnic">CNIC Number</label>
              <input id="cnic" type="text" formControlName="cnic" placeholder="XXXXX-XXXXXXX-X" />
            </div>

            <div class="form-group">
              <label for="address">Address</label>
              <textarea
                id="address"
                formControlName="address"
                placeholder="Full address"
                rows="2"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="emergencyContact">Emergency Contact</label>
              <input
                id="emergencyContact"
                type="text"
                formControlName="emergencyContact"
                placeholder="Name and phone number"
              />
            </div>

            <div class="form-group">
              <label for="bankDetails">Bank Details</label>
              <textarea
                id="bankDetails"
                formControlName="bankDetails"
                placeholder="Bank name, account number, IBAN"
                rows="2"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="notes">Notes</label>
              <textarea
                id="notes"
                formControlName="notes"
                placeholder="Additional notes..."
                rows="2"
              ></textarea>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" (click)="onClose()" class="btn btn-secondary">Cancel</button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="employeeForm.invalid || isSubmitting"
            >
              @if (isSubmitting) {
              <span>Adding Employee...</span>
              } @else {
              <span>Add Employee</span>
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
        max-width: 700px;
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

      .employee-form {
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
        margin-bottom: 1rem;
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

      textarea {
        resize: vertical;
        min-height: 60px;
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
export class AddEmployeeModalComponent {
  private fb = inject(FormBuilder);
  private businessService = inject(BusinessService);
  private employeeService = inject(EmployeeService);

  @Output() closed = new EventEmitter<void>();
  @Output() employeeAdded = new EventEmitter<void>();

  employeeForm = this.fb.group({
    name: ['', Validators.required],
    title: [''],
    phone: [''],
    email: [''],
    monthlySalaryAmount: [0, [Validators.required, Validators.min(0.01)]],
    salaryDueDay: ['', Validators.required],
    departmentOrSite: [''],
    cnic: [''],
    address: [''],
    emergencyContact: [''],
    bankDetails: [''],
    notes: [''],
  });

  daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  isSubmitting = false;

  onClose(): void {
    this.closed.emit();
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      this.isSubmitting = true;

      const formData = this.employeeForm.value;
      const currentBusiness = this.businessService.getCurrentBusiness();

      const employee: Employee = {
        businessId: currentBusiness?.id || '0',
        name: formData.name!,
        title: formData.title ?? undefined,
        phone: formData.phone ?? undefined,
        email: formData.email ?? undefined,
        monthlySalaryAmount: formData.monthlySalaryAmount!,
        salaryDueDay: Number(formData.salaryDueDay!),
        departmentOrSite: formData.departmentOrSite ?? undefined,
        cnic: formData.cnic ?? undefined,
        address: formData.address ?? undefined,
        emergencyContact: formData.emergencyContact ?? undefined,
        bankDetails: formData.bankDetails ?? undefined,
        notes: formData.notes ?? undefined,
        active: true,
      };

      this.employeeService.addEmployee(employee);

      this.isSubmitting = false;
      this.employeeAdded.emit();
      this.onClose();
    }
  }
}
