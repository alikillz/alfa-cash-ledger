import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../../core/components/header/header.component';
import { BusinessService } from '../../../../core/services/business.service';
import { EmployeeService } from '../../../../core/services/employee.service';
import { AddEmployeeModalComponent } from '../add-employee-modal/add-employee-modal.component';
import { SalaryPaymentModalComponent } from '../salary-payment-modal/salary-payment-modal.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, AddEmployeeModalComponent, SalaryPaymentModalComponent, HeaderComponent],
  template: `
    <app-header></app-header>
    <div class="employee-management">
      <div class="header">
        <h2>Employee Management</h2>
        <button class="btn btn-primary" (click)="onAddEmployee()">+ Add Employee</button>
      </div>

      <div class="employee-grid">
        <!-- Employee Cards -->
        @for (employee of employees(); track employee.id) {
        <div class="employee-card">
          <div class="card-header">
            <h3>{{ employee.name }}</h3>
            <span class="status" [class.active]="employee.active">
              {{ employee.active ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="card-body">
            <div class="employee-info">
              <div class="info-item">
                <span class="label">Title:</span>
                <span class="value">{{ employee.title || 'Not specified' }}</span>
              </div>

              <div class="info-item">
                <span class="label">Monthly Salary:</span>
                <span class="value">PKR {{ employee.monthlySalaryAmount | number }}</span>
              </div>

              <div class="info-item">
                <span class="label">Salary Due Day:</span>
                <span class="value">{{ employee.salaryDueDay }}th of month</span>
              </div>

              @if (employee.phone) {
              <div class="info-item">
                <span class="label">Phone:</span>
                <span class="value">{{ employee.phone }}</span>
              </div>
              } @if (employee.departmentOrSite) {
              <div class="info-item">
                <span class="label">Department/Site:</span>
                <span class="value">{{ employee.departmentOrSite }}</span>
              </div>
              }
            </div>
          </div>

          <div class="card-actions">
            <button class="btn btn-sm btn-outline" (click)="onEditEmployee(employee.id!)">
              Edit
            </button>
            <button class="btn btn-sm btn-danger" (click)="onDeleteEmployee(employee.id!)">
              Delete
            </button>
            <button class="btn btn-sm btn-primary" (click)="onPaySalary(employee)">
              Pay Salary
            </button>
          </div>
        </div>
        } @empty {
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>No Employees Found</h3>
          <p>Get started by adding your first employee</p>
          <button class="btn btn-primary" (click)="onAddEmployee()">Add First Employee</button>
        </div>
        }
      </div>

      <!-- Upcoming Salaries Section -->
      @if (employees().length > 0) {
      <div class="upcoming-salaries">
        <h3>Upcoming Salary Dues</h3>
        <div class="salary-list">
          @for (item of upcomingSalaries(); track item.employee.id) {
          <div class="salary-item">
            <span class="employee-name">{{ item.employee.name }}</span>
            <span class="amount">PKR {{ item.amountDue | number }}</span>
            <span class="due-date">Due: {{ item.dueDate | date : 'mediumDate' }}</span>
            <button class="btn btn-sm btn-primary" (click)="onPaySalary(item.employee)">
              Pay Now
            </button>
          </div>
          }
        </div>
      </div>
      }
    </div>
    @if (showAddModal) {
    <app-add-employee-modal
      (closed)="showAddModal = false"
      (employeeAdded)="onEmployeeAdded()"
    ></app-add-employee-modal>
    }
    <!-- Add this at the bottom -->
    @if (showSalaryModal) {
    <app-salary-payment-modal
      [employee]="selectedEmployeeForPayment"
      (closed)="showSalaryModal = false"
      (paymentProcessed)="onPaymentProcessed()"
    ></app-salary-payment-modal>
    }
  `,
  styles: [
    `
      .employee-management {
        padding: 1.5rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .header h2 {
        margin: 0;
        color: #2d3748;
      }

      .employee-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .employee-card {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
        transition: box-shadow 0.2s;

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      }

      .card-header {
        padding: 1rem;
        background: #f7fafc;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .card-header h3 {
        margin: 0;
        color: #2d3748;
      }

      .status {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;

        &.active {
          background: #c6f6d5;
          color: #2f855a;
        }

        &:not(.active) {
          background: #fed7d7;
          color: #c53030;
        }
      }

      .card-body {
        padding: 1rem;
      }

      .employee-info {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .label {
        font-weight: 600;
        color: #4a5568;
      }

      .value {
        color: #2d3748;
      }

      .card-actions {
        padding: 1rem;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
      }

      .empty-state {
        text-align: center;
        padding: 3rem;
        grid-column: 1 / -1;
      }

      .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }

      .empty-state h3 {
        margin: 0 0 0.5rem 0;
        color: #2d3748;
      }

      .empty-state p {
        color: #718096;
        margin: 0 0 1.5rem 0;
      }

      .upcoming-salaries {
        border-top: 2px solid #e2e8f0;
        padding-top: 1.5rem;
      }

      .upcoming-salaries h3 {
        margin: 0 0 1rem 0;
        color: #2d3748;
      }

      .salary-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .salary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: #f7fafc;
        border-radius: 6px;
      }

      .employee-name {
        font-weight: 600;
        color: #2d3748;
      }

      .amount {
        color: #2f855a;
        font-weight: 600;
      }

      .due-date {
        color: #718096;
        font-size: 0.9rem;
      }

      .btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
      }

      .btn-primary {
        background: #4299e1;
        color: white;

        &:hover {
          background: #3182ce;
        }
      }

      .btn-outline {
        background: transparent;
        border: 1px solid #4299e1;
        color: #4299e1;

        &:hover {
          background: #4299e1;
          color: white;
        }
      }

      .btn-danger {
        background: #e53e3e;
        color: white;

        &:hover {
          background: #c53030;
        }
      }

      .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
      }
    `,
  ],
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private businessService = inject(BusinessService);
  private router = inject(Router);
  showAddModal = false;
  employees = signal<any[]>([]);
  upcomingSalaries = signal<any[]>([]);
  showSalaryModal = false;
  selectedEmployeeForPayment: any = null;

  ngOnInit() {
    this.loadEmployees();

    // Subscribe to business changes
    this.businessService.currentBusiness$.subscribe(() => {
      this.loadEmployees();
    });
  }

  loadEmployees(): void {
    const employees = this.employeeService.getEmployees();
    this.employees.set(employees);

    const upcoming = this.employeeService.getUpcomingSalaries();
    this.upcomingSalaries.set(upcoming);
  }

  onAddEmployee(): void {
    console.log('Open add employee modal');
    this.showAddModal = true;
    // Will implement modal next
  }

  onEmployeeAdded(): void {
    this.loadEmployees();
    this.showAddModal = false;
  }

  onEditEmployee(employeeId: string): void {
    console.log('Edit employee:', employeeId);
  }

  onDeleteEmployee(employeeId: string): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(employeeId);
      this.loadEmployees();
    }
  }

  onPaySalary(employee: any): void {
    this.selectedEmployeeForPayment = employee;
    this.showSalaryModal = true;
  }

  onPaymentProcessed(): void {
    this.loadEmployees(); // Refresh data
    this.showSalaryModal = false;
    this.selectedEmployeeForPayment = null;
  }
}
