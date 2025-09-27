import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../../core/components/header/header.component';
import { ReportFilters, ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-report-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  template: `
    <app-header></app-header>
    <div class="report-dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>Business Reports</h1>
        <p>Analyze your business performance with detailed reports</p>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <h3>Report Filters</h3>
        <div class="filter-grid">
          <div class="filter-group">
            <label for="startDate">Start Date</label>
            <input
              id="startDate"
              type="date"
              [ngModel]="filters().startDate | date : 'yyyy-MM-dd'"
              (ngModelChange)="updateStartDate($event)"
            />
          </div>

          <div class="filter-group">
            <label for="endDate">End Date</label>
            <input
              id="endDate"
              type="date"
              [ngModel]="filters().endDate | date : 'yyyy-MM-dd'"
              (ngModelChange)="updateEndDate($event)"
            />
          </div>

          <div class="filter-group">
            <label for="category">Category</label>
            <select
              id="category"
              [ngModel]="filters().category"
              (ngModelChange)="updateFilter('category', $event)"
            >
              <option value="">All Categories</option>
              <option value="Fuel">Fuel</option>
              <option value="Utilities">Utilities</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Supplies">Supplies</option>
            </select>
          </div>

          <div class="filter-group">
            <button (click)="applyFilters()" class="btn btn-primary">Apply Filters</button>
            <button (click)="resetFilters()" class="btn btn-secondary">Reset</button>
          </div>
        </div>
      </div>

      <!-- Report Cards -->
      <div class="reports-grid">
        <!-- R1: Daily Spend -->
        <div class="report-card">
          <div class="report-header">
            <h3>📅 Daily Spend</h3>
            <button (click)="generateReport('dailySpend')" class="btn btn-sm">View Report</button>
          </div>
          <p>Daily expense tracking by business</p>
          <div class="report-stats">
            <span>Last 30 days</span>
          </div>
        </div>

        <!-- R2: Category Spend -->
        <div class="report-card">
          <div class="report-header">
            <h3>📊 Category/Vendor</h3>
            <button (click)="generateReport('categorySpend')" class="btn btn-sm">
              View Report
            </button>
          </div>
          <p>Spending by category and vendor</p>
          <div class="report-stats">
            <span>Category analysis</span>
          </div>
        </div>

        <!-- R3: Business Summary -->
        <div class="report-card">
          <div class="report-header">
            <h3>💼 Business Summary</h3>
            <button (click)="generateReport('businessSummary')" class="btn btn-sm">
              View Report
            </button>
          </div>
          <p>Opening/closing balances</p>
          <div class="report-stats">
            <span>Financial overview</span>
          </div>
        </div>

        <!-- R4: Salary Liability -->
        <div class="report-card">
          <div class="report-header">
            <h3>👥 Salary Liability</h3>
            <button (click)="generateReport('salaryLiability')" class="btn btn-sm">
              View Report
            </button>
          </div>
          <p>Upcoming salary dues</p>
          <div class="report-stats">
            <span>Employee payments</span>
          </div>
        </div>

        <!-- R5: Reconciliation -->
        <div class="report-card">
          <div class="report-header">
            <h3>💰 Cash Reconciliation</h3>
            <button (click)="generateReport('reconciliation')" class="btn btn-sm">
              View Report
            </button>
          </div>
          <p>Advances vs usage</p>
          <div class="report-stats">
            <span>Variance analysis</span>
          </div>
        </div>

        <!-- R6: Audit Log -->
        <div class="report-card">
          <div class="report-header">
            <h3>📝 Audit Log</h3>
            <button (click)="generateReport('auditLog')" class="btn btn-sm">View Report</button>
          </div>
          <p>Activity history</p>
          <div class="report-stats">
            <span>User actions</span>
          </div>
        </div>
      </div>

      <!-- Selected Report Display -->
      @if (selectedReport()) {
      <div class="report-display">
        <div class="report-display-header">
          <h2>{{ selectedReport()?.title }}</h2>
          <div class="report-actions">
            <button (click)="exportReport('csv')" class="btn btn-sm">📄 CSV</button>
            <button (click)="exportReport('pdf')" class="btn btn-sm">📊 PDF</button>
            <button (click)="selectedReport.set(null)" class="btn btn-sm btn-secondary">
              Close
            </button>
          </div>
        </div>

        <div class="report-content">
          <!-- Report content will be displayed here -->
          <pre>{{ selectedReport()?.data | json }}</pre>
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .report-dashboard {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .dashboard-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .dashboard-header h1 {
        color: #2d3748;
        margin: 0 0 0.5rem 0;
      }

      .dashboard-header p {
        color: #718096;
        margin: 0;
      }

      .filters-section {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
      }

      .filters-section h3 {
        margin: 0 0 1rem 0;
        color: #2d3748;
      }

      .filter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        align-items: end;
      }

      .filter-group {
        display: flex;
        flex-direction: column;
      }

      .filter-group label {
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: #4a5568;
      }

      .filter-group input,
      .filter-group select {
        padding: 0.5rem;
        border: 2px solid #e2e8f0;
        border-radius: 6px;
        font-size: 1rem;
      }

      .reports-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .report-card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      }

      .report-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 1rem;
      }

      .report-header h3 {
        margin: 0;
        color: #2d3748;
      }

      .report-card p {
        color: #718096;
        margin: 0 0 1rem 0;
      }

      .report-stats {
        font-size: 0.9rem;
        color: #a0aec0;
      }

      .report-display {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .report-display-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e2e8f0;
      }

      .report-display-header h2 {
        margin: 0;
        color: #2d3748;
      }

      .report-actions {
        display: flex;
        gap: 0.5rem;
      }

      .report-content {
        max-height: 400px;
        overflow-y: auto;
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

      .btn-secondary {
        background: #e2e8f0;
        color: #4a5568;

        &:hover {
          background: #cbd5e0;
        }
      }

      .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
      }
    `,
  ],
})
export class ReportDashboardComponent {
  private reportService = inject(ReportService);

  filters = signal<ReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
  });

  selectedReport = signal<any>(null);

  updateStartDate(date: string): void {
    this.filters.update((f) => ({ ...f, startDate: new Date(date) }));
  }

  updateEndDate(date: string): void {
    this.filters.update((f) => ({ ...f, endDate: new Date(date) }));
  }

  updateFilter(key: string, value: any): void {
    this.filters.update((f) => ({ ...f, [key]: value }));
  }

  applyFilters(): void {
    console.log('Applying filters:', this.filters());
  }

  resetFilters(): void {
    this.filters.set({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    });
  }

  generateReport(reportType: string): void {
    let report: any;

    switch (reportType) {
      case 'dailySpend':
        report = this.reportService.getDailySpendReport(this.filters());
        break;
      case 'categorySpend':
        report = this.reportService.getCategorySpendReport(this.filters());
        break;
      case 'businessSummary':
        report = this.reportService.getBusinessSummaryReport(this.filters());
        break;
      case 'salaryLiability':
        report = this.reportService.getSalaryLiabilityReport(this.filters());
        break;
      case 'reconciliation':
        report = this.reportService.getReconciliationReport(this.filters());
        break;
      default:
        return;
    }

    this.selectedReport.set(report);
  }

  exportReport(format: 'csv' | 'pdf'): void {
    if (!this.selectedReport()) return;

    const filename = `${this.selectedReport()?.title.replace(/\s+/g, '_')}_${
      new Date().toISOString().split('T')[0]
    }`;

    if (format === 'csv') {
      this.reportService.exportToCSV(this.selectedReport()?.data, filename);
    } else {
      this.reportService.exportToPDF(this.selectedReport()?.data, filename);
    }
  }
}
